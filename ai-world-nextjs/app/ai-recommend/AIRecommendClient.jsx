"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db, mapPortfolioItem } from '../supabaseClient';
import PortfolioCard from '../../components/PortfolioCard';
import { Video } from 'lucide-react';

const ApertureCanvas = () => {
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
    
    // Light particles swirling into the lens
    const numParticles = 65;
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        r: 45 + Math.random() * 110, // radius from center
        angle: Math.random() * Math.PI * 2,
        z: -100 + Math.random() * 220,
        speed: 0.008 + Math.random() * 0.015,
        zSpeed: 0.8 + Math.random() * 1.5,
        size: 0.7 + Math.random() * 1.4,
        color: Math.random() > 0.4 ? 'rgba(52, 211, 153, ' : 'rgba(34, 211, 238, '
      });
    }
    
    let rotationAngle = 0;
    let apertureOpen = 0.5;
    let mouse = { targetX: 0, targetY: 0, currentX: 0, currentY: 0, targetOpen: 0.5 };
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height / 2;
      mouse.targetX = mx;
      mouse.targetY = my;
      
      const dist = Math.sqrt(mx * mx + my * my);
      const maxDist = Math.sqrt((rect.width/2)**2 + (rect.height/2)**2);
      mouse.targetOpen = 0.3 + (1 - dist / maxDist) * 0.6;
    };
    
    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
      mouse.targetOpen = 0.5;
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
      apertureOpen += (mouse.targetOpen - apertureOpen) * 0.08;
      
      rotationAngle += 0.004 + (Math.abs(mouse.currentX) + Math.abs(mouse.currentY)) * 0.00004;
      
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
      
      // 1. Draw camera guidelines/viewport overlay (Hologram style)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1;
      
      const bracketSize = 15;
      const boxSize = 130;
      
      const corners = [
        [-boxSize, -boxSize],
        [boxSize, -boxSize],
        [boxSize, boxSize],
        [-boxSize, boxSize]
      ];
      
      const projectedCorners = corners.map(c => project(c[0], c[1], 0));
      
      ctx.beginPath();
      // Top-left
      ctx.moveTo(projectedCorners[0].x + bracketSize * projectedCorners[0].scale, projectedCorners[0].y);
      ctx.lineTo(projectedCorners[0].x, projectedCorners[0].y);
      ctx.lineTo(projectedCorners[0].x, projectedCorners[0].y + bracketSize * projectedCorners[0].scale);
      
      // Top-right
      ctx.moveTo(projectedCorners[1].x - bracketSize * projectedCorners[1].scale, projectedCorners[1].y);
      ctx.lineTo(projectedCorners[1].x, projectedCorners[1].y);
      ctx.lineTo(projectedCorners[1].x, projectedCorners[1].y + bracketSize * projectedCorners[1].scale);
      
      // Bottom-right
      ctx.moveTo(projectedCorners[2].x - bracketSize * projectedCorners[2].scale, projectedCorners[2].y);
      ctx.lineTo(projectedCorners[2].x, projectedCorners[2].y);
      ctx.lineTo(projectedCorners[2].x, projectedCorners[2].y - bracketSize * projectedCorners[2].scale);
      
      // Bottom-left
      ctx.moveTo(projectedCorners[3].x + bracketSize * projectedCorners[3].scale, projectedCorners[3].y);
      ctx.lineTo(projectedCorners[3].x, projectedCorners[3].y);
      ctx.lineTo(projectedCorners[3].x, projectedCorners[3].y - bracketSize * projectedCorners[3].scale);
      ctx.stroke();
      
      // Viewport crosshair in center
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      const chSize = 6;
      ctx.moveTo(cx - chSize, cy); ctx.lineTo(cx + chSize, cy);
      ctx.moveTo(cx, cy - chSize); ctx.lineTo(cx, cy + chSize);
      ctx.stroke();
      
      // 2. Draw Lens Rings
      const ringRadii = [90, 86, 60];
      ringRadii.forEach((r, idx) => {
        ctx.strokeStyle = idx === 1 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(16, 185, 129, 0.2)';
        ctx.beginPath();
        const steps = 60;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const px = r * Math.cos(theta);
          const py = r * Math.sin(theta);
          const pt = project(px, py, 0);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      });
      
      // 3. Draw Camera Aperture Shutter Blades
      const numBlades = 8;
      const innerR = 25 * (1 + apertureOpen * 0.8);
      const outerR = 60;
      
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 1.2;
      
      for (let i = 0; i < numBlades; i++) {
        const theta = (i / numBlades) * Math.PI * 2 + rotationAngle;
        const nextTheta = ((i + 1) / numBlades) * Math.PI * 2 + rotationAngle;
        
        const pInner = project(innerR * Math.cos(theta), innerR * Math.sin(theta), 0);
        const pOuter = project(outerR * Math.cos(theta), outerR * Math.sin(theta), 0);
        const pNextInner = project(innerR * Math.cos(nextTheta), innerR * Math.sin(nextTheta), 0);
        const pNextOuter = project(outerR * Math.cos(nextTheta), outerR * Math.sin(nextTheta), 0);
        
        ctx.beginPath();
        ctx.moveTo(pInner.x, pInner.y);
        ctx.lineTo(pOuter.x, pOuter.y);
        ctx.lineTo(pNextOuter.x, pNextOuter.y);
        ctx.lineTo(pNextInner.x, pNextInner.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      
      // 4. Draw Swirling Light/Pixels particles
      particles.forEach(p => {
        p.angle -= p.speed * (1 + (1 - apertureOpen));
        p.z -= p.zSpeed;
        
        if (p.z < -fov) {
          p.z = 200;
          p.r = 45 + Math.random() * 110;
        }
        
        const px = p.r * Math.cos(p.angle);
        const py = p.r * Math.sin(p.angle);
        const pt = project(px, py, p.z);
        
        if (pt.x > 0 && pt.x < width && pt.y > 0 && pt.y < height) {
          const alpha = (1 - (p.z + fov) / (fov + 200)) * 0.7;
          const size = p.size * pt.scale;
          
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(0.5, size), 0, Math.PI * 2);
          ctx.fillStyle = p.color + alpha + ')';
          ctx.fill();
          
          // Connect close particles with thin lines
          particles.forEach(other => {
            if (other === p) return;
            const dz = p.z - other.z;
            if (Math.abs(dz) < 15) {
              const dx = px - other.r * Math.cos(other.angle);
              const dy = py - other.r * Math.sin(other.angle);
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < 40) {
                const otherPt = project(other.r * Math.cos(other.angle), other.r * Math.sin(other.angle), other.z);
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(otherPt.x, otherPt.y);
                ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.15})`;
                ctx.stroke();
              }
            }
          });
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
      className="recommend-header-canvas"
      style={styles.headerCanvas}
    />
  );
};

export default function AIRecommendClient({ initialItems, highlightId }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [highlightCardId, setHighlightCardId] = useState(null);

  // Sync edits if mock mode updates items
  useEffect(() => {
    async function loadRecommend() {
      try {
        const { data, error } = await db.getPortfolio();
        if (error) throw error;
        if (data) {
          const mapped = data.map(mapPortfolioItem);
          const filtered = mapped.filter(x => x.category === 'AI Recommend');
          setItems(filtered);
        }
      } catch (e) {
        console.error('Failed to load recommendations:', e);
      }
    }
    loadRecommend();
  }, []);

  useEffect(() => {
    if (!loading && highlightId) {
      setHighlightCardId(highlightId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`card-${highlightId}`);
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
  }, [loading, highlightId]);

  return (
    <div style={styles.container}>
      <section className="container-max" style={styles.headerSection}>
        <div className="recommend-header-flex" style={styles.headerFlexContainer}>
          <div style={styles.headerInner}>
            <div style={styles.iconContainer}>
              <Video size={24} color="var(--accent-emerald)" />
            </div>
            <h1 className="recommend-title" style={styles.title}>영상제작 포트폴리오</h1>
            <p className="recommend-subtitle" style={styles.subtitle}>
              유튜브 롱폼/쇼츠, 인트로, 브랜드 홍보 영상 등 AI 자동화 편집 기술이 가미된 풍부한 비디오 제작 포트폴리오입니다.
            </p>
          </div>
          <div className="recommend-header-img-container" style={styles.headerImageContainer}>
            <ApertureCanvas />
            <div style={styles.glowBg1} />
            <div style={styles.glowBg2} />
          </div>
        </div>
      </section>

      <section className="container-max">
        {loading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-emerald)' }} />
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
            등록된 영상제작 포트폴리오가 없습니다.
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
    padding: '80px 0 40px 0',
  },
  headerFlexContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '40px',
    position: 'relative',
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
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
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
    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
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
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
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
