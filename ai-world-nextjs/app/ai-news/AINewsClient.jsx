"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Link2, Share2, Check, X } from 'lucide-react';
import { formatKSTDate, db, mapNewsItem } from '../supabaseClient';

// Custom lightweight Markdown/Rich text Parser
const parseRichText = (text) => {
  if (!text) return null;
  
  // 1. Parse Links: [Text](URL)
  let elements = [text];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  
  for (;;) {
    let newElements = [];
    let found = false;
    for (let el of elements) {
      if (typeof el !== 'string') {
        newElements.push(el);
        continue;
      }
      const match = el.match(linkRegex);
      if (match && match.index !== undefined) {
        found = true;
        const prefix = el.substring(0, match.index);
        const linkText = match[1];
        const linkUrl = match[2];
        const suffix = el.substring(match.index + match[0].length);
        
        if (prefix) newElements.push(prefix);
        newElements.push(
          <a
            key={linkUrl + match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contentLink}
            className="popup-markdown-link"
          >
            {linkText}
          </a>
        );
        if (suffix) newElements.push(suffix);
      } else {
        newElements.push(el);
      }
    }
    elements = newElements;
    if (!found) break;
  }

  // 2. Parse Bold: **Text**
  const boldRegex = /\*\*([^*]+)\*\*/;
  for (;;) {
    let newElements = [];
    let found = false;
    for (let el of elements) {
      if (typeof el !== 'string') {
        newElements.push(el);
        continue;
      }
      const match = el.match(boldRegex);
      if (match && match.index !== undefined) {
        found = true;
        const prefix = el.substring(0, match.index);
        const boldText = match[1];
        const suffix = el.substring(match.index + match[0].length);
        
        if (prefix) newElements.push(prefix);
        newElements.push(
          <strong key={boldText + match.index} style={{ fontWeight: 800, color: 'white' }}>
            {boldText}
          </strong>
        );
        if (suffix) newElements.push(suffix);
      } else {
        newElements.push(el);
      }
    }
    elements = newElements;
    if (!found) break;
  }

  return <>{elements}</>;
};

// Render full markdown text line by line
const renderMarkdown = (content) => {
  if (!content) return null;
  return content.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    
    if (trimmed === '---' || trimmed === '***') {
      return <hr key={idx} style={styles.markdownHr} />;
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={idx} style={styles.markdownH1}>
          {parseRichText(trimmed.slice(2))}
        </h1>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} style={styles.markdownH2}>
          {parseRichText(trimmed.slice(3))}
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} style={styles.markdownH3}>
          {parseRichText(trimmed.slice(4))}
        </h3>
      );
    }
    if (trimmed.startsWith('📌')) {
      return (
        <div key={idx} style={styles.pinContainer}>
          <span style={styles.pinIcon}>📌</span>
          <div style={styles.pinText}>
            {parseRichText(trimmed.slice(2).trim())}
          </div>
        </div>
      );
    }
    if (trimmed === '') {
      return <div key={idx} style={{ height: '12px' }} />;
    }
    return (
      <p key={idx} style={styles.markdownPara}>
        {parseRichText(line)}
      </p>
    );
  });
};

const PlexusCanvas = () => {
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
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      width = w;
      height = h;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Particle settings
    const numParticles = 90;
    const radius = 115;
    const particles = [];
    
    // Fibonacci sphere distribution for uniform points
    for (let i = 0; i < numParticles; i++) {
      const phi = Math.acos(-1 + (2 * i) / numParticles);
      const theta = Math.sqrt(numParticles * Math.PI) * phi;
      
      particles.push({
        ox: radius * Math.sin(phi) * Math.cos(theta),
        oy: radius * Math.sin(phi) * Math.sin(theta),
        oz: radius * Math.cos(phi),
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02
      });
    }
    
    const angleX = 0.0015;
    const angleY = 0.0025;
    const fov = 350;
    
    // Mouse tracking
    let mouse = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height / 2;
      mouse.targetX = mx;
      mouse.targetY = my;
    };
    
    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      
      // Interpolate mouse coordinates
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.05;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.05;
      
      // Calculate rotation step based on auto-rotation + mouse velocity
      const rx = angleX + mouse.currentY * 0.0002;
      const ry = angleY - mouse.currentX * 0.0002;
      
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      
      const projected = [];
      
      // 3D rotation and projection
      for (let p of particles) {
        // Apply rotation
        // Rotate X
        let y1 = p.oy * cosX - p.oz * sinX;
        let z1 = p.oz * cosX + p.oy * sinX;
        
        // Rotate Y
        let x2 = p.ox * cosY - z1 * sinY;
        let z2 = z1 * cosY + p.ox * sinY;
        
        // Update original coordinate for continuous animation
        p.ox = x2;
        p.oy = y1;
        p.oz = z2;
        
        // Depth scale
        const scale = fov / (fov + z2);
        
        // 2D projection
        const px = x2 * scale + cx;
        const py = y1 * scale + cy;
        
        projected.push({ x: px, y: py, z: z2, scale });
      }
      
      // Draw connection lines
      ctx.lineWidth = 0.45;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        let connections = 0;
        
        // Connect to nearest particles
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          
          if (dist < 46 && connections < 4) {
            connections++;
            // Alpha changes based on depth
            const avgDepth = (p1.z + p2.z) / 2;
            const alpha = Math.max(0.04, Math.min(0.24, (115 - avgDepth) / 230));
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      // Draw nodes
      for (let p of projected) {
        // Node size changes based on depth
        const radius = Math.max(1, Math.min(3, 1.8 * p.scale));
        const alpha = Math.max(0.1, Math.min(0.7, (115 - p.z) / 230));
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="news-header-canvas"
      style={styles.headerCanvas}
    />
  );
};

