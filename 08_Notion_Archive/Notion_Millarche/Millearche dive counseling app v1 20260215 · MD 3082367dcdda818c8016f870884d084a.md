# Millearche dive counseling app v1 20260215 · MD

## 프로젝트 종합 문서 Ver.1.0

---

# 1. 프로젝트 개요

## 기본 정보

| 항목 | 내용 |
| --- | --- |
| **프로젝트명** | DIVE (나와 그 사람의 심연 속으로의 초대) |
| **핵심 컨셉** | AI 기반 연애 심리 상담 및 관계 분석 플랫폼 |
| **타겟 사용자** | 20-30대 연애 고민자, 자기 성찰을 원하는 사용자 |
| **개발 환경** | [Lovable.dev](http://Lovable.dev), React, TypeScript, Supabase |

## 서비스 슬로건

> **"연애? 그 사람 속으로 얼마나 깊이 들어가봤는데?**
> 

> **그리고 넌 네 속은 제대로 아니?"**
> 

## 핵심 철학

'열 길 물 속은 알아도 한 길 사람 속은 알기 어렵다.'

DIVE는 연애 관계의 곉이 아니라 **'심연'**을 들여다보는 상담 서비스입니다. 감정의 깊이, 언어의 층위, 무의식의 패턴까지 파고들어 진짜 나와 타인을 이해하고 회복하는 연애심리 플랫폼입니다.

## 첫 진입 동선

- 로그인 전: 슬로건 노출
- 로그인 후: 니체 명언 랜덤 노출 - *"심연을 들여다보면, 그 심연도 너를 들여다본다." – F. 니체*

---

# 2. 핵심 기능

## 2.1 커뮤니티 (무료)

**주제**: '내가 만난 가장 사이코'

- 익명 기반 글쓰기 (텍스트 + 이미지)
- 댓글 / 대댓글 시스템
- 감정 리액션
- 신고 및 블라인드 처리

## 2.2 F모드 - 감정 공감형 AI 상담

**목적**: 감정 분출 및 정서적 위로

- 텍스트 입력 + 음성 입력 (Whisper API → 텍스트 전환)
- 공감, 수꺍, 격려 중심 멘트 제공
- GPT 프롬프트: "사용자의 편을 100% 들어주는 감정 상담사"
- 대화 기록 저장 (sessions, messages 테이블)

## 2.3 T모드 - 분석형 AI 상담

**목적**: 인지 · 관계 패턴 분석 및 해결책 제시

- 입력: 텍스트, 음성 (Whisper), 이미지 (OCR)
- 분석 범위: 문장별 + 대화 전체 전방위 분석
- 분석 결과: 감정 분포 시각화, 핵심 갈등 요약, 상대 행동 패턴 분석, A/B/C 전략 해결책
- GPT 프롬프트: "연애 심리학, 인지심리학, 정신병리학 기반 분석"

## 2.4 관계력 추적 시스템

유저의 관계력 지표 시각화

- 감정 안정도
- 갈등 발생 빈도
- 대화 회복도
- 상대방 유형 반복성

Supabase 테이블: `relationship_metrics` (stability_score, conflict_score, recovery_score, pattern_score)

## 2.5 전문가 상담 연결

- 상담사 리스트 조회 + 필터 (성별/지역/비용/스타일/후기)
- 상담 가능 시간 선택 → 결제 → 음성상담
- WebRTC or 외부 연동 (Zoom link)
- 자동 녹음 → 저장 및 리포트 생성
- 상담사 등록: Stripe 일회성 회비 결제 후 등록

## 2.6 프리미엄 - 나만의 AI 상담사

- 유저가 원하는 얼굴 + 목소리로 상담사 생성
- 프리셋 음성 선택 or 녕음 업로드 → Voice Cloning (ElevenLabs)
- 얼굴 선택 (프리셋 or 사용자 이미지 → D-ID 연동)
- 채팅/음성 상담 시 선택된 상담사 TTS로 답변

---

# 3. 기술 스택

| 분류 | 기술 |
| --- | --- |
| 프론트엔드 | React 18, TypeScript, Tailwind CSS, Lucide Icons |
| 백엔드 | Supabase (Auth, Database, Storage, Realtime) |
| AI | OpenAI GPT-4o, Whisper API, ElevenLabs/PlayHT, OCR API |
| 결제 | Stripe (정기구독, 일회성, 상담사 회비) |
| 개발 도구 | [Lovable.dev](http://Lovable.dev), Vite, ESLint, Prettier |

---

# 4. 현재 구현 상태

## 4.1 구현 완료 컴포넌트

| 컴포넌트 | 설명 |
| --- | --- |
| NetworkBackground.tsx | Canvas 기반 네트워크 애니메이션 배경 |
| App.tsx | 메인 앱 구조 (랜딩, 대시보드, 네비게이션) |
| Profile.tsx | 마이페이지 (관계력 지표, 상담 기록, 설정) |
| CounselingSelect.tsx | 상담 방식 선택 화면 (F/T모드, 전문가) |
| DiagnosisCenter.tsx | 진단 센터 (애착유형, 연애 패턴, 갈등 대처, 상대방 분석) |

## 4.2 디자인 특징

- 다크 테마 기반 (배경 검은색, 텍스트 흰색/회색)
- 얇고 세련된 폰트 (font-thin, font-light)
- 유리 모피즘 효과 (backdrop-blur, border-opacity)
- 부드러운 트랜지션 (hover 효과, duration-300~500)
- 미니말한 아이콘 (Lucide Icons, 14-16px)

## 4.3 주요 UI/UX 패턴

**랜딩 화면**: 중앙 정렬 DIVE 로고 + 서브타이틀 + CTA 버튼

**메인 대시보드**: 니체 명언 섹션 + 메인 네비게이션 카드 (F/T모드, 커뮤니티, 전문가)

**하단 네비게이션**: 홈, 커뮤니티, 진단, 상담, 마이페이지

---

# 5. 파일 구조

- `src/components/ui/` - Button, Card, Input, Modal, LoadingSpinner
- `src/components/layout/` - Header, Navigation, Footer
- `src/components/auth/` - LoginForm, SignupForm, GoogleAuthButton
- `src/components/chat/` - ChatInterface, MessageBubble, VoiceRecorder, AnalysisReport
- `src/components/community/` - PostCard, PostForm, CommentSection, ReactionButtons
- `src/components/expert/` - TherapistCard, TherapistProfile, AppointmentBooking, VoiceCall
- `src/components/dashboard/` - RelationshipMetrics, ProgressChart, ActivityHistory
- `src/components/premium/` - SubscriptionPlans, CustomAICreator, PaymentForm
- `src/pages/` - LandingPage, Dashboard, FModeChat, TModeAnalysis, Community, ExpertConsultation, Profile, Settings, Admin
- `src/hooks/` - useAuth, useChat, useSupabase, usePayment
- `src/services/` - supabase, openai, stripe, audioService

---

# 6. 데이터베이스 설계 (Supabase)

## 6.1 핵심 테이블

- **users** - 사용자 (email, nickname, gender, preferred_voice)
- **posts** - 커뮤니티 게시글 (user_id, content, image_url)
- **comments** - 댓글 (post_id, user_id, content)
- **sessions** - 상담 세션 (user_id, mode F/T)
- **messages** - 상담 메시지 (session_id, role user/assistant, content)
- **relationship_metrics** - 관계력 지표 (stability/conflict/recovery/pattern_score)
- **therapists** - 상담사 (name, specialty, location, hourly_rate, bio)
- **appointments** - 상담 예약 (therapist_id, scheduled_at, status, payment_status)
- **recordings** - 상담 녹음 (appointment_id, file_url, transcript)
- **user_plans** - 사용자 구독 (plan_type BASIC/INSIGHT/CUSTOM, status)
- **payment_history** - 결제 기록 (amount, payment_type, stripe_payment_id)

---

# 7. 수익 모델

## 7.1 구독 요금제 (7일 무료 체험)

| 플랜 | 가격 | 제공 기능 |
| --- | --- | --- |
| BASIC | 9,900원/월 | F모드, 커뮤니티 |
| INSIGHT | 19,800원/월 | T모드, 리포트, 관계력 추적 |
| CUSTOM | 29,800원/월 | AI 상담사 생성, TTS, 리포트 저장 |

## 7.2 추가 수익원

- 전문가 상담: 상담사별 건당 수수료 (~30%)
- 상담사 등록 회비: 월 회비 납부
- 프리미엄 리포트: PDF 출력, 음성 응답 추가

## 7.3 수익 예측 (월 활성 사용자 1,000명 기준)

- 구독 매출: 200명 × 15,000원 = 3,000,000원
- 전문가 상담 수수료: 50건 × 50,000원 × 30% = 750,000원
- **총 월 매출: 약 3,750,000원**

---

# 8. 개발 로드맵

## Phase 1: MVP 완성 (1-2개월)

- Supabase DB 구축 및 인증 시스템
- 커뮤니티 기능 (게시글, 댓글, 리액션)
- F모드 AI 상담 (GPT-4o 연동)
- T모드 분석 기능
- 기본 UI/UX 완성

## Phase 2: 핵심 기능 고도화 (2-3개월)

- 음성 입력 (Whisper API)
- 관계력 추적 시스템
- 전문가 상담 예약
- Stripe 결제 연동
- 베타 테스트

## Phase 3: 프리미엄 및 확장 (3-4개월)

- 커스텀 AI 상담사 (Voice Cloning)
- TTS 음성 응답
- 진단 센터 확장
- 관리자 패널
- 정식 출시

## Phase 4: 성장 및 최적화 (지속)

- AI 모델 최적화
- 네이티브 모바일 앱
- B2B 솔루션

---

# 9. 경쟁 우위

## 핵심 차별화

1. **감정과 분석의 이중 접근** - F/T모드로 다양한 니즈 충족
2. **깊이 있는 분석** - 단순 위로를 넘어 패턴 분석 및 구체적 해결책
3. **관계력 추적** - 장기적 관계 성장 시각화
4. **전문가 연결** - AI + 전문가 하이브리드 모델
5. **커스터마이징** - 나만의 AI 상담사 생성
6. **커뮤니티 기반** - 익명 공유를 통한 공감과 치유

| 기준 | 기존 서비스 | DIVE |
| --- | --- | --- |
| 상담 방식 | 일방적 AI 반응 | F/T 모드 선택 |
| 분석 깊이 | 표면적 답변 | 심층 패턴 분석 |
| 성장 추적 | 없음 | 관계력 지표 시각화 |
| 커스터마이징 | 제한적 | 완전한 개인화 |

---

# 10. 향후 비전

## 장기 목표

> **DIVE는 단순한 연애 상담 앱을 넘어, 인간 관계 전반을 이해하고 성장시키는 종합 감정 플랫폼으로 진화할 것입니다.**
> 

## 확장 계획

1. **가족 관계 상담** - 부모-자녀, 형제자매, 세대 간 소통
2. **직장 관계 코칭** - 상사-부하, 동료 간 갈등, 조직 문화
3. **자기 성찰 도구** - 심층 자아 탐구, 개인 성장 로드맵
4. **기업 솔루션 (B2B)** - 조직 소통 진단, 팀 빌딩, 리더십 코칭

## 기술 진화 방향

1. AI 모델 고도화 (사용자 데이터 기반 학습, 문화적 맥락 이해)
2. 멀티모달 상담 (음성/텍스트/영상 통합, 표정 인식, VR/AR 몰입형)
3. 생태계 구축 (심리 전문가 네트워크, 콘텐츠 크리에이터, 학술 연구 파트너십)

---

# 11. 부록: 주요 코드 컴포넌트

## NetworkBackground 컴포넌트

Canvas 기반 동적 네트워크 애니메이션 배경. 노드 이동, 연결선, 펀스 효과. 커스터마이징 Props: nodeSpeedMultiplier, pulseSpeedMultiplier, maxConnectionDistance, nodeOpacity, connectionOpacity, backgroundColor, nodeColor, connectionColor, nodeDensityFactor

## Profile 컴포넌트

사용자 프로필 및 마이페이지. 관계력 지표 (감정 안정도 72, 갈등 회복력 85, 관계 성숙도 68), 상담 기록, 설정 모달.

## DiagnosisCenter 컴포넌트

심리 진단 테스트 센터. 4가지 진단 유형: 애착유형 테스트 (불안/회피/안정/혼란), 연애 패턴 분석 (탐구형/매력어필형/자연스러운/신중형), 갈등 대처 스타일 (소극적/적극적/건설적/회피적), 상대방 유형 분석기.

## CounselingSelect 컴포넌트

상담 방식 선택 화면. F모드 (Heart/빨간색/감정적 위로), T모드 (Brain/파란색/논리적 분석), 전문가 상담 (MessageCircle/초록색/1:1 음성상담).

---

## 디자인 시스템

### 컨러 팔레트

- 배경: #000000
- 텍스트: #FFFFFF / #CCCCCC / #999999
- 액센트: F모드 #EF4444, T모드 #3B82F6, 전문가 #10B981, 진단 #F59E0B
- UI: border rgba(255,255,255,0.1), hover-bg rgba(255,255,255,0.05)

### 타이포그래피

- Weight: thin(100), light(300), normal(400), medium(500), bold(700)
- Sizes: xs(12px), sm(14px), base(16px), lg(18px), xl(20px), 2xl(24px), 4xl(36px)

---

## API 명세

### F모드 GPT

- model: gpt-4o, temperature: 0.8, max_tokens: 500
- system: "사용자의 편을 100% 들어주는 감정 상담사. 공감, 수꺍, 격려만 제공"

### T모드 GPT

- model: gpt-4o, temperature: 0.3, max_tokens: 1000
- system: "연애 심리학, 인지심리학, 정신병리학 기반 분석 및 해결방안 단계별 제시"

### Whisper API

- model: whisper-1, language: ko

### Stripe

- 구독 생성: trial_period_days: 7
- 결제: currency: krw

---

**문서 버전**: 1.0

**작성자**: DIVE 개발팀

© 2024 DIVE. All rights reserved.