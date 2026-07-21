import React from 'react';
import AboutClient from './AboutClient';

export const metadata = {
  title: '소개 - 톱니바꿈 AI월드',
  description: '30년 경력의 시니어 개발자가 AI 기술을 활용하여 구현한 혁신적인 자동화 솔루션과 가치 있는 기술적 인사이트를 공유하는 공간입니다.',
  openGraph: {
    type: 'website',
    title: '소개 - 톱니바꿈 AI월드',
    description: '30년 경력의 시니어 개발자가 AI 기술을 활용하여 구현한 혁신적인 자동화 솔루션과 가치 있는 기술적 인사이트를 공유하는 공간입니다.',
  }
};

export default function AboutPage() {
  return <AboutClient />;
}
