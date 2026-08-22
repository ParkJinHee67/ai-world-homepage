import React from 'react';
import AIRecommendClient from './AIRecommendClient';
import { db, mapPortfolioItem } from '../supabaseClient';

export const metadata = {
  title: '상품 포트폴리오 - 톱니바꿈 AI월드',
  description: '실무와 비즈니스 현장에 즉시 도입할 수 있는 완성형 AI 상품 및 프로그램 포트폴리오입니다.',
  openGraph: {
    type: 'website',
    title: '상품 포트폴리오 - 톱니바꿈 AI월드',
    description: '실무와 비즈니스 현장에 즉시 도입할 수 있는 완성형 AI 상품 및 프로그램 포트폴리오입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '상품 포트폴리오 - 톱니바꿈 AI월드',
    description: '실무와 비즈니스 현장에 즉시 도입할 수 있는 완성형 AI 상품 및 프로그램 포트폴리오입니다.',
    images: ['https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page() {
  let filteredItems = [];
  try {
    const { data, error } = await db.getPortfolio();
    if (data) {
      const mapped = data.map(mapPortfolioItem);
      filteredItems = mapped.filter(x => x.category === 'AI Recommend');
    }
  } catch (e) {
    console.error('Failed to pre-fetch recommendations:', e);
  }

  return (
    <AIRecommendClient initialItems={filteredItems} />
  );
}
