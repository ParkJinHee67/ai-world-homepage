"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Key, Sparkles, Image as ImageIcon, Zap, FileText, CheckCircle2, ChevronDown, HelpCircle, Layers } from 'lucide-react';

export default function CardNewsClient({ initialDecks = [] }) {
  const [faqOpen, setFaqOpen] = useState({});
  const [decks, setDecks] = useState(initialDecks);

  useEffect(() => {
    try {
      const mockDecks = JSON.parse(localStorage.getItem('mock_cardnews_decks') || '[]');
      if (mockDecks.length > 0) {
        const combined = [...mockDecks, ...initialDecks];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setDecks(unique.slice(0, 4));
      } else {
        setDecks(initialDecks);
      }
    } catch (e) {
      console.warn('Failed to load mock decks in landing page:', e);
      setDecks(initialDecks);
    }
  }, [initialDecks]);

  const toggleFaq = (index) => {
    setFaqOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const steps = [
    {
      num: "01",
      title: "글 붙여넣기",
      desc: "뉴스 기사, 기획 초안, 블로그 포스트 등 제작하고 싶은 텍스트 내용을 에디터에 그대로 입력합니다."
    },
    {
      num: "02",
      title: "AI 카드 변환",
      desc: "빠른변환(규칙 기반) 또는 AI 변환(Claude)을 눌러 단 5초 만에 내용이 요약된 8~12장 카드 구조로 자동 생성합니다."
    },
    {
      num: "03",
      title: "스타일 및 배경 편집",
      desc: "시네마틱, 매거진 등 6종 테마를 선택하고 🎲셔플이나 AI 배경 생성을 통해 이미지를 꾸민 뒤 ZIP/PNG로 저장합니다."
    }
  ];

  const stylesPresets = [
    { name: "Cine (시네마틱)", desc: "다크 전면 + 블루 포인트 + 영화 스크린 감성", color: "#4d8dff", bg: "#0c0f16" },
    { name: "Mag (매거진 형광)", desc: "노랑 형광펜 강조 + 백지 본문 + 깔끔한 잡지 톤", color: "#111111", bg: "#ffffff", ink: "#111" },
    { name: "Manga (만화)", desc: "세로바 라벨 + 텍스트 섀도 + 강렬한 만화 컷 디자인", color: "#ff3b3b", bg: "#111111" },
    { name: "Pixel (픽셀 인포)", desc: "Black Han Sans 폰트 + 청키 배지 + 픽셀 아트 스타일", color: "#ff7a1a", bg: "#fff7ef", ink: "#231a12" },
    { name: "Doodle (손글씨)", desc: "귀여운 Gaegu 폰트 + 비정형 파스텔 핑크 테두리", color: "#ff6fa5", bg: "#fff0f5", ink: "#3a2a33" },
    { name: "Blue (화이트 & 블루)", desc: "정제된 블루 그라데이션 + 심플 비즈니스 톤", color: "#2f5bff", bg: "#ffffff", ink: "#101625" }
  ];

  const faqs = [
    {
      q: "API 키는 필수로 입력해야 하나요?",
      a: "아닙니다! API 키가 없어도 규칙 기반 요약 기능인 '빠른변환', 6종 디자인 스타일 선택, 🎲배경 셔플, Openverse 무료 이미지 검색, 카드 직접 편집, JSON 불러오기 및 ZIP 다운로드 등 핵심 기능의 80%를 제한 없이 무료로 즉시 사용할 수 있습니다."
    },
    {
      q: "입력한 API 키는 안전하게 보관되나요?",
      a: "네, 완벽히 안전합니다. 입력하신 API 키는 브라우저의 localStorage에만 저장되며, 어떠한 서버 데이터베이스나 로그 파일에도 기록되지 않습니다. 카드 변환이나 이미지 생성 시 요청 헤더로 해당 벤더사(Anthropic, Google, OpenAI)에 다이렉트로 전달되어 처리하는 프록시 방식만 적용되어 보안 유출 걱정이 전혀 없습니다."
    },
    {
      q: "Anthropic API 키는 어떻게 발급받나요?",
      a: "Anthropic Console(https://console.anthropic.com/)에 회원가입을 하신 뒤, [API Keys] 탭에서 [Create Key] 버튼을 클릭하여 발급받을 수 있습니다. 초기 가입 시 무료 크레딧을 제공하기도 하며, 크레딧 충전 후 바로 사용이 가능합니다. 에디터 내부의 설정 모달에서 바로가기 링크를 제공합니다."
    },
    {
      q: "AI 배경 이미지가 생성되지 않거나 에러가 발생합니다.",
      a: "AI 배경 이미지를 생성하기 위해서는 Google Gemini 키 또는 OpenAI API 키가 추가로 설정 모달에 등록되어야 합니다. 발급받으신 API 키에 잔여 크레딧이 있는지, 혹은 키가 활성화된 상태인지 각 서비스 콘솔에서 확인해 주세요."
    }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBlurLeft}></div>
        <div style={styles.heroBlurRight}></div>
        <div className="container-max" style={styles.heroInner}>
          <span style={styles.badge}><Sparkles size={14} /> 카드뉴스 제작의 혁명</span>
          <h1 style={styles.heroTitle}>
            글만 붙여넣으면,<br />
            <span style={styles.gradientText}>인스타 카드뉴스</span> 자동 완성
          </h1>
          <p style={styles.heroSub}>
            기사 요약부터 고화질 배경 이미지 선정, 6가지 디자인 스타일 테마 적용까지.<br />
            이제 AI 카드뉴스 자동화 도구로 SNS 콘텐츠를 5분 만에 양산하세요.
          </p>
          <div style={styles.heroActions}>
            <Link href="/cardnews/editor" style={styles.btnPrimary}>
              에디터 즉시 열기 <ArrowRight size={16} />
            </Link>
            <Link href="/cardnews/gallery" style={styles.btnSecondary}>
              발행물 갤러리 구경 <Layers size={16} />
            </Link>
          </div>
          
          <div style={styles.previewContainer}>
            <div style={styles.previewMock}>
              <div style={styles.previewHeader}>
                <span style={styles.dotRed}></span>
                <span style={styles.dotYellow}></span>
                <span style={styles.dotGreen}></span>
                <span style={styles.previewTitle}>CardNews Editor v3</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop" 
                alt="에디터 미리보기" 
                style={styles.previewImg} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section style={styles.section}>
        <div className="container-max">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>단 3단계로 완성되는 카드뉴스</h2>
            <p style={styles.sectionSub}>복잡한 포토샵이나 디자인 툴 없이 클릭 몇 번이면 충분합니다.</p>
          </div>
          <div style={styles.grid3}>
            {steps.map((step, idx) => (
              <div key={idx} style={styles.stepCard}>
                <span style={styles.stepNum}>{step.num}</span>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Styles Gallery */}
      <section style={{ ...styles.section, background: '#0a0910' }}>
        <div className="container-max">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>다채로운 6종 디자인 스타일</h2>
            <p style={styles.sectionSub}>선택하는 즉시 서체, 배경 분위기, 레이아웃 정체성이 완벽하게 전환됩니다.</p>
          </div>
          <div style={styles.grid3}>
            {stylesPresets.map((preset, idx) => (
              <div key={idx} style={styles.styleCard}>
                <div style={{ ...styles.styleCardPreview, background: preset.bg, color: preset.ink || '#fff' }}>
                  <span style={{ ...styles.styleCardBadge, background: preset.color }}>STYLE</span>
                  <div style={styles.styleCardTitle}>제목 가이드라인</div>
                  <div style={styles.styleCardSub}>부제 또는 설명글 위치</div>
                </div>
                <div style={styles.styleCardMeta}>
                  <h3 style={styles.styleCardName}>{preset.name}</h3>
                  <p style={styles.styleCardDesc}>{preset.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Key Comparison Table */}
      <section style={styles.section}>
        <div className="container-max">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>체험 모드 vs AI 연동 기능 비교</h2>
            <p style={styles.sectionSub}>API 키 등록 여부에 따라 더 많은 기능 확장이 가능합니다.</p>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>구분 / 기능</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>체험 모드 (API 키 미사용)</th>
                  <th style={{ ...styles.th, textAlign: 'center', color: '#818cf8' }}>AI 연동 모드 (본인 API 키 사용)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>기사/글 요약 변환</td>
                  <td style={styles.tdCenter}>규칙 기반 파서 (빠른변환)</td>
                  <td style={{ ...styles.tdCenter, color: '#818cf8', fontWeight: '600' }}>AI 변환 (Claude Haiku/Sonnet)</td>
                </tr>
                <tr>
                  <td style={styles.td}>디자인 스타일 적용</td>
                  <td style={styles.tdCenter}>6종 스타일 100% 지원</td>
                  <td style={styles.tdCenter}>6종 스타일 100% 지원</td>
                </tr>
                <tr>
                  <td style={styles.td}>배경 이미지 🎲 셔플</td>
                  <td style={styles.tdCenter}>테마별 고정 리소스 셔플</td>
                  <td style={styles.tdCenter}>테마별 고정 리소스 셔플</td>
                </tr>
                <tr>
                  <td style={styles.td}>배경 사진 검색</td>
                  <td style={styles.tdCenter}>Openverse 무료 사진 검색</td>
                  <td style={{ ...styles.tdCenter, color: '#818cf8', fontWeight: '600' }}>Pexels 고화질 세로 사진 검색</td>
                </tr>
                <tr>
                  <td style={styles.td}>AI 배경 이미지 생성</td>
                  <td style={styles.tdCenter}>지원 안 함</td>
                  <td style={{ ...styles.tdCenter, color: '#818cf8', fontWeight: '600' }}>Google Gemini / OpenAI DALL-E 생성</td>
                </tr>
                <tr>
                  <td style={styles.td}>다운로드 & 공유</td>
                  <td style={styles.tdCenter}>ZIP/PNG/JSON 다운로드</td>
                  <td style={{ ...styles.tdCenter, color: '#818cf8', fontWeight: '600' }}>다운로드 + 🚀 갤러리 즉시 발행</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent Published Decks */}
      {decks.length > 0 && (
        <section style={{ ...styles.section, background: '#0a0910' }}>
          <div className="container-max">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>최근 발행된 카드뉴스</h2>
              <p style={styles.sectionSub}>톱니바꿈 사용자들이 완성하여 발행한 작품들을 감상해보세요.</p>
            </div>
            <div style={styles.grid4}>
              {decks.map((deck) => (
                <Link key={deck.id} href={`/cardnews/gallery/${deck.id}`} style={styles.deckCard}>
                  <div style={styles.deckCardThumbContainer}>
                    <img 
                      src={deck.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"} 
                      alt={deck.title} 
                      style={styles.deckCardThumb}
                    />
                    <div style={styles.deckCardBadge}>{deck.card_count}장</div>
                  </div>
                  <div style={styles.deckCardContent}>
                    <h3 style={styles.deckCardTitle}>{deck.title}</h3>
                    <div style={styles.deckCardFooter}>
                      <span>👁 {deck.view_count || 0}</span>
                      <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link href="/cardnews/gallery" style={styles.btnSecondary}>
                갤러리 전체보기 <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* API Key Guide */}
      <section style={styles.section}>
        <div className="container-max" style={styles.guideContainer}>
          <div style={styles.guideTextSide}>
            <span style={{ ...styles.badge, backgroundColor: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }}>
              <Key size={14} /> API 키 발급 가이드
            </span>
            <h2 style={styles.guideTitle}>본인의 API 키를 발급받는 방법</h2>
            <p style={styles.guideDesc}>
              AI 요약 변환과 AI 배경 생성을 활용하려면 서비스 운영자의 키를 거치지 않는 **BYOK 방식**에 따라, 발급받으신 개인 API 키를 에디터 설정에 등록해 주셔야 합니다.
            </p>
            <ul style={styles.guideList}>
              <li>
                <strong style={{ color: '#fff' }}>Anthropic (AI 요약 변환)</strong>: <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" style={styles.link}>Anthropic 콘솔</a>에서 가입 후 계정에 충전한 뒤 API 키를 발급받으세요.
              </li>
              <li>
                <strong style={{ color: '#fff' }}>Google Gemini (배경 이미지 생성)</strong>: <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={styles.link}>Google AI Studio</a>에서 무료/유료 버전 키를 발급받을 수 있습니다.
              </li>
              <li>
                <strong style={{ color: '#fff' }}>OpenAI (배경 이미지 생성)</strong>: <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" style={styles.link}>OpenAI 개발자 플랫폼</a>에서 API 키를 생성하고 결제 수단을 연동하세요.
              </li>
              <li>
                <strong style={{ color: '#fff' }}>Pexels (사진 검색)</strong>: <a href="https://www.pexels.com/api/" target="_blank" rel="noreferrer" style={styles.link}>Pexels API 사이트</a>에서 완전 무료로 키를 신청 및 발급받을 수 있습니다.
              </li>
            </ul>
          </div>
          <div style={styles.guideImageSide}>
            <div style={styles.fakeConsole}>
              <div style={styles.fakeConsoleHeader}>Anthropic Console — API Keys</div>
              <div style={styles.fakeConsoleBody}>
                <div style={{ color: '#8b96b3', fontSize: '12px', marginBottom: '14px' }}>Active API Keys (1)</div>
                <div style={styles.fakeKeyRow}>
                  <span>sk-ant-api03-xxxx...xxxx</span>
                  <span style={styles.keyTag}>Active</span>
                </div>
                <div style={{ ...styles.btnPrimary, fontSize: '12px', padding: '8px 16px', alignSelf: 'flex-start', marginTop: '20px' }}>
                  + Create Key
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ ...styles.section, background: '#0a0910' }}>
        <div className="container-max" style={{ maxWidth: '800px' }}>
          <div style={styles.sectionHeader}>
            <HelpCircle size={36} style={{ color: '#818cf8', marginBottom: '12px' }} />
            <h2 style={styles.sectionTitle}>자주 묻는 질문 (FAQ)</h2>
            <p style={styles.sectionSub}>도구 이용 및 API 키 연동과 관련된 상세 답변입니다.</p>
          </div>
          <div style={styles.faqList}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={styles.faqItem}>
                <button onClick={() => toggleFaq(idx)} style={styles.faqQuestion}>
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    style={{ 
                      transform: faqOpen[idx] ? 'rotate(180deg)' : 'none', 
                      transition: 'transform 0.2s',
                      color: faqOpen[idx] ? '#818cf8' : '#6b7684'
                    }} 
                  />
                </button>
                {faqOpen[idx] && (
                  <div style={styles.faqAnswer}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner / Partners AD Section */}
      <section style={styles.section}>
        <div className="container-max">
          <div style={styles.bannerContainer}>
            <span style={styles.bannerLabel}>SPONSOR</span>
            <div style={styles.bannerContent}>
              <h3 style={styles.bannerTitle}>톱니바꿈의 추천 파트너스 배너 영역</h3>
              <p style={styles.bannerDesc}>
                본 서비스는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있으며 서비스 고도화에 전액 기여됩니다.
              </p>
            </div>
            <div style={styles.bannerAdSlot}>
              {/* 추후 애드센스 또는 쿠팡파트너스 광고 태그가 들어갈 예약 공간 */}
              <div style={styles.bannerAdPlaceholder}>광고 배너 영역 (100% 가로 확장)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={styles.bottomCtaSection}>
        <h2 style={styles.bottomCtaTitle}>지금 바로 첫 번째 카드뉴스를 제작해보세요</h2>
        <p style={styles.bottomCtaSub}>글 하나만 준비하면 준비는 끝납니다. 설치가 필요 없는 웹 브라우저 에디터.</p>
        <Link href="/cardnews/editor" style={{ ...styles.btnPrimary, fontSize: '16px', padding: '16px 36px' }}>
          무료로 에디터 열기 <Zap size={18} />
        </Link>
      </section>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#030207',
    color: '#f3f5fa',
    minHeight: '100vh',
    width: '100%',
    fontFamily: "'Pretendard', sans-serif",
  },
  heroSection: {
    padding: '120px 20px 80px',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  heroBlurLeft: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    filter: 'blur(100px)',
    top: '-100px',
    left: '-100px',
    zIndex: 0,
  },
  heroBlurRight: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(168, 85, 247, 0.12)',
    filter: 'blur(100px)',
    bottom: '0px',
    right: '-100px',
    zIndex: 0,
  },
  heroInner: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    lineHeight: '1.25',
    letterSpacing: '-.02em',
    marginBottom: '24px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#aab4c8',
    maxWidth: '700px',
    marginBottom: '40px',
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '70px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14.5px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)',
    transition: 'transform 0.2s, filter 0.2s',
    border: 'none',
    cursor: 'pointer',
  },
  btnSecondary: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f3f5fa',
    padding: '14px 28px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14.5px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  previewContainer: {
    width: '100%',
    maxWidth: '850px',
    padding: '0 10px',
  },
  previewMock: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
    backgroundColor: '#1b1b22',
  },
  previewHeader: {
    backgroundColor: '#111015',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  dotRed: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' },
  dotYellow: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' },
  dotGreen: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' },
  previewTitle: {
    color: '#6b7684',
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: '10px',
  },
  previewImg: {
    width: '100%',
    height: 'auto',
    display: 'block',
    opacity: 0.95,
  },
  section: {
    padding: '100px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '16px',
  },
  sectionSub: {
    fontSize: '16px',
    color: '#aab4c8',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
  },
  stepCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '40px 30px',
    position: 'relative',
    overflow: 'hidden',
  },
  stepNum: {
    fontSize: '48px',
    fontWeight: '800',
    color: 'rgba(99, 102, 241, 0.15)',
    position: 'absolute',
    top: '20px',
    right: '20px',
    lineHeight: 1,
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#ffffff',
  },
  stepDesc: {
    fontSize: '14.5px',
    lineHeight: '1.6',
    color: '#aab4c8',
  },
  styleCard: {
    background: '#131118',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  styleCardPreview: {
    height: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
  },
  styleCardBadge: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    fontSize: '9px',
    fontWeight: '700',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  styleCardTitle: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '8px',
  },
  styleCardSub: {
    fontSize: '12px',
    opacity: 0.7,
  },
  styleCardMeta: {
    padding: '20px',
  },
  styleCardName: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#fff',
  },
  styleCardDesc: {
    fontSize: '13px',
    color: '#aab4c8',
    lineHeight: '1.4',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14.5px',
    textAlign: 'left',
    minWidth: '600px',
  },
  th: {
    backgroundColor: '#0e0c15',
    padding: '16px 20px',
    fontWeight: '700',
    color: '#aab4c8',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  td: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#f3f5fa',
  },
  tdCenter: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#aab4c8',
    textAlign: 'center',
  },
  deckCard: {
    display: 'block',
    background: '#131118',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    overflow: 'hidden',
    textDecoration: 'none',
    transition: 'transform 0.2s',
  },
  deckCardThumbContainer: {
    position: 'relative',
    aspectRatio: '1080/1350',
    backgroundColor: '#000',
  },
  deckCardThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  deckCardBadge: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  deckCardContent: {
    padding: '16px',
  },
  deckCardTitle: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  deckCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#6b7684',
  },
  guideContainer: {
    display: 'flex',
    gap: '60px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  guideTextSide: {
    flex: '1 1 450px',
  },
  guideTitle: {
    fontSize: '32px',
    fontWeight: '800',
    margin: '20px 0',
  },
  guideDesc: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#aab4c8',
    marginBottom: '24px',
  },
  guideList: {
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    fontSize: '14.5px',
    color: '#aab4c8',
  },
  link: {
    color: '#818cf8',
    textDecoration: 'underline',
  },
  guideImageSide: {
    flex: '1 1 350px',
    display: 'flex',
    justifyContent: 'center',
  },
  fakeConsole: {
    width: '100%',
    maxWidth: '400px',
    background: '#0c0b11',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
  },
  fakeConsoleHeader: {
    backgroundColor: '#16151c',
    padding: '12px 20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#aab4c8',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  fakeConsoleBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  fakeKeyRow: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#10b981',
  },
  keyTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: '700',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '20px',
  },
  faqItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  faqQuestion: {
    width: '100%',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqAnswer: {
    padding: '0 24px 24px',
    color: '#aab4c8',
    fontSize: '14.5px',
    lineHeight: '1.6',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    paddingTop: '20px',
  },
  bannerContainer: {
    background: 'linear-gradient(135deg, #14131b 0%, #0d0c12 100%)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  bannerLabel: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  bannerContent: {},
  bannerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#fff',
  },
  bannerDesc: {
    fontSize: '14px',
    color: '#aab4c8',
    lineHeight: '1.5',
  },
  bannerAdSlot: {
    width: '100%',
    height: '100px',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  bannerAdPlaceholder: {
    fontSize: '13px',
    color: '#6b7684',
  },
  bottomCtaSection: {
    padding: '120px 20px',
    textAlign: 'center',
    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bottomCtaTitle: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '20px',
  },
  bottomCtaSub: {
    fontSize: '16px',
    color: '#aab4c8',
    marginBottom: '40px',
    maxWidth: '600px',
  }
};
