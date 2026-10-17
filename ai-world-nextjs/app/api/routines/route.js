import { NextResponse } from 'next/server';
import { DEFAULT_ROUTINES } from '../../routines/defaultRoutines';

const SHEET_ID = '1oNoOwHO8qAV41OrQAfmpAqku5Go28RGCdVQ9P9ZE3H4';
const GID = '1227892140';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isForceRefresh = searchParams.get('refresh') === '1' || searchParams.get('refresh') === 'true';

  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}&headers=1`;
    const res = await fetch(url, {
      cache: isForceRefresh ? 'no-store' : 'default',
      next: isForceRefresh ? { revalidate: 0 } : { revalidate: 60 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NextJS Routines Fetcher'
      }
    });

    if (!res.ok) {
      throw new Error(`Google Sheets responded with status ${res.status}`);
    }

    const data = await res.text();
    const txt = data.replace(/^[^{]+/, '').replace(/\);?\s*$/, '');
    const json = JSON.parse(txt);
    const rows = json.table?.rows || [];

    if (!rows || rows.length === 0) {
      throw new Error('No rows found in sheet');
    }

    const items = rows.map((r, index) => {
      const vals = (r.c || []).slice(0, 9).map(cell => cell ? (cell.f || cell.v || '') : '');
      const agent = String(vals[0] || '').trim();
      const time = String(vals[1] || '').trim();
      const day = String(vals[2] || '').trim();
      const routineName = String(vals[3] || '').trim();
      const taskDetail = String(vals[4] || '').trim();
      const targetChannel = String(vals[5] || '').trim();
      const notifyMethod = String(vals[6] || '').trim();
      const lastExecuted = String(vals[7] || '').trim();
      const notes = String(vals[8] || '').trim();

      let timeSort = '99:99';
      const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        timeSort = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      }

      let status = 'normal';
      if (notes.includes('⚠️') || notes.includes('막힘') || notes.includes('미발행')) {
        status = 'warning';
      } else if (notes.includes('성공') || notes.includes('정상') || notes.includes('완료')) {
        status = 'success';
      } else if (notes.includes('대기')) {
        status = 'pending';
      }

      return {
        id: index + 1,
        agent,
        agentClean: agent.replace(/\r?\n/g, ' '),
        time,
        timeSort,
        day,
        routineName,
        taskDetail,
        targetChannel,
        notifyMethod,
        lastExecuted,
        notes,
        status
      };
    });

    return NextResponse.json({
      success: true,
      source: 'live_google_sheets',
      updatedAt: new Date().toISOString(),
      count: items.length,
      items
    });
  } catch (err) {
    console.warn('Google Sheet fetch error, falling back to cached routines:', err.message);
    return NextResponse.json({
      success: true,
      source: 'fallback_cache',
      updatedAt: new Date().toISOString(),
      count: DEFAULT_ROUTINES.length,
      items: DEFAULT_ROUTINES
    });
  }
}
