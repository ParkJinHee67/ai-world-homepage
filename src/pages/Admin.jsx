import React, { useState, useEffect } from 'react';
import { db, mapPortfolioItem, mapNewsItem } from '../supabaseClient';
import { 
  Plus, Pen, Trash2, GripVertical, ShieldAlert, LogOut, Check, Terminal, FileText, Image as ImageIcon, Sparkles, AlertCircle, Copy, Link, Monitor, Database
} from 'lucide-react';

// Client side image compression using Canvas
const compressImage = (base64Str, maxWidth = 480) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Passcode login states
  const [emailInput, setEmailInput] = useState('jhpa670211@gmail.com');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard navigation
  const [currentTab, setCurrentTab] = useState('portfolio'); // 'portfolio' | 'news'
  const [portfolioFilter, setPortfolioFilter] = useState('All');
  
  // Modals state
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null);
  const [editingNewsItem, setEditingNewsItem] = useState(null);
  
  // Forms state
  const [portfolioForm, setPortfolioForm] = useState({
    title: '', description: '', category: 'App', appUrl: '', notionUrl: '', youtubeUrl: '', imageUrl: ''
  });
  const [newsForm, setNewsForm] = useState({
    title: '', description: '', content: '', sourceUrl: '', imageUrl: ''
  });
  
  // Interactive options in forms
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [urlStatus, setUrlStatus] = useState(false);
  
  // Copy API code feedback
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  // Migration states
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (!db.isMock && isLoggedIn) {
      const hasPortfolio = !!localStorage.getItem('mock_portfolio');
      const hasNews = !!localStorage.getItem('mock_news');
      setHasLocalData(hasPortfolio || hasNews);
    }
  }, [isLoggedIn, portfolioItems, newsItems]);

  const handleMigrateData = async () => {
    if (window.confirm("로컬 테스트 환경(LocalStorage)에서 생성한 데이터를 실제 Supabase 서버 데이터베이스로 일괄 전송하시겠습니까? 완료 후 로컬 캐시는 삭제됩니다.")) {
      setIsMigrating(true);
      try {
        const { data, error } = await db.migrateLocalDataToServer();
        if (error) {
          alert(`마이그레이션 실패: ${error}`);
        } else {
          alert(`성공적으로 데이터를 서버로 이전했습니다!\n- 프로그램: ${data.pMigrated}건\n- 뉴스: ${data.nMigrated}건`);
          setHasLocalData(false);
          loadDashboardData();
        }
      } catch (err) {
        alert(`오류가 발생했습니다: ${err.message || err}`);
      } finally {
        setIsMigrating(false);
      }
    }
  };
  
  // Setup authentication listener
  useEffect(() => {
    async function checkAuth() {
      const passcodeLoggedIn = localStorage.getItem('supabase_admin_logged_in') === 'true';
      if (passcodeLoggedIn) {
        const localEmail = localStorage.getItem('supabase_admin_email') || 'jhpa670211@gmail.com';
        setAdminUser({ email: localEmail });
        setIsLoggedIn(true);
        loadDashboardData();
        return;
      }

      const { data: { session } } = await db.getSession();
      handleAuthState(session);
    }
    checkAuth();

    const { data: { subscription } } = db.onAuthStateChange((event, session) => {
      const passcodeLoggedIn = localStorage.getItem('supabase_admin_logged_in') === 'true';
      if (passcodeLoggedIn) return;
      handleAuthState(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuthState = async (session) => {
    const user = session?.user ?? null;
    setAdminUser(user);
    if (user) {
      const authorized = await db.verifyAdmin(user.email);
      const isAuthorized = authorized === true || authorized?.data === true;
      if (isAuthorized) {
        setIsLoggedIn(true);
        loadDashboardData();
        return;
      }
    }
    setIsLoggedIn(false);
    setLoading(false);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const pRes = await db.getPortfolio();
      const nRes = await db.getNews();
      
      if (pRes.data) setPortfolioItems(pRes.data.map(mapPortfolioItem));
      if (nRes.data) setNewsItems(nRes.data.map(mapNewsItem));
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Login/Logout actions
  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    const correctPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'jhpa670211';
    if (passcodeInput === correctPasscode) {
      localStorage.setItem('supabase_admin_logged_in', 'true');
      localStorage.setItem('supabase_admin_email', emailInput);
      setAdminUser({ email: emailInput });
      setIsLoggedIn(true);
      loadDashboardData();
      setLoginError('');
    } else {
      setLoginError('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('supabase_admin_logged_in');
    localStorage.removeItem('supabase_admin_email');
    setIsLoggedIn(false);
    setAdminUser(null);
    await db.signOut();
  };

  // Drag and Drop Logic
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const items = [...portfolioItems];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setPortfolioItems(items);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    const { error } = await db.updatePortfolioOrder(portfolioItems);
    if (error) {
      alert(`순서 저장 실패: ${error.message}`);
    }
  };

  // Image Upload handler
  const handleImageFileChange = async (e, formType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result, 480);
      if (formType === 'portfolio') {
        setPortfolioForm(prev => ({ ...prev, imageUrl: compressed }));
      } else {
        setNewsForm(prev => ({ ...prev, imageUrl: compressed }));
      }
    };
    reader.readAsDataURL(file);
  };

  // URL link capture logic
  const handleUrlChange = (val, formType) => {
    if (formType === 'portfolio') {
      setPortfolioForm(prev => ({ ...prev, appUrl: val }));
    } else {
      setNewsForm(prev => ({ ...prev, sourceUrl: val }));
    }
    setUrlStatus(val && val.startsWith('http'));
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Capture screen mock / API integration helper
  const handleUrlCapture = async (formType) => {
    const targetUrl = formType === 'portfolio' ? portfolioForm.appUrl : newsForm.sourceUrl;
    if (!targetUrl || !targetUrl.startsWith('http')) {
      alert('유효한 사이트/기사 링크를 먼저 입력하세요.');
      return;
    }
    
    setIsCapturing(true);
    
    const ytId = extractYoutubeId(targetUrl);
    if (ytId) {
      // YouTube direct thumbnail extraction
      const ytThumb = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
      if (formType === 'portfolio') {
        setPortfolioForm(prev => ({ ...prev, imageUrl: ytThumb }));
      } else {
        setNewsForm(prev => ({ ...prev, imageUrl: ytThumb }));
      }
      setIsCapturing(false);
      setShowLivePreview(false);
      return;
    }

    // Website screen capture using Microlink or Thum.io
    let captureUrl = '';
    if (formType === 'portfolio') {
      captureUrl = `https://image.thum.io/get/width/480/crop/800/maxWait/5000/${targetUrl}?t=${Date.now()}`;
    } else {
      captureUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&embed=image.url`;
    }

    const testImg = new Image();
    testImg.onload = () => {
      if (formType === 'portfolio') {
        setPortfolioForm(prev => ({ ...prev, imageUrl: captureUrl }));
      } else {
        setNewsForm(prev => ({ ...prev, imageUrl: captureUrl }));
      }
      setIsCapturing(false);
      setShowLivePreview(false);
    };
    testImg.onerror = () => {
      // Fallback
      const fallback = formType === 'portfolio' 
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop';
      if (formType === 'portfolio') {
        setPortfolioForm(prev => ({ ...prev, imageUrl: fallback }));
      } else {
        setNewsForm(prev => ({ ...prev, imageUrl: fallback }));
      }
      setIsCapturing(false);
      setShowLivePreview(false);
    };
    testImg.src = captureUrl;
  };

  // PORTFOLIO CRUD ACTIONS
  const openPortfolioModal = (item = null) => {
    if (item) {
      setEditingPortfolioItem(item);
      setPortfolioForm({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.category,
        appUrl: item.appUrl || '',
        notionUrl: item.notionUrl || '',
        youtubeUrl: item.youtubeUrl || '',
        imageUrl: item.imageUrl || ''
      });
      setUrlStatus(!!item.appUrl);
    } else {
      setEditingPortfolioItem(null);
      setPortfolioForm({
        title: '', description: '', category: 'App', appUrl: '', notionUrl: '', youtubeUrl: '', imageUrl: ''
      });
      setUrlStatus(false);
    }
    setShowLivePreview(false);
    setShowPortfolioModal(true);
  };

  const handlePortfolioSave = async (e) => {
    e.preventDefault();
    if (!portfolioForm.title || !portfolioForm.category) {
      alert('제목과 카테고리는 필수 기입 사항입니다.');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await db.savePortfolioItem(portfolioForm);
      if (error) throw error;
      setShowPortfolioModal(false);
      loadDashboardData();
    } catch (e) {
      alert(`저장 오류: ${e.message}`);
      setLoading(false);
    }
  };

  const handlePortfolioDelete = async (id) => {
    if (!confirm('정말로 해당 포트폴리오를 삭제하시겠습니까?')) return;
    setLoading(true);
    try {
      const { error } = await db.deletePortfolioItem(id);
      if (error) throw error;
      loadDashboardData();
    } catch (e) {
      alert(`삭제 오류: ${e.message}`);
      setLoading(false);
    }
  };

  // NEWS CRUD ACTIONS
  const openNewsModal = (item = null) => {
    if (item) {
      setEditingNewsItem(item);
      setNewsForm({
        id: item.id,
        title: item.title,
        description: item.description || '',
        content: item.content || '',
        sourceUrl: item.sourceUrl || '',
        imageUrl: item.imageUrl || ''
      });
      setUrlStatus(!!item.sourceUrl);
    } else {
      setEditingNewsItem(null);
      setNewsForm({
        title: '', description: '', content: '', sourceUrl: '', imageUrl: ''
      });
      setUrlStatus(false);
    }
    setShowLivePreview(false);
    setShowNewsModal(true);
  };

  const handleNewsSave = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.description || !newsForm.content) {
      alert('제목, 코멘트, 마크다운 본문은 필수 기입 사항입니다.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await db.saveNewsItem(newsForm);
      if (error) throw error;
      setShowNewsModal(false);
      loadDashboardData();
    } catch (e) {
      alert(`저장 오류: ${e.message}`);
      setLoading(false);
    }
  };

  const handleNewsDelete = async (id) => {
    if (!confirm('정말로 해당 뉴스를 삭제하시겠습니까?')) return;
    setLoading(true);
    try {
      const { error } = await db.deleteNewsItem(id);
      if (error) throw error;
      loadDashboardData();
    } catch (e) {
      alert(`삭제 오류: ${e.message}`);
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    const code = `import requests
import re
from urllib.parse import quote

def register_ai_news(title, summary_points, article_url):
    # 홈페이지 주소 및 service_role 키를 설정하세요
    SUPABASE_URL = "https://your-project-id.supabase.co"
    API_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"
    
    url = f"{SUPABASE_URL}/rest/v1/ai_news"
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    # 썸네일 자동 캡처 및 유튜브 매칭
    yt_match = re.search(r'(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/|embed\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})', article_url)
    if yt_match:
        capture_url = f"https://img.youtube.com/vi/{yt_match.group(1)}/mqdefault.jpg"
    else:
        capture_url = f"https://api.microlink.io?url={quote(article_url)}&embed=image.url"
        
    payload = {
        "title": title,
        "description": summary_points[:150] + "...", # 리스트 출력용 3줄 코멘트
        "content": summary_points,                  # 상세 팝업용 전체 마크다운 본문
        "image_url": capture_url,
        "source_url": article_url
    }
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 201:
        print("AI 뉴스 자동 등록 성공!")`;

    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const filteredPortfolio = currentTab === 'portfolio'
    ? (portfolioFilter === 'All' 
        ? portfolioItems 
        : portfolioItems.filter(x => x.category === portfolioFilter))
    : [];

  return (
    <div style={styles.container}>
      <section className="container-max" style={styles.contentSection}>
        {/* Login Gate */}
        {!isLoggedIn ? (
          <div style={styles.loginGate}>
            <div style={styles.loginCard} className="glass-panel">
              <div style={styles.lockIconContainer}>
                <ShieldAlert size={32} color="var(--accent-indigo)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>관리자 포털 로그인</h2>
              <p style={styles.loginDesc}>
                포털 관리를 위해 권한이 있는 계정으로 로그인해 주세요.
              </p>
              
              {!db.isMock ? (
                <div style={styles.supabaseIndicator}>
                  <Database size={14} color="var(--accent-indigo)" />
                  <span>실시간 Supabase DB 연결됨</span>
                </div>
              ) : (
                <div style={styles.mockDisclaimer}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>로컬 테스트 모드 작동 중</strong><br />
                    구글 API 설정이 발견되지 않았습니다. 암호를 사용하여 로그인해 주세요.
                  </span>
                </div>
              )}

              {/* Passcode Login Form */}
              <form onSubmit={handlePasscodeSubmit} style={styles.loginForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>이메일</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    style={styles.loginInput}
                    className="input-field"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>관리자 비밀번호</label>
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    required
                    style={styles.loginInput}
                    className="input-field"
                  />
                </div>
                {loginError && (
                  <p style={styles.loginErrorText}>{loginError}</p>
                )}
                <button type="submit" style={styles.loginSubmitBtn}>
                  로그인
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Admin Dashboard Dashboard */
          <div>
            {/* Top Bar Dashboard */}
            <div style={styles.dashboardHeader}>
              <div>
                <div style={styles.adminTitleRow}>
                  <h1 style={styles.adminTitle}>관리자 포털</h1>
                  <span style={styles.adminBadge}>Admin Control Center</span>
                </div>
                <p style={styles.accountText}>
                  로그인 이메일: <strong style={{ color: 'var(--accent-indigo)' }}>{adminUser?.email}</strong>
                </p>
              </div>

              <div style={styles.headerActions}>
                {/* Tab Switcher */}
                <div style={styles.tabBtnsContainer}>
                  <button 
                    onClick={() => setCurrentTab('portfolio')}
                    style={{
                      ...styles.tabBtn,
                      ...(currentTab === 'portfolio' ? styles.tabBtnActivePortfolio : {})
                    }}
                  >
                    포털 앱/서비스 관리
                  </button>
                  <button 
                    onClick={() => setCurrentTab('news')}
                    style={{
                      ...styles.tabBtn,
                      ...(currentTab === 'news' ? styles.tabBtnActiveNews : {})
                    }}
                  >
                    AI 뉴스 관리
                  </button>
                </div>

                <button onClick={handleLogout} style={styles.logoutBtn}>
                  <LogOut size={16} />
                  <span>로그아웃</span>
                </button>

                {currentTab === 'portfolio' ? (
                  <button onClick={() => openPortfolioModal()} style={styles.createBtn}>
                    <Plus size={16} />
                    <span>새 포트폴리오 등록</span>
                  </button>
                ) : (
                  <button onClick={() => openNewsModal()} style={styles.createBtnNews}>
                    <Plus size={16} />
                    <span>새 AI 뉴스 등록</span>
                  </button>
                )}
              </div>
            </div>

            {/* Migration Callout */}
            {hasLocalData && !db.isMock && (
              <div style={styles.migrationBanner} className="glass-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Database size={20} color="var(--accent-indigo)" />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px', color: 'var(--text-primary)' }}>
                      로컬 테스트 데이터 이전 알림
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      브라우저 로컬 저장소에 기입하신 테스트 데이터가 감지되었습니다. 이 데이터를 실제 Supabase 서버 DB로 마이그레이션할 수 있습니다.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleMigrateData} 
                  disabled={isMigrating}
                  style={styles.migrateBtn}
                >
                  {isMigrating ? '서버로 데이터 전송 중...' : '실시간 DB로 일괄 업로드하기'}
                </button>
              </div>
            )}

            {/* Dashboard Content */}
            {loading ? (
              <div style={styles.loaderContainer}>
                <div className="spinner" />
              </div>
            ) : (
              <div>
                {/* Tab 1: Portfolio Items Dashboard */}
                {currentTab === 'portfolio' && (
                  <div>
                    <div style={styles.subHeader}>
                        {['All', 'AI Recommend', 'App', 'Insight'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setPortfolioFilter(cat)}
                            style={{
                              ...styles.filterBtn,
                              ...(portfolioFilter === cat ? styles.filterBtnActive : {})
                            }}
                          >
                            {cat === 'All' ? '전체보기' : (cat === 'AI Recommend' ? '영상제작' : (cat === 'App' ? '홈페이지' : '인사이트'))}
                          </button>
                        ))}

                      {portfolioFilter === 'All' ? (
                        <span style={styles.infoSpan}>
                          💡 순서 변경은 목록 좌측의 손잡이(<GripVertical size={12} style={{ display: 'inline', margin: '0 2px' }} />)를 드래그하여 순서를 끌어놓으시면 동기화됩니다.
                        </span>
                      ) : (
                        <span style={{ ...styles.infoSpan, color: 'var(--accent-amber)' }}>
                          ⚠️ 순서 변경(DND)은 '전체보기' 모드에서만 작동합니다.
                        </span>
                      )}
                    </div>

                    {/* Portfolio Items Table */}
                    <div style={styles.tableWrapper} className="glass-panel">
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.trHead}>
                            <th style={{ ...styles.th, width: '70px' }}>순서</th>
                            <th style={styles.th}>제목 / 대표 썸네일</th>
                            <th style={styles.th}>카테고리</th>
                            <th style={styles.th}>등록일</th>
                            <th style={{ ...styles.th, textAlign: 'center', width: '120px' }}>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPortfolio.map((item, idx) => (
                            <tr
                              key={item.id}
                              draggable={portfolioFilter === 'All'}
                              onDragStart={(e) => handleDragStart(e, idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDragEnd={handleDragEnd}
                              style={{
                                ...styles.trBody,
                                ...(draggedIndex === idx ? styles.trBodyDragging : {})
                              }}
                              className="admin-table-row"
                            >
                              <td style={styles.td}>
                                {portfolioFilter === 'All' ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'grab' }}>
                                    <GripVertical size={16} color="var(--text-muted)" />
                                    <span>{idx + 1}</span>
                                  </div>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                              <td style={styles.td}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img 
                                    src={item.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'} 
                                    alt={item.title} 
                                    style={styles.tableThumbnail}
                                  />
                                  <span style={{ fontWeight: 600 }}>{item.title}</span>
                                </div>
                              </td>
                              <td style={styles.td}>
                                <span className={`badge ${item.category === 'App' ? 'app' : (item.category === 'Insight' ? 'insight' : 'recommend')}`}>
                                  {item.category === 'App' ? '홈페이지' : (item.category === 'Insight' ? '인사이트' : '영상제작')}
                                </span>
                              </td>
                              <td style={styles.td}>{item.createdAt}</td>
                              <td style={{ ...styles.td, textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                  <button onClick={() => openPortfolioModal(item)} style={styles.iconEditBtn} title="수정">
                                    <Pen size={14} />
                                  </button>
                                  <button onClick={() => handlePortfolioDelete(item.id)} style={styles.iconDeleteBtn} title="삭제">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredPortfolio.length === 0 && (
                            <tr>
                              <td colSpan={5} style={styles.tdEmpty}>등록된 포트폴리오 아이템이 없습니다.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 2: AI News Dashboard */}
                {currentTab === 'news' && (
                  <div>
                    {/* News Table */}
                    <div style={{ ...styles.tableWrapper, marginTop: '20px' }} className="glass-panel">
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.trHead}>
                            <th style={{ ...styles.th, width: '120px' }}>등록일</th>
                            <th style={styles.th}>뉴스 기사 제목 / 대표 이미지</th>
                            <th style={styles.th}>대표 출처</th>
                            <th style={{ ...styles.th, textAlign: 'center', width: '120px' }}>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newsItems.map((item) => (
                            <tr key={item.id} style={styles.trBody} className="admin-table-row">
                              <td style={styles.td}>{item.createdAt}</td>
                              <td style={styles.td}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img
                                    src={item.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop'}
                                    alt={item.title}
                                    style={styles.tableThumbnail}
                                  />
                                  <span style={{ fontWeight: 600 }}>{item.title}</span>
                                </div>
                              </td>
                              <td style={styles.td}>
                                {item.sourceUrl ? (
                                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={styles.tableLink}>
                                    {item.sourceUrl}
                                  </a>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                              <td style={{ ...styles.td, textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                  <button onClick={() => openNewsModal(item)} style={styles.iconEditBtnNews} title="수정">
                                    <Pen size={14} />
                                  </button>
                                  <button onClick={() => handleNewsDelete(item.id)} style={styles.iconDeleteBtn} title="삭제">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {newsItems.length === 0 && (
                            <tr>
                              <td colSpan={4} style={styles.tdEmpty}>등록된 AI 뉴스가 없습니다. 에이전트를 연결하거나 새 뉴스를 추가하세요.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Agent API Guide section */}
                    <div style={styles.guideContainer} className="glass-panel">
                      <div style={styles.guideHeader}>
                        <Terminal size={18} color="var(--accent-rose)" />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI 트렌드 에이전트 연동 API 안내</h3>
                      </div>
                      <p style={styles.guideDesc}>
                        뉴스 자동 수집 스크립트(Hermes Agent 등)에서 아래 파이썬 코드를 추가하면 수집한 정보를 자동으로 기사 제목, 요약 3줄, 마크다운 형식 리포트로 변환하여 홈페이지 데이터베이스에 즉시 주입합니다.
                      </p>
                      
                      <div style={styles.codeBlockContainer}>
                        <button onClick={handleCopyCode} style={styles.copyBtn}>
                          {copiedCode ? (
                            <>
                              <Check size={14} color="#6ee7b7" />
                              <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>복사 완료</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span style={{ fontSize: '0.75rem' }}>코드 복사</span>
                            </>
                          )}
                        </button>
                        <pre style={styles.codePre}>
{`import requests
import re
from urllib.parse import quote

def register_ai_news(title, summary_points, article_url):
    SUPABASE_URL = "${window.location.origin}" # 실제 Supabase API 주소로 변경
    API_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"
    
    url = f"{SUPABASE_URL}/rest/v1/ai_news"
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    # 썸네일 캡처
    yt_match = re.search(r'(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/|embed\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})', article_url)
    if yt_match:
        capture_url = f"https://img.youtube.com/vi/{yt_match.group(1)}/mqdefault.jpg"
    else:
        capture_url = f"https://api.microlink.io?url={quote(article_url)}&embed=image.url"
        
    payload = {
        "title": title,
        "description": summary_points[:150] + "...",
        "content": summary_points,
        "image_url": capture_url,
        "source_url": article_url
    }
    
    requests.post(url, json=payload, headers=headers)`}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* PORTFOLIO EDIT MODAL */}
      {showPortfolioModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPortfolioModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingPortfolioItem ? '포트폴리오 아이템 수정' : '새 포트폴리오 등록'}
            </h2>
            
            <form onSubmit={handlePortfolioSave} style={styles.form}>
              <div style={styles.formGrid}>
                {/* Left fields */}
                <div style={styles.formGroupList}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>프로젝트/사이트 URL</label>
                    <input 
                      type="url" 
                      value={portfolioForm.appUrl} 
                      onChange={(e) => handleUrlChange(e.target.value, 'portfolio')} 
                      placeholder="https://example.com"
                      className="input-field"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>제목 <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                    <input 
                      type="text" 
                      value={portfolioForm.title} 
                      onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))} 
                      placeholder="AI 서비스 이름"
                      required
                      className="input-field"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>카테고리 <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                    <select 
                      value={portfolioForm.category} 
                      onChange={(e) => setPortfolioForm(prev => ({ ...prev, category: e.target.value }))}
                      style={styles.selectInput}
                      className="input-field"
                    >
                      <option value="AI Recommend">영상제작 (유튜브/쇼츠/홍보영상)</option>
                      <option value="App">홈페이지 (웹 어플리케이션/사이트)</option>
                      <option value="Insight">인사이트 (보고서/분석자료)</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>설명 코멘트</label>
                    <textarea 
                      value={portfolioForm.description} 
                      onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))} 
                      placeholder="서비스에 대한 한 줄 또는 두 줄 요약설명"
                      rows={3}
                      style={{ resize: 'none' }}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Right fields (Media & Uploads) */}
                <div style={styles.formGroupList}>
                  <div style={styles.formGroup}>
                    <div style={styles.thumbnailLabelRow}>
                      <label style={styles.label}>썸네일 미리보기 & 캡처</label>
                      {urlStatus && (
                        <button
                          type="button"
                          onClick={() => setShowLivePreview(!showLivePreview)}
                          style={{
                            ...styles.previewToggleBtn,
                            ...(showLivePreview ? styles.previewToggleBtnActive : {})
                          }}
                        >
                          {showLivePreview ? '미리보기 닫기' : '실시간 웹 보기'}
                        </button>
                      )}
                    </div>

                    <div style={styles.formThumbnailBox}>
                      {isCapturing && (
                        <div style={styles.capturingOverlay}>
                          <div className="spinner" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-indigo)', marginTop: '8px' }}>
                            실시간 화면 캡처 중...
                          </span>
                        </div>
                      )}
                      
                      {showLivePreview && portfolioForm.appUrl ? (
                        <iframe 
                          src={portfolioForm.appUrl} 
                          title="Live preview" 
                          style={styles.iframePreview}
                          sandbox="allow-scripts allow-same-origin"
                        />
                      ) : portfolioForm.imageUrl ? (
                        <img src={portfolioForm.imageUrl} alt="Thumbnail preview" style={styles.thumbPreviewImg} />
                      ) : (
                        <div style={styles.emptyThumbBox}>
                          <ImageIcon size={28} color="var(--text-muted)" style={{ marginBottom: '6px' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>대표 이미지가 없습니다</span>
                        </div>
                      )}
                    </div>

                    {showLivePreview && portfolioForm.appUrl && (
                      <button
                        type="button"
                        onClick={() => handleUrlCapture('portfolio')}
                        style={styles.captureBtn}
                      >
                        <Monitor size={12} style={{ marginRight: '6px' }} />
                        현재 화면 실시간 캡처 및 등록
                      </button>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>또는 직접 파일 업로드</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, 'portfolio')} 
                      style={styles.fileInput}
                    />
                  </div>

                  <div style={styles.linksRow}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...styles.label, fontSize: '0.75rem' }}>Notion 가이드 링크</label>
                      <input 
                        type="url" 
                        value={portfolioForm.notionUrl} 
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, notionUrl: e.target.value }))} 
                        placeholder="https://notion.so/..."
                        style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                        className="input-field"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...styles.label, fontSize: '0.75rem' }}>유튜브 영상 가이드 (쉼표 구분)</label>
                      <input 
                        type="text" 
                        value={portfolioForm.youtubeUrl} 
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, youtubeUrl: e.target.value }))} 
                        placeholder="https://youtube.com/watch?..."
                        style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowPortfolioModal(false)} style={styles.cancelBtn}>
                  취소
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {editingPortfolioItem ? '수정 사항 저장' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEWS EDIT MODAL */}
      {showNewsModal && (
        <div style={styles.modalOverlay} onClick={() => setShowNewsModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingNewsItem ? 'AI 뉴스 리포트 수정' : '새 AI 뉴스 등록'}
            </h2>
            
            <form onSubmit={handleNewsSave} style={styles.form}>
              <div style={styles.formGrid}>
                {/* Left columns */}
                <div style={{ ...styles.formGroupList, flex: 1.2 }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>대표 출처 기사/영상 링크 (URL)</label>
                    <input 
                      type="url" 
                      value={newsForm.sourceUrl} 
                      onChange={(e) => handleUrlChange(e.target.value, 'news')} 
                      placeholder="https://example.com/article"
                      className="input-field"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>뉴스 제목 (후킹 헤드라인) <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                    <input 
                      type="text" 
                      value={newsForm.title} 
                      onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))} 
                      placeholder="자극적이고 유입을 노릴 수 있는 제목"
                      required
                      className="input-field"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>카드 노출용 요약 (3줄 이내) <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                    <textarea 
                      value={newsForm.description} 
                      onChange={(e) => setNewsForm(prev => ({ ...prev, description: e.target.value }))} 
                      placeholder="썸네일 카드 리스트 아래에 노출될 3줄 가량의 핵심 요약 설명"
                      rows={3}
                      required
                      style={{ resize: 'none' }}
                      className="input-field"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>팝업 상세보기 본문 (마크다운 지원) <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                    <textarea 
                      value={newsForm.content} 
                      onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))} 
                      placeholder="📌[1]~[3] 형식을 사용하여 마크다운으로 본문 내용을 상세히 입력하세요"
                      rows={8}
                      required
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Right column */}
                <div style={{ ...styles.formGroupList, flex: 0.8 }}>
                  <div style={styles.formGroup}>
                    <div style={styles.thumbnailLabelRow}>
                      <label style={styles.label}>썸네일 이미지 & 캡처</label>
                      {urlStatus && (
                        <button
                          type="button"
                          onClick={() => setShowLivePreview(!showLivePreview)}
                          style={{
                            ...styles.previewToggleBtn,
                            ...(showLivePreview ? styles.previewToggleBtnActive : {})
                          }}
                        >
                          {showLivePreview ? '미리보기 닫기' : '실시간 웹 보기'}
                        </button>
                      )}
                    </div>

                    <div style={styles.formThumbnailBox}>
                      {isCapturing && (
                        <div style={styles.capturingOverlay}>
                          <div className="spinner" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-rose)', marginTop: '8px' }}>
                            실시간 화면 캡처 중...
                          </span>
                        </div>
                      )}
                      
                      {showLivePreview && newsForm.sourceUrl ? (
                        <iframe 
                          src={newsForm.sourceUrl} 
                          title="Live news preview" 
                          style={styles.iframePreview}
                          sandbox="allow-scripts allow-same-origin"
                        />
                      ) : newsForm.imageUrl ? (
                        <img src={newsForm.imageUrl} alt="News thumbnail preview" style={styles.thumbPreviewImg} />
                      ) : (
                        <div style={styles.emptyThumbBox}>
                          <ImageIcon size={28} color="var(--text-muted)" style={{ marginBottom: '6px' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>대표 이미지가 없습니다</span>
                        </div>
                      )}
                    </div>

                    {showLivePreview && newsForm.sourceUrl && (
                      <button
                        type="button"
                        onClick={() => handleUrlCapture('news')}
                        style={styles.captureBtnNews}
                      >
                        <Monitor size={12} style={{ marginRight: '6px' }} />
                        현재 화면 실시간 캡처 및 등록
                      </button>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>또는 직접 파일 업로드</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, 'news')} 
                      style={styles.fileInput}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowNewsModal(false)} style={styles.cancelBtn}>
                  취소
                </button>
                <button type="submit" style={styles.saveBtnNews}>
                  {editingNewsItem ? '수정 사항 저장' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    paddingBottom: '80px',
  },
  contentSection: {
    padding: '40px 0',
  },
  loginGate: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px 32px',
    textAlign: 'center',
    background: 'rgba(12, 10, 24, 0.6)',
  },
  lockIconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto',
  },
  loginDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '24px',
  },
  migrationBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '16px',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.18)',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '10px',
    textAlign: 'left'
  },
  migrateBtn: {
    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  },
  mockDisclaimer: {
    display: 'flex',
    gap: '12px',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    borderRadius: '12px',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '0.78rem',
    lineHeight: 1.5,
    color: '#fef08a',
    marginBottom: '24px',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  loginInput: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'var(--transition-fast)',
  },
  loginSubmitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    marginTop: '8px',
  },
  loginErrorText: {
    color: 'var(--accent-rose)',
    fontSize: '0.8rem',
    textAlign: 'left',
    marginTop: '4px',
  },
  supabaseIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'rgba(99, 102, 241, 0.06)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '0.82rem',
    color: '#a5b4fc',
    marginBottom: '20px',
    textAlign: 'left',
  },
  // Dashboard Logged In styles
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '24px',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '24px',
  },
  adminTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '6px',
  },
  adminTitle: {
    fontSize: '1.8rem',
    fontWeight: 800,
  },
  adminBadge: {
    fontSize: '0.65rem',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    padding: '3px 10px',
    borderRadius: '100px',
    fontFamily: 'monospace',
    fontWeight: 700,
  },
  accountText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tabBtnsContainer: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '4px',
    borderRadius: '10px',
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  tabBtnActivePortfolio: {
    background: 'var(--accent-indigo)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
  },
  tabBtnActiveNews: {
    background: 'var(--accent-rose)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(244, 63, 94, 0.15)',
  },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--accent-indigo)',
    color: 'white',
    border: 'none',
    padding: '9px 16px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
  createBtnNews: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--accent-rose)',
    color: 'white',
    border: 'none',
    padding: '9px 16px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)',
  },
  subHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  filterBtns: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '4px',
    borderRadius: '100px',
    gap: '4px',
  },
  filterBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  filterBtnActive: {
    background: 'rgba(255, 255, 255, 0.07)',
    color: 'var(--text-primary)',
  },
  infoSpan: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '6px 14px',
    borderRadius: '8px',
  },
  // Table styles
  tableWrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  th: {
    padding: '16px 24px',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  trBody: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.2s ease',
  },
  trBodyDragging: {
    opacity: 0.3,
    background: 'rgba(99, 102, 241, 0.1)',
  },
  td: {
    padding: '14px 24px',
    color: '#e2e8f0',
    fontSize: '0.85rem',
  },
  tdEmpty: {
    padding: '60px 0',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  tableThumbnail: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  tableLink: {
    color: 'var(--accent-rose)',
    fontSize: '0.78rem',
    textDecoration: 'underline',
    display: 'inline-block',
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  iconEditBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  iconEditBtnNews: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  iconDeleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  // Guide Container
  guideContainer: {
    marginTop: '32px',
    padding: '24px',
    background: 'rgba(3, 2, 7, 0.6)',
  },
  guideHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    color: 'var(--accent-rose)',
  },
  guideDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '20px',
  },
  codeBlockContainer: {
    position: 'relative',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  copyBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    borderRadius: '6px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  codePre: {
    fontFamily: 'monospace',
    fontSize: '0.78rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
    margin: 0,
    whiteSpace: 'pre',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
  },
  // Modals Styling
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(2, 1, 5, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modalContent: {
    background: '#0d0b16',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '720px',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.7)',
    overflow: 'hidden',
    padding: '24px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '4px',
  },
  formGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  formGroupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
    minWidth: '280px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  selectInput: {
    cursor: 'pointer',
    appearance: 'none',
  },
  thumbnailLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },
  previewToggleBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  previewToggleBtnActive: {
    background: 'rgba(99, 102, 241, 0.12)',
    color: '#a5b4fc',
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  formThumbnailBox: {
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: '12px',
    background: '#030206',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturingOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(13, 11, 22, 0.95)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iframePreview: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: '#ffffff',
  },
  thumbPreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  emptyThumbBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    marginTop: '8px',
    backgroundColor: 'var(--accent-indigo)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)',
  },
  captureBtnNews: {
    marginTop: '8px',
    backgroundColor: 'var(--accent-rose)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(244, 63, 94, 0.15)',
  },
  fileInput: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
  },
  linksRow: {
    display: 'flex',
    gap: '12px',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  cancelBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    background: 'var(--accent-indigo)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
  saveBtnNews: {
    background: 'var(--accent-rose)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)',
  }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    button[style*="loginSubmitBtn"]:hover {
      opacity: 0.9 !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35) !important;
    }
    input[style*="loginInput"]:focus {
      border-color: var(--accent-indigo) !important;
      background: rgba(255, 255, 255, 0.05) !important;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
    }
    .admin-table-row:hover {
      background-color: rgba(255, 255, 255, 0.02);
    }
    button[style*="iconEditBtn"]:hover {
      color: var(--accent-indigo) !important;
      background: rgba(99, 102, 241, 0.1) !important;
    }
    button[style*="iconEditBtnNews"]:hover {
      color: var(--accent-rose) !important;
      background: rgba(244, 63, 94, 0.1) !important;
    }
    button[style*="iconDeleteBtn"]:hover {
      color: var(--accent-rose) !important;
      background: rgba(244, 63, 94, 0.1) !important;
    }
    button[style*="copyBtn"]:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      color: white !important;
    }
    .admin-table-row td a {
      transition: color 0.2s ease;
    }
    .admin-table-row td a:hover {
      color: #fda4af !important;
    }
    @media (max-width: 768px) {
      div[style*="dashboardHeader"] {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      div[style*="headerActions"] {
        width: 100% !important;
        justify-content: space-between !important;
      }
      th[style*="th"], td[style*="td"] {
        padding: 12px 14px !important;
      }
      div[style*="subHeader"] {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      span[style*="infoSpan"] {
        width: 100% !important;
      }
      div[style*="modalContent"] {
        padding: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
}
