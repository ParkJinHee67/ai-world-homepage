"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  ko: {
    // Navbar
    'nav.home': '홈',
    'nav.news': 'AI 뉴스',
    'nav.video': '영상제작',
    'nav.download': '주인공 이미지',
    'nav.homepage': '홈페이지',
    'nav.insights': '인사이트',
    'nav.admin': '관리자',
    'brand.title': '톱니바꿈',
    'brand.subtitle': 'AI월드',

    // Hero
    'hero.badge': 'PORTFOLIO & INSIGHTS',
    'hero.title_pre': '톱니바꿈',
    'hero.title_post': 'AI월드',
    'hero.desc': '실무에서 검증된 AI 자동화 솔루션과 최첨단 AI 어플리케이션 및 인사이트를 활용하여 업무의 한계를 넓혀보세요.',
    'hero.stat.today': '오늘 방문자',
    'hero.stat.total': '누적 방문자',
    'hero.stat.downloads': '주인공 이미지 다운로드',
    'hero.stat.visitors_unit': '명',
    'hero.stat.downloads_unit': '회',
    'hero.action.explore': '프로젝트 탐색',
    'hero.action.inquire': '프로그램 문의',

    // Featured Projects
    'projects.title': 'Featured Projects',
    'projects.inquire': '프로그램 문의',
    
    // Category tabs
    'cat.all': '전체',
    'cat.recommend': '추천도구',
    'cat.app': '앱',
    'cat.insight': '인사이트',

    // CardNews Banner & Section
    'cardnews.badge': '✨ 카드뉴스 제작의 혁명',
    'cardnews.title_pre': '글만 붙여넣으면,',
    'cardnews.title_post': '인스타 카드뉴스 자동 완성',
    'cardnews.desc': '기사 요약부터 고화질 배경 이미지 선정, 6가지 디자인 스타일 테마 적용까지. 이제 AI 카드뉴스 자동화 도구로 SNS 콘텐츠를 5분 만에 양산하세요.',
    'cardnews.action': '에디터 시작하기',
    'cardnews.recent': '최근 발행된 카드뉴스',
    'cardnews.recent_desc': '톱니바꿈 사용자들이 완성하여 발행한 작품들을 감상해보세요.',
    'cardnews.view_all': '갤러리 전체보기',
    'cardnews.ad_title': '톱니바꿈 추천 도서 및 장비',
    'cardnews.ad_desc': '본 페이지는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
    'cardnews.ad_loading': '광고를 불러오는 중입니다...',
    'cardnews.card_unit': '장',

    // Card News
    'cardnews.hero.badge': '✨ 카드뉴스 제작의 혁명',
    'cardnews.hero.title': '글만 붙여넣으면, 인스타 카드뉴스 자동 완성',
    'cardnews.hero.sub': '기사 요약부터 고화질 배경 이미지 선정, 6가지 디자인 스타일 테마 적용까지. 이제 AI 카드뉴스 자동화 도구로 SNS 콘텐츠를 5분 만에 양산하세요.',
    'cardnews.hero.action': '에디터 시작하기',
    'cardnews.recent.title': '최근 발행된 카드뉴스',
    'cardnews.recent.sub': '톱니바꿈 사용자들이 완성하여 발행한 작품들을 감상해보세요.',
    'cardnews.recent.pages': '장',
    'cardnews.recent.view_all': '갤러리 전체보기',
    'cardnews.ad.label': '광고',
    'cardnews.ad.title': '톱니바꿈 추천 도서 및 장비',
    'cardnews.ad.desc': '본 페이지는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
    'cardnews.ad.loading': '광고를 불러오는 중입니다...',

    // Card News Editor Warnings
    'editor.warning.title': '💻 PC 환경 권장',
    'editor.warning.text': '카드뉴스 에디터는 화면 배치를 실시간으로 편집하는 도구로, PC 및 데스크톱 브라우저에 최적화되어 있습니다.',
    'editor.warning.sub': '모바일 기기에서는 편집 화면이 정상적으로 표시되지 않거나 불편할 수 있으니 가급적 PC로 접속해 주시기 바랍니다.',
    'editor.warning.continue': '계속 진행하기',
    'editor.iframe.title': '카드뉴스 에디터',

    // Gallery
    'gallery.back': '소개 페이지로 돌아가기',
    'gallery.title': '발행 갤러리',
    'gallery.subtitle': '사용자들이 에디터에서 완성하여 공유한 생생한 카드뉴스 포트폴리오입니다.',
    'gallery.empty.title': '아직 발행된 카드뉴스가 없습니다.',
    'gallery.empty.sub': '첫 번째로 멋진 카드뉴스를 만들어 갤러리에 공유해 보세요!',
    'gallery.empty.action': '에디터로 카드뉴스 만들기',

    // Deck Viewer
    'deck.not_found': '⚠️ 카드뉴스를 찾을 수 없습니다',
    'deck.not_found_desc': '존재하지 않는 덱이거나 삭제 처리되었을 수 있습니다.',
    'deck.back_to_gallery': '갤러리로 돌아가기',
    'deck.back_to_list': '갤러리 목록으로',
    'deck.delete': '삭제하기',
    'deck.delete_tooltip': '발행물 삭제',
    'deck.no_image': '불러온 이미지가 없습니다.',
    'deck.delete_modal.title': '발행물 삭제 인증',
    'deck.delete_modal.desc': '발행물을 삭제하려면 에디터 발행 시 사용했던 발행 승인 비밀번호를 입력해야 합니다. 삭제 시 DB와 Storage의 백업 이미지 파일들이 모두 영구 삭제되며, 복구할 수 없습니다.',
    'deck.delete_modal.placeholder': '비밀번호 입력',
    'deck.delete_modal.cancel': '취소',
    'deck.delete_status.enter_pwd': '비밀번호를 입력해주세요.',
    'deck.delete_status.deleting': '삭제 진행 중...',
    'deck.delete_status.success': '✅ 삭제되었습니다. 갤러리로 리다이렉트합니다.',
    'deck.delete_status.error': '⚠️ 에러: ',

    // AI News
    'news.title': 'AI 뉴스 리포트',
    'news.subtitle': '인공지능 모델 및 플랫폼 트렌드를 실시간 수집 및 요약하여 전달합니다. 카드를 클릭하시면 상세 분석 리포트를 확인하실 수 있습니다.',
    'news.no_news': '등록된 AI 뉴스가 없습니다.',
    'news.visit_source': '원문 출처 방문',
    'news.share': '기사 공유하기',
    'news.copy_success': '링크 복사 완료',
    'news.close': '닫기',
    'news.source_url': '출처 URL:',
    'news.first_page': '첫 페이지',
    'news.prev_page': '이전 페이지',
    'news.next_page': '다음 페이지',
    'news.last_page': '마지막 페이지',
    'news.prev': '이전',
    'news.next': '다음',

    // Video
    'video.title': '영상제작 포트폴리오',
    'video.subtitle': '유튜브 롱폼/쇼츠, 인트로, 브랜드 홍보 영상 등 AI 자동화 편집 기술이 가미된 풍부한 비디오 제작 포트폴리오입니다.',
    'video.no_portfolio': '등록된 영상제작 포트폴리오가 없습니다.',

    // Image Download
    'download.loading': '이미지 불러오는 중...',
    'download.title': '영상 주인공 이미지 리소스',
    'download.subtitle': '영상 자동화 제작 및 유튜브, 카카오톡 홍보에 자유롭게 활용할 수 있는 고품질 디자인 템플릿입니다. 간단한 성함과 이메일 정보를 입력하시면 즉시 다운로드가 시작되고, 메일로도 평생 영구 보관용 링크를 발송해 드립니다.',
    'download.search_placeholder': '주인공 이미지 제목 검색 (예: 철학, 건강, 노인...)',
    'download.reset_search': '검색어 초기화',
    'download.no_results_search': '검색어와 일치하는 주인공 이미지가 없습니다.',
    'download.no_resources': '등록된 주인공 이미지 리소스가 없습니다. 관리자 대시보드에서 등록해 주세요.',
    'download.count': '다운로드: ',
    'download.count_unit': '회',
    'download.action': '다운로드 신청하기',
    'download.modal_title': '리소스 무료 다운로드 신청',
    'download.modal_desc': '선택하신 [{title}] 리소스 다운로드를 위해 아래 정보를 입력해 주세요.',
    'download.name_label': '이름 / 닉네임',
    'download.name_placeholder': '홍길동',
    'download.email_label': '이메일 주소',
    'download.cancel': '취소',
    'download.processing': '신청 처리 중...',
    'download.submit': '이메일 전송 & 다운로드',
    'download.success_title': '이메일 발송 완료!',
    'download.success_desc': '입력하신 이메일({email})로 다운로드 링크를 발송해 드렸습니다. 메일함(또는 스팸함)을 확인하여 다운로드해 주세요.',
    'download.confirm': '확인',
    'download.err_name': '이름 또는 닉네임을 입력해주세요.',
    'download.err_email': '유효한 이메일 주소를 입력해주세요.',
    'download.err_process': '다운로드 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'download.err_fail': '이미지 파일 다운로드에 실패했습니다. 관리자에게 문의해 주세요.',
    'download.go_main': '메인 화면으로 가기',
    'download.file_size': '파일 크기: ',

    // Websites
    'websites.title': '제작 홈페이지',
    'websites.subtitle': '반응형 모던 인터페이스 디자인, Supabase 백엔드 데이터 연동, 그리고 편리한 관리 기능이 통합된 차별화된 홈페이지 제작 사례입니다.',
    'websites.no_portfolio': '등록된 홈페이지 포트폴리오가 없습니다.',

    // Insights
    'insights.title': '기술 인사이트',
    'insights.subtitle': '프롬프트 엔지니어링 템플릿, 비즈니스 자동화 워크플로우 설계서, AI 개발 지침 가이드 등 가치 있는 지식형 인사이트 자산군입니다.',
    'insights.no_portfolio': '등록된 인사이트 포트폴리오가 없습니다.',

    // CardNews Gallery
    'gallery.back': '소개 페이지로 돌아가기',
    'gallery.title': '발행 갤러리',
    'gallery.subtitle': '사용자들이 에디터에서 완성하여 공유한 생생한 카드뉴스 포트폴리오입니다.',
    'gallery.no_news': '아직 발행된 카드뉴스가 없습니다.',
    'gallery.no_news_sub': '첫 번째로 멋진 카드뉴스를 만들어 갤러리에 공유해 보세요!',
    'gallery.create_btn': '에디터로 카드뉴스 만들기',
    
    // DeckViewer
    'deck.back': '갤러리 목록으로',
    'deck.delete': '삭제하기',
    'deck.no_card': '불러온 이미지가 없습니다.',
    'deck.delete_title': '발행물 삭제 인증',
    'deck.delete_desc': '발행물을 삭제하려면 에디터 발행 시 사용했던 발행 승인 비밀번호를 입력해야 합니다. 삭제 시 DB와 Storage의 백업 이미지 파일들이 모두 영구 삭제되며, 복구할 수 없습니다.',
    'deck.pw_placeholder': '비밀번호 입력',
    'deck.redirecting': '✅ 삭제되었습니다. 갤러리로 리다이렉트합니다.',
    'deck.err_pw': '비밀번호를 입력해주세요.',
    'deck.deleting': '삭제 진행 중...',
    'deck.err_failed': '⚠️ 에러: ',
    'deck.not_found': '⚠️ 카드뉴스를 찾을 수 없습니다',
    'deck.not_found_desc': '존재하지 않는 덱이거나 삭제 처리되었을 수 있습니다.',
    'deck.back_to_gallery': '갤러리로 돌아가기',

    // About Page
    'about.badge': 'About GearsShift AI World',
    'about.title': '톱니바꿈 AI월드 소개',
    'about.subtitle': 'AI 기술을 현실의 유용한 가치로 전환하는 톱니바꿈의 기술 여정',
    'about.who_title': '누구인가요?',
    'about.who_desc1': '톱니바꿈 AI월드는 30년 경력의 시니어 소프트웨어 엔지니어가 최신 생성형 AI(Generative AI) 모델과 인공지능 에이전트 기법을 연구하고, 이를 실질적인 업무 자동화 솔루션 및 어플리케이션으로 가시화하여 제공하는 기술 공유 허브입니다.',
    'about.who_desc2': '인공지능 기술의 진정한 가치는 단순히 모델의 거대함에 있는 것이 아니라, 개개인의 창작 활동과 비즈니스 워크플로우 내에서 맞물려 돌아가는 단단한 톱니바퀴처럼 실용적으로 작동할 때 발현된다는 신념으로 개발에 임하고 있습니다.',
    'about.activity_title': '주요 활동 및 제공 서비스',
    'about.act1_title': 'AI 자동화 솔루션 개발',
    'about.act1_desc': 'VrewMatcher Pro(영상 자막/번역 매칭 최적화 도구), TimeBox Daily Planner(일론 머스크식 시간 관리 플래너) 등 AI와 실무 워크플로우를 결합한 고효율 비즈니스 애플리케이션을 전문 제작합니다.',
    'about.act2_title': '실전 지식 공유 및 크리에이터',
    'about.act2_desc': '유튜브 채널 [코드야놀자톱니바꿈] 등을 운영하며 초보자부터 전문가까지 생성형 AI 코딩 비서와 대형 언어 모델(LLM)을 업무에 실질적으로 도입할 수 있는 실무 교육 콘텐츠를 제작 및 제공합니다.',
    'about.act3_title': '차세대 웹 제작 서비스',
    'about.act3_desc': 'Next.js 15+, Supabase, Vercel Edge 네트워크를 활용해 로딩 지연이 없는 최고 수준의 정적 생성(SSG) 검색엔진 최적화(SEO) 반응형 랜딩 페이지 및 비즈니스 플랫폼 개발 서비스를 제공합니다.',
    'about.cta_title': '기술 협업 및 맞춤 솔루션 문의',
    'about.cta_desc': '업무 프로세스에 AI 자동화를 도입하고 싶으시거나 프로그램 커스텀 제작, 홈페이지 구축 등 비즈니스 파트너십이 필요하시면 편하게 문의해 주시기 바랍니다.',
    'about.cta_btn': '카카오 오픈채팅 문의하기',

    // Footer
    'footer.copyright': '© {year} 톱니바꿈 AI월드. All rights reserved.',
    'footer.desc': 'AI 기술을 활용한 혁신적인 어플리케이션과 트렌드 분석 리포트를 제공합니다.',
    'footer.link.about': '소개',
    'footer.link.privacy': '개인정보처리방침',
    'footer.inquiry': '프로그램 및 비즈니스 문의',

    // Privacy Page
    'privacy.title': '개인정보처리방침',
    'privacy.subtitle': '톱니바꿈 AI월드 서비스 이용자를 위한 개인정보 수집 및 이용 안내',
    'privacy.updated': '최종 수정일: 2026년 7월 21일'
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.news': 'AI News',
    'nav.video': 'AI Videos',
    'nav.download': 'Character Img',
    'nav.homepage': 'Websites',
    'nav.insights': 'Insights',
    'nav.admin': 'Admin',
    'brand.title': 'GearsShift',
    'brand.subtitle': 'AI World',

    // Hero
    'hero.badge': 'PORTFOLIO & INSIGHTS',
    'hero.title_pre': 'GearsShift ',
    'hero.title_post': 'AI World',
    'hero.desc': 'Expand the limits of your work by leveraging field-proven AI automation solutions, cutting-edge AI applications, and valuable insights.',
    'hero.stat.today': 'Today\'s Visitors',
    'hero.stat.total': 'Total Visitors',
    'hero.stat.downloads': 'Character Image Downloads',
    'hero.stat.visitors_unit': ' visitors',
    'hero.stat.downloads_unit': ' times',
    'hero.action.explore': 'Explore Projects',
    'hero.action.inquire': 'Inquire Program',

    // Featured Projects
    'projects.title': 'Featured Projects',
    'projects.inquire': 'Inquire Program',

    // Category tabs
    'cat.all': 'All',
    'cat.recommend': 'AI Recommend',
    'cat.app': 'App',
    'cat.insight': 'Insight',

    // CardNews Banner & Section
    'cardnews.badge': '✨ Revolution in Card News Creation',
    'cardnews.title_pre': 'Just Paste Your Text,',
    'cardnews.title_post': 'Instantly Auto-Generate Card News',
    'cardnews.desc': 'From text summarization to high-quality background image selection, and applying 6 design style themes. Mass-produce your social media content in 5 minutes with our AI card news automation tool.',
    'cardnews.action': 'Start Editor',
    'cardnews.recent': 'Recently Published Card News',
    'cardnews.recent_desc': 'Explore and enjoy the creations completed and shared by GearsShift users.',
    'cardnews.view_all': 'View Full Gallery',
    'cardnews.ad_title': 'GearsShift Recommended Books & Gear',
    'cardnews.ad_desc': 'This section contains affiliate links. We may receive a commission on qualifying purchases.',
    'cardnews.card_unit': ' slides',

    // Card News Editor Warnings
    'editor.warning.title': '💻 PC View Recommended',
    'editor.warning.text': 'The card news editor is a real-time layout editing tool optimized for PC and desktop browsers.',
    'editor.warning.sub': 'It may not display correctly or may be uncomfortable to use on mobile devices. Please access it from a PC if possible.',
    'editor.warning.continue': 'Continue anyway',
    'editor.iframe.title': 'Card News Editor',

    // Gallery
    'gallery.back': 'Back to Intro Page',
    'gallery.title': 'Published Gallery',
    'gallery.subtitle': 'Live card news portfolios created and shared by our users in the editor.',
    'gallery.empty.title': 'No card news articles have been published yet.',

    // Deck Viewer
    'deck.not_found': '⚠️ Card News Not Found',
    'deck.not_found_desc': 'The deck does not exist or may have been deleted.',
    'deck.back_to_gallery': 'Back to Gallery',
    'deck.back_to_list': 'Back to Gallery List',
    'deck.delete': 'Delete',
    'deck.delete_tooltip': 'Delete publication',
    'deck.no_image': 'No images loaded.',
    'deck.delete_modal.title': 'Verify Publication Deletion',
    'deck.delete_modal.desc': 'To delete this publication, enter the authorization password used during creation. Upon deletion, backup image files in the database and storage will be permanently deleted and cannot be recovered.',
    'deck.delete_modal.placeholder': 'Enter Password',
    'deck.delete_modal.cancel': 'Cancel',
    'deck.delete_status.enter_pwd': 'Please enter the password.',
    'deck.delete_status.deleting': 'Deleting...',
    'deck.delete_status.success': '✅ Deleted successfully. Redirecting to gallery.',
    'deck.delete_status.error': '⚠️ Error: ',
    'gallery.empty.sub': 'Be the first to create and share a stunning card news in the gallery!',
    'gallery.empty.action': 'Create Card News in Editor',

    // AI News
    'news.title': 'AI News Reports',
    'news.subtitle': 'We collect and summarize AI models and platform trends in real-time. Click any card to check the detailed analysis report.',
    'news.no_news': 'No AI news articles found.',
    'news.visit_source': 'Visit Original Source',
    'news.share': 'Share Article',
    'news.copy_success': 'Link Copied',
    'news.close': 'Close',
    'news.source_url': 'Source URL:',
    'news.first_page': 'First Page',
    'news.prev_page': 'Previous Page',
    'news.next_page': 'Next Page',
    'news.last_page': 'Last Page',
    'news.prev': 'Prev',
    'news.next': 'Next',

    // Video
    'video.title': 'Video Production Portfolio',
    'video.subtitle': 'Rich video portfolio including YouTube long-form/shorts, intros, and brand promotions, enhanced with AI automated editing technologies.',
    'video.no_portfolio': 'No video production portfolio found.',

    // Image Download
    'download.loading': 'Loading images...',
    'download.title': 'Video Character Image Resources',
    'download.subtitle': 'High-quality design templates that can be freely used for automated video production, YouTube, and messaging promotions. Enter your name and email to immediately start downloading, and receive a permanent lifetime link via email.',
    'download.search_placeholder': 'Search character titles (e.g., philosophy, health, senior...)',
    'download.reset_search': 'Reset Search',
    'download.no_results_search': 'No character images match your search criteria.',
    'download.no_resources': 'No character image resources registered. Please register them in the admin dashboard.',
    'download.count': 'Downloads: ',
    'download.count_unit': ' times',
    'download.action': 'Request Download',
    'download.modal_title': 'Apply for Free Resource Download',
    'download.modal_desc': 'Please enter your information to download the selected resource: [{title}]',
    'download.name_label': 'Name / Nickname',
    'download.name_placeholder': 'John Doe',
    'download.email_label': 'Email Address',
    'download.cancel': 'Cancel',
    'download.processing': 'Processing request...',
    'download.submit': 'Send Email & Download',
    'download.success_title': 'Email Sent Successfully!',
    'download.success_desc': 'We have sent the download link to {email}. Please check your inbox (or spam folder) to download.',
    'download.confirm': 'OK',
    'download.err_name': 'Please enter your name or nickname.',
    'download.err_email': 'Please enter a valid email address.',
    'download.err_process': 'An error occurred during download processing. Please try again shortly.',
    'download.err_fail': 'Failed to download the image file. Please contact the administrator.',
    'download.go_main': 'Go to Main Screen',
    'download.file_size': 'File Size: ',

    // Websites
    'websites.title': 'Websites Portfolio',
    'websites.subtitle': 'Showcasing our outstanding website templates built with responsive designs, Supabase backend databases, and robust admin panels.',
    'websites.no_portfolio': 'No website portfolio found.',

    // Insights
    'insights.title': 'Tech Insights',
    'insights.subtitle': 'Valuable knowledge assets including prompt engineering templates, business automation workflows, and AI development guidebooks.',
    'insights.no_portfolio': 'No tech insights found.',

    // CardNews Gallery
    'gallery.back': 'Back to About Page',
    'gallery.title': 'Published Gallery',
    'gallery.subtitle': 'A vibrant gallery of card news portfolios created and shared by our users.',
    'gallery.no_news': 'No card news has been published yet.',
    'gallery.no_news_sub': 'Be the first to create and share your amazing card news here!',
    'gallery.create_btn': 'Create Card News in Editor',

    // DeckViewer
    'deck.back': 'Back to Gallery List',
    'deck.delete': 'Delete',
    'deck.no_card': 'No images loaded.',
    'deck.delete_title': 'Confirm Publication Deletion',
    'deck.delete_desc': 'To delete this deck, you must enter the approval password you set when publishing. Deletion permanently removes backup images from both the database and storage, and cannot be undone.',
    'deck.pw_placeholder': 'Enter Password',
    'deck.redirecting': '✅ Deleted. Redirecting to gallery...',
    'deck.err_pw': 'Please enter the password.',
    'deck.deleting': 'Deleting in progress...',
    'deck.err_failed': '⚠️ Error: ',
    'deck.not_found': '⚠️ Card News Not Found',
    'deck.not_found_desc': 'The requested card news does not exist or has been deleted.',
    'deck.back_to_gallery': 'Back to Gallery',

    // About Page
    'about.badge': 'About GearsShift AI World',
    'about.title': 'About GearsShift AI World',
    'about.subtitle': 'GearsShift\'s technological journey to translate AI technology into real-world value',
    'about.who_title': 'Who are we?',
    'about.who_desc1': 'GearsShift AI World is a technology sharing hub where a senior software engineer with over 30 years of experience researches the latest generative AI models and AI agent techniques, materializing them into practical business automation solutions and applications.',
    'about.who_desc2': 'We believe that the true value of AI lies not in the sheer size of the model, but when it operates practically, like solid cogs meshing together in individual creative activities and business workflows.',
    'about.activity_title': 'Key Activities & Services',
    'about.act1_title': 'AI Automation Solutions',
    'about.act1_desc': 'We specialize in building high-efficiency business apps that combine AI and workflows, such as VrewMatcher Pro (video subtitle matcher) and TimeBox Daily Planner (Musk-style daily planner).',
    'about.act2_title': 'Knowledge Sharing & Creation',
    'about.act2_desc': 'Through our YouTube channel and platforms, we provide practical educational contents to help everyone from beginners to experts effectively introduce AI assistants and LLMs into their daily work.',
    'about.act3_title': 'Next-Gen Web Development',
    'about.act3_desc': 'Utilizing Next.js 15+, Supabase, and Vercel Edge networks to deliver top-tier responsive landing pages and business platforms optimized for SEO and zero loading latency.',
    'about.cta_title': 'Tech Collaboration & Custom Solutions',
    'about.cta_desc': 'If you want to introduce AI automation into your workflow, require custom programs, or need homepage development, feel free to contact us.',
    'about.cta_btn': 'Contact via Kakao Open Chat',

    // Footer
    'footer.copyright': '© {year} GearsShift AI World. All rights reserved.',
    'footer.desc': 'Providing innovative applications and trend analysis reports leveraging AI technology.',
    'footer.link.about': 'About',
    'footer.link.privacy': 'Privacy Policy',
    'footer.inquiry': 'Business & Program Inquiries',

    // Privacy Page
    'privacy.title': 'Privacy Policy',
    'privacy.subtitle': 'Privacy Policy and Terms for GearsShift AI World Service Users',
    'privacy.updated': 'Last Updated: July 21, 2026'
  }
};

