import { NextResponse } from 'next/server';

const ALLOWED_DOMAINS = [
  /^(.*\.)?pexels\.com$/,
  /^(.*\.)?openverse\.org$/,
  /^(.*\.)?openverse\.engineering$/,
  /^(.*\.)?wordpress\.org$/,
  /^(.*\.)?wp\.com$/,
  /^(.*\.)?oaiusercontent\.com$/,
  /^(.*\.)?openai\.com$/
];

function isDomainAllowed(hostname) {
  return ALLOWED_DOMAINS.some((regex) => regex.test(hostname));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('url 파라미터가 필요합니다.', { status: 400 });
  }

  if (!targetUrl.startsWith('https://')) {
    return new NextResponse('https URL만 허용됩니다.', { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    if (!isDomainAllowed(parsedUrl.hostname)) {
      return new NextResponse('허용되지 않은 이미지 도메인입니다. (CORS 프록시 보안 정책)', { status: 403 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

    const response = await fetch(targetUrl, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return new NextResponse(`원본 이미지 로드 실패 (상태코드: ${response.status})`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24시간 캐시
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err) {
    console.error('[CORS Image Proxy Exception]:', err.message);
    return new NextResponse(`CORS 프록시 실패: ${err.message}`, { status: 500 });
  }
}
