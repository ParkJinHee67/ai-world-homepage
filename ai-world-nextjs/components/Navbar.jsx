"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Newspaper, Video, Layout, Lightbulb, ShieldAlert, Menu, X, Cog, Download } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { path: '/', label: '홈', icon: Terminal },
    { path: '/ai-news', label: 'AI 뉴스', icon: Newspaper },
    { path: '/ai-recommend', label: '영상제작', icon: Video },
    { path: '/download', label: '주인공 이미지', icon: Download },
    { path: '/homepage', label: '홈페이지', icon: Layout },
    { path: '/insights', label: '인사이트', icon: Lightbulb },
    { path: '/admin', label: '관리자', icon: ShieldAlert },
  ];

  return (
    <nav style={styles.navContainer}>
      <div className="container-max" style={styles.navInner}>
        {/* Logo */}
        <Link href="/" style={styles.logo}>
          <Cog className="gear-logo" size={20} style={{ color: 'var(--accent-indigo)', filter: 'drop-shadow(0 0 5px var(--accent-indigo))' }} />
          <span style={styles.logoText}>톱니바꿈 <span style={{color: 'var(--accent-indigo)'}}>AI월드</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-desktop-links" style={styles.desktopLinks}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <button onClick={toggleMenu} className="nav-hamburger" style={styles.hamburger}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div style={styles.mobileDrawer}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={styles.mobileNavLink}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

const styles = {
  navContainer: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'rgba(3, 2, 7, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  navInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
  },
  logoText: {
    letterSpacing: '-0.03em',
  },
  desktopLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  hamburger: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
  },
  mobileDrawer: {
    position: 'absolute',
    top: '70px',
    left: 0,
    width: '100%',
    background: 'rgba(6, 5, 14, 0.95)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 24px',
    gap: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    width: '100%',
  },
};
