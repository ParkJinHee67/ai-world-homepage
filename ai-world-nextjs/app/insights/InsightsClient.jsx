"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db, mapPortfolioItem } from '../supabaseClient';
import PortfolioCard from '../../components/PortfolioCard';
import { Lightbulb } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const NeuralCanvas = () => {
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
    
    // Generate Neural Nodes (brain/synapse structure)
    const numNodes = 40;
    const nodes = [];
    
    // Distribute nodes roughly in a 3D ellipsoid/brain shape
    for (let i = 0; i < numNodes; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const rx = 100 * (0.8 + Math.random() * 0.4);
      const ry = 80 * (0.8 + Math.random() * 0.4);
      const rz = 80 * (0.8 + Math.random() * 0.4);
      
      nodes.push({
        ox: rx * Math.sin(phi) * Math.cos(theta),
        oy: ry * Math.sin(phi) * Math.sin(theta),
        oz: rz * Math.cos(phi),
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.015,
        neighbors: []
      });
    }
    
    // Connect nearest nodes (build synapses)
    const maxConnectionDist = 80;
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const dx = nodes[i].ox - nodes[j].ox;
        const dy = nodes[i].oy - nodes[j].oy;
        const dz = nodes[i].oz - nodes[j].oz;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < maxConnectionDist) {
          nodes[i].neighbors.push(j);
          nodes[j].neighbors.push(i);
        }
      }
      
      if (nodes[i].neighbors.length === 0) {
        let nearestIdx = 0;
        let minDist = 9999;
        for (let j = 0; j < numNodes; j++) {
          if (i === j) continue;
          const dx = nodes[i].ox - nodes[j].ox;
          const dy = nodes[i].oy - nodes[j].oy;
          const dz = nodes[i].oz - nodes[j].oz;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = j;
          }
        }
        nodes[i].neighbors.push(nearestIdx);
        nodes[nearestIdx].neighbors.push(i);
      }
    }
    
    // Create electrical signal pulses traveling along synapses
    const numPulses = 6;
    const pulses = [];
    for (let i = 0; i < numPulses; i++) {
      const startNode = Math.floor(Math.random() * numNodes);
      const neighbors = nodes[startNode].neighbors;
      const endNode = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      pulses.push({
        start: startNode,
        end: endNode,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012
      });
    }
    
    const angleX = 0.001;
    const angleY = 0.002;
    const fov = 300;
    
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
    
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.05;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.05;
      
      const rx = angleX + mouse.currentY * 0.0003;
      const ry = angleY - mouse.currentX * 0.0003;
      
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      
      const projected = [];
      
      for (let p of nodes) {
        p.phase += p.speed;
        const wobbleX = Math.sin(p.phase) * 1.5;
        const wobbleY = Math.cos(p.phase) * 1.5;
        
        let x = p.ox + wobbleX;
        let y = p.oy + wobbleY;
        let z = p.oz;
        
        let x1 = x * cosY - z * sinY;
        let z1 = z * cosY + x * sinY;
        
        let y2 = y * cosX - z1 * sinX;
        let z2 = z1 * cosX + y * sinX;
        
        p.ox = x1;
        p.oy = y2;
        p.oz = z2;
        
        const scale = fov / (fov + z2);
        const projX = x1 * scale + cx;
        const projY = y2 * scale + cy;
        
        projected.push({
          x: projX,
          y: projY,
          z: z2,
          scale: scale
        });
      }
      
      // Draw synapse connections
      ctx.lineWidth = 0.55;
      for (let i = 0; i < nodes.length; i++) {
        const pi = projected[i];
        for (let neighborIdx of nodes[i].neighbors) {
          if (neighborIdx > i) {
            const pj = projected[neighborIdx];
            const lineOpacity = 0.15 * ( (pi.z + pj.z) / 2 > 0 ? 0.35 : 0.95 );
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${lineOpacity})`;
            ctx.stroke();
          }
        }
      }
      
      // Update and draw signal pulses
      pulses.forEach(pulse => {
        pulse.progress += pulse.speed;
        
        if (pulse.progress >= 1.0) {
          pulse.progress = 0;
          pulse.start = pulse.end;
          
          const neighbors = nodes[pulse.start].neighbors;
          pulse.end = neighbors[Math.floor(Math.random() * neighbors.length)];
          pulse.speed = 0.008 + Math.random() * 0.012;
        }
        
        const startPt = projected[pulse.start];
        const endPt = projected[pulse.end];
        
        const pulseX = startPt.x + (endPt.x - startPt.x) * pulse.progress;
        const pulseY = startPt.y + (endPt.y - startPt.y) * pulse.progress;
        const pulseZ = startPt.z + (endPt.z - startPt.z) * pulse.progress;
        
        const scale = fov / (fov + pulseZ);
        const size = Math.max(1.8, 3.2 * scale);
        const alpha = Math.max(0.2, (fov - pulseZ) / (fov * 2)) * 0.95;
        
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.45})`;
        ctx.fill();
      });
      
      // Draw nodes
      for (let p of projected) {
        const size = Math.max(0.6, p.scale * 1.8);
        const alpha = Math.max(0.1, (fov - p.z) / (fov * 2)) * 0.8;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
        ctx.fill();
      }
      
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
      className="insights-header-canvas"
      style={styles.headerCanvas}
    />
  );
};

export default function InsightsClient({ initialItems, highlightId }) {
  const { t } = useLanguage();
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [highlightCardId, setHighlightCardId] = useState(null);

  // Sync edits if mock mode updates items
  useEffect(() => {
    async function loadInsights() {
      try {
        const { data, error } = await db.getPortfolio();
        if (error) throw error;
        if (data) {
          const mapped = data.map(mapPortfolioItem);
          const filtered = mapped.filter(x => x.category === 'Insight');
          setItems(filtered);
        }
      } catch (e) {
        console.error('Failed to load insights:', e);
      }
    }
    loadInsights();
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
        <div className="insights-header-flex" style={styles.headerFlexContainer}>
          <div style={styles.headerInner}>
            <div style={styles.iconContainer}>
              <Lightbulb size={24} color="var(--accent-amber)" />
            </div>
            <h1 className="insights-title" style={styles.title}>{t('insights.title', '기술 인사이트')}</h1>
            <p className="insights-subtitle" style={styles.subtitle}>
              {t('insights.subtitle', '프롬프트 엔지니어링 템플릿, 비즈니스 자동화 워크플로우 설계서, AI 개발 지침 가이드 등 가치 있는 지식형 인사이트 자산군입니다.')}
            </p>
          </div>
          <div className="insights-header-img-container" style={styles.headerImageContainer}>
            <NeuralCanvas />
            <div style={styles.glowBg1} />
            <div style={styles.glowBg2} />
          </div>
        </div>
      </section>

      <section className="container-max">
        {loading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-amber)' }} />
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
            {t('insights.no_portfolio', '등록된 인사이트 포트폴리오가 없습니다.')}
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
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
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
    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%)',
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
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
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
