import os
import re
import urllib.parse
import xml.etree.ElementTree as ET
import requests

# 1. Environment variables (configured in GitHub Secrets)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")

def fetch_latest_news_feed():
    """Fetch AI news articles from Google News RSS feed."""
    rss_url = "https://news.google.com/rss/search?q=Artificial+Intelligence&hl=en-US&gl=US&ceid=US:en"
    try:
        response = requests.get(rss_url, timeout=15)
        if response.status_code != 200:
            return []
        
        # Parse XML RSS Feed
        root = ET.fromstring(response.content)
        items = []
        for item in root.findall(".//item")[:10]: # Check top 10 articles
            title = item.find("title").text
            link = item.find("link").text
            pub_date = item.find("pubDate").text
            
            # Resolve Google News redirection if possible, or just use the link
            items.append({
                "title": title,
                "link": link,
                "pub_date": pub_date
            })
        return items
    except Exception as e:
        print(f"Error fetching RSS feed: {e}")
        return []

def is_already_registered(source_url):
    """Check if the article URL already exists in Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/ai_news"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    params = {
        "source_url": f"eq.{source_url}"
    }
    try:
        res = requests.get(url, headers=headers, params=params, timeout=10)
        if res.status_code == 200:
            data = res.json()
            return len(data) > 0
        return False
    except Exception as e:
        print(f"Error checking DB duplicates: {e}")
        return False

def summarize_with_gemini(article_title, article_url):
    """Call Google Gemini API to translate and summarize in Korean."""
    api_url = f"https://generativelanguage.googleapis.com/v1/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""You are a professional Korean AI Tech journalist and expert researcher.
Translate and analyze this English AI news article, then summarize it in Korean.

Article Title: {article_title}
Article Link: {article_url}

Create a highly catching Korean headline/title.
Then, summarize the news into 3 precise key points using the Korean language.
The summary MUST strictly follow this markdown format using '📌[1]', '📌[2]', '📌[3]' and bold text for key terms:
📌[1] **key term**: detailed explanation in Korean.
📌[2] **key term**: detailed explanation in Korean.
📌[3] **key term**: detailed explanation in Korean.

Your response MUST be a valid JSON object matching this schema (do NOT wrap it in markdown codeblocks like ```json):
{{
  "title": "catchy Korean headline",
  "summary": "📌[1] **핵심키워드**: 한국어 상세 설명...\\n📌[2] **핵심키워드**: 한국어 상세 설명...\\n📌[3] **핵심키워드**: 한국어 상세 설명..."
}}"""

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    import time
    max_retries = 5
    for attempt in range(max_retries):
        try:
            res = requests.post(api_url, json=payload, timeout=30)
            if res.status_code == 200:
                result = res.json()
                text_response = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Parse JSON response
                import json
                parsed = json.loads(text_response)
                return parsed.get("title"), parsed.get("summary")
            
            if res.status_code in (500, 503, 429):
                wait = 2 ** attempt * 5
                print(f"[{res.status_code}] {wait}초 후 재시도 ({attempt+1}/{max_retries})...")
                time.sleep(wait)
                continue
            else:
                print(f"Gemini API returned error: {res.status_code} - {res.text}")
                return None, None
        except Exception as e:
            wait = 2 ** attempt * 5
            print(f"요청/파싱 실패: {e} — {wait}초 후 재시도 ({attempt+1}/{max_retries})...")
            time.sleep(wait)
            
    print("최대 재시도 횟수 초과, 이 기사는 건너뜁니다.")
    return None, None

def register_to_supabase(title, summary_points, article_url):
    """Post summarized news to Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/ai_news"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    # Check for youtube link or fallback to website screenshot API
    yt_match = re.search(r'(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})', article_url)
    if yt_match:
        capture_url = f"https://img.youtube.com/vi/{yt_match.group(1)}/mqdefault.jpg"
    else:
        capture_url = f"https://api.microlink.io?url={urllib.parse.quote(article_url)}&embed=image.url"
        
    payload = {
        "title": title,
        "description": summary_points[:150] + "...", # Card summary
        "content": summary_points,                  # Full markdown
        "image_url": capture_url,
        "source_url": article_url
    }
    
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=15)
        if res.status_code == 201:
            print(f"Successfully registered news: {title}")
            return True
        else:
            print(f"Failed to save to Supabase: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return False

def main():
    if not SUPABASE_URL or not SUPABASE_KEY or not GEMINI_API_KEY:
        print("Missing required environment variables: SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY")
        return

    print("Starting daily AI news automated crawler...")
    news_items = fetch_latest_news_feed()
    if not news_items:
        print("No news articles found.")
        return

    registered_count = 0
    for item in news_items:
        # We only register up to 2 new articles per run to keep feed clean and avoid API limits
        if registered_count >= 2:
            break
            
        title = item["title"]
        url = item["link"]
        
        # Clean Google News titles (usually ends with ' - Source Name')
        clean_title = re.sub(r'\s+-\s+[^(-]+$', '', title).strip()
        
        # 1. Check duplicate
        if is_already_registered(url):
            print(f"Skip (already registered): {clean_title}")
            continue
            
        print(f"Processing new article: {clean_title}")
        
        # 2. Summarize using Gemini
        ko_title, ko_summary = summarize_with_gemini(clean_title, url)
        
        # Add 3 seconds delay between requests to avoid Google API Rate Limits (503/429)
        import time
        time.sleep(3)
        
        if not ko_title or not ko_summary:
            print(f"Failed to generate summary for: {clean_title}")
            continue
            
        # 3. Save to database
        success = register_to_supabase(ko_title, ko_summary, url)
        if success:
            registered_count += 1

    print(f"Automated crawler finished. Registered {registered_count} new articles.")

if __name__ == "__main__":
    main()
