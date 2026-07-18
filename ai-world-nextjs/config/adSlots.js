/**
 * 톱니바꿈 AI월드 - 카드뉴스 랜딩 광고 슬롯 설정 파일
 * 
 * [각 광고 타입별 실제 값 교체 가이드]
 * 
 * 1. type: 'coupang-iframe' (쿠팡 다이나믹 배너)
 *    - html: 쿠팡 파트너스에서 발급받은 배너 iframe HTML 코드를 그대로 붙여넣습니다.
 *    - label: 광고 슬롯 상단/하단에 노출할 설명 텍스트 (선택사항)
 */

export const adSlots = [
  {
    id: 'ad-slot-1',
    type: 'coupang-iframe',
    html: `
      <iframe src="https://ads-partners.coupang.com/widgets.html?id=1008065&template=carousel&trackingCode=AF8988181&subId=&width=680&height=140&tsource=" width="680" height="140" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics></iframe>
    `
  },
  {
    id: 'ad-slot-2',
    type: 'coupang-iframe',
    label: '유튜브 녹음 입문용 마이크',
    html: `
      <iframe src="https://coupa.ng/cn9n3L" width="492" height="492" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics></iframe>
    `
  },
  {
    id: 'ad-slot-3',
    type: 'coupang-iframe',
    label: 'AI 활용 입문 추천 도서',
    html: `
      <iframe src="https://coupa.ng/cn9ojr" width="120" height="240" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics></iframe>
    `
  },
  {
    id: 'ad-slot-4',
    type: 'house',
    title: 'TimeBox Daily Planner',
    desc: '하루 계획과 집중을 돕는 심플하고 강력한 데일리 타임박스 플래너를 무료로 체험해 보세요!',
    description: '하루 계획과 집중을 돕는 심플하고 강력한 데일리 타임박스 플래너를 무료로 체험해 보세요!',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop',
    link: 'https://my-timebox-planner.vercel.app',
    link_url: 'https://my-timebox-planner.vercel.app'
  }
];
