import { NextResponse } from 'next/server';

// Anthropic API 모델명 상수 관리 (원안 유지)
const MODEL_HAIKU = 'claude-haiku-4-5';
const MODEL_SONNET = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `당신은 입력된 텍스트(뉴스, 칼럼, 기사, 스크립트 등)를 분석하여 인스타그램 카드뉴스에 적합한 데이터 구조로 요약 및 변환해주는 카드뉴스 자동화 전문가입니다.

[출력 형식 및 스키마]
반드시 다음 JSON 형식만 반환해야 하며, 마크다운 코드펜스(예: \`\`\`json ...)나 부가 설명은 일절 배제하십시오. 오직 유효한 JSON만 출력해야 합니다.

{
  "slides": [
    // 1. cover (표지): 1장 필수
    {
      "type": "cover",
      "f": {
        "badge": "짧은 태그 (예: AI 최신 트렌드)",
        "title": "시선을 끄는 제목 (*포인트색* 강조 가능)",
        "sub": "부제목 또는 한 줄 설명"
      },
      "bg": "배경 이미지 생성을 위한 영문 DALL-E/Gemini 프롬프트 (인물 제외, 분위기/오브젝트 위주, 텍스트 금지, 쉼표 구분)"
    },
    // 2. content (본문/단계): 5~9장 구성
    {
      "type": "content",
      "f": {
        "idx": "01",
        "total": "06",
        "tag": "해당 단계의 소주제",
        "num": "01",
        "head": "단계별 핵심 헤드라인 (*강조* 및 **굵게** 가능)",
        "desc": "구체적인 보충 설명 (**핵심내용** 굵게 강조)"
      }
    },
    // 3. quote (인용): 내용상 어울리면 0~1장 삽입 (선택)
    {
      "type": "quote",
      "f": {
        "quote": "인용하고 싶은 명언이나 핵심 강조 문구 (*강조* 및 **굵게** 가능)",
        "by": "인용 출처 또는 화자 이름"
      },
      "bg": "배경 이미지 생성을 위한 영문 프롬프트 (인물 제외, 텍스트 금지)"
    },
    // 4. table (비교표): 내용상 대조/비교가 필요하면 0~1장 삽입 (선택)
    {
      "type": "table",
      "f": {
        "title": "비교 분석 표 제목",
        "rows": "헤더1 | 헤더2 | 헤더3\\n항목1 | 값1 | 값2\\n항목2 | 값3 | 값4"
      }
    },
    // 5. closing (마무리 CTA): 1장 필수
    {
      "type": "closing",
      "f": {
        "head": "마지막 행동 유도 헤드라인 (*강조* 및 **굵게** 가능)",
        "desc": "마무리 요약 또는 메시지",
        "cta1": "AI 커뮤니티 참여",
        "cta2": "댓글 AIMAX",
        "hint": "독자에게 전하는 추가 힌트나 안내"
      },
      "bg": "배경 이미지 생성을 위한 영문 프롬프트 (인물 제외, 텍스트 금지)"
    }
  ]
}

[규칙]
1. 총 카드 수는 표지와 마무리를 포함하여 8~12장 사이여야 합니다.
2. 강조 문법: 포인트색 강조는 *강조할 단어*, 볼드 굵게 강조는 **굵게할 단어**의 형태로 감싸서 표현하세요.
3. 배경 프롬프트(bg): 'type'이 'cover', 'quote', 'closing'인 카드에 대해서만 'bg' 필드를 영어로 작성하세요. text, logo, watermark, human, face, girl, boy 등의 단어를 절대 포함하지 말고 고화질 추상 그래픽이나 배경 오브젝트 묘사 위주로 적으세요.
4. JSON 형식이 문법적으로 완벽해야 합니다. 큰따옴표 이스케이프 등을 주의하세요.`;

function extractJSON(text) {
  let cleaned = text.trim();
  // 마크다운 코드 펜스 제거
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
  }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('AI 응답에서 JSON 객체를 찾지 못했습니다.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callAnthropicAPI(key, model, text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: model === 'sonnet' ? MODEL_SONNET : MODEL_HAIKU,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error?.message || `Anthropic API 에러 (상태코드: ${response.status})`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI 변환 요청 시간이 초과되었습니다 (60초 초과).');
    }
    throw err;
  }
}

export async function POST(req) {
  const anthropicKey = req.headers.get('x-user-anthropic-key');
  if (!anthropicKey || !anthropicKey.trim()) {
    return NextResponse.json(
      { error: '설정에서 Anthropic API 키를 확인해주세요. (인증 키 누락)' },
      { status: 400 }
    );
  }

  try {
    const { text, model } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: '변환할 텍스트 본문이 비어있습니다.' }, { status: 400 });
    }

    let aiText = '';
    let parsedDeck = null;
    let attempts = 0;

    while (attempts < 2) {
      attempts++;
      try {
        aiText = await callAnthropicAPI(anthropicKey, model, text);
        parsedDeck = extractJSON(aiText);
        
        // 간단한 유효성 검증
        if (!parsedDeck.slides || !parsedDeck.slides.length) {
          throw new Error('파싱된 슬라이드 배열이 비어있습니다.');
        }
        break; // 성공 시 루프 탈출
      } catch (err) {
        if (attempts >= 2) {
          console.error('[AI Convert API Error after 2 attempts]:', err);
          return NextResponse.json(
            { 
              error: `AI 응답 파싱 또는 변환에 실패했습니다. 한국어 오류 안내: ${err.message}`, 
              raw: aiText.slice(0, 500) 
            }, 
            { status: 500 }
          );
        }
        // 1회 실패 후 재시도 시 약간의 딜레이
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return NextResponse.json(parsedDeck);
  } catch (err) {
    console.error('[AI Convert Route Handler Exception]:', err.message);
    return NextResponse.json(
      { error: `서버 통신 실패: ${err.message}` },
      { status: 500 }
    );
  }
}
