import { NextResponse } from 'next/server';

async function validateAnthropic(key) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }]
      })
    });
    // 키가 유효하면 200이거나, 크레딧이 없는 등의 이유로 400이 올 수 있으나 
    // 키 자체가 잘못된 경우(401 Unauthorized 등)가 아니면 유효하다고 판단한다.
    if (res.status === 401 || res.status === 403) {
      return { valid: false, message: '유효하지 않은 API 키입니다. (인증 실패)' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, message: e.message };
  }
}

async function validateGemini(key) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (!res.ok) {
      return { valid: false, message: `Gemini 키 검증 실패 (상태코드: ${res.status})` };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, message: e.message };
  }
}

async function validateOpenAI(key) {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    if (!res.ok) {
      return { valid: false, message: `OpenAI 키 검증 실패 (상태코드: ${res.status})` };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, message: e.message };
  }
}

async function validatePexels(key) {
  try {
    const res = await fetch('https://api.pexels.com/v1/search?query=nature&per_page=1', {
      headers: { Authorization: key }
    });
    if (!res.ok) {
      return { valid: false, message: `Pexels 키 검증 실패 (상태코드: ${res.status})` };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, message: e.message };
  }
}

export async function POST(req) {
  try {
    const { vendor, key } = await req.json();
    if (!vendor || !key || !key.trim()) {
      return NextResponse.json({ error: 'vendor 및 key 파라미터가 필요합니다.' }, { status: 400 });
    }

    let result = { valid: false, message: '알 수 없는 벤더' };
    const cleanedKey = key.trim();

    if (vendor === 'anthropic') {
      result = await validateAnthropic(cleanedKey);
    } else if (vendor === 'gemini') {
      result = await validateGemini(cleanedKey);
    } else if (vendor === 'openai') {
      result = await validateOpenAI(cleanedKey);
    } else if (vendor === 'pexels') {
      result = await validatePexels(cleanedKey);
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ valid: false, message: err.message }, { status: 500 });
  }
}
