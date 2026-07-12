import React from 'react';
import WebsitesClient from './WebsitesClient';
import { db, mapPortfolioItem } from '../supabaseClient';

export const metadata = {
  title: '제작 홈페이지 포트폴리오 - 톱니바꿈 AI월드',
  description: 'AI 솔루션 및 데이터 연동이 완비된 고유한 맞춤형 홈페이지/웹앱 제작 포트폴리오입니다.',
  openGraph: {
    type: 'website',
    title: '제작 홈페이지 포트폴리오 - 톱니바꿈 AI월드',
    description: 'AI 솔루션 및 데이터 연동이 완비된 고유한 맞춤형 홈페이지/웹앱 제작 포트폴리오입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '제작 홈페이지 포트폴리오 - 톱니바꿈 AI월드',
    description: 'AI 솔루션 및 데이터 연동이 완비된 고유한 맞춤형 홈페이지/웹앱 제작 포트폴리오입니다.',
    images: ['https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page() {
  let filteredItems = [];
  try {
    const { data, error } = await db.getPortfolio();
    if (data) {
      const mapped = data.map(mapPortfolioItem);
      filteredItems = mapped.filter(x => x.category === 'App');
    }
  } catch (e) {
    console.error('Failed to pre-fetch websites:', e);
  }

  return (
    <WebsitesClient initialItems={filteredItems} />
  );
}
