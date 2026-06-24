'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', hakbun: '', nickname: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          hakbun: form.hakbun,
          nickname: form.nickname,
          password: form.password,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? '가입에 실패했어요.');
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
      <div className="auth-sub">학생 정보로 본인 확인 후 가입해요</div>

      <div className="auth-card">
        <div className="auth-title">회원가입</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이름 (본명)</label>
            <input
              className="form-input"
              type="text"
              placeholder="학적부상 이름"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">학번</label>
            <input
              className="form-input"
              type="text"
              placeholder="예: 20240101"
              value={form.hakbun}
              onChange={e => set('hakbun', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">닉네임 (화면에 표시됩니다)</label>
            <input
              className="form-input"
              type="text"
              placeholder="자유롭게 정해요"
              value={form.nickname}
              onChange={e => set('nickname', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호 (6자 이상)</label>
            <input
              className="form-input"
              type="password"
              placeholder="비밀번호 설정"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <input
              className="form-input"
              type="password"
              placeholder="비밀번호 재입력"
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </div>
        </form>
        <div className="text-center mt-16" style={{ fontSize: 13, color: 'var(--text-sub)' }}>
          이미 계정이 있나요?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
