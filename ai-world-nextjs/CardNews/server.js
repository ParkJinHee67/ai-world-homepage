#!/usr/bin/env node
'use strict';
/**
 * 카드뉴스 로컬 서버 (AI 브리지)
 * - Node.js 내장 모듈만 사용 (의존성 0)
 * - 포트 8787, 0.0.0.0 바인드 (LAN 공유)
 * - M4 범위: 정적 서빙 / GET /ping / POST /convert (claude -p 브리지)
 *   img-gen, img-search, img 프록시는 M5에서 구현 (지금은 501 스텁)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { URL } = require('url');
const https = require('https');
const crypto = require('crypto');

/* ---------------- https 헬퍼 (내장 https 모듈만 사용) ---------------- */
function httpsRequest(urlStr, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method, headers },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
async function httpsJSON(urlStr, opts = {}) {
  const res = await httpsRequest(urlStr, opts);
  let parsed = null;
  try { parsed = JSON.parse(res.body.toString('utf-8')); } catch (e) { /* not JSON */ }
  return { ...res, json: parsed };
}


const PORT = 8787;
const ROOT = __dirname;
const EDITOR_DIR = path.join(ROOT, 'editor');
const TOOLS_DIR = path.join(ROOT, 'tools');
const DECK_PROMPT_PATH = path.join(TOOLS_DIR, 'deck-prompt.md');
const GEN_DIR = path.join(EDITOR_DIR, 'assets', 'gen');
if (!fs.existsSync(GEN_DIR)) fs.mkdirSync(GEN_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...headers,
  });
  res.end(body);
}
function sendJSON(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}

/* ---------------- 기능 감지 (키 파일은 요청마다 재로딩) ---------------- */
function readKeyFile(name) {
  try {
    const p = path.join(TOOLS_DIR, name);
    if (!fs.existsSync(p)) return null;
    const lines = fs.readFileSync(p, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    const key = lines[0];
    if (!key || key.startsWith('여기에')) return null; // 플레이스홀더 무시
    const modelOverride = (lines[1] && !lines[1].startsWith('여기에')) ? lines[1] : null;
    return { key, modelOverride };
  } catch (e) {
    return null;
  }
}
function detectCodex() {
  try {
    const authPath = path.join(os.homedir(), '.codex', 'auth.json');
    return fs.existsSync(authPath);
  } catch (e) {
    return false;
  }
}

/* ---------------- GET /ping ---------------- */
function handlePing(req, res) {
  sendJSON(res, 200, {
    ok: true,
    codex: detectCodex(),
    gemini: !!readKeyFile('gemini-key.txt'),
    openai: !!readKeyFile('openai-key.txt'),
    pexels: !!readKeyFile('pexels-key.txt'),
  });
}

/* ---------------- 정적 파일 서빙 (path traversal 방어) ---------------- */
function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(EDITOR_DIR, rel));
  if (!filePath.startsWith(EDITOR_DIR)) {
    send(res, 403, 'Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  });
}

/* ---------------- 요청 본문 읽기 ---------------- */
function readBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > maxBytes) {
        reject(new Error('요청 본문이 너무 큽니다.'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

/* ---------------- JSON 추출 & 검증 ---------------- */
function extractJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('AI 응답에서 JSON 객체를 찾지 못했습니다.');
  }
  return JSON.parse(text.slice(start, end + 1));
}
function validateDeck(deck) {
  if (!deck || !Array.isArray(deck.slides) || !deck.slides.length) {
    throw new Error('slides 배열이 비어있거나 없습니다.');
  }
  const validTypes = ['cover', 'content', 'quote', 'table', 'closing'];
  deck.slides.forEach((s, i) => {
    if (!validTypes.includes(s.type)) throw new Error(`슬라이드 ${i + 1}: 알 수 없는 타입 "${s.type}"`);
    if (!s.f || typeof s.f !== 'object') throw new Error(`슬라이드 ${i + 1}: f 필드가 없습니다.`);
  });
  return deck;
}

/* ---------------- POST /convert — claude -p 브리지 ---------------- */
async function handleConvert(req, res) {
  try {
    const body = await readBody(req);
    let text;
    try {
      ({ text } = JSON.parse(body || '{}'));
    } catch (e) {
      return sendJSON(res, 400, { error: '요청 본문이 올바른 JSON이 아닙니다.' });
    }
    if (!text || !text.trim()) return sendJSON(res, 400, { error: 'text가 비어있습니다.' });

    if (!fs.existsSync(DECK_PROMPT_PATH)) {
      return sendJSON(res, 500, { error: 'tools/deck-prompt.md 를 찾을 수 없습니다.' });
    }
    const promptTemplate = fs.readFileSync(DECK_PROMPT_PATH, 'utf-8');
    const fullPrompt = promptTemplate + '\n\n---\n\n[원문]\n' + text;

    // 호스트의 Claude 구독(로그인된 claude CLI)을 그대로 사용. API 키 불필요.
    const child = spawn('claude', ['-p'], { shell: true });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d.toString(); });
    child.stderr.on('data', (d) => { err += d.toString(); });
    // ⚠️ 프롬프트는 반드시 stdin으로 전달 (인자로 넘기면 shell:true 환경에서 인용부호가 깨짐)
    child.stdin.write(fullPrompt);
    child.stdin.end();

    const code = await new Promise((resolve) => child.on('close', resolve));
    if (code !== 0 && !out.trim()) {
      return sendJSON(res, 500, {
        error: `claude -p 실행에 실패했습니다 (exit ${code}). start.bat이 켜져 있고, claude CLI에 로그인되어 있는지 확인해주세요.`,
        detail: err.slice(0, 500),
      });
    }

    let deck;
    try {
      deck = extractJSON(out);
      validateDeck(deck);
    } catch (parseErr) {
      return sendJSON(res, 500, {
        error: 'AI 응답을 JSON으로 파싱하지 못했습니다: ' + parseErr.message,
        raw: out.slice(0, 800),
      });
    }
    sendJSON(res, 200, deck);
  } catch (e) {
    sendJSON(res, 500, { error: e.message });
  }
}

