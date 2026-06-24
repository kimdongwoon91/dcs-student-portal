# SECURITY.md

> 상태: ✅ v1.0

---

## 1. 민감 데이터

| 데이터 | 저장 정책 |
|---|---|
| 학생 이름 | SHA-256 해시만 저장 (평문 금지) |
| 비밀번호 | bcryptjs 단방향 해시만 저장 |
| 학번 | 평문 저장 OK (식별자, 비밀 아님) |
| 성적·생기부 | 노션에서 읽기 전용, 서버에서 응답 시 이름 필드 제거 |
| 닉네임 | 평문 저장 OK |

---

## 2. 인증

### 2.1 세션
- HMAC-SHA256 서명 httpOnly 쿠키 (payload: 학번, 만료: 8시간)
- `SESSION_SECRET` 환경변수로 서명 키 관리
- node:crypto만 사용 (외부 JWT 라이브러리 X)

### 2.2 로그인 흐름
- 이름 → SHA-256 해시 → Supabase에서 name_hash 일치 후보 조회
- 각 후보에 bcrypt.compare → 일치 1건이면 쿠키 발급
- 동명이인 2건 이상 일치 시 "학번도 입력해주세요" 추가 요청

### 2.3 비밀번호 정책
- 최소 8자 이상 (서버 검증)
- bcrypt round 12

---

## 3. 접근 제어

- 모든 `/api/*` 라우트: 쿠키에서 학번 추출 → 해당 학번 데이터만 조회
- 타 학생 학번 직접 지정 불가 (서버가 쿠키 학번만 신뢰)
- Supabase RLS: `student_accounts` 공개 접근 차단, service_role만 허용

---

## 4. 키 관리

- 로컬: `.env.local` (gitignore)
- 프로덕션: Vercel Environment Variables
- 🚫 코드·로그·PR에 키 절대 노출 금지
- 노출 의심 시: 즉시 Supabase·노션에서 키 재발급

---

## 5. 개인정보

- 수집 항목: 학번, 이름(해시), 닉네임, 비밀번호(해시)
- 이름 원문은 가입 후 즉시 해시 처리, 서버 메모리에서 제거
- 탈퇴 기능: 1차 미구현 (운영자가 DB에서 직접 삭제)

---

## 6. 금지

- 🚫 클라이언트(브라우저)에 NOTION_TOKEN, SUPABASE_SERVICE_ROLE_KEY 노출
- 🚫 응답 JSON에 학생 실명(성명) 포함
- 🚫 서버 로그에 비밀번호 평문 출력

---

## Document Updates

- 2026-06-24: v1.0 작성
