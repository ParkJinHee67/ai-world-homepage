/**
 * 미디어(jinheestate.blog)에서 팔던 유료 상품의 구매 안내.
 * 카드 제목 매칭으로 연결한다. (Supabase 설명/링크만으로는 구매 절차가 안 보이던 문제 보완)
 */
export const PRODUCT_PURCHASE_GUIDES = [
  {
    id: 'vrewmatcher-pro',
    match: [/vrewmatcher/i, /vrew\s*matcher/i],
    title: 'VrewMatcher Pro',
    tagline: 'Vrew 편집 6시간을 10분으로 — AI 씬·이미지·BGM 자동 매칭',
    priceLabel: '₩39,000',
    priceNote: '부가세 포함 · 한 번 구매로 평생 사용',
    includes: [
      'VrewMatcher Pro exe (Windows 10/11 64bit)',
      '사용자 매뉴얼 PDF',
      'Gemini Gems 프롬프트 6종',
      '마이너 업데이트 무료',
      '이메일 기술 지원',
      'Nano Banana 프롬프트 생성기 (세트 포함)',
    ],
    steps: [
      {
        title: '계좌 입금',
        body: '신한은행 247-02-197411 (예금주: 박진희)으로 39,000원을 입금해 주세요. 입금자명은 반드시 본인 이메일 주소로 적어 주세요.',
      },
      {
        title: '입금 알림 메일',
        body: 'jhpa670211@gmail.com 으로 메일을 보내 주세요. 제목 예: [VrewMatcher 구매] 홍길동',
      },
      {
        title: '24시간 내 발송',
        body: '확인 후 24시간 안에 다운로드 링크 + 매뉴얼 + Gems 프롬프트를 이메일로 보내 드립니다.',
      },
    ],
    notes: [
      'AI 씬·BGM 분석에는 Claude API 키가 필요합니다. (가입 시 무료 크레딧 제공)',
      '디지털 콘텐츠 특성상 다운로드 후에는 환불이 어렵습니다.',
    ],
    detailUrl: 'https://jinheestate.blog/vrewmatcher-pro-program/',
  },
  {
    id: 'nano-banana',
    match: [/nano\s*banana/i, /나노\s*바나나/, /나노바나나/],
    title: 'Nano Banana 프롬프트 생성기',
    tagline: 'VrewMatcher CSV + 대본 → Nano Banana(Google Flow)용 씬별 영문 프롬프트 자동 생성',
    priceLabel: '₩39,000',
    priceNote: '부가세 포함 · VrewMatcher Pro와 세트 · 한 번 구매로 평생 사용',
    includes: [
      'Nano Banana 프롬프트 생성기 v3.1 EXE',
      '사용자 매뉴얼 PDF',
      '커스텀 스타일·캐릭터 이미지 분석',
      '7가지 이미지 스타일',
      '마이너 업데이트 무료 · 이메일 지원',
    ],
    steps: [
      {
        title: '계좌 입금',
        body: '신한은행 247-02-197411 (예금주: 박진희)으로 39,000원을 입금해 주세요. (VrewMatcher Pro + Nano Banana 프롬프트 생성기 세트) 입금자명은 반드시 본인 이메일 주소로 적어 주세요.',
      },
      {
        title: '입금 알림 메일',
        body: 'jhpa670211@gmail.com 으로 메일을 보내 주세요. 제목 예: [Nano Banana 구매] 홍길동',
      },
      {
        title: '24시간 내 발송',
        body: '확인 후 24시간 안에 다운로드 링크 + 매뉴얼 PDF를 이메일로 보내 드립니다.',
      },
    ],
    notes: [
      '단독 카드로 보이더라도 가격·입금 안내는 VrewMatcher Pro와의 세트 기준과 동일합니다.',
      '프롬프트·스타일·캐릭터 분석에 Claude API 키가 필요합니다.',
      '디지털 콘텐츠 특성상 다운로드 후에는 환불이 어렵습니다.',
    ],
    detailUrl: 'https://jinheestate.blog/nano-banana-프롬프트-생성기/',
  },
  {
    id: 'sales-ebook',
    match: [/판매용전자책/, /\(판매용/],
    title: '판매용 전자책',
    tagline: '미리보기로 내용을 확인한 뒤, 이메일로 구매를 요청해 주세요.',
    priceLabel: '₩19,000',
    priceNote: '부가세 포함 · 작품별 상이할 수 있음 · 기본 안내가',
    includes: [
      '전자책 본문(미리보기 링크에서 일부 확인 가능)',
      '구매 확인 후 열람·파일 안내',
    ],
    steps: [
      {
        title: '미리보기',
        body: '카드의 Launch(또는 미리보기)로 내용을 먼저 확인해 주세요.',
      },
      {
        title: '계좌 입금',
        body: '신한은행 247-02-197411 (예금주: 박진희)으로 19,000원을 입금해 주세요. 입금자명은 반드시 본인 이메일 주소로 적어 주세요.',
      },
      {
        title: '구매 알림 메일',
        body: 'jhpa670211@gmail.com 으로 원하시는 전자책 제목과 입금 사실을 적어 메일을 보내 주세요. 예) 제목: [전자책 구매] AI 바이브코딩으로 만든 1인 SaaS 개발기',
      },
      {
        title: '발송 안내',
        body: '확인 후 열람·파일 안내를 이메일로 보내 드립니다. (작품별로 가격이 다를 수 있으면 회신으로 안내합니다.)',
      },
    ],
    notes: [
      '미리보기와 구매 파일이 다를 수 있으니, 메일 안내에 따라 주세요.',
    ],
    detailUrl: null,
  },
  {
    id: 'timebox',
    match: [/timebox/i, /타임\s*박스/, /타임박스/],
    title: 'TimeBox Daily Planner',
    tagline: '일론 머스크식 30분 단위 시간 관리 — 드래그 앤 드롭 플래너',
    priceLabel: '사이트에서 이용·구매',
    priceNote: '가격·결제는 TimeBox 사이트 안내에 따릅니다. (별도 계좌 입금 안내 없음)',
    includes: [
      '웹 기반 데일리 타임박스 플래너',
      '일정 드래그 앤 드롭 · 브레인덤프',
      '사이트에서 안내하는 이용·구매 옵션',
    ],
    steps: [
      {
        title: '사이트 접속',
        body: 'https://mytimebox.site/ (또는 카드의 Launch 링크)로 이동합니다.',
      },
      {
        title: '이용·구매',
        body: '사이트에서 제공하는 이용 방법과 결제·요금 안내를 확인한 뒤 진행해 주세요.',
      },
      {
        title: '문의',
        body: '사이트 안내로 해결되지 않으면 jhpa670211@gmail.com 으로 문의해 주세요.',
      },
    ],
    notes: [
      '본 안내는 사이트로 연결하기 위한 것이며, 계좌 입금 가격을 별도로 고지하지 않습니다.',
    ],
    detailUrl: 'https://mytimebox.site/',
    siteUrl: 'https://mytimebox.site/',
    showAccount: false,
  },
  {
    id: 'stella-saju',
    match: [/스텔라\s*사주/, /stellarsaju/i, /\bstella\b/i],
    title: '스텔라 사주',
    tagline: '전통 명리학과 AI를 결합한 사주풀이 웹서비스',
    priceLabel: '사이트에서 이용·구매',
    priceNote: '가격·결제는 스텔라 사주 사이트 안내에 따릅니다. (별도 계좌 입금 안내 없음)',
    includes: [
      'AI 사주풀이 웹서비스 이용',
      '사이트에서 안내하는 이용·구매 옵션',
    ],
    steps: [
      {
        title: '사이트 접속',
        body: 'https://www.stellarsaju.com (또는 카드의 Launch 링크)로 이동합니다.',
      },
      {
        title: '이용·구매',
        body: '사이트에서 제공하는 이용 방법과 결제·요금 안내를 확인한 뒤 진행해 주세요.',
      },
      {
        title: '문의',
        body: '사이트 안내로 해결되지 않으면 jhpa670211@gmail.com 으로 문의해 주세요.',
      },
    ],
    notes: [
      '본 안내는 사이트로 연결하기 위한 것이며, 계좌 입금 가격을 별도로 고지하지 않습니다.',
    ],
    detailUrl: 'https://www.stellarsaju.com',
    siteUrl: 'https://www.stellarsaju.com',
    showAccount: false,
  },
];

export function findPurchaseGuide(title = '') {
  const text = String(title || '');
  return PRODUCT_PURCHASE_GUIDES.find((g) => g.match.some((re) => re.test(text))) || null;
}