/* ---------------- GET /img-search — Pexels(키 있으면) / Openverse(무키 폴백) ---------------- */
async function handleImgSearch(req, res, query) {
  const q = query.get('q');
  if (!q || !q.trim()) return sendJSON(res, 400, { error: 'q 파라미터가 필요합니다.' });

  const pexels = readKeyFile('pexels-key.txt');
  try {
    if (pexels) {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&orientation=portrait&per_page=30`;
      const r = await httpsJSON(url, { headers: { Authorization: pexels.key } });
      if (r.status !== 200 || !r.json) throw new Error(`Pexels 응답 오류 (${r.status})`);
      const results = (r.json.photos || []).map((p) => ({
        url: p.src.large2x || p.src.large, thumb: p.src.medium, width: p.width, height: p.height, source: 'pexels',
      }));
      return sendJSON(res, 200, { source: 'pexels', results });
    }
    // Openverse 무키 폴백 — 익명 요청은 page_size 최대 20
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&aspect_ratio=tall&page_size=20`;
    const r = await httpsJSON(url);
    if (r.status !== 200 || !r.json) throw new Error(`Openverse 응답 오류 (${r.status})`);
    const results = (r.json.results || []).map((p) => ({
      url: p.url, thumb: p.thumbnail || p.url, width: p.width, height: p.height, source: 'openverse',
    }));
    return sendJSON(res, 200, { source: 'openverse', results });
  } catch (e) {
    sendJSON(res, 500, { error: '이미지 검색 실패: ' + e.message });
  }
}

/* ---------------- GET /img?url= — CORS 프록시 (https만, 24h 캐시) ---------------- */
const imgCache = new Map(); // urlHash -> { buf, contentType, expiresAt }
function cacheKey(u) { return crypto.createHash('sha1').update(u).digest('hex'); }

async function handleImgProxy(req, res, query) {
  const target = query.get('url');
  if (!target) return send(res, 400, 'url 파라미터가 필요합니다.');
  if (!target.startsWith('https://')) return send(res, 400, 'https URL만 허용됩니다.');

  const key = cacheKey(target);
  const cached = imgCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return send(res, 200, cached.buf, { 'Content-Type': cached.contentType, 'Cache-Control': 'public, max-age=86400' });
  }
  try {
    const r = await httpsRequest(target);
    if (r.status !== 200) return send(res, r.status, 'Upstream error');
    const contentType = r.headers['content-type'] || 'image/jpeg';
    imgCache.set(key, { buf: r.body, contentType, expiresAt: Date.now() + 24 * 3600 * 1000 });
    send(res, 200, r.body, { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' });
  } catch (e) {
    send(res, 500, '프록시 실패: ' + e.message);
  }
}

/* ---------------- POST /img-gen — Codex(OAuth) > Gemini(키) > OpenAI(키) ---------------- */
function genFilename() {
  return `gen-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.png`;
}

async function genWithCodex(prompt) {
  const outName = genFilename();
  const outPath = path.join(GEN_DIR, outName);
  const instruction = `$imagegen\n다음 장면을 1024x1536(세로) 사진처럼 생성해서 정확히 이 경로에 PNG로 저장하세요: ${outPath}\n장면 설명: ${prompt}\n글자, 로고, 텍스트는 절대 포함하지 마세요.`;

  await new Promise((resolve, reject) => {
    // ⚠️ 프롬프트는 반드시 stdin으로 전달 (shell:true 인자 전달 시 인용부호가 깨짐)
    const child = spawn('codex', ['exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', '-'], { shell: true });
    let err = '';
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.stdin.write(instruction);
    child.stdin.end();
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`codex exec 실패 (exit ${code}): ${err.slice(0, 300)}`))));
    child.on('error', reject);
  });

  if (!fs.existsSync(outPath)) throw new Error('codex가 이미지를 생성했지만 예상 경로에서 파일을 찾지 못했습니다.');
  return `assets/gen/${outName}`;
}

