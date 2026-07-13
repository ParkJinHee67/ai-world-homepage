# ⚙️ 톱니바꿈 AI월드 - Next.js 마이그레이션 가이드 및 개발 문서

본 문서는 **톱니바꿈 AI월드** 웹사이트가 기존 **Vite (React SPA)** 환경에서 **Next.js 15+ (App Router)** 환경으로 마이그레이션된 후의 **변경된 파일 구조**와 향후 **새로운 페이지를 추가하는 개발 방법**을 설명합니다.

---

## 📌 목차
1. [마이그레이션 개요](#1-마이그레이션-개요)
2. [변경된 파일 구조 비교 (Vite vs Next.js)](#2-변경된-파일-구조-비교-vite-vs-nextjs)
3. [핵심 설계 방식 (Server & Client Component)](#3-핵심-설계-방식-server--client-component)
4. [새로운 페이지 추가 가이드 (Step-by-Step)](#4-새로운-페이지-추가-가이드-step-by-step)
5. [로컬 개발 및 빌드 명령어](#5-로컬-개발-및-빌드-명령어)

---

## 1. 마이그레이션 개요

기존 Vite 기반 React 싱글 페이지 애플리케이션(SPA) 구조에서 **Next.js 15+ App Router** 구조로 전환되었습니다. 
* **Next.js 하위 폴더**: `ai-world-nextjs` 디렉토리 내에 프로젝트가 구성되어 있습니다.
* **주요 목표**: SEO(검색 엔진 최적화) 최적화, 첫 화면 로딩 속도 단축(SSG/SSR 데이터 프리패치), 효율적인 코드 관리.
* **기존 소스 보존**: 루트 디렉토리의 `src` 및 `public` 등 기존 Vite 파일들은 마이그레이션 참고 자료용으로 보존되어 있으며, 실제 서비스는 `ai-world-nextjs` 폴더 내부의 코드를 기반으로 구동 및 배포됩니다.

---

## 2. 변경된 파일 구조 비교 (Vite vs Next.js)

Vite의 리액트 라우터 방식에서 Next.js의 폴더 기반 App Router 방식으로 변경된 핵심 구조는 다음과 같습니다.

| 구분 | 기존 Vite 구조 (루트 기준) | 마이그레이션 후 Next.js 구조 (`ai-world-nextjs/` 기준) | 설명 |
| :--- | :--- | :--- | :--- |
| **진입점 & 설정** | `index.html`, `vite.config.js`, `src/main.jsx` | `next.config.mjs`, `jsconfig.json`, `app/layout.js` | 앱 설정 및 전역 메타데이터/레이아웃 제어 |
| **전역 스타일** | `src/index.css`, `src/App.css` | `app/globals.css` | 테마 변수 및 전역 스타일 시트 |
| **공통 컴포넌트** | `src/components/*` | `components/*` | 네비게이션바, 푸터, 포트폴리오 카드 등 컴포넌트 |
| **데이터베이스 연동**| `src/supabaseClient.js` | `app/supabaseClient.js` | Supabase 클라이언트 설정 및 CRUD API 함수 |
| **메인 홈 화면** | `src/pages/Home.jsx` | `app/page.jsx` (Server)<br>`app/HomeClient.jsx` (Client) | 홈 포트폴리오 리스트 및 방문 통계 데이터 표시 |
| **AI 뉴스** | `src/pages/AINews.jsx` | `app/ai-news/page.jsx` (Server)<br>`app/ai-news/AINewsClient.jsx` (Client) | 수집된 AI 뉴스 3단 요약 리스트 |
| **영상제작 (AI 추천)**| `src/pages/AIRecommend.jsx` | `app/ai-recommend/page.jsx` (Server)<br>`app/ai-recommend/AIRecommendClient.jsx` | AI 기반 영상 제작 리소스 추천 |
| **주인공 이미지** | `src/pages/ImageDownload.jsx`| `app/download/page.jsx` (Server)<br>`app/download/ImageDownloadClient.jsx` | 마케팅 리드 수집 및 다운로드 페이지 |
| **홈페이지** | `src/pages/Websites.jsx` | `app/homepage/page.jsx` (Server)<br>`app/homepage/WebsitesClient.jsx` | 포트폴리오 및 홈페이지 제작 리스트 |
| **인사이트** | `src/pages/Insights.jsx` | `app/insights/page.jsx` (Server)<br>`app/insights/InsightsClient.jsx` | 최신 트렌드 칼럼 및 기술 인사이트 |
| **관리자** | `src/pages/Admin.jsx` | `app/admin/page.jsx` (Client) | 포트폴리오, 뉴스, 자료실, 리드 수집 통합 대시보드 |

---

## 3. 핵심 설계 방식 (Server & Client Component)

Next.js App Router의 성능 극대화를 위해 **Server Component (서버 컴포넌트)**와 **Client Component (클라이언트 컴포넌트)**를 분리하는 설계를 도입하였습니다.

### 1) 서버 컴포넌트 (`page.jsx`)
* **역할**: 빌드 타임 혹은 서버 요청 시점에 Supabase 데이터를 **미리 패치(Pre-fetch)**하고, 검색엔진(SEO)용 **메타데이터(metadata)**를 정적으로 선언합니다.
* **장점**: 브라우저가 자바스크립트를 다운로드하기 전에 이미 데이터가 렌더링된 완벽한 HTML을 받으므로 **SEO 성능 및 초기 로딩 속도**가 압도적으로 빨라집니다.
* **예시**: `app/ai-news/page.jsx`

### 2) 클라이언트 컴포넌트 (`*Client.jsx`)
* **역할**: 브라우저 단에서 휠 이벤트, 탭 전환, 모달 팝업, 폼 입력, Supabase 실시간 통계 구독 등 **사용자 인터랙션 및 상태 관리(useState, useEffect)**를 담당합니다.
* **선언 방법**: 파일 최상단에 `"use client";` 지시어를 명시합니다.
* **예시**: `app/ai-news/AINewsClient.jsx`

---

## 4. SEO (검색엔진 최적화) 설정 명세

이번 마이그레이션의 핵심 존재 이유인 SEO 성능 최적화를 극대화하기 위해 다음과 같은 Next.js 표준 SEO 기술 요소를 완벽히 구현하여 설정해 두었습니다.

### 1) 페이지별 Metadata API
* **파일 위치**: 각 페이지의 서버 컴포넌트 (`app/page.jsx`, `app/ai-news/page.jsx`, `app/insights/page.jsx` 등)
* **내용**: `export const metadata` API를 통해 페이지 고유의 `title`, `description`, `openGraph` (카카오톡, 페이스북 공유 이미지/타이틀), `twitter` 카드 메타태그를 선언하였습니다.
* **동작 방식**: Next.js 컴파일러가 정적 HTML 헤더 영역에 이 태그들을 직접 컴파일해 넣음으로써, 자바스크립트가 로드되기 전에 검색 엔진이 타이틀과 요약문을 안전하게 긁어갈 수 있도록 보장합니다.

### 2) sitemap.js를 통한 사이트맵 자동 생성
* **파일 위치**: [app/sitemap.js](file:///d:/홈페이지/톱니바꿈월드/ai-world-nextjs/app/sitemap.js)
* **내용**: 사이트의 전체 공개 경로(`/`, `/ai-news`, `/ai-recommend`, `/download`, `/homepage`, `/insights`)를 배열로 관리하여, 빌드 타임에 자동으로 표준 XML 사이트맵 파일(`/sitemap.xml`)을 동적 생성하도록 설계했습니다.
* **설정**: 각 주소별 갱신 주기(`changeFrequency`)와 우선순위(`priority`) 정보가 메타 데이터 정보로 자동 인코딩됩니다.

### 3) robots.js를 통한 로봇 접근 제어
* **파일 위치**: [app/robots.js](file:///d:/홈페이지/톱니바꿈월드/ai-world-nextjs/app/robots.js)
* **내용**: 검색 엔진 로봇이 크롤링할 수 있는 허용 주소(`allow: '/'`)와 보안 유지가 필요한 관리자 대시보드 주소(`disallow: '/admin'`)를 명시하고, 사이트맵의 정확한 위치를 연결해 두었습니다.

### 4) 다국어 및 한국어 설정 (`<html lang="ko">`)
* **파일 위치**: [app/layout.js](file:///d:/홈페이지/톱니바꿈월드/ai-world-nextjs/app/layout.js) (라인 31)
* **내용**: 전역 레이아웃에서 HTML 표준 주 언어 태그를 `<html lang="ko">`로 명확히 고정 선언하였습니다. 브라우저의 자동 번역기 오작동을 방지하고 국내 검색엔진에 최적화된 문맥 점수를 확보합니다.

### 5) JSON-LD 구조화 데이터 적용 (스키마 마크업)
* **파일 위치**: [app/layout.js](file:///d:/홈페이지/톱니바꿈월드/ai-world-nextjs/app/layout.js) (라인 14~28)
* **내용**: 사이트의 정체성, 발행인(톱니바꿈 AI월드), 로고 및 URL 주소를 구글 검색 엔진이 직관적으로 분류할 수 있도록 **Schema.org 표준 JSON-LD 구조화 스키마**를 정의하여 `<head>` 영역에 자동 임베딩했습니다.
* **구글 서치 콘솔 연동 장점**: 검색 결과 화면(SERP)에서 사이트 이름이나 로고가 리치 스니펫(Rich Snippets) 형태로 더 매력적으로 표시될 가능성을 높입니다.

---

## 5. 새로운 페이지 추가 가이드 (Step-by-Step)

예시로 **"AI 도구 모음 (`/ai-tools`)"** 이라는 새로운 페이지를 추가한다고 가정하고 단계별로 설명합니다.

### 1단계: 라우팅 폴더 및 파일 생성
`ai-world-nextjs/app/` 아래에 추가하고자 하는 주소 이름으로 폴더를 생성하고 `page.jsx`와 `Client` 컴포넌트 파일을 작성합니다.

```
ai-world-nextjs/
└── app/
    └── ai-tools/
        ├── page.jsx                   <-- (서버 컴포넌트: SEO & 데이터 로드)
        └── AIToolsClient.jsx          <-- (클라이언트 컴포넌트: UI 및 상호작용)
```

### 2단계: 서버 컴포넌트 작성 (`page.jsx`)
서버 단에서 SEO 메타데이터를 등록하고 필요 시 Supabase 등에서 데이터를 미리 읽어옵니다.

```javascript
// file:///d:/홈페이지/톱니바꿈월드/ai-world-nextjs/app/ai-tools/page.jsx
import React from 'react';
import AIToolsClient from './AIToolsClient';
import { db } from '../supabaseClient'; // 데이터베이스 함수가 필요한 경우 임포트

// 1. SEO용 메타데이터 설정 (검색 노출 최적화)
export const metadata = {
  title: 'AI 도구 모음 - 톱니바꿈 AI월드',
  description: '엄선된 최신 AI 업무 생산성 도구 리스트를 확인해 보세요.',
  openGraph: {
    title: 'AI 도구 모음 - 톱니바꿈 AI월드',
    description: '엄선된 최신 AI 업무 생산성 도구 리스트를 확인해 보세요.',
  }
};

export default async function Page() {
  let toolsList = [];
  
  // 2. 필요시 서버 단에서 Supabase 데이터 프리패치
  try {
    // 예: const { data } = await db.getAITools();
    // toolsList = data || [];
  } catch (e) {
    console.error('Failed to pre-fetch AI tools:', e);
  }

  // 3. 데이터를 클라이언트 컴포넌트로 전달하여 렌더링
  return (
    <AIToolsClient initialTools={toolsList} />
  );
}
```

### 3단계: 클라이언트 컴포넌트 작성 (`AIToolsClient.jsx`)
사용자와의 인터랙션(검색, 필터링 등)과 실제 UI 렌더링을 정의합니다.

```javascript
// file:///d:/홈페이지/톱니바꿈월드/ai-world-nextjs/app/ai-tools/AIToolsClient.jsx
"use client";

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react'; // 아이콘 라이브러리 사용 가능

export default function AIToolsClient({ initialTools }) {
  const [search, setSearch] = useState('');
  
  // 브라우저 단의 로직 처리...
  
  return (
    <div style={styles.container}>
      <div className="container-max" style={{ padding: '60px 24px' }}>
        <h1 style={styles.title}>
          <Sparkles style={{ color: 'var(--accent-indigo)' }} />
          AI 생산성 도구 모음
        </h1>
        <p style={styles.subtitle}>업무 효율을 극대화해주는 유용한 AI 도구 목록입니다.</p>
        
        {/* 상호작용 예시 */}
        <input 
          type="text" 
          placeholder="도구 검색..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        
        {/* 콘텐츠 영역 */}
        <div style={styles.listGrid}>
          {initialTools.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>등록된 도구가 없습니다.</p>
          ) : (
            // 데이터 맵핑 루프...
            null
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '32px',
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    marginBottom: '40px',
    outline: 'none',
  },
  listGrid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
  }
};
```

### 4단계: 네비게이션 바 링크 등록 (`components/Navbar.jsx`)
사용자가 메뉴를 눌러 신규 페이지로 진입할 수 있도록 상단 네비게이션바 컴포넌트에 링크를 추가합니다.

1. [components/Navbar.jsx](file:///d:/홈페이지/톱니바꿈월드/ai-world-nextjs/components/Navbar.jsx) 파일을 엽니다.
2. `navItems` 배열(약 15번째 라인)에 신규 아이템을 추가합니다.
   * 예: `Sparkles` 아이콘을 `lucide-react`에서 임포트한 뒤 적용합니다.
   
```javascript
import { Terminal, Newspaper, Video, Layout, Lightbulb, ShieldAlert, Download, Sparkles } from 'lucide-react';

// ...

const navItems = [
  { path: '/', label: '홈', icon: Terminal },
  { path: '/ai-news', label: 'AI 뉴스', icon: Newspaper },
  { path: '/ai-recommend', label: '영상제작', icon: Video },
  { path: '/download', label: '주인공 이미지', icon: Download },
  { path: '/homepage', label: '홈페이지', icon: Layout },
  { path: '/insights', label: '인사이트', icon: Lightbulb },
  { path: '/ai-tools', label: 'AI 도구', icon: Sparkles }, // <-- 신규 추가!
  { path: '/admin', label: '관리자', icon: ShieldAlert },
];
```

이것만으로 `/ai-tools` 경로로 이동하는 상단 링크 및 라우팅 구축이 완료됩니다!

---

## 5. 로컬 개발 및 빌드 명령어

프로젝트를 로컬에서 구동하거나 배포 준비를 위해 빌드할 때는 `ai-world-nextjs` 디렉토리 내부에서 다음 명령어를 실행해야 합니다.

### 1) Next.js 프로젝트 디렉토리로 이동
```bash
cd ai-world-nextjs
```

### 2) 로컬 개발 서버 구동 (실시간 리로드 지원)
```bash
npm run dev
# ➔ 기본적으로 http://localhost:3000 으로 실행됩니다.
```

### 3) 프로덕션용 정적 빌드 테스트
```bash
npm run build
# ➔ Supabase의 데이터를 사전 수집하여 최적화된 정적 HTML로 컴파일합니다.
```

### 4) 빌드된 결과물 로컬 확인
```bash
npm run start
```

---

> 💡 **참고**: 배포 플랫폼(Vercel 등) 환경설정에는 루트 폴더의 설정에 따라 `ai-world-nextjs` 디렉토리가 Root Directory로 설정되어 있거나, 모노레포 설정이 활성화되어 있어야 합니다. 기존 `.env` 내의 API 키 값들은 Next.js용 환경변수인 `NEXT_PUBLIC_` 접두사를 붙여 추가 등록되어 있는지 확인하십시오.
