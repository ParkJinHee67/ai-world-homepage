"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import AdSlot from '../../components/AdSlot';
import { adSlots as localAdSlots } from '../../config/adSlots';
import { db } from '../../supabaseClient';

export default function CardNewsClient({ initialDecks = [] }) {
  const [decks, setDecks] = useState(initialDecks);
  const [isMobile, setIsMobile] = useState(false);
  const [activeAdSlots, setActiveAdSlots] = useState([]);
  const [adLoading, setAdLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchAds = async () => {
      try {
        const { data, error } = await db.getAdSlots();
        if (!active) return;
        if (data && data.length > 0) {
          const sorted = [...data].sort((a, b) => a.position - b.position);
          setActiveAdSlots(sorted);
        } else {
          setActiveAdSlots(localAdSlots);
        }
      } catch (err) {
        if (active) setActiveAdSlots(localAdSlots);
      } finally {
        if (active) setAdLoading(false);
      }
    };
    fetchAds();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try {
      const mockDecks = JSON.parse(localStorage.getItem('mock_cardnews_decks') || '[]');
      if (mockDecks.length > 0) {
        const combined = [...mockDecks, ...initialDecks];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setDecks(unique.slice(0, 4));
      } else {
        setDecks(initialDecks);
      }
    } catch (e) {
      console.warn('Failed to load mock decks in landing page:', e);
      setDecks(initialDecks);
    }
  }, [initialDecks]);

  return (
    <div style={styles.landingContainer}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div className="container-max" style={styles.heroInner}>
          <div style={styles.badgeWrapper}>
            <span style={styles.heroBadge}>✨ 카드뉴스 제작의 혁명</span>
          </div>
          <h1 style={styles.heroTitle}>
            글만 붙여넣으면,<br />
            <span style={styles.gradientText}>인스타 카드뉴스</span> 자동 완성
          </h1>
          <p style={styles.heroSub}>
            기사 요약부터 고화질 배경 이미지 선정, 6가지 디자인 스타일 테마 적용까지.<br />
            이제 AI 카드뉴스 자동화 도구로 SNS 콘텐츠를 5분 만에 양산하세요.
          </p>
          <div style={styles.heroActions}>
            <Link href="/cardnews/editor" style={styles.btnPrimary}>
              에디터 시작하기 <ArrowRight size={16} />
            </Link>
          </div>
          
          <div style={styles.previewContainer}>
            <div style={styles.previewMock}>
              <div style={styles.previewHeader}>
                <span style={styles.dotRed}></span>
                <span style={styles.dotYellow}></span>
                <span style={styles.dotGreen}></span>
                <span style={styles.previewTitle}>CardNews Editor v3</span>
              </div>
              <img 
                src="/images/AI_card_news_generator_tool_202607181914.jpeg" 
                alt="에디터 미리보기" 
                style={styles.previewImg} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Published Decks */}
      {decks.length > 0 && (
        <section style={styles.recentSection}>
          <div className="container-max">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>최근 발행된 카드뉴스</h2>
              <p style={styles.sectionSub}>톱니바꿈 사용자들이 완성하여 발행한 작품들을 감상해보세요.</p>
            </div>
            <div style={styles.grid4}>
              {decks.map((deck) => (
                <Link key={deck.id} href={`/cardnews/gallery/${deck.id}`} style={styles.deckCard}>
                  <div style={styles.deckCardThumbContainer}>
                    <img 
                      src={deck.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"} 
                      alt={deck.title} 
                      style={styles.deckCardThumb}
                    />
                    <div style={styles.deckCardBadge}>{deck.card_count}장</div>
                  </div>
                  <div style={styles.deckCardContent}>
                    <h3 style={styles.deckCardTitle}>{deck.title}</h3>
                    <div style={styles.deckCardFooter}>
                      <span>👁 {deck.view_count || 0}</span>
                      <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link href="/cardnews/gallery" style={styles.btnSecondaryLink}>
                갤러리 전체보기 <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Coupang Partners Ad Banner */}
      <section style={styles.adSection}>
        <div className="container-max">
          <div style={styles.bannerContainer}>
            <span style={styles.bannerLabel}>광고</span>
            <div style={styles.bannerContent}>
              <h4 style={styles.bannerTitle}>톱니바꿈 추천 도서 및 장비</h4>
              <p style={styles.bannerDesc}>
                본 페이지는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
              </p>
            </div>
            
            {adLoading ? (
              <div style={styles.adLoadingPlaceholder}>
                <span>광고를 불러오는 중입니다...</span>
              </div>
            ) : (
              <div style={styles.adContentWrapper}>
                {/* 1번 슬롯: 쿠팡 다이나믹 배너 */}
                {activeAdSlots[0] && <AdSlot ad={activeAdSlots[0]} />}
                
                {/* 2, 3, 4번 슬롯: 상품 카드 및 하우스 배너 */}
                <div style={{
                  ...styles.adGrid,
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                }}>
                  {activeAdSlots.slice(1, 4).map((ad) => (
                    <AdSlot key={ad.id || ad.position} ad={ad} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  landingContainer: {
    backgroundColor: '#030207',
    color: '#f3f5fa',
    minHeight: '100vh',
    fontFamily: "'Pretendard', sans-serif",
    overflowX: 'hidden',
  },
  heroSection: {
    padding: '80px 20px 60px',
    background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
    textAlign: 'center',
  },
  heroInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badgeWrapper: {
    marginBottom: '20px',
  },
  heroBadge: {
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    color: '#818cf8',
    border: '1px solid rgba(129, 140, 248, 0.2)',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '800',
    lineHeight: '1.25',
    marginBottom: '24px',
    letterSpacing: '-0.02em',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '18px',
    color: '#aab4c8',
    lineHeight: '1.6',
    maxWidth: '700px',
    marginBottom: '40px',
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '60px',
    width: '100%',
    maxWidth: '400px',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#6366f1',
    color: '#fff',
    padding: '14px 24px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '15px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.2s, background-color 0.2s',
  },
  btnSecondaryLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13.5px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  previewContainer: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '20px',
  },
  previewMock: {
    backgroundColor: '#161520',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  previewHeader: {
    backgroundColor: '#0d0c13',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  dotRed: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' },
  dotYellow: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' },
  dotGreen: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' },
  previewTitle: {
    color: '#6b7684',
    fontSize: '12px',
    marginLeft: '10px',
    fontWeight: '500',
  },
  previewImg: {
    width: '100%',
    height: 'auto',
    maxHeight: '440px',
    objectFit: 'cover',
    display: 'block',
  },
  recentSection: {
    padding: '60px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '10px',
    letterSpacing: '-0.02em',
  },
  sectionSub: {
    fontSize: '15px',
    color: '#aab4c8',
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px',
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  deckCard: {
    backgroundColor: '#0e0c15',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  deckCardThumbContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/5',
    backgroundColor: '#050408',
  },
  deckCardThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  deckCardBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },
  deckCardContent: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  deckCardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '1.4',
    marginBottom: '12px',
    color: '#ffffff',
  },
  deckCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#10b981',
  },
  keyTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: '700',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '20px',
  },
  faqItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  faqQuestion: {
    width: '100%',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqAnswer: {
    padding: '0 24px 24px',
    color: '#aab4c8',
    fontSize: '14.5px',
    lineHeight: '1.6',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    paddingTop: '20px',
  },
  bannerContainer: {
    background: 'linear-gradient(135deg, #14131b 0%, #0d0c12 100%)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  bannerLabel: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  bannerContent: {},
  bannerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#fff',
  },
  bannerDesc: {
    fontSize: '14px',
    color: '#aab4c8',
    lineHeight: '1.5',
  },
  bannerAdSlot: {
    width: '100%',
    height: '100px',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  bannerAdPlaceholder: {
    fontSize: '13px',
    color: '#6b7684',
  },
  bottomCtaSection: {
    padding: '120px 20px',
    textAlign: 'center',
    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bottomCtaTitle: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '20px',
  },
  bottomCtaSub: {
    fontSize: '16px',
    color: '#aab4c8',
    marginBottom: '40px',
    maxWidth: '600px',
  },
  adContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    marginTop: '20px',
  },
  adGrid: {
    display: 'grid',
    gap: '24px',
    width: '100%',
  },
  adLoadingPlaceholder: {
    width: '100%',
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a090f',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    color: '#6b7684',
    fontSize: '13px',
    marginTop: '20px',
  }
};
