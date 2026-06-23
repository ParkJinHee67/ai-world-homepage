import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, mapNewsItem } from '../supabaseClient';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Link2, Share2, Check, X, Newspaper } from 'lucide-react';

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

export default function AINews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchParams] = useSearchParams();
  const newsId = searchParams.get('id');
  const [copiedId, setCopiedId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const topRef = useRef(null);

  useEffect(() => {
    async function loadNews() {
      try {
        const { data, error } = await db.getNews();
        if (error) throw error;
        if (data) {
          const parsedNews = data.map(mapNewsItem);
          setNews(parsedNews);
          
          // If query param 'id' matches a news article, open it immediately
          if (newsId) {
            const matched = parsedNews.find(x => x.id === newsId);
            if (matched) {
              setSelectedNews(matched);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load AI news:', e);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, [newsId]);

  const handleCopyLink = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/ai-news?id=${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
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
        <div style={styles.headerInner}>
          <h1 className="news-title" style={styles.title}>Daily AI News</h1>
          <p className="news-subtitle" style={styles.subtitle}>
            인공지능 모델 및 플랫폼 트렌드를 실시간 수집 및 요약하여 전달합니다.<br className="desktop-br" />
            카드를 클릭하시면 상세 분석 리포트를 확인하실 수 있습니다.
          </p>
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
                        {item.createdAt}
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

            {/* Metadata */}
            <div style={styles.popupMeta}>
              <span style={styles.popupReportBadge}>AI NEWS REPORT</span>
              <span style={styles.popupMetaDivider}>•</span>
              <span style={styles.popupDate}>
                <Calendar size={12} style={{ marginRight: '6px' }} />
                {selectedNews.createdAt}
              </span>
            </div>

            {/* Title */}
            <h2 className="news-popup-title" style={styles.popupTitle}>{selectedNews.title}</h2>

            {/* Markdown Scrollable Body */}
            <div style={styles.popupBody}>
              <div style={styles.popupBodyInner}>
                {renderMarkdown(selectedNews.content)}
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={styles.popupFooter}>
              {selectedNews.sourceUrl ? (
                <a
                  href={selectedNews.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.sourceLink}
                  title="출처 원문 바로가기"
                >
                  <Link2 size={13} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedNews.sourceUrl}
                  </span>
                </a>
              ) : <div />}

              <div style={styles.popupFooterActions}>
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
                      <Check size={13} />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={13} />
                      <span>링크 복사</span>
                    </>
                  )}
                </button>
                <button onClick={() => setSelectedNews(null)} className="news-popup-close-action-btn" style={styles.popupCloseActionBtn}>
                  닫기
                </button>
                {selectedNews.sourceUrl && (
                  <a
                    href={selectedNews.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-popup-source-action-btn"
                    style={styles.popupSourceActionBtn}
                  >
                    <span>원문 출처 바로가기</span>
                  </a>
                )}
              </div>
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
    padding: '80px 0 40px 0',
  },
  headerInner: {
    textAlign: 'left',
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
    background: '#0a0914',
    marginBottom: '16px',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.75s ease',
  },
  cardImageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(3, 2, 7, 0.8) 0%, transparent 80%)',
    opacity: 0.6,
  },
  cardBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: 10,
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
    marginBottom: '10px',
  },
  cardDate: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  shareBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-fast)',
  },
  shareBtnCopied: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#6ee7b7',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.4,
    marginBottom: '8px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
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
  // Pagination
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '48px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  desktopPagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pagerBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    padding: '10px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-fast)',
  },
  pagerNumBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    minWidth: '40px',
    height: '40px',
    padding: '0 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  pagerNumBtnActive: {
    background: 'var(--accent-rose)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(244, 63, 94, 0.25)',
  },
  mobilePagination: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '300px',
    padding: '0 8px',
  },
  mobilePageBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  mobilePageIndicator: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  // Popup Detail Modal
  popupOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(2, 1, 5, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  popupContent: {
    position: 'relative',
    width: '100%',
    maxWidth: '768px',
    background: '#0d0b16',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '24px',
  },
  popupCloseBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    borderRadius: '50%',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    zIndex: 50,
    transition: 'color 0.2s ease',
  },
  popupBannerContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '21/9',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#0a0914',
    marginBottom: '20px',
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  popupBanner: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  popupBannerOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, #0d0b16 0%, transparent 90%)',
  },
  popupMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    flexShrink: 0,
  },
  popupReportBadge: {
    fontSize: '0.65rem',
    fontWeight: 800,
    color: 'var(--accent-rose)',
    border: '1px solid rgba(244, 63, 94, 0.25)',
    background: 'rgba(244, 63, 94, 0.08)',
    padding: '3px 8px',
    borderRadius: '6px',
    letterSpacing: '0.05em',
  },
  popupMetaDivider: {
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: '0.8rem',
  },
  popupDate: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  popupTitle: {
    fontSize: '1.6rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    flexShrink: 0,
  },
  popupBody: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '24px',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '20px',
    scrollbarWidth: 'thin',
  },
  popupBodyInner: {
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: '#cbd5e1',
  },
  popupFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  sourceLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    maxWidth: '280px',
  },
  popupFooterActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: 'auto',
  },
  popupActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  popupActionBtnCopied: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#6ee7b7',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  popupCloseActionBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  popupSourceActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--accent-rose)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 750,
    boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)',
    border: '1px solid rgba(244, 63, 94, 0.25)',
    transition: 'var(--transition-fast)',
  },
  // Markdown Render Styles
  markdownH1: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'white',
    marginTop: '24px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  markdownH2: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'white',
    marginTop: '20px',
    marginBottom: '10px',
  },
  markdownH3: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--accent-rose)',
    marginTop: '16px',
    marginBottom: '8px',
  },
  markdownHr: {
    border: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    margin: '20px 0',
  },
  markdownPara: {
    fontSize: '0.85rem',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    marginBottom: '10px',
  },
  pinContainer: {
    background: 'rgba(244, 63, 94, 0.04)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    padding: '14px 16px',
    borderRadius: '12px',
    margin: '16px 0',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  pinIcon: {
    fontSize: '1.1rem',
    lineHeight: 1,
    flexShrink: 0,
    marginTop: '2px',
  },
  pinText: {
    fontWeight: 600,
    fontSize: '0.85rem',
    lineHeight: 1.5,
    color: '#e2e8f0',
  },
  contentLink: {
    color: '#fda4af',
    textDecoration: 'underline',
    fontWeight: 650,
  }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .item-card.cat-news:hover {
      border-color: rgba(244, 63, 94, 0.3) !important;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 30px -10px rgba(244, 63, 94, 0.15) !important;
    }
    .item-card.cat-news:hover img {
      transform: scale(1.03);
    }
    .pager-btn:hover:not(:disabled) {
      color: white !important;
      background: rgba(255, 255, 255, 0.07) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }
    .news-popup-source-action-btn:hover {
      background-color: #e11d48 !important;
      transform: translateY(-1px);
    }
    .news-popup-close-action-btn:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
      color: white !important;
    }
    .news-popup-action-btn:hover:not(.copied) {
      background-color: rgba(255, 255, 255, 0.08) !important;
      color: white !important;
    }
    .popup-markdown-link:hover {
      color: var(--accent-rose) !important;
    }
    @media (max-width: 768px) {
      .news-title {
        font-size: 2.5rem !important;
      }
      .news-subtitle {
        font-size: 0.95rem !important;
      }
      .news-desktop-pagination {
        display: none !important;
      }
      .news-mobile-pagination {
        display: flex !important;
      }
      .news-popup-content {
        padding: 16px !important;
        max-height: 95vh !important;
      }
      .news-popup-title {
        font-size: 1.25rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}
