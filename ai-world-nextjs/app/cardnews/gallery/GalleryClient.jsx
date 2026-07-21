"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Calendar, Eye, Grid } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

export default function GalleryClient({ initialDecks = [] }) {
  const [decks] = useState(initialDecks);
  const { t } = useLanguage();

  return (
    <div style={styles.container}>
      <div className="container-max" style={styles.inner}>
        {/* Navigation / Header */}
        <div style={styles.header}>
          <Link href="/cardnews" style={styles.backLink}>
            <ArrowLeft size={16} /> {t('gallery.back', '소개 페이지로 돌아가기')}
          </Link>
          <div style={styles.titleRow}>
            <h1 style={styles.title}><Grid size={24} style={{ color: '#6366f1', verticalAlign: 'middle', marginRight: '8px' }} /> {t('gallery.title', '발행 갤러리')}</h1>
            <p style={styles.subtitle}>{t('gallery.subtitle', '사용자들이 에디터에서 완성하여 공유한 생생한 카드뉴스 포트폴리오입니다.')}</p>
          </div>
        </div>

        {/* Deck Grid */}
        {decks.length === 0 ? (
          <div style={styles.emptyState}>
            <BookOpen size={48} style={{ color: '#4b5563', marginBottom: '16px' }} />
            <p style={styles.emptyText}>{t('gallery.empty.title', '아직 발행된 카드뉴스가 없습니다.')}</p>
            <p style={styles.emptySub}>{t('gallery.empty.sub', '첫 번째로 멋진 카드뉴스를 만들어 갤러리에 공유해 보세요!')}</p>
            <Link href="/cardnews/editor" style={styles.btnPrimary}>
              {t('gallery.empty.action', '에디터로 카드뉴스 만들기')}
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {decks.map((deck) => (
              <Link key={deck.id} href={`/cardnews/gallery/${deck.id}`} style={styles.card}>
                <div style={styles.thumbWrapper}>
                  <img
                    src={deck.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"}
                    alt={deck.title}
                    style={styles.thumb}
                  />
                  <div style={styles.cardBadge}>
                    <Layers size={12} /> {deck.card_count}{t('cardnews.card_unit', '장')}
                  </div>
                </div>
                <div style={styles.cardInfo}>
                  <h2 style={styles.cardTitle}>{deck.title}</h2>
                  {deck.description && (
                    <p style={styles.cardDesc}>{deck.description}</p>
                  )}
                  <div style={styles.cardFooter}>
                    <span style={styles.footerItem}>
                      <Eye size={13} /> {deck.view_count || 0}
                    </span>
                    <span style={styles.footerItem}>
                      <Calendar size={13} /> {new Date(deck.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#030207',
    color: '#f3f5fa',
    minHeight: '100vh',
    width: '100%',
    padding: '40px 20px 80px',
    fontFamily: "'Pretendard', sans-serif",
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '40px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '24px',
  },
  backLink: {
    color: '#818cf8',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '20px',
    transition: 'color 0.2s',
  },
  titleRow: {},
  title: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '8px',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: '15px',
    color: '#aab4c8',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '500px',
    margin: '40px auto 0',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
  },
  emptySub: {
    fontSize: '14px',
    color: '#aab4c8',
    marginBottom: '24px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    textDecoration: 'none',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '30px',
  },
  card: {
    background: '#131118',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none',
    transition: 'transform 0.2s, border-color 0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
    }
  },
  thumbWrapper: {
    position: 'relative',
    aspectRatio: '1080/1350',
    backgroundColor: '#000',
  },
  thumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardBadge: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'rgba(3, 2, 7, 0.75)',
    backdropFilter: 'blur(4px)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  cardInfo: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
    lineHeight: '1.4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#aab4c8',
    lineHeight: '1.5',
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineBreak: 'auto',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#6b7684',
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '12px',
  },
  footerItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  }
};
