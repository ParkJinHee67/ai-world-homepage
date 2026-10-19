"use client";
import React, { useRef, useEffect } from 'react';

/**
 * CosmicMathCanvas
 * 우주 형태의 공간(Starfield 3D 별무리 + Cosmic Nebula Glow) 속에서
 * 피타고라스의 정리, 원/원기둥/원뿔, 구체, 토러스, 뫼비우스의 띠, 4D 테서랙트 등
 * 8가지 수학적 3D 기하학 도형이 연속적으로 부드럽게 모핑(Morphing) 변형되는 인터랙티브 캔버스
 */
export default function CosmicMathCanvas() {
  const canvasRef = useRef(null);
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

    // 1. Cosmic Deep Space: 3D Starfield
    const numStars = 150;
    const stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 1200,
      z: Math.random() * 900 + 100,
      baseRadius: Math.random() * 1.5 + 0.6,
      color: Math.random() > 0.4 ? '56, 189, 248' : (Math.random() > 0.5 ? '168, 85, 247' : '255, 255, 255'),
      twinkleSpeed: Math.random() * 0.04 + 0.015,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // 2. 8 Mathematical 3D Geometries (Normalized to exactly 36 vertices each)
    const NUM_VERTS = 36;

    // --- Shape 0: Pythagoras Theorem 3D (피타고라스의 정리 3차원 기하학 a^2 + b^2 = c^2) ---
    function genPythagoras(pulse) {
      const verts = [];
      const scale = 0.38 + Math.sin(pulse * 2) * 0.02;
      // Right triangle at center: legA=3, legB=4, hypotenuse C=5
      // Base A square (3x3): 8 vertices (front & back)
      for (let z of [-0.6, 0.6]) {
        verts.push({ x: 0 * scale, y: 0 * scale, z });
        verts.push({ x: 3 * scale, y: 0 * scale, z });
        verts.push({ x: 3 * scale, y: -3 * scale, z });
        verts.push({ x: 0 * scale, y: -3 * scale, z });
      } // 8
      // Base B square (4x4): 8 vertices
      for (let z of [-0.6, 0.6]) {
        verts.push({ x: 0 * scale, y: 0 * scale, z });
        verts.push({ x: -4 * scale, y: 0 * scale, z });
        verts.push({ x: -4 * scale, y: 4 * scale, z });
        verts.push({ x: 0 * scale, y: 4 * scale, z });
      } // 8
      // Hypotenuse C square (5x5): 8 vertices tilted along hypotenuse
      const angleC = Math.atan2(4, 3);
      for (let z of [-0.6, 0.6]) {
        verts.push({ x: 3 * scale, y: 0 * scale, z });
        verts.push({ x: 0 * scale, y: 4 * scale, z });
        verts.push({
          x: (0 + 5 * Math.sin(angleC)) * scale,
          y: (4 + 5 * Math.cos(angleC)) * scale,
          z
        });
        verts.push({
          x: (3 + 5 * Math.sin(angleC)) * scale,
          y: (0 + 5 * Math.cos(angleC)) * scale,
          z
        });
      } // 8
      // Triangle center & division markers: 12 vertices
      for (let i = 0; i < 12; i++) {
        const u = i / 12;
        const tx = (1 - u) * 3 * scale + u * 0;
        const ty = (1 - u) * 0 + u * 4 * scale;
        verts.push({
          x: tx,
          y: ty,
          z: Math.sin(u * Math.PI * 2) * 0.7
        });
      }
      // Centering offset
      return verts.map(v => ({ x: v.x - 0.5 * scale, y: v.y - 0.5 * scale, z: v.z * 0.8 }));
    }

    const pythagorasEdges = [
      // Square A edges
      [0,1],[1,2],[2,3],[3,0], [4,5],[5,6],[6,7],[7,4], [0,4],[1,5],[2,6],[3,7],
      // Square B edges
      [8,9],[9,10],[10,11],[11,8], [12,13],[13,14],[14,15],[15,12], [8,12],[9,13],[10,14],[11,15],
      // Square C edges
      [16,17],[17,18],[18,19],[19,16], [20,21],[21,22],[22,23],[23,20], [16,20],[17,21],[18,22],[19,23],
      // Triangle connect
      [0,1],[0,8],[1,16],[8,17],
      // Hypotenuse spine
      [24,26],[26,28],[28,30],[30,32],[32,34],[34,24]
    ];

    // --- Shape 1: Cylinder & Dual Cone 3D (원, 원기둥 및 원뿔 결합체) ---
    function genCylinderCone(pulse) {
      const verts = [];
      const r = 1.05 + Math.sin(pulse) * 0.05;
      const h = 0.95;
      // Top circle (12 vertices, y = +h)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * r, y: h, z: Math.sin(a) * r });
      }
      // Bottom circle (12 vertices, y = -h)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * r, y: -h, z: Math.sin(a) * r });
      }
      // Mid ring (10 vertices, y = 0)
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * r * 1.15, y: 0, z: Math.sin(a) * r * 1.15 });
      }
      // Top apex cone & Bottom apex cone (2 vertices)
      verts.push({ x: 0, y: h * 1.85, z: 0 }); // index 34
      verts.push({ x: 0, y: -h * 1.85, z: 0 }); // index 35
      return verts;
    }

    const cylinderEdges = [];
    // Top circle rim
    for (let i = 0; i < 12; i++) cylinderEdges.push([i, (i + 1) % 12]);
    // Bottom circle rim
    for (let i = 0; i < 12; i++) cylinderEdges.push([12 + i, 12 + (i + 1) % 12]);
    // Vertical column struts
    for (let i = 0; i < 12; i++) cylinderEdges.push([i, 12 + i]);
    // Mid ring
    for (let i = 0; i < 10; i++) cylinderEdges.push([24 + i, 24 + (i + 1) % 10]);
    // Cone apex edges
    for (let i = 0; i < 12; i += 2) {
      cylinderEdges.push([34, i]); // to top cone apex
      cylinderEdges.push([35, 12 + i]); // to bottom cone apex
    }

    // --- Shape 2: Celestial Sphere & Latitude Rings (우주 구체 / 위도·경도선) ---
    function genSphere(pulse) {
      const verts = [];
      const R = 1.35;
      // North pole (1)
      verts.push({ x: 0, y: R, z: 0 }); // 0
      // Lat +50 deg (8)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * R * 0.65, y: R * 0.76, z: Math.sin(a) * R * 0.65 });
      } // 1~8
      // Equator 0 deg (14)
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2 + pulse * 0.2;
        verts.push({ x: Math.cos(a) * R, y: 0, z: Math.sin(a) * R });
      } // 9~22
      // Lat -50 deg (8)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * R * 0.65, y: -R * 0.76, z: Math.sin(a) * R * 0.65 });
      } // 23~30
      // South pole (1)
      verts.push({ x: 0, y: -R, z: 0 }); // 31
      // Inner orbital gyro ring (4)
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 - pulse * 0.5;
        verts.push({ x: Math.cos(a) * R * 0.45, y: Math.sin(a) * R * 0.45, z: 0 });
      } // 32~35
      return verts;
    }

    const sphereEdges = [];
    // North pole connects
    for (let i = 1; i <= 8; i++) sphereEdges.push([0, i]);
    // Lat +50 ring
    for (let i = 1; i <= 8; i++) sphereEdges.push([i, i === 8 ? 1 : i + 1]);
    // Equator ring
    for (let i = 9; i <= 22; i++) sphereEdges.push([i, i === 22 ? 9 : i + 1]);
    // Connect Lat+50 to equator
    for (let i = 1; i <= 8; i++) sphereEdges.push([i, 9 + Math.floor((i - 1) * (14 / 8))]);
    // Lat -50 ring
    for (let i = 23; i <= 30; i++) sphereEdges.push([i, i === 30 ? 23 : i + 1]);
    // Connect Lat-50 to equator
    for (let i = 23; i <= 30; i++) sphereEdges.push([i, 9 + Math.floor((i - 23) * (14 / 8))]);
    // South pole connects
    for (let i = 23; i <= 30; i++) sphereEdges.push([31, i]);
    // Inner gyro
    for (let i = 32; i <= 35; i++) sphereEdges.push([i, i === 35 ? 32 : i + 1]);

    // --- Shape 3: Torus Ring (3D 원환체 도넛 링) ---
    function genTorusRing(pulse) {
      const verts = [];
      const R = 1.15; // Major radius
      const r = 0.48; // Minor tube radius
      // 6 cross-sections with 6 vertices each = 36 vertices
      for (let i = 0; i < 6; i++) {
        const u = (i / 6) * Math.PI * 2;
        for (let j = 0; j < 6; j++) {
          const v = (j / 6) * Math.PI * 2 + pulse;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const y = r * Math.sin(v);
          const z = (R + r * Math.cos(v)) * Math.sin(u);
          verts.push({ x, y, z });
        }
      }
      return verts;
    }

    const torusRingEdges = [];
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const curr = i * 6 + j;
        const nextTube = i * 6 + ((j + 1) % 6);
        const nextRing = ((i + 1) % 6) * 6 + j;
        torusRingEdges.push([curr, nextTube]);
        torusRingEdges.push([curr, nextRing]);
      }
    }

    // --- Shape 4: Möbius Ribbon & Golden Spiral (위상수학 뫼비우스의 띠) ---
    function genMobius(pulse) {
      const verts = [];
      // 18 cross-points along the strip with 2 edges each = 36 vertices
      const stripWidth = 0.45;
      for (let i = 0; i < 18; i++) {
        const u = (i / 18) * Math.PI * 2 + pulse * 0.4;
        // Edge 1 (v = -stripWidth)
        const v1 = -stripWidth;
        const x1 = (1.2 + v1 * Math.cos(u / 2)) * Math.cos(u);
        const y1 = v1 * Math.sin(u / 2) * 1.25;
        const z1 = (1.2 + v1 * Math.cos(u / 2)) * Math.sin(u);
        verts.push({ x: x1, y: y1, z: z1 });

        // Edge 2 (v = +stripWidth)
        const v2 = stripWidth;
        const x2 = (1.2 + v2 * Math.cos(u / 2)) * Math.cos(u);
        const y2 = v2 * Math.sin(u / 2) * 1.25;
        const z2 = (1.2 + v2 * Math.cos(u / 2)) * Math.sin(u);
        verts.push({ x: x2, y: y2, z: z2 });
      }
      return verts;
    }

    const mobiusEdges = [];
    for (let i = 0; i < 18; i++) {
      const i1 = i * 2;
      const i2 = i * 2 + 1;
      const next1 = ((i + 1) % 18) * 2;
      const next2 = ((i + 1) % 18) * 2 + 1;
      // Cross rung
      mobiusEdges.push([i1, i2]);
      // Longitudinal ribbons
      mobiusEdges.push([i1, next1]);
      mobiusEdges.push([i2, next2]);
      // Diagonal lattice
      mobiusEdges.push([i1, next2]);
    }

    // --- Shape 5: 4D Tesseract (4차원 초입방체 테서랙트) ---
    function genTesseract4D(angle4D) {
      const verts = [];
      const d = 2.2;
      // 16 4D cube vertices
      for (let i = 0; i < 16; i++) {
        let x = (i & 1) ? 1 : -1;
        let y = (i & 2) ? 1 : -1;
        let z = (i & 4) ? 1 : -1;
        let w = (i & 8) ? 1 : -1;

        const a1 = angle4D;
        const x1 = x * Math.cos(a1) - w * Math.sin(a1);
        const w1 = x * Math.sin(a1) + w * Math.cos(a1);

        const a2 = angle4D * 0.7;
        const z1 = z * Math.cos(a2) - w1 * Math.sin(a2);
        const w2 = z * Math.sin(a2) + w1 * Math.cos(a2);

        const fov4D = d / (d - w2 * 0.45);
        verts.push({ x: x1 * fov4D * 0.85, y: y * fov4D * 0.85, z: z1 * fov4D * 0.85 });
      }
      // 16 inner sub-cube vertices
      for (let i = 0; i < 16; i++) {
        verts.push({ x: verts[i].x * 0.52, y: verts[i].y * 0.52, z: verts[i].z * 0.52 });
      }
      // 4 central hyper-axis anchors
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * 0.25, y: Math.sin(a) * 0.25, z: 0 });
      }
      return verts;
    }

    const tesseractEdges = [];
    for (let i = 0; i < 16; i++) {
      for (let bit = 0; bit < 4; bit++) {
        const neighbor = i ^ (1 << bit);
        if (neighbor > i) tesseractEdges.push([i, neighbor]);
      }
      tesseractEdges.push([i, 16 + i]);
    }
    for (let i = 0; i < 16; i++) {
      for (let bit = 0; bit < 4; bit++) {
        const neighbor = 16 + (i ^ (1 << bit));
        if (neighbor > 16 + i) tesseractEdges.push([16 + i, neighbor]);
      }
    }

    // --- Shape 6: 3D Torus Knot (p=2, q=3 수학적 매듭 곡선) ---
    function genTorusKnot(angle) {
      const verts = [];
      const p = 2;
      const q = 3;
      for (let i = 0; i < 36; i++) {
        const theta = (i / 36) * Math.PI * 2 + angle * 0.25;
        const r = (Math.cos(q * theta) * 0.48 + 1.25) * 0.82;
        const x = r * Math.cos(p * theta);
        const y = r * Math.sin(p * theta);
        const z = -Math.sin(q * theta) * 0.88;
        verts.push({ x, y, z });
      }
      return verts;
    }

    const torusKnotEdges = [];
    for (let i = 0; i < 36; i++) {
      torusKnotEdges.push([i, (i + 1) % 36]);
      if (i % 3 === 0) {
        torusKnotEdges.push([i, (i + 18) % 36]); // Internal cross ties
      }
    }

    // --- Shape 7: Stellated Icosahedron (별모양 정이십면체 신성기하학) ---
    function genStellated(pulse) {
      const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio 1.618
      const raw12 = [
        [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
        [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
        [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
      ];

      const verts = raw12.map(v => {
        const len = Math.hypot(v[0], v[1], v[2]);
        return {
          x: (v[0] / len) * 1.1,
          y: (v[1] / len) * 1.1,
          z: (v[2] / len) * 1.1
        };
      });

      // 20 Stellated spikes
      const spikeScale = 1.38 + Math.sin(pulse) * 0.12;
      for (let i = 0; i < 20; i++) {
        const theta = (i / 20) * Math.PI * 2;
        const phiAngle = ((i % 5) / 5) * Math.PI - Math.PI / 2;
        verts.push({
          x: Math.cos(phiAngle) * Math.cos(theta) * spikeScale,
          y: Math.sin(phiAngle) * spikeScale,
          z: Math.cos(phiAngle) * Math.sin(theta) * spikeScale
        });
      }

      // 4 Core axis vertices
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * 0.35, y: Math.sin(a) * 0.35, z: 0 });
      }

      return verts;
    }

    const stellatedEdges = [];
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        stellatedEdges.push([i, j]);
      }
    }
    for (let i = 0; i < 20; i++) {
      stellatedEdges.push([12 + i, i % 12]);
      stellatedEdges.push([12 + i, (i + 1) % 12]);
    }

    // Geometry registry
    const NUM_SHAPES = 8;
    const geometryGenerators = [
      genPythagoras,   // 0: 피타고라스 정리 3D
      genCylinderCone, // 1: 원기둥 & 원뿔 3D
      genSphere,       // 2: 우주 구체 & 위도/경도
      genTorusRing,    // 3: 3D 원환체 도넛
      genMobius,       // 4: 뫼비우스의 띠 & 황금나선
      genTesseract4D,  // 5: 4D 초입방체 테서랙트
      genTorusKnot,    // 6: 토러스 매듭 3D
      genStellated     // 7: 별모양 정이십면체
    ];

    const geometryEdges = [
      pythagorasEdges,
      cylinderEdges,
      sphereEdges,
      torusRingEdges,
      mobiusEdges,
      tesseractEdges,
      torusKnotEdges,
      stellatedEdges
    ];

    let currentShapeIndex = 0;
    let targetShapeIndex = 1;
    let morphProgress = 0; // 0 to 1
    let shapeTimer = 0;

    nextShapeTriggerRef.current = () => {
      targetShapeIndex = (currentShapeIndex + 1) % NUM_SHAPES;
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

      // Auto Morphing Clock (Switch shape every 5.5s)
      shapeTimer += 0.016;
      if (shapeTimer > 5.5) {
        shapeTimer = 0;
        targetShapeIndex = (currentShapeIndex + 1) % NUM_SHAPES;
        morphProgress = 0;
      }

      if (morphProgress < 1) {
        morphProgress += 0.016; // Smooth 1-second morph transition
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

      // Nebula layer 2: Cosmic Purple/Magenta
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

      // C. Morph Vertices Interpolation
      const vertsA = geometryGenerators[currentShapeIndex](time);
      const vertsB = geometryGenerators[targetShapeIndex](time);

      const easeMorph = morphProgress < 1 
        ? (1 - Math.pow(1 - morphProgress, 3)) // Smooth cubic ease out
        : 1;

      const morphed3D = [];
      for (let i = 0; i < NUM_VERTS; i++) {
        const vA = vertsA[i] || { x: 0, y: 0, z: 0 };
        const vB = vertsB[i] || { x: 0, y: 0, z: 0 };
        morphed3D.push({
          x: vA.x + (vB.x - vA.x) * easeMorph,
          y: vA.y + (vB.y - vA.y) * easeMorph,
          z: vA.z + (vB.z - vA.z) * easeMorph,
        });
      }

      // Edges selection based on morph progress
      const edgesA = geometryEdges[currentShapeIndex];
      const edgesB = geometryEdges[targetShapeIndex];
      const activeEdges = easeMorph < 0.5 ? edgesA : edgesB;

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
