import React from 'react';
import FreeToolsClient from './FreeToolsClient';
import { db, mapPortfolioItem } from '../supabaseClient';

export const metadata = {
  title: '무료 AI 도구 - 톱니바꿈 AI월드',
  description: '누구나 제약 없이 자유롭게 활용할 수 있는 웹 기반 AI 무료 실용 도구 모음입니다.',
  openGraph: {
    type: 'website',
    title: '무료 AI 도구 - 톱니바꿈 AI월드',
    description: '누구나 제약 없이 자유롭게 활용할 수 있는 웹 기반 AI 무료 실용 도구 모음입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '무료 AI 도구 - 톱니바꿈 AI월드',
    description: '누구나 제약 없이 자유롭게 활용할 수 있는 웹 기반 AI 무료 실용 도구 모음입니다.',
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page() {
  let filteredItems = [];
  try {
    const { data, error } = await db.getPortfolio();
    if (data) {
      const mapped = data.map(mapPortfolioItem);
      filteredItems = mapped.filter(x => x.category === 'FreeTool');
    }
  } catch (e) {
    console.error('Failed to pre-fetch free tools:', e);
  }

  return (
    <FreeToolsClient initialItems={filteredItems} />
  );
}