async function genWithGemini(prompt) {
  const cfg = readKeyFile('gemini-key.txt');
  if (!cfg) throw new Error('gemini 키 없음');
  const models = [cfg.modelOverride || 'gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image'];
  let lastErr;
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cfg.key}`;
      const body = JSON.stringify({
        contents: [{ parts: [{ text: `${prompt}. No text, no logos, no watermarks.` }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } },
      });
      const r = await httpsJSON(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (r.status === 404) { lastErr = new Error(`모델 ${model} 404`); continue; }
      if (r.status !== 200 || !r.json) throw new Error(`Gemini 응답 오류 (${r.status})`);
      const parts = r.json.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find((p) => p.inlineData?.data);
      if (!imgPart) throw new Error('Gemini 응답에 이미지 데이터가 없습니다.');
      const outName = genFilename();
      fs.writeFileSync(path.join(GEN_DIR, outName), Buffer.from(imgPart.inlineData.data, 'base64'));
      return `assets/gen/${outName}`;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Gemini 생성 실패');
}

async function genWithOpenAI(prompt) {
  const cfg = readKeyFile('openai-key.txt');
  if (!cfg) throw new Error('openai 키 없음');
  const model = cfg.modelOverride || 'gpt-image-2';
  const url = 'https://api.openai.com/v1/images/generations';
  const body = JSON.stringify({ model, prompt: `${prompt}. No text, no logos, no watermarks.`, size: '1024x1536', quality: 'medium' });
  const r = await httpsJSON(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` }, body });
  if (r.status !== 200 || !r.json) throw new Error(`OpenAI 응답 오류 (${r.status}): ${JSON.stringify(r.json || {}).slice(0, 200)}`);
  const b64 = r.json.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI 응답에 이미지 데이터가 없습니다.');
  const outName = genFilename();
  fs.writeFileSync(path.join(GEN_DIR, outName), Buffer.from(b64, 'base64'));
  return `assets/gen/${outName}`;
}

