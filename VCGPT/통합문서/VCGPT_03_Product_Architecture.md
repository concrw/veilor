# VCGPT_03 — Veilrum 프로덕트 아키텍처: 모듈 · 유저 저니 · 기술 스택 · 로드맵
**통합 기준일:** 2026-03-16
**통합 출처:** Veilrum_통합기획문서_v1_20260310.md / 02_VEILRUM_PRODUCT_ARCHITECTURE.md / 05_VEILRUM_EXECUTION_ROADMAP.md / 03_VEILRUM_PLATFORM_FLYWHEEL.md / 다수 모듈·아키텍처 파일

---

## 목차

1. [아키텍처 원칙](#1-아키텍처-원칙)
2. [플랫폼 구조 — 6 Module](#2-플랫폼-구조--6-module)
3. [Module 1: PRIPER (자기 이해)](#3-module-1-priper-자기-이해)
4. [Module 2: CodeTalk (관계 언어)](#4-module-2-codetalk-관계-언어)
5. [Module 3: DIVE (관계 성장)](#5-module-3-dive-관계-성장)
6. [Module 4: Community](#6-module-4-community)
7. [Module 5: Connect (1:1 DM)](#7-module-5-connect-11-dm)
8. [Module 6: Dating (Year 2+)](#8-module-6-dating-year-2)
9. [유저 저니](#9-유저-저니)
10. [프리미엄 전환 트리거 5가지](#10-프리미엄-전환-트리거-5가지)
11. [기술 스택 (확정)](#11-기술-스택-확정)
12. [DB 현황](#12-db-현황)
13. [개발 로드맵](#13-개발-로드맵)
14. [성장 플라이휠](#14-성장-플라이휠)
15. [MVP 정의](#15-mvp-정의)

---

## 1. 아키텍처 원칙

> **"하나의 계정, 여러 경험"** — Kai Andersen CTO 확정

Veilrum 계정 하나로 로그인 → 각 모듈이 독립된 인터페이스로 열림
뒤에서는 **RI API(단일 데이터 레이어)** 하나가 돌아가는 구조

**슈퍼앱 아님. 통합 계정 + 분리된 경험.**

RI API 역할:
- 7개 프레임워크 × 231개 도메인 엔진
- 모든 모듈의 사용자 데이터를 통합 해석
- 각 모듈에 개인화 컨텍스트 제공

---

## 2. 플랫폼 구조 — 6 Module

```
┌─────────────────────────────────────────┐
│             VEILRUM (단일 계정)          │
├──────────┬──────────┬───────────────────┤
│ Module 1 │ Module 2 │    Module 3       │
│  PRIPER  │ CodeTalk │      DIVE         │
│ (자기이해)│ (관계언어)│   (관계성장)       │
├──────────┴──────────┴───────────────────┤
│         Module 4: Community             │
│            (유형별 커뮤니티)              │
├─────────────────────────────────────────┤
│         Module 5: Connect               │
│              (1:1 DM)                   │
├─────────────────────────────────────────┤
│    Module 6: Dating (Year 2+, 선택)     │
├─────────────────────────────────────────┤
│         RI API (단일 데이터 레이어)       │
│    7개 프레임워크 × 231개 도메인 엔진     │
└─────────────────────────────────────────┘
```

### 6개 핵심 사업 (확정)

| 코드 | 사업 | 우선순위 |
|------|------|---------|
| P-07 | 통합 플랫폼 런칭 (PRIPER + CodeTalk + DIVE) | 🔴 최우선 |
| P-08 | 매칭 알고리즘 자체 플랫폼 독점 | 🔴 최우선 |
| P-09 | AI 관계 코치 에이전트 (DIVE 2.0) | 🟡 준우선 |
| P-10 | 자극적 콘텐츠 양산 (AI 파이프라인) | 🔴 최우선 |
| P-11 | RelationSHIP 12 디지털 코칭 | 🟡 준우선 |
| P-12 | Relationship Intelligence API (내부 전용) | 🔴 아키텍처 핵심 |

---

## 3. Module 1: PRIPER (자기 이해) — 완성도 80%

**핵심:** Prime Perspective 발견 — "당신의 렌즈는 무엇인가?"

### Why 컨설팅 10단계

1. 직업 브레인스토밍 (10분)
2. 정의 작성
3. 각인 순간 기록
4. 행복/고통/중립 분류
5. 이유 작성
6. 경험 기록
7. 1차 분석 (공통 분모) — AI
8. 2차 분석 (각인 뿌리) — AI
9. 가치관 매핑
10. Prime Perspective 도출 → "당신의 렌즈는 [X]입니다"

### 추가 기능
- Ikigai 설계 (4영역)
- 브랜드 설계 (5단계)
- 커뮤니티 자동 배치 (Prime Perspective 기반)
- 멀티 페르소나 (프리미엄)

### 내적 자원 배분 시각화 (Kai CTO)
- **레이더/파이 차트:** 현재 페르소나별 자원 배분
- **갭 시각화:** "적정 배분" vs "현재 배분" — 어떤 페르소나가 굶주려 있는지
- **시간축:** "3년 전 vs 지금" — 페르소나 소장 변화 추이
- **AI 코치 넛지:** "당신의 4번 페르소나가 3년간 자원 0%입니다. 이번 주에 시간을 주세요."

### 무료/유료 구분
- 무료: Why 컨설팅 10단계 기본
- 유료($9.99): Ikigai, 브랜드 설계, 멀티 페르소나

---

## 4. Module 2: CodeTalk (관계 언어) — 완성도 80%

**핵심:** 매일 하나의 키워드로 100일간 정의각인 탐색

### 100일 구조
- Day 1-30: 기본 단어 (사랑, 행복, 자유, 신뢰...)
- Day 31-60: 관계 단어 (헌신, 질투, 소유, 거리...)
- Day 61-100: 깊은 단어 (성, 돈, 가족, 죽음...)

### 3단계 딥다이브
1. 정의 공유 — "나에게 [단어]란?"
2. 각인 추적 — "왜 그렇게 정의하게 됐나?"
3. 원인 분석 — "그 경험은 어디서 왔나?"

### 운영 구조
- **퍼블릭스토리:** KST 18시-익일 02시 운영, 전체 유저 같은 키워드로 소통
- **가상 유저 시스템:** 20명 자동화, 현실적 시간 패턴으로 운영
- **DB:** `veilrum.codetalk_keywords` — 100개 완비

### 무료/유료 구분
- 무료: 일일 키워드 + 정의 작성 + 퍼블릭스토리
- 유료($9.99): 무제한 AI 조언, 파트너 연동

### CodeTalk의 전략적 가치
- 매일 접속 이유 제공 → 리텐션 루프
- 100일 후 개인 관계 언어 프로필 완성 → 매칭 기반 데이터
- 같은 키워드로 전체 유저가 소통 → 커뮤니티 네트워크 효과

---

## 5. Module 3: DIVE (관계 성장) — 완성도 70%

**핵심:** F/T 이중 모드 AI 상담 + 관계력 추적

### F모드 (감정 공감형)
- 공감, 수긍, 격려 중심
- "정말 힘들었겠어요" / "충분히 그렇게 느낄 수 있어요"

### T모드 (분석형)
1. 감정 분석 (키워드 추출, 강도 1-10)
2. 핵심 갈등 요약 (표면/심층 구분)
3. 상대 행동 패턴 (과거 데이터 기반)
4. 해결책 A/B/C (즉시/중기/근본)

### Held Mode vs Dig Mode
엔진이 매번 결정:
- **Held Mode:** 감정 수용 중심 → 처음 들어왔을 때
- **Dig Mode:** 구조 해석 중심 → 신뢰 형성 후

### 관계력 추적 3지표
- 감정 안정도 (0-100)
- 갈등 발생 빈도
- 대화 회복도

### 확장 기능
- **전문가 연결:** WebRTC 음성상담, 30/60분 세션
- **나만의 AI 상담사:** 얼굴+목소리 커스터마이징, ElevenLabs Voice Cloning (프리미엄)
- **커뮤니티:** '내가 만난 가장 사이코' (익명 기반)

### 무료/유료 구분
- 무료: F모드 주 3회
- 유료($9.99): T모드, 나만의 AI 상담사, 전문가 상담 할인

---

## 6. Module 4: Community (커뮤니티)

### 자동 배치 기준
Prime Perspective + 애착 유형 + 성적 스펙트럼 + 아비투스

### 카테고리
- 소통 (대화법, 싸움 후 화해)
- 섹스 (욕구 차이, 성적 호환)
- 돈 (가계 관리, 소비 패턴)
- 가족 (시댁, 양육, 가족 계획)
- 위기 (외도, 중독, 폭력)
- 문화 (종교, 국제 관계, 가치관)

**DB:** `veilrum.community_groups` — 24개 완비
**익명/실명 선택:** 민감한 주제 시 익명 모드

### 커뮤니티 설계 원칙
커뮤니티는 기능보다 운영 설계가 먼저다.
- 명확한 규칙 / 민감 주제의 단계적 개방
- 유형 낙인 방지 언어 / 신고·중재 시스템
- "진단"보다 "경험 공유"를 유도하는 구조

**초기 전략:** AI 관계가 주인공, 커뮤니티는 보조.
유저가 자기 서사를 쌓은 뒤 커뮤니티가 붙어야 강하다.

---

## 7. Module 5: Connect (1:1 DM)

- 커뮤니티에서 먼저 교류 후 DM 요청
- 상대방 동의 필수
- 안전 장치: 신고/블록/AI 유해 메시지 필터

---

## 8. Module 6: Dating (Year 2+, 선택)

- 자발적 활성화 (강제 아님)
- 43명 데이터 기반 매칭 알고리즘
- "이 조합 장기 관계 성공률 83%" 예측 표시

---

## 9. 유저 저니

### Day 1 — 가입 & 첫 경험
```
회원가입 → 온보딩(1분) → PRIPER Why 컨설팅(30-45분)
→ Prime Perspective 발견 → 커뮤니티 자동 배치
```

### Day 2-30 — 일상 사용
```
아침: CodeTalk 오늘의 키워드 알림
낮:   커뮤니티 활동 (읽기/댓글)
저녁: 퍼블릭스토리 참여 (18-02시)
수시: DIVE 상담 (갈등 발생 시)
```

### Day 31-100 — 심화
```
CodeTalk 100일 완주 진행
PRIPER Ikigai 재설계 (프리미엄)
커뮤니티 1:1 DM 시작
```

### TAM 확장 논리 (Sebastian Cross, COO)
- 기존: "연인을 찾는 사람" → 데이팅 시장 $10B
- 재정의: "자기 자신을 이해하고 싶은 모든 사람" → 자기계발($40B) + 멘탈웰니스($130B) + 데이팅 통합

---

## 10. 프리미엄 전환 트리거 5가지

1. PRIPER 브랜드 설계 접근 시
2. CodeTalk AI 조언 5회 사용 후
3. DIVE 전문가 상담 예약 시
4. 커뮤니티 파일 업로드 시
5. 나만의 AI 상담사 생성 시

---

## 11. 기술 스택 (확정)

```
Frontend:   React 18 + TypeScript + Vite + Tailwind CSS
UI:         Radix UI (shadcn/ui)
State:      TanStack Query v5 + Zustand
Router:     React Router DOM v6
Animation:  Framer Motion
Backend:    Supabase (PostgreSQL + Auth + RLS + Realtime)
Functions:  Supabase Edge Functions (Deno)
AI:         Claude API (Anthropic) — DIVE 상담, CodeTalk AI 조언
Voice:      ElevenLabs (AI 상담사 목소리)
Storage:    AWS S3 + CloudFront (CDN)
Deploy:     Vercel (프론트) + Supabase Edge Functions (API)
Payment:    PortOne (한국) + Stripe (해외)
Monitoring: Sentry (에러) + Mixpanel (유저 분석)
```

### 프로젝트 위치
```
/Desktop/VEILRUM-APP/     ← 통합 신규 프로젝트 (미생성)
/Desktop/PRIPER/          ← 기존 코드 80% 완성
/Desktop/DIVE/            ← 기존 코드 70% 완성
```

### 폴더 구조 (신규 통합 프로젝트)
```
src/
├── components/
│   ├── common/       # 공통 컴포넌트
│   ├── priper/       # PRIPER 모듈
│   ├── codetalk/     # CodeTalk 모듈
│   ├── dive/         # DIVE 모듈
│   ├── community/    # 커뮤니티
│   ├── connect/      # 1:1 DM
│   └── dating/       # 데이팅 (Year 2+)
├── pages/
├── hooks/
├── utils/
├── api/
└── types/
```

### 하단 탭 네비게이션 (5개)
1. 홈 (대시보드)
2. 자기이해 (PRIPER)
3. 키워드 (CodeTalk)
4. 상담 (DIVE)
5. 커뮤니티

---

## 12. DB 현황

**Supabase 프로젝트 ID:** `qwiwotodwfgkpdasdhhl` (딥플롯 DB 공유)

### veilrum 스키마 (15개 테이블)

| 테이블 | 데이터 | 상태 |
|--------|--------|------|
| `user_profiles` | 0 | 구조만 |
| `prime_perspectives` | 0 | 구조만 |
| `codetalk_keywords` | **100개** | ✅ 완비 |
| `codetalk_entries` | 0 | 구조만 |
| `dive_sessions` | 0 | 구조만 |
| `community_groups` | **24개** | ✅ 완비 |
| `community_memberships` | 0 | 구조만 |
| `community_posts` | 0 | 구조만 |
| `community_comments` | 0 | 구조만 |
| `dm_rooms` | 0 | 구조만 |
| `dm_messages` | 0 | 구조만 |
| `researcher_profiles` | **40명** | ✅ 완비 |
| `researcher_daily_logs` | 0 | 재설계 필요 |
| `relationship_events` | 0 | 구조만 |
| `biometric_data` | 0 | 방향 재확정 필요 |

### public 스키마 — M43 연결 가능

| 테이블 | 데이터 | Veilrum 활용 |
|--------|--------|-------------|
| `m43_domain_theories` | 0 | 앱 내 콘텐츠 기반 |
| `m43_research_outputs` | 0 | 앱 내 콘텐츠 기반 |
| `characters_core` | 413명 | Veilrum 상담 캐릭터 |

---

## 13. 개발 로드맵

### 현재 (2026-03) — 즉시 시작

**순서:**
1. 통합 프로젝트 스캐폴딩 (`/Desktop/VEILRUM-APP/`)
2. Supabase 연동 + `veilrum` 스키마 TypeScript 타입 생성
3. 인증 시스템 (Supabase Auth)
4. PRIPER 핵심 플로우 이식 (Why 컨설팅 10단계)
5. CodeTalk 신규 개발 (키워드 100개 DB에 완비)
6. DIVE 이식
7. Community 통합

### Year 1 (2026) — Research Edition
- 43명 연구원 전용 앱
- 7개 프레임워크 진단
- 관계 추적 대시보드
- 생체 데이터 통합

### Year 2 (2027) — 알고리즘 개발
- 43명 데이터 심층 분석
- 매칭 알고리즘 설계
- 외부 베타 100명

### Year 3 (2028) — MVP 출시
- 통합 플랫폼 완성
- 클로즈드 베타 1,000명
- 공개 베타 5,000명
- 정식 출시

### Year 4+ — 확장
- 사용자 50,000명
- 데이팅 모드
- 국제 확장

---

## 14. 성장 플라이휠

Veilrum의 성장 루프는 3개 플라이휠로 구성된다:

### Insight Flywheel
```
사용자 기록 → AI 패턴 해석 → 개인화된 인사이트 → 더 깊은 기록 → 더 정확한 해석
```

### Community Flywheel
```
인사이트 공유 → 공명 경험 → 커뮤니티 정착 → 양질의 콘텐츠 → 신규 유입
```

### Alignment Flywheel
```
패턴 데이터 축적 → 관계 정렬 정확도 향상 → 더 나은 연결 → 성공 사례 → 신뢰 증가
```

**핵심:** 각 플라이휠이 강화될수록 후발주자가 따라오기 어려워진다.

---

## 15. UX 구조 — 5탭 (Held / Dig / Get / Set / Me)

기존 모듈(PRIPER/CODETALK/DIVE/Community) 외에, 사용자가 실제로 경험하는 **UX 탭 구조**는 5개로 설계된다.

### 제품 설계 3원칙

1. **유저는 모듈이 아니라 Veilrum을 쓴다** — 내부적으로 모듈이 분리되어 있어도 UX는 하나의 흐름처럼 느껴져야 한다
2. **초기 가치는 연결이 아니라 자기이해다** — 감정이 정리되고, 패턴이 보이고, 다음 질문이 생기고, 다시 돌아오게 되는 것
3. **좋은 답변보다 중요한 것은 장기 기억이다** — 나를 기억하고, 패턴을 요약하고, 지난달과 지금의 나를 비교해주며, 점점 더 정확해지는 AI

### Tab 1 — Held (받아줬다)
**상태:** 감정이 올라와 있고, 일단 말하고 싶다

기능:
- 감정 선택
- 자유 입력
- AI의 비판단적 수용
- 즉각적인 정서 안정
- 오늘의 관계 키워드

역할: 진입 장벽 제거 / 초기 이탈 방지 / 감정 수용 기반 형성

### Tab 2 — Dig (파고들었다)
**상태:** 왜 내가 이런지 알고 싶다

기능:
- 관계/감정 상황 입력
- 반복 구조 탐지
- AI 패턴 후보 제시
- "이건 욕망 문제인가, 애착 문제인가, 경계 문제인가" 구분

역할: 사건을 패턴으로 바꿔줌 / 관계 문제를 구조적 언어로 번역

### Tab 3 — Get (알아냈다)
**상태:** 뿌리가 궁금하다

기능:
- PRIPER 기반 자기 구조 탐색
- 각인 순간 / 핵심 가치
- 멀티페르소나 맵
- 가면 / 욕망 / 두려움 요약

역할: 자기이해 심화 / "왜 내가 이런 사람인지" 설명

### Tab 4 — Set (재설정했다)
**상태:** 이제 바꾸고 싶다

기능:
- 경계 설정
- 대화 준비
- 관계 리듬 조정
- 위험 조합 경고
- 합의 체크리스트
- 다음 행동 제안

역할: 통찰을 행동으로 연결 / 관계 선택·관리 단계로 이동

### Tab 5 — Me (내가 보인다)
**상태:** 나를 정리해서 보고 싶다

기능:
- 내 패턴 리포트
- Persona Map / Desire Map
- 3개월/6개월 비교
- 내 관계 언어 지도
- 추천 질문 / 추천 루틴

역할: 플랫폼 전체 경험 요약 / 장기 리텐션의 중심 허브

### Stage별 단계 확장

| Stage | 이름 | 중심 기능 |
|-------|------|---------|
| Stage 1 | Insight MVP | Held + Dig 중심 / 감정 수용·패턴 탐지·주간 리포트 |
| Stage 2 | Reflection Engine | CODETALK 루프·Me 탭 강화·월간 리포트 |
| Stage 3 | Get 심화 | PRIPER 통합·Persona/Desire Map |
| Stage 4 | Community | 익명 대화·금기 대화·담론 형성 |
| Stage 5 | Alignment | 정렬 기반 발견·안전한 관계 도입 |
| Stage 6 | Growth | 커플/파트너 체크인·갈등 분석·관계 유지 도구 |

### KPI

| 구분 | 지표 |
|------|------|
| 초기 | 첫 세션 완료율 / 7일 유지율 / 첫 리포트 도달률 / "정확하다" 반응 / CODETALK 재방문률 |
| 중기 | 월간 리포트 열람률 / 장기 기록률 / 성·금기 영역 진입률 / 커뮤니티 체류율 |
| 장기 | 정렬 기반 연결 전환율 / 관계 체크인 반복률 / 관계 만족도 개선 자기보고 / 추천 의향 |

---

## 16. MVP 정의

### MVP 한 문장
> "하루 몇 분의 기록과 대화로, AI가 당신의 관계 패턴과 숨은 페르소나를 읽어주는 자기이해 앱."

### MVP 핵심 기능 4개
1. 초간단 진입 진단
2. 일일 기록 또는 키워드 입력 (CodeTalk)
3. AI 해석 (DIVE)
4. 주간 리포트

### MVP에서 제외해도 되는 것
- DM / 데이팅 / 전문가 연결
- AI 아바타/음성 클로닝
- 복잡한 커뮤니티
- 너무 많은 이론 모듈의 동시 오픈

### 제품 우선순위

| 순위 | 항목 | 이유 |
|------|------|------|
| 🔴 1 | AI 자기이해 루프 | 제품의 심장: 기록→AI해석→다음질문→변화추적 |
| 🟡 2 | 개인 리포트 | 유저가 가치를 체감하는 핵심 장치 |
| 🟡 3 | CodeTalk 리텐션 루프 | 강한 일상 루틴, 데이터 축적 |
| 🟢 4 | 선택형 심층 모듈 | 신뢰 획득 후 단계적 개방 |
| ⬜ 5 | 커뮤니티/DM/매칭 | PMF 전에 붙이면 운영 난이도만 급증 |

---

---

## 16. UX Relational Journey Architecture

> Veilrum은 단일 정답을 제시하지 않는다. 관계 데이터에 기반한 **확률적 해석과 가능한 경로**를 제시한다. 관계는 결정론적 시스템이 아니라 확률론적 시스템이다.

### 16.1 코어 UX 철학

**확률 기반 해석 모델:**
- Interpretation A (most likely, confidence 0.68)
- Interpretation B (possible, confidence 0.52)
- Interpretation C (alternative, confidence 0.41)

사용자는 정답을 따르는 것이 아니라 **반성하도록 권장된다.**

### 16.2 여정 5단계별 목표·UX·데이터 캡처

| 단계 | 목표 | UX 요소 | 데이터 캡처 |
|------|------|---------|-----------|
| **Held** | 감정적으로 수용받고 안전함을 느끼게 함 | 익명 서사 입력 / AI 감정 수용 / 비판단 응답 / 즉각 위로 대화 | raw_narrative / emotion_signals / relationship_context |
| **Dig** | 상황을 더 깊이 탐색하게 함 | guided questions / timeline 재구성 / relationship mapping | event_timeline / signal_candidates / relationship_dynamics |
| **Get** | 관계 역학의 가능한 해석 생성 | 확률 기반 통찰 / 다중 가설 제시 | pattern_profiles / desire_profiles / persona_profiles |
| **Set** | 새로운 관계 행동 실험을 돕는다 | conversation scripts / boundary suggestions / communication experiments | intervention_readiness / change_signals |
| **Me** | 장기적 관계적 자기인식을 쌓는다 | relationship pattern summaries / attachment tendencies / desire pattern insights | Relational Self Model 누적 |

### 16.3 커뮤니티 레이어

**기능:** 주제별 익명 토론 / 경험 공유 / 패턴 비교 / 상호 성찰

→ Community dialogue도 relational data signals를 생성한다

### 16.4 확률적 조언 구조

```
1. emotional acknowledgment
2. interpretation A (most likely)
3. interpretation B (alternative)
4. reflective question
```

예시: "커뮤니케이션 단절 패턴일 수 있지만, 파트너가 외부 스트레스를 다루고 있을 가능성도 있습니다."

### 16.5 Clinical Escalation System

**감지 대상:** self-harm / severe_depression / abuse / coercion / sexual_trauma

**escalation trigger 조건:** `risk_signal_score > threshold`

**신호 소스:** ERS signals + pattern_detection + sentiment_analysis + user_direct_statements

**Clinical Escalation Mode 진입 시 AI 행동:**
- 일반 상담 중단
- 명확한 안전 지향 권고
- 전문가 도움 권유 (자연스럽게)
- risk event logging + human review queue

예시: "지금 경험하고 있는 것에 제가 최선의 지원이 되지 못할 수 있어요. 이 상황은 전문 상담사와 이야기하는 것이 도움이 될 수 있습니다."

### 16.6 시스템 설계 3원칙

1. **No false certainty** — 잘못된 확실성 제시 금지
2. **Evidence-based interpretation** — 증거 기반 해석
3. **Escalate serious situations** — 심각한 상황은 전문가에게 에스컬레이션

**최종 원칙:** Veilrum은 치료를 대체하지 않는다. 자기 이해 / 관계 역학 탐색 / 더 건강한 실세계 대화 준비를 위한 관계 인텔리전스 시스템이다.

---

## 17. Production Architecture (9레이어 운영 인프라)

> **Veilrum Production Architecture는 Held→Dig→Get→Set→Me 사용자 여정에서 생성되는 관계 경험 데이터를 안전하게 수집하고, ERS 신호로 구조화하고, M43 프레임워크로 해석하고, 상담 AI와 위험 감지 시스템에 연결하며, 장기적으로 Relationship Specialist LLM을 훈련하는 운영 인프라이다.**

### 17.1 상위 시스템 9레이어

```text
1. Client Layer
2. Experience API Layer
3. Session & Identity Layer
4. AI Orchestration Layer          ← 핵심
5. Signal & Risk Intelligence Layer
6. Knowledge & Graph Layer
7. Data Platform Layer
8. Model Platform Layer
9. Security / Audit / Governance Layer
```

```text
Mobile/Web Client
      ↓
Experience API Gateway
      ↓
Session / User / Journey Services
      ↓
AI Orchestrator (오케스트레이션 계층)
      ↓
Signal Engine + Risk Engine + Reasoning Engine
      ↓
ERS Store + Relationship Graph + M43 Knowledge Retrieval
      ↓
Operational DB + Event Bus + Analytics Warehouse + Dataset Builder
      ↓
Inference Models + Training Pipelines + Evaluation Systems
      ↓
Security / Audit / Moderation / Governance
```

### 17.2 Client Layer 책임과 금지

**책임:** narrative 입력 / 감정 선택 / AI 대화 / 리포트 표시 / community 읽기-작성 / escalation 메시지 노출

**클라이언트에서 하면 안 되는 것:**
- signal extraction / risk scoring / pattern inference / medical-crisis 판단 / M43 retrieval logic → 모두 서버/오케스트레이터 레이어에서 처리

### 17.3 Experience API Layer

**추천 엔드포인트:**
- `POST /journey/held/message`, `POST /journey/dig/explore`, `POST /journey/get/insight`, `POST /journey/set/action`, `GET /journey/me/summary`
- `POST /session/start`, `POST /session/continue`, `POST /session/end`
- `GET /report/session/:id`, `GET /report/weekly`, `GET /report/monthly`
- `POST /community/post`, `GET /community/feed`
- `GET /support/escalation-resources`, `POST /support/escalation-ack`

**중요:** Experience API는 AI inference에 직접 접근하지 않는다 — 반드시 AI Orchestrator를 통해서만 상담 응답을 받는다.

### 17.4 AI Orchestration Layer (핵심)

**구성 요소:** Input Router / Context Builder / UX State Controller / Safety Gate / Question Strategy Planner / Response Composer / Escalation Controller / Memory Update Dispatcher

**처리 순서 (12단계):**
```text
1. Input 수신
2. UX state 확인
3. session context 불러오기
4. risk pre-check
5. signal extraction
6. pattern/desire/persona/sexual reasoning
7. M43 knowledge retrieval
8. response strategy 결정
9. LLM 호출 (Claude API)
10. post-response safety check
11. memory / ERS / graph update
12. report/event logging
```

**왜 Orchestrator가 필요한가?** LLM이 직접 모든 판단을 하면: 일관성 저하 / 위험 대응 실패 / hallucination 증가 / signal 기반 traceability 부재 / state-aware UX 붕괴

### 17.5 Signal & Risk Intelligence Layer (8개 서비스)

| 서비스 | 역할 |
|-------|------|
| Narrative Parser | actors/timeline/context/topic 추출, explicit vs implied 구분 |
| ERS Signal Extraction Engine | narrative → machine-readable signals, evidence_span/confidence/sensitivity_level 필수 |
| Pattern Inference Engine | signal cluster → pattern (pursue_withdraw / validation_dependency / boundary_collapse 등) |
| Persona Modeling Engine | approval_seeker / rescuer / controller / runner / observer / hidden_self 추정 |
| Desire Modeling Engine | intimacy/validation/security/stimulation/freedom/control/exclusivity tension 추정 |
| Sexual Dynamics Engine | frequency_mismatch / role_mismatch / cannot_discuss_desire / consent_ambiguity / post-sex_distress 탐지 |
| Risk & Crisis Detection Engine | self-harm/abuse/sexual_coercion/severe_depression/dependency_isolation → tier 0~4 분류 |
| Intervention Recommender | general_suggestion / boundary_clarification / conversation_framing / reflection_prompt / crisis_escalation 결정 |

### 17.6 Knowledge & Graph Layer

**M43 Knowledge Store:** frameworks / theories / research_outputs / Q&A / session_transcripts → response grounding + framework injection + retrieval-based augmentation

**Relationship Graph (Neo4j / Neptune 권장):**
- Nodes: User / Partner / Relationship / Event / Signal / Pattern / Persona / Desire / Intervention
- Edges: EXPERIENCED / TRIGGERED / REPEATS / CONFLICTS_WITH / DESIRES / IMPROVED_BY

**Personal Relational Memory Store:** pattern_profile / desire_profile / sexual_profile / risk_history / intervention_history / report_history → 빠른 읽기용 KV/document store

### 17.7 Data Platform Layer

| 구성 | 역할 |
|------|------|
| Operational DB | 실시간 서비스 (sessions/journey_states/raw_narratives/reports/AI_responses) |
| Event Bus | 비동기 이벤트 (narrative_submitted / signal_extracted / risk_tier_changed / escalation_triggered / report_generated) — Kafka/PubSub/SQS |
| Analytics Warehouse | retention / journey_progression / topic_distribution / escalation_rates / false_positive_metrics |
| Dataset Builder | raw+ERS+M43+outcome → counseling/pattern/sexual/risk/evaluation 학습 샘플로 변환 |
| Labeling/Review Pipeline | high-risk queue 검토 / ambiguous signals human review / gold label set 구축 |
| Feature Store | user_risk_trend / recurring_pattern_score / sexual_mismatch_trend / boundary_erosion_score / intervention_helpfulness_score |

### 17.8 Model Platform Layer (3단계 로드맵)

| 단계 | 구성 |
|------|------|
| 현재 | External LLM APIs (Claude API) + rule-based constraints + retrieval augmentation + lightweight classifiers |
| 중기 | signal/risk/pattern classifiers + report summarization models + sexual mismatch models |
| 장기 | Veilrum Counseling LLM + Sexual Counseling LLM + Risk Triage Model + Graph-aware Reasoning Model |

**모델 서빙 분리:** synchronous inference (실시간) / asynchronous batch (리포트, 트렌드 업데이트) / offline training / evaluation sandbox

### 17.9 Security / Audit / Governance Layer

**민감도 3등급:**
- low: 일반 감정, 일반 관계 갈등
- medium: 애착 불안, 수치심, 숨은 욕망, 반복 의존
- high: sexual_role_preference / fantasy_disclosure / coercion-abuse / self-harm / trauma

**Audit log 필수 항목:** 추출된 signal / 계산된 risk tier / escalation 발생 이유 / 사용 모델 버전 / 사용된 M43 reference

**Governance rules:** diagnosis claims 금지 / unsupported certainty 금지 / risk signal evidence_span 강제 / high-risk human review 큐 / training set provenance 보존

### 17.10 4가지 End-to-End Runtime Flows

**일반 Held 세션:**
```text
User enters Held → narrative submitted → parser → risk pre-check → low risk
→ emotion+topic signals → response strategy=holding → LLM 감정 수용 응답 → ERS update → session summary
```

**Dig 패턴 탐색 세션:**
```text
User enters Dig → recent narratives retrieve → recurring signals 추출 → pattern inference
→ M43 retrieval → response strategy=exploratory → question generation → pattern candidate stored
```

**Sexual mismatch 세션:**
```text
User discusses sexual mismatch → sexual signal extraction → consent/boundary check
→ risk pre-check → (no crisis) sexual dialogue mode → grounded response + clarifying question → sexual profile update
```

**Crisis escalation 세션:**
```text
User expresses self-harm/coercion → parser detects high-risk → risk score > threshold
→ Clinical Escalation Mode 전환 → 일반 상담 중단 → 안전 권고 → risk event logged → human review queue
```

### 17.11 Hallucination Prevention

1. **Signal-bounded interpretation** — signal bundle 밖의 내용 발화 금지
2. **Confidence-aware response** — low confidence→질문 / medium→tentative wording / high→still non-diagnostic
3. **Retrieval grounding** — M43 Q&A/frameworks를 internal grounding으로만 사용
4. **No medical diagnosis** — 우울증/PTSD/성중독 확정 진단 금지, 위험 신호/전문가 평가 필요성 언급
5. **Safety override precedence** — 관계 패턴 해석보다 self-harm/coercion/abuse 신호 우선

### 17.12 권장 기술 스택

| 레이어 | 기술 |
|-------|------|
| Frontend | React/Next.js or React Native, voice input/TTS |
| Backend | Python FastAPI or Node/NestJS |
| Operational DB | PostgreSQL/Supabase + Redis (session cache) |
| Event Bus | Kafka / PubSub / SQS |
| Search/Retrieval | OpenSearch/Elastic + Vector DB (M43 & narrative retrieval) |
| Graph | Neo4j / Neptune / graph layer over PostgreSQL |
| AI | Claude API (Anthropic) + Python ML services |
| Warehouse | BigQuery / Snowflake / ClickHouse |

### 17.13 개발 우선순위 (4 Phase)

| Phase | 핵심 항목 |
|-------|---------|
| Phase 1 — Safe MVP | Held/Dig 중심 UX + session service + narrative storage + basic signal extraction + risk pre-check + AI orchestrator v1 + M43 retrieval basic + audit logging |
| Phase 2 — Intelligence Expansion | Get/Set/Me + pattern inference + persona/desire modeling + sexual dialogue mode + report generation + dataset builder v1 |
| Phase 3 — Graph & Learning | relationship graph + trend reasoning + intervention outcomes + labeling/review pipeline + risk benchmark set + signal classifiers |
| Phase 4 — Specialized Models | counseling model fine-tuning + risk triage model + sexual counseling model + graph-aware reasoning |

### 17.14 가장 중요한 7가지 원칙

1. UX는 상태 기반
2. AI는 오케스트레이션 기반
3. 데이터는 ERS 기반
4. 해석은 M43 기반
5. 안전은 risk-first override
6. 학습은 provenance 기반
7. 할루시네이션은 evidence / confidence / review로 억제

---

*VCGPT_03_Product_Architecture.md | 통합 버전 v2 | 2026-03-16*
