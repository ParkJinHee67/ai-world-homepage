import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Mock database initial state
const defaultPortfolioItems = [
  {
    id: 'p1',
    title: 'AI Shorts Generator',
    description: '유튜브 쇼츠, 틱톡 비디오용 스크립트와 이미지를 자동 생성하고 AI 보이스를 입혀 영상을 편집해주는 툴입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    appUrl: 'https://ai-shorts-gen.example.com',
    notionUrl: 'https://notion.so/ai-shorts-manual',
    youtubeUrl: 'https://youtube.com/watch?v=mock1, https://youtube.com/watch?v=mock2',
    category: 'App',
    sort_order: 0,
    created_at: '2026-06-22'
  },
  {
    id: 'p2',
    title: 'Hermes News Collector',
    description: '글로벌 AI 뉴스와 트렌드를 실시간 수집 및 요약하여 슬랙, 텔레그램, 웹사이트에 자동으로 발행하는 에이전트 서비스.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
    appUrl: 'https://hermes-agent.example.com',
    notionUrl: 'https://notion.so/hermes-manual',
    youtubeUrl: 'https://youtube.com/watch?v=mock3',
    category: 'App',
    sort_order: 1,
    created_at: '2026-06-21'
  },
  {
    id: 'p3',
    title: 'Prompt Engineering Guide 2026',
    description: 'LLM 성능을 극대화하기 위한 체계적인 프롬프트 작성 프레임워크와 한국어 비즈니스 환경에 최적화된 프롬프트 모음집.',
    imageUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop',
    appUrl: '',
    notionUrl: 'https://notion.so/prompt-guide-2026',
    youtubeUrl: '',
    category: 'Insight',
    sort_order: 2,
    created_at: '2026-06-20'
  },
  {
    id: 'p4',
    title: 'v0.dev by Vercel',
    description: '프롬프트 입력만으로 즉시 복사하여 사용할 수 있는 완벽한 React/Tailwind UI 코드를 생성해주는 웹 퍼블리싱 추천 툴.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop',
    appUrl: 'https://v0.dev',
    notionUrl: '',
    youtubeUrl: 'https://youtube.com/watch?v=mock4',
    category: 'AI Recommend',
    sort_order: 3,
    created_at: '2026-06-19'
  },
  {
    id: 'p5',
    title: '카드뉴스 자동화 도구',
    description: '글(기사·대본·메모)을 붙여넣으면 AI가 인스타그램 카드뉴스(1080×1350 PNG 세트)를 자동으로 만들어주는 브라우저 에디터입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    appUrl: '/cardnews',
    notionUrl: '',
    youtubeUrl: '',
    category: 'AI Recommend',
    sort_order: 4,
    created_at: '2026-07-18'
  }
];

