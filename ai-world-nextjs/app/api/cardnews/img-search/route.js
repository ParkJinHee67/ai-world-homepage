import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q || !q.trim()) {
    return NextResponse.json({ error: '검색어(q) 파라미터가 필요합니다.' }, { status: 400 });
  }

  const pexelsKey = req.headers.get('x-user-pexels-key');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    if (pexelsKey && pexelsKey.trim()) {
      // Pexels API 호출
      const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&orientation=portrait&per_page=30`;
      const response = await fetch(pexelsUrl, {
        headers: { Authorization: pexelsKey },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Pexels API 응답 오류 (상태코드: ${response.status})`);
      }

      const data = await response.json();
      const results = (data.photos || []).map((p) => ({
        url: p.src.large2x || p.src.large,
        thumb: p.src.medium,
        width: p.width,
        height: p.height,
        source: 'pexels',
      }));

      return NextResponse.json({ source: 'pexels', results });
    }

    // Openverse 무키 폴백 (익명 요청)
    const openverseUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&aspect_ratio=tall&page_size=20`;
    const response = await fetch(openverseUrl, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Openverse API 응답 오류 (상태코드: ${response.status})`);
    }

    const data = await response.json();
    const results = (data.results || []).map((p) => ({
      url: p.url,
      thumb: p.thumbnail || p.url,
      width: p.width,
      height: p.height,
      source: 'openverse',
    }));

    return NextResponse.json({ source: 'openverse', results });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[ImgSearch Proxy Error]:', err.message);
    return NextResponse.json(
      { error: `이미지 검색 실패: ${err.message}` },
      { status: 500 }
    );
  }
}
