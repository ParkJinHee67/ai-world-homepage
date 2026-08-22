import React from 'react';
import WebsitesClient from './WebsitesClient';
import { db, mapPortfolioItem } from '../supabaseClient';

export const metadata = {
  title: '외주 프로젝트 포트폴리오 - 톱니바꿈 AI월드',
  description: '맞춤형 AI 솔루션 연동 및 고성능 백엔드 기반으로 구축된 클라이언트 외주 제작 프로젝트입니다.',
  openGraph: {
    type: 'website',
    title: '외주 프로젝트 포트폴리오 - 톱니바꿈 AI월드',
    description: '맞춤형 AI 솔루션 연동 및 고성능 백엔드 기반으로 구축된 클라이언트 외주 제작 프로젝트입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '외주 프로젝트 포트폴리오 - 톱니바꿈 AI월드',
    description: '맞춤형 AI 솔루션 연동 및 고성능 백엔드 기반으로 구축된 클라이언트 외주 제작 프로젝트입니다.',
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
