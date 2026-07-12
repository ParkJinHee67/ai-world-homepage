"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db, mapPortfolioItem } from '../supabaseClient';
import PortfolioCard from '../../components/PortfolioCard';
import { Layout } from 'lucide-react';

const WebDevCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    const dpr = window.devicePixelRatio || 1;
    let width = 380;
    let height = 380;
    
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || 380;
      const h = rect.height || 380;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      width = w;
      height = h;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Code symbols floating in 3D space
    const symbols = ['<div/>', '{ }', 'JS', 'CSS', 'HTML', 'const', '=>', '[]', '<p>', 'import'];
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        text: symbols[i % symbols.length],
        x: -120 + Math.random() * 240,
        y: -120 + Math.random() * 240,
        z: -100 + Math.random() * 200,
        vx: -0.25 + Math.random() * 0.5,
        vy: -0.25 + Math.random() * 0.5,
        vz: -0.4 + Math.random() * 0.8,
        size: 9.5 + Math.random() * 4.5,
        color: Math.random() > 0.4 ? 'rgba(99, 102, 241, ' : 'rgba(139, 92, 246, '
      });
    }
    
    let mouse = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left - rect.width / 2;
      mouse.targetY = e.clientY - rect.top - rect.height / 2;
    };
    
    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    const fov = 300;
    
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.05;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.05;
      
      const rx = mouse.currentY * 0.0006;
      const ry = -mouse.currentX * 0.0006;
      
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      
      const project = (x, y, z) => {
        let x1 = x * cosY - z * sinY;
        let z1 = z * cosY + x * sinY;
        
        let y2 = y * cosX - z1 * sinX;
        let z2 = z1 * cosX + y * sinX;
        
        const scale = fov / (fov + z2);
        return {
          x: x1 * scale + cx,
          y: y2 * scale + cy,
          z: z2,
          scale: scale
        };
      };
      
      // 1. Draw 3D wireframe browser window
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.5;
      
      const wWidth = 100;
      const wHeight = 75;
      const wZ = 0;
      
      const tl = project(-wWidth, -wHeight, wZ);
      const tr = project(wWidth, -wHeight, wZ);
      const br = project(wWidth, wHeight, wZ);
      const bl = project(-wWidth, wHeight, wZ);
      
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(99, 102, 241, 0.02)';
      ctx.fill();
      ctx.stroke();
      
      const titleBarY = -wHeight + 15;
      const tbarL = project(-wWidth, titleBarY, wZ);
      const tbarR = project(wWidth, titleBarY, wZ);
      ctx.beginPath();
      ctx.moveTo(tbarL.x, tbarL.y);
      ctx.lineTo(tbarR.x, tbarR.y);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.stroke();
      
      const dotRadius = 2.5;
      const dotsX = [-wWidth + 12, -wWidth + 22, -wWidth + 32];
      dotsX.forEach(dx => {
        const dot = project(dx, -wHeight + 7.5, wZ);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius * dot.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.fill();
      });
      
      // 2. Draw window layout contents in 3D parallax
      const heroTl = project(-wWidth + 15, titleBarY + 12, 10);
      const heroBr = project(wWidth - 15, titleBarY + 32, 10);
      ctx.beginPath();
      ctx.rect(heroTl.x, heroTl.y, heroBr.x - heroTl.x, heroBr.y - heroTl.y);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.fillStyle = 'rgba(139, 92, 246, 0.04)';
      ctx.fill();
      ctx.stroke();
      
      const col1Tl = project(-wWidth + 15, titleBarY + 42, -10);
      const col1Br = project(-10, wHeight - 15, -10);
      ctx.beginPath();
      ctx.rect(col1Tl.x, col1Tl.y, col1Br.x - col1Tl.x, col1Br.y - col1Tl.y);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.fillStyle = 'rgba(99, 102, 241, 0.03)';
      ctx.fill();
      ctx.stroke();
      
      const col2Tl = project(10, titleBarY + 42, -10);
      const col2Br = project(wWidth - 15, wHeight - 15, -10);
      ctx.beginPath();
      ctx.rect(col2Tl.x, col2Tl.y, col2Br.x - col2Tl.x, col2Br.y - col2Tl.y);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.fillStyle = 'rgba(99, 102, 241, 0.03)';
      ctx.fill();
      ctx.stroke();
      
      // 3. Draw flowing code particles
      particles.forEach(p => {
        p.x += p.vx * (1 + Math.abs(mouse.currentX) * 0.015);
        p.y += p.vy * (1 + Math.abs(mouse.currentY) * 0.015);
        p.z += p.vz;
        
        if (p.x < -150) p.x = 150;
        if (p.x > 150) p.x = -150;
        if (p.y < -150) p.y = 150;
        if (p.y > 150) p.y = -150;
        if (p.z < -150) p.z = 150;
        if (p.z > 150) p.z = -150;
        
        const pt = project(p.x, p.y, p.z);
        
        if (pt.x > 0 && pt.x < width && pt.y > 0 && pt.y < height) {
          const alpha = (1 - (p.z + 150) / 300) * 0.85;
          const size = p.size * pt.scale;
          
          ctx.font = `bold ${Math.max(6, size)}px monospace`;
          ctx.fillStyle = p.color + alpha + ')';
          ctx.fillText(p.text, pt.x, pt.y);
          
          const distToCenter = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
          if (distToCenter < 100) {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(cx, cy);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.08})`;
            ctx.stroke();
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="websites-header-canvas"
      style={styles.headerCanvas}
    />
  );
};

export default function WebsitesClient({ initialItems, highlightId }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [highlightCardId, setHighlightCardId] = useState(null);

  // Sync edits if mock mode updates items
  useEffect(() => {
    async function loadWebsites() {
      try {
        const { data, error } = await db.getPortfolio();
        if (error) throw error;
        if (data) {
          const mapped = data.map(mapPortfolioItem);
          const filtered = mapped.filter(x => x.category === 'App');
          setItems(filtered);
        }
      } catch (e) {
        console.error('Failed to load websites:', e);
      }
    }
    loadWebsites();
  }, []);

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

  return (
    <div style={styles.container}>
      <section className="container-max" style={styles.headerSection}>
        <div className="websites-header-flex" style={styles.headerFlexContainer}>
          <div style={styles.headerInner}>
            <div style={styles.iconContainer}>
              <Layout size={24} color="var(--accent-indigo)" />
            </div>
            <h1 className="websites-title" style={styles.title}>제작 홈페이지</h1>
            <p className="websites-subtitle" style={styles.subtitle}>
              반응형 모던 인터페이스 디자인, Supabase 백엔드 데이터 연동, 그리고 편리한 관리 기능이 통합된 차별화된 홈페이지 제작 사례입니다.
            </p>
          </div>
          <div className="websites-header-img-container" style={styles.headerImageContainer}>
            <WebDevCanvas />
            <div style={styles.glowBg1} />
            <div style={styles.glowBg2} />
          </div>
        </div>
      </section>

      <section className="container-max">
        {loading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-indigo)' }} />
          </div>
        ) : (
          <div className="grid-container">
            {items.map((item, idx) => (
              <PortfolioCard
                key={item.id}
                item={item}
                index={idx}
                isHighlighted={highlightCardId === item.id}
              />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={styles.emptyContainer}>
            등록된 홈페이지 포트폴리오가 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    paddingBottom: '80px',
  },
  headerSection: {
    padding: '85px 0 40px 0',
  },
  headerFlexContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '40px',
    position: 'relative',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '20px',
  },
  headerInner: {
    flex: '1.2',
    textAlign: 'left',
    zIndex: 2,
  },
  headerImageContainer: {
    flex: '0.8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  headerCanvas: {
    width: '100%',
    maxWidth: '380px',
    aspectRatio: '1/1',
    display: 'block',
    position: 'relative',
    zIndex: 2,
  },
  glowBg1: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
    top: '-20px',
    right: '20px',
    zIndex: -1,
    filter: 'blur(20px)',
    pointerEvents: 'none',
  },
  glowBg2: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
    bottom: '-10px',
    left: '20px',
    zIndex: -1,
    filter: 'blur(20px)',
    pointerEvents: 'none',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '3.2rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    marginBottom: '16px',
    letterSpacing: '-0.03em',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    fontWeight: 400,
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
};
