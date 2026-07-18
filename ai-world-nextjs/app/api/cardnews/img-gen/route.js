import { NextResponse } from 'next/server';

async function generateWithGemini(prompt, userKey) {
  const models = ['imagen-3.0-generate-002', 'gemini-2.5-flash-image'];
  let lastErr = null;

  for (const model of models) {
    try {
      let url, body;
      if (model.includes('imagen')) {
        // 정식 Imagen API 호출 규격
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImages?key=${userKey}`;
        body = JSON.stringify({
          numberOfImages: 1,
          prompt: `${prompt}. No text, no logos, no watermarks, professional graphic design, aspect ratio 4:5`,
          aspectRatio: '4:5',
          outputMimeType: 'image/jpeg',
        });
      } else {
        // 기존 server.js의 generateContent 멀티모달 이미지 출력 규격
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userKey}`;
        body = JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}. No text, no logos, no watermarks.` }] }],
          generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } },
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini ${model} 에러 (${response.status}): ${errText}`);
      }

      const resJson = await response.json();
      
      if (model.includes('imagen')) {
        const b64Data = resJson.generatedImages?.[0]?.image?.imageBytes;
        if (!b64Data) throw new Error('Imagen 응답에 이미지 데이터가 없습니다.');
        return `data:image/jpeg;base64,${b64Data}`;
      } else {
        const parts = resJson.candidates?.[0]?.content?.parts || [];
        const imgPart = parts.find((p) => p.inlineData?.data);
        if (!imgPart) throw new Error('Gemini generateContent 응답에 이미지 데이터가 없습니다.');
        return `data:image/jpeg;base64,${imgPart.inlineData.data}`;
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Gemini 이미지 생성 실패');
}

async function generateWithOpenAI(prompt, userKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${prompt}. No text, no logos, no watermarks.`,
        n: 1,
        size: '1024x1792', // 세로형 이미지 생성
        response_format: 'url',
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson.error?.message || `OpenAI 에러 (상태코드: ${response.status})`;
      throw new Error(errMsg);
    }

    const resJson = await response.json();
    const url = resJson.data?.[0]?.url;
    if (!url) throw new Error('OpenAI 응답에 이미지 URL이 없습니다.');
    return url;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

export async function POST(req) {
  try {
    const { prompt, provider } = await req.json();
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: '장면 설명(prompt)이 비어있습니다.' }, { status: 400 });
    }

    const geminiKey = req.headers.get('x-user-gemini-key');
    const openaiKey = req.headers.get('x-user-openai-key');

    const selectedProvider = provider || (geminiKey ? 'gemini' : (openaiKey ? 'openai' : null));
    if (!selectedProvider) {
      return NextResponse.json(
        { error: '설정에서 Gemini 또는 OpenAI API 키를 먼저 확인해주세요.' },
        { status: 400 }
      );
    }

    if (selectedProvider === 'gemini') {
      if (!geminiKey) return NextResponse.json({ error: 'Gemini API 키가 설정되지 않았습니다.' }, { status: 400 });
      const b64Image = await generateWithGemini(prompt, geminiKey);
      return NextResponse.json({ provider: 'gemini', path: b64Image });
    } else if (selectedProvider === 'openai') {
      if (!openaiKey) return NextResponse.json({ error: 'OpenAI API 키가 설정되지 않았습니다.' }, { status: 400 });
      const imgUrl = await generateWithOpenAI(prompt, openaiKey);
      return NextResponse.json({ provider: 'openai', path: imgUrl });
    }

    return NextResponse.json({ error: '지원하지 않는 생성 엔진입니다.' }, { status: 400 });
  } catch (err) {
    console.error('[AI ImgGen Route Handler Exception]:', err.message);
    return NextResponse.json(
      { error: `이미지 생성 실패: ${err.message}` },
      { status: 500 }
    );
  }
}
