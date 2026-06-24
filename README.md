# 대전도시과학고 학생 포털 (dcs-student-portal)

학생이 자신의 성장 데이터를 언제 어디서든 한눈에 확인하고, 선생님과 자연스럽게 연결되는 모바일 포털.

---

## 빠른 시작

```bash
cd app
cp .env.example .env.local
# .env.local 에 실제 키 입력 (아래 환경변수 설명 참고)
npm install
npm run dev
```

---

## 환경변수 (.env.local)

| 키 | 설명 |
|---|---|
| `NOTION_TOKEN` | 노션 Integration 비밀 키 |
| `NOTION_DB_STUDENT` | 학생 종합현황 DB ID (기본값 있음) |
| `NOTION_DB_EVAL` | 전공평가 DB ID (기본값 있음) |
| `NOTION_DB_RECORD` | 생기부 DB ID (기본값 있음) |
| `NOTION_DB_PROJECT` | 프로젝트 DB ID (기본값 있음) |
| `NOTION_DB_COUNSEL` | 상담기록 DB ID (기본값 있음) |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role 키 (서버 전용, 공개 금지) |
| `SESSION_SECRET` | 세션 서명 비밀키 (최소 32자 랜덤 문자열) |

---

## Supabase 테이블 생성

```sql
create table student_accounts (
  id uuid primary key default gen_random_uuid(),
  hakbun text unique not null,
  name_hash text not null,
  password_hash text not null,
  nickname text not null,
  created_at timestamptz default now()
);

-- RLS 활성 (공개 접근 차단)
alter table student_accounts enable row level security;
```

---

## Vercel 배포

```bash
# 1. Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 2. 배포 (app 폴더에서 실행)
cd app
vercel --prod

# 3. Vercel 대시보드에서 환경변수 설정
#    Settings > Environment Variables 에 .env.local 내용 동일하게 입력
```

---

## 노션 Integration 연결

1. notion.so/my-integrations 에서 Internal Integration 생성
2. `NOTION_TOKEN` 에 비밀 키 입력
3. 각 DB 페이지에서 "연결 추가" → 생성한 Integration 선택

---

## 기술 스택

- Next.js 14 App Router + TypeScript (strict)
- Supabase (계정 저장, service_role 서버 전용)
- 노션 SDK v5 (`dataSources.query`, 60초 캐싱)
- HMAC-SHA256 서명 httpOnly 쿠키 세션 (8시간)
- 순수 CSS + Pretendard (CDN)
- 호스팅: Vercel
