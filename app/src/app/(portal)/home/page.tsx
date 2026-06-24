'use client';
import { useStudent } from '@/components/DataProvider';
import BottomNav from '@/components/BottomNav';

function gradeClass(grade: string): string {
  if (grade === 'A') return 'A';
  if (grade === 'B') return 'B';
  if (grade === 'C') return 'C';
  if (grade === 'D' || grade === 'E') return 'D';
  return 'default';
}

export default function HomePage() {
  const { data, loading, error } = useStudent();

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="page-header"><div className="skeleton" style={{ height: 28, width: 160 }} /></div>
          <div className="score-card skeleton" style={{ height: 160 }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="text-center mt-16" style={{ color: 'var(--red)' }}>
            {error ?? '데이터를 불러오지 못했어요.'}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const pct = Math.min(100, Math.round((data.totalScore / 100) * 100));
  const gc = gradeClass(data.achievement);

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-title">{data.nickname}님, 안녕하세요!</div>
          <div className="page-header-sub">{data.dept} · {data.grade}학년 {data.classNo}반</div>
        </div>

        {/* 환산총점 카드 */}
        <div className="score-card">
          <div className="score-label">환산 총점</div>
          <div className="score-row">
            <span className="score-number">{data.totalScore}</span>
            <span className="score-unit">점</span>
            <span className={`grade-pill ${gc}`}>{data.achievement || '—'}</span>
          </div>
          <div className="gauge-track">
            <div className="gauge-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
            성취수준 · {data.achieveLevel || '—'}
          </div>
        </div>

        {/* 상담 예정 배너 */}
        {data.needCounsel && (
          <div className="banner counsel mt-12">
            <span>🔔</span>
            <span>선생님 상담이 예정되어 있어요. 상담 탭을 확인해 보세요.</span>
          </div>
        )}

        {/* 기본 정보 */}
        <div className="card mt-12">
          <div className="card-title">진로 정보</div>
          <div className="info-row">
            <span className="info-key">진로 대분류</span>
            <span className="info-val">{data.careerType || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-key">희망 진로</span>
            <span className="info-val">{data.careerHope || '—'}</span>
          </div>
        </div>

        {/* 자격증 */}
        <div className="card mt-12">
          <div className="card-title">자격증</div>
          <div className="info-row">
            <span className="info-key">취득 여부</span>
            <span className="info-val">{data.certStatus || '—'}</span>
          </div>
          {data.certName && (
            <div className="info-row">
              <span className="info-key">대표 자격증</span>
              <span className="info-val">{data.certName}</span>
            </div>
          )}
        </div>

        {/* 관찰 영역 */}
        {data.observeAreas.length > 0 && (
          <div className="card mt-12">
            <div className="card-title">관찰 영역</div>
            <div className="tag-row">
              {data.observeAreas.map(area => (
                <span key={area} className="tag blue">{area}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav counselAlert={data.needCounsel} />
    </div>
  );
}