const defaultAINews = [
  {
    id: 'n1',
    title: 'OpenAI, 초지능 모델 개발을 위한 차세대 아키텍처 공식 발표',
    description: 'OpenAI가 기존 트랜스포머의 물리적 한계를 극복하는 새로운 병렬 추론 아키텍처를 발표했습니다. 컨텍스트 크기 증가 시 속도 저하 문제를 완전히 제어할 수 있을지 기대됩니다.',
    content: `## 차세대 AI 아키텍처의 핵심 요약

📌[1] **선형 시간 복잡도의 달성**: 기존 트랜스포머 모델의 셀프 어텐션 연산(Quadratic 복잡도)을 선형적으로 처리할 수 있는 신규 메모리 캐싱 기법이 도입되었습니다.
📌[2] **추론 속도 5배 향상**: 대용량 컨텍스트 윈도우(최대 100만 토큰)에서도 실시간 대화형 추론 속도를 유지하며, 비용은 기존 대비 40% 이상 절감되었습니다.
📌[3] **다중 에이전트 동시 협업 아키텍처**: 분산된 추론 노드가 중앙 코어 없이 피어투피어(P2P)로 합의하는 구조를 갖추어, 복잡한 태스크를 분할 정복 방식으로 해결합니다.

---

### 업계 분석 및 영향력
이번 발표는 AI 모델 구동 비용의 파괴적 하락을 의미합니다. 그동안 비용 문제로 도입이 제한적이었던 **실시간 무제한 컨텍스트 에이전트** 상용화의 신호탄이 될 것으로 업계 전문가들은 전망하고 있습니다. 

상세 분석 리포트 및 실제 개발 벤치마크는 다음 링크들을 참고하세요.
- [OpenAI 신규 아키텍처 공식 웹사이트](https://openai.com)
- [HuggingFace 벤치마크 데이터셋](https://huggingface.co)`,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://openai.com/blog',
    created_at: '2026-06-22'
  },
  {
    id: 'n2',
    title: 'Google, 스마트 에이전트 생태계 강화를 위한 Project Astra API 정식 공개',
    description: '구글이 스마트 글래스 및 카메라 카메라 피드를 연동할 수 있는 초지연 오디오/비디오 멀티모달 API인 Project Astra 개발 키트를 전 세계 개발자들에게 공개했습니다.',
    content: `## Project Astra API 특징 및 활용 가치

📌[1] **초저지연 비디오 스트리밍 처리**: 1초당 30프레임의 영상 입력을 100ms 내외의 대기 시간으로 파악하고 분석하여 오디오로 피드백을 전달합니다.
📌[2] **지속적인 장기 기억력(Long-term Memory)**: 사용자의 과거 시각 피드백 중 주요 정보를 영구 또는 준영구로 기록하여 연속적인 에이전트 상호작용을 가능하게 만듭니다.
📌[3] **다양한 로컬 장치 임베딩 지원**: 엣지 디바이스와 서버 간 하이브리드 연산을 통해 모바일 기기에서도 오프라인 상태로 핵심 에이전트 작업이 지원됩니다.

---

### 개발자 대응 방안
현재 구글 AI 스튜디오 및 버텍스 AI(Vertex AI) 콘솔을 통해 즉시 테스트 코드를 발급받을 수 있습니다. 스마트 에이전트를 모바일 또는 하드웨어 디바이스에 심고자 하는 팀에게 최고의 솔루션이 될 것입니다.

- [Google AI Studio 바로가기](https://ai.google.dev)
- [Project Astra API 상세 도큐멘테이션](https://ai.google.dev/docs)`,
    imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://ai.google.dev',
    created_at: '2026-06-21'
  }
];

const getMockData = (key, defaultVal) => {
  if (typeof window === 'undefined') {
    return defaultVal;
  }
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  let parsed = JSON.parse(data);
  let changed = false;
  if (Array.isArray(parsed)) {
    parsed = parsed.map(item => {
      // Migrate old Kakao open chatroom links
      if (item.appUrl && (item.appUrl.includes('su8RIQ4h') || item.appUrl.includes('open.kakao.com'))) {
        item.appUrl = 'https://open.kakao.com/o/si1c9OAi';
        changed = true;
      }
      // Migrate old '김부장 앱' title
      if (item.title && (item.title.includes('김부장') || item.title.includes('1 : 1 문의'))) {
        item.title = '톱니바꿈 1:1 문의(프로그램 관련)';
        changed = true;
      }
      return item;
    });
    if (changed) {
      localStorage.setItem(key, JSON.stringify(parsed));
    }
  }
  return parsed;
};

