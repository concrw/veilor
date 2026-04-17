# VEILOR 마스터 현황 문서

> 작성일: 2026-04-17  
> 목적: 프로젝트 탄생 배경 · 목적 · 설계 · 구현 현황 · 갭 · 앞으로 해야 할 것을 통합 정리  
> 갱신 주기: 주요 작업 완료 시마다 업데이트

---

## 목차

1. [VEILOR가 만들어진 이유](#1-veilor가-만들어진-이유)
2. [타깃 유저와 핵심 가치 제안](#2-타깃-유저와-핵심-가치-제안)
3. [서비스 철학과 설계 원칙](#3-서비스-철학과-설계-원칙)
4. [3가지 UX 모드 정의](#4-3가지-ux-모드-정의)
5. [B2B 방향성](#5-b2b-방향성)
6. [전체 기능 구현 현황](#6-전체-기능-구현-현황)
7. [DB 스키마 및 데이터 흐름](#7-db-스키마-및-데이터-흐름)
8. [설계-구현 갭 분석](#8-설계-구현-갭-분석)
9. [앞으로 해야 할 것 (우선순위별)](#9-앞으로-해야-할-것-우선순위별)

---

## 1. VEILOR가 만들어진 이유

### 1-1. 해결하려는 문제

VEILOR는 **멘탈헬스 관리의 구조화 부재** 문제를 해결하기 위해 만들어졌다.

| 문제 | 설명 |
|------|------|
| 감정 처리 공간 부재 | "그냥 이상해"를 털어놓을 곳이 없다. 민폐 주기 싫다. |
| 패턴 발견 불가 | 감정을 기록해도 반복 패턴을 스스로 발견하지 못한다 |
| 접근성 문제 | 민간 멘탈 코칭은 고가 (월 40~80만원), 진입 장벽 높다 |
| 일상-성장 간극 | 일상적 감정 처리와 장기적 자기이해 사이를 연결하는 도구가 없다 |

### 1-2. 해결 방식

**B2C**: AI 코칭 어시스턴트 "엠버"를 통한 24/7 감정 처리 + 데이터 기반 자기이해  
**B2B**: 엘리트 선수/아이돌의 오프라인 멘탈 코칭을 디지털 플랫폼으로 대체

---

## 2. 타깃 유저와 핵심 가치 제안

### 2-1. B2C 핵심 페르소나 3가지

| 페르소나 | 설명 |
|---------|------|
| **밤의 털어내기형** | 하루 끝 감정을 처리하고 싶지만 민폐 주기 싫다. 엠버와의 대화로 하루 마무리 |
| **감정 언어 약자형** | "그냥 이상해"를 출발점으로 삼는다. 구조화된 질문보다 흘러가는 대화가 편하다 |
| **반복 감정 처리형** | 비슷한 상황에서 같은 감정이 반복된다는 걸 어렴풋이 안다. 우선 쏟아내고 싶다 |

### 2-2. B2C 핵심 가치 제안

- 판단 없는 24/7 감정 처리 공간
- 개인 코칭비 대비 1/10 이하의 저가 진입
- 데이터 기반 자기이해 및 성장 추적

### 2-3. B2B 타깃 고객 (진입 순서)

| 순위 | 시장 | 이유 |
|-----|------|------|
| 1순위 | 스포츠 (프로구단/e스포츠) | 성과-멘탈 직접 연관, 고가 코칭 대체 효과 큼 |
| 2순위 | 엔터테인먼트 (기획사/아이돌) | 청소년 보호 규제 기회 (2026 표준계약 개정) |
| 3순위 | 기업 (EAP 대체) | 장기 수익화 기반 |

### 2-4. B2B 핵심 가치 제안

> "오프라인 코치 비용을 베일러로 대체한다"

| 항목 | 기존 (오프라인) | 베일러 도입 후 |
|------|-------------|-------------|
| 선수 20명 기준 연간 비용 | 3,500~5,000만원 | 2,000~2,500만원 |
| 절감률 | — | 40~50% |
| 위기 대응 | 사후 발견 | 24/7 AI 조기 감지 |

---

## 3. 서비스 철학과 설계 원칙

### 3-1. 5대 공통 원칙

| 원칙 | 설명 |
|------|------|
| **같은 데이터, 다른 경험** | DB 쿼리 추가 없음. 같은 데이터를 모드에 따라 다르게 렌더링 |
| **거절 옵션 항상 제공** | 선택지 항상 2개. "지금은 괜찮아" 탈출 옵션 필수 |
| **마찰 극소화** | 체크인 30초 이내. Day 1~7 극저마찰 진입 |
| **감정을 진단 대신 수용** | "약함/문제/진단" 프레임 완전 제거. 위기 개입이 아닌 일상 습관 시스템 |
| **누적 강조, 스트릭 죄책감 제거** | "이번 달 기록 23회" > "23일 연속". 끊겨도 처벌 없음 |

### 3-2. 플로우모드 철학

> "말하지 않아도 알 것 같은 존재, 엠버가 먼저 손 내미는 공간."

- 판단받지 않는다는 **안도감**
- "이끌려간다"는 **수동적 편안함**
- 대화 후 "조금 가벼워진" **감각**
- 직접 CTA 버튼 금지. 해결책 제시 금지. 반영형 응답만.
- 수치형 스트릭 없음 → 엠버의 관계 언어로 대체: "우리 얘기한 지 7일 됐어. 꽤 됐다."
- 스트릭 끊김 표시 색상: 절대 빨강 금지. amber 계열만 사용.

### 3-3. 시스템모드 철학

> "지금 내 상태가 숫자로 보이고, 다음에 뭘 하면 되는지 자동으로 나온다."

- "오늘 내가 한 일이 보인다" → **효능감**
- "내 패턴이 읽힌다" → **자기이해**
- "다음에 뭘 하면 되는지 안다" → **방향감**

### 3-4. B2B 핵심 원칙

- 개인 식별과 집계를 물리적으로 분리 (소속사는 팀 트렌드만, 개인 내용 비공개)
- 이벤트 컨텍스트 자동 태깅 ("경기 후 스트레스 증 10%")
- 계약 해지 후에도 개인 데이터는 유저 소유

---

## 4. 3가지 UX 모드 정의

### 4-1. 플로우모드 (오리지널)

**상태**: 기준 확정. 전 페이지 적용 진행 중.

**디자인 언어**
```
배경:   #1C1917 (stone-950, 웜 다크)
포인트: #D4A574 (amber-gold)
서피스: #292524
텍스트: #F5F5F4 / #A8A29E / #57534E
폰트:   DM Sans
```

**탭별 경험**

| 탭 | 역할 | 특징 |
|----|------|------|
| Vent | 감정 처리 | 엠버와 자유 대화, 감정 8가지 선택 |
| Dig | 패턴 발견 | "자주 느끼는 것" 서술 카드. 분석 용어 제거 |
| Get | 콘텐츠 | 엠버가 1가지만 큐레이션 (과선택 방지) |
| Set | 목표 | 엠버가 Vent/Dig 기반으로 제안 (유저 입력 없음) |
| Me | 기록 | "이번 달의 나" 서술 + 감정 히트맵 amber |

**리텐션**
- 푸시: "오늘 어땠어? 나 여기 있어." (저녁 9~11시)
- 수치형 스트릭 없음 → 엠버의 관계 언어로 대체
- 30일 "엠버 편지" + 계절별 산문형 리포트

---

### 4-2. 음성모드

**상태**: ⚠️ 설계 불완전. 구현 없음.

**정의**: 텍스트 입력 없이 음성만으로 베일러의 모든 핵심 기능을 사용하는 모드. 화면은 최소화, 음성이 주된 인터랙션 수단.

**미해결 설계 항목**
- 음성 입력 중 화면에 무엇이 보여야 하는가? (파형? 텍스트 변환? 최소화?)
- 음성 응답도 TTS로 나오는가?
- 탭 네비게이션은 음성 명령으로 처리하는가?
- 운전 중, 산책 중 핸즈프리 시나리오 커버 여부?

**현재 구현**
- useSpeechRecognition, useSpeechSynthesis 훅 존재 (접근성 강화 완료)
- AILeadOverlay에 음성 입력/출력 통합
- 독립된 음성모드 화면 없음. VentPage에 모드 분기 없음.

**벤치마킹 대상**: Apple Siri, Google Assistant, Otter.ai

---

### 4-3. 시스템모드 (클리어, Clear)

**상태**: 설계 확정. 홈/Dig/Me 탭 구현 완료. Set/Get 탭 미구현.

**이름**: "클리어 (Clear)" — 코드베이스와 디자인 토큰에 이미 정착. 변경 비용 높아 유지.

**디자인 언어**
```
배경:      #0D1117 (쿨 다크)
서피스:    #111318
포인트:    #4AAEFF (clear blue)
성공:      #34C48B (mint)
경고:      #F59E0B (amber)
보라:      #A78BFA (V-Score)
텍스트:    #F1F5F9 / #94A3B8 / #475569
```

**홈 화면 구조 (ZONE A~F)**

| ZONE | 내용 | 구현 |
|------|------|------|
| A 헤더 | CLEAR + 날짜 | ✅ |
| B 관계 건강도 | 점수(빈도40+기분40+스트릭20) + 5-dot + 주간 목표 바 | ✅ |
| C 체크인 | 슬라이더(1~10) + 활동 탭 → clear_checkin 저장. 완료 후 압축 카드 | ✅ |
| D 주간 스냅샷 | 7일 바차트 + 활동-감정 인사이트 1줄 | ✅ |
| E Daily Challenge | getChallengeByScore() 점수 구간별 Adaptive. localStorage 완료 저장 | ✅ |
| F AI 인사이트 | 주 1회, **체크인 3회 이상 + 마지막 표시로부터 7일 경과** 조건, 규칙 기반 텍스트 | ❌ 미구현 |

**Adaptive 조건**
- score ≥ 70: 관계/행동 챌린지
- 40 ≤ score < 70: 기본 순환
- score < 40: 회복/자기이해 챌린지 + RecoveryCard 노출

**탭별 구현 현황**

| 탭 | 클리어 모드 내용 | 구현 |
|----|----------------|------|
| 홈 (Vent) | 대시보드 ZONE A~E | ✅ ClearHome.tsx |
| Dig | 감정 트렌드 꺾은선 + 활동별 평균 바차트 | ✅ DigPage ClearDigView |
| Me | 이번달 수치 3개 + 월간 캘린더 히트맵 | ✅ MePage ClearMeView |
| Set | 목표 진행도 대시보드 | ❌ 미구현 |
| Get | 코스 카드 구조 (진행중/추천) | ❌ 미구현 (콘텐츠 선행 필요) |

---

## 5. B2B 방향성

### 5-1. 코어 제품: 4C 체크인 시스템

선수/트레이니의 멘탈 상태를 4C 모델로 측정:
- **C1 Control** (통제감): 1~10점
- **C2 Commitment** (헌신도): 1~10점
- **C3 Challenge** (도전 인식): 1~10점
- **C4 Confidence** (자신감): 1~10점

위기 점수 알고리즘 (Edge Function: calc-risk-score):
```
신호 A: 4C 평균 ≤ 3.0 → +40점
신호 B: 5연속 하락 → +35점
신호 C: 텍스트 위험 키워드 → 즉시 HIGH
→ 등급: normal / low / medium / high
```

### 5-2. 트레이니 보호 설계

- 만 14세 이상: 본인 동의 없이 보호자 열람 불가 (2026년 표준계약 기준)
- 소속사 어드민: 팀 집계(익명)만. 개인 내용 DB 레벨 차단.
- "약함/문제/진단" 언어 앱 전체에서 제거

### 5-3. B2B 라우트 현황 (10개, 모두 구현 완료)

| 라우트 | 파일 | 역할 |
|--------|------|------|
| /b2b/onboarding | OrgOnboarding.tsx | 조직 온보딩 |
| /b2b/dashboard/:orgId | OrgDashboard.tsx | 조직 대시보드 (4C 레이더, 위험 인원) |
| /b2b/checkin/:orgId | Checkin.tsx | 직원/선수 4C 체크인 |
| /b2b/trainee-checkin/:orgId | TraineeCheckin.tsx | 트레이니 전문 체크인 |
| /b2b/invite/:orgId | MemberInvite.tsx | 멤버 초대 |
| /b2b/coach-match/:orgId | CoachMatch.tsx | 코치 매칭 |
| /b2b/guardian/:orgId | GuardianApp.tsx | 보호자 앱 (이행률만) |
| /b2b/coaches | CoachList.tsx | 코치 목록 |
| /b2b/coaches/:coachId | CoachProfile.tsx | 코치 상세 |
| /b2b/coach/portal | CoachPortal.tsx | 코치 포털 |

### 5-4. 가격 구조 (veilor_b2b.md §9 기준, 인당/월)

**성인 모드 (데뷔 후 선수/아이돌/직원)**

| 플랜 | 멤버 수 | 인당 월 요금 | 포함 |
|------|--------|------------|------|
| 스타터 | 5~20명 | 89,000원 | 앱 무제한 + 코칭 세션 2회/인/월 + 어드민 대시보드 |
| 그로스 | 21~50명 | 69,000원 | + 집단 리포트 + 캘린더 연동 |
| 엔터프라이즈 | 51명+ | 협의 (49,000원~ 기준) | 전체 + 전담 코치 배정 + 월별 임원 리포트 |

**트레이니 모드 (미성년 트레이니)**

| 플랜 | 멤버 수 | 인당 월 요금 | 포함 |
|------|--------|------------|------|
| 트레이니 베이직 | 5~30명 | 59,000원 | 주니어 앱 + 체크인 무제한 + 그룹 코칭 2회/월 + 보호자 앱 + 어드민 집계 |
| 트레이니 풀 | 31명+ | 45,000원 | + 개인 코칭 1회/인/월 + 심사 전후 전용 체크인 + 방출 케어 플로우 |

**애드온**

| 항목 | 요금 | 설명 |
|------|------|------|
| 추가 코칭 세션 | 55,000원/세션 | 플랜 할당량 초과 시 |
| 위기 상담 연결 | 75,000원/세션 | 전문 상담사 연결 (코칭→상담 라우팅) |
| 방출 케어 패키지 | 200,000원/인 | 방출 후 30일 집중 케어 플로우 |
| 임원 브리핑 리포트 | 150,000원/회 | 소속사 임원 대상 맞춤 분석 리포트 |

---

## 6. 전체 기능 구현 현황

### 6-1. 라우트 전체 목록 (26개)

#### 인증 & 온보딩

| 라우트 | 파일 | 줄수 | 역할 |
|--------|------|-----|------|
| /auth/login | Login.tsx | 203 | 이메일/Google 로그인, 한국어 에러 메시지 |
| /auth/signup | Signup.tsx | 278 | 회원가입 + 비밀번호 강도 표시 |
| /onboarding/welcome | Welcome.tsx | 137 | 초기 인사 |
| /onboarding/cq | CoreQuestions.tsx | 163 | 4축 진단 (A애착/B소통/C욕구/D역할) |
| /onboarding/vfile/start | vfile/Start.tsx | 64 | V-File 시작 |
| /onboarding/vfile/questions | vfile/Questions.tsx | 198 | V-File 세부 질문 |
| /onboarding/vfile/result | vfile/Result.tsx | 275 | V-File 결과 |
| /onboarding/mode-select | ModeSelect.tsx | 145 | UX 모드 선택 (original/clear/routine) |

#### 메인 앱 홈

| 라우트 | 파일 | 줄수 | 역할 | 모드분기 |
|--------|------|-----|------|---------|
| /home/vent | VentPage.tsx | 468 | 감정 선택 → AI 대화 → 신호 수집 | ❌ |
| /home/dig | DigPage.tsx | 707 | 패턴 분석. Clear: 데이터 시각화 | ✅ |
| /home/get | GetPage.tsx | 200 | V-File 기반 자기 구조 탭 | ❌ |
| /home/set | SetPage.tsx | 413 | CODETALK + 경계 설정 + Ax Mercer | ❌ |
| /home/me | MePage.tsx | 667 | 자기 대시보드. Clear: 히트맵 | ✅ |
| /home/dm | DmPage.tsx | 318 | DM 채팅 (필터링/안전성) | ❌ |
| /home/dive | DivePage.tsx | 220 | Division 선택 M43 매칭 | ❌ |
| /home/community | CommunityPage.tsx | 329 | 커뮤니티 피드 | ❌ |
| /home/sexself/* | sexself/ | 740 | 성적 자기결정권 진단 | ❌ |
| /users/:userId | UserProfilePage.tsx | 186 | 타유저 프로필 + DM 진입 | ❌ |
| /personas | Personas.tsx | 222 | 멀티페르소나 목록 (프리미엄) | ❌ |
| /admin | AdminDashboard.tsx | 647 | 관리자 대시보드 | ❌ |

#### 모드별 홈 (Vent 탭 분기)

| 파일 | 줄수 | 역할 |
|------|-----|------|
| ClearHome.tsx | 640 | 시스템모드 홈 (대시보드) |
| RoutineHome.tsx | 286 | 루틴모드 홈 (스트릭 + 7일 도트) |

### 6-2. Context

| Context | 주요 상태 | 역할 |
|---------|---------|------|
| AuthContext | user, onboardingStep, axisScores, primaryMask | 인증 + 온보딩 진행도 |
| ModeContext | mode (original/clear/routine), localStorage 저장 | UX 모드 전환 |
| LanguageContext | lang | 다국어 |

### 6-3. 주요 Hook 그룹

| 그룹 | 개수 | 역할 |
|------|-----|------|
| 코어 데이터 | 10+ | useUserMeData, usePersonas, useChat 등 |
| 신호/분석 | 5+ | useSignalPipeline, useAmberAttention, useM43WhyIntegration 등 |
| B2B | 2 | useB2BOrg, useB2BCoach |
| 페르소나 | 6 | usePersonaQueries, usePersonaMutations, usePersonaGrowth 등 |
| CodeTalk 전문 | 30+ | useConnections, useKeywordDiversity, useEmotionAnalysis 등 |
| 음성 | 2 | useSpeechRecognition, useSpeechSynthesis |
| 유틸 | 10+ | usePremiumTrigger, useLongPress, useTranslation 등 |

### 6-4. Edge Functions (26개)

| 함수 | 역할 |
|------|------|
| detect-personas | Why 세션 완료 후 페르소나 자동 감지 |
| analyze-persona-relationships | 페르소나 간 시너지/갈등 분석 |
| generate-ikigai | Ikigai 4요소 분석 |
| generate-brand-strategy | 브랜드 전략 생성 |
| analyze-perspective | Prime Perspective 분석 |
| analyze-why-patterns | Why 패턴 분석 |
| embed-m43-questions | M43 질문 임베딩 벡터 생성 |
| held-chat | Held Emotion 채팅 AI |
| dig-interpret | DIVE 세션 감정 해석 |
| dig-semantic-search | DIVE 시맨틱 검색 |
| codetalk-ai-insights | CodeTalk 일일 AI 인사이트 |
| calc-risk-score | B2B 위기 감지 알고리즘 |
| calculate-compatibility | 사용자 매칭 호환성 점수 |
| signal-tagging-worker | 신호 자동 태깅 |
| release-care-scheduler | B2B 릴리스 케어 스케줄러 |
| release-care-trigger | B2B 릴리스 이벤트 트리거 |
| dm-message-filter | DM 메시지 필터링 |
| collect-vitals | Core Web Vitals(LCP/FID/CLS) 수집 → web_vitals 테이블 저장 |
| send-email | 이메일 발송 |
| send-push-notification | 푸시 알림 발송 |
| create-checkout-session | Stripe 결제 세션 생성 |
| stripe-webhook | Stripe 웹훅 핸들링 |
| generate-weekly-report | 주간 리포트 자동 생성 |
| generate-monthly-report | 월간 리포트 자동 생성 |
| recommend-content | 콘텐츠 추천 |
| delete-user-data | 유저 데이터 삭제 (GDPR) |

---

## 7. DB 스키마 및 데이터 흐름

### 7-1. 주요 테이블 (Veilor Schema)

| 테이블 | 역할 | 핵심 컬럼 |
|--------|------|---------|
| user_profiles | VEILOR 유저 데이터 | user_id, nickname, primary_mask, axis_scores, streak_count |
| priper_sessions | 프리퍼(V-File) 진단 | user_id, primary_mask, axis_scores, is_completed |
| tab_conversations | 탭별 AI 대화 + 체크인 데이터 | user_id, tab, stage, role, content(JSON) |
| why_sessions | Why 분석 세션 | user_id, status, prime_perspective, happy_patterns, m43_domain_matches |
| persona_profiles | 페르소나 | user_id, persona_name, archetype, strength_score, rank_order |
| persona_relationships | 페르소나 간 관계 | persona_a_id, persona_b_id, synergy_score, conflict_score |
| dive_sessions | DIVE 감정 세션 | user_id, mode, emotion, messages, held_keywords |
| codetalk_keywords | CodeTalk 일일 주제 | keyword, day_number |
| codetalk_entries | CodeTalk 일일 작성 | user_id, keyword, content, is_public, anon_alias |
| dm_rooms | DM 방 | user_a_id, user_b_id, is_active, consent_a, consent_b |
| m43_frameworks | M43 프레임워크 | code, name, core_question |
| m43_domain_questions | M43 도메인 질문 | domain_id, question, keywords, embedding 벡터 |

### 7-2. B2B 테이블

| 테이블 | 역할 |
|--------|------|
| b2b_orgs | 조직사 (org_type: sports/entertainment/corporate) |
| b2b_org_members | 멤버 (member_type: member/trainee/admin) |
| b2b_checkin_sessions | 4C 체크인 (c_control, c_commitment, c_challenge, c_confidence, risk_level) |
| b2b_coaching_sessions | 코칭 세션 (coach_id, scheduled_at, coach_notes) |
| b2b_coaches | 코치 프로필 (domains, specialties, avg_rating) |
| b2b_org_aggregate | 주간 집계 (팀 트렌드, 위험 등급별 인원 수) |
| b2b_trainee_profiles | 트레이니 (birth_year, ltad_stage, guardian_consent_at) |

### 7-3. 핵심 데이터 흐름

```
[체크인 플로우 — Clear 모드]
ClearHome → tab_conversations INSERT (tab='clear_checkin', content=JSON{mood_score, activities})
→ queryClient.invalidateQueries → ClearHome 점수 재계산

[B2B 위기 감지]
TraineeCheckin → b2b_checkin_sessions INSERT
→ Edge: calc-risk-score → risk_level 판정
→ 코치 notifications INSERT / push 발송

[음성 대화]
AILeadOverlay → useSpeechRecognition (STT)
→ AI 응답 → useSpeechSynthesis (TTS)
→ tab_conversations INSERT

[페르소나 생성]
why_sessions 완료
→ Edge: detect-personas → persona_profiles INSERT
→ Edge: analyze-persona-relationships → persona_relationships INSERT
```

### 7-4. 보안 설계

- RLS: 모든 개인 테이블 `auth.uid() = user_id` 격리
- B2B: org_id 기준 멀티테넌트 격리 (Edge Function에서 검증)
- 익명 공유: CodeTalk만 허용 (anon_alias + anon_author_map)
- 프리미엄: subscriptions.tier 기준 페르소나 rank_order 제한
- 채팅: Realtime은 chat_messages 테이블만 활성화

---

## 8. 설계-구현 갭 분석

### 8-1. 설계 있음 / 구현 완료 ✅

| 항목 | 설계 문서 | 구현 파일 |
|------|---------|---------|
| 플로우모드 전체 UI 토큰 | veilor_ux_modes.md | HomeLayout, 전 페이지 |
| 웹 반응형 레이아웃 | veilor_ux_modes.md | HomeLayout.tsx (lg:ml-[200px], DesktopSidebar) |
| 시스템모드 ZONE A~E | veilor_systemmode_plan.md | ClearHome.tsx |
| Adaptive 체크인 (score <40 회복카드) | veilor_systemmode_plan.md | ClearHome.tsx RecoveryCard |
| Daily Challenge 30개 + Adaptive | veilor_systemmode_plan.md | challengeConstants.ts |
| Dig 탭 데이터 시각화 (Clear) | veilor_systemmode_plan.md §6-1 | DigPage.tsx ClearDigView |
| Me 탭 월간 캘린더 히트맵 (Clear) | veilor_systemmode_plan.md §6-4 | MePage.tsx ClearMeView |
| 루틴모드 홈 | veilor_ux_modes.md | RoutineHome.tsx |
| B2B 10개 라우트 전체 | veilor_b2b.md | /b2b/* 전체 |
| 유저 프로필 페이지 + DM 진입 | veilor_ux_modes.md | UserProfilePage.tsx |
| 음성 접근성 (VoiceState, iOS Safari) | veilor_ux_modes.md | useSpeechRecognition/Synthesis, AILeadOverlay |
| 경쟁사 UX 벤치마킹 | — | veilor_systemmode_benchmark.md |
| 숨은 기능 노출 (탭 제한 해제 등) | veilor_ux_modes.md | HomeLayout, GetPage |

### 8-2. 설계 있음 / 구현 없음 ❌

| 항목 | 설계 문서 | 우선순위 | 비고 |
|------|---------|---------|------|
| **ZONE F — AI 인사이트** | veilor_systemmode_plan.md §5-7 | **P2** | 주 1회, 규칙 기반. 조건: 체크인 3회+ & 7일 경과 |
| **Set 탭 — Clear 목표 대시보드** | veilor_systemmode_plan.md §6-3 | **P2** | 활성목표 진행 바, 완료 목표 섹션 |
| **Get 탭 — Clear 코스 카드** | veilor_systemmode_plan.md §6-2 | **P3** | 콘텐츠 없음. 콘텐츠 기획 선행 필요 |
| **음성모드 전용 화면** | veilor_ux_modes.md 모드2 | **P3** | 설계 자체 불완전 ("화면 UI 기준 없음") |
| **커뮤니티 탭 통합** | veilor_ux_modes.md | **P3** | 각 탭에 같은 경험의 사람들 목소리 노출 |

### 8-3. 구현 있음 / 설계와 다른 것 🔄

| 항목 | 설계 | 구현 | 차이 |
|------|------|------|------|
| 활동 옵션 수 | 4개 + 커스텀 | 6개 고정 (휴식/공부 추가) | 커스텀 추가 없음 |
| ZONE D 인사이트 | 명시적 정의 | WeekSnapshotCard insightText로 구현 | ✅ 구현됨 (설계문서 에이전트 오판) |

---

## 9. 앞으로 해야 할 것 (우선순위별)

### P1 — 즉시 가능, 독립 작업

| 작업 | 설명 | 예상 규모 |
|------|------|---------|
| **veilor_systemmode_benchmark.md + veilor_systemmode_plan.md 커밋** | 미커밋 문서 2개 | git add + commit |

### P2 — 구현 가능, 병렬 작업 가능

| 작업 | 설명 | 예상 규모 | 선행 조건 |
|------|------|---------|---------|
| **ClearHome ZONE F — AI 인사이트** | 주 1회 규칙 기반 패턴 분석 카드. 체크인 3회+/7일 조건 | ~60줄 | 없음 |
| **SetPage — Clear 모드 목표 대시보드** | useMode 분기 추가, 목표 카드 + 진행 바 | ~150줄 | 없음 |

### P3 — 콘텐츠/설계 선행 필요

| 작업 | 설명 | 선행 조건 |
|------|------|---------|
| **GetPage — Clear 코스 카드** | 진행 중/추천 코스 카드 구조 | 코스 콘텐츠 기획 먼저 |
| **음성모드 전용 화면** | 화면 UI 설계 완성 후 구현 | 설계 먼저 (화면 기준 없음) |
| **커뮤니티 탭 통합** | 각 탭에 동일 경험자 목소리 노출 | 설계 + DB 구조 설계 먼저 |

### P3 (추가) — B2B 구현 심화

| 작업 | 설명 | 선행 조건 |
|------|------|---------|
| **B2B 트레이니 모드 UI 기획** | 트레이니 베이직/풀 플랜 전용 UX. 심사 전후 체크인 분기 | 없음 (설계만 먼저) |
| **B2B 애드온 UX 설계** | 추가 세션 신청, 위기 상담 라우팅, 방출 케어 플로우 진입점 | 없음 (설계만 먼저) |

### P4 — 제품 방향 결정 필요

| 작업 | 설명 | 결정 필요 사항 |
|------|------|-------------|
| **Google OAuth 수정** | Supabase 대시보드 client secret 업데이트 | Supabase 대시보드 접근 |
| **배포 (veilor.ai)** | 프로덕션 배포 | 배포 시점 결정 |
| **음성모드 설계** | 화면 UI 기준 수립 | 벤치마킹 후 설계 회의 |
| **Get 탭 코스 콘텐츠 기획** | 관계 개선 코스 주제/세션 수 결정 | 콘텐츠 팀 필요 |
| **B2B 가격 확정** | 현재 구조안. 파일럿 고객사 조건에 따라 조정 필요 | 영업 협의 |

---

## 부록 A — 설계 문서 목록

| 파일 | 내용 | 상태 |
|------|------|------|
| veilor_ux_modes.md | 3가지 UX 모드 설계 전체 | 커밋됨 |
| veilor_systemmode_plan.md | 시스템모드(Clear) 프론트엔드 기획서 | **미커밋** |
| veilor_systemmode_benchmark.md | 경쟁사 6개 UX 벤치마킹 | **미커밋** |
| veilor_b2b.md | B2B 서비스 전략 및 설계 | 커밋됨 |

## 부록 B — 기술 스택

| 항목 | 기술 |
|------|------|
| 프론트엔드 | React 18 + TypeScript + Vite |
| 스타일 | Tailwind CSS + shadcn/ui |
| 라우팅 | React Router v6 |
| 서버 상태 | TanStack Query |
| 백엔드 | Supabase (PostgreSQL + Auth + Edge Functions + Realtime) |
| 결제 | Stripe |
| 음성 | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| 폰트 | DM Sans |

---

*이 문서는 VEILOR의 현재 상태를 가장 정확하게 반영한 단일 소스입니다.*  
*다음 갱신: P2 작업 완료 후*
