"use client";
import React from 'react';
import { usePathname } from 'next/navigation';

// 스텔라사주 하우스 배너 — 상품/전환 페이지에서는 노출하지 않음 (전환 방해 방지)
const HIDDEN_PREFIXES = ['/admin', '/homepage', '/ai-recommend', '/cardnews', '/privacy'];

const HREF =
  'https://www.stellarsaju.com/saju?utm_source=aiworld&utm_medium=banner&utm_campaign=stellarsaju_banner';

export default function StellarBanner() {
  const pathname = usePathname() || '/';
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

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
