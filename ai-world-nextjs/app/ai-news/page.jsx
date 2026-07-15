import React from 'react';
import AINewsClient from './AINewsClient';
import { db, mapNewsItem } from '../supabaseClient';

export const revalidate = 0;

export const metadata = {
  title: 'AI 뉴스 - 톱니바꿈 AI월드',
  description: '최신 인공지능 모델 및 플랫폼 트렌드를 실시간 수집하고 3단 핵심 요약 리포트를 제공합니다.',
  openGraph: {
    type: 'website',
    title: 'AI 뉴스 - 톱니바꿈 AI월드',
    description: '최신 인공지능 모델 및 플랫폼 트렌드를 실시간 수집하고 3단 핵심 요약 리포트를 제공합니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 뉴스 - 톱니바꿈 AI월드',
    description: '최신 인공지능 모델 및 플랫폼 트렌드를 실시간 수집하고 3단 핵심 요약 리포트를 제공합니다.',
    images: ['https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page() {
  let newsList = [];
  try {
    const { data, error } = await db.getNews();
    if (data) {
      newsList = data.map(mapNewsItem);
    }
  } catch (e) {
    console.error('Failed to pre-fetch news:', e);
  }

  return (
    <AINewsClient initialNews={newsList} />
  );
}
