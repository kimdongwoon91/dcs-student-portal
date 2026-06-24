'use client';
import { useStudent } from '@/components/DataProvider';
import BottomNav from '@/components/BottomNav';

export default function RecordPage() {
  const { data, loading, error } = useStudent();

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="page-header"><div className="skeleton" style={{ height: 24, width: 100 }} /></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton mt-12" style={{ height: 80, borderRadius: 10 }} />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="text-center mt-16" style={{ color: 'var(--red)' }}>{error ?? '데이터 오류'}</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-title">성장 기록</div>
          <div className="page-header-sub">생활기록부 타임라인</div>
        </div>

        {data.records.length === 0 ? (
          <div className="card mt-12 text-center text-sub" style={{ padding: 32 }}>
            아직 기록이 없어요.
          </div>
        ) : (
          <div className="card mt-12">
            <div className="timeline">
              {data.records.map(rec => (
                <div key={rec.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-date">{rec.date || '날짜 미기재'}</div>
                  <div style={{ marginBottom: 6 }}>
                    {rec.observeArea && <span className="tag blue" style={{ fontSize: 11 }}>{rec.observeArea}</span>}
                    {rec.dept && <span className="tag" style={{ fontSize: 11, marginLeft: 4 }}>{rec.dept}</span>}
                  </div>
                  <div className="timeline-content">{rec.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav counselAlert={data.needCounsel} />
    </div>
  );
}