export default function AINewsClient({ initialNews, highlightId }) {
  const [news, setNews] = useState(initialNews);
  const [loading, setLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  // Sync edits/caching dynamically from server
  useEffect(() => {
    async function loadNews() {
      try {
        const { data, error } = await db.getNews();
        if (error) throw error;
        if (data) {
          setNews(data.map(mapNewsItem));
        }
      } catch (e) {
        console.error('Failed to load news:', e);
      }
    }
    loadNews();
  }, []);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const topRef = useRef(null);

  // Sync details open if query param highlightId matches
  useEffect(() => {
    let hId = highlightId;
    if (!hId && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      hId = params.get('id');
    }
    if (hId && news.length > 0) {
      const matched = news.find(x => x.id === hId);
      if (matched) {
        setSelectedNews(matched);
      }
    }
  }, [highlightId, news]);

  // Keep body overflow clean when modal is open
  useEffect(() => {
    if (selectedNews) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedNews]);

  const handleCopyLink = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/ai-news?id=${id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(news.length / itemsPerPage);
  const paginatedNews = news.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start + 1 < 5) {
      start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={styles.container}>
      <div ref={topRef} style={{ scrollMarginTop: '100px' }} />
      
      {/* Header */}
      <section className="container-max" style={styles.headerSection}>
        <div className="news-header-flex" style={styles.headerFlexContainer}>
          <div style={styles.headerInner}>
            <h1 className="news-title" style={styles.title}>Daily AI News</h1>
            <p className="news-subtitle" style={styles.subtitle}>
              인공지능 모델 및 플랫폼 트렌드를 실시간 수집 및 요약하여 전달합니다.<br className="desktop-br" />
              카드를 클릭하시면 상세 분석 리포트를 확인하실 수 있습니다.
            </p>
          </div>
          <div className="news-header-img-container" style={styles.headerImageContainer}>
            <PlexusCanvas />
            <div style={styles.glowBg1} />
            <div style={styles.glowBg2} />
          </div>
        </div>
      </section>

      {/* Grid List */}
      <section className="container-max" style={styles.gridSection}>
        {loading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner rose" />
          </div>
        ) : (
          <>
            <div className="grid-container">
              {paginatedNews.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="item-card cat-news"
                  style={styles.newsCard}
                >
                  {/* Thumbnail Image */}
                  <div style={styles.cardImageContainer}>
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop'}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop';
                      }}
                      style={styles.cardImage}
                    />
                    <div style={styles.cardImageOverlay} />
                    <span className="badge news" style={styles.cardBadge}>AI NEWS</span>
                  </div>

                  {/* Metadata and Content */}
                  <div style={styles.cardContent}>
                    <div style={styles.cardMeta}>
                      <span style={styles.cardDate}>
                        <Calendar size={11} style={{ marginRight: '5px' }} />
                        {formatKSTDate(item.createdAt)}
                      </span>
                      <button
                        onClick={(e) => handleCopyLink(e, item.id)}
                        style={{
                          ...styles.shareBtn,
                          ...(copiedId === item.id ? styles.shareBtnCopied : {})
                        }}
                        title="공유 링크 복사"
                      >
                        {copiedId === item.id ? <Check size={11} /> : <Share2 size={11} />}
                      </button>
                    </div>

                    <h3 style={styles.cardTitle}>{item.title}</h3>
                    <p style={styles.cardDesc}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <div className="news-desktop-pagination" style={styles.desktopPagination}>
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    style={styles.pagerBtn}
                    title="첫 페이지"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={styles.pagerBtn}
                    title="이전 페이지"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {getPageNumbers().map(num => (
                    <button
                      key={num}
                      onClick={() => handlePageChange(num)}
                      style={{
                        ...styles.pagerNumBtn,
                        ...(currentPage === num ? styles.pagerNumBtnActive : {})
                      }}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={styles.pagerBtn}
                    title="다음 페이지"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    style={styles.pagerBtn}
                    title="마지막 페이지"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>

                <div className="news-mobile-pagination" style={styles.mobilePagination}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={styles.mobilePageBtn}
                  >
                    <ChevronLeft size={14} style={{ marginRight: '4px' }} />
                    이전
                  </button>
                  <span style={styles.mobilePageIndicator}>
                    <span style={{ color: 'var(--accent-rose)', fontWeight: 800 }}>{currentPage}</span> / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={styles.mobilePageBtn}
                  >
                    다음
                    <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && news.length === 0 && (
          <div style={styles.emptyContainer}>
            등록된 AI 뉴스가 없습니다.
          </div>
        )}
      </section>

      {/* Details Popup Modal */}
      {selectedNews && (
        <div style={styles.popupOverlay} onClick={() => setSelectedNews(null)}>
          <div className="news-popup-content" style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button onClick={() => setSelectedNews(null)} style={styles.popupCloseBtn}>
              <X size={18} />
            </button>

            {/* Banner Image */}
            {selectedNews.imageUrl && (
              <div style={styles.popupBannerContainer}>
                <img 
                  src={selectedNews.imageUrl} 
                  alt={selectedNews.title} 
                  onError={(e) => e.target.style.display='none'}
                  style={styles.popupBanner}
                />
                <div style={styles.popupBannerOverlay} />
              </div>
            )}

            {/* Content Details */}
            <div style={styles.popupInnerContent}>
              <div style={styles.popupMeta}>
                <Calendar size={13} style={{ marginRight: '6px' }} />
                <span>
                  {formatKSTDate(selectedNews.createdAt)}
                </span>
              </div>

              <h2 className="news-popup-title" style={styles.popupTitle}>{selectedNews.title}</h2>
              
              <div style={styles.popupDivider} />
              
              <div style={styles.popupMarkdownBody}>
                {renderMarkdown(selectedNews.content)}
              </div>

              {/* Action Buttons */}
              <div style={styles.popupActions}>
                {selectedNews.sourceUrl ? (
                  <a
                    href={selectedNews.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-popup-source-action-btn"
                    style={styles.popupSourceBtn}
                  >
                    <Link2 size={14} style={{ marginRight: '6px' }} />
                    원문 출처 방문
                  </a>
                ) : null}
                
                <button
                  onClick={(e) => handleCopyLink(e, selectedNews.id)}
                  className={`news-popup-action-btn ${copiedId === selectedNews.id ? 'copied' : ''}`}
                  style={{
                    ...styles.popupActionBtn,
                    ...(copiedId === selectedNews.id ? styles.popupActionBtnCopied : {})
                  }}
                >
                  {copiedId === selectedNews.id ? (
                    <>
                      <Check size={14} style={{ marginRight: '6px' }} />
                      링크 복사 완료
                    </>
                  ) : (
                    <>
                      <Share2 size={14} style={{ marginRight: '6px' }} />
                      기사 공유하기
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedNews(null)}
                  className="news-popup-close-action-btn"
                  style={styles.popupCloseActionBtn}
                >
                  닫기
                </button>
              </div>

              {selectedNews.sourceUrl && (
                <div style={styles.sourceFooter}>
                  <strong>출처 URL:</strong>{' '}
                  <a
                    href={selectedNews.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.sourceFooterLink}
                  >
                    {selectedNews.sourceUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    paddingBottom: '80px',
  },
  headerSection: {
    padding: '90px 0 40px 0',
  },
  headerFlexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '40px',
  },
  headerInner: {
    flex: 1.2,
  },
  title: {
    fontSize: '3.6rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
  },
  headerImageContainer: {
    position: 'relative',
    width: '380px',
    height: '380px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8,
  },
  headerCanvas: {
    width: '100%',
    height: '100%',
    zIndex: 2,
    position: 'relative',
    cursor: 'pointer',
  },
  glowBg1: {
    position: 'absolute',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(244, 63, 94, 0.08) 0%, transparent 70%)',
    top: '50px',
    left: '50px',
    zIndex: 1,
    pointerEvents: 'none',
  },
  glowBg2: {
    position: 'absolute',
    width: '240px',
    height: '240px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
    top: '70px',
    left: '70px',
    zIndex: 1,
    pointerEvents: 'none',
  },
  gridSection: {
    marginTop: '20px',
  },
  newsCard: {
    cursor: 'pointer',
  },
  cardImageContainer: {
    position: 'relative',
    height: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#04030a',
    marginBottom: '16px',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  cardImageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(3, 2, 7, 0.75) 0%, transparent 60%)',
  },
  cardBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: 5,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardDate: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  shareBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    transition: 'var(--transition-fast)',
  },
  shareBtnCopied: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#6ee7b7',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
    lineHeight: 1.4,
  },
  cardDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '50px',
    width: '100%',
  },
  desktopPagination: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '6px 12px',
    borderRadius: '12px',
  },
  pagerBtn: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-muted)',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    '&:disabled': {
      opacity: 0.3,
      cursor: 'not-allowed',
    }
  },
  pagerNumBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  pagerNumBtnActive: {
    background: 'rgba(244, 63, 94, 0.12)',
    color: '#fda4af',
    border: '1px solid rgba(244, 63, 94, 0.25)',
  },
  mobilePagination: {
    display: 'none',
    alignItems: 'center',
    gap: '16px',
  },
  mobilePageBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  mobilePageIndicator: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
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
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(2, 1, 5, 0.82)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '24px 16px',
  },
  popupContent: {
    position: 'relative',
    width: '100%',
    maxWidth: '720px',
    background: 'rgba(12, 10, 24, 0.96)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px -5px rgba(244, 63, 94, 0.1)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'popup-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  popupCloseBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: 'var(--text-secondary)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    transition: 'var(--transition-fast)',
  },
  popupBannerContainer: {
    position: 'relative',
    height: '240px',
    width: '100%',
    background: '#040308',
    flexShrink: 0,
  },
  popupBanner: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  popupBannerOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(12, 10, 24, 1) 0%, rgba(12, 10, 24, 0.6) 50%, transparent 100%)',
  },
  popupInnerContent: {
    padding: '24px 32px 32px 32px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  popupMeta: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.78rem',
    color: '#fda4af',
    fontWeight: 650,
    marginBottom: '12px',
  },
  popupTitle: {
    fontSize: '1.65rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
    marginBottom: '16px',
  },
  popupDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, rgba(244,63,94,0.3) 0%, rgba(255,255,255,0.05) 100%)',
    marginBottom: '24px',
  },
  popupMarkdownBody: {
    fontSize: '0.92rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.75,
  },
  popupActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '36px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  popupSourceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#e11d48',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 700,
    transition: 'var(--transition-fast)',
    boxShadow: '0 4px 15px rgba(225, 29, 72, 0.25)',
  },
  popupActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '9px 19px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  popupActionBtnCopied: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#6ee7b7',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  popupCloseActionBtn: {
    marginLeft: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '9px 19px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  sourceFooter: {
    marginTop: '24px',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    wordBreak: 'break-all',
  },
  sourceFooterLink: {
    color: 'var(--accent-rose)',
    textDecoration: 'underline',
  },
  
  // Markdown style definitions
  markdownH1: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginTop: '24px',
    marginBottom: '12px',
  },
  markdownH2: {
    fontSize: '1.2rem',
    fontWeight: 750,
    color: 'var(--text-primary)',
    marginTop: '20px',
    marginBottom: '10px',
  },
  markdownH3: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginTop: '16px',
    marginBottom: '8px',
  },
  markdownPara: {
    marginBottom: '12px',
  },
  markdownHr: {
    border: 'none',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '24px 0',
  },
  contentLink: {
    color: '#fda4af',
    textDecoration: 'underline',
    fontWeight: 600,
  },
  pinContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    background: 'rgba(244, 63, 94, 0.03)',
    border: '1px solid rgba(244, 63, 94, 0.08)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '12px',
  },
  pinIcon: {
    fontSize: '1rem',
    lineHeight: 1.4,
  },
  pinText: {
    flex: 1,
    fontSize: '0.88rem',
    color: '#fda4af',
    fontWeight: 500,
  }
};
