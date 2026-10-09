"use client";
import React from 'react';
import { usePathname } from 'next/navigation';

// 스텔라사주 하우스 배너 — 모든 페이지 푸터 바로 위(본문 아래)에 노출.
// 관리자/개인정보처리방침에서는 숨김. 상품·판매 페이지에서는 작은(compact) 배너로 노출해 전환 방해 최소화.
const HIDDEN_PREFIXES = ['/admin', '/privacy'];
const COMPACT_PREFIXES = ['/homepage', '/ai-recommend', '/cardnews'];
const match = (pathname, prefixes) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));

const HREF =
  'https://www.stellarsaju.com/saju?utm_source=aiworld&utm_medium=banner&utm_campaign=stellarsaju_banner';

export default function StellarBanner() {
  const pathname = usePathname() || '/';
  if (match(pathname, HIDDEN_PREFIXES)) return null;

  if (match(pathname, COMPACT_PREFIXES)) {
    return (
      <aside aria-label="스텔라사주 광고" className="container-max" style={compact.wrap}>
        <a href={HREF} target="_blank" rel="noopener" style={compact.card}>
          <span aria-hidden="true" style={compact.moon} />
          <span style={compact.text}>
            <span style={{ ...styles.brand, display: 'inline', marginRight: 6 }}>스텔라사주</span>
            내 사주 흐름, <span style={styles.hl}>무료로</span> 확인해 보세요
          </span>
          <span style={compact.cta}>무료 사주 보기 →</span>
        </a>
      </aside>
    );
  }

  return (
    <aside aria-label="스텔라사주 광고" className="container-max" style={styles.wrap}>
      <a href={HREF} target="_blank" rel="noopener" style={styles.card}>
        <span aria-hidden="true" style={styles.moon} />
        <span style={styles.text}>
          <span style={styles.brand}>
            스텔라사주 <span style={styles.brandEn}>STELLAR SAJU</span>
          </span>
          <span style={styles.title}>
            내 사주 흐름, <span style={styles.hl}>무료로</span> 확인해 보세요
          </span>
          <span style={styles.sub}>전통 명리학 × AI · 로그인 없이 바로</span>
        </span>
        <span style={styles.cta}>무료 사주 보기 →</span>
      </a>
    </aside>
  );
}

const styles = {
  wrap: { width: '100%', maxWidth: 760, margin: '40px auto 24px', padding: '0 16px' },
  card: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 16px',
    padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(252,187,0,.35)',
    background: 'linear-gradient(120deg,#1c1f4a 0%,#0d0f2b 55%,#09090b 100%)',
    textDecoration: 'none', color: '#fafafa', lineHeight: 1.35,
    boxShadow: '0 4px 18px rgba(0,0,0,.25)',
  },
  moon: {
    flex: 'none', display: 'inline-block', width: 44, height: 44, borderRadius: '50%',
    background: '#14173d', boxShadow: 'inset 9px -3px 0 0 #e8b64a, 0 0 12px rgba(252,187,0,.25)',
  },
  text: { flex: '1 1 220px', minWidth: 0 },
  brand: { display: 'block', fontSize: 12, fontWeight: 700, color: '#fcbb00', letterSpacing: '.05em' },
  brandEn: { fontWeight: 400, color: '#e8c56a', letterSpacing: '.15em', fontSize: 10 },
  title: { display: 'block', fontSize: 18, fontWeight: 700, wordBreak: 'keep-all', marginTop: 2 },
  hl: { color: '#ffd236' },
  sub: { display: 'block', fontSize: 12, color: '#a1a1aa', marginTop: 3 },
  cta: {
    flex: 'none', display: 'inline-block', padding: '10px 18px', borderRadius: 999,
    background: 'linear-gradient(180deg,#ffd236,#f99c00)', color: '#1a1200',
    fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
  },
};

const compact = {
  wrap: { width: '100%', maxWidth: 600, margin: '24px auto 16px', padding: '0 16px' },
  card: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10,
    border: '1px solid rgba(252,187,0,.25)',
    background: 'linear-gradient(120deg,#1c1f4a 0%,#0d0f2b 60%,#09090b 100%)',
    textDecoration: 'none', color: '#e4e4e7', lineHeight: 1.3,
  },
  moon: {
    flex: 'none', display: 'inline-block', width: 22, height: 22, borderRadius: '50%',
    background: '#14173d', boxShadow: 'inset 5px -2px 0 0 #e8b64a',
  },
  text: { flex: '1 1 auto', minWidth: 0, fontSize: 13, wordBreak: 'keep-all' },
  cta: {
    flex: 'none', padding: '5px 10px', borderRadius: 999,
    background: 'linear-gradient(180deg,#ffd236,#f99c00)', color: '#1a1200',
    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
  },
};
