import React from 'react';
import ImageDownloadClient from './ImageDownloadClient';
import { db } from '../supabaseClient';

export const metadata = {
  title: '주인공 이미지 다운로드 - 톱니바꿈 AI월드',
  description: '유튜브 쇼츠, 인트로, 오픈채팅방 대문 등에 무료로 적용 가능한 고화질 이미지 리소스 다운로드실입니다.',
  openGraph: {
    type: 'website',
    title: '주인공 이미지 다운로드 - 톱니바꿈 AI월드',
    description: '유튜브 쇼츠, 인트로, 오픈채팅방 대문 등에 무료로 적용 가능한 고화질 이미지 리소스 다운로드실입니다.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '주인공 이미지 다운로드 - 톱니바꿈 AI월드',
    description: '유튜브 쇼츠, 인트로, 오픈채팅방 대문 등에 무료로 적용 가능한 고화질 이미지 리소스 다운로드실입니다.',
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'],
  }
};

export default async function Page(props) {
  // Read query parameters
  const searchParams = await props.searchParams;
  const downloadId = searchParams?.id || null;

  let initialResources = [];
  try {
    const { data } = await db.getResources();
    if (data) {
      initialResources = data;
    }
  } catch (e) {
    console.error('Failed to pre-fetch resources:', e);
  }

  return (
    <ImageDownloadClient 
      initialResources={initialResources} 
      downloadId={downloadId} 
    />
  );
}
