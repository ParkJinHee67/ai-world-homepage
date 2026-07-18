import React from 'react';
import DeckViewerClient from './DeckViewerClient';
import { db } from '../../../supabaseClient';

export const revalidate = 60; // 60초 간격 ISR (Incremental Static Regeneration)

export async function generateMetadata({ params }) {
  const { id } = await params;
  let deck = null;

  try {
    const { data } = await db.getCardNewsDeckById(id);
    deck = data;
  } catch (e) {
    console.error('Failed to get deck metadata:', e);
  }

  if (!deck) {
    return {
      title: '카드뉴스 상세 정보 — 톱니바꿈 AI월드',
      description: '존재하지 않거나 삭제된 카드뉴스입니다.',
    };
  }

  return {
    title: `${deck.title} — AI 카드뉴스 갤러리 | 톱니바꿈 AI월드`,
    description: deck.description || `${deck.title} 카드뉴스입니다. AI 카드뉴스 자동화 도구로 제작되었습니다.`,
    openGraph: {
      type: 'website',
      title: `${deck.title} — AI 카드뉴스 갤러리`,
      description: deck.description || `${deck.title} 카드뉴스입니다. AI 카드뉴스 자동화 도구로 제작되었습니다.`,
      images: [
        {
          url: deck.cover_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${deck.title} — AI 카드뉴스 갤러리`,
      description: deck.description || `${deck.title} 카드뉴스입니다.`,
      images: [deck.cover_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'],
    }
  };
}

export default async function DeckDetailPage({ params }) {
  const { id } = await params;
  let initialDeck = null;

  try {
    const { data } = await db.getCardNewsDeckById(id);
    if (data) {
      initialDeck = data;
    }
  } catch (e) {
    console.error('Failed to load deck in details page:', e);
  }

  return (
    <DeckViewerClient deckId={id} initialDeck={initialDeck} />
  );
}
