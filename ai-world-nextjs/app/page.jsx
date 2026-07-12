import React from 'react';
import HomeClient from './HomeClient';
import { db, mapPortfolioItem } from './supabaseClient';

export const metadata = {
  title: '톱니바꿈 AI월드',
  description: 'AI 기술을 활용하여 제작한 혁신적인 어플리케이션과 가치 있는 기술적 인사이트를 만나보세요.',
  openGraph: {
    type: 'website',
    title: '톱니바꿈 AI월드',
    description: 'AI 기술을 활용하여 제작한 혁신적인 어플리케이션과 가치 있는 기술적 인사이트를 만나보세요.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '톱니바꿈 AI월드',
    description: 'AI 기술을 활용하여 제작한 혁신적인 어플리케이션과 가치 있는 기술적 인사이트를 만나보세요.',
    images: ['https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page(props) {
  // Read searchParams (Next.js 15 requires awaiting it)
  const searchParams = await props.searchParams;
  const highlightId = searchParams?.id || null;

  let portfolioItems = [];
  let stats = { visitors: 1000, visitorsToday: 4, downloads: 1000 };

  try {
    const { data: pData } = await db.getPortfolio();
    if (pData) {
      portfolioItems = pData.map(mapPortfolioItem);
    }
  } catch (e) {
    console.error('Failed to pre-fetch portfolio:', e);
  }

  try {
    const { data: sData } = await db.getStats();
    if (sData) {
      const todayStr = new Date().toLocaleDateString('sv-SE');
      const dailyKey = `visitors_daily:${todayStr}`;
      stats = {
        visitors: (sData.visitors || 0) + 1000,
        visitorsToday: (sData[dailyKey] || 0) + 4,
        downloads: (sData.downloads || 0) + 1000
      };
    }
  } catch (e) {
    console.error('Failed to pre-fetch stats:', e);
  }

  return (
    <HomeClient 
      initialItems={portfolioItems} 
      initialStats={stats} 
      highlightId={highlightId} 
    />
  );
}
