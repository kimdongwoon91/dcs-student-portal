-- ============================================================
-- 대전도시과학고 문제은행 통합시스템 — Supabase 초기 설정 SQL
-- Supabase 대시보드 > SQL Editor 에서 실행하세요.
-- ============================================================

-- 1. KV 스토리지 테이블 생성
CREATE TABLE IF NOT EXISTS kv_store (
  key       text PRIMARY KEY,
  value     text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 2. RLS 활성화 (Row Level Security)
ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;

-- 3. anon 사용자 전체 읽기/쓰기 허용 (앱 자체 인증으로 보호)
CREATE POLICY "anon_read"  ON kv_store FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write" ON kv_store FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON kv_store FOR UPDATE TO anon USING (true) WITH CHECK (true);
