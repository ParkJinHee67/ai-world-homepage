import React from 'react';
import { MessageSquare, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={styles.footerContainer}>
      <div className="container-max" style={styles.footerInner}>
        <div style={styles.left}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} 톱니바꿈 AI월드. All rights reserved.
          </p>
          <p style={styles.desc}>
            AI 기술을 활용한 혁신적인 어플리케이션과 트렌드 분석 리포트를 제공합니다.
          </p>
        </div>

        <div style={styles.right}>
          <a
            href="https://open.kakao.com/o/si1c9OAi"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.kakaoBtn}
          >
            <MessageSquare size={16} fill="currentColor" />
            <span>프로그램 및 비즈니스 문의</span>
          </a>
          <span style={styles.madeWith}>
            Made with <Heart size={12} style={styles.heart} /> by Antigravity
          </span>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footerContainer: {
    background: 'rgba(2, 1, 6, 0.9)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '40px 0',
    marginTop: 'auto',
    width: '100%',
  },
  footerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  copyright: {
    color: 'var(--text-primary)',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  desc: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
  },
  kakaoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FEE500',
    color: '#191919',
    padding: '10px 20px',
    borderRadius: '30px',
    fontSize: '0.85rem',
    fontWeight: 700,
    boxShadow: '0 4px 15px rgba(254, 229, 0, 0.15)',
    transition: 'transform 0.2s ease, hover 0.2s ease',
  },
  madeWith: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  heart: {
    color: 'var(--accent-rose)',
    fill: 'var(--accent-rose)',
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    a[style*="kakaoBtn"]:hover {
      transform: translateY(-2px);
      background-color: #fdd835 !important;
    }
    @media (max-width: 768px) {
      footer div[style*="footerInner"] {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      footer div[style*="right"] {
        align-items: flex-start !important;
      }
    }
  `;
  document.head.appendChild(style);
}
