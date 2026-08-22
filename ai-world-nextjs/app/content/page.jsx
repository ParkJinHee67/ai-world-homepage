import React from 'react';
import ContentClient from './ContentClient';
import { db, mapPortfolioItem } from '../supabaseClient';

export const metadata = {
  title: '콘텐츠 사이트 - 톱니바꿈 AI월드',
  description: 'AI 기술과 정보가 집약된 미디어, 포털 및 지식 콘텐츠 서비스입니다.',
  openGraph: {
    type: 'website',
    title: '콘텐츠 사이트 - 톱니바꿈 AI월드',
    description: 'AI 기술과 정보가 집약된 미디어, 포털 및 지식 콘텐츠 서비스입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '콘텐츠 사이트 - 톱니바꿈 AI월드',
    description: 'AI 기술과 정보가 집약된 미디어, 포털 및 지식 콘텐츠 서비스입니다.',
    images: ['https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page() {
  let filteredItems = [];
  try {
    const { data, error } = await db.getPortfolio();
    if (data) {
      const mapped = data.map(mapPortfolioItem);
      filteredItems = mapped.filter(x => x.category === 'Content');
    }
  } catch (e) {
    console.error('Failed to pre-fetch content sites:', e);
  }

  return (
    <ContentClient initialItems={filteredItems} />
  );
}