async function handleImgGen(req, res) {
  try {
    const body = await readBody(req);
    let prompt, provider;
    try { ({ prompt, provider } = JSON.parse(body || '{}')); } catch (e) { return sendJSON(res, 400, { error: '본문이 올바른 JSON이 아닙니다.' }); }
    if (!prompt || !prompt.trim()) return sendJSON(res, 400, { error: 'prompt가 비어있습니다.' });

    const order = provider ? [provider] : ['codex', 'gemini', 'openai'];
    const attempts = { codex: () => genWithCodex(prompt), gemini: () => genWithGemini(prompt), openai: () => genWithOpenAI(prompt) };

    let lastErr;
    for (const key of order) {
      if (key === 'codex' && !detectCodex()) continue;
      if (key === 'gemini' && !readKeyFile('gemini-key.txt')) continue;
      if (key === 'openai' && !readKeyFile('openai-key.txt')) continue;
      try {
        const relPath = await attempts[key]();
        return sendJSON(res, 200, { provider: key, path: relPath });
      } catch (e) { lastErr = e; console.error(`[img-gen:${key}]`, e.message); }
    }
    sendJSON(res, 503, { error: '사용 가능한 이미지 생성 수단이 없습니다 (codex/gemini/openai 모두 실패 또는 미설정). ' + (lastErr ? lastErr.message : '') });
  } catch (e) {
    sendJSON(res, 500, { error: e.message });
  }
}


/* ---------------- 라우터 ---------------- */
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);
  const pathname = u.pathname;

  if (req.method === 'OPTIONS') { send(res, 204, ''); return; }

  if (pathname === '/ping' && req.method === 'GET') return handlePing(req, res);
  if (pathname === '/convert' && req.method === 'POST') return handleConvert(req, res);
  if (pathname === '/img-gen' && req.method === 'POST') return handleImgGen(req, res);
  if (pathname === '/img-search' && req.method === 'GET') return handleImgSearch(req, res, u.searchParams);
  if (pathname === '/img' && req.method === 'GET') return handleImgProxy(req, res, u.searchParams);

  if (req.method === 'GET') return serveStatic(req, res, pathname);
  send(res, 404, 'Not Found');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n⚠️  포트 ${PORT}번이 이미 사용 중입니다. 다른 프로그램을 종료하거나 잠시 후 다시 시도해주세요.\n`);
    process.exit(1);
  }
  console.error(e);
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const addrs = ['http://localhost:' + PORT];
  Object.values(nets).flat().forEach((n) => {
    if (n && n.family === 'IPv4' && !n.internal) addrs.push(`http://${n.address}:${PORT}`);
  });
  console.log('\n📇 카드뉴스 서버가 시작되었습니다.\n');
  addrs.forEach((a) => console.log('   ' + a));
  console.log('\n기능 감지:');
  console.log('   codex(ChatGPT 구독 이미지):', detectCodex() ? '✅' : '❌ (~/.codex/auth.json 없음)');
  console.log('   gemini 키:', readKeyFile('gemini-key.txt') ? '✅' : '❌ (tools/gemini-key.txt 없음)');
  console.log('   openai 키:', readKeyFile('openai-key.txt') ? '✅' : '❌ (tools/openai-key.txt 없음)');
  console.log('   pexels 키:', readKeyFile('pexels-key.txt') ? '✅' : '❌ (tools/pexels-key.txt 없음, Openverse로 폴백)');
  console.log('\n종료하려면 Ctrl+C\n');
});
