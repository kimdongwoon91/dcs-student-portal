import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { verifyStudent } from '@/lib/notion';
import { findAccountByHakbun, createAccount } from '@/lib/supabase';
import { setSessionCookie } from '@/lib/session';

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, '');
}

function hashName(name: string): string {
  return createHash('sha256').update(normalizeName(name)).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, hakbun, nickname, password } = body as {
      name: string;
      hakbun: string;
      nickname: string;
      password: string;
    };

    if (!name || !hakbun || !nickname || !password) {
      return NextResponse.json({ error: '모든 항목을 입력해 주세요.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 해요.' }, { status: 400 });
    }

    const exists = await verifyStudent(normalizeName(name), hakbun);
    if (!exists) {
      return NextResponse.json(
        { error: '학생 정보를 찾을 수 없어요. 이름과 학번을 확인해 주세요.' },
        { status: 404 }
      );
    }

    const existing = await findAccountByHakbun(hakbun);
    if (existing) {
      return NextResponse.json({ error: '이미 가입된 학번이에요.' }, { status: 409 });
    }

    const nameHash = hashName(name);
    const passwordHash = await bcrypt.hash(password, 10);
    await createAccount(hakbun, nameHash, passwordHash, nickname);

    setSessionCookie(hakbun);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[register]', e);
    return NextResponse.json({ error: '서버 오류가 발생했어요.' }, { status: 500 });
  }
}
