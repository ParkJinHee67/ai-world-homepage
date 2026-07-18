/**
 * 톱니바꿈 AI월드 - 카드뉴스 랜딩 광고 슬롯 설정 파일
 * 
 * [각 광고 타입별 실제 값 교체 가이드]
 * 
 * 1. type: 'coupang-iframe' (쿠팡 다이나믹 배너)
 *    - html: 쿠팡 파트너스에서 발급받은 배너 iframe HTML 코드를 그대로 붙여넣습니다.
 *    - 예시: '<iframe src="https://ads-partners.coupang.com..." width="680" height="90"...></iframe>'
 * 
 * 2. type: 'product-card' (쿠팡 상품 링크 카드)
 *    - title: 상품의 이름 또는 노출할 문구 (예: "로지텍 MX Keys 무선 키보드")
 *    - price: 노출할 가격 또는 혜택 문구 (예: "특가 139,000원")
 *    - imageUrl: 상품 썸네일 이미지 주소 (예: "https://images.unsplash.com/...")
 *    - link: 상품의 쿠팡 파트너스 단축 URL 링크 (예: "https://link.coupang.com/a/xxxx")
 * 
 * 3. type: 'house' (내부/자체 서비스 홍보 배너)
 *    - title: 서비스명 또는 홍보 문구 (예: "TimeBox Daily Planner")
 *    - desc: 상세 설명 또는 혜택 정보 (예: "하루 10분 계획으로 인생을 바꾸는 다이어리")
 *    - imageUrl: 썸네일 또는 배너 이미지 주소
 *    - link: 이동할 상대 경로 또는 외부 절대 경로 주소 (예: "/timebox" 또는 "https://my-timebox-planner.vercel.app")
 * 
 * 4. type: 'adsense' (구글 애드센스 - 승인 후 사용 가능)
 *    - 주석에 기재된 스켈레톤을 활용하여 추후 구글 광고 스크립트를 삽입할 수 있습니다.
 */

export const adSlots = [
  {
    id: 'ad-slot-1',
    type: 'coupang-iframe',
    html: `
      <iframe src="https://ads-partners.coupang.com/widgets.html?id=1008054&template=carousel&trackingCode=AF8988181&subId=&width=680&height=140&tsource=" width="680" height="140" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics></iframe>
    `
  },
  {
    id: 'ad-slot-2',
    type: 'product-card',
    title: '[교체 필요] 추천 코딩용 무선 키보드',
    price: '특가 판매중 (교체 필요)',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop',
    link: '#'
  },
  {
    id: 'ad-slot-3',
    type: 'product-card',
    title: '[교체 필요] 추천 AI 인공지능 입문서',
    price: '도서 가격 (교체 필요)',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    link: '#'
  },
  {
    id: 'ad-slot-4',
    type: 'house',
    title: 'TimeBox Daily Planner',
    desc: '하루 계획과 집중을 돕는 심플하고 강력한 데일리 타임박스 플래너를 무료로 체험해 보세요!',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop',
    link: 'https://my-timebox-planner.vercel.app'
  }
];