const saveMockData = (key, data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Database interface
export const db = {
  isMock: !supabaseUrl || !supabaseAnonKey,
  
  async getPortfolio() {
    if (this.isMock) {
      return { data: getMockData('mock_portfolio', defaultPortfolioItems), error: null };
    }
    try {
      const { data, error } = await supabase.from('portfolio_items').select('*').order('sort_order', { ascending: true });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async getNews() {
    if (this.isMock) {
      return { data: getMockData('mock_news', defaultAINews), error: null };
    }
    try {
      const { data, error } = await supabase.from('ai_news').select('*').order('created_at', { ascending: false });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async verifyAdmin(email) {
    if (this.isMock) {
      return true;
    }
    try {
      const { data, error } = await supabase.from('admin_accounts')
        .select('email')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .maybeSingle();
      return { data: !!data, error };
    } catch (e) {
      return { data: false, error: e };
    }
  },

  // Portfolio CRUD
  async savePortfolioItem(item) {
    if (this.isMock) {
      const items = getMockData('mock_portfolio', defaultPortfolioItems);
      if (item.id) {
        // Update
        const idx = items.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          items[idx] = { ...items[idx], ...item };
        }
      } else {
        // Insert
        const newItem = {
          ...item,
          id: 'p_' + Math.random().toString(36).substring(2, 9),
          sort_order: items.length,
          created_at: new Date().toISOString().split('T')[0]
        };
        items.push(newItem);
      }
      saveMockData('mock_portfolio', items);
      return { data: items, error: null };
    }
    
    // Convert camelCase UI properties to snake_case DB columns
    const dbItem = {
      title: item.title,
      description: item.description,
      image_url: item.imageUrl,
      app_url: item.appUrl,
      notion_url: item.notionUrl,
      youtube_url: item.youtubeUrl,
      category: item.category
    };
    if (item.sort_order !== undefined) dbItem.sort_order = item.sort_order;

    if (item.id) {
      const { data, error } = await supabase.from('portfolio_items').update(dbItem).eq('id', item.id).select();
      return { data, error };
    } else {
      // Get max sort_order
      const { data: currentItems } = await supabase.from('portfolio_items').select('sort_order');
      const maxSortOrder = currentItems ? Math.max(...currentItems.map(x => x.sort_order || 0), -1) : -1;
      dbItem.sort_order = maxSortOrder + 1;
      const { data, error } = await supabase.from('portfolio_items').insert([dbItem]).select();
      return { data, error };
    }
  },

  async deletePortfolioItem(id) {
    if (this.isMock) {
      const items = getMockData('mock_portfolio', defaultPortfolioItems);
      const filtered = items.filter(x => x.id !== id);
      saveMockData('mock_portfolio', filtered);
      return { error: null };
    }
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    return { error };
  },

  async updatePortfolioOrder(itemsOrder) {
    if (this.isMock) {
      const items = getMockData('mock_portfolio', defaultPortfolioItems);
      const updated = itemsOrder.map((item, index) => {
        const original = items.find(x => x.id === item.id);
        return { ...original, sort_order: index };
      });
      saveMockData('mock_portfolio', updated);
      return { error: null };
    }
    
    const promises = itemsOrder.map((item, index) => 
      supabase.from('portfolio_items').update({ sort_order: index }).eq('id', item.id)
    );
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    return { error: errors.length > 0 ? errors[0].error : null };
  },

  // AI News CRUD
  async saveNewsItem(item) {
    if (this.isMock) {
      const news = getMockData('mock_news', defaultAINews);
      if (item.id) {
        const idx = news.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          news[idx] = { ...news[idx], ...item };
        }
      } else {
        const newItem = {
          ...item,
          id: 'n_' + Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString().split('T')[0]
        };
        news.unshift(newItem);
      }
      saveMockData('mock_news', news);
      return { data: news, error: null };
    }

    const dbNews = {
      title: item.title,
      description: item.description,
      content: item.content,
      image_url: item.imageUrl,
      source_url: item.sourceUrl
    };

    if (item.id) {
      const { data, error } = await supabase.from('ai_news').update(dbNews).eq('id', item.id).select();
      return { data, error };
    } else {
      const { data, error } = await supabase.from('ai_news').insert([dbNews]).select();
      return { data, error };
    }
  },

  async deleteNewsItem(id) {
    if (this.isMock) {
      const news = getMockData('mock_news', defaultAINews);
      const filtered = news.filter(x => x.id !== id);
      saveMockData('mock_news', filtered);
      return { error: null };
    }
    const { error } = await supabase.from('ai_news').delete().eq('id', id);
    return { error };
  },

  async migrateLocalDataToServer() {
    if (this.isMock) {
      return { error: 'Supabase가 아직 연결되지 않았습니다. .env 환경변수를 먼저 설정해주세요.' };
    }
    
    try {
      if (typeof window === 'undefined') return { error: '클라이언트 사이드에서만 실행 가능합니다.' };
      const localPortfolioStr = localStorage.getItem('mock_portfolio');
      const localNewsStr = localStorage.getItem('mock_news');
      
      let pMigrated = 0;
      let nMigrated = 0;

      if (localPortfolioStr) {
        const items = JSON.parse(localPortfolioStr);
        for (const item of items) {
          const dbItem = {
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl || item.image_url,
            appUrl: item.appUrl || item.app_url,
            notionUrl: item.notionUrl || item.notion_url,
            youtubeUrl: item.youtubeUrl || item.youtube_url,
            category: item.category
          };
          
          const { error } = await this.savePortfolioItem(dbItem);
          if (error) throw error;
          pMigrated++;
        }
      }

      if (localNewsStr) {
        const newsList = JSON.parse(localNewsStr);
        for (const news of newsList) {
          const dbNews = {
            title: news.title,
            description: news.description,
            content: news.content,
            imageUrl: news.imageUrl || news.image_url,
            sourceUrl: news.sourceUrl || news.source_url
          };
          
          const { error } = await this.saveNewsItem(dbNews);
          if (error) throw error;
          nMigrated++;
        }
      }

      localStorage.removeItem('mock_portfolio');
      localStorage.removeItem('mock_news');

      return { data: { pMigrated, nMigrated }, error: null };
    } catch (e) {
      console.error('Migration error:', e);
      return { data: null, error: e.message || e };
    }
  },

  // Auth wrappers
  async getSession() {
    if (this.isMock) {
      const adminEmail = typeof window !== 'undefined' ? localStorage.getItem('mock_admin_email') : null;
      if (adminEmail) {
        return { data: { session: { user: { email: adminEmail } } } };
      }
      return { data: { session: null } };
    }
    return supabase.auth.getSession();
  },

  async signInWithEmail(email, password) {
    if (this.isMock) {
      const correctPasscode = process.env.NEXT_PUBLIC_VITE_ADMIN_PASSCODE || process.env.VITE_ADMIN_PASSCODE || 'jhpa670211';
      if (password === correctPasscode) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mock_admin_email', email.toLowerCase());
        }
        return { data: { user: { email } }, error: null };
      } else {
        return { data: null, error: { message: '비밀번호가 일치하지 않습니다.' } };
      }
    }
    return supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
  },

  async checkSessionActive() {
    if (this.isMock) {
      return typeof window !== 'undefined' ? !!localStorage.getItem('mock_admin_email') : false;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (e) {
      return false;
    }
  },

  async signInWithGoogle() {
    if (this.isMock) {
      if (typeof window !== 'undefined') {
        const email = prompt("관리자 로그인용 이메일을 입력하세요:", "admin@example.com") || "admin@example.com";
        localStorage.setItem('mock_admin_email', email);
        window.location.reload();
      }
      return { error: null };
    }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/admin' : ''
      }
    });
  },

  async signOut() {
    if (this.isMock) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_admin_email');
        window.location.reload();
      }
      return { error: null };
    }
    return supabase.auth.signOut();
  },

  onAuthStateChange(callback) {
    if (this.isMock) {
      const email = typeof window !== 'undefined' ? localStorage.getItem('mock_admin_email') : null;
      const mockSession = email ? { user: { email } } : null;
      callback('INITIAL_SESSION', mockSession);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  async incrementStat(key) {
    if (this.isMock) {
      const stats = getMockData('mock_stats', { visitors: 0, downloads: 0 });
      stats[key] = (stats[key] || 0) + 1;
      saveMockData('mock_stats', stats);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      return { data: stats, error: null };
    }
    try {
      const { data, error } = await supabase.rpc('increment_stat', { stat_key: key });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async getStats() {
    if (this.isMock) {
      return { data: getMockData('mock_stats', { visitors: 0, downloads: 0 }), error: null };
    }
    try {
      const { data, error } = await supabase.from('site_stats').select('*');
      if (data) {
        const stats = {};
        data.forEach(row => {
          stats[row.key] = Number(row.value);
        });
        return { data: stats, error: null };
      }
      return { data: null, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async saveLead(leadData) {
    if (this.isMock) {
      const leads = getMockData('mock_leads', []);
      const newLead = {
        id: 'lead_' + Math.random().toString(36).substring(2, 9),
        name: leadData.name,
        email: leadData.email,
        requested_image: leadData.requestedImage,
        created_at: new Date().toISOString()
      };
      leads.push(newLead);
      saveMockData('mock_leads', leads);
      return { data: newLead, error: null };
    }
    
    const dbLead = {
      name: leadData.name,
      email: leadData.email,
      requested_image: leadData.requestedImage
    };
    try {
      const { data, error } = await supabase.from('marketing_leads').insert([dbLead]).select();
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async getLeads() {
    if (this.isMock) {
      return { data: getMockData('mock_leads', []), error: null };
    }
    try {
      const { data, error } = await supabase.from('marketing_leads').select('*').order('created_at', { ascending: false });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async getResources() {
    if (this.isMock) {
      const defaultResources = [
        {
          id: 'res_default1',
          title: '카카오 오픈채팅 대문 (가로형 배너)',
          description: '오픈채팅방 커버나 유튜브 채널 아트에 적합한 와이드 가로 배너 이미지입니다.',
          file_name: 'kakao-banner-horizontal.jpg',
          file_content: '/images/kakao-banner-horizontal.jpg',
          resolution: '1200 x 630',
          file_size: '21 KB',
          sort_order: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'res_default2',
          title: '카카오 오픈채팅 대문 (세로형 배너)',
          description: '모바일 화면, 카카오톡 프로필 배경 등 모바일 뷰에 최적화된 고화질 세로형 이미지입니다.',
          file_name: 'kakao-banner-vertical.png',
          file_content: '/images/kakao-banner-vertical.png',
          resolution: '1080 x 1920',
          file_size: '1.0 MB',
          sort_order: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 'res_default3',
          title: '영상제작 주인공 소스 캡처',
          description: '주인공 합성 템플릿에 바로 로드하여 사용할 수 있는 특화 영상 소스 이미지입니다.',
          file_name: 'capture.jpg',
          file_content: '/images/capture.jpg',
          resolution: '640 x 360',
          file_size: '34 KB',
          sort_order: 2,
          created_at: new Date().toISOString()
        }
      ];
      const resources = getMockData('mock_resources', defaultResources);
      return { data: resources.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), error: null };
    }
    try {
      const { data, error } = await supabase
        .from('downloadable_resources')
        .select('id, title, description, file_name, resolution, file_size, download_count, sort_order, created_at')
        .order('sort_order', { ascending: true });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async getResourceContent(id) {
    if (this.isMock) {
      const resources = getMockData('mock_resources', []);
      const item = resources.find(r => r.id === id);
      return { data: item ? item.file_content : null, error: null };
    }
    try {
      const { data, error } = await supabase
        .from('downloadable_resources')
        .select('file_content')
        .eq('id', id)
        .single();
      return { data: data ? data.file_content : null, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async uploadResourceFile(file) {
    if (this.isMock) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ data: e.target.result, error: null });
        reader.onerror = (err) => resolve({ data: null, error: err });
        reader.readAsDataURL(file);
      });
    }
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from('resources')
        .upload(path, file, { cacheControl: '3600', upsert: true });
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(path);
        
      return { data: publicUrl, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async saveResource(resourceData) {
    if (this.isMock) {
      const resources = getMockData('mock_resources', []);
      if (resourceData.id) {
        // Update
        const idx = resources.findIndex(x => x.id === resourceData.id);
        if (idx !== -1) {
          resources[idx] = {
            ...resources[idx],
            title: resourceData.title,
            description: resourceData.description,
            ...(resourceData.fileName ? { file_name: resourceData.fileName } : {}),
            ...(resourceData.fileContent ? { file_content: resourceData.fileContent } : {}),
            ...(resourceData.resolution ? { resolution: resourceData.resolution } : {}),
            ...(resourceData.fileSize ? { file_size: resourceData.fileSize } : {})
          };
        }
        saveMockData('mock_resources', resources);
        return { data: resources[idx], error: null };
      } else {
        // Insert
        const newResource = {
          id: 'res_' + Math.random().toString(36).substring(2, 9),
          title: resourceData.title,
          description: resourceData.description,
          file_name: resourceData.fileName,
          file_content: resourceData.fileContent,
          resolution: resourceData.resolution,
          file_size: resourceData.fileSize,
          sort_order: resources.length,
          created_at: new Date().toISOString()
        };
        resources.push(newResource);
        saveMockData('mock_resources', resources);
        return { data: newResource, error: null };
      }
    }

    const dbResource = {
      title: resourceData.title,
      description: resourceData.description
    };
    if (resourceData.fileName) dbResource.file_name = resourceData.fileName;
    if (resourceData.fileContent) dbResource.file_content = resourceData.fileContent;
    if (resourceData.resolution) dbResource.resolution = resourceData.resolution;
    if (resourceData.fileSize) dbResource.file_size = resourceData.fileSize;

    if (resourceData.id) {
      try {
        const { data, error } = await supabase.from('downloadable_resources').update(dbResource).eq('id', resourceData.id).select();
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    } else {
      try {
        const { data: currentResources } = await supabase.from('downloadable_resources').select('sort_order');
        const maxSortOrder = currentResources && currentResources.length > 0
          ? Math.max(...currentResources.map(x => x.sort_order || 0), -1)
          : -1;
        dbResource.sort_order = maxSortOrder + 1;
        const { data, error } = await supabase.from('downloadable_resources').insert([dbResource]).select();
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    }
  },

  async deleteResource(id) {
    if (this.isMock) {
      const resources = getMockData('mock_resources', []);
      const filtered = resources.filter(r => r.id !== id);
      saveMockData('mock_resources', filtered);
      return { error: null };
    }
    try {
      const { error } = await supabase.from('downloadable_resources').delete().eq('id', id);
      return { error };
    } catch (e) {
      return { error: e };
    }
  },

  async updateResourcesOrder(resourcesOrder) {
    if (this.isMock) {
      const resources = getMockData('mock_resources', []);
      const updated = resourcesOrder.map((res, index) => {
        const original = resources.find(x => x.id === res.id);
        return { ...original, sort_order: index };
      });
      saveMockData('mock_resources', updated);
      return { error: null };
    }
    try {
      const promises = resourcesOrder.map((res, index) => 
        supabase.from('downloadable_resources').update({ sort_order: index }).eq('id', res.id)
      );
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      return { error: errors.length > 0 ? errors[0].error : null };
    } catch (e) {
      return { error: e };
    }
  },

  async incrementResourceDownload(id) {
    if (this.isMock) {
      const resources = getMockData('mock_resources', []);
      const idx = resources.findIndex(r => r.id === id);
      if (idx !== -1) {
        resources[idx].download_count = (resources[idx].download_count || 0) + 1;
        saveMockData('mock_resources', resources);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      return { error: null };
    }
    try {
      const { data } = await supabase.from('downloadable_resources').select('download_count').eq('id', id).maybeSingle();
      const currentCount = data ? (Number(data.download_count) || 0) : 0;
      const { error } = await supabase.from('downloadable_resources').update({ download_count: currentCount + 1 }).eq('id', id);
      return { error };
    } catch (e) {
      return { error: e };
    }
  },

  // CardNews Decks
  async getCardNewsDecks(limit = 20) {
    if (this.isMock) {
      const decks = getMockData('mock_cardnews_decks', []);
      return { data: decks.filter(d => d.status === 'published').sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit), error: null };
    }
    try {
      const { data, error } = await supabase.from('cardnews_decks')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async getCardNewsDeckById(id) {
    if (this.isMock) {
      const decks = getMockData('mock_cardnews_decks', []);
      const deck = decks.find(d => d.id === id);
      return { data: deck || null, error: deck ? null : new Error('Not found') };
    }
    try {
      const { data, error } = await supabase.from('cardnews_decks')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async incrementDeckViewCount(id) {
    if (this.isMock) {
      const decks = getMockData('mock_cardnews_decks', []);
      const idx = decks.findIndex(d => d.id === id);
      if (idx !== -1) {
        decks[idx].view_count = (decks[idx].view_count || 0) + 1;
        saveMockData('mock_cardnews_decks', decks);
      }
      return { error: null };
    }
    try {
      const { data, error } = await supabase.rpc('increment_view_count', { deck_id: id });
      if (error) {
        const { data: deck } = await supabase.from('cardnews_decks').select('view_count').eq('id', id).single();
        if (deck) {
          await supabase.from('cardnews_decks').update({ view_count: (deck.view_count || 0) + 1 }).eq('id', id);
        }
      }
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  },

  async deleteCardNewsDeck(id) {
    if (this.isMock) {
      const decks = getMockData('mock_cardnews_decks', []);
      const filtered = decks.filter(d => d.id !== id);
      saveMockData('mock_cardnews_decks', filtered);
      return { error: null };
    }
    try {
      const { error } = await supabase.from('cardnews_decks').delete().eq('id', id);
      return { error };
    } catch (e) {
      return { error: e };
    }
  },

  // 광고 슬롯 API 연동 (서버 Route Handler 경유로 보안 극대화)
  async getAdSlots() {
    try {
      const res = await fetch('/api/admin/ad-slots', { cache: 'no-store' });
      if (!res.ok) throw new Error('API 로드 실패');
      const { data } = await res.json();
      if (data && data.length > 0) {
        return { data, error: null };
      }
      throw new Error('데이터 없음');
    } catch (e) {
      // 로드 실패 시 config/adSlots.js 로컬 폴백 활용
      try {
        const { adSlots } = require('../config/adSlots');
        return { data: adSlots, error: e };
      } catch (err) {
        return { data: null, error: err };
      }
    }
  },

  async getAdSlotsAdmin(password) {
    try {
      const res = await fetch(`/api/admin/ad-slots?password=${encodeURIComponent(password)}`, { cache: 'no-store' });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || '광고 전체 목록 로드 실패');
      }
      const { data } = await res.json();
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async saveAdSlotAdmin(adData, password) {
    try {
      const res = await fetch('/api/admin/ad-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad: adData, password })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '광고 저장 실패');
      return { data: result.data, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  }
};

// Map database column names to camelCase for client usage
export const mapPortfolioItem = (dbItem) => ({
  id: dbItem.id,
  title: dbItem.title,
  description: dbItem.description,
  imageUrl: dbItem.image_url || dbItem.imageUrl,
  appUrl: dbItem.app_url || dbItem.appUrl,
  notionUrl: dbItem.notion_url || dbItem.notionUrl,
  youtubeUrl: dbItem.youtube_url || dbItem.youtubeUrl,
  category: dbItem.category,
  sortOrder: dbItem.sort_order ?? dbItem.sortOrder,
  createdAt: dbItem.created_at || dbItem.createdAt
});

export const mapNewsItem = (dbNews) => ({
  id: dbNews.id,
  title: dbNews.title,
  description: dbNews.description,
  content: dbNews.content,
  imageUrl: dbNews.image_url || dbNews.imageUrl,
  sourceUrl: dbNews.source_url || dbNews.sourceUrl,
  createdAt: dbNews.created_at || dbNews.createdAt
});

export const formatKSTDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Seoul'
    });
    
    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const second = parts.find(p => p.type === 'second').value;
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  } catch (e) {
    return dateStr;
  }
};

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
