import React from 'react';
import PrivacyClient from './PrivacyClient';

export const metadata = {
  title: '개인정보처리방침 - 톱니바꿈 AI월드',
  description: '톱니바꿈 AI월드 웹사이트의 개인정보처리방침입니다. 수집하는 정보, 목적, 이용 기간 및 구글 애드센스 등 제3자 광고 서비스의 쿠키 정책 안내를 규정합니다.',
  openGraph: {
    type: 'website',
    title: '개인정보처리방침 - 톱니바꿈 AI월드',
    description: '톱니바꿈 AI월드 웹사이트의 개인정보처리방침입니다. 수집하는 정보, 목적, 이용 기간 및 구글 애드센스 등 제3자 광고 서비스의 쿠키 정책 안내를 규정합니다.',
  }
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
