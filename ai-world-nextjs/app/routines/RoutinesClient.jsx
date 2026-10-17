"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Bot, Clock, Calendar, CheckCircle2, AlertTriangle, ExternalLink, 
  RefreshCw, Search, Layers, Table as TableIcon, LayoutGrid, 
  ChevronRight, Sparkles, ShieldAlert, Check, ArrowUpRight,
  Cpu, Send, Activity, Eye, Terminal, Globe
} from 'lucide-react';
import { DEFAULT_ROUTINES } from './defaultRoutines';

export default function RoutinesClient({ initialItems = DEFAULT_ROUTINES, embedded = false }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('initial');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Filter states
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'agent' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  // Fetch live data on mount
  useEffect(() => {
    fetchLiveRoutines(false);
  }, []);

  const fetchLiveRoutines = async (isManual = false) => {
    setLoading(true);
    try {
      const url = `/api/routines${isManual ? '?refresh=1' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.items && data.items.length > 0) {
        setItems(data.items);
        setSource(data.source || 'live_google_sheets');
        setLastUpdated(data.updatedAt ? new Date(data.updatedAt) : new Date());
      }
    } catch (err) {
      console.error('Failed to fetch routines:', err);
    } finally {
      setLoading(false);
    }
  };

  // Agent color mapping
  const getAgentColor = (agentName) => {
    if (!agentName) return { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.4)' };
    if (agentName.includes('AI 뉴스')) return { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.4)' };
    if (agentName.includes('어사이드')) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
    if (agentName.includes('비서실장')) return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
    if (agentName.includes('본부장')) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
    if (agentName.includes('리더스가든')) return { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.4)' };
    return { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.4)' };
  };

  // Distinct agent categories for filter
  const agentOptions = useMemo(() => {
    return [
      { key: 'ALL', label: '전체 주체' },
      { key: 'AI 뉴스', label: 'AI 뉴스 에이전트' },
      { key: '어사이드', label: '어사이드' },
      { key: '비서실장', label: '비서실장' },
      { key: '본부장', label: '본부장' },
      { key: '리더스가든', label: '리더스가든' },
    ];
  }, []);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Agent filter
      if (selectedAgent !== 'ALL' && !item.agent.includes(selectedAgent)) {
        return false;
      }
      // Day filter
      if (selectedDay !== 'ALL' && !item.day.includes(selectedDay)) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'warning' && item.status !== 'warning') return false;
      if (selectedStatus === 'success' && item.status !== 'success') return false;
      if (selectedStatus === 'pending' && item.status !== 'pending') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.routineName?.toLowerCase().includes(q);
        const inTask = item.taskDetail?.toLowerCase().includes(q);
        const inTarget = item.targetChannel?.toLowerCase().includes(q);
        const inNotes = item.notes?.toLowerCase().includes(q);
        const inAgent = item.agent?.toLowerCase().includes(q);
        if (!inTitle && !inTask && !inTarget && !inNotes && !inAgent) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => (a.timeSort || '99:99').localeCompare(b.timeSort || '99:99'));
  }, [items, selectedAgent, selectedDay, selectedStatus, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = items.length;
    const warningCount = items.filter(i => i.status === 'warning').length;
    const successCount = items.filter(i => i.status === 'success').length;
    const pendingCount = items.filter(i => i.status === 'pending').length;
    const dailyCount = items.filter(i => i.day?.includes('매일')).length;
    return { total, warningCount, successCount, pendingCount, dailyCount };
  }, [items]);

  // Grouped by agent for agent view mode
  const groupedByAgent = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      let groupKey = '기타';
      if (item.agent.includes('AI 뉴스')) groupKey = 'AI 뉴스 에이전트';
      else if (item.agent.includes('어사이드')) groupKey = '어사이드 (콘텐츠 발행)';
      else if (item.agent.includes('비서실장')) groupKey = '비서실장 (운영/모니터링)';
      else if (item.agent.includes('본부장')) groupKey = '본부장 (수익/마케팅/기록)';
      else if (item.agent.includes('리더스가든')) groupKey = '리더스가든 (AntiGravity)';

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div style={{ ...styles.container, ...(embedded ? styles.embeddedContainer : {}) }}>
      {/* Top Banner / Header */}
      <div style={styles.headerCard} className="glass-panel">
        <div style={styles.headerLeft}>
          <div style={styles.headerIconBox}>
            <Cpu size={26} color="var(--accent-cyan, #00f2fe)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={styles.headerTitle}>톱니바꿈 자동화 에이전트 관제 센터</h1>
              <span style={styles.liveBadge}>
                <span style={styles.liveDot} />
                {source === 'live_google_sheets' ? 'Google 시트 실시간 연동' : '로컬 캐시 동기화'}
              </span>
            </div>
            <p style={styles.headerSubtitle}>
              매일 지정된 시각에 자율 실행되는 18개 AI 에이전트 파이프라인의 실시간 스케줄 및 가동 상태입니다.
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button 
            onClick={() => fetchLiveRoutines(true)} 
            disabled={loading}
            style={styles.refreshBtn}
            title="구글 시트에서 최신 데이터 다시 가져오기"
          >
            <RefreshCw size={15} className={loading ? 'spin-anim' : ''} />
            <span>{loading ? '동기화 중...' : '새로고침'}</span>
          </button>

          <a 
            href="https://docs.google.com/spreadsheets/d/1oNoOwHO8qAV41OrQAfmpAqku5Go28RGCdVQ9P9ZE3H4/edit?gid=1227892140#gid=1227892140"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.sheetLinkBtn}
            title="구글 스프레드시트 원본 열기"
          >
            <ExternalLink size={15} />
            <span>구글 시트 원본</span>
          </a>

          {embedded && (
            <Link 
              href="/routines" 
              target="_blank" 
              style={styles.fullscreenBtn}
              title="전체 화면 독립 페이지로 열기"
            >
              <ArrowUpRight size={15} />
              <span>전체화면 열기</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard} className="glass-panel">
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>전체 등록 루틴</span>
            <Layers size={18} color="#818cf8" />
          </div>
          <div style={styles.statValueRow}>
            <span style={styles.statValue}>{stats.total}</span>
            <span style={styles.statSub}>건의 자동화 태스크</span>
          </div>
        </div>

        <div 
          style={{ ...styles.statCard, cursor: 'pointer', borderColor: selectedStatus === 'warning' ? '#f43f5e' : undefined }} 
          className="glass-panel"
          onClick={() => setSelectedStatus(selectedStatus === 'warning' ? 'ALL' : 'warning')}
          title="클릭하여 점검 필요 항목만 필터"
        >
          <div style={styles.statHeader}>
            <span style={{ ...styles.statLabel, color: stats.warningCount > 0 ? '#f43f5e' : 'inherit' }}>
              점검 필요 / 이슈 감지
            </span>
            <AlertTriangle size={18} color="#f43f5e" />
          </div>
          <div style={styles.statValueRow}>
            <span style={{ ...styles.statValue, color: '#f43f5e' }}>{stats.warningCount}</span>
            <span style={styles.statSub}>로그인/미발행 항목</span>
          </div>
        </div>

        <div 
          style={{ ...styles.statCard, cursor: 'pointer', borderColor: selectedStatus === 'success' ? '#10b981' : undefined }} 
          className="glass-panel"
          onClick={() => setSelectedStatus(selectedStatus === 'success' ? 'ALL' : 'success')}
          title="클릭하여 정상 완료 항목만 필터"
        >
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>최근 확인 완료 / 정상</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={styles.statValueRow}>
            <span style={{ ...styles.statValue, color: '#10b981' }}>{stats.successCount}</span>
            <span style={styles.statSub}>정상 작동 확인됨</span>
          </div>
        </div>

        <div style={styles.statCard} className="glass-panel">
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>매일 실행 루틴</span>
            <Calendar size={18} color="#38bdf8" />
          </div>
          <div style={styles.statValueRow}>
            <span style={{ ...styles.statValue, color: '#38bdf8' }}>{stats.dailyCount}</span>
            <span style={styles.statSub}>매일 무중단 가동</span>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Controls */}
      <div style={styles.controlBar} className="glass-panel">
        <div style={styles.viewModeSwitch}>
          <button 
            style={{ ...styles.viewBtn, ...(viewMode === 'timeline' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('timeline')}
          >
            <Clock size={16} />
            <span>타임라인 뷰</span>
          </button>
          <button 
            style={{ ...styles.viewBtn, ...(viewMode === 'agent' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('agent')}
          >
            <LayoutGrid size={16} />
            <span>에이전트별 뷰</span>
          </button>
          <button 
            style={{ ...styles.viewBtn, ...(viewMode === 'table' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('table')}
          >
            <TableIcon size={16} />
            <span>전체 테이블</span>
          </button>
        </div>

        {/* Search Input */}
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-secondary, #94a3b8)" />
          <input 
            type="text" 
            placeholder="루틴명, 절차, 대상 채널, 비고 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={styles.clearBtn}>✕</button>
          )}
        </div>
      </div>

      {/* Filter Badges Row */}
      <div style={styles.filterPillsRow}>
        <div style={styles.pillsGroup}>
          <span style={styles.pillsLabel}>주체:</span>
          {agentOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSelectedAgent(opt.key)}
              style={{
                ...styles.pillBtn,
                ...(selectedAgent === opt.key ? styles.pillBtnActive : {})
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={styles.pillsGroup}>
          <span style={styles.pillsLabel}>주기:</span>
          {['ALL', '매일', '평일', '월요일'].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                ...styles.pillBtn,
                ...(selectedDay === day ? styles.pillBtnActive : {})
              }}
            >
              {day === 'ALL' ? '전체 요일' : day}
            </button>
          ))}
        </div>

        {selectedStatus !== 'ALL' && (
          <button 
            onClick={() => setSelectedStatus('ALL')}
            style={styles.resetFilterBtn}
          >
            상태 필터 초기화 ({selectedStatus === 'warning' ? '주의' : selectedStatus === 'success' ? '정상' : '대기'}) ✕
          </button>
        )}
      </div>

      {/* Main Content Areas */}
      {filteredItems.length === 0 ? (
        <div style={styles.emptyState} className="glass-panel">
          <Bot size={44} color="#64748b" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', marginTop: '14px' }}>
            조건에 일치하는 루틴 태스크가 없습니다.
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
            검색어나 필터 설정을 변경해 보세요.
          </p>
          <button 
            onClick={() => { setSelectedAgent('ALL'); setSelectedDay('ALL'); setSelectedStatus('ALL'); setSearchQuery(''); }}
            style={styles.resetAllBtn}
          >
            모든 필터 초기화
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        /* TIMELINE VIEW */
        <div style={styles.timelineContainer}>
          <div style={styles.timelineLine} />
          {filteredItems.map((item, idx) => {
            const agentCol = getAgentColor(item.agent);
            const isWarning = item.status === 'warning';
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} style={styles.timelineItem}>
                <div style={styles.timelineDotBox}>
                  <div style={{
                    ...styles.timelineDot,
                    borderColor: isWarning ? '#f43f5e' : agentCol.text,
                    backgroundColor: isWarning ? 'rgba(244, 63, 94, 0.2)' : agentCol.bg
                  }}>
                    <Clock size={14} color={isWarning ? '#f43f5e' : agentCol.text} />
                  </div>
                  <span style={styles.timelineTimeText}>{item.timeSort}</span>
                </div>

                <div style={{
                  ...styles.timelineCard,
                  borderColor: isWarning ? 'rgba(244, 63, 94, 0.5)' : 'rgba(255, 255, 255, 0.08)'
                }} className="glass-panel">
                  <div style={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        ...styles.agentBadge,
                        backgroundColor: agentCol.bg,
                        color: agentCol.text,
                        borderColor: agentCol.border
                      }}>
                        {item.agentClean}
                      </span>
                      <span style={styles.dayBadge}>{item.day}</span>
                      <span style={styles.timeBadge}>{item.time}</span>
                      {isWarning && (
                        <span style={styles.warningBadge}>
                          <AlertTriangle size={12} />
                          <span>주의/점검</span>
                        </span>
                      )}
                      {item.status === 'success' && (
                        <span style={styles.successBadge}>
                          <Check size={12} />
                          <span>정상</span>
                        </span>
                      )}
                    </div>
                    {item.lastExecuted && (
                      <span style={styles.lastExecText}>최종: {item.lastExecuted}</span>
                    )}
                  </div>

                  <h3 style={styles.routineTitle}>{item.routineName}</h3>

                  {/* Flow description */}
                  <div style={styles.taskDetailBox}>
                    <div style={styles.detailLabelRow}>
                      <Terminal size={13} color="var(--accent-cyan, #00f2fe)" />
                      <span style={styles.detailLabel}>실행 파이프라인 / 절차</span>
                    </div>
                    <p style={styles.taskDetailText}>
                      {item.taskDetail}
                    </p>
                  </div>

                  {/* Meta channels row */}
                  <div style={styles.metaChannelsRow}>
                    <div style={styles.metaChannelItem}>
                      <Globe size={13} color="#94a3b8" />
                      <span style={styles.metaChannelLabel}>대상:</span>
                      <span style={styles.metaChannelValue}>{item.targetChannel}</span>
                    </div>
                    <div style={styles.metaChannelItem}>
                      <Send size={13} color="#94a3b8" />
                      <span style={styles.metaChannelLabel}>알림:</span>
                      <span style={styles.metaChannelValue}>{item.notifyMethod}</span>
                    </div>
                  </div>

                  {/* Notes / Issue block if present */}
                  {item.notes && (
                    <div style={{
                      ...styles.notesBox,
                      backgroundColor: isWarning ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: isWarning ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        {isWarning ? (
                          <ShieldAlert size={16} color="#f43f5e" style={{ marginTop: '2px', flexShrink: 0 }} />
                        ) : (
                          <Activity size={16} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
                        )}
                        <div>
                          <strong style={{ fontSize: '0.8rem', color: isWarning ? '#f43f5e' : '#34d399' }}>
                            {isWarning ? '실행 상태 이슈 (비고):' : '상태 코멘트:'}
                          </strong>
                          <p style={{ margin: '3px 0 0', fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                            {item.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'agent' ? (
        /* AGENT GROUPED VIEW */
        <div style={styles.agentViewContainer}>
          {Object.entries(groupedByAgent).map(([agentGroup, groupItems]) => {
            const firstItem = groupItems[0];
            const agentCol = getAgentColor(firstItem.agent);

            return (
              <div key={agentGroup} style={styles.agentSection} className="glass-panel">
                <div style={styles.agentSectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      ...styles.agentIconBox,
                      backgroundColor: agentCol.bg,
                      borderColor: agentCol.border
                    }}>
                      <Bot size={22} color={agentCol.text} />
                    </div>
                    <div>
                      <h2 style={styles.agentGroupName}>{agentGroup}</h2>
                      <span style={styles.agentItemCount}>총 {groupItems.length}개의 전담 자동화 루틴</span>
                    </div>
                  </div>
                </div>

                <div style={styles.agentCardsGrid}>
                  {groupItems.map(item => {
                    const isWarning = item.status === 'warning';
                    return (
                      <div key={item.id} style={{
                        ...styles.agentSubCard,
                        borderColor: isWarning ? 'rgba(244, 63, 94, 0.5)' : 'rgba(255, 255, 255, 0.08)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={styles.agentTimeBadge}>{item.time}</span>
                            <span style={styles.dayBadgeSmall}>{item.day}</span>
                          </div>
                          {isWarning && (
                            <span style={styles.warningBadgeSmall}>⚠️ 점검</span>
                          )}
                          {item.status === 'success' && (
                            <span style={styles.successBadgeSmall}>✅ 정상</span>
                          )}
                        </div>

                        <h4 style={styles.agentCardTitle}>{item.routineName}</h4>

                        <p style={styles.agentCardDetail}>
                          {item.taskDetail}
                        </p>

                        <div style={styles.agentCardFooter}>
                          <span style={styles.agentTargetText}>🌐 {item.targetChannel}</span>
                          {item.lastExecuted && (
                            <span style={styles.agentExecTime}>{item.lastExecuted}</span>
                          )}
                        </div>

                        {item.notes && (
                          <div style={{
                            ...styles.agentCardNotes,
                            backgroundColor: isWarning ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            color: isWarning ? '#fda4af' : '#94a3b8'
                          }}>
                            {item.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div style={styles.tableCard} className="glass-panel">
          <div style={styles.tableScrollWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>시간</th>
                  <th style={styles.th}>요일</th>
                  <th style={styles.th}>주체</th>
                  <th style={styles.th}>루틴명</th>
                  <th style={{ ...styles.th, minWidth: '280px' }}>하는 일</th>
                  <th style={styles.th}>대상 채널/사이트</th>
                  <th style={styles.th}>알림 방식</th>
                  <th style={styles.th}>최종 작업일</th>
                  <th style={{ ...styles.th, minWidth: '220px' }}>비고 (상태)</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const agentCol = getAgentColor(item.agent);
                  const isWarning = item.status === 'warning';

                  return (
                    <tr key={item.id} style={{
                      ...styles.tr,
                      backgroundColor: isWarning ? 'rgba(244, 63, 94, 0.04)' : undefined
                    }}>
                      <td style={styles.tdTime}>
                        <span style={styles.tableTimeBadge}>{item.time}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.dayBadgeSmall}>{item.day}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.agentBadgeSmall,
                          backgroundColor: agentCol.bg,
                          color: agentCol.text,
                          borderColor: agentCol.border
                        }}>
                          {item.agentClean}
                        </span>
                      </td>
                      <td style={styles.tdTitle}>
                        <strong>{item.routineName}</strong>
                      </td>
                      <td style={styles.tdDetail}>
                        <p style={styles.tableTaskDetailText}>{item.taskDetail}</p>
                      </td>
                      <td style={styles.tdSmall}>{item.targetChannel}</td>
                      <td style={styles.tdSmall}>{item.notifyMethod}</td>
                      <td style={styles.tdSmall}>{item.lastExecuted || '-'}</td>
                      <td style={styles.td}>
                        {item.notes ? (
                          <div style={{
                            ...styles.tableNotesBox,
                            color: isWarning ? '#fda4af' : '#cbd5e1',
                            borderColor: isWarning ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.06)'
                          }}>
                            {item.notes}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div style={styles.footerInfo}>
        <span>
          데이터 출처: 구글 스프레드시트 <code>톱니바꿈 자동화 – 에이전트 일일 루틴 시간표</code> (gid: 1227892140)
        </span>
        {lastUpdated && (
          <span>마지막 동기화 시각: {lastUpdated.toLocaleTimeString('ko-KR')}</span>
        )}
      </div>

      {/* Global Embedded Styles */}
      <style jsx>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '36px 20px 80px',
    color: 'var(--text-primary, #f8fafc)',
    fontFamily: 'inherit',
  },
  embeddedContainer: {
    padding: '16px 0 40px',
    maxWidth: '100%',
  },
  headerCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    padding: '24px 28px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    marginBottom: '24px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  headerIconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    border: '1px solid rgba(0, 242, 254, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: '1.45rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#ffffff',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #94a3b8)',
    marginTop: '6px',
    marginBottom: 0,
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.35)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  sheetLinkBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  fullscreenBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    color: '#38bdf8',
    border: '1px solid rgba(0, 242, 254, 0.35)',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '18px 22px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    transition: 'border-color 0.2s',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  statLabel: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#94a3b8',
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#ffffff',
  },
  statSub: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  controlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    padding: '12px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    marginBottom: '16px',
  },
  viewModeSwitch: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '7px',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#94a3b8',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  viewBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: '280px',
    flex: '1 1 280px',
    maxWidth: '460px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.85rem',
    width: '100%',
    outline: 'none',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  filterPillsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '26px',
  },
  pillsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  pillsLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 600,
    marginRight: '2px',
  },
  pillBtn: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#94a3b8',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pillBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    color: '#c7d2fe',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  resetFilterBtn: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#f43f5e',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    cursor: 'pointer',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  resetAllBtn: {
    marginTop: '16px',
    padding: '8px 18px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: 'var(--accent-indigo, #6366f1)',
    border: 'none',
    cursor: 'pointer',
  },

  /* TIMELINE STYLES */
  timelineContainer: {
    position: 'relative',
    paddingLeft: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  timelineLine: {
    position: 'absolute',
    left: '12px',
    top: '16px',
    bottom: '16px',
    width: '2px',
    background: 'linear-gradient(to bottom, rgba(0, 242, 254, 0.6), rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.3))',
  },
  timelineItem: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  timelineDotBox: {
    position: 'absolute',
    left: '-32px',
    top: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  timelineDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    zIndex: 2,
  },
  timelineTimeText: {
    display: 'none', // can be toggled if wide
  },
  timelineCard: {
    padding: '22px 24px',
    borderRadius: '14px',
    border: '1px solid',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    transition: 'transform 0.15s ease, border-color 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  agentBadge: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    border: '1px solid',
    letterSpacing: '-0.01em',
  },
  dayBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  timeBadge: {
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: 'var(--accent-cyan, #00f2fe)',
    border: '1px solid rgba(0, 242, 254, 0.25)',
  },
  warningBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 700,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    color: '#fb7185',
    border: '1px solid rgba(244, 63, 94, 0.35)',
  },
  successBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 700,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.35)',
  },
  lastExecText: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  routineTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#f8fafc',
    margin: '0 0 12px',
    letterSpacing: '-0.01em',
  },
  taskDetailBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: '10px',
    padding: '12px 14px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '14px',
  },
  detailLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  detailLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--accent-cyan, #00f2fe)',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  taskDetailText: {
    fontSize: '0.88rem',
    color: '#e2e8f0',
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  metaChannelsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap',
    fontSize: '0.8rem',
    marginBottom: '10px',
  },
  metaChannelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metaChannelLabel: {
    color: '#64748b',
    fontWeight: 600,
  },
  metaChannelValue: {
    color: '#cbd5e1',
  },
  notesBox: {
    marginTop: '10px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid',
  },

  /* AGENT VIEW STYLES */
  agentViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  agentSection: {
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  agentSectionHeader: {
    marginBottom: '18px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '14px',
  },
  agentIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
  },
  agentGroupName: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
  },
  agentItemCount: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  agentCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '14px',
  },
  agentSubCard: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  agentTimeBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--accent-cyan, #00f2fe)',
  },
  dayBadgeSmall: {
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
  },
  warningBadgeSmall: {
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    color: '#fb7185',
    fontWeight: 700,
  },
  successBadgeSmall: {
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    fontWeight: 700,
  },
  agentCardTitle: {
    fontSize: '0.96rem',
    fontWeight: 700,
    color: '#f8fafc',
    margin: '10px 0 8px',
  },
  agentCardDetail: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    lineHeight: 1.5,
    margin: '0 0 12px',
    flex: 1,
    whiteSpace: 'pre-wrap',
  },
  agentCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '8px',
  },
  agentTargetText: {
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '180px',
  },
  agentExecTime: {
    color: '#64748b',
  },
  agentCardNotes: {
    marginTop: '8px',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },

  /* TABLE STYLES */
  tableCard: {
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    overflow: 'hidden',
  },
  tableScrollWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.84rem',
  },
  th: {
    padding: '14px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: '#94a3b8',
    fontWeight: 700,
    fontSize: '0.78rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    whiteSpace: 'nowrap',
    letterSpacing: '0.02em',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '12px 16px',
    color: '#e2e8f0',
    verticalAlign: 'top',
  },
  tdTime: {
    padding: '12px 16px',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
  },
  tableTimeBadge: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--accent-cyan, #00f2fe)',
  },
  agentBadgeSmall: {
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 700,
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
  tdTitle: {
    padding: '12px 16px',
    color: '#ffffff',
    verticalAlign: 'top',
    fontSize: '0.88rem',
  },
  tdDetail: {
    padding: '12px 16px',
    verticalAlign: 'top',
  },
  tableTaskDetailText: {
    margin: 0,
    color: '#cbd5e1',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    fontSize: '0.82rem',
  },
  tdSmall: {
    padding: '12px 16px',
    color: '#94a3b8',
    fontSize: '0.78rem',
    verticalAlign: 'top',
  },
  tableNotesBox: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.78rem',
    lineHeight: 1.4,
    border: '1px solid',
  },
  footerInfo: {
    marginTop: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    fontSize: '0.78rem',
    color: '#64748b',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '16px',
  },
};
