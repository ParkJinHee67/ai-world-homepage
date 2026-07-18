"use client";

import React from 'react';
import Link from 'next/link';

export default function AdSlot({ ad }) {
  if (!ad) return null;

  const { type, html, title, price, imageUrl, link_url, link, desc, description } = ad;

  // 실제 이동용 링크 필드 결합
  const targetLink = link_url || link || '#';
  const displayDesc = description || desc;

  // 1. 쿠팡 다이나믹 배너 iframe 렌더링 (설명 라벨 지원 및 반응형 축소)
  if (type === 'coupang-iframe') {
    const wrapperStyle = {
      ...styles.iframeWrapper,
      ...(ad.id === 'ad-slot-1' ? { gridColumn: 'span 4' } : {})
    };

    // 2, 3번 슬롯 판정
    const isSlot2or3 = ad.position === 2 || ad.position === 3 || ad.id === 'ad-slot-2' || ad.id === 'ad-slot-3';

    // 2, 3번 슬롯인 경우 고정 높이 335px을 부여하고 아래 여백을 overflow: hidden으로 잘라냄
    const contentStyle = {
      ...styles.iframeContent,
      ...(isSlot2or3 ? {
        height: '335px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      } : {})
    };

    return (
      <div style={wrapperStyle}>
        <div style={styles.iframeInner}>
          {title && <div style={styles.adLabel}>{title}</div>}
          <div 
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          iframe {
            max-width: 100% !important;
            display: block !important;
            margin: 0 auto !important;
          }
          /* 2, 3번 슬롯의 경우, 가로폭이 축소되어도 iframe 내부 레이아웃 비율이 깨지거나 
             쇼핑하기 버튼이 잘리지 않도록 iframe 자체 높이는 원본 492px을 그대로 유지시킵니다. */
          ${isSlot2or3 ? `
            iframe {
              height: 492px !important;
            }
          ` : ''}
        ` }} />
      </div>
    );
  }

  // 2. 쿠팡 상품 추천 카드
  if (type === 'product-card') {
    return (
      <a 
        href={targetLink} 
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
    const isInternal = targetLink && targetLink.startsWith('/');
    
    if (isInternal) {
      return (
        <Link href={targetLink} style={styles.houseCard}>
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
            {displayDesc && <p style={styles.houseDesc}>{displayDesc}</p>}
          </div>
        </Link>
      );
    }

    return (
      <a 
        href={targetLink} 
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
          {displayDesc && <p style={styles.houseDesc}>{displayDesc}</p>}
        </div>
      </a>
    );
  }

  return null;
}

const styles = {
  iframeWrapper: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#0a090f',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    alignSelf: 'start', // 그리드 내 강제 늘어남(stretch) 방지
    height: 'fit-content',
  },
  iframeInner: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#aab4c8',
    marginBottom: '14px',
    textAlign: 'center',
    letterSpacing: '0.02em',
  },
  iframeContent: {
    maxWidth: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    alignSelf: 'start', // 그리드 내 강제 늘어남(stretch) 방지
    height: 'fit-content',
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
    alignSelf: 'start', // 그리드 내 강제 늘어남(stretch) 방지
    height: 'fit-content',
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
    margin: '6px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  }
};
