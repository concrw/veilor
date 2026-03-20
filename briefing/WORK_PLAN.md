# Veilrum 작업 기획서

**최종 업데이트:** 2026-03-10
**관리:** Claude Code (VEILRUM 창)

---

## Phase 0 — 환경 구축 (현재) ✅ 진행중

| 작업 | 상태 | 담당 |
|------|------|------|
| 통합기획문서 작성 | ✅ 완료 | Claude Code |
| SESSION_START.md 작성 | ✅ 완료 | Claude Code |
| WORK_PLAN.md 작성 | ✅ 완료 | Claude Code |
| veilrum 스키마 DB 현황 확인 | ✅ 완료 | Claude Code |
| CLAUDE.md 업데이트 | ✅ 완료 | Claude Code |

---

## Phase 1 — 앱 스캐폴딩 🔲 다음

### 1-1. 통합 프로젝트 생성

```bash
# 실행 위치: /Users/brandactivist/Desktop/
npm create vite@latest VEILRUM-APP -- --template react-ts
cd VEILRUM-APP
npm install tailwindcss @tailwindcss/vite
npm install @supabase/supabase-js
npm install @tanstack/react-query zustand
npm install react-router-dom
npm install framer-motion
```

| 작업 | 상태 |
|------|------|
| Vite + React + TS 프로젝트 생성 | ✅ 완료 |
| Tailwind CSS 설정 | ✅ 완료 |
| Supabase 클라이언트 설정 | ✅ 완료 |
| `veilrum` 스키마 TypeScript 타입 생성 | ✅ 완료 |
| 라우팅 구조 설계 | ✅ 완료 |
| 환경변수 `.env.local` 설정 | ✅ 완료 |

### 1-2. 인증 시스템

| 작업 | 상태 |
|------|------|
| Supabase Auth 설정 | 🔲 |
| 로그인/회원가입 페이지 | 🔲 |
| 인증 상태 전역 관리 (Zustand) | 🔲 |
| Protected Route 설정 | 🔲 |
| 온보딩 플로우 | 🔲 |

---

## Phase 2 — PRIPER 이식 🔲

> 기존 코드: `/Desktop/PRIPER/` (80% 완성)

| 작업 | 상태 | 비고 |
|------|------|------|
| 기존 컴포넌트 분석 | 🔲 | |
| Why 컨설팅 10단계 이식 | 🔲 | 핵심 기능 |
| Prime Perspective 결과 화면 | 🔲 | |
| Supabase `prime_perspectives` 연동 | 🔲 | |
| Ikigai 설계 (프리미엄) | 🔲 | |
| 브랜드 설계 (프리미엄) | 🔲 | |
| 멀티 페르소나 (프리미엄) | 🔲 | |

---

## Phase 3 — CodeTalk 개발 🔲

> DB: `veilrum.codetalk_keywords` 100개 완비

| 작업 | 상태 | 비고 |
|------|------|------|
| 오늘의 키워드 표시 | 🔲 | |
| 3단계 딥다이브 입력 UI | 🔲 | 정의→각인→원인 |
| 퍼블릭스토리 (18-02시) | 🔲 | KST 기준 |
| 가상 유저 20명 자동화 | 🔲 | 기존 로직 이식 |
| AI 조언 (OpenAI) | 🔲 | 프리미엄 |
| 파트너 연동 | 🔲 | 프리미엄 |

---

## Phase 4 — DIVE 이식 🔲

> 기존 코드: `/Desktop/DIVE/` (70% 완성)

| 작업 | 상태 | 비고 |
|------|------|------|
| F모드 (감정 공감) | 🔲 | |
| T모드 (분석) | 🔲 | |
| 관계력 추적 3지표 | 🔲 | 감정안정도/갈등빈도/회복도 |
| 대시보드 (3개월 추세) | 🔲 | |
| 전문가 연결 (WebRTC) | 🔲 | |
| AI 상담사 커스터마이징 | 🔲 | 프리미엄, ElevenLabs |

---

## Phase 5 — Community 🔲

> DB: `veilrum.community_groups` 24개 완비

| 작업 | 상태 |
|------|------|
| 그룹 목록 & 상세 | 🔲 |
| 유형별 자동 배치 | 🔲 |
| 게시글/댓글 | 🔲 |
| 익명/실명 전환 | 🔲 |
| 1:1 DM | 🔲 |

---

## Phase 6 — 프리미엄 & 결제 🔲

| 작업 | 상태 | 비고 |
|------|------|------|
| 구독 티어 구분 (무료/프리미엄) | 🔲 | |
| PortOne 결제 연동 (한국) | 🔲 | |
| Stripe 연동 (해외) | 🔲 | |
| 프리미엄 전환 트리거 5개 구현 | 🔲 | |

---

## 미결 결정 사항

| 항목 | 상태 | 메모 |
|------|------|------|
| Dating 모드 시작 시점 | 🔲 미정 | Year 2+ 예정 |
| 백엔드 서버 방식 | 🔲 미정 | Edge Functions vs Express 서버 |
| 모바일 앱 (iOS/Android) vs 웹 | 🔲 미정 | 우선 웹으로 시작 |
| 생체데이터 테이블 방향 | 🔲 미정 | |

---

## 참조

- **기준 문서:** `Veilrum_통합기획문서_v1_20260310.md`
- **세션 브리핑:** `briefing/SESSION_START.md`
- **DB 현황:** `briefing/current_state.md`
- **앱 개발 상세:** `briefing/Veilrum_App_Dev_Briefing_v1_20260310.md`

---

*WORK_PLAN.md | 2026-03-10 | 작업 진행 시 상태 업데이트*
