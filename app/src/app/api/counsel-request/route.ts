import { NextRequest, NextResponse } from 'next/server';
import { getSessionHakbun } from '@/lib/session';
import { getStudent, createCounselRequest } from '@/lib/notion';

const ALLOWED_TYPES = ['진로', '학업', '생활', '기타'];

export async function POST(req: NextRequest) {
  const hakbun = getSessionHakbun();
  if (!hakbun) {
    return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, content } = body as { type: string; content: string };

    if (!type || !content) {
      return NextResponse.json({ error: '유형과 내용을 입력해 주세요.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: '올바른 상담 유형을 선택해 주세요.' }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: '내용은 1000자 이내로 입력해 주세요.' }, { status: 400 });
    }

    const student = await getStudent(hakbun);
    if (!student) {
      return NextResponse.json({ error: '학생 정보를 찾을 수 없어요.' }, { status: 404 });
    }

    await createCounselRequest(hakbun, type, content, student.pageId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[counsel-request]', e);
    return NextResponse.json({ error: '상담 신청 중 오류가 발생했어요.' }, { status: 500 });
  }
}
