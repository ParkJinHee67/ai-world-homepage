"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../LanguageContext';

export default function EditorPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px 미만은 태블릿/모바일로 판단하여 경고 표시
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={styles.container}>
      {isMobile && (
        <div style={styles.mobileOverlay}>
          <div style={styles.mobileAlert}>
            <h2 style={styles.alertTitle}>{t('editor.warning.title', '💻 PC 환경 권장')}</h2>
            <p style={styles.alertText}>
              {t('editor.warning.text', '카드뉴스 에디터는 화면 배치를 실시간으로 편집하는 도구로, PC 및 데스크톱 브라우저에 최적화되어 있습니다.')}
            </p>
            <p style={styles.alertSubText}>
              {t('editor.warning.sub', '모바일 기기에서는 편집 화면이 정상적으로 표시되지 않거나 불편할 수 있으니 가급적 PC로 접속해 주시기 바랍니다.')}
            </p>
            <button 
              onClick={() => setIsMobile(false)} 
              style={styles.alertBtn}
            >
              {t('editor.warning.continue', '계속 진행하기')}
            </button>
          </div>
        </div>
      )}
      
      <iframe
        src="/cardnews-editor/index.html"
        style={styles.iframe}
        title={t('editor.iframe.title', '카드뉴스 에디터')}
        id="cardnews-editor-iframe"
      />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: 'calc(100vh - 70px)', // 헤더 높이 70px 제외
    position: 'relative',
    background: '#eef1f6',
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  mobileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 2, 7, 0.9)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  mobileAlert: {
    backgroundColor: '#1b1b22',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '30px 24px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
  alertTitle: {
    color: '#ff3b30',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  alertText: {
    color: '#ffffff',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '10px',
  },
  alertSubText: {
    color: '#aab4c8',
    fontSize: '13px',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  alertBtn: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.2s',
  }
};
