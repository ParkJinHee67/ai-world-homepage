import React from 'react';
import AIRecommendClient from './AIRecommendClient';
import { db, mapPortfolioItem } from '../supabaseClient';

export const metadata = {
  title: '영상제작 포트폴리오 - 톱니바꿈 AI월드',
  description: 'AI 자동화 편집 기술이 가미된 다양한 롱폼/쇼츠 및 비디오 가이드 제작 포트폴리오입니다.',
  openGraph: {
    type: 'website',
    title: '영상제작 포트폴리오 - 톱니바꿈 AI월드',
    description: 'AI 자동화 편집 기술이 가미된 다양한 롱폼/쇼츠 및 비디오 가이드 제작 포트폴리오입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '영상제작 포트폴리오 - 톱니바꿈 AI월드',
    description: 'AI 자동화 편집 기술이 가미된 다양한 롱폼/쇼츠 및 비디오 가이드 제작 포트폴리오입니다.',
    images: ['https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop'],
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
      filteredItems = mapped.filter(x => x.category === 'AI Recommend');
    }
  } catch (e) {
    console.error('Failed to pre-fetch recommendations:', e);
  }

  return (
    <AIRecommendClient initialItems={filteredItems} highlightId={highlightId} />
  );
}
