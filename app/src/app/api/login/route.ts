import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { findAccountsByNameHash } from '@/lib/supabase';
import { setSessionCookie } from '@/lib/session';

function hashName(name: string): string {
  return createHash('sha256').update(name.trim().replace(/\s+/g, '')).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, password, hakbun: hakbunHint } = body as {
      name: string;
      password: string;
      hakbun?: string;
    };

    if (!name || !password) {
      return NextResponse.json({ error: '이름과 비밀번호를 입력해 주세요.' }, { status: 400 });
    }

    const nameHash = hashName(name);
    let candidates = await findAccountsByNameHash(nameHash);

    if (!candidates.length) {
      return NextResponse.json({ error: '이름 또는 비밀번호가 맞지 않아요.' }, { status: 401 });
    }

    // If hakbun hint provided (동명이인 disambiguation)
    if (hakbunHint) {
      candidates = candidates.filter(c => c.hakbun === hakbunHint);
    }

    const matches: typeof candidates = [];
    for (const c of candidates) {
      if (await bcrypt.compare(password, c.password_hash)) matches.push(c);
    }

    if (matches.length === 0) {
      return NextResponse.json({ error: '이름 또는 비밀번호가 맞지 않아요.' }, { status: 401 });
    }

    if (matches.length > 1) {
      // Extremely rare: 동명이인 + same password
      return NextResponse.json(
        { error: '동명이인 확인이 필요해요. 학번을 함께 입력해 주세요.', needHakbun: true },
        { status: 409 }
      );
    }

    setSessionCookie(matches[0].hakbun);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[login]', e);
    return NextResponse.json({ error: '서버 오류가 발생했어요.' }, { status: 500 });
  }
}
