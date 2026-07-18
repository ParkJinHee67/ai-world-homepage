import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// service role을 사용하여 RLS를 우회하고 데이터 관리가 가능한 어드민 객체 생성
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
}) : null;

// 1. 광고 슬롯 조회 API
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get('password');
  const correctPassword = process.env.CARDNEWS_PUBLISH_KEY;

  // 관리자 인증 여부 확인 (환경변수 설정이 유효할 때만 검증 통과)
  const isAdmin = correctPassword && password === correctPassword;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase 어드민 설정이 유효하지 않습니다.' }, { status: 500 });
    }

    let query = supabaseAdmin.from('ad_slots').select('*').order('position', { ascending: true });

    // 일반 공개 모드인 경우 enabled = true만 조회
    if (!isAdmin) {
      query = query.eq('enabled', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. 광고 슬롯 저장/수정 API
export async function POST(req) {
  const correctPassword = process.env.CARDNEWS_PUBLISH_KEY;

  try {
    const body = await req.json();
    const { ad, password } = body;

    // 관리자 비밀번호 검증
    if (!correctPassword || password !== correctPassword) {
      return NextResponse.json({ error: '관리자 인증 비밀번호가 일치하지 않거나 서버 키가 설정되지 않았습니다.' }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase 어드민 설정이 설정되지 않았습니다.' }, { status: 500 });
    }

    if (!ad || typeof ad.position !== 'number') {
      return NextResponse.json({ error: '유효한 광고 데이터가 아닙니다.' }, { status: 400 });
    }

    const adData = {
      position: ad.position,
      type: ad.type,
      title: ad.title || null,
      description: ad.description || ad.desc || null,
      html: ad.html || null,
      image_url: ad.image_url || null,
      link_url: ad.link_url || null,
      price: ad.price || null,
      enabled: ad.enabled !== false
    };

    // position을 unique key로 잡고 upsert 실행
    const { data, error } = await supabaseAdmin
      .from('ad_slots')
      .upsert(adData, { onConflict: 'position' })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
