import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';

const Youtube = ({ size = 20, color = "currentColor", ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill={color} 
    {...props}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const extractYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function VideoModal({ urls, onClose }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Parse video URLs and fetch titles
    const parsedVideos = urls.map((url, index) => {
      const videoId = extractYoutubeId(url.trim());
      return {
        url: url.trim(),
        videoId,
        title: `영상 가이드 ${index + 1}`,
        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '',
        isLoading: true
      };
    });
    setVideos(parsedVideos);

    let isSubscribed = true;
    
    // Asynchronously fetch titles from noembed API
    Promise.all(
      parsedVideos.map(async (v, index) => {
        try {
          const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(v.url)}`);
          const data = await res.json();
          return {
            ...v,
            title: data.title || `영상 가이드 ${index + 1}`,
            thumbnail: data.thumbnail_url || v.thumbnail,
            isLoading: false
          };
        } catch (e) {
          return { ...v, isLoading: false };
        }
      })
    ).then((results) => {
      if (isSubscribed) {
        setVideos(results);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [urls]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Youtube size={20} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>유튜브 가이드 목록</h3>
            <span style={styles.countBadge}>{urls.length}개</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.listContainer}>
          {videos.map((video, idx) => (
            <a
              key={idx}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.videoItem}
              className="video-item-link"
            >
              <div style={styles.thumbnailContainer}>
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} style={styles.thumbnail} />
                ) : (
                  <div style={styles.thumbnailFallback}>
                    <Youtube size={24} color="var(--text-muted)" />
                  </div>
                )}
                <div className="play-overlay" style={styles.playOverlay}>
                  <div style={styles.playBtnInner}>
                    <Play size={12} fill="white" color="white" style={{ marginLeft: '2px' }} />
                  </div>
                </div>
              </div>

              <div style={styles.videoMeta}>
                {video.isLoading ? (
                  <div style={styles.skeleton}>
                    <div style={styles.skeletonBar} />
                    <div style={{ ...styles.skeletonBar, width: '50%', height: '8px' }} />
                  </div>
                ) : (
                  <>
                    <h4 style={styles.videoTitle}>{video.title}</h4>
                    <span style={styles.videoChannel}>
                      <Youtube size={10} style={{ marginRight: '4px' }} />
                      YouTube
                    </span>
                  </>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(2, 1, 5, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modalContent: {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
    background: '#0d0b16',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  countBadge: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    background: 'rgba(255, 255, 255, 0.06)',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    borderRadius: '50%',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    transition: 'color 0.2s ease',
  },
  listContainer: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  videoItem: {
    display: 'flex',
    gap: '16px',
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'all 0.3s ease',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '120px',
    height: '68px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#020104',
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbnailFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  playBtnInner: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--accent-rose)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoMeta: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    minWidth: 0,
  },
  videoTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  videoChannel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '6px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  skeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skeletonBar: {
    height: '12px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .video-item-link:hover {
      background: rgba(255, 255, 255, 0.07) !important;
      border-color: rgba(244, 63, 94, 0.2) !important;
    }
    .video-item-link:hover .play-overlay {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
}
