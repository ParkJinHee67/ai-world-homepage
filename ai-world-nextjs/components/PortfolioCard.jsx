"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, BookOpen, Video, Share2, Check } from 'lucide-react';
import VideoModal from './VideoModal';
import { useLanguage } from '../app/LanguageContext';

export default function PortfolioCard({ item, index, isHighlighted = false }) {
  const [copied, setCopied] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const { t, translateDb } = useLanguage();

  // Parse youtube links
  const youtubeUrls = item.youtubeUrl 
    ? item.youtubeUrl.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Determine link path depending on category
    const path = item.category === 'AI Recommend' ? '/ai-recommend' : (item.category === 'Insight' ? '/insights' : (item.category === 'App' ? '/homepage' : '/'));
    const shareUrl = `${window.location.origin}${path}?id=${item.id}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleVideoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (youtubeUrls.length > 1) {
      setShowVideos(true);
    } else if (youtubeUrls.length === 1) {
      window.open(youtubeUrls[0], '_blank', 'noopener,noreferrer');
    }
  };

  // Determine category badge colors
  const getCatClass = () => {
    switch (item.category) {
      case 'App': return 'cat-app';
      case 'Insight': return 'cat-insight';
      case 'AI Recommend': return 'cat-recommend';
      default: return '';
    }
  };

  const getBadgeClass = () => {
    switch (item.category) {
      case 'App': return 'app';
      case 'Insight': return 'insight';
      case 'AI Recommend': return 'recommend';
      default: return '';
    }
  };

  return (
    <>
      <div 
        className={`item-card ${getCatClass()} ${isHighlighted ? 'highlight' : ''}`}
        id={`card-${item.id}`}
        style={styles.card}
      >
        {/* Image Thumbnail */}
        <div style={styles.imgContainer}>
          <Image 
            src={item.imageUrl || 'https://images.unsplash.com/photo-1678326210200-default'} 
            alt={translateDb(item.title, 'title')} 
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
          />
          <div style={styles.imageOverlay} />
          <div style={styles.badgeContainer}>
            <span className={`badge ${getBadgeClass()}`}>
              {item.category === 'App' ? t('cat.app', '홈페이지') : (item.category === 'Insight' ? t('cat.insight', '인사이트') : t('cat.recommend', '영상제작'))}
            </span>
          </div>
        </div>

        {/* Content details */}
        <div style={styles.content}>
          <h3 style={styles.title}>{translateDb(item.title, 'title')}</h3>
          <p style={styles.description}>{translateDb(item.title, 'description', item.description)}</p>

          {/* Action Links */}
          <div style={styles.actionsContainer}>
            {item.appUrl && (
              <a 
                href={item.appUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="action-btn primary"
                style={styles.actionBtnPrimary}
                title={t('card.launch_tooltip', '앱 실행하기')}
              >
                <ExternalLink size={13} />
                <span>Launch</span>
              </a>
            )}

            {item.notionUrl && (
              <a 
                href={item.notionUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="action-btn outline"
                style={styles.actionBtnOutline}
                title={t('card.manual_tooltip', '노션 가이드 및 매뉴얼 보기')}
              >
                <BookOpen size={13} />
                <span>Manual</span>
              </a>
            )}

            {youtubeUrls.length > 0 && (
              <button 
                onClick={handleVideoClick} 
                className="action-btn video-btn"
                style={styles.actionBtnVideo}
                title={t('card.video_tooltip', '유튜브 영상 가이드 보기')}
              >
                <Video size={13} />
                <span>
                  Video {youtubeUrls.length > 1 ? `(${youtubeUrls.length})` : ''}
                </span>
              </button>
            )}

            <button 
              onClick={handleShare} 
              className={`action-btn share-btn ${copied ? 'copied' : ''}`}
              style={{
                ...styles.actionBtnShare,
                ...(copied ? styles.actionBtnShareCopied : {})
              }}
              title={t('card.share_tooltip', '공유 링크 복사')}
            >
              {copied ? <Check size={13} /> : <Share2 size={13} />}
            </button>
          </div>
        </div>
      </div>

      {showVideos && (
        <VideoModal urls={youtubeUrls} onClose={() => setShowVideos(false)} />
      )}
    </>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  imgContainer: {
    position: 'relative',
    height: '200px',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#0a0914',
    marginBottom: '16px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(3, 2, 7, 0.8) 0%, transparent 80%)',
    opacity: 0.6,
  },
  badgeContainer: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: 10,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
    lineHeight: 1.3,
  },
  description: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: '20px',
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  actionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    marginTop: 'auto',
  },
  actionBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--accent-indigo)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 650,
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
    transition: 'var(--transition-fast)',
  },
  actionBtnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '7px 11px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 600,
    transition: 'var(--transition-fast)',
  },
  actionBtnVideo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    color: '#fda4af',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    padding: '7px 11px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  actionBtnShare: {
    marginLeft: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  actionBtnShareCopied: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#6ee7b7',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  }
};
