# ARCHITECTURE.md

> 상태: ✅ v1.0

---

## 1. Tech Stack

| 영역 | 선택 | 이유 |
|---|---|---|
| Framework | Next.js 14 + App Router | 서버 컴포넌트 + Route Handler로 키 서버 격리 |
| Language | TypeScript (strict) | 타입 안전성 |
| Styling | 순수 CSS + globals.css 토큰 | 외부 의존성 최소화, 빠른 로드 |
| Backend | Next.js Route Handler | 별도 서버 불필요, Vercel 서버리스 |
| DB (계정) | Supabase (service_role, 서버 전용) | 학생 계정·세션 저장 |
| DB (학사) | 노션 API (@notionhq/client, 서버 전용) | 교사 기존 워크플로우 유지 |
| 인증 | HMAC-SHA256 서명 httpOnly 쿠키 (8시간) | 외부 Auth 라이브러리 불필요 |
| 암호화 | bcryptjs (비번) + node:crypto SHA-256 (이름) | 표준 단방향 해시 |
| Hosting | Vercel | Next.js 최적화, 무료 티어 |
| Package Manager | npm | 명세 지정 |

---

## 2. 데이터 흐름

```
[브라우저 (클라이언트)]
  ↓ fetch /api/*  (쿠키 자동 첨부)
  ↓ — 키·데이터 절대 노출 안 됨 —
[Next.js Route Handler (서버)]
  ├─ 쿠키 검증 (HMAC-SHA256)
  ├─ Supabase (service_role) → 계정 조회/생성
  └─ 노션 API → 학사 데이터 조회 (60초 캐시)
  ↓
[응답 JSON] → 브라우저 렌더링
  ※ 성명(이름) 필드는 응답에서 제거
```

---

## 3. 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx          # Pretendard CDN, 글로벌 CSS
│   ├── page.tsx            # / → 로그인 or 홈 redirect
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── home/page.tsx       # 홈탭
│   ├── eval/page.tsx       # 평가탭
│   ├── record/page.tsx     # 성장탭
│   ├── activity/page.tsx   # 활동탭
│   ├── counsel/page.tsx    # 상담탭
│   └── api/
│       ├── register/route.ts
│       ├── login/route.ts
│       ├── logout/route.ts
│       ├── me/route.ts
│       └── counsel-request/route.ts
├── lib/
│   ├── session.ts          # HMAC 쿠키 서명/검증
│   ├── notion.ts           # 노션 클라이언트 + 캐시
│   └── supabase.ts         # Supabase 서버 클라이언트
└── types/
    └── index.ts            # 공유 타입
```

---

## 4. 캐싱 전략

| 데이터 | 캐시 기간 | 방식 |
|---|---|---|
| 노션 학사 데이터 | 60초 | Node.js Map (in-memory) |
| 상담 신청 후 | 즉시 무효화 | 해당 학번 캐시 삭제 |

---

## 5. 보안 레이어

1. httpOnly 서명 쿠키 → CSRF 방어 + XSS 방어
2. 모든 /api/* → 쿠키 학번 추출 후 해당 학번 데이터만 조회
3. Supabase RLS 활성 (public 접근 차단)
4. 노션/Supabase 키 → 서버 환경변수만

---

## 6. 외부 의존성

| 의존성 | 용도 | 장애 대응 |
|---|---|---|
| 노션 API | 학사 데이터 읽기 | 60초 캐시 → 장애 시 캐시 제공 |
| Supabase | 계정 읽기/쓰기 | Supabase SLA 99.9% |
| Vercel | 호스팅 | — |

---

## 7. 환경 변수

```
NOTION_TOKEN
NOTION_DB_STUDENT=fa0720157b854804996afde47a615067
NOTION_DB_EVAL=b97e1c3095fc4d0e902afa9846be3444
NOTION_DB_RECORD=9a695e717a28412782c89233df76e695
NOTION_DB_PROJECT=916a7322d3474b66a6712d31e3a858ca
NOTION_DB_COUNSEL=b1a5dba60eab4dacb5ef90db5c6e4086
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
```

---

## Document Updates

- 2026-06-24: v1.0 작성
