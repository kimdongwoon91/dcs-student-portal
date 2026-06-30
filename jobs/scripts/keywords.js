'use strict';

// 학과별 전공 키워드 매핑
const DEPARTMENTS = {
  '모빌리티과': [
    '기계', '기계직', '자동차', '차량', '정비', '운전', '금속', '생산',
    '제조', '용접', '설비', '기관직', '공업직', '기계설비', '자동차정비',
  ],
  '전기배터리과': [
    '전기', '전기직', '전자', '전자직', '배터리', '반도체', '정보통신',
    '전산', '통신', '전기전자', '정보기술', 'IT', '전기기사', '전기산업기사',
  ],
  '건축리모델링과': [
    '건축', '건축직', '건설', '시설', '시설직', '인테리어', '도시',
    '조경', '환경', '건축기사', '건축사', '건설관리', '시설관리',
  ],
  '드론지형정보과': [
    '토목', '토목직', '측량', '측량직', '지적', '지적직', '지형정보',
    '공간정보', '드론', '무인항공기', 'GIS', 'GNSS', '도로', '도로직',
    '도시계획', '토목기사', '측량기사', '지적기사',
  ],
};

// 학력 허용 키워드 (이 중 하나라도 포함이면 통과)
const EDUCATION_PASS_KEYWORDS = [
  '고졸', '고등학교 졸업', '고등학교졸업', '고등학교 이상',
  '학력무관', '학력 무관', '학력제한없음', '학력 제한 없음',
  '학력불문', '제한없음', '학력무관', '초졸이상', '중졸이상',
];

// 학력 차단 키워드 (이게 있으면 대졸 이상 요구로 판단)
const EDUCATION_BLOCK_KEYWORDS = [
  '대졸', '대학교 졸업', '대학졸업', '대학원', '석사', '박사',
  '4년제', '전문대 이상', '대졸이상',
];

/**
 * 텍스트에서 매칭되는 학과 목록 반환
 * @param {string} text - 공고 제목 + 응시자격 합친 텍스트
 * @returns {string[]}
 */
function matchDepartments(text) {
  const result = [];
  for (const [dept, keywords] of Object.entries(DEPARTMENTS)) {
    if (keywords.some(kw => text.includes(kw))) {
      result.push(dept);
    }
  }
  return result;
}

/**
 * 텍스트에서 학력 조건 판단
 * @param {string} text
 * @returns {'고졸' | '학력무관' | '기타'}
 */
function matchEducation(text) {
  const hasBlock = EDUCATION_BLOCK_KEYWORDS.some(kw => text.includes(kw));
  if (hasBlock) return '기타';

  const hasPass = EDUCATION_PASS_KEYWORDS.some(kw => text.includes(kw));
  if (hasPass) {
    if (text.includes('학력무관') || text.includes('학력 무관') || text.includes('학력제한없음') || text.includes('제한없음')) {
      return '학력무관';
    }
    return '고졸';
  }
  return '기타';
}

module.exports = { DEPARTMENTS, matchDepartments, matchEducation, EDUCATION_PASS_KEYWORDS };
