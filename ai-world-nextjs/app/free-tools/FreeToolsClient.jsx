"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db, mapPortfolioItem } from '../supabaseClient';
import PortfolioCard from '../../components/PortfolioCard';
import { Wrench } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const GearCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    const dpr = window.devicePixelRatio || 1;
    let width = 380;
    let height = 380;
    
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || 380;
      const h = rect.height || 380;
      width = w;
      height = h;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      angle += 0.01;

      // Draw gear ring 1
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw gear ring 2
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 1.5);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Glowing core
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default function FreeToolsClient({ initialItems, highlightId }) {
  const { t } = useLanguage();
  const [items, setItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [highlightCardId, setHighlightCardId] = useState(null);

  useEffect(() => {
    async function loadFreeTools() {
      try {
        const { data, error } = await db.getPortfolio();
        if (error) throw error;
        if (data) {
          const mapped = data.map(mapPortfolioItem);
          const filtered = mapped.filter(x => x.category === 'FreeTool');
          setItems(filtered);
        }
      } catch (e) {
        console.error('Failed to load free tools:', e);
      }
    }
    loadFreeTools();
  }, []);

  useEffect(() => {
    if (!loading) {
      let hId = highlightId;
      if (!hId && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        hId = params.get('id');
      }

      if (hId) {
        setHighlightCardId(hId);
        const timer = setTimeout(() => {
          const el = document.getElementById(`card-${hId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);

        const clearTimer = setTimeout(() => {
          setHighlightCardId(null);
        }, 3000);

        return () => {
          clearTimeout(timer);
          clearTimeout(clearTimer);
        };
      }
    }
  }, [loading, highlightId]);

  return (
    <div style={styles.container}>
      <section className="container-max" style={styles.headerSection}>
        <div className="recommend-header-flex" style={styles.headerFlexContainer}>
          <div style={styles.headerInner}>
            <div style={styles.iconContainer}>
              <Wrench size={24} color="var(--accent-emerald)" />
            </div>
            <h1 className="recommend-title" style={styles.title}>{t('freetool.title', '무료 AI 도구')}</h1>
            <p className="recommend-subtitle" style={styles.subtitle}>
              {t('freetool.subtitle', '누구나 제약 없이 자유롭게 활용할 수 있는 웹 기반 AI 무료 실용 도구 모음입니다.')}
            </p>
          </div>
          <div className="recommend-header-img-container" style={styles.headerImageContainer}>
            <GearCanvas />
            <div style={styles.glowBg1} />
            <div style={styles.glowBg2} />
          </div>
        </div>
      </section>

      <section className="container-max">
        {loading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-emerald)' }} />
          </div>
        ) : (
          <div className="grid-container">
            {items.map((item, idx) => (
              <PortfolioCard
                key={item.id}
                item={item}
                index={idx}
                isHighlighted={String(item.id) === String(highlightCardId)}
              />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>{t('freetool.no_portfolio', '등록된 무료 도구가 없습니다.')}</p>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '100px',
    paddingBottom: '80px',
    minHeight: '100vh',
    background: 'var(--bg-main)'
  },
  headerSection: {
    marginBottom: '48px',
    position: 'relative'
  },
  headerFlexContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '32px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '24px',
    padding: '40px',
    overflow: 'hidden',
    position: 'relative'
  },
  headerInner: {
    flex: 1,
    zIndex: 2
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: 'var(--text-main)',
    marginBottom: '12px',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: '540px'
  },
  headerImageContainer: {
    width: '280px',
    height: '220px',
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden'
  },
  glowBg1: {
    position: 'absolute',
    top: '-20%',
    right: '-20%',
    width: '200px',
    height: '200px',
    background: 'var(--accent-emerald)',
    filter: 'blur(80px)',
    opacity: 0.15,
    pointerEvents: 'none'
  },
  glowBg2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-20%',
    width: '180px',
    height: '180px',
    background: 'var(--accent-indigo)',
    filter: 'blur(70px)',
    opacity: 0.15,
    pointerEvents: 'none'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '80px 0'
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '80px 0',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 255, 255, 0.08)'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '15px'
  }
};
