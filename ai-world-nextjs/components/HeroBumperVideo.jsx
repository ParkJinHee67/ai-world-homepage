"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { useLanguage } from '../app/LanguageContext';

export default function HeroBumperVideo() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { t } = useLanguage();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Auto-play on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log('Autoplay prevented, user interaction required:', err);
        setIsPlaying(false);
      });
    }
  }, []);

  // Update time and duration
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Mute / Unmute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Replay
  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  // Seek bar
  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Auto-hide controls when mouse is still
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  const formatTime = (secs) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const remainSec = s % 60;
    return `${m.toString().padStart(2, '0')}:${remainSec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : '520px',
        maxHeight: isFullscreen ? '100vh' : '520px',
        borderRadius: isFullscreen ? '0' : '24px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, #0a0e1c 0%, #020306 100%)',
        border: isFullscreen ? 'none' : '1px solid rgba(244, 63, 94, 0.25)',
        boxShadow: isFullscreen ? 'none' : '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(244, 63, 94, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src="/videos/bumper-15s.mp4"
        playsInline
        autoPlay
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          cursor: 'pointer',
          backgroundColor: '#000000',
        }}
      />

      {/* Top Header Overlay: Badge & BGM Info */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '100px',
            padding: '5px 14px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#f43f5e',
              boxShadow: '0 0 10px #f43f5e',
            }}
          />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.04em',
            }}
          >
            톱니바꿈 AI월드 범퍼 영상 (15s)
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'rgba(255, 255, 255, 0.6)',
              paddingLeft: '4px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            1080P FHD
          </span>
        </div>

        {/* BGM sound notice badge (clickable) */}
        <button
          onClick={toggleMute}
          style={{
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: isMuted ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${isMuted ? 'rgba(244, 63, 94, 0.5)' : 'rgba(16, 185, 129, 0.5)'}`,
            borderRadius: '100px',
            padding: '5px 14px',
            backdropFilter: 'blur(10px)',
            color: isMuted ? '#fda4af' : '#6ee7b7',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{isMuted ? 'BGM 켜기 (음소거 중)' : 'BGM 재생 중'}</span>
        </button>
      </div>

      {/* Center Play/Pause Indicator (brief flash or when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.85)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(244, 63, 94, 0.5)',
            zIndex: 12,
            transition: 'transform 0.15s ease',
          }}
          aria-label="재생"
        >
          <Play size={32} style={{ marginLeft: '4px' }} />
        </button>
      )}

      {/* Bottom Control Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(2, 3, 6, 0.95) 0%, rgba(2, 3, 6, 0.7) 60%, transparent 100%)',
          padding: '24px 20px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 10,
          opacity: showControls || !isPlaying ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Progress Bar (Range Input) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <input
            type="range"
            min={0}
            max={duration || 15}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              accentColor: '#f43f5e',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Control Buttons Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Left Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Restart */}
            <button
              onClick={handleRestart}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              title="처음부터 다시 재생"
            >
              <RotateCcw size={18} />
            </button>

            {/* Volume / Mute */}
            <button
              onClick={toggleMute}
              style={{
                background: 'transparent',
                border: 'none',
                color: isMuted ? '#fda4af' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              title={isMuted ? '소리 켜기' : '음소거'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Time Indicator */}
            <span
              style={{
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                marginLeft: '4px',
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                fontSize: '0.75rem',
                gap: '6px',
                transition: 'background 0.2s',
              }}
              title="전체화면"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{isFullscreen ? '창모드' : '전체화면'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
