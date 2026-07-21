"use client";

import React from 'react';
import { Terminal, Code2, Users, MessageSquare, Compass } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function AboutClient() {
  const { t } = useLanguage();

  return (
    <div style={styles.pageWrapper}>
      <div className="container-max" style={styles.container}>
        {/* Title Header */}
        <div style={styles.header}>
          <div style={styles.badge}>
            <Compass size={14} style={{ color: 'var(--accent-indigo)' }} />
            <span>{t('about.badge', 'About GearsShift AI World')}</span>
          </div>
          <h1 style={styles.mainTitle}>{t('about.title', '톱니바꿈 AI월드 소개')}</h1>
          <p style={styles.subtitle}>
            {t('about.subtitle', 'AI 기술을 현실의 유용한 가치로 전환하는 톱니바꿈의 기술 여정')}
          </p>
        </div>

        {/* Introduction Section */}
        <div className="glass-panel" style={styles.introCard}>
          <div style={styles.sectionHeader}>
            <Terminal size={22} style={{ color: 'var(--accent-indigo)' }} />
            <h2 style={styles.sectionTitle}>{t('about.who_title', '누구인가요?')}</h2>
          </div>
          <p 
            style={styles.paragraph} 
            dangerouslySetInnerHTML={{
              __html: t('about.who_desc1', '<strong>톱니바꿈 AI월드</strong>는 30년 경력의 시니어 소프트웨어 엔지니어가 최신 생성형 AI(Generative AI) 모델과 인공지능 에이전트 기법을 연구하고, 이를 실질적인 업무 자동화 솔루션 및 어플리케이션으로 가시화하여 제공하는 기술 공유 허브입니다.')
            }}
          />
          <p style={styles.paragraph}>
            {t('about.who_desc2', '인공지능 기술의 진정한 가치는 단순히 모델의 거대함에 있는 것이 아니라, 개개인의 창작 활동과 비즈니스 워크플로우 내에서 맞물려 돌아가는 단단한 톱니바퀴처럼 실용적으로 작동할 때 발현된다는 신념으로 개발에 임하고 있습니다.')}
          </p>
        </div>

        {/* Key Activities Grid */}
        <div style={styles.gridSection}>
          <h2 style={styles.gridSectionTitle}>{t('about.activity_title', '주요 활동 및 제공 서비스')}</h2>
          <div style={styles.grid}>
            
            <div className="glass-panel" style={styles.gridCard}>
              <div style={styles.gridCardIcon}>
                <Code2 size={20} style={{ color: 'var(--accent-rose)' }} />
              </div>
              <h3 style={styles.gridCardTitle}>{t('about.act1_title', 'AI 자동화 솔루션 개발')}</h3>
              <p style={styles.gridCardDesc}>
                {t('about.act1_desc', 'VrewMatcher Pro(영상 자막/번역 매칭 최적화 도구), TimeBox Daily Planner(일론 머스크식 시간 관리 플래너) 등 AI와 실무 워크플로우를 결합한 고효율 비즈니스 애플리케이션을 전문 제작합니다.')}
              </p>
            </div>

            <div className="glass-panel" style={styles.gridCard}>
              <div style={styles.gridCardIcon}>
                <Users size={20} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <h3 style={styles.gridCardTitle}>{t('about.act2_title', '실전 지식 공유 및 크리에이터')}</h3>
              <p 
                style={styles.gridCardDesc}
                dangerouslySetInnerHTML={{
                  __html: t('about.act2_desc', '유튜브 채널 <strong>[코드야놀자톱니바꿈]</strong> 등을 운영하며 초보자부터 전문가까지 생성형 AI 코딩 비서와 대형 언어 모델(LLM)을 업무에 실질적으로 도입할 수 있는 실무 교육 콘텐츠를 제작 및 제공합니다.')
                }}
              />
            </div>

            <div className="glass-panel" style={styles.gridCard}>
              <div style={styles.gridCardIcon}>
                <Terminal size={20} style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <h3 style={styles.gridCardTitle}>{t('about.act3_title', '차세대 웹 제작 서비스')}</h3>
              <p style={styles.gridCardDesc}>
                {t('about.act3_desc', 'Next.js 15+, Supabase, Vercel Edge 네트워크를 활용해 로딩 지연이 없는 최고 수준의 정적 생성(SSG) 검색엔진 최적화(SEO) 반응형 랜딩 페이지 및 비즈니스 플랫폼 개발 서비스를 제공합니다.')}
              </p>
            </div>

          </div>
        </div>

        {/* Contact CTA */}
        <div className="glass-panel" style={styles.ctaCard}>
          <h3 style={styles.ctaTitle}>{t('about.cta_title', '기술 협업 및 맞춤 솔루션 문의')}</h3>
          <p style={styles.ctaDesc}>
            {t('about.cta_desc', '업무 프로세스에 AI 자동화를 도입하고 싶으시거나 프로그램 커스텀 제작, 홈페이지 구축 등 비즈니스 파트너십이 필요하시면 편하게 문의해 주시기 바랍니다.')}
          </p>
          <a
            href="https://open.kakao.com/o/si1c9OAi"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.kakaoBtn}
          >
            <MessageSquare size={18} fill="currentColor" />
            <span>{t('about.cta_btn', '카카오 오픈채팅 문의하기')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    padding: '80px 0 100px 0',
  },
  container: {
    padding: '0 24px',
    maxWidth: '960px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#818cf8',
    marginBottom: '16px',
  },
  mainTitle: {
    fontSize: '2.6rem',
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    marginBottom: '12px',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  introCard: {
    background: 'rgba(20, 18, 38, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '36px',
    marginBottom: '48px',
    textAlign: 'left',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  paragraph: {
    fontSize: '0.92rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
    marginBottom: '16px',
  },
  gridSection: {
    marginBottom: '56px',
  },
  gridSectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '28px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  gridCard: {
    background: 'rgba(20, 18, 38, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '28px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  gridCardIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  gridCardTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  gridCardDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  ctaCard: {
    background: 'linear-gradient(135deg, rgba(20, 18, 38, 0.6) 0%, rgba(13, 11, 24, 0.6) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  },
  ctaTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  ctaDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: '560px',
  },
  kakaoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FEE500',
    color: '#191919',
    padding: '12px 28px',
    borderRadius: '30px',
    fontSize: '0.9rem',
    fontWeight: 700,
    boxShadow: '0 6px 20px rgba(254, 229, 0, 0.2)',
    textDecoration: 'none',
    marginTop: '8px',
    transition: 'transform 0.2s ease',
  }
};
