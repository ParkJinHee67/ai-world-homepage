import React from 'react';
import CardNewsClient from './CardNewsClient';
import { db } from '../supabaseClient';

export const metadata = {
  title: '카드뉴스 자동화 도구 — 글 붙여넣으면 인스타 카드뉴스 완성 | 톱니바꿈 AI월드',
  description: '뉴스 기사, 블로그 포스트, 메모 등 텍스트만 붙여넣으면 AI가 자동으로 8~12장 규모의 인스타그램 카드뉴스(1080x1350 PNG)를 디자인해주는 초고속 자동화 도구입니다.',
  openGraph: {
    type: 'website',
    title: '카드뉴스 자동화 도구 — 글 붙여넣으면 인스타 카드뉴스 완성 | 톱니바꿈 AI월드',
    description: '뉴스 기사, 블로그 포스트, 메모 등 텍스트만 붙여넣으면 AI가 자동으로 8~12장 규모의 인스타그램 카드뉴스(1080x1350 PNG)를 디자인해주는 초고속 자동화 도구입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '카드뉴스 자동화 도구 — 글 붙여넣으면 인스타 카드뉴스 완성 | 톱니바꿈 AI월드',
    description: '뉴스 기사, 블로그 포스트, 메모 등 텍스트만 붙여넣으면 AI가 자동으로 8~12장 규모의 인스타그램 카드뉴스(1080x1350 PNG)를 디자인해주는 초고속 자동화 도구입니다.',
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page() {
  let recentDecks = [];
  try {
    const { data } = await db.getCardNewsDecks(4);
    if (data) {
      recentDecks = data;
    }
  } catch (e) {
    console.error('Failed to pre-fetch recent cardnews decks:', e);
  }

  return (
    <CardNewsClient initialDecks={recentDecks} />
  );
}
