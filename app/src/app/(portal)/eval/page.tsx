'use client';
import { useStudent } from '@/components/DataProvider';
import BottomNav from '@/components/BottomNav';
import type { Evaluation } from '@/types';

function EvalCard({ ev, index }: { ev: Evaluation; index: number }) {
  const date = new Date(ev.createdTime).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  return (
    <div className="card mt-12">
      <div className="card-title">
        {index === 0 ? '최근 평가' : `이전 평가 ${index}`} · {date}
      </div>

      <div className="bar-item">
        <div className="bar-header">
          <span className="bar-label">이론</span>
          <span className="bar-val">{ev.theory}점</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill theory" style={{ width: `${Math.min(100, ev.theory)}%` }} />
        </div>
      </div>

      <div className="bar-item">
        <div className="bar-header">
          <span className="bar-label">실기</span>
          <span className="bar-val">{ev.practice}점</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill practice" style={{ width: `${Math.min(100, ev.practice)}%` }} />
        </div>
      </div>

      <div className="bar-item">
        <div className="bar-header">
          <span className="bar-label">환산 총점</span>
          <span className="bar-val" style={{ color: 'var(--primary)' }}>{ev.totalScore}점</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill total" style={{ width: `${Math.min(100, ev.totalScore)}%` }} />
        </div>
      </div>

      <div className="info-row">
        <span className="info-key">성취도</span>
        <span className="info-val">{ev.achievement} · {ev.achieveLevel}</span>
      </div>
      <div className="info-row">
        <span className="info-key">자격증</span>
        <span className="info-val">{ev.certStatus || '—'}</span>
      </div>

      {ev.feedback && (
        <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 4, fontWeight: 600 }}>
            선생님 피드백
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{ev.feedback}</div>
        </div>
      )}
    </div>
  );
}

export default function EvalPage() {
  const { data, loading, error } = useStudent();

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="page-header"><div className="skeleton" style={{ height: 24, width: 120 }} /></div>
          <div className="skeleton mt-12" style={{ height: 220, borderRadius: 18 }} />
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
            {error ?? '데이터 오류'}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-title">평가</div>
          <div className="page-header-sub">전공 이론 · 실기 · 환산 총점</div>
        </div>

        {data.evaluations.length === 0 ? (
          <div className="card mt-12 text-center text-sub" style={{ padding: 32 }}>
            아직 평가 기록이 없어요.
          </div>
        ) : (
          data.evaluations.map((ev, i) => <EvalCard key={ev.id} ev={ev} index={i} />)
        )}
      </div>
      <BottomNav counselAlert={data.needCounsel} />
    </div>
  );
}
