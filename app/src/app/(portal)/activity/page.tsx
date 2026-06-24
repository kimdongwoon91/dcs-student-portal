'use client';
import { useStudent } from '@/components/DataProvider';
import BottomNav from '@/components/BottomNav';
import type { Project } from '@/types';

function statusClass(status: string): string {
  if (status.includes('완료') || status.includes('done')) return 'done';
  if (status.includes('진행') || status.includes('progress')) return 'progress';
  return 'planning';
}

function ProjectCard({ p }: { p: Project }) {
  const sc = statusClass(p.status);
  return (
    <div className="card project-card">
      <div className="project-header">
        <span className="project-group">{p.group || '모둠 미배정'}</span>
        <span className={`status-badge ${sc}`}>{p.status || '계획'}</span>
      </div>
      <div className="info-row">
        <span className="info-key">역할</span>
        <span className="info-val">{p.role || '—'}</span>
      </div>
      <div className="info-row">
        <span className="info-key">담당 과업</span>
        <span className="info-val">{p.task || '—'}</span>
      </div>
      {p.dept && (
        <div style={{ marginTop: 8 }}>
          <span className="tag" style={{ fontSize: 11 }}>{p.dept}</span>
        </div>
      )}
    </div>
  );
}

export default function ActivityPage() {
  const { data, loading, error } = useStudent();

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="page-header"><div className="skeleton" style={{ height: 24, width: 100 }} /></div>
          {[1, 2].map(i => (
            <div key={i} className="skeleton mt-12" style={{ height: 120, borderRadius: 18 }} />
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
          <div className="page-header-title">활동</div>
          <div className="page-header-sub">모둠 프로젝트 · 역할 · 진행 상태</div>
        </div>

        {data.projects.length === 0 ? (
          <div className="card mt-12 text-center text-sub" style={{ padding: 32 }}>
            아직 활동 기록이 없어요.
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            {data.projects.map(p => <ProjectCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
      <BottomNav counselAlert={data.needCounsel} />
    </div>
  );
}
