/**
 * 미디어 허브(jinheestate.blog) IT/AI 글 → AI월드 인사이트 딥링크
 * Supabase Insight 항목과 병합해 사용. 새 글은 여기 맨 위에 추가.
 */
export const MEDIA_HUB_IT_AI_URL = 'https://jinheestate.blog/category/it-ai/';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop';

/** @type {Array<{id:string,title:string,description:string,imageUrl:string,appUrl:string,category:string,sortOrder:number}>} */
export const mediaInsightItems = [
  {
    id: 'media-ai-watermark-2026',
    title: 'AI 워터마크 의무화, 1인 창작자도 대상일까요?',
    description: '미디어 허브 · IT/AI — 창작자 가이드',
    imageUrl: DEFAULT_IMAGE,
    appUrl: 'https://jinheestate.blog/2026/09/22/ai-watermark-law-creators-2026/',
    category: 'Insight',
    sortOrder: -8,
  },
  {
    id: 'media-ai-doom-10',
    title: 'AI 종말론 10%, 그 숫자는 어디서 왔나',
    description: '미디어 허브 · IT/AI — 숫자 뒤에 숨은 맥락',
    imageUrl: DEFAULT_IMAGE,
    appUrl: 'https://jinheestate.blog/2026/09/10/ai-doom-10-percent-opinion-2026/',
    category: 'Insight',
    sortOrder: -7,
  },
  {
    id: 'media-ai-drug-longevity',
    title: 'AI가 설계한 신약, 노화 시계 3~4년 낮췄다 (2026)',
    description: '미디어 허브 · IT/AI — 바이오·AI 교차점',
    imageUrl: DEFAULT_IMAGE,
    appUrl: 'https://jinheestate.blog/2026/09/08/ai-designed-drug-longevity-2026/',
    category: 'Insight',
    sortOrder: -6,
  },
  {
    id: 'media-huggingface-breach',
    title: '허깅페이스 해킹, AI 에이전트가 뚫은 2026년 7월 사건',
    description: '미디어 허브 · IT/AI — 에이전트 보안',
    imageUrl: DEFAULT_IMAGE,
    appUrl: 'https://jinheestate.blog/2026/09/07/huggingface-ai-agent-breach-2026/',
    category: 'Insight',
    sortOrder: -5,
  },
  {
    id: 'media-openai-wiki',
    title: '오픈AI 위키 사건, 에이전트가 남긴 1만4666건',
    description: '미디어 허브 · IT/AI — 에이전트 공개 사고',
    imageUrl: DEFAULT_IMAGE,
    appUrl: 'https://jinheestate.blog/2026/09/06/openai-wiki-incident-agent-disclosure/',
    category: 'Insight',
    sortOrder: -4,
  },
  {
    id: 'media-agi-gdpval',
    title: 'AGI 시대 선언, 빠진 지표 하나',
    description: '미디어 허브 · IT/AI — 평가 지표 읽기',
    imageUrl: DEFAULT_IMAGE,
    appUrl: 'https://jinheestate.blog/2026/09/05/openai-agi-era-claim-gdpval-missing/',
    category: 'Insight',
    sortOrder: -3,
  },
  {
    id: 'media-gpt6-astra',
    title: 'GPT-6 아스트라 ARC-AGI-3, 98.6%와 62.7%의 차이',
    description: '미디어 허브 · IT/AI — 벤치마크 해석',
    imageUrl: DEFAULT_IMAGE,
    appUrl: 'https://jinheestate.blog/2026/09/04/gpt6-astra-arc-agi-3-benchmark/',
    category: 'Insight',
    sortOrder: -2,
  },
  {
    id: 'media-nyc-ai-ban',
    title: '뉴욕시 AI 금지, 초·중학생 50만 명 2026년 9월 시행',
    description: '미디어 허브 · IT/AI — 교육·정책',
    imageUrl: DEFAULT_IMAGE,
    appUrl: 'https://jinheestate.blog/2026/09/03/nyc-schools-ai-ban-2026/',
    category: 'Insight',
    sortOrder: -1,
  },
];

/** Prepend media blog posts; drop Supabase duplicates that already point at the same URL. */
export function mergeMediaInsights(existing = []) {
  const mediaUrls = new Set(
    mediaInsightItems.map((i) => (i.appUrl || '').replace(/\/$/, ''))
  );
  const rest = (existing || []).filter((item) => {
    const url = (item.appUrl || '').replace(/\/$/, '');
    return !mediaUrls.has(url);
  });
  return [...mediaInsightItems, ...rest];
}
