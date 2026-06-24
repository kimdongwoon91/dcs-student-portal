# QUALITY_SCORE.md

> 본 프로젝트의 품질 측정 기준.
> 자동 측정 가능한 지표와 수동 점검 항목을 정의한다.
> 매 PR / 매 릴리스에서 본 점수의 변화를 추적한다.

> 📝 **상태**: TBD — Claude Code 작업 중 점진 작성

---

## 📝 이 문서를 채우는 가이드

**작성 시점:** 첫 PR이 만들어질 때 즈음. 자동 측정 가능한 지표부터 채우고, 도메인 특화 골드셋은 점진 추가.

**목표:**
- 자동 측정으로 일관성 보장
- 사람 검토는 핵심 영역에 집중
- AI가 코드 짤 때 자동으로 통과해야 할 기준선

---

## 1. 자동 측정 지표

| 지표 | 도구 | 임계값 |
|---|---|---|
| Lighthouse Performance | Lighthouse CI | ≥ [N] |
| Lighthouse Accessibility | Lighthouse CI | ≥ [N] |
| TypeScript strict 에러 | tsc | 0 |
| ESLint warning | ESLint | 0 |
| 테스트 커버리지 | [Jest/Vitest] | ≥ [N]% |
| 번들 사이즈 | [Next.js Analytics] | ≤ [N]kb |

---

## 2. 도메인 특화 골드셋 (해당 시)

> 핵심 알고리즘·AI 출력 등을 검증하는 정답 세트.

**위치:** `/tests/golden-set/`

**구성 예시:**
- [도메인 핵심 영역 1] N케이스
- [도메인 핵심 영역 2] N케이스

> 💡 **예시 (사주앱):**
> - 사주팔자 계산 50케이스 (수동 검증된 만세력 vs 라이브러리 결과)
> - AI 사주 해석 20케이스 (Belief 준수 + 정확도)

---

## 3. core-beliefs 위반 자동 탐지

`docs/design-docs/core-beliefs.md`의 금지 표현 자동 검열.

**위치:** `/src/lib/belief-filter/forbidden-words.ts`

**탐지 시 처리:**
1. AI 응답 후 1차 검열
2. 위반 감지 → 재생성 (최대 N회)
3. 지속 위반 → 사용자 에러 + 로그

---

## 4. 비즈니스 KPI 측정

`docs/PRODUCT_SENSE.md` Success Metrics와 연결.

| 지표 | 측정 도구 | 주기 | 임계값 |
|---|---|---|---|
| [North Star 지표] | [도구] | [주기] | [목표] |
| [보조 지표 1] | [도구] | [주기] | [목표] |
| [보조 지표 2] | [도구] | [주기] | [목표] |

---

## 5. 수동 점검 항목 (릴리스 전 체크리스트)

- [ ] PRODUCT_SENSE 비전과 충돌 없음
- [ ] core-beliefs 신념 위반 없음
- [ ] DESIGN.md Voice & Tone 일관성
- [ ] SECURITY.md 가이드라인 준수
- [ ] 새 기능에 대한 product-spec 작성됨
- [ ] CHANGELOG 업데이트됨

---

## Document Updates

- YYYY-MM-DD: 템플릿에서 복사·초기화
