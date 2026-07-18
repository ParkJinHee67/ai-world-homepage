"use client";

import React from 'react';
import Link from 'next/link';

export default function AdSlot({ ad }) {
  if (!ad) return null;

  const { type, html, title, price, imageUrl, link, desc } = ad;

  // 1. 쿠팡 다이나믹 배너 iframe 렌더링
  if (type === 'coupang-iframe') {
    return (
      <div style={styles.iframeWrapper}>
        <div 
          style={styles.iframeContent}
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      </div>
    );
  }

  // 2. 쿠팡 상품 추천 카드
  if (type === 'product-card') {
    return (
      <a 
        href={link || '#'} 
        target="_blank" 
        rel="noopener sponsored" 
        style={styles.productCard}
      >
        <div style={styles.imageContainer}>
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop'} 
            alt={title} 
            style={styles.productImage}
          />
        </div>
        <div style={styles.productInfo}>
          <h5 style={styles.productTitle}>{title}</h5>
          <span style={styles.productPrice}>{price}</span>
        </div>
      </a>
    );
  }

  // 3. 자체 하우스 광고 배너
  if (type === 'house') {
    const isInternal = link && link.startsWith('/');
    
    if (isInternal) {
      return (
        <Link href={link} style={styles.houseCard}>
          <div style={styles.imageContainer}>
            <img 
              src={imageUrl || 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop'} 
              alt={title} 
              style={styles.productImage}
            />
            <span style={styles.houseBadge}>자체추천</span>
          </div>
          <div style={styles.productInfo}>
            <h5 style={styles.productTitle}>{title}</h5>
            <p style={styles.houseDesc}>{desc}</p>
          </div>
        </Link>
      );
    }

    return (
      <a 
        href={link || '#'} 
        target="_blank" 
        rel="noopener sponsored" 
        style={styles.houseCard}
      >
        <div style={styles.imageContainer}>
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop'} 
            alt={title} 
            style={styles.productImage}
          />
          <span style={styles.houseBadge}>자체추천</span>
        </div>
        <div style={styles.productInfo}>
          <h5 style={styles.productTitle}>{title}</h5>
          <p style={styles.houseDesc}>{desc}</p>
        </div>
      </a>
    );
  }

  // 4. 구글 애드센스 (추후 활성화 대비 스켈레톤 주석 처리)
  /*
  if (type === 'adsense') {
    return (
      <div style={styles.adsensePlaceholder}>
        {ad.client && ad.slot ? (
          <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={ad.client}
            data-ad-slot={ad.slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <span style={{ fontSize: '11px', color: '#6b7684' }}>Google AdSense Skeleton</span>
        )}
      </div>
    );
  }
  */

  return null;
}

const styles = {
  iframeWrapper: {
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto',
    backgroundColor: '#0a090f',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    WebkitOverflowScrolling: 'touch',
    gridColumn: 'span 4', // 데스크톱에서는 4칸 공간 전체를 가로형으로 차지하게 설정
  },
  iframeContent: {
    maxWidth: '100%',
    display: 'inline-flex',
    justifyContent: 'center',
  },
  productCard: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0e0c15',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: '#fff',
    transition: 'transform 0.2s, border-color 0.2s',
    boxSizing: 'border-box',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/10',
    backgroundColor: '#050408',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  productInfo: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  productTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    lineHeight: '1.4',
    color: '#ffffff',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  productPrice: {
    fontSize: '12px',
    color: '#818cf8',
    fontWeight: '600',
  },
  houseCard: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0e0c15',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: '#fff',
    transition: 'transform 0.2s, border-color 0.2s',
    boxSizing: 'border-box',
  },
  houseBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  houseDesc: {
    fontSize: '12px',
    color: '#aab4c8',
    lineHeight: '1.4',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  adsensePlaceholder: {
    width: '100%',
    minHeight: '100px',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
};
