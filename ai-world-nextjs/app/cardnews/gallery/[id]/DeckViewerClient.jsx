"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Calendar, Trash2, ShieldAlert } from 'lucide-react';

export default function DeckViewerClient({ deckId, initialDeck }) {
  const router = useRouter();
  const [deck, setDeck] = useState(initialDeck);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 터치 스와이프 제스처 관련 상태
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // 마운트 시 조회수 증가 및 로컬 목 상태 보정
  useEffect(() => {
    // 1. Mock 환경에서 새로 발행한 덱이 로컬 스토리지에 있으면 가져옴
    let isMock = false;
    try {
      const mockDecks = JSON.parse(localStorage.getItem('mock_cardnews_decks') || '[]');
      const foundMock = mockDecks.find(d => d.id === deckId);
      if (foundMock) {
        setDeck(foundMock);
        isMock = true;
        
        // Mock 조회수 증가
        foundMock.view_count = (foundMock.view_count || 0) + 1;
        const updated = mockDecks.map(d => d.id === deckId ? foundMock : d);
        localStorage.setItem('mock_cardnews_decks', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to resolve mock deck on mount:', e);
    }

    // 2. 서버 DB에 조회수 증가 API 호출
    if (!isMock) {
      fetch('/api/cardnews/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'increment_view',
          password: 'aimax123', // 조회수 증가용 더미 패스워드 (서버 API는 이 액션에 대해 RLS 우회로 처리)
          deckId: deckId
        })
      }).catch(err => console.warn('Failed to increment view count:', err));
    }
  }, [deckId]);

  if (!deck) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>⚠️ 카드뉴스를 찾을 수 없습니다</h2>
          <p style={{ color: '#aab4c8', marginBottom: '24px' }}>존재하지 않는 덱이거나 삭제 처리되었을 수 있습니다.</p>
          <Link href="/cardnews/gallery" style={styles.btnSecondary}>
            <ArrowLeft size={16} /> 갤러리로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const imageUrls = deck.image_urls || [];

  // 좌우 캐러셀 이동 핸들러
  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };
  const handleNext = () => {
    if (activeIndex < imageUrls.length - 1) setActiveIndex(activeIndex + 1);
  };

  // 모바일 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeIndex < imageUrls.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
    if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // 삭제 처리 핸들러
  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      setDeleteStatus('비밀번호를 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    setDeleteStatus('삭제 진행 중...');

    try {
      // 1. API를 찔러 서버/스토리지 삭제 시도
      const res = await fetch('/api/cardnews/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_deck',
          password: deletePassword,
          deckId: deckId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '삭제 실패');

      // 2. 성공 시 로컬 Mock 스토리지 데이터도 정리
      try {
        const mockDecks = JSON.parse(localStorage.getItem('mock_cardnews_decks') || '[]');
        const filtered = mockDecks.filter(d => d.id !== deckId);
        localStorage.setItem('mock_cardnews_decks', JSON.stringify(filtered));
      } catch (e) {
        console.warn('Failed to clean mock local storage:', e);
      }

      setDeleteStatus('✅ 삭제되었습니다. 갤러리로 리다이렉트합니다.');
      setTimeout(() => {
        router.push('/cardnews/gallery');
      }, 1500);

    } catch (err) {
      setDeleteStatus('⚠️ 에러: ' + err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="container-max" style={styles.inner}>
        
        {/* Header Action Row */}
        <div style={styles.actionHeader}>
          <Link href="/cardnews/gallery" style={styles.backLink}>
            <ArrowLeft size={16} /> 갤러리 목록으로
          </Link>
          <button onClick={() => setShowDeleteModal(true)} style={styles.deleteBtn} title="발행물 삭제">
            <Trash2 size={16} /> 삭제하기
          </button>
        </div>

        {/* Title Meta Section */}
        <div style={styles.titleSection}>
          <h1 style={styles.deckTitle}>{deck.title}</h1>
          {deck.description && <p style={styles.deckDesc}>{deck.description}</p>}
          <div style={styles.metaRow}>
            <span style={styles.metaItem}><Eye size={14} /> {deck.view_count || 0}</span>
            <span style={styles.metaItem}><Calendar size={14} /> {new Date(deck.created_at).toLocaleDateString()}</span>
            <span style={{ ...styles.metaItem, textTransform: 'uppercase', color: '#818cf8', fontWeight: '700' }}>
              style: {deck.style}
            </span>
          </div>
        </div>

        {/* Carousel Presentation Screen */}
        <div style={styles.carouselContainer}>
          
          {/* Left Arrow (Desktop only) */}
          <button 
            onClick={handlePrev} 
            disabled={activeIndex === 0}
            style={{ ...styles.arrowBtn, left: '-60px', opacity: activeIndex === 0 ? 0.2 : 0.8 }}
            className="carousel-desktop-arrow"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Card Wrapper (aspect-ratio 4:5) */}
          <div 
            style={styles.cardFrame}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageUrls.length > 0 ? (
              <img 
                src={imageUrls[activeIndex]} 
                alt={`${deck.title} - 카드 ${activeIndex + 1}`}
                style={styles.cardImg}
              />
            ) : (
              <div style={styles.noCardPlaceholder}>불러온 이미지가 없습니다.</div>
            )}
          </div>

          {/* Right Arrow (Desktop only) */}
          <button 
            onClick={handleNext} 
            disabled={activeIndex === imageUrls.length - 1}
            style={{ ...styles.arrowBtn, right: '-60px', opacity: activeIndex === imageUrls.length - 1 ? 0.2 : 0.8 }}
            className="carousel-desktop-arrow"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Indicators & Counter */}
        <div style={styles.indicatorContainer}>
          <span style={styles.counterText}>{activeIndex + 1} / {imageUrls.length}</span>
          <div style={styles.dotList}>
            {imageUrls.map((_, i) => (
              <span 
                key={i} 
                onClick={() => setActiveIndex(i)}
                style={{ 
                  ...styles.dot, 
                  backgroundColor: i === activeIndex ? '#6366f1' : 'rgba(255,255,255,0.2)',
                  width: i === activeIndex ? '20px' : '8px',
                  borderRadius: i === activeIndex ? '4px' : '50%'
                }}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff3b30' }}>
                <ShieldAlert size={18} /> 발행물 삭제 인증
              </h3>
              <span onClick={() => setShowDeleteModal(false)} style={{ cursor: 'pointer', color: '#6b7684', fontWeight: '700' }}>✕</span>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#5b6577', lineHeight: '1.5' }}>
                발행물을 삭제하려면 에디터 발행 시 사용했던 **발행 승인 비밀번호**를 입력해야 합니다.<br />
                삭제 시 DB와 Storage의 백업 이미지 파일들이 모두 영구 삭제되며, 복구할 수 없습니다.
              </p>
              <input 
                type="password" 
                placeholder="비밀번호 입력"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={styles.modalInput}
              />
              {deleteStatus && (
                <p style={{ 
                  margin: '10px 0 0', 
                  fontSize: '12.5px', 
                  color: deleteStatus.startsWith('✅') ? '#10b981' : '#ef4444',
                  fontWeight: '600'
                }}>
                  {deleteStatus}
                </p>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} style={styles.btnSecondaryModal}>취소</button>
              <button onClick={handleDelete} disabled={isDeleting} style={styles.btnDangerModal}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#030207',
    color: '#f3f5fa',
    minHeight: '100vh',
    width: '100%',
    padding: '30px 20px 80px',
    fontFamily: "'Pretendard', sans-serif",
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionHeader: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  backLink: {
    color: '#818cf8',
    textDecoration: 'none',
    fontSize: '13.5px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ff4d4f',
    fontSize: '13.5px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '30px',
    width: '100%',
    maxWidth: '600px',
  },
  deckTitle: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '10px',
    lineHeight: '1.4',
    color: '#ffffff',
  },
  deckDesc: {
    fontSize: '14.5px',
    color: '#aab4c8',
    marginBottom: '14px',
    lineHeight: '1.5',
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#6b7684',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  carouselContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '432px', // 1080x1350 스케일 축소
    aspectRatio: '1080/1350',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFrame: {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
    backgroundColor: '#0c0f16',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  noCardPlaceholder: {
    display: 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7684',
  },
  arrowBtn: {
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '50%',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'background-color 0.2s',
  },
  indicatorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  counterText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#6b7684',
  },
  dotList: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: '8px',
    cursor: 'pointer',
    transition: 'width 0.25s, background-color 0.25s',
  },
  errorBox: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#121118',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    maxWidth: '400px',
    width: '100%',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '13.5px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    color: '#1a2233',
    width: '100%',
    maxWidth: '400px',
    borderRadius: '14px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e3e7ee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc',
  },
  modalInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e3e7ee',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    background: '#fff',
    color: '#1a2233',
  },
  modalFooter: {
    padding: '14px 20px',
    borderTop: '1px solid #e3e7ee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    background: '#f8fafc',
  },
  btnSecondaryModal: {
    backgroundColor: '#f1f3f8',
    color: '#1a2233',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDangerModal: {
    backgroundColor: '#ff4d4f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  }
};
