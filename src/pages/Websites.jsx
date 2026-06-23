import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, mapPortfolioItem } from '../supabaseClient';
import PortfolioCard from '../components/PortfolioCard';
import { Layout } from 'lucide-react';

export default function Websites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const [highlightCardId, setHighlightCardId] = useState(null);

  useEffect(() => {
    async function loadWebsites() {
      try {
        const { data, error } = await db.getPortfolio();
        if (error) throw error;
        if (data) {
          const mapped = data.map(mapPortfolioItem);
          const filtered = mapped.filter(x => x.category === 'App');
          setItems(filtered);
        }
      } catch (e) {
        console.error('Failed to load websites:', e);
      } finally {
        setLoading(false);
      }
    }
    loadWebsites();
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
            <Layout size={24} color="var(--accent-indigo)" />
          </div>
          <h1 style={styles.title}>홈페이지 포트폴리오</h1>
          <p style={styles.subtitle}>
            비즈니스 역량을 한 단계 끌어올리는 혁신적인 맞춤형 홈페이지 및 차세대 웹 솔루션 리스트입니다.
          </p>
        </div>
      </section>

      <section className="container-max">
        {loading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-indigo)' }} />
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
            등록된 홈페이지 서비스가 없습니다.
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
    padding: '60px 0 40px 0',
  },
  headerInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '30px',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(99, 102, 241, 0.1)',
    marginBottom: '16px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 850,
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    maxWidth: '700px',
    lineHeight: 1.6,
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  emptyContainer: {
    padding: '80px 0',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
};