// Database items translation mappings for EN
const dbTranslations = {
  // Portfolio Items Titles
  'AI Shorts Generator': {
    title: 'AI Shorts Generator',
    description: 'Automatically generates scripts and images, applying AI voices to edit videos for YouTube Shorts and TikTok.'
  },
  'Hermes News Collector': {
    title: 'Hermes News Collector',
    description: 'Real-time collection and summarization of global AI news, automatically publishing to Slack, Telegram, and websites.'
  },
  'Prompt Engineering Guide 2026': {
    title: 'Prompt Engineering Guide 2026',
    description: 'Systematic prompt writing framework and optimized prompt collections for business environments.'
  },
  'v0.dev by Vercel': {
    title: 'v0.dev by Vercel',
    description: 'A web publishing tool that generates production-ready React/Tailwind UI code from text prompts.'
  },
  '카드뉴스 자동화 도구': {
    title: 'CardNews Automation Tool',
    description: 'Paste text (article, script, memo) and AI automatically generates Instagram card news PNG sets (1080x1350).'
  },
  '톱니바꿈 1:1 문의(프로그램 관련)': {
    title: 'GearsShift 1:1 Inquiry (Programs)',
    description: 'Direct consultation on custom program development, homepage construction, and AI automation tools.'
  },
  'VrewMatcher Pro': {
    title: 'VrewMatcher Pro',
    description: 'Optimal utility designed to automatically synchronize and match video subtitles with translations.'
  },
  'TimeBox Daily Planner': {
    title: 'TimeBox Daily Planner',
    description: 'An Elon Musk-style daily calendar planner optimizing schedule and time blocking.'
  },
  '김부장 앱': {
    title: 'Manager Kim App',
    description: 'A productivity business assistant designed to help managers streamline team tasks.'
  },
  
  // AI News Items Titles
  'OpenAI, 초지능 모델 개발을 위한 차세대 아키텍처 공식 발표': {
    title: 'OpenAI Officially Announces Next-Gen Architecture for Superintelligence',
    description: 'OpenAI announced a new parallel inference architecture overcoming physical limits of transformers. It remains to be seen if it will control latency for large context sizes.',
    content: `## Key Summary of Next-Gen AI Architecture

📌[1] **Achieving Linear Time Complexity**: A new memory caching mechanism has been introduced to process self-attention computations (previously quadratic complexity) of transformer models linearly.
📌[2] **5x Inference Speedup**: Real-time conversational inference speed is maintained even in large context windows (up to 1M tokens), while reducing costs by over 40% compared to previous models.
📌[3] **Multi-Agent Concurrent Collaboration Architecture**: Distributed inference nodes reach consensus peer-to-peer (P2P) without a central core, solving complex tasks using a divide-and-conquer approach.

---

### Industry Analysis & Impact
This announcement implies a disruptive drop in the cost of running AI models. Industry experts project this to trigger the commercialization of **real-time unlimited context agents**, which were previously limited by cost concerns.

For detailed analysis reports and actual development benchmarks, refer to the following links.
- [OpenAI New Architecture Official Website](https://openai.com)
- [HuggingFace Benchmark Dataset](https://huggingface.co)`
  },
  'Google, 스마트 에이전트 생태계 강화를 위한 Project Astra API 정식 공개': {
    title: 'Google Officially Releases Project Astra API to Empower Smart Agent Ecosystem',
    description: 'Google has released the Project Astra developer kit, an ultra-low latency audio/video multimodal API connecting smart glasses and camera feeds.',
    content: `## Project Astra API Features & Practical Value

📌[1] **Ultra-Low Latency Video Streaming Processing**: Analyzes and understands 30fps video input within 100ms latency, delivering real-time audio feedback.
📌[2] **Continuous Long-term Memory**: Records key information from the user's past visual feeds permanently or semi-permanently, enabling continuous agent interactions.
📌[3] **Support for Various Local Device Embeddings**: Hybrid computation between edge devices and servers enables core agent tasks offline even on mobile devices.

---

### Action Plan for Developers
Developer keys can be issued immediately through the Google AI Studio and Vertex AI consoles. This is the optimal solution for teams wanting to embed smart agents into mobile apps or hardware devices.

- [Google AI Studio Link](https://ai.google.dev)
- [Project Astra API Detailed Documentation](https://ai.google.dev/docs)`
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ko');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLang = localStorage.getItem('language_pref');
    if (savedLang === 'ko' || savedLang === 'en') {
      setLanguage(savedLang);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang && browserLang.startsWith('en')) {
        setLanguage('en');
      }
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
    localStorage.setItem('language_pref', newLang);
  };

  const t = (key, defaultText = '') => {
    const dict = translations[language] || translations.ko;
    return dict[key] || defaultText || key;
  };

  const translateDb = (text, type = 'title', fallback = '') => {
    if (language === 'ko' || !text) return fallback || text;
    
    // Look up exact match
    const match = dbTranslations[text];
    if (match) {
      return match[type] || fallback || text;
    }

    // Dynamic partial matches for standard categories
    if (type === 'category') {
      if (text === '추천도구' || text === 'AI Recommend') return 'AI Recommend';
      if (text === '앱' || text === 'App') return 'App';
      if (text === '인사이트' || text === 'Insight') return 'Insight';
    }

    return fallback || text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, translateDb }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if context is not loaded yet (e.g. server-side rendering or before mount)
    return {
      language: 'ko',
      toggleLanguage: () => {},
      t: (key, defaultText = '') => defaultText || key,
      translateDb: (text) => text
    };
  }
  return context;
}
