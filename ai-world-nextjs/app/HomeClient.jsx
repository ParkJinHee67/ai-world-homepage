"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { db, mapPortfolioItem, supabase } from './supabaseClient';
import PortfolioCard from '../components/PortfolioCard';
import { MessageSquare, Star, Sparkles } from 'lucide-react';

function CloudWordCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = 380;
    let height = 380;
    let cx = width / 2;
    let cy = height / 2;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width || 380;
        const h = entry.contentRect.height || 380;
        canvas.width = w;
        canvas.height = h;
        width = w;
        height = h;
        cx = w / 2;
        cy = h / 2;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const wordsList = [
      '톱니바꿈', 'AI', 'LLM', 'Agent', 'Prompt', 'Automation', 'Flow', 
      'Cognitive', 'Neural', 'Smart', 'Workflow', 'Data', 'Logic', 'AGI', 
      'Future', 'Vision', 'Generative', 'Chat', 'Bot', 'Assistant'
    ];

    // Combine floating words and neural network bokeh dots
    const numParticles = 45;
    const particles = Array.from({ length: numParticles }, (_, i) => {
      const isText = i < 12; 
      const word = isText ? wordsList[i % wordsList.length] : null;
      const size = isText ? (13 + Math.random() * 5) : 0;
      const radius = isText ? 2.5 : (2 + Math.random() * 5); // bokeh size
      
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius,
        isText,
        text: word,
        size,
        alpha: isText ? (0.8 + Math.random() * 0.2) : (0.28 + Math.random() * 0.35),
        color: i % 3 === 0 
          ? '99, 102, 241' 
          : (i % 3 === 1 ? '168, 85, 247' : '244, 63, 94'),
      };
    });

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    canvas.parentElement.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

    let rotationAngle = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      rotationAngle += 0.0025; // Rotate slowly

      // 1. Calculate elastic gear center point based on mouse hover
      let mouseOffset = { x: 0, y: 0 };
      if (mouse.x > -1000) {
        const dx = mouse.x - cx;
        const dy = mouse.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < 220) {
          const force = (220 - dist) / 220 * 24; // Elastic shift up to 24px
          mouseOffset.x = (dx / dist) * force;
          mouseOffset.y = (dy / dist) * force;
        }
      }

      const gearCx = cx + mouseOffset.x;
      const gearCy = cy + mouseOffset.y;

      // 2. Generate gear nodes
      const gearNodes = [];
      // Hub (center)
      gearNodes.push({ x: gearCx, y: gearCy, isHub: true });

      // Inner ring (6 nodes, radius 55)
      const numInner = 6;
      for (let i = 0; i < numInner; i++) {
        const a = rotationAngle + (i * Math.PI * 2) / numInner;
        gearNodes.push({
          x: gearCx + Math.cos(a) * 55,
          y: gearCy + Math.sin(a) * 55,
          isInner: true,
          index: i
        });
      }

      // Outer ring (12 nodes, radius 105)
      const numOuter = 12;
      for (let i = 0; i < numOuter; i++) {
        const a = -rotationAngle * 0.8 + (i * Math.PI * 2) / numOuter; // reverse rotation
        gearNodes.push({
          x: gearCx + Math.cos(a) * 105,
          y: gearCy + Math.sin(a) * 105,
          isOuter: true,
          index: i
        });
      }

      // Gear teeth (6 teeth, 2 nodes each, radius 130)
      const numTeeth = 6;
      for (let i = 0; i < numTeeth; i++) {
        const baseAngle = rotationAngle + (i * Math.PI * 2) / numTeeth;
        const a1 = baseAngle - 0.14;
        const a2 = baseAngle + 0.14;
        gearNodes.push({
          x: gearCx + Math.cos(a1) * 130,
          y: gearCy + Math.sin(a1) * 130,
          isTooth: true,
          toothIndex: i,
          part: 1
        });
        gearNodes.push({
          x: gearCx + Math.cos(a2) * 130,
          y: gearCy + Math.sin(a2) * 130,
          isTooth: true,
          toothIndex: i,
          part: 2
        });
      }

      // 3. Draw gear connections
      ctx.lineWidth = 0.8;
      ctx.shadowBlur = 4;

      // Hub to Inner
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.55)';
      ctx.shadowColor = 'rgba(99, 102, 241, 0.65)';
      for (let i = 1; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(gearNodes[0].x, gearNodes[0].y);
        ctx.lineTo(gearNodes[i].x, gearNodes[i].y);
        ctx.stroke();
      }

      // Inner circle outline
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)';
      ctx.shadowColor = 'rgba(168, 85, 247, 0.75)';
      ctx.beginPath();
      ctx.moveTo(gearNodes[1].x, gearNodes[1].y);
      for (let i = 2; i <= 6; i++) {
        ctx.lineTo(gearNodes[i].x, gearNodes[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner to Outer spoke lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
      for (let i = 0; i < 6; i++) {
        const innerNode = gearNodes[1 + i];
        const outerNode1 = gearNodes[7 + (i * 2) % 12];
        const outerNode2 = gearNodes[7 + (i * 2 + 1) % 12];

        ctx.beginPath();
        ctx.moveTo(innerNode.x, innerNode.y);
        ctx.lineTo(outerNode1.x, outerNode1.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(innerNode.x, innerNode.y);
        ctx.lineTo(outerNode2.x, outerNode2.y);
        ctx.stroke();
      }

      // Outer circle outline with gear teeth inserted
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
      ctx.shadowColor = 'rgba(244, 63, 94, 0.75)';
      for (let i = 0; i < 6; i++) {
        const oIdx1 = 7 + i * 2;
        const oIdx2 = 7 + i * 2 + 1;
        const tIdx1 = 19 + i * 2;
        const tIdx2 = 19 + i * 2 + 1;

        // Connect outer node 1 to tooth 1
        ctx.beginPath();
        ctx.moveTo(gearNodes[oIdx1].x, gearNodes[oIdx1].y);
        ctx.lineTo(gearNodes[tIdx1].x, gearNodes[tIdx1].y);
        ctx.stroke();

        // Connect tooth 1 to tooth 2
        ctx.beginPath();
        ctx.moveTo(gearNodes[tIdx1].x, gearNodes[tIdx1].y);
        ctx.lineTo(gearNodes[tIdx2].x, gearNodes[tIdx2].y);
        ctx.stroke();

        // Connect tooth 2 to outer node 2
        ctx.beginPath();
        ctx.moveTo(gearNodes[tIdx2].x, gearNodes[tIdx2].y);
        ctx.lineTo(gearNodes[oIdx2].x, gearNodes[oIdx2].y);
        ctx.stroke();

        // Connect outer node 2 of tooth i to outer node 1 of tooth i+1
        const nextOIdx = 7 + (i * 2 + 2) % 12;
        ctx.beginPath();
        ctx.moveTo(gearNodes[oIdx2].x, gearNodes[oIdx2].y);
        ctx.lineTo(gearNodes[nextOIdx].x, gearNodes[nextOIdx].y);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // 4. Draw connections between floating background particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 100) {
            const alpha = (100 - dist) / 100 * 0.28;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 5. Connect floating particles dynamically to nearest gear nodes
      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        if (p.isText) {
          ctx.font = `bold ${p.size}px var(--font-title)`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw elastic connection to nearest gear node
        let minDynamicDist = 120;
        let closestNode = null;

        gearNodes.forEach((node) => {
          const distance = Math.hypot(p.x - node.x, p.y - node.y);
          if (distance < minDynamicDist) {
            minDynamicDist = distance;
            closestNode = node;
          }
        });

        if (closestNode) {
          const connectionAlpha = (120 - minDynamicDist) / 120 * 0.36;
          ctx.strokeStyle = `rgba(${p.color}, ${connectionAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(closestNode.x, closestNode.y);
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  }} />;
}

export default function HomeClient({ initialItems, initialStats, highlightId }) {
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [highlightCardId, setHighlightCardId] = useState(null);
  const [stats, setStats] = useState(initialStats);
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  // TimeBox Promotion Popup logic
  useEffect(() => {
    const hidePopupDate = localStorage.getItem('hideTimeBoxPromo');
    const todayStr = new Date().toLocaleDateString('sv-SE');
    if (hidePopupDate !== todayStr) {
      const timer = setTimeout(() => {
        setShowPromoPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePromo = () => {
    setShowPromoPopup(false);
  };

  const handleHidePromoToday = () => {
    const todayStr = new Date().toLocaleDateString('sv-SE');
    localStorage.setItem('hideTimeBoxPromo', todayStr);
    setShowPromoPopup(false);
  };

  // Load and subscribe to real-time stats (visitors & downloads)
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const dailyKey = `visitors_daily:${todayStr}`;

    async function loadStats() {
      try {
        const { data } = await db.getStats();
        if (data) {
          setStats({
            visitors: (data.visitors || 0) + 1000,
            visitorsToday: (data[dailyKey] || 0) + 4,
            downloads: (data.downloads || 0) + 1000
          });
        }
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
    }
    loadStats();

    async function trackVisit() {
      const hasVisited = sessionStorage.getItem('has_visited_session');
      if (!hasVisited) {
        sessionStorage.setItem('has_visited_session', 'true');
        try {
          await db.incrementStat('visitors');
          const { data } = await db.incrementStat(dailyKey);
          if (data && db.isMock) {
            setStats(prev => ({
              ...prev,
              visitors: (data.visitors || 0) + 1000,
              visitorsToday: (data[dailyKey] || 0) + 4
            }));
          }
        } catch (e) {
          console.error('Failed to track visit:', e);
        }
      }
    }
    trackVisit();

    let channel = null;
    if (!db.isMock && supabase) {
      channel = supabase
        .channel('site-stats-changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'site_stats' },
          (payload) => {
            const updatedRow = payload.new;
            if (updatedRow && updatedRow.key) {
              setStats(prev => {
                if (updatedRow.key === 'visitors') {
                  return { ...prev, visitors: Number(updatedRow.value) + 1000 };
                } else if (updatedRow.key === dailyKey) {
                  return { ...prev, visitorsToday: Number(updatedRow.value) + 4 };
                } else if (updatedRow.key === 'downloads') {
                  return { ...prev, downloads: Number(updatedRow.value) + 1000 };
                }
                return prev;
              });
            }
          }
        )
        .subscribe();
    } else {
      const handleStorageChange = () => {
        const localStats = localStorage.getItem('mock_stats');
        if (localStats) {
          try {
            const parsed = JSON.parse(localStats);
            setStats({
              visitors: (parsed.visitors || 0) + 1000,
              visitorsToday: (parsed[dailyKey] || 0) + 4,
              downloads: (parsed.downloads || 0) + 1000
            });
          } catch (e) {
            console.error(e);
          }
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Fetch portfolio items to sync dynamic updates
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const { data, error } = await db.getPortfolio();
        if (error) throw error;
        if (data) {
          setItems(data.map(mapPortfolioItem));
        }
      } catch (e) {
        console.error('Failed to load portfolio:', e);
        setErrorMsg(e.message || String(e));
      }
    }
    loadPortfolio();
  }, []);

  // Handle smooth scroll to highlighted card
  useEffect(() => {
    if (!loading) {
      let hId = highlightId;
      if (!hId && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        hId = params.get('id');
      }
      if (hId) {
        setHighlightCardId(hId);
        const timer = setTimeout(() => {
          const el = document.getElementById(`card-${hId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);

        const clearTimer = setTimeout(() => {
          setHighlightCardId(null);
        }, 3000);

        return () => {
          clearTimeout(timer);
          clearTimeout(clearTimer);
        };
      }
    }
  }, [loading, highlightId]);

  // Filter items (shows all categories on Home page)
  const displayItems = useMemo(() => {
    if (filter === 'All') return items;
    return items.filter(item => item.category === filter);
  }, [filter, items]);

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.glowBlob} />
        <div className="container-max hero-inner" style={styles.heroInner}>
          {/* Left Column: Brand Text & Actions */}
          <div className="hero-left" style={styles.heroLeft}>
            <div style={styles.heroBadge}>
              <Sparkles size={14} color="var(--accent-indigo)" />
              <span>PORTFOLIO & INSIGHTS</span>
            </div>
            <h1 className="hero-title" style={styles.heroTitle}>
              톱니바꿈<span style={styles.heroGradient}>AI월드</span>
            </h1>
            <p className="hero-desc" style={styles.heroDesc}>
              실무에서 검증된 AI 자동화 솔루션과 최첨단 AI 어플리케이션 및 인사이트를 활용하여<br className="desktop-br" />
              업무의 한계를 넓혀보세요.
            </p>

            {/* Real-time Stats Widget */}
            <div style={styles.statsContainer}>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>오늘 방문자</span>
                <span style={styles.statValue}>{stats.visitorsToday.toLocaleString()}명</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statBox}>
                <span style={styles.statLabel}>누적 방문자</span>
                <span style={styles.statValue}>{stats.visitors.toLocaleString()}명</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statBox}>
                <span style={styles.statLabel}>주인공 이미지 다운로드</span>
                <span style={styles.statValue}>{stats.downloads.toLocaleString()}회</span>
              </div>
            </div>

            <div className="hero-actions" style={styles.heroActions}>
              <button 
                onClick={() => {
                  const el = document.getElementById('featured-projects');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hero-action-btn primary"
                style={styles.btnPrimary}
              >
                <span>프로젝트 탐색</span>
              </button>
              <a
                href="https://open.kakao.com/o/si1c9OAi"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-action-btn secondary"
                style={styles.btnSecondary}
              >
                <span>프로그램 문의</span>
              </a>
            </div>
          </div>

          {/* Right Column: Dynamic Neural Gear Constellation Canvas */}
          <div style={styles.heroRight}>
            <div className="canvas-container" style={styles.canvasContainer}>
              <CloudWordCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Grid Section */}
      <section id="featured-projects" className="container-max" style={styles.gridSection}>
        <div className="grid-header" style={styles.gridHeader}>
          <h2 style={styles.gridTitle}>
            <Star size={20} color="var(--accent-amber)" style={{ marginRight: '8px' }} />
            Featured Projects
          </h2>
          
          <div className="filters-wrapper" style={styles.filtersWrapper}>
            <a
              href="https://open.kakao.com/o/si1c9OAi"
              target="_blank"
              rel="noopener noreferrer"
              className="kakao-inquiry-btn"
              style={styles.kakaoInquiry}
            >
              <MessageSquare size={14} fill="currentColor" />
              <span>프로그램 문의</span>
            </a>

            <div style={styles.filterBtns}>
              {['All', 'AI Recommend', 'App', 'Insight'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    ...styles.filterBtn,
                    ...(filter === cat ? styles.filterBtnActive : {})
                  }}
                >
                  {cat === 'All' ? '전체보기' : (cat === 'AI Recommend' ? '영상제작' : (cat === 'App' ? '홈페이지' : '인사이트'))}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            marginBottom: '20px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
            zIndex: 10,
            position: 'relative'
          }}>
            <strong>[데이터 로딩 에러]</strong> {errorMsg}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="grid-container">
            {displayItems.map((item, idx) => (
              <PortfolioCard 
                key={item.id} 
                item={item} 
                index={idx}
                isHighlighted={highlightCardId === item.id}
              />
            ))}
          </div>
        )}

        {!loading && displayItems.length === 0 && (
          <div style={styles.emptyContainer}>
            등록된 프로젝트가 없습니다.
          </div>
        )}
      </section>

      {/* TimeBox Promo Popup */}
      {showPromoPopup && (
        <div style={styles.popupOverlay}>
          <div className="timebox-promo-card" style={styles.popupCard}>
            <div style={styles.popupTopAccent} />
            <button onClick={handleClosePromo} style={styles.popupCloseBtn}>✕</button>
            <div style={styles.popupBadge}>
              <Sparkles size={12} color="#FBBF24" />
              <span>무료 공개 서비스</span>
            </div>
            <h3 style={styles.popupTitle}>⚡ TimeBox Daily Planner</h3>
            <p style={styles.popupSubTitle}>하루를 통제하는 가장 확실한 방법</p>
            <div style={styles.popupImgContainer}>
              <Image 
                src="/images/timebox-promo.jpg" 
                alt="TimeBox Planner" 
                fill
                sizes="400px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <p style={styles.popupDesc}>
              📌 <strong>[일론 머스크의 30분 시간 관리법]</strong><br />
              시간표 드래그 앤 드롭, 브레인덤프 정리, 구글 캘린더 연동까지! 톱니바꿈에서 제작한 타임박스 플래너를 지금 무료로 이용해보세요.
            </p>
            <div style={styles.popupActions}>
              <a 
                href="https://my-timebox-planner.vercel.app/?intro=true" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.popupLaunchBtn}
                onClick={handleClosePromo}
              >
                무료로 플래너 시작하기 (Launch)
              </a>
              <div style={styles.popupFooterOpts}>
                <button onClick={handleHidePromoToday} style={styles.popupFooterLink}>
                  오늘 하루 보지 않기
                </button>
                <button onClick={handleClosePromo} style={styles.popupFooterLink}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '12px 20px',
    marginTop: '8px',
    marginBottom: '28px',
    backdropFilter: 'blur(10px)',
    width: 'fit-content',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
  },
  statDivider: {
    width: '1px',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  container: {
    width: '100%',
    paddingBottom: '80px',
  },
  heroSection: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    padding: '100px 0 60px 0',
    display: 'flex',
    alignItems: 'center',
  },
  glowBlob: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '50%',
    height: '80%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    filter: 'blur(100px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  heroInner: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    alignItems: 'center',
    gap: '48px',
    zIndex: 10,
    width: '100%',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '100px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    fontSize: '0.75rem',
    fontWeight: 700,
    fontFamily: 'var(--font-title)',
    letterSpacing: '0.1em',
    marginBottom: '24px',
  },
  heroTitle: {
    fontSize: '4.2rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
    marginBottom: '24px',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-purple) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginLeft: '12px',
  },
  heroDesc: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    maxWidth: '650px',
    marginBottom: '36px',
    fontWeight: 400,
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
    color: '#ffffff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  btnSecondary: {
    background: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-primary)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '13px 28px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease, border-color 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRight: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  canvasContainer: {
    position: 'relative',
    width: '100%',
    height: '460px',
    background: 'radial-gradient(circle at center, rgba(14, 12, 25, 0.45) 0%, rgba(3, 2, 7, 0) 70%)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 40px rgba(99, 102, 241, 0.04)',
  },
  gridSection: {
    marginTop: '20px',
  },
  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '24px',
  },
  gridTitle: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  filtersWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  kakaoInquiry: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FEE500',
    color: '#191919',
    padding: '8px 16px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: 850,
    boxShadow: '0 4px 10px rgba(254, 229, 0, 0.12)',
    transition: 'transform 0.2s ease, background 0.2s ease',
  },
  filterBtns: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '4px',
    borderRadius: '100px',
  },
  filterBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '6px 18px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  filterBtnActive: {
    background: 'rgba(255, 255, 255, 0.07)',
    color: 'var(--text-primary)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    width: '100%',
  },
  emptyContainer: {
    padding: '100px 0',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(3, 2, 7, 0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  popupCard: {
    position: 'relative',
    width: '90%',
    maxWidth: '400px',
    background: 'rgba(16, 12, 28, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15)',
    fontFamily: 'var(--font-body)',
  },
  popupTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-purple))',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
  },
  popupCloseBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
  popupBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '100px',
    background: 'rgba(251, 191, 36, 0.08)',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    color: '#FBBF24',
    fontSize: '0.72rem',
    fontWeight: 700,
    marginBottom: '12px',
  },
  popupTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    textAlign: 'center',
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  },
  popupSubTitle: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--accent-indigo)',
    textAlign: 'center',
    marginBottom: '16px',
  },
  popupImgContainer: {
    width: '100%',
    height: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  popupImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  popupDesc: {
    fontSize: '0.82rem',
    lineHeight: 1.5,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '20px',
  },
  popupActions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  popupLaunchBtn: {
    width: '100%',
    padding: '12px 0',
    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
    textDecoration: 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  popupFooterOpts: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 4px',
    marginTop: '4px',
  },
  popupFooterLink: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    transition: 'color 0.2s ease',
  },
};
