"use client";
import React, { useRef, useEffect, useState } from 'react';

/**
 * CosmicMathCanvas
 * 우주 형태의 공간(Starfield + Nebula Glow) 속에서
 * 4D 테서랙트(Hypercube), 토러스 매듭(Torus Knot), 별모양 정이십면체(Stellated Icosahedron) 등
 * 신비로운 수학적 3D 기하학 도형이 시간에 따라 부드럽게 모핑(Morphing) 변형되는 인터랙티브 캔버스
 */
export default function CosmicMathCanvas() {
  const canvasRef = useRef(null);
  // Reference for shape transition trigger from external button if needed
  const nextShapeTriggerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = 450;
    let height = 450;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width || 450;
      height = rect.height || 450;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(() => resize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resize();

    // 1. Cosmic Deep Space: Starfield
    const numStars = 140;
    const stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 1200,
      z: Math.random() * 900 + 100,
      baseRadius: Math.random() * 1.5 + 0.6,
      color: Math.random() > 0.4 ? '56, 189, 248' : (Math.random() > 0.5 ? '168, 85, 247' : '255, 255, 255'),
      twinkleSpeed: Math.random() * 0.04 + 0.015,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // 2. Mathematical Shapes Definitions
    // We define target vertex coordinates (32 vertices normalized) and edges
    // Shape 0: 4D Tesseract (16 vertices duplicated to 32 for smooth morphing)
    function generateTesseract4D(angle4D) {
      const verts = [];
      const d = 2.2;
      for (let i = 0; i < 16; i++) {
        let x = (i & 1) ? 1 : -1;
        let y = (i & 2) ? 1 : -1;
        let z = (i & 4) ? 1 : -1;
        let w = (i & 8) ? 1 : -1;

        // 4D Rotation in XW and ZW planes
        const a1 = angle4D;
        const x1 = x * Math.cos(a1) - w * Math.sin(a1);
        const w1 = x * Math.sin(a1) + w * Math.cos(a1);

        const a2 = angle4D * 0.7;
        const z1 = z * Math.cos(a2) - w1 * Math.sin(a2);
        const w2 = z * Math.sin(a2) + w1 * Math.cos(a2);

        // Perspective projection 4D -> 3D
        const fov4D = d / (d - w2 * 0.45);
        verts.push({
          x: x1 * fov4D * 0.8,
          y: y * fov4D * 0.8,
          z: z1 * fov4D * 0.8,
        });
      }
      // Duplicate to 32 vertices with subtle inner pulse
      for (let i = 0; i < 16; i++) {
        verts.push({
          x: verts[i].x * 0.52,
          y: verts[i].y * 0.52,
          z: verts[i].z * 0.52,
        });
      }
      return verts;
    }

    // Tesseract Edges (32 main edges)
    const tesseractEdges = [];
    for (let i = 0; i < 16; i++) {
      for (let bit = 0; bit < 4; bit++) {
        const neighbor = i ^ (1 << bit);
        if (neighbor > i) {
          tesseractEdges.push([i, neighbor]);
        }
      }
    }
    // Connect outer to inner duplicate
    for (let i = 0; i < 16; i += 2) {
      tesseractEdges.push([i, 16 + i]);
    }

    // Shape 1: 3D Torus Knot (p=2, q=3 Trefoil) with 32 sample points
    function generateTorusKnot3D(angle) {
      const verts = [];
      const count = 32;
      const p = 2;
      const q = 3;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2 + angle * 0.2;
        const r = (Math.cos(q * theta) * 0.5 + 1.25) * 0.78;
        const x = r * Math.cos(p * theta);
        const y = r * Math.sin(p * theta);
        const z = -Math.sin(q * theta) * 0.85;
        verts.push({ x, y, z });
      }
      return verts;
    }

    const torusEdges = [];
    for (let i = 0; i < 32; i++) {
      torusEdges.push([i, (i + 1) % 32]);
      if (i % 4 === 0) {
        torusEdges.push([i, (i + 16) % 32]); // Cross ribs
      }
    }

    // Shape 2: Stellated Icosahedron (황금비 12 정점 + 20 면 스파이크 정점 = 32 정점)
    function generateStellatedIcosahedron(pulse) {
      const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio 1.618
      const raw12 = [
        [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
        [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
        [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
      ];

      const verts = raw12.map(v => {
        const len = Math.hypot(v[0], v[1], v[2]);
        return {
          x: (v[0] / len) * 1.05,
          y: (v[1] / len) * 1.05,
          z: (v[2] / len) * 1.05
        };
      });

      // 20 Stellate spikes
      const spikeScale = 1.35 + Math.sin(pulse) * 0.12;
      for (let i = 0; i < 20; i++) {
        const theta = (i / 20) * Math.PI * 2;
        const phiAngle = ((i % 5) / 5) * Math.PI - Math.PI / 2;
        verts.push({
          x: Math.cos(phiAngle) * Math.cos(theta) * spikeScale,
          y: Math.sin(phiAngle) * spikeScale,
          z: Math.cos(phiAngle) * Math.sin(theta) * spikeScale
        });
      }
      return verts;
    }

    const icosaEdges = [];
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        icosaEdges.push([i, j]);
      }
    }
    // Connect spikes
    for (let i = 0; i < 20; i++) {
      icosaEdges.push([12 + i, i % 12]);
      icosaEdges.push([12 + i, (i + 1) % 12]);
    }

    // Shape 3: Metatron's Cosmic Hyper-Cube (신성기하학 32 노드 매트릭스)
    function generateMetatronMatrix(angle) {
      const verts = [];
      // 8 cube inner
      for (let i = 0; i < 8; i++) {
        const x = (i & 1) ? 0.65 : -0.65;
        const y = (i & 2) ? 0.65 : -0.65;
        const z = (i & 4) ? 0.65 : -0.65;
        verts.push({ x, y, z });
      }
      // 12 outer dodeca points
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + angle * 0.3;
        verts.push({
          x: Math.cos(a) * 1.35,
          y: Math.sin(a) * 1.35,
          z: Math.sin(i * 1.5) * 0.55
        });
      }
      // 12 axis poles
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - angle * 0.3;
        verts.push({
          x: Math.cos(a) * 0.9,
          y: Math.sin(i * 2) * 1.25,
          z: Math.sin(a) * 0.9
        });
      }
      return verts;
    }

    const metatronEdges = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (i !== j && (i ^ j) === 1 || (i ^ j) === 2 || (i ^ j) === 4) {
          metatronEdges.push([i, j]);
        }
      }
      metatronEdges.push([i, 8 + (i % 12)]);
    }
    for (let i = 0; i < 12; i++) {
      metatronEdges.push([8 + i, 8 + (i + 1) % 12]);
      metatronEdges.push([8 + i, 20 + i]);
    }

    let currentShapeIndex = 0;
    let targetShapeIndex = 1;
    let morphProgress = 0; // 0 to 1
    let shapeTimer = 0;

    nextShapeTriggerRef.current = () => {
      targetShapeIndex = (currentShapeIndex + 1) % 4;
      morphProgress = 0;
    };

    // Mouse tilt interaction
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouse.targetX = nx * 0.45;
      mouse.targetY = ny * 0.45;
    };
    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };
    const handleClick = () => {
      if (nextShapeTriggerRef.current) {
        nextShapeTriggerRef.current();
      }
    };

    if (canvas.parentElement) {
      canvas.parentElement.addEventListener('mousemove', handleMouseMove);
      canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);
      canvas.parentElement.addEventListener('click', handleClick);
    }

    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    let time = 0;

    // 3. Render Loop
    const render = () => {
      time += 0.016;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      rotX += 0.007 + mouse.y * 0.02;
      rotY += 0.01 + mouse.x * 0.02;
      rotZ += 0.004;

      // Shape Morphing Clock (Auto switch every 7.5 seconds)
      shapeTimer += 0.016;
      if (shapeTimer > 7.5) {
        shapeTimer = 0;
        targetShapeIndex = (currentShapeIndex + 1) % 4;
        morphProgress = 0;
      }

      if (morphProgress < 1) {
        morphProgress += 0.018; // smooth morph speed
        if (morphProgress >= 1) {
          morphProgress = 1;
          currentShapeIndex = targetShapeIndex;
        }
      }

      ctx.clearRect(0, 0, width, height);

      // A. Deep Cosmic Nebula Glow
      const cx = width / 2;
      const cy = height / 2;

      // Nebula layer 1: Deep Indigo/Cyan
      const rad1 = Math.min(width, height) * 0.65;
      const nGrad1 = ctx.createRadialGradient(
        cx + Math.sin(time * 0.7) * 40,
        cy + Math.cos(time * 0.6) * 35,
        10,
        cx,
        cy,
        rad1
      );
      nGrad1.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      nGrad1.addColorStop(0.45, 'rgba(99, 102, 241, 0.14)');
      nGrad1.addColorStop(0.8, 'rgba(15, 23, 42, 0.05)');
      nGrad1.addColorStop(1, 'rgba(3, 4, 8, 0)');
      ctx.fillStyle = nGrad1;
      ctx.fillRect(0, 0, width, height);

      // Nebula layer 2: Cosmic Purple/Magenta accent
      const rad2 = Math.min(width, height) * 0.52;
      const nGrad2 = ctx.createRadialGradient(
        cx - Math.cos(time * 0.5) * 50,
        cy - Math.sin(time * 0.8) * 40,
        15,
        cx,
        cy,
        rad2
      );
      nGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      nGrad2.addColorStop(0.5, 'rgba(244, 63, 94, 0.12)');
      nGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nGrad2;
      ctx.fillRect(0, 0, width, height);

      // B. Cosmic Starfield Particles
      stars.forEach(star => {
        star.z -= 1.2;
        if (star.z <= 10) {
          star.z = 900;
          star.x = (Math.random() - 0.5) * 1200;
          star.y = (Math.random() - 0.5) * 1200;
        }

        const k = 360 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.35 + 0.65;
          const sz = star.baseRadius * k * 0.8;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.6, sz), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color}, ${Math.min(1, (1 - star.z / 900) * twinkle)})`;
          ctx.fill();
        }
      });

      // C. Get Geometry Vertices & Morphing
      const getShapeVerts = (idx, tVal) => {
        if (idx === 0) return generateTesseract4D(tVal * 1.5);
        if (idx === 1) return generateTorusKnot3D(tVal * 2);
        if (idx === 2) return generateStellatedIcosahedron(tVal * 3);
        return generateMetatronMatrix(tVal * 1.8);
      };

      const vertsA = getShapeVerts(currentShapeIndex, time);
      const vertsB = getShapeVerts(targetShapeIndex, time);

      // Ease out cubic for morph
      const easeMorph = morphProgress < 1 
        ? (1 - Math.pow(1 - morphProgress, 3))
        : 1;

      // Intermediate morphed 3D vertices
      const morphed3D = [];
      for (let i = 0; i < 32; i++) {
        const vA = vertsA[i] || { x: 0, y: 0, z: 0 };
        const vB = vertsB[i] || { x: 0, y: 0, z: 0 };
        morphed3D.push({
          x: vA.x + (vB.x - vA.x) * easeMorph,
          y: vA.y + (vB.y - vA.y) * easeMorph,
          z: vA.z + (vB.z - vA.z) * easeMorph,
        });
      }

      // Edges selection: interpolate between edge systems
      const edgesA = currentShapeIndex === 0 ? tesseractEdges 
        : (currentShapeIndex === 1 ? torusEdges 
        : (currentShapeIndex === 2 ? icosaEdges : metatronEdges));

      const edgesB = targetShapeIndex === 0 ? tesseractEdges 
        : (targetShapeIndex === 1 ? torusEdges 
        : (targetShapeIndex === 2 ? icosaEdges : metatronEdges));

      // 3D Rotation Matrix Calculation
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

      const scaleFactor = Math.min(width, height) * 0.38;
      const cameraDist = 3.6;

      // Project vertices to 2D Screen Space
      const projected2D = morphed3D.map((p, idx) => {
        // Rot Y
        let x1 = p.x * cosY + p.z * sinY;
        let y1 = p.y;
        let z1 = -p.x * sinY + p.z * cosY;

        // Rot X
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Rot Z
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        // Perspective
        const depth = cameraDist - z3;
        const persp = (cameraDist / depth) * scaleFactor;

        return {
          x: cx + x3 * persp,
          y: cy + y3 * persp,
          z: z3,
          persp,
          index: idx,
        };
      });

      // D. Draw Edges with Glowing Luminescence
      const activeEdges = easeMorph < 0.5 ? edgesA : edgesB;
      const edgeAlpha = Math.sin(time * 2) * 0.15 + 0.65;

      ctx.save();
      ctx.lineWidth = 1.3;
      activeEdges.forEach(([i, j]) => {
        const p1 = projected2D[i];
        const p2 = projected2D[j];
        if (!p1 || !p2) return;

        const avgZ = (p1.z + p2.z) / 2;
        const depthAlpha = Math.max(0.12, Math.min(0.9, (avgZ + 1.6) / 3.2)) * edgeAlpha;

        // Dynamic Color Gradient between Cyan and Purple/Rose
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, `rgba(56, 189, 248, ${depthAlpha * 0.95})`);
        grad.addColorStop(0.5, `rgba(168, 85, 247, ${depthAlpha * 0.85})`);
        grad.addColorStop(1, `rgba(244, 63, 94, ${depthAlpha * 0.9})`);

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
      ctx.restore();

      // E. Draw Glowing Vertex Spheres
      projected2D.sort((a, b) => a.z - b.z); // Depth sorting
      projected2D.forEach((p, idx) => {
        const depthRatio = Math.max(0.2, (p.z + 1.8) / 3.6);
        const radius = Math.max(2, 3.8 * depthRatio);

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 
          ? `rgba(56, 189, 248, ${0.2 * depthRatio})`
          : `rgba(168, 85, 247, ${0.2 * depthRatio})`;
        ctx.fill();

        // Core vertex
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = idx % 3 === 0 
          ? '#ffffff' 
          : (idx % 2 === 0 ? '#38bdf8' : '#e879f9');
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // F. Subtle Outer Cosmic Ring
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, scaleFactor * 1.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
        canvas.parentElement.removeEventListener('click', handleClick);
      }
    };
  }, []);

  return (
    <div style={containerStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />

      {/* Bottom Shape Toggle Pill */}
      <div 
        style={hudBottomStyle}
        onClick={() => {
          if (nextShapeTriggerRef.current) nextShapeTriggerRef.current();
        }}
        title="클릭하여 다음 수학적 기하학 도형으로 변형"
      >
        <span style={morphIconStyle}>↻ 모핑 전환</span>
      </div>
    </div>
  );
}

const containerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  borderRadius: '24px',
  background: 'radial-gradient(circle at 50% 50%, rgba(14, 21, 45, 0.6) 0%, rgba(3, 4, 8, 0.98) 100%)',
  border: '1px solid rgba(56, 189, 248, 0.35)',
  boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(56, 189, 248, 0.22)',
  cursor: 'pointer',
  userSelect: 'none',
};

const canvasStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'block',
};

const hudBottomStyle = {
  position: 'absolute',
  bottom: '14px',
  right: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  padding: '5px 12px',
  borderRadius: '999px',
  background: 'rgba(15, 23, 42, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(168, 85, 247, 0.4)',
  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, border-color 0.2s ease',
  zIndex: 10,
};

const morphIconStyle = {
  fontSize: '10px',
  fontWeight: 700,
  color: '#c084fc',
  background: 'rgba(168, 85, 247, 0.15)',
  padding: '2px 8px',
  borderRadius: '999px',
};
