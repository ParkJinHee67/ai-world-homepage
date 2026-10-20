"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Eye, EyeOff, Info, Compass, Sparkles, ChevronRight, X
} from 'lucide-react';

/**
 * SolarTimeCanvas - 실시간 태양계 시계 및 우주 시뮬레이션
 * solartime.app 참고 구현
 * 
 * - 실시간 시계 연동 (현재 시각 기준 행성 공전 계산)
 * - 케플러 법칙 타원 궤도 (근일점 가속 / 원일점 감속)
 * - 8개 행성(수·금·지·화·목·토·천·해) + 위성(달, 유로파) + 토성 3D 고리
 * - 3D 인터랙티브 뷰포트 (마우스 드래그 3D 회전, 휠 줌인/아웃, 터치 제스처)
 * - 시간 여행 배속 컨트롤러 (실시간 / 1일·30일·1년 단위 슬라이더 및 가속)
 * - Web Audio API 기반 신비로운 우주 앰비언트 사운드
 * - 행성 정보 툴팁 & 감상 모드 (H) & 전체화면 (F)
 */

// 행성 기본 파라미터 (천문 비율 기반 가시성 튜닝)
const PLANETS = [
  {
    id: 'mercury',
    name: '수성',
    nameEn: 'Mercury',
    semiMajor: 54, // AU 스케일
    eccentricity: 0.2056,
    periodDays: 87.97,
    radius: 3.8,
    color: '#a3a3a3',
    glowColor: 'rgba(212, 212, 216, 0.4)',
    orbitColor: 'rgba(212, 212, 216, 0.22)',
    desc: '태양과 가장 가까운 행성. 대기가 없어 밤낮의 온도 차가 600℃에 달합니다.',
    distanceAU: '0.39 AU (5,790만 km)',
    orbitPeriod: '88일',
    diameter: '4,879 km'
  },
  {
    id: 'venus',
    name: '금성',
    nameEn: 'Venus',
    semiMajor: 82,
    eccentricity: 0.0068,
    periodDays: 224.7,
    radius: 5.6,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    orbitColor: 'rgba(245, 158, 11, 0.22)',
    desc: '밤하늘에서 가장 밝은 샛별. 두터운 이산화탄소 대기로 표면 온도가 470℃입니다.',
    distanceAU: '0.72 AU (1억 800만 km)',
    orbitPeriod: '225일',
    diameter: '12,104 km'
  },
  {
    id: 'earth',
    name: '지구',
    nameEn: 'Earth',
    semiMajor: 118,
    eccentricity: 0.0167,
    periodDays: 365.256,
    radius: 6.2,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    orbitColor: 'rgba(56, 189, 248, 0.26)',
    desc: '인류의 보금자리이자 푸른 행성. 생명체가 살아 숨 쉬는 유일한 행성입니다.',
    distanceAU: '1.00 AU (1억 4,960만 km)',
    orbitPeriod: '365.26일 (1년)',
    diameter: '12,742 km',
    moon: {
      id: 'moon',
      name: '달',
      nameEn: 'Moon',
      distance: 14,
      periodDays: 27.32,
      radius: 1.8,
      eccentricity: 0.0549,
      color: '#e2e8f0'
    }
  },
  {
    id: 'mars',
    name: '화성',
    nameEn: 'Mars',
    semiMajor: 158,
    eccentricity: 0.0934,
    periodDays: 686.98,
    radius: 4.6,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    orbitColor: 'rgba(239, 68, 68, 0.24)',
    desc: '붉은 산화철 사막으로 뒤덮인 행성. 올림푸스 화산과 극관 얼음이 있습니다.',
    distanceAU: '1.52 AU (2억 2,790만 km)',
    orbitPeriod: '687일 (약 1.9년)',
    diameter: '6,779 km'
  },
  {
    id: 'jupiter',
    name: '목성',
    nameEn: 'Jupiter',
    semiMajor: 226,
    eccentricity: 0.0484,
    periodDays: 4332.59, // ~11.86년
    radius: 13.5,
    color: '#f59e0b',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    orbitColor: 'rgba(251, 191, 36, 0.22)',
    bands: true,
    desc: '태양계에서 가장 거대한 가스 행성. 대적점 폭풍과 강력한 중력을 가졌습니다.',
    distanceAU: '5.20 AU (7억 7,850만 km)',
    orbitPeriod: '11.86년',
    diameter: '139,820 km',
    moon: {
      id: 'europa',
      name: '유로파',
      nameEn: 'Europa',
      distance: 22,
      periodDays: 3.55,
      radius: 1.9,
      eccentricity: 0.01,
      color: '#cffafe'
    }
  },
  {
    id: 'saturn',
    name: '토성',
    nameEn: 'Saturn',
    semiMajor: 298,
    eccentricity: 0.0542,
    periodDays: 10759.22, // ~29.46년
    radius: 11.2,
    color: '#fde047',
    glowColor: 'rgba(253, 224, 71, 0.4)',
    orbitColor: 'rgba(253, 224, 71, 0.22)',
    ring: { inner: 15, outer: 25, color: 'rgba(234, 179, 8, 0.65)' },
    desc: '얼음과 암석 파편으로 이루어진 화려한 고리를 가진 태양계의 보석.',
    distanceAU: '9.58 AU (14억 3,400만 km)',
    orbitPeriod: '29.46년',
    diameter: '116,460 km'
  },
  {
    id: 'uranus',
    name: '천왕성',
    nameEn: 'Uranus',
    semiMajor: 368,
    eccentricity: 0.0472,
    periodDays: 30685.4, // ~84년
    radius: 8.2,
    color: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.4)',
    orbitColor: 'rgba(45, 212, 191, 0.22)',
    ring: { inner: 10.5, outer: 13, color: 'rgba(45, 212, 191, 0.35)' },
    desc: '자전축이 98도 기울어져 누워서 공전하는 청록빛 얼음 거인입니다.',
    distanceAU: '19.2 AU (28억 7,100만 km)',
    orbitPeriod: '84년',
    diameter: '50,724 km'
  },
  {
    id: 'neptune',
    name: '해왕성',
    nameEn: 'Neptune',
    semiMajor: 436,
    eccentricity: 0.0086,
    periodDays: 60189.0, // ~164.8년
    radius: 7.8,
    color: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.45)',
    orbitColor: 'rgba(96, 165, 250, 0.22)',
    desc: '태양계의 가장 바깥을 지키는 짙푸른 행성. 시속 2,000km가 넘는 초음속 폭풍이 붑니다.',
    distanceAU: '30.0 AU (44억 9,500만 km)',
    orbitPeriod: '164.8년',
    diameter: '49,244 km'
  }
];

