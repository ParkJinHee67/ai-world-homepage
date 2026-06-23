import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, mapPortfolioItem } from '../supabaseClient';
import PortfolioCard from '../components/PortfolioCard';
import { Lightbulb } from 'lucide-react';

export default function Insights() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const [highlightCardId, setHighlightCardId] = useState(null);

  useEffect(() => {
    async function loadInsights() {
      try {
        const { data, error } = await db.getPortfolio();
        if (error) throw error;
        if (data) {
          const mapped = data.map(mapPortfolioItem);
          const filtered = mapped.filter(x => x.category === 'Insight');
          setItems(filtered);
        }
      } catch (e) {
        console.error('Failed to load insights:', e);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
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
            <Lightbulb size={24} color="var(--accent-amber)" />
          </div>
          <h1 className="insights-title" style={styles.title}>AI Insights</h1>
          <p className="insights-subtitle" style={styles.subtitle}>
            인공지능 트렌드, 프롬프트 엔지니어링 팁, 그리고 AI 자동화 구축 전략을 심도 있게 탐구합니다.
          </p>
        </div>
      </section>

      <section className="container-max">
        {loading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-amber)' }} />
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
            등록된 인사이트 리포트가 없습니다.
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
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
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
      .insights-title {
        font-size: 2.5rem !important;
      }
      .insights-subtitle {
        font-size: 0.95rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}
