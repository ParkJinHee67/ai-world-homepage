"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

// 운영자의 다른 서비스 배너 (스텔라사주 + TimeBox Planner + 토스증권 AutoTrader Pro)
const HIDDEN_PREFIXES = ['/admin', '/privacy'];
const COMPACT_PREFIXES = ['/homepage', '/ai-recommend', '/cardnews'];
const match = (pathname, prefixes) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));

const SERVICES = [
  {
    id: 'stellarsaju',
    badge: 'AI 사주·운세',
    title: '스텔라사주 - AI 사주풀이',
    description: '오늘의 운세, 띠별 운세, 무료 사주, 타로를 무료로 먼저 보고, 중요한 순간에는 상황별 리포트로 더 깊게 확인해 보세요.',
    buttonText: '무료 운세 보러가기 ➔',
    link: 'https://www.stellarsaju.com/saju?utm_source=aiworld&utm_medium=banner&utm_campaign=stellarsaju_banner',
  },
  {
    id: 'timebox',
    badge: '생산성·플래너',
    title: 'TimeBox Planner - 5분 타임박싱 플래너',
    description: '오늘 가장 중요한 3가지(Top 3), 머릿속 생각 비우기(Brain Dump), 타임라인 계획, 구글 캘린더 연동. 핵심 기능은 무료입니다.',
    buttonText: '플래너 써보기 ➔',
    link: 'https://my-timebox-planner.vercel.app/?intro=true',
  },
  {
    id: 'autotrader',
    badge: '토스증권 OpenAPI',
    title: '토스증권 AutoTrader Pro',
    description: '토스증권 OpenAPI 기반 자동매매/신호 스캔 서비스입니다. 7일 무료 모의투자로 먼저 체험해 보세요.',
    disclaimer: '모의투자 먼저 이용을 권장합니다. 투자에는 원금 손실 위험이 있으며 수익을 보장하지 않습니다. 토스증권 공식 서비스가 아닙니다.',
    buttonText: '모의투자로 체험하기 ➔',
    link: 'http://158.101.145.224:5000/',
  },
];

export default function StellarBanner() {
  const pathname = usePathname() || '/';
  if (match(pathname, HIDDEN_PREFIXES)) return null;

  // 상품/체크아웃 페이지를 위한 컴팩트 모드
  if (match(pathname, COMPACT_PREFIXES)) {
    return (
      <aside aria-label="운영자의 다른 서비스" className="container-max" style={compact.wrap}>
        <div style={compact.card}>
          <span style={compact.badge}>운영자 서비스</span>
          <span style={compact.text}>
            <span style={{ fontWeight: 700, color: '#f8fafc', marginRight: 6 }}>스텔라사주 · 타임박스 플래너 · 토스증권 AutoTrader</span>
            무료로 먼저 체험해 보세요
          </span>
          <a href={SERVICES[0].link} target="_blank" rel="noopener noreferrer" style={compact.cta}>
            서비스 둘러보기 →
          </a>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="운영자의 다른 서비스" className="container-max" style={styles.sectionWrap}>
      {/* Section Header */}
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>운영자의 다른 서비스</h2>
        <span style={styles.headerBadge}>무료로 먼저 써보세요</span>
      </div>

      {/* 3-Column Services Grid */}
      <div className="services-grid" style={styles.grid}>
        {SERVICES.map((item) => (
          <div key={item.id} className="operator-service-card" style={styles.card}>
            {/* Top Row: Badge & External Icon */}
            <div style={styles.topRow}>
              <span style={styles.badge}>{item.badge}</span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                title={`${item.title} 새 창 열기`}
                style={styles.iconLink}
              >
                <ExternalLink size={16} color="#71717a" />
              </a>
            </div>

            {/* Title & Description */}
            <h3 style={styles.title}>{item.title}</h3>
            <p style={styles.desc}>{item.description}</p>

            {/* Disclaimer box for Financial/API trading service */}
            {item.disclaimer && (
              <div style={styles.disclaimerBox}>
                {item.disclaimer}
              </div>
            )}

            {/* Bottom Actions & Footnote (aligned to bottom) */}
            <div style={styles.footerWrap}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="service-action-btn"
                style={styles.actionBtn}
              >
                {item.buttonText}
              </a>
              <span style={styles.footnote}>운영자가 직접 운영하는 서비스입니다</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

const styles = {
  sectionWrap: {
    width: '100%',
    maxWidth: '1200px',
    margin: '60px auto 40px',
    padding: '0 20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '1.45rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
    fontFamily: 'var(--font-title, sans-serif)',
  },
  headerBadge: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.28)',
    padding: '3px 10px',
    borderRadius: '999px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    alignItems: 'stretch',
  },
  card: {
    background: '#0d0f17',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '24px 22px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  badge: {
    fontSize: '0.74rem',
    fontWeight: 700,
    color: '#6ee7b7',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.28)',
    padding: '4px 10px',
    borderRadius: '999px',
  },
  iconLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '6px',
    transition: 'color 0.15s ease',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.35,
    margin: '0 0 12px 0',
    letterSpacing: '-0.02em',
  },
  desc: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: '0 0 16px 0',
    wordBreak: 'keep-all',
  },
  disclaimerBox: {
    background: 'rgba(255, 255, 255, 0.025)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '0.74rem',
    color: '#71717a',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
  footerWrap: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingTop: '8px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    background: '#9fe3cb',
    color: '#08231a',
    fontSize: '0.92rem',
    fontWeight: 800,
    padding: '13px 20px',
    borderRadius: '12px',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(159, 227, 203, 0.25)',
    transition: 'transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
  },
  footnote: {
    fontSize: '0.72rem',
    color: '#71717a',
    marginTop: '12px',
    textAlign: 'center',
  },
};

const compact = {
  wrap: { width: '100%', maxWidth: 720, margin: '24px auto 16px', padding: '0 16px' },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: '#0d0f17',
    color: '#e4e4e7',
    lineHeight: 1.3,
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6ee7b7',
    background: 'rgba(16, 185, 129, 0.12)',
    padding: '3px 8px',
    borderRadius: 999,
  },
  text: { flex: '1 1 auto', minWidth: 200, fontSize: 13, wordBreak: 'keep-all' },
  cta: {
    flex: 'none',
    padding: '6px 12px',
    borderRadius: 999,
    background: '#9fe3cb',
    color: '#08231a',
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'none',
  },
};
