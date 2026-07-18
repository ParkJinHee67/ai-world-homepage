"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db, mapPortfolioItem, mapNewsItem, formatKSTDate } from '../supabaseClient';
import { 
  Plus, Pen, Trash2, GripVertical, ShieldAlert, LogOut, Check, Terminal, FileText, Image as ImageIcon, Sparkles, AlertCircle, Copy, Link, Monitor, Database, Loader2
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
  const [leads, setLeads] = useState([]);
  const [resources, setResources] = useState([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', fileName: '', fileContent: '', resolution: '', fileSize: '' });
  const [resourceFile, setResourceFile] = useState(null);
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Passcode login states
  const [emailInput, setEmailInput] = useState('');
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
  const [editingResourceItem, setEditingResourceItem] = useState(null);
  
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

  // Re-authentication states (data loss prevention)
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthCallback, setReauthCallback] = useState(null);
  const [reauthEmailInput, setReauthEmailInput] = useState('');
  const [reauthPasswordInput, setReauthPasswordInput] = useState('');
  const [reauthError, setReauthError] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  
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
  const handleAuthStateRef = useRef(null);

  useEffect(() => {
    handleAuthStateRef.current = handleAuthState;
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await db.getSession();
      handleAuthState(session);
    }
    checkAuth();

    const { data: { subscription } } = db.onAuthStateChange((event, session) => {
      if (handleAuthStateRef.current) {
        handleAuthStateRef.current(session);
      }
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
    
    // Instead of immediately kicking the user out of the dashboard (which unmounts everything and clears state),
    // check if a modal is open. If so, trigger the reauth modal.
    const isEditing = showPortfolioModal || showNewsModal || showResourceModal;
    if (isEditing) {
      setReauthEmailInput(adminUser?.email || emailInput || '');
      setReauthPasswordInput('');
      setReauthError('');
      setShowReauthModal(true);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const pRes = await db.getPortfolio();
      if (pRes.error) {
        console.error('Portfolio load error:', pRes.error);
        alert(`포트폴리오 로딩 실패: ${pRes.error.message || JSON.stringify(pRes.error)}`);
      }
      if (pRes.data) setPortfolioItems(pRes.data.map(mapPortfolioItem));

      const nRes = await db.getNews();
      if (nRes.error) {
        console.error('News load error:', nRes.error);
        alert(`뉴스 로딩 실패: ${nRes.error.message || JSON.stringify(nRes.error)}`);
      }
      if (nRes.data) setNewsItems(nRes.data.map(mapNewsItem));

      const lRes = await db.getLeads();
      if (lRes.error) {
        console.error('Leads load error:', lRes.error);
        alert(`리드 데이터 로딩 실패: ${lRes.error.message || JSON.stringify(lRes.error)}`);
      }
      if (lRes.data) setLeads(lRes.data);

      const rRes = await db.getResources();
      if (rRes.error) {
        console.error('Resources load error:', rRes.error);
        alert(`주인공 이미지 리소스 로딩 실패: ${rRes.error.message || JSON.stringify(rRes.error)}`);
      }
      if (rRes.data) setResources(rRes.data);
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e);
      alert(`대시보드 데이터 로딩 중 예외 발생: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const exportLeadsToCSV = () => {
    if (leads.length === 0) {
      alert("내보낼 마케팅 리드 데이터가 없습니다.");
      return;
    }
    
    let csvContent = "\uFEFF";
    csvContent += "신청 일시,이름/닉네임,이메일 주소,요청 리소스\n";
    
    leads.forEach(lead => {
      const date = new Date(lead.created_at || lead.createdAt).toLocaleString('ko-KR').replace(/,/g, '');
      const name = (lead.name || '').replace(/,/g, '');
      const email = (lead.email || '').replace(/,/g, '');
      const requested = (lead.requested_image || lead.requestedImage || '').replace(/,/g, '');
      csvContent += `${date},${name},${email},${requested}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `톱니바꿈월드_마케팅_리드_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openResourceModal = () => {
    setEditingResourceItem(null);
    setResourceFile(null);
    setResourceForm({ title: '', description: '', fileName: '', fileContent: '', resolution: '', fileSize: '' });
    setShowResourceModal(true);
  };

  const openEditResourceModal = async (resource) => {
    setEditingResourceItem(resource);
    setResourceFile(null);
    setResourceForm({
      id: resource.id,
      title: resource.title || '',
      description: resource.description || '',
      fileName: resource.file_name || resource.fileName || '',
      fileContent: resource.file_content || resource.fileContent || '',
      resolution: resource.resolution || '',
      fileSize: resource.file_size || resource.fileSize || ''
    });
    setShowResourceModal(true);

    if (!resource.file_content && !resource.fileContent) {
      try {
        const { data } = await db.getResourceContent(resource.id);
        if (data) {
          setResourceForm(prev => {
            if (prev.id === resource.id) {
              return { ...prev, fileContent: data };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to load resource image content for edit:', err);
      }
    }
  };

  const checkSessionOrReauth = async (callback) => {
    const isActive = await db.checkSessionActive();
    if (!isActive) {
      setReauthEmailInput(adminUser?.email || emailInput || '');
      setReauthPasswordInput('');
      setReauthError('');
      setReauthCallback(() => callback);
      setShowReauthModal(true);
      return false;
    }
    return true;
  };

  const handleResourceDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleResourceDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const items = [...resources];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setResources(items);
  };

  const handleResourceDragEnd = async () => {
    setDraggedIndex(null);
    const runOrderUpdate = async () => {
      const { error } = await db.updateResourcesOrder(resources);
      if (error) {
        alert(`순서 저장 실패: ${error.message}`);
      }
    };
    const isLogged = await checkSessionOrReauth(runOrderUpdate);
    if (!isLogged) return;
    await runOrderUpdate();
  };

  const handleResourceFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResourceFile(file);

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      const img = new Image();
      img.src = fileContent;
      img.onload = () => {
        setResourceForm(prev => ({
          ...prev,
          fileName: file.name,
          fileContent: fileContent,
          fileSize: sizeStr,
          resolution: `${img.width} x ${img.height}`
        }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleResourceSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingResourceItem && !resourceFile && !resourceForm.fileContent) {
      alert("이미지 파일을 선택해 주세요.");
      return;
    }

    const runSave = async () => {
      setIsUploadingResource(true);
      try {
        let finalForm = { ...resourceForm };
        
        // If a new file is selected, upload it to storage first
        if (resourceFile) {
          const { data: publicUrl, error: uploadError } = await db.uploadResourceFile(resourceFile);
          if (uploadError) throw uploadError;
          finalForm.fileContent = publicUrl;
        }
        
        const { error } = await db.saveResource(finalForm);
        if (error) throw error;
        alert(editingResourceItem ? "리소스가 성공적으로 수정되었습니다!" : "리소스가 성공적으로 등록되었습니다!");
        setShowResourceModal(false);
        setEditingResourceItem(null);
        setResourceFile(null);
        loadDashboardData();
      } catch (err) {
        console.error('Failed to save resource:', err);
        alert(`저장 실패: ${err.message || err}`);
      } finally {
        setIsUploadingResource(false);
      }
    };

    const isLogged = await checkSessionOrReauth(runSave);
    if (!isLogged) return;
    await runSave();
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm("정말로 이 이미지 리소스를 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.")) {
      try {
        const { error } = await db.deleteResource(id);
        if (error) throw error;
        alert("삭제 완료되었습니다.");
        loadDashboardData();
      } catch (err) {
        console.error('Failed to delete resource:', err);
        alert(`삭제 실패: ${err.message || err}`);
      }
    }
  };

  // Login/Logout actions
  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const { data, error } = await db.signInWithEmail(emailInput, passcodeInput);
      if (error) {
        setLoginError(error.message || '로그인에 실패했습니다.');
        setIsLoggedIn(false);
      } else {
        setLoginError('');
        if (db.isMock) {
          setAdminUser({ email: emailInput });
          setIsLoggedIn(true);
          loadDashboardData();
        } else {
          // Explicitly process the session returned from Supabase sign in immediately
          if (data?.session) {
            await handleAuthState(data.session);
          } else {
            const { data: sessionData } = await db.getSession();
            if (sessionData?.session) {
              await handleAuthState(sessionData.session);
            } else {
              setLoginError('로그인 세션을 획득하지 못했습니다. 다시 시도해 주세요.');
              setIsLoggedIn(false);
            }
          }
        }
      }
    } catch (err) {
      setLoginError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
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
    const runOrderUpdate = async () => {
      const { error } = await db.updatePortfolioOrder(portfolioItems);
      if (error) {
        alert(`순서 저장 실패: ${error.message}`);
      }
    };
    const isLogged = await checkSessionOrReauth(runOrderUpdate);
    if (!isLogged) return;
    await runOrderUpdate();
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
    if (e && e.preventDefault) e.preventDefault();
    if (!portfolioForm.title || !portfolioForm.category) {
      alert('제목과 카테고리는 필수 기입 사항입니다.');
      return;
    }
    
    const runSave = async () => {
      setLoading(true);
      try {
        const { error } = await db.savePortfolioItem(portfolioForm);
        if (error) throw error;
        setShowPortfolioModal(false);
        loadDashboardData();
      } catch (err) {
        alert(`저장 오류: ${err.message}`);
        setLoading(false);
      }
    };

    const isLogged = await checkSessionOrReauth(runSave);
    if (!isLogged) return;
    await runSave();
  };

  const handlePortfolioDelete = async (id) => {
    if (!confirm('정말로 해당 포트폴리오를 삭제하시겠습니까?')) return;
    
    const runDelete = async () => {
      setLoading(true);
      try {
        const { error } = await db.deletePortfolioItem(id);
        if (error) throw error;
        loadDashboardData();
      } catch (err) {
        alert(`삭제 오류: ${err.message}`);
        setLoading(false);
      }
    };

    const isLogged = await checkSessionOrReauth(runDelete);
    if (!isLogged) return;
    await runDelete();
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
    if (e && e.preventDefault) e.preventDefault();
    if (!newsForm.title || !newsForm.description || !newsForm.content) {
      alert('제목, 코멘트, 마크다운 본문은 필수 기입 사항입니다.');
      return;
    }

    const runSave = async () => {
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

    const isLogged = await checkSessionOrReauth(runSave);
    if (!isLogged) return;
    await runSave();
  };

  const handleNewsDelete = async (id) => {
    if (!confirm('정말로 해당 뉴스를 삭제하시겠습니까?')) return;

    const runDelete = async () => {
      setLoading(true);
      try {
        const { error } = await db.deleteNewsItem(id);
        if (error) throw error;
        loadDashboardData();
      } catch (err) {
        alert(`삭제 오류: ${err.message}`);
        setLoading(false);
      }
    };

    const isLogged = await checkSessionOrReauth(runDelete);
    if (!isLogged) return;
    await runDelete();
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
                  <button 
                    onClick={() => setCurrentTab('manual')}
                    style={{
                      ...styles.tabBtn,
                      ...(currentTab === 'manual' ? styles.tabBtnActiveManual : {})
                    }}
                  >
                    운영 매뉴얼
                  </button>
                  <button 
                    onClick={() => setCurrentTab('migration')}
                    style={{
                      ...styles.tabBtn,
                      ...(currentTab === 'migration' ? styles.tabBtnActiveMigration : {})
                    }}
                  >
                    마이그레이션 & 로드맵
                  </button>
                  <button 
                    onClick={() => setCurrentTab('leads')}
                    style={{
                      ...styles.tabBtn,
                      ...(currentTab === 'leads' ? styles.tabBtnActiveLeads : {})
                    }}
                  >
                    마케팅 잠재고객 (리드)
                  </button>
                  <button 
                    onClick={() => setCurrentTab('resources')}
                    style={{
                      ...styles.tabBtn,
                      ...(currentTab === 'resources' ? styles.tabBtnActiveResources : {})
                    }}
                  >
                    주인공 이미지 관리
                  </button>
                </div>

                <button onClick={handleLogout} style={styles.logoutBtn}>
                  <LogOut size={16} />
                  <span>로그아웃</span>
                </button>

                {currentTab === 'portfolio' && (
                  <button onClick={() => openPortfolioModal()} style={styles.createBtn}>
                    <Plus size={16} />
                    <span>새 포트폴리오 등록</span>
                  </button>
                )}
                {currentTab === 'news' && (
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
                              <td style={styles.td}>{formatKSTDate(item.createdAt)}</td>
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
                              <td style={styles.td}>{formatKSTDate(item.createdAt)}</td>
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

                {/* Tab 3: Operator Manual View */}
                {currentTab === 'manual' && (
                  <div style={styles.manualContainer} className="glass-panel">
                    <h2 style={styles.manualTitle}>톱니바꿈월드 운영 매뉴얼</h2>
                    
                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.manualNumber}>1</span> 관리자 로그인 및 세션 관리
                      </h3>
                      <p style={styles.manualText}>
                        - 관리자 계정은 <strong style={{ color: 'var(--accent-indigo)' }}>jhpa670211@gmail.com</strong>, 패스코드는 <strong style={{ color: 'var(--accent-indigo)' }}>jhpa670211</strong>입니다.<br />
                        - 패스코드로 로그인 시 로그인 세션 플래그가 브라우저의 <code>localStorage</code>에 저장되어, 새로고침하거나 브라우저를 재부팅해도 세션이 안전하게 자동 유지됩니다.<br />
                        - 로그아웃 버튼을 누르면 이 세션 캐시가 제거됩니다.
                      </p>
                    </div>

                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.manualNumber}>2</span> 포트폴리오(앱/인사이트) 관리 및 DND 정렬
                      </h3>
                      <p style={styles.manualText}>
                        - <strong>등록/수정</strong>: 제목, 설명, 카테고리(영상제작, 홈페이지, 인사이트)를 등록합니다.<br />
                        - <strong>실시간 화면 캡처</strong>: 프로젝트 URL 입력 후 '실시간 웹 보기' 버튼을 클릭하면 해당 웹페이지를 임베디드 창으로 직접 확인하고 <strong>'현재 화면 실시간 캡처 및 등록'</strong> 버튼을 눌러 대표 썸네일로 즉시 자동 캡처할 수 있습니다.<br />
                        - <strong>Manual 및 Video 링크</strong>: Notion 설명서 주소 및 유튜브 영상 링크(여러 개인 경우 쉼표로 구분)를 연동하면 포털 카드에 매뉴얼 및 비디오 재생 버튼이 자동으로 활성화됩니다.<br />
                        - <strong>드래그 앤 드롭 정렬 (DND)</strong>: 포트폴리오 필터를 <strong>'전체보기(All)'</strong> 상태로 변경한 후, 리스트 왼쪽의 손잡이 아이콘(<GripVertical size={14} style={{ display: 'inline', margin: '0 2px' }} />)을 잡고 원하는 위치로 드래그하면 순서가 실시간 저장되어 메인 화면에 반영됩니다.
                      </p>
                    </div>

                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.manualNumber}>3</span> AI 트렌드 뉴스 자동 수집 및 GitHub Actions
                      </h3>
                      <p style={styles.manualText}>
                        - <strong>수동 등록</strong>: 대시보드에서 직접 헤드라인과 요약, 상세 마크다운 본문을 작성해 AI 뉴스를 발행할 수 있습니다.<br />
                        - <strong>GitHub Actions 스케줄러 자동화</strong>: 매일 한국 시간 <strong>오전 7:00</strong>에 깃허브에서 파이썬 기동 스크립트(<code>scripts/daily_news_agent.py</code>)가 자동으로 동작합니다.<br />
                        - <strong>중복 등록 차단</strong>: 구글 뉴스 RSS feed에서 최신 AI 뉴스를 가져오며, 데이터베이스에 이미 등록된 기사인 경우 자동으로 스킵하고 새로운 기사만 요약해 등록합니다.<br />
                        - <strong>Gemini AI 번역/요약 및 폴백</strong>: 구글 AI API(기본 <code>gemini-3.5-flash</code>)가 영문 뉴스를 매끄러운 한글로 자동 번역하고, 핵심 요점 3가지를 요약하여 등록합니다. 일시적인 API 서버 부하/장애(503 등) 발생 시 <code>gemini-1.5-flash</code> 등 대체 모델로 자동 우회 시도하여 중단 없는 서비스를 지원합니다.<br />
                        - <strong>수동 즉시 재발행 및 에러 확인</strong>: 수집/발행 실패 시 <a href="https://github.com/ParkJinHee67/ai-world-homepage/actions/workflows/daily_news.yml" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-indigo)', textDecoration: 'underline' }}>GitHub Actions 워크플로우 페이지</a>에서 최근 실행의 빨간색 ❌ 표시를 눌러 에러 로그를 확인하거나, 우측 상단의 <strong>Run workflow</strong> 버튼을 이용해 즉시 수집을 재발행할 수 있습니다.<br />
                        - <strong>깃허브 보안 키 설정</strong>: 워크플로우 가동을 위해 저장소 Settings ➜ Secrets에 <code>SUPABASE_URL</code>, <code>SUPABASE_KEY</code>, <code>GEMINI_API_KEY</code>를 반드시 입력해 두어야 합니다.
                      </p>
                    </div>

                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.manualNumber}>4</span> 로컬 개발 및 빌드 환경 가이드
                      </h3>
                      <p style={styles.manualText}>
                        - <strong>개발 서버 기동</strong>: <code>npm run dev</code> (기본 http://localhost:3000/)<br />
                        - <strong>배포용 빌드</strong>: <code>npm run build</code> (정적 페이지 최적화 및 <code>.next/</code> 디렉토리 빌드 완성)<br />
                        - <strong>데이터베이스 스키마</strong>: Supabase SQL Editor를 통해 <code>portfolio_items</code>, <code>ai_news</code>, <code>admin_accounts</code> 테이블이 연결되어 관리됩니다.
                      </p>
                    </div>

                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.manualNumber}>5</span> Next.js 환경 변수(Vercel) 가이드
                      </h3>
                      <p style={styles.manualText}>
                        - Next.js의 보안 가이드라인에 따라, 브라우저 단에서 사용되는 모든 환경 변수명 앞에는 반드시 <code>NEXT_PUBLIC_</code> 접두사가 있어야 정상 작동합니다.<br />
                        - Vercel에 환경 변수를 입력할 때는 <code>NEXT_PUBLIC_VITE_SUPABASE_URL</code>, <code>NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY</code>, <code>NEXT_PUBLIC_VITE_EMAILJS_SERVICE_ID</code> 등과 같이 접두사를 추가해 주셔야 합니다.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 6: Migration & Roadmap View */}
                {currentTab === 'migration' && (
                  <div style={styles.manualContainer} className="glass-panel">
                    <h2 style={{...styles.manualTitle, borderColor: 'rgba(16, 185, 129, 0.2)'}}>
                      Vite SPA → Next.js 마이그레이션 & 개발 로드맵
                    </h2>
                    
                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.migrationNumber}>1</span> 마이그레이션 수행 목적 및 이유
                      </h3>
                      <p style={styles.manualText}>
                        - <strong>검색엔진 최적화 (SEO) 극대화</strong>: 기존 React SPA(Vite) 구조는 자바스크립트 실행 전까지 검색 엔진이 빈 페이지를 읽어 노출에 한계가 있었습니다. Next.js App Router로 마이그레이션하여, 빌드 타임에 Supabase 데이터를 정적으로 읽어와 HTML로 인코딩하므로 검색 노출이 대폭 향상됩니다.<br />
                        - <strong>0초대 초기 로딩 속도 구현 (Instant Load)</strong>: 브라우저가 직접 Supabase API를 호출하기 전에 Next.js 서버 컴포넌트가 데이터를 미리 조회(Pre-fetch)하여 HTML에 녹여냅니다. 따라서 첫 로딩 시 서버 딜레이가 최소화되고 레이아웃이 밀리는 현상이 방지됩니다.<br />
                        - <strong>프론트엔드/백엔드 통합 확장성</strong>: 미들웨어, 서버 API 엔드포인트(Route Handlers), 하이브리드 정적/동적 렌더링을 한 프로젝트 내에서 손쉽게 확장하여 활용 가능합니다.
                      </p>
                    </div>

                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.migrationNumber}>2</span> 완료된 마이그레이션 세부 내역
                      </h3>
                      <p style={styles.manualText}>
                        - <strong>Next.js 15+ 프로젝트 구축</strong>: <code>ai-world-nextjs</code> 하위 폴더에 Next.js 어플리케이션을 완성하여, 기존 Vite와 구분해 독립적으로 구동 가능합니다.<br />
                        - <strong>서버/클라이언트 컴포넌트 이원화 설계</strong>: <code>page.jsx</code>가 서버 측에서 데이터를 프리패치하고, <code>"use client"</code> 지시어를 가진 클라이언트 컴포넌트들이 화면 상호작용 및 통계 구독을 실시간 담당하도록 전환했습니다.<br />
                        - <strong>안전한 이미지 렌더링 최적화</strong>: 뉴스 기사의 다양한 외부 썸네일 경로가 Next.js <code>Image</code> 도메인 차단 보안 정책으로 인해 깨지지 않도록, 렌더링 안전성이 담보되는 네이티브 이미지 처리를 적용했습니다.
                      </p>
                    </div>

                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.migrationNumber}>3</span> ⚙️ SEO (검색엔진 최적화) 설정 완료 내역
                      </h3>
                      <p style={styles.manualText}>
                        - <strong>페이지별 Metadata API 적용</strong>: 각 페이지 서버 컴포넌트(<code>page.jsx</code>) 마다 고유 메타데이터(Title, Description, OpenGraph, Twitter 카드)를 정적으로 선언하여 빌드 타임 컴파일 및 검색 엔진 수집 최적화를 완료했습니다.<br />
                        - <strong>sitemap.js 자동 생성</strong>: 전체 공개 경로(<code>/</code>, <code>/ai-news</code> 등)를 동적으로 읽어 <code>/sitemap.xml</code>을 표준 규격으로 빌드 타임 자동 생성하도록 설정했습니다.<br />
                        - <strong>robots.js 크롤링 규약 지정</strong>: 전체 웹 페이지 색인은 허용하되, 보안이 필요한 관리자 경로(<code>/admin</code>)는 봇 수집에서 차단(disallow) 처리하여 연결성을 지켰습니다.<br />
                        - <strong>HTML Lang 다국어 한국어 선언</strong>: 레이아웃에서 <code>&lt;html lang="ko"&gt;</code> 언어 규격을 고정 명시하여 검색 친화도와 브라우저 자동 번역 오작동을 예방했습니다.<br />
                        - <strong>JSON-LD 스키마 마크업 삽입</strong>: 구글 등 인공지능 검색 엔진이 기업 정보를 정확히 구조화 분류하도록 Schema.org 표준 JSON-LD를 헤더에 적용했습니다.
                      </p>
                    </div>

                    <div style={styles.manualSection}>
                      <h3 style={styles.manualSubTitle}>
                        <span style={styles.migrationNumber}>4</span> 🚀 향후 남은 개발 과제 및 로드맵
                      </h3>
                      <div style={styles.roadmapBox}>
                        <div style={styles.roadmapItem}>
                          <h4 style={styles.roadmapItemTitle}>
                            <FileText size={16} style={{ color: '#a7f3d0' }} />
                            과제 1: 블로그 / 인사이트 글 섹션 고도화 (마크다운 & MDX)
                          </h4>
                          <p style={styles.roadmapItemText}>
                            - <strong>현황</strong>: 현재는 DB 텍스트 형태로 수록 중이나, 작성되는 글 분량이 지속적으로 증가하면 관리가 복잡해질 수 있습니다.<br />
                            - <strong>개선 방안</strong>: 마크다운(Markdown) 혹은 **MDX** 기반의 정적 페이지 생성 방식을 연동합니다. <code>app/insights/[slug]/page.jsx</code> 구조를 설계하여 로컬에 <code>.mdx</code> 파일이 추가될 때마다 검색엔진에 최적화된 블로그 글 페이지가 자동으로 빌드 타임에 정적 생성되도록 구현할 예정입니다.
                          </p>
                        </div>

                        <div style={styles.roadmapItem}>
                          <h4 style={styles.roadmapItemTitle}>
                            <Monitor size={16} style={{ color: '#a7f3d0' }} />
                            과제 2: 구글 애드센스(Google AdSense) 수익화 코드 삽입
                          </h4>
                          <p style={styles.roadmapItemText}>
                            - <strong>현황</strong>: 현재 광고 코드가 삽입되지 않은 초기 릴리즈 상태입니다.<br />
                            - <strong>개선 방안</strong>: Next.js 전용 <code>next/script</code> 컴포넌트를 사용하여 애드센스 클라이언트 코드를 비동기(lazyOnload)로 삽입합니다. 전체 레이아웃 파일(<code>app/layout.js</code>)에 광고 코드를 주입하고, 뉴스 리스트 피드 중간과 인사이트 칼럼 본문 내부 영역에 알맞은 광고 크기를 반응형으로 삽입할 계획입니다.
                          </p>
                        </div>

                        <div style={styles.roadmapItem}>
                          <h4 style={styles.roadmapItemTitle}>
                            <Link size={16} style={{ color: '#a7f3d0' }} />
                            과제 3: 제휴 마케팅 링크 컴포넌트 구현 (쿠팡파트너스 등)
                          </h4>
                          <p style={styles.roadmapItemText}>
                            - <strong>현황</strong>: 포트폴리오 및 칼럼 본문 내에서 외부 링크 유도가 일반적인 텍스트로만 제공됩니다.<br />
                            - <strong>개선 방안</strong>: 쿠팡파트너스 등 외부 제휴 마케팅 링크를 프리미엄 쇼핑 카드(Rich Card) 형태로 노출하는 공통 컴포넌트를 설계합니다. 클릭 시 리다이렉션 트래킹 이벤트를 수집하여 성과를 측정할 수 있도록 지원하며, 법적 의무 사항인 '대가성 문구'가 고정 노출되도록 컴포넌트화할 계획입니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Leads View */}
                {currentTab === 'leads' && (
                  <div style={styles.leadsContainer} className="glass-panel">
                    <div style={styles.leadsHeader}>
                      <h2 style={styles.leadsTitle}>수집된 마케팅 리드 목록</h2>
                      <button onClick={exportLeadsToCSV} style={styles.exportBtn}>
                        <FileText size={16} />
                        <span>CSV로 내보내기 (Excel 호환)</span>
                      </button>
                    </div>
                    <p style={styles.leadsSubtitle}>
                      주인공 이미지 다운로드 신청 시 수집된 {leads.length}명의 잠재 고객 정보입니다.
                    </p>
                    
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>신청 일시</th>
                            <th style={styles.th}>이름 / 닉네임</th>
                            <th style={styles.th}>이메일 주소</th>
                            <th style={styles.th}>요청 리소스</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.length > 0 ? (
                            leads.map((lead) => (
                              <tr key={lead.id} style={styles.tr}>
                                <td style={styles.td}>
                                  {new Date(lead.created_at || lead.createdAt).toLocaleString('ko-KR')}
                                </td>
                                <td style={styles.td}>{lead.name}</td>
                                <td style={styles.td}>{lead.email}</td>
                                <td style={styles.td}>{lead.requested_image || lead.requestedImage}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" style={styles.tdEmpty}>
                                아직 수집된 잠재 고객 데이터가 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 5: Resources View */}
                {currentTab === 'resources' && (
                  <div style={styles.leadsContainer} className="glass-panel">
                    <div style={styles.leadsHeader}>
                      <h2 style={styles.leadsTitle}>주인공 이미지 리소스 관리</h2>
                      <button onClick={openResourceModal} style={styles.exportBtn}>
                        <Plus size={16} />
                        <span>새 이미지 등록</span>
                      </button>
                    </div>
                    <p style={styles.leadsSubtitle}>
                      다운로드 페이지에 노출되는 고품질 이미지 리소스를 업로드 및 삭제하는 공간입니다. ({resources.length}개 등록됨)
                      <br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'inline-block' }}>
                        💡 드래그 앤 드롭으로 다운로드 페이지의 노출 순서를 자유롭게 조정할 수 있습니다.
                      </span>
                    </p>
                    
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.trHead}>
                            <th style={{ ...styles.th, width: '70px' }}>순서</th>
                            <th style={styles.th}>썸네일</th>
                            <th style={styles.th}>제목</th>
                            <th style={styles.th}>설명</th>
                            <th style={styles.th}>파일명</th>
                            <th style={styles.th}>해상도 / 크기</th>
                            <th style={{ ...styles.th, textAlign: 'center', width: '100px' }}>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resources.length > 0 ? (
                            resources.map((res, idx) => (
                              <tr 
                                key={res.id} 
                                draggable
                                onDragStart={(e) => handleResourceDragStart(e, idx)}
                                onDragOver={(e) => handleResourceDragOver(e, idx)}
                                onDragEnd={handleResourceDragEnd}
                                style={{
                                  ...styles.trBody,
                                  ...(draggedIndex === idx ? styles.trBodyDragging : {})
                                }}
                                className="admin-table-row"
                              >
                                <td style={styles.td}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'grab' }}>
                                    <GripVertical size={16} color="var(--text-muted)" />
                                    <span>{idx + 1}</span>
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <ResourceThumbnail resourceId={res.id} initialSrc={res.file_content || res.fileContent} />
                                </td>
                                <td style={styles.td} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{res.title}</td>
                                <td style={styles.td} style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.description}</td>
                                <td style={styles.td}>{res.file_name || res.fileName}</td>
                                <td style={styles.td}>{res.resolution} / {res.file_size || res.fileSize}</td>
                                <td style={styles.td} style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    <button 
                                      onClick={() => openEditResourceModal(res)} 
                                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', padding: '4px' }}
                                      title="수정"
                                    >
                                      <Pen size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteResource(res.id)} 
                                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                                      title="삭제"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" style={styles.tdEmpty}>
                                등록된 주인공 이미지 리소스가 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
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
                      type="text" 
                      value={portfolioForm.appUrl} 
                      onChange={(e) => handleUrlChange(e.target.value, 'portfolio')} 
                      placeholder="https://example.com 또는 /cardnews"
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

      {/* RESOURCE UPLOAD MODAL */}
      {showResourceModal && (
        <div style={styles.modalOverlay} onClick={() => !isUploadingResource && setShowResourceModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingResourceItem ? '주인공 이미지 리소스 수정' : '새 주인공 이미지 등록'}
            </h2>
            
            <form onSubmit={handleResourceSave} style={styles.form}>
              <div style={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label style={styles.label}>
                  이미지 파일 선택 {!editingResourceItem && <span style={{ color: 'var(--accent-rose)' }}>*</span>}
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleResourceFileChange}
                  required={!editingResourceItem}
                  disabled={isUploadingResource}
                  style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}
                />
                {resourceForm.fileContent && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                     <img 
                       src={resourceForm.fileContent} 
                       alt="Upload Preview" 
                       style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'contain' }} 
                     />
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                       해상도: <strong>{resourceForm.resolution}</strong> / 크기: <strong>{resourceForm.fileSize}</strong>
                     </div>
                  </div>
                )}
              </div>

              <div style={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label style={styles.label}>이미지 제목 <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                <input 
                  type="text" 
                  value={resourceForm.title} 
                  onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))} 
                  placeholder="예: 카카오 세로형 배너"
                  required
                  disabled={isUploadingResource}
                  className="input-field"
                />
              </div>

              <div style={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label style={styles.label}>설명 코멘트</label>
                <textarea 
                  value={resourceForm.description} 
                  onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="이 리소스의 사용 용도에 대해 한두 줄 설명해 주세요."
                  rows={3}
                  style={{ resize: 'none' }}
                  disabled={isUploadingResource}
                  className="input-field"
                />
              </div>

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setShowResourceModal(false)} 
                  style={styles.cancelBtn}
                  disabled={isUploadingResource}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={styles.saveBtn}
                  disabled={isUploadingResource}
                >
                  {isUploadingResource ? '업로드 중...' : (editingResourceItem ? '수정 완료' : '등록 완료')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REAUTH MODAL */}
      {showReauthModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.lockIconContainer}>
              <ShieldAlert size={32} color="var(--accent-indigo)" />
            </div>
            <h2 style={styles.modalTitle}>세션 만료 - 재인증 필요</h2>
            <p style={{ ...styles.manualText, textAlign: 'center', marginBottom: '20px' }}>
              보안을 위해 관리자 비밀번호를 다시 입력해 주세요.<br />
              작성 중이던 데이터는 그대로 유지됩니다.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setReauthError('');
              setReauthLoading(true);
              try {
                const { data, error } = await db.signInWithEmail(reauthEmailInput, reauthPasswordInput);
                if (error) {
                  setReauthError(error.message || '인증에 실패했습니다.');
                } else {
                  setShowReauthModal(false);
                  if (reauthCallback) {
                    await reauthCallback();
                  }
                  setReauthCallback(null);
                }
              } catch (err) {
                setReauthError(err.message || '오류가 발생했습니다.');
              } finally {
                setReauthLoading(false);
              }
            }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>이메일</label>
                <input
                  type="email"
                  value={reauthEmailInput}
                  onChange={(e) => setReauthEmailInput(e.target.value)}
                  required
                  style={styles.loginInput}
                  className="input-field"
                  disabled={reauthLoading}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>비밀번호</label>
                <input
                  type="password"
                  value={reauthPasswordInput}
                  onChange={(e) => setReauthPasswordInput(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  style={styles.loginInput}
                  className="input-field"
                  disabled={reauthLoading}
                />
              </div>
              {reauthError && (
                <p style={styles.loginErrorText}>{reauthError}</p>
              )}
              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowReauthModal(false);
                    setReauthCallback(null);
                    handleLogout();
                  }}
                  style={styles.cancelBtn}
                  disabled={reauthLoading}
                >
                  취소 (로그아웃)
                </button>
                <button
                  type="submit"
                  style={styles.saveBtn}
                  disabled={reauthLoading}
                >
                  {reauthLoading ? '인증 중...' : '인증 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceThumbnail({ resourceId, initialSrc }) {
  const [src, setSrc] = useState(initialSrc || '');
  const [loading, setLoading] = useState(!src);

  useEffect(() => {
    if (!src) {
      async function load() {
        try {
          const { data } = await db.getResourceContent(resourceId);
          if (data) setSrc(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      load();
    }
  }, [resourceId, src]);

  if (loading) {
    return (
      <div style={{ width: '60px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
        <Loader2 size={12} className="spin-loader" style={{ color: 'var(--accent-indigo)' }} />
      </div>
    );
  }

  return (
    <img 
      src={src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'} 
      alt="Thumbnail" 
      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} 
    />
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
  },
  tabBtnActiveManual: {
    background: 'var(--accent-purple)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)',
  },
  tabBtnActiveLeads: {
    background: 'var(--accent-indigo)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
  },
  tabBtnActiveResources: {
    background: 'var(--accent-rose)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(244, 63, 94, 0.15)',
  },
  leadsContainer: {
    marginTop: '20px',
    padding: '32px',
    textAlign: 'left',
    background: 'rgba(13, 11, 24, 0.55)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  leadsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  leadsTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  leadsSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  exportBtn: {
    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
    fontWeight: 600,
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  td: {
    padding: '14px 16px',
    color: 'var(--text-secondary)',
  },
  tdEmpty: {
    padding: '40px 16px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  manualContainer: {
    marginTop: '20px',
    padding: '32px',
    textAlign: 'left',
    background: 'rgba(13, 11, 24, 0.55)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  manualTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    marginBottom: '28px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '16px',
    color: 'var(--text-primary)',
  },
  manualSection: {
    marginBottom: '28px',
  },
  manualSubTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    marginBottom: '12px',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  manualNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(168, 85, 247, 0.15)',
    color: '#d8b4fe',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  manualText: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    paddingLeft: '34px',
  },
  tabBtnActiveMigration: {
    background: 'var(--accent-emerald)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
  },
  migrationNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#a7f3d0',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  roadmapBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingLeft: '34px',
    marginTop: '16px',
  },
  roadmapItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px',
    transition: 'var(--transition-fast)',
  },
  roadmapItemTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  roadmapItemText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  }
};