// 케플러 방정식 풀이: M = E - e*sin(E) -> E 계산
function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 4; i++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-6) break;
  }
  return E;
}

export default function SolarTimeCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // 시뮬레이션 상태
  const [isRealtime, setIsRealtime] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeedFactor, setSimSpeedFactor] = useState(1); // 1 = 실시간(초당 1초), 배속 시 86400 (1일/초) 등
  const [speedPreset, setSpeedPreset] = useState('realtime'); // 'realtime' | '1h' | '1d' | '30d' | '1y'
  
  // 시간 상태
  const [displayDate, setDisplayDate] = useState(() => new Date());
  const simTimeRef = useRef(Date.now()); // ms timestamp

  // UI 모드
  const [isCinemaMode, setIsCinemaMode] = useState(false); // H 키: UI 숨기기
  const [isFullscreen, setIsFullscreen] = useState(false); // F 키: 전체화면
  const [selectedPlanet, setSelectedPlanet] = useState(null); // 클릭한 행성 정보
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  // 오디오 (Web Audio API)
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const audioIntervalRef = useRef(null);

  // 3D 뷰포트 (카메라)
  const cameraRef = useRef({
    pitch: 58 * (Math.PI / 180), // 상하 각도 (약 58도에서 우주 조망)
    yaw: 25 * (Math.PI / 180),   // 좌우 회전 각도
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragBtn: 0, // 0: 좌클릭(회전), 2: 우클릭(팬)
    lastMouseX: 0,
    lastMouseY: 0,
  });

  // 배경 3D 별무리
  const starsRef = useRef([]);

  // 1. 별무리 초기화
  useEffect(() => {
    const count = 280;
    const stars = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = 600 + Math.random() * 800;
      stars.push({
        x: dist * Math.sin(phi) * Math.cos(theta),
        y: dist * Math.sin(phi) * Math.sin(theta),
        z: dist * Math.cos(phi),
        radius: Math.random() * 1.5 + 0.4,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#93c5fd' : '#fef08a'),
      });
    }
    starsRef.current = stars;
  }, []);

  // 2. 오디오 신시사이저 초기화 (잔잔한 우주 앰비언트)
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // 40Hz ~ 120Hz 드론 베이스 & 패드
      const baseFreqs = [55, 110, 164.81, 220, 277.18]; // A major 9th ambient chord
      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + idx * 80, ctx.currentTime);

        gain.gain.setValueAtTime(0.025 / (idx + 1), ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start();
      });

      // 잔잔한 우주 챠임/펄스
      const playChime = () => {
        if (!audioCtxRef.current || isMuted) return;
        const now = ctx.currentTime;
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        const chimeFilter = ctx.createBiquadFilter();

        const notes = [440, 554.37, 659.25, 830.61, 987.77, 1108.73];
        const pick = notes[Math.floor(Math.random() * notes.length)];
        
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(pick, now);

        chimeFilter.type = 'bandpass';
        chimeFilter.frequency.setValueAtTime(pick, now);
        chimeFilter.Q.setValueAtTime(4, now);

        chimeGain.gain.setValueAtTime(0.0001, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.015, now + 0.4);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        chimeOsc.connect(chimeFilter);
        chimeFilter.connect(chimeGain);
        chimeGain.connect(master);

        chimeOsc.start(now);
        chimeOsc.stop(now + 5.0);
      };

      audioIntervalRef.current = setInterval(playChime, 3800);
    } catch (e) {
      console.warn('AudioContext not supported or restricted', e);
    }
  }, [isMuted]);

  const toggleSound = () => {
    if (isMuted) {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.exponentialRampToValueAtTime(0.18, audioCtxRef.current.currentTime + 1.2);
      }
      setIsMuted(false);
    } else {
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.8);
      }
      setIsMuted(true);
    }
  };

  // 3. 배속 프리셋 변경
  const handleSpeedPreset = (preset) => {
    setSpeedPreset(preset);
    if (preset === 'realtime') {
      setIsRealtime(true);
      setSimSpeedFactor(1);
    } else {
      setIsRealtime(false);
      let factor = 1;
      if (preset === '1h') factor = 3600; // 1초에 1시간
      else if (preset === '1d') factor = 86400; // 1초에 1일
      else if (preset === '30d') factor = 86400 * 30; // 1초에 30일
      else if (preset === '1y') factor = 86400 * 365.25; // 1초에 1년
      setSimSpeedFactor(factor);
    }
  };

  // 실제 시간으로 리셋 (R)
  const resetToRealtime = () => {
    simTimeRef.current = Date.now();
    setIsRealtime(true);
    setSpeedPreset('realtime');
    setSimSpeedFactor(1);
    setIsPlaying(true);
  };

  // 기본 시점 리셋 (0)
  const resetCamera = () => {
    cameraRef.current.pitch = 58 * (Math.PI / 180);
    cameraRef.current.yaw = 25 * (Math.PI / 180);
    cameraRef.current.zoom = 1.0;
    cameraRef.current.panX = 0;
    cameraRef.current.panY = 0;
  };

  // 전체화면 토글 (F)
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 텍스트 입력창 포커스 시 단축키 무시
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'ㄱ') {
        resetToRealtime();
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'ㄹ') {
        toggleFullscreen();
      } else if (e.key === 'h' || e.key === 'H' || e.key === 'ㅗ') {
        setIsCinemaMode(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M' || e.key === 'ㅡ') {
        toggleSound();
      } else if (e.key === '0') {
        resetCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, toggleSound]);

  // 전체화면 상태 변경 감지
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 4. 메인 애니메이션 & 캔버스 렌더러
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = 800;
    let height = 500;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width || 800;
      height = rect.height || 500;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(() => resize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    resize();

    let lastFrameTime = performance.now();
    let clockUpdateTimer = 0;

    // 3D 회전 투영 함수
    const project3D = (x, y, z, pitch, yaw, zoom, cx, cy) => {
      // 1. Yaw 회전 (Y축 기준, 여기선 Z축 평면)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY - y * sinY;
      const y1 = x * sinY + y * cosY;
      const z1 = z;

      // 2. Pitch 회전 (X축 기준 틸트)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;
      const x2 = x1;

      // 3. Perspective Projection
      const fov = 850;
      const depth = fov / (fov + z2);
      const scale = zoom * depth;
      const sx = cx + x2 * scale;
      const sy = cy + y2 * scale;

      return { sx, sy, scale, zDepth: z2 };
    };

    const render = (now) => {
      const dt = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      // 시간 전진 계산
      if (isPlaying) {
        if (isRealtime) {
          simTimeRef.current = Date.now();
        } else {
          simTimeRef.current += dt * simSpeedFactor * 1000;
        }
      }

      // UI 시계 갱신 (15프레임마다 가볍게)
      clockUpdateTimer++;
      if (clockUpdateTimer % 12 === 0) {
        setDisplayDate(new Date(simTimeRef.current));
      }

      // 배경 클리어 (우주 딥 스페이스 다크 네이비 그라데이션)
      ctx.clearRect(0, 0, width, height);
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, Math.max(width, height) * 0.85);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#04060a');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + cameraRef.current.panX;
      const cy = height / 2 + cameraRef.current.panY;
      const pitch = cameraRef.current.pitch;
      const yaw = cameraRef.current.yaw;
      const zoom = cameraRef.current.zoom;

      // 자동 미세 자전 (조작 안 할 때 잔잔한 우주 회전)
      if (!cameraRef.current.isDragging) {
        cameraRef.current.yaw += 0.00045;
      }

      // 1. 별무리 (Starfield) 렌더링
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const p = project3D(s.x, s.y, s.z, pitch, yaw, 0.9, cx, cy);
        if (p.sx >= -10 && p.sx <= width + 10 && p.sy >= -10 && p.sy <= height + 10) {
          const alpha = 0.35 + 0.55 * Math.sin(now * s.twinkleSpeed + s.phase);
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, s.radius * Math.max(0.4, p.scale), 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // 천체 시뮬레이션 계산
      // 기준 일자: 2026년 1월 1일 00:00:00 UTC = 1767225600000
      const daysSinceEpoch = (simTimeRef.current - 1767225600000) / 86400000;

      const renderObjects = [];

      // 1) 태양 (Sun)
      renderObjects.push({
        type: 'sun',
        x: 0,
        y: 0,
        z: 0,
        radius: 20,
        projected: project3D(0, 0, 0, pitch, yaw, zoom, cx, cy)
      });

      // 2) 행성 및 위성 위치 계산
      const currentPlanetPositions = [];

      PLANETS.forEach((planet, idx) => {
        const a = planet.semiMajor;
        const e = planet.eccentricity;
        const b = a * Math.sqrt(Math.max(0, 1 - e * e));

        // 평균 근점이각 M (라디안)
        const M = (2 * Math.PI * (daysSinceEpoch / planet.periodDays) + idx * 0.85) % (2 * Math.PI);
        const E = solveKepler(M, e);

        // 궤도 타원 좌표 (초점 태양 0,0 기준 x = a(cosE - e), y = b*sinE)
        const px = a * (Math.cos(E) - e);
        const py = b * Math.sin(E);
        const pz = 0;

        const pProj = project3D(px, py, pz, pitch, yaw, zoom, cx, cy);

        currentPlanetPositions.push({
          planet,
          x: px,
          y: py,
          z: pz,
          proj: pProj
        });

        renderObjects.push({
          type: 'planet',
          planet,
          x: px,
          y: py,
          z: pz,
          projected: pProj
        });

        // 위성 계산 (달 / 유로파)
        if (planet.moon) {
          const m = planet.moon;
          const mM = (2 * Math.PI * (daysSinceEpoch / m.periodDays)) % (2 * Math.PI);
          const mE = solveKepler(mM, m.eccentricity);
          const ma = m.distance;
          const mb = ma * Math.sqrt(1 - m.eccentricity * m.eccentricity);

          const mx = px + ma * (Math.cos(mE) - m.eccentricity);
          const my = py + mb * Math.sin(mE);
          const mz = 0;

          const mProj = project3D(mx, my, mz, pitch, yaw, zoom, cx, cy);
          renderObjects.push({
            type: 'moon',
            moon: m,
            parentPlanet: planet,
            x: mx,
            y: my,
            z: mz,
            projected: mProj
          });
        }
      });

      // 3. 궤도선 (Orbit lines) 먼저 렌더링
      PLANETS.forEach((planet) => {
        const a = planet.semiMajor;
        const e = planet.eccentricity;
        const b = a * Math.sqrt(Math.max(0, 1 - e * e));
        const numSegments = 64;

        ctx.beginPath();
        for (let i = 0; i <= numSegments; i++) {
          const theta = (i / numSegments) * Math.PI * 2;
          const ox = a * (Math.cos(theta) - e);
          const oy = b * Math.sin(theta);
          const op = project3D(ox, oy, 0, pitch, yaw, zoom, cx, cy);

          if (i === 0) ctx.moveTo(op.sx, op.sy);
          else ctx.lineTo(op.sx, op.sy);
        }
        ctx.strokeStyle = planet.orbitColor;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      });

      // 4. z-depth 기준으로 정렬하여 앞/뒤 렌더링 (원근감)
      renderObjects.sort((o1, o2) => o2.projected.zDepth - o1.projected.zDepth);

      renderObjects.forEach((obj) => {
        const { sx, sy, scale, zDepth } = obj.projected;

        if (obj.type === 'sun') {
          // 태양 렌더링: 거대한 코로나 글로우 + 코어
          const sunR = Math.max(10, obj.radius * scale);
          const pulse = 1.0 + Math.sin(now * 0.003) * 0.06;

          // 코로나 방사 글로우
          const coronaGrad = ctx.createRadialGradient(sx, sy, sunR * 0.2, sx, sy, sunR * 3.4 * pulse);
          coronaGrad.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
          coronaGrad.addColorStop(0.2, 'rgba(245, 158, 11, 0.7)');
          coronaGrad.addColorStop(0.55, 'rgba(239, 68, 68, 0.3)');
          coronaGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.beginPath();
          ctx.arc(sx, sy, sunR * 3.4 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = coronaGrad;
          ctx.fill();

          // 태양 중심 코어
          const coreGrad = ctx.createRadialGradient(sx - sunR * 0.25, sy - sunR * 0.25, sunR * 0.1, sx, sy, sunR);
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.4, '#fef08a');
          coreGrad.addColorStop(0.85, '#f59e0b');
          coreGrad.addColorStop(1, '#b45309');

          ctx.beginPath();
          ctx.arc(sx, sy, sunR, 0, Math.PI * 2);
          ctx.fillStyle = coreGrad;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.shadowBlur = 0;

        } else if (obj.type === 'planet') {
          const p = obj.planet;
          const pr = Math.max(2.5, p.radius * scale);

          // 행성 대기/글로우
          ctx.beginPath();
          ctx.arc(sx, sy, pr * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = p.glowColor;
          ctx.fill();

          // 토성 / 천왕성 고리 (행성 뒤쪽 고리 먼저 그리기)
          if (p.ring) {
            drawRing(ctx, sx, sy, p.ring.inner * scale, p.ring.outer * scale, pitch, yaw, p.ring.color, true);
          }

          // 행성 본체 (태양 방향에 따른 음영 그라데이션)
          // 태양(0,0,0) 방향 벡터를 화면 2D에서 계산
          const sunP = project3D(0, 0, 0, pitch, yaw, zoom, cx, cy);
          const angleToSun = Math.atan2(sunP.sy - sy, sunP.sx - sx);

          const planetGrad = ctx.createRadialGradient(
            sx + Math.cos(angleToSun) * pr * 0.45,
            sy + Math.sin(angleToSun) * pr * 0.45,
            pr * 0.1,
            sx,
            sy,
            pr
          );
          planetGrad.addColorStop(0, '#ffffff');
          planetGrad.addColorStop(0.35, p.color);
          planetGrad.addColorStop(0.85, p.color);
          planetGrad.addColorStop(1, '#05070c'); // 밤(그림자) 영역

          ctx.beginPath();
          ctx.arc(sx, sy, pr, 0, Math.PI * 2);
          ctx.fillStyle = planetGrad;
          ctx.fill();

          // 목성 줄무늬 패턴
          if (p.bands) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(sx, sy, pr, 0, Math.PI * 2);
            ctx.clip();
            ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
            ctx.lineWidth = pr * 0.22;
            ctx.beginPath();
            ctx.moveTo(sx - pr, sy - pr * 0.2);
            ctx.lineTo(sx + pr, sy - pr * 0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(sx - pr, sy + pr * 0.28);
            ctx.lineTo(sx + pr, sy + pr * 0.28);
            ctx.stroke();
            ctx.restore();
          }

          // 토성 / 천왕성 앞쪽 고리
          if (p.ring) {
            drawRing(ctx, sx, sy, p.ring.inner * scale, p.ring.outer * scale, pitch, yaw, p.ring.color, false);
          }

          // 행성 라벨 (클릭/호버되었거나 또는 감상 모드가 아닐 때 폰트 표시)
          if (!isCinemaMode) {
            ctx.font = `600 ${Math.max(10, Math.min(13, 11 * scale))}px var(--font-title), sans-serif`;
            ctx.fillStyle = hoveredPlanet?.id === p.id || selectedPlanet?.id === p.id ? '#ffffff' : 'rgba(226, 232, 240, 0.75)';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, sx, sy + pr + 14);
          }

          // 선택/호버 테두리 링
          if (selectedPlanet?.id === p.id || hoveredPlanet?.id === p.id) {
            ctx.beginPath();
            ctx.arc(sx, sy, pr + 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

        } else if (obj.type === 'moon') {
          const m = obj.moon;
          const mr = Math.max(1.5, m.radius * scale);

          ctx.beginPath();
          ctx.arc(sx, sy, mr, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();

          // 위성 라벨 (줌이 충분히 당겨졌을 때 표시)
          if (!isCinemaMode && zoom > 1.3) {
            ctx.font = '500 9px sans-serif';
            ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
            ctx.textAlign = 'center';
            ctx.fillText(m.name, sx, sy + mr + 10);
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
    };
  }, [isPlaying, isRealtime, simSpeedFactor, isCinemaMode, hoveredPlanet, selectedPlanet]);

  // 고리(Rings) 그리기 헬퍼
  const drawRing = (ctx, cx, cy, innerR, outerR, pitch, yaw, color, isBack) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, Math.cos(pitch) * 0.65); // 타원 투영

    ctx.lineWidth = outerR - innerR;
    ctx.strokeStyle = color;
    ctx.beginPath();
    // 뒤쪽(back)은 위쪽 반원, 앞쪽(front)은 아래쪽 반원
    const startAngle = isBack ? Math.PI : 0;
    const endAngle = isBack ? Math.PI * 2 : Math.PI;
    ctx.arc(0, 0, (innerR + outerR) / 2, startAngle, endAngle);
    ctx.stroke();
    ctx.restore();
  };

  // 마우스 인터랙션 핸들러
  const handleMouseDown = (e) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.dragBtn = e.button;
    cameraRef.current.lastMouseX = e.clientX;
    cameraRef.current.lastMouseY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (cameraRef.current.isDragging) {
      const dx = e.clientX - cameraRef.current.lastMouseX;
      const dy = e.clientY - cameraRef.current.lastMouseY;
      cameraRef.current.lastMouseX = e.clientX;
      cameraRef.current.lastMouseY = e.clientY;

      if (cameraRef.current.dragBtn === 0) {
        // 좌클릭: 3D 뷰포트 회전
        cameraRef.current.yaw += dx * 0.006;
        cameraRef.current.pitch = Math.max(0.1, Math.min(Math.PI * 0.48, cameraRef.current.pitch + dy * 0.005));
      } else if (cameraRef.current.dragBtn === 2) {
        // 우클릭: 화면 이동(Pan)
        cameraRef.current.panX += dx;
        cameraRef.current.panY += dy;
      }
    } else {
      // 행성 호버 감지
      checkPlanetHit(e.clientX, e.clientY, false);
    }
  };

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.08 : 0.92;
    cameraRef.current.zoom = Math.max(0.35, Math.min(3.8, cameraRef.current.zoom * zoomDelta));
  };

  const handleClick = (e) => {
    checkPlanetHit(e.clientX, e.clientY, true);
  };

  // 행성 클릭/호버 감지
  const checkPlanetHit = (clientX, clientY, isClick) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const cx = width / 2 + cameraRef.current.panX;
    const cy = height / 2 + cameraRef.current.panY;
    const pitch = cameraRef.current.pitch;
    const yaw = cameraRef.current.yaw;
    const zoom = cameraRef.current.zoom;

    const daysSinceEpoch = (simTimeRef.current - 1767225600000) / 86400000;
    let hit = null;

    PLANETS.forEach((planet, idx) => {
      const a = planet.semiMajor;
      const e = planet.eccentricity;
      const b = a * Math.sqrt(Math.max(0, 1 - e * e));
      const M = (2 * Math.PI * (daysSinceEpoch / planet.periodDays) + idx * 0.85) % (2 * Math.PI);
      const E = solveKepler(M, e);
      const px = a * (Math.cos(E) - e);
      const py = b * Math.sin(E);

      // project
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = px * cosY - py * sinY;
      const y1 = px * sinY + py * cosY;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y1 * cosP;
      const z2 = y1 * sinP;
      const fov = 850;
      const depth = fov / (fov + z2);
      const scale = zoom * depth;
      const sx = cx + x1 * scale;
      const sy = cy + y2 * scale;
      const pr = Math.max(7, planet.radius * scale + 5);

      const dist = Math.hypot(mx - sx, my - sy);
      if (dist < pr + 12) {
        hit = planet;
      }
    });

    if (isClick) {
      setSelectedPlanet(hit);
    } else {
      setHoveredPlanet(hit);
      canvas.style.cursor = hit ? 'pointer' : (cameraRef.current.isDragging ? 'grabbing' : 'grab');
    }
  };

  // 날짜/시간 포맷팅
  const formatTimeStr = (d) => {
    return d.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  const formatDateStr = (d) => {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <div 
      ref={containerRef}
      className={isFullscreen ? '' : 'solar-time-container'}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : '520px',
        borderRadius: isFullscreen ? '0' : '24px',
        overflow: 'hidden',
        background: '#020306',
        border: isFullscreen ? 'none' : '1px solid rgba(56, 189, 248, 0.2)',
        boxShadow: isFullscreen ? 'none' : '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.08)',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL/2D Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      {/* TOP HEADER: 실시간 시계 & 상태 배지 */}
      {!isCinemaMode && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 20
        }}>
          {/* 좌측 타이틀 & 실시간 시간 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(6, 10, 20, 0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 16px',
            borderRadius: '100px',
            pointerEvents: 'auto'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isRealtime ? '#10b981' : '#f59e0b',
              boxShadow: isRealtime ? '0 0 10px #10b981' : '0 0 10px #f59e0b',
              animation: 'pulse 2s infinite'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.05em', fontFamily: 'var(--font-title)' }}>
                  SOLAR TIME
                </span>
                <span style={{ fontSize: '0.68rem', color: isRealtime ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                  {isRealtime ? 'LIVE 실시간' : `시뮬레이션`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                  {formatTimeStr(displayDate)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {formatDateStr(displayDate)}
                </span>
              </div>
            </div>
          </div>

          {/* 우측 퀵 컨트롤 (사운드 / 감상 / 전체화면) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto'
          }}>
            <button
              onClick={toggleSound}
              title={isMuted ? "배경음악 켜기 (M)" : "음소거 (M)"}
              style={{
                background: 'rgba(6, 10, 20, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMuted ? '#94a3b8' : '#38bdf8',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <button
              onClick={() => setIsCinemaMode(true)}
              title="감상 모드 - 인터페이스 숨기기 (H)"
              style={{
                background: 'rgba(6, 10, 20, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
            >
              <EyeOff size={17} />
            </button>

            <button
              onClick={resetCamera}
              title="기본 시점 리셋 (0)"
              style={{
                background: 'rgba(6, 10, 20, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
            >
              <Compass size={17} />
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "전체화면 종료 (F)" : "전체화면 감상 (F)"}
              style={{
                background: 'rgba(6, 10, 20, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f8fafc',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          </div>
        </div>
      )}

      {/* 감상 모드 해제 플로팅 버튼 */}
      {isCinemaMode && (
        <button
          onClick={() => setIsCinemaMode(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(6, 10, 20, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '100px',
            padding: '6px 14px',
            color: '#94a3b8',
            fontSize: '0.75rem',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 30
          }}
        >
          <Eye size={14} /> UI 다시 보기 (H)
        </button>
      )}

      {/* 행성 상세 정보 팝업 카드 */}
      {selectedPlanet && !isCinemaMode && (
        <div style={{
          position: 'absolute',
          top: '78px',
          right: '20px',
          width: '280px',
          background: 'rgba(9, 14, 28, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          color: '#f8fafc',
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
          zIndex: 25,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: selectedPlanet.color,
                  boxShadow: `0 0 10px ${selectedPlanet.color}`
                }} />
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{selectedPlanet.name}</h4>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedPlanet.nameEn}</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedPlanet(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45', margin: '8px 0 12px' }}>
            {selectedPlanet.desc}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>공전 주기</span>
              <strong style={{ color: '#38bdf8' }}>{selectedPlanet.orbitPeriod}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>태양과의 거리</span>
              <strong style={{ color: '#f8fafc' }}>{selectedPlanet.distanceAU}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>행성 지름</span>
              <strong style={{ color: '#f8fafc' }}>{selectedPlanet.diameter}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>궤도 이심률</span>
              <strong style={{ color: '#fbbf24' }}>{selectedPlanet.eccentricity}</strong>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLLER: 배속 및 시뮬레이션 제어 바 */}
      {!isCinemaMode && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          pointerEvents: 'none',
          zIndex: 20
        }}>
          {/* 배속 선택 버튼 그룹 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(6, 10, 20, 0.76)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 10px',
            borderRadius: '100px',
            pointerEvents: 'auto'
          }}>
            {/* 재생/일시정지 */}
            <button
              onClick={() => setIsPlaying(prev => !prev)}
              title={isPlaying ? "일시정지 (Space)" : "재생 (Space)"}
              style={{
                background: isPlaying ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isPlaying ? '#38bdf8' : '#ffffff',
                cursor: 'pointer',
                marginRight: '4px'
              }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
            </button>

            {/* 실제 시간 버튼 */}
            <button
              onClick={resetToRealtime}
              title="실제 시간 동기화 (R)"
              style={{
                background: isRealtime ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                border: isRealtime ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                color: isRealtime ? '#ffffff' : '#cbd5e1',
                borderRadius: '100px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              실제 시간 (R)
            </button>

            {/* 배속 프리셋들 */}
            {[
              { id: '1h', label: '1시간/초' },
              { id: '1d', label: '1일/초' },
              { id: '30d', label: '1달/초' },
              { id: '1y', label: '1년/초' }
            ].map((p) => {
              const active = speedPreset === p.id && !isRealtime;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSpeedPreset(p.id)}
                  style={{
                    background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                    border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: active ? '#ffffff' : '#94a3b8',
                    borderRadius: '100px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* 조작 안내 툴팁 */}
          <div className="solar-hints-desktop" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(6, 10, 20, 0.65)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '6px 14px',
            borderRadius: '100px',
            color: '#94a3b8',
            fontSize: '0.7rem',
            pointerEvents: 'auto'
          }}>
            <span>🖱️ <b>드래그:</b> 3D 회전</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>🔍 <b>휠:</b> 줌인·아웃</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>🪐 <b>클릭:</b> 행성 탐색</span>
          </div>
        </div>
      )}
    </div>
  );
}
