import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// service role을 사용하여 RLS를 우회하고 스토리지/테이블 관리가 가능한 어드민 객체 생성
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
}) : null;

export async function POST(req) {
  // 환경변수에서 발행용 비밀번호 확인
  const correctPassword = process.env.CARDNEWS_PUBLISH_KEY || 'aimax123';

  try {
    const contentType = req.headers.get('content-type') || '';
    
    // FormData 수신 (이미지 업로드 단계)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const action = formData.get('action');
      const password = formData.get('password');
      const deckId = formData.get('deckId');
      const index = formData.get('index');
      
      // 비밀번호 검증
      if (password !== correctPassword) {
        return NextResponse.json({ error: '발행 비밀번호가 일치하지 않습니다.' }, { status: 403 });
      }

      if (action === 'upload_image') {
        const file = formData.get('file');
        if (!file) {
          return NextResponse.json({ error: '업로드할 이미지 파일이 없습니다.' }, { status: 400 });
        }

        // Mock 모드 대응 (Supabase 연결이 없는 경우)
        if (!supabaseAdmin) {
          // 파일을 base64 형식으로 읽어서 반환
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64Data = buffer.toString('base64');
          const dataUrl = `data:image/webp;base64,${base64Data}`;
          return NextResponse.json({ url: dataUrl });
        }

        // Supabase Storage 업로드 실행
        const fileName = `${deckId}/${index}.webp`;
        const fileBuffer = await file.arrayBuffer();

        const { data, error } = await supabaseAdmin.storage
          .from('cardnews')
          .upload(fileName, fileBuffer, {
            contentType: 'image/webp',
            upsert: true
          });

        if (error) {
          throw new Error(`스토리지 업로드 실패: ${error.message}`);
        }

        // Public URL 가져오기
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('cardnews')
          .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
      }
    }

    // JSON 수신 (덱 메타데이터 등록 단계, 조회수 증가 또는 삭제 단계)
    const body = await req.json();
    const { action, password } = body;

    // 조회수 증가는 비밀번호 검증 우회
    if (action === 'increment_view') {
      const { deckId } = body;
      if (!deckId) return NextResponse.json({ error: 'deckId가 누락되었습니다.' }, { status: 400 });

      if (!supabaseAdmin) {
        return NextResponse.json({ success: true });
      }

      // RPC 호출 시도 후 에러 시 단일 쿼리로 폴백
      const { error } = await supabaseAdmin.rpc('increment_view_count', { deck_id: deckId });
      if (error) {
        try {
          const { data: deck } = await supabaseAdmin.from('cardnews_decks').select('view_count').eq('id', deckId).single();
          if (deck) {
            await supabaseAdmin.from('cardnews_decks').update({ view_count: (deck.view_count || 0) + 1 }).eq('id', deckId);
          }
        } catch (e) {
          console.warn('Fallback increment failed:', e.message);
        }
      }
      return NextResponse.json({ success: true });
    }

    // 그 외(등록, 삭제)는 비밀번호 검증 필수
    if (password !== correctPassword) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 403 });
    }

    // 덱 등록
    if (action === 'create_deck') {
      const { deckId, title, description, style, cardCount, coverUrl, imageUrls } = body;

      if (!title || !title.trim()) {
        return NextResponse.json({ error: '제목은 필수 항목입니다.' }, { status: 400 });
      }

      // Mock 모드 대응
      if (!supabaseAdmin) {
        // 로컬 목스토리지 추가를 위해 더미 성공 처리
        return NextResponse.json({ 
          success: true, 
          deck: { id: deckId, title, description, style, card_count: cardCount, cover_url: coverUrl, image_urls: imageUrls, status: 'published', view_count: 0, created_at: new Date().toISOString() } 
        });
      }

      const { data, error } = await supabaseAdmin
        .from('cardnews_decks')
        .insert([{
          id: deckId,
          title,
          description,
          style,
          card_count: cardCount,
          cover_url: coverUrl,
          image_urls: imageUrls,
          status: 'published',
          view_count: 0
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`DB 등록 실패: ${error.message}`);
      }

      return NextResponse.json({ success: true, deck: data });
    }

    // 덱 삭제 (이미지와 DB 행 동시 정리)
    if (action === 'delete_deck') {
      const { deckId } = body;
      if (!deckId) return NextResponse.json({ error: 'deckId가 누락되었습니다.' }, { status: 400 });

      // Mock 모드 대응
      if (!supabaseAdmin) {
        return NextResponse.json({ success: true });
      }

      // 1. Storage 파일들 삭제하기 위해 리스트 조회
      const { data: fileList, error: listErr } = await supabaseAdmin.storage
        .from('cardnews')
        .list(deckId);

      if (fileList && fileList.length > 0) {
        const filesToRemove = fileList.map(f => `${deckId}/${f.name}`);
        const { error: removeErr } = await supabaseAdmin.storage
          .from('cardnews')
          .remove(filesToRemove);
        
        if (removeErr) console.warn('[Storage Delete Warning]:', removeErr.message);
      }

      // 2. DB 행 삭제
      const { error: dbErr } = await supabaseAdmin
        .from('cardnews_decks')
        .delete()
        .eq('id', deckId);

      if (dbErr) {
        throw new Error(`DB 삭제 실패: ${dbErr.message}`);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '지원하지 않는 액션입니다.' }, { status: 400 });

  } catch (err) {
    console.error('[Publish API Exception]:', err.message);
    return NextResponse.json(
      { error: `발행 처리 실패: ${err.message}` },
      { status: 500 }
    );
  }
}
