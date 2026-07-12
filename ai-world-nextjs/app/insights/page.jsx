import React from 'react';
import InsightsClient from './InsightsClient';
import { db, mapPortfolioItem } from '../supabaseClient';

export const metadata = {
  title: '기술 인사이트 - 톱니바꿈 AI월드',
  description: 'AI 엔지니어링 프레임워크와 비즈니스 자동화 시나리오 등 유용한 테크니컬 리포트 모음집입니다.',
  openGraph: {
    type: 'website',
    title: '기술 인사이트 - 톱니바꿈 AI월드',
    description: 'AI 엔지니어링 프레임워크와 비즈니스 자동화 시나리오 등 유용한 테크니컬 리포트 모음집입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '기술 인사이트 - 톱니바꿈 AI월드',
    description: 'AI 엔지니어링 프레임워크와 비즈니스 자동화 시나리오 등 유용한 테크니컬 리포트 모음집입니다.',
    images: ['https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page(props) {
  // Read query parameters
  const searchParams = await props.searchParams;
  const highlightId = searchParams?.id || null;

  let filteredItems = [];
  try {
    const { data, error } = await db.getPortfolio();
    if (data) {
      const mapped = data.map(mapPortfolioItem);
      filteredItems = mapped.filter(x => x.category === 'Insight');
    }
  } catch (e) {
    console.error('Failed to pre-fetch insights:', e);
  }

  return (
    <InsightsClient initialItems={filteredItems} highlightId={highlightId} />
  );
}
