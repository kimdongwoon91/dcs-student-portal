'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [hakbun, setHakbun] = useState('');
  const [needHakbun, setNeedHakbun] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, string> = { name, password };
      if (needHakbun && hakbun) body.hakbun = hakbun;

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (res.status === 409 && json.needHakbun) {
        setNeedHakbun(true);
        setError('동명이인 확인이 필요해요. 학번을 입력해 주세요.');
        return;
      }
      if (!res.ok) {
        setError(json.error ?? '로그인에 실패했어요.');
        return;
      }
      router.replace('/home');
    } catch {
      setError('네트워크 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">DCS 포털</div>
      <div className="auth-sub">대전도시과학고 학생 전용</div>

      <div className="auth-card">
        <div className="auth-title">로그인</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이름</label>
            <input
              className="form-input"
              type="text"
              placeholder="본명을 입력하세요"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              className="form-input"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {needHakbun && (
            <div className="form-group">
              <label className="form-label">학번</label>
              <input
                className="form-input"
                type="text"
                placeholder="학번 입력"
                value={hakbun}
                onChange={e => setHakbun(e.target.value)}
                required
              />
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
        <div className="text-center mt-16" style={{ fontSize: 13, color: 'var(--text-sub)' }}>
          아직 가입 전인가요?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
