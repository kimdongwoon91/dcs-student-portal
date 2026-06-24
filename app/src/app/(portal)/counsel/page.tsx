'use client';
import { useState } from 'react';
import { useStudent } from '@/components/DataProvider';
import BottomNav from '@/components/BottomNav';
import type { Counsel } from '@/types';

const COUNSEL_TYPES = ['진로', '학업', '생활', '기타'];

function typeColor(type: string): string {
  if (type === '진로') return 'var(--blue)';
  if (type === '학업') return 'var(--green)';
  if (type === '생활') return 'var(--amber)';
  return 'var(--text-sub)';
}

function CounselItem({ c }: { c: Counsel }) {
  return (
    <div className="counsel-item">
      <div className="counsel-type-bar" style={{ backgroundColor: typeColor(c.type) }} />
      <div style={{ flex: 1 }}>
        <div className="counsel-meta">
          <span className="tag" style={{ fontSize: 11, padding: '2px 7px', background: 'var(--bg)' }}>{c.type || '상담'}</span>
          <span style={{ marginLeft: 6 }}>{c.date || '날짜 미기재'}</span>
        </div>
        <div className="counsel-title-text">{c.title}</div>
        {c.followUp && (
          <div className="counsel-follow">후속조치: {c.followUp}</div>
        )}
      </div>
    </div>
  );
}

function CounselSheet({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState('진로');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!content.trim()) { setError('내용을 입력해 주세요.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/counsel-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? '신청에 실패했어요.'); return; }
      onSuccess();
    } catch {
      setError('네트워크 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">상담 신청</div>

        <div className="form-group">
          <label className="form-label">상담 유형</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            {COUNSEL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">상담 내용</label>
          <textarea
            className="form-textarea"
            placeholder="선생님께 전달할 내용을 적어주세요."
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={1000}
          />
          <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 4 }}>
            {content.length}/1000
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '신청 중...' : '신청하기'}
        </button>
      </div>
    </div>
  );
}

export default function CounselPage() {
  const { data, loading, error, refetch } = useStudent();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState('');

  function handleSuccess() {
    setSheetOpen(false);
    setToast('상담 신청이 접수됐어요. 🔔');
    refetch();
    setTimeout(() => setToast(''), 3000);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="page-header"><div className="skeleton" style={{ height: 24, width: 100 }} /></div>
          {[1, 2].map(i => (
            <div key={i} className="skeleton mt-12" style={{ height: 70 }} />
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
          <div className="page-header-title">상담</div>
          <div className="page-header-sub">이력 확인 및 신청</div>
        </div>

        {data.needCounsel && (
          <div className="banner counsel mt-4">
            <span>🔔</span>
            <span>선생님 상담이 예정되어 있어요.</span>
          </div>
        )}

        {toast && (
          <div className="banner info mt-8">
            <span>{toast}</span>
          </div>
        )}

        <div className="card mt-12">
          <div className="card-title">상담 이력</div>
          {data.counsels.length === 0 ? (
            <div className="text-center text-sub" style={{ padding: '16px 0' }}>
              아직 상담 이력이 없어요.
            </div>
          ) : (
            data.counsels.map(c => <CounselItem key={c.id} c={c} />)
          )}
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setSheetOpen(true)} aria-label="상담 신청">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {sheetOpen && (
        <CounselSheet onClose={() => setSheetOpen(false)} onSuccess={handleSuccess} />
      )}

      <BottomNav counselAlert={data.needCounsel} />
    </div>
  );
}
