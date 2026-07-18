import React from 'react';
import GalleryClient from './GalleryClient';
import { db } from '../../supabaseClient';

export const metadata = {
  title: '카드뉴스 갤러리 — 사용자들이 발행한 카드뉴스 | 톱니바꿈 AI월드',
  description: 'AI 카드뉴스 자동화 도구로 제작되어 실시간으로 발행된 다양한 주제의 카드뉴스 작품들을 만나보세요.',
  openGraph: {
    type: 'website',
    title: '카드뉴스 갤러리 — 사용자들이 발행한 카드뉴스 | 톱니바꿈 AI월드',
    description: 'AI 카드뉴스 자동화 도구로 제작되어 실시간으로 발행된 다양한 주제의 카드뉴스 작품들을 만나보세요.',
  }
};

export default async function GalleryPage() {
  let decks = [];
  try {
    const { data } = await db.getCardNewsDecks(100); // 최대 100개 최신순 조회
    if (data) {
      decks = data;
    }
  } catch (e) {
    console.error('Failed to fetch gallery decks:', e);
  }

  return (
    <GalleryClient initialDecks={decks} />
  );
}
