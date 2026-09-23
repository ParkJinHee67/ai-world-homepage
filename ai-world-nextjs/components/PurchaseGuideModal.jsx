'use client';

import { useEffect } from 'react';
import { X, ShoppingBag, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../app/LanguageContext';

export default function PurchaseGuideModal({ guide, onClose }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!guide) return null;

  const accountLine = '신한은행 247-02-197411 / 예금주 박진희';

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText('신한은행 247-02-197411 박진희');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" style={styles.close} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <ShoppingBag size={22} color="#a78bfa" />
          </div>
          <div>
            <p style={styles.kicker}>{t('purchase.kicker', '구매 안내')}</p>
            <h2 style={styles.title}>{guide.title}</h2>
            {guide.tagline && <p style={styles.tagline}>{guide.tagline}</p>}
          </div>
        </div>

        <div style={styles.priceRow}>
          <span style={styles.price}>{guide.priceLabel}</span>
          {guide.priceNote && <span style={styles.priceNote}>{guide.priceNote}</span>}
        </div>

        {guide.includes?.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('purchase.includes', '포함 내용')}</h3>
            <ul style={styles.list}>
              {guide.includes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('purchase.how', '구매 방법')}</h3>
          <ol style={styles.steps}>
            {guide.steps.map((step, i) => (
              <li key={step.title} style={styles.step}>
                <span style={styles.stepNum}>{i + 1}</span>
                <div>
                  <strong style={styles.stepTitle}>{step.title}</strong>
                  <p style={styles.stepBody}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {guide.showAccount !== false && (
          <div style={styles.accountBox}>
            <div>
              <p style={styles.accountLabel}>{t('purchase.account', '입금 계좌')}</p>
              <p style={styles.accountValue}>{accountLine}</p>
            </div>
            <button type="button" style={styles.copyBtn} onClick={handleCopyAccount}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? t('purchase.copied', '복사됨') : t('purchase.copy', '계좌 복사')}</span>
            </button>
          </div>
        )}

        {guide.notes?.length > 0 && (
          <ul style={styles.notes}>
            {guide.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}

        <div style={styles.footer}>
          {(guide.siteUrl || (guide.showAccount === false && guide.detailUrl)) && (
            <a
              href={guide.siteUrl || guide.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.mailBtn}
            >
              <ExternalLink size={14} />
              <span>{t('purchase.open_site', '사이트에서 이용·구매')}</span>
            </a>
          )}
          {guide.showAccount !== false && (
            <a href="mailto:jhpa670211@gmail.com" style={styles.mailBtn}>
              {t('purchase.mail', '구매 메일 보내기')}
            </a>
          )}
          {guide.detailUrl && guide.showAccount !== false && (
            <a
              href={guide.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.detailLink}
            >
              <ExternalLink size={14} />
              <span>{t('purchase.detail', '자세한 상품 소개')}</span>
            </a>
          )}
          {guide.showAccount === false && (
            <a href="mailto:jhpa670211@gmail.com" style={styles.detailLink}>
              {t('purchase.mail', '구매 메일 보내기')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5, 4, 16, 0.78)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    position: 'relative',
    width: 'min(560px, 100%)',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'linear-gradient(165deg, #16122a 0%, #0f0c1c 100%)',
    border: '1px solid rgba(167, 139, 250, 0.35)',
    borderRadius: '18px',
    padding: '28px 24px 22px',
    color: '#ece8ff',
    boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    background: 'rgba(255,255,255,0.06)',
    border: 'none',
    borderRadius: 8,
    color: '#c4b5fd',
    cursor: 'pointer',
    padding: 6,
    display: 'flex',
  },
  header: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingRight: 28,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'rgba(167,139,250,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kicker: {
    margin: 0,
    fontSize: 12,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#a78bfa',
  },
  title: {
    margin: '4px 0 6px',
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  tagline: {
    margin: 0,
    fontSize: 13,
    color: '#b8b0d9',
    lineHeight: 1.45,
  },
  priceRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: '8px 14px',
    marginBottom: 18,
    padding: '12px 14px',
    borderRadius: 12,
    background: 'rgba(167,139,250,0.1)',
    border: '1px solid rgba(167,139,250,0.22)',
  },
  price: {
    fontSize: 26,
    fontWeight: 800,
    color: '#ddd6fe',
  },
  priceNote: {
    fontSize: 12,
    color: '#a89fc8',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    margin: '0 0 8px',
    fontSize: 14,
    fontWeight: 700,
    color: '#c4b5fd',
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.55,
    color: '#d4ccee',
  },
  steps: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  step: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#7c3aed',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepTitle: {
    display: 'block',
    fontSize: 14,
    marginBottom: 4,
  },
  stepBody: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: '#c9bfd9',
  },
  accountBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    padding: '12px 14px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px dashed rgba(167,139,250,0.35)',
    marginBottom: 12,
  },
  accountLabel: {
    margin: 0,
    fontSize: 11,
    color: '#9ca3af',
  },
  accountValue: {
    margin: '4px 0 0',
    fontSize: 14,
    fontWeight: 600,
    color: '#f5f3ff',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(167,139,250,0.4)',
    background: 'rgba(124,58,237,0.2)',
    color: '#e9d5ff',
    cursor: 'pointer',
    fontSize: 12,
  },
  notes: {
    margin: '0 0 16px',
    paddingLeft: 18,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#9ca3af',
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  mailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
  },
  detailLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#c4b5fd',
    fontSize: 13,
    textDecoration: 'none',
  },
};
