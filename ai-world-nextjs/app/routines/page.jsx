import React from 'react';
import RoutinesClient from './RoutinesClient';
import { DEFAULT_ROUTINES } from './defaultRoutines';

export const metadata = {
  title: '에이전트 일일 루틴 관제 센터 - 톱니바꿈 AI월드',
  description: '매일 지정된 시각에 자율 실행되는 AI 에이전트 파이프라인의 실시간 스케줄 및 가동 상태 관제 대시보드입니다.',
  openGraph: {
    type: 'website',
    title: '에이전트 일일 루틴 관제 센터 - 톱니바꿈 AI월드',
    description: '매일 지정된 시각에 자율 실행되는 AI 에이전트 파이프라인의 실시간 스케줄 및 가동 상태 관제 대시보드입니다.',
  }
};

export default function RoutinesPage() {
  return (
    <RoutinesClient initialItems={DEFAULT_ROUTINES} embedded={false} />
  );
}
