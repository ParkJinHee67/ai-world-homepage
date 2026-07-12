"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../supabaseClient';
import { Download, Mail, User, CheckCircle, ArrowLeft, Loader2, Sparkles, Image as ImageIcon, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function ResourceCard({ image, openDownloadModal }) {
  const [imageSrc, setImageSrc] = useState(image.file_content || image.fileContent || image.filePath || '');
  const [loadingImg, setLoadingImg] = useState(!imageSrc);

  useEffect(() => {
    if (!imageSrc) {
      async function loadContent() {
        try {
          const { data, error } = await db.getResourceContent(image.id);
          if (error) throw error;
          if (data) {
            setImageSrc(data);
          }
        } catch (e) {
          console.error('Failed to load image for', image.title, e);
        } finally {
          setLoadingImg(false);
        }
      }
      loadContent();
    }
  }, [image.id, imageSrc]);

  return (
    <div style={styles.card} className="glass-panel">
      <div style={styles.cardPreviewContainer}>
        {loadingImg ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={24} className="spin-loader" style={{ color: 'var(--accent-indigo)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>이미지 불러오는 중...</span>
          </div>
        ) : (
          <Image src={imageSrc || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'} alt={image.title} fill sizes="(max-width: 768px) 100vw, 30vw" style={{ objectFit: 'cover' }} />
        )}
        <div style={styles.cardResBadge}>
          <ImageIcon size={12} />
          <span>{image.resolution}</span>
        </div>
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{image.title}</h3>
        <p style={styles.cardDesc}>{image.description}</p>
        <div style={styles.cardMeta}>
          <span>다운로드: <strong>{image.download_count || 0}회</strong></span>
          <span>파일 크기: <strong>{image.file_size || image.fileSize}</strong></span>
        </div>
        <button onClick={() => openDownloadModal({ ...image, file_content: imageSrc })} style={styles.downloadBtn}>
          <Download size={16} />
          <span>다운로드 신청하기</span>
        </button>
      </div>
    </div>
  );
}

export default function ImageDownloadClient({ initialResources, downloadId }) {
  const [resources, setResources] = useState(initialResources);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const hasDownloadedRef = useRef(false);

  const filteredResources = useMemo(() => {
    if (!searchTerm.trim()) return resources;
    return resources.filter(res => 
      (res.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, resources]);

  // Sync resources list on mount to get mock edits or fresh counts
  useEffect(() => {
    async function fetchResources() {
      try {
        const { data, error } = await db.getResources();
        if (error) throw error;
        if (data) {
          setResources(data);
          
          // Check if we need to auto-download based on query parameter
          if (downloadId && !hasDownloadedRef.current) {
            const image = data.find(r => r.id === downloadId);
            if (image) {
              hasDownloadedRef.current = true; // Set ref immediately to prevent subsequent runs
              
              // Fetch file content asynchronously for auto-download
              try {
                const { data: fileContent, error: dlError } = await db.getResourceContent(image.id);
                if (dlError) throw dlError;
                
                const link = document.createElement('a');
                link.href = fileContent || '';
                link.download = image.file_name || image.fileName || 'image.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } catch (dlErr) {
                console.error('Failed to auto-download:', dlErr);
                alert('이미지 파일 다운로드에 실패했습니다. 관리자에게 문의해 주세요.');
              }
              
              // Clear search parameters immediately to prevent download on page refresh
              if (typeof window !== 'undefined') {
                window.history.replaceState(null, '', window.location.pathname);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load downloadable resources:', err);
      }
    }
    fetchResources();
  }, [downloadId]);

  const openDownloadModal = (image) => {
    setSelectedImage(image);
    setName('');
    setEmail('');
    setErrorMsg('');
    setSubmitSuccess(false);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('이름 또는 닉네임을 입력해주세요.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Save lead to DB
      await db.saveLead({
        name,
        email,
        requestedImage: selectedImage.title
      });

      // 2. Increment download count in DB
      await db.incrementStat('downloads');
      await db.incrementResourceDownload(selectedImage.id);

      // 3. Trigger EmailJS API (if configured)
      const serviceId = process.env.NEXT_PUBLIC_VITE_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        try {
          // Generate a clean Web Link to download via query parameter
          const downloadUrl = window.location.origin + '/download?id=' + selectedImage.id;
          await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              service_id: serviceId,
              template_id: templateId,
              user_id: publicKey,
              template_params: {
                to_name: name,
                to_email: email,
                email: email, // Added for compatibility with template {{email}} setting
                image_name: selectedImage.title,
                download_link: downloadUrl
              }
            })
          });
        } catch (emailErr) {
          console.warn('Email sending failed, proceeding with direct download:', emailErr);
        }
      }

      setSubmitSuccess(true);

      // Trigger actual download in background immediately on submit success
      try {
        const link = document.createElement('a');
        link.href = selectedImage.file_content || selectedImage.fileContent || '';
        link.download = selectedImage.file_name || selectedImage.fileName || 'image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (dlErr) {
        console.error('Direct download failed:', dlErr);
      }

    } catch (err) {
      console.error('Download submission failed:', err);
      setErrorMsg('다운로드 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container} className="container-max">
      {/* Header Back Button */}
      <div style={styles.backWrapper}>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>메인 화면으로 가기</span>
        </Link>
      </div>

      {/* Main Intro */}
      <div style={styles.introHeader}>
        <div style={styles.badge}>
          <Sparkles size={12} style={{ color: 'var(--accent-purple)' }} />
          <span>MARKETING RESOURCE</span>
        </div>
        <h1 style={styles.title}>영상 주인공 이미지 리소스</h1>
        <p style={styles.subtitle}>
          영상 자동화 제작 및 유튜브, 카카오톡 홍보에 자유롭게 활용할 수 있는 고품질 디자인 템플릿입니다.<br />
          간단한 성함과 이메일 정보를 입력하시면 즉시 다운로드가 시작되고, 메일로도 평생 영구 보관용 링크를 발송해 드립니다.
        </p>
      </div>

      {/* Search Filter Bar */}
      {!loading && resources.length > 0 && (
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="주인공 이미지 제목 검색 (예: 철학, 건강, 노인...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              className="search-input-field"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={styles.clearSearchBtn}
                className="clear-search-btn"
                title="검색어 초기화"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Resource Grid / Loading / Empty States */}
      {loading ? (
        <div style={styles.loaderContainer}>
          <Loader2 size={36} className="spin-loader" style={{ color: 'var(--accent-indigo)' }} />
        </div>
      ) : filteredResources.length > 0 ? (
        <div style={styles.grid}>
          {filteredResources.map((image) => (
            <ResourceCard key={image.id} image={image} openDownloadModal={openDownloadModal} />
          ))}
        </div>
      ) : (
        <div style={styles.emptyContainer}>
          {searchTerm ? '검색어와 일치하는 주인공 이미지가 없습니다.' : '등록된 주인공 이미지 리소스가 없습니다. 관리자 대시보드에서 등록해 주세요.'}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedImage && (
        <div style={styles.modalOverlay} onClick={() => !isSubmitting && setShowModal(false)}>
          <div style={styles.modalContent} className="glass-panel" onClick={(e) => e.stopPropagation()}>
            {!submitSuccess ? (
              <>
                <h3 style={styles.modalTitle}>리소스 무료 다운로드 신청</h3>
                <p style={styles.modalSubtitle}>
                  선택하신 <strong>[{selectedImage.title}]</strong> 리소스 다운로드를 위해 아래 정보를 입력해 주세요.
                </p>

                <form onSubmit={handleFormSubmit} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>이름 / 닉네임</label>
                    <div style={styles.inputWrapper}>
                      <User size={16} style={styles.inputIcon} />
                      <input
                        type="text"
                        placeholder="홍길동"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>이메일 주소</label>
                    <div style={styles.inputWrapper}>
                      <Mail size={16} style={styles.inputIcon} />
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {errorMsg && <p style={styles.errorMsg}>{errorMsg}</p>}

                  <div style={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={styles.cancelBtn}
                      disabled={isSubmitting}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      style={styles.submitBtn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="spin-loader" />
                          <span>신청 처리 중...</span>
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          <span>이메일 전송 & 다운로드</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={styles.successWrapper}>
                <CheckCircle size={56} style={{ color: 'var(--accent-emerald)', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }} />
                <h3 style={styles.successTitle}>이메일 발송 완료!</h3>
                <p style={styles.successText}>
                  입력하신 이메일(<strong>{email}</strong>)로 다운로드 링크를 발송해 드렸습니다. 메일함(또는 스팸함)을 확인하여 다운로드해 주세요.
                </p>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedImage(null);
                    setSubmitSuccess(false);
                  }}
                  style={{ ...styles.submitBtn, marginTop: '24px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  확인
                </button>
              </div>
            )}
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
  backWrapper: {
    paddingTop: '32px',
    marginBottom: '24px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },
  introHeader: {
    textAlign: 'center',
    marginBottom: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '100px',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
    color: '#d8b4fe',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    marginBottom: '16px',
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: '720px',
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
    width: '100%',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '12px 16px 12px 44px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'var(--transition-fast)',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '16px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '32px',
    width: '100%',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '20px',
    overflow: 'hidden',
    height: '100%',
  },
  cardPreviewContainer: {
    position: 'relative',
    height: '220px',
    background: '#04030a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardResBadge: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'rgba(3, 2, 7, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-primary)',
    fontSize: '0.68rem',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '16px',
    flex: 1,
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginBottom: '20px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  downloadBtn: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-primary)',
    padding: '12px 0',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 650,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
    }
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
    fontSize: '0.9rem',
    width: '100%',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(2, 1, 5, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '440px',
    padding: '28px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  modalSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '11px 12px 11px 40px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    outline: 'none',
  },
  errorMsg: {
    color: 'var(--accent-rose)',
    fontSize: '0.8rem',
    marginBottom: '16px',
    fontWeight: 500,
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
  },
  cancelBtn: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    borderRadius: '10px',
    padding: '12px',
    fontWeight: 600,
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  submitBtn: {
    flex: 2,
    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
  },
  successWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 0',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginTop: '20px',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  }
};
