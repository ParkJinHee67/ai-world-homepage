import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, mapPortfolioItem } from '../supabaseClient';
import PortfolioCard from '../components/PortfolioCard';
import { Video } from 'lucide-react';

export default function AIRecommend() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const [highlightCardId, setHighlightCardId] = useState(null);

  useEffect(() => {
    async function loadRecommend() {
      try {
        const { data, error } = await db.getPortfolio();
        if (error) throw error;
        if (data) {
          const mapped = data.map(mapPortfolioItem);
          const filtered = mapped.filter(x => x.category === 'AI Recommend');
          setItems(filtered);
        }
      } catch (e) {
        console.error('Failed to load recommendations:', e);
      } finally {
        setLoading(false);
      }
    }
    loadRecommend();
  }, []);

  useEffect(() => {
    if (!loading && highlightId) {
      setHighlightCardId(highlightId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`card-${highlightId}`);
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
  }, [loading, highlightId]);

  return (
    <div style={styles.container}>
      <section className="container-max" style={styles.headerSection}>
        <div style={styles.headerInner}>
          <div style={styles.iconContainer}>
            <Video size={24} color="var(--accent-emerald)" />
          </div>
          <h1 className="recommend-title" style={styles.title}>영상제작 포트폴리오</h1>
          <p className="recommend-subtitle" style={styles.subtitle}>
            유튜브 롱폼/쇼츠, 인트로, 브랜드 홍보 영상 등 AI 자동화 편집 기술이 가미된 풍부한 비디오 제작 포트폴리오입니다.
          </p>
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
                isHighlighted={highlightCardId === item.id}
              />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={styles.emptyContainer}>
            등록된 영상제작 포트폴리오가 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    paddingBottom: '80px',
  },
  headerSection: {
    padding: '80px 0 40px 0',
  },
  headerInner: {
    textAlign: 'left',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '3.2rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    marginBottom: '16px',
    letterSpacing: '-0.03em',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    fontWeight: 400,
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    width: '100%',
  },
  emptyContainer: {
    padding: '100px 0',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .recommend-title {
        font-size: 2.5rem !important;
      }
      .recommend-subtitle {
        font-size: 0.95rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}
