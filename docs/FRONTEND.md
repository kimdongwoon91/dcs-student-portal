# FRONTEND.md

> 프론트엔드 코딩 규칙. 컴포넌트 구조, 상태 관리, 디자인 토큰 적용.
> `docs/DESIGN.md`의 토큰을 코드 레벨에서 어떻게 적용할지 정의한다.

> 📝 **상태**: TBD — Claude Code 작업 중 점진 작성

---

## 📝 이 문서를 채우는 가이드

**언제 채우나?**
ARCHITECTURE.md의 Tech Stack이 정해진 후. 또는 Claude Code 작업 시작하면서 자연스럽게.

**채울 때 원칙:**
- 추상적 규칙보다 **구체 예시**
- "이렇게 하면 안 되는 코드 패턴"도 명시
- DESIGN.md 토큰을 코드(Tailwind config 등)에 어떻게 매핑할지 명시

---

## 1. 프로젝트 구조

```
src/
├── app/                    [Next.js App Router 기준]
├── components/
│   ├── ui/                 [shadcn/ui 기반 원자 컴포넌트]
│   ├── features/           [기능별 컴포넌트]
│   └── layouts/            [페이지 레이아웃]
├── lib/                    [유틸·헬퍼]
├── hooks/                  [커스텀 React 훅]
├── stores/                 [Zustand 등 상태]
├── prompts/                [AI 프롬프트 (해당 시)]
├── schemas/                [Zod 등 검증 스키마]
└── types/                  [TypeScript 타입]
```

> Tech Stack에 따라 조정.

---

## 2. 컴포넌트 작성 규칙

### 2.1 네이밍
- 컴포넌트 파일명: `PascalCase.tsx`
- 훅 파일명: `use-kebab-case.ts`
- 유틸 함수: `camelCase`

### 2.2 분할 기준
- 한 컴포넌트 200줄 이상 → 분할 고려
- 재사용 가능성 있으면 → `components/ui/` 또는 `components/features/`
- 한 페이지 전용이면 → 같은 라우트 폴더 내

---

## 3. 상태 관리

| 상태 종류 | 도구 | 위치 |
|---|---|---|
| 서버 상태 | TanStack Query / SWR | API 호출 |
| 클라이언트 글로벌 상태 | Zustand | `stores/` |
| 폼 상태 | React Hook Form | 각 폼 컴포넌트 |
| UI 로컬 상태 | useState | 컴포넌트 내부 |

> Tech Stack에 따라 조정.

---

## 4. DESIGN.md 토큰 적용

### 4.1 컬러 → Tailwind 매핑

```ts
// tailwind.config.ts (예시)
theme: {
  extend: {
    colors: {
      'background': '#XXXXXX',  // DESIGN.md Background
      'text': '#XXXXXX',         // DESIGN.md Text
      'accent': '#XXXXXX',       // DESIGN.md Accent
    }
  }
}
```

### 4.2 타이포 → Next.js Font

```ts
// app/fonts.ts (예시)
import { [Font] } from 'next/font/google'
export const heading = ...
export const body = ...
```

### 4.3 텍스처·이미지
- 위치: `/public/textures/`
- 적용 정책: DESIGN.md의 텍스처 강도 따름

---

## 5. 폼·입력 처리 표준

- 모든 폼은 React Hook Form + Zod 검증
- 에러 메시지: DESIGN.md UX Flow 4.3 톤
- 제출 중 상태: 버튼 비활성 + 로딩 인디케이터

---

## 6. 페이지 전환·로딩 처리

- DESIGN.md UX Flow 4.4 (전환 속도) 준수
- DESIGN.md UX Flow 4.5 (로딩 시간 처리) 준수
- Suspense + 적절한 fallback UI

---

## 7. 에러 바운더리

- 글로벌: `app/error.tsx`
- 페이지별: 필요 시 라우트 폴더에 `error.tsx`
- 인라인: try/catch + Toast

---

## Document Updates

- YYYY-MM-DD: 템플릿에서 복사·초기화
