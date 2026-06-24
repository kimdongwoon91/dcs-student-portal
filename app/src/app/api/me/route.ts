import { NextResponse } from 'next/server';
import { getSessionHakbun } from '@/lib/session';
import { getStudent, getEvaluations, getRecords, getProjects, getCounsels } from '@/lib/notion';
import { getNickname } from '@/lib/supabase';

export async function GET() {
  const hakbun = getSessionHakbun();
  if (!hakbun) {
    return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 });
  }

  try {
    const [student, evaluations, records, projects, counsels, nickname] = await Promise.all([
      getStudent(hakbun),
      getEvaluations(hakbun),
      getRecords(hakbun),
      getProjects(hakbun),
      getCounsels(hakbun),
      getNickname(hakbun),
    ]);

    if (!student) {
      return NextResponse.json({ error: '학생 정보를 찾을 수 없어요.' }, { status: 404 });
    }

    // NOTE: student.pageId and any name fields are intentionally excluded from the response
    return NextResponse.json({
      data: {
        nickname,
        dept: student.dept,
        grade: student.grade,
        classNo: student.classNo,
        number: student.number,
        careerType: student.careerType,
        careerHope: student.careerHope,
        achievement: student.achievement,
        achieveLevel: student.achieveLevel,
        totalScore: student.totalScore,
        certStatus: student.certStatus,
        certName: student.certName,
        needCounsel: student.needCounsel,
        observeAreas: student.observeAreas,
        evaluations,
        records,
        projects,
        counsels,
      },
    });
  } catch (e) {
    console.error('[me]', e);
    return NextResponse.json({ error: '데이터를 불러오지 못했어요.' }, { status: 500 });
  }
}
