# Veilrum 통합 플랫폼 상세 설계

**아젠다:** A001-06-2  
**작성일:** 2026-02-15  
**발의자:** Beth Birkin (CEO of Veilrum)  
**참석자:** Mille Arche (CEO of M43, Chief Research Advisor of Veilrum), Sabine Crawford (COO of M43), Group Heads 4명 (Nadia, Isabelle, Marlene, Leila)  
**목적:** CTO 및 사업개발팀 개발 가이드

---

## 목차

1. [플랫폼 비전](#1-플랫폼-비전)
2. [3개 앱 통합 개요](#2-3개-앱-통합-개요)
3. [핵심 기능 상세](#3-핵심-기능-상세)
4. [통합 아키텍처](#4-통합-아키텍처)
5. [데이터 구조](#5-데이터-구조)
6. [사용자 여정](#6-사용자-여정)
7. [개발 로드맵](#7-개발-로드맵)
8. [기술 스택](#8-기술-스택)
9. [수익 모델](#9-수익-모델)
10. [시장 전략](#10-시장-전략)
11. [43명 데이터 활용](#11-43명-데이터-활용)
12. [인프라 및 예산](#12-인프라-및-예산)

---

## 1. 플랫폼 비전

### 1.1 핵심 개념

**"관계의 모든 것을 이해하고 성장시키는 단일 플랫폼"**

- **학습**: 밀라르쉬의 7개 프레임워크 기반 관계 심리학 콘텐츠
- **진단**: 개인 맞춤형 관계 패턴 분석
- **커뮤니티**: 같은 유형끼리 모여 경험 공유
- **성장**: AI 기반 관계 개선 상담
- **연결**: 자연스러운 데이팅 (강제 아님)

### 1.2 차별점

**기존 데이팅 앱의 문제:**
- 겉모습 중심 매칭
- 관계 교육 없음
- 단기적 만남 중심
- 데이터 기반 없음

**Veilrum의 접근:**
- 관계 학습 → 자기 이해 → 커뮤니티 → 자연스러운 만남
- 43명 × 3년 실제 데이터 기반 알고리즘
- 7개 프레임워크 × 102개 도메인 완전 커버
- 학술적 권위 + 실용적 상품

### 1.3 궁극적 목표

**Year 1-3 (연구 단계):**
- 43명 연구팀 전용 Research Edition
- 관계의 모든 것 데이터 수집
- 알고리즘 검증 및 고도화

**Year 4+ (상용화 단계):**
- 일반 사용자 Public Launch
- PRIPER + CodeTalk + DIVE 통합 플랫폼
- 글로벌 확장 ($1.6B 시장 목표)

---

## 2. 3개 앱 통합 개요

### 2.1 기존 앱 현황

#### PRIPER (프라이퍼)
- **목적**: Prime Perspective 기반 자기분석
- **핵심 기능**: Why 컨설팅 10단계 프로세스
- **상태**: Lovable.dev → Claude Code 이관 완료
- **현재 완성도**: 80%

**주요 기능:**
1. 직업 브레인스토밍 (10분)
2. 정의 작성
3. 각인 순간 기록
4. 행복/고통/중립 분류
5. 이유 작성
6. 경험 기록
7. 1차 분석 (공통 분모)
8. 2차 분석 (각인 뿌리)
9. 가치관 매핑
10. Prime Perspective 도출

**추가 기능:**
- Ikigai 설계 (4영역: 좋아하는 것, 잘하는 것, 세상이 필요로 하는 것, 보상받을 수 있는 것)
- 브랜드 설계 (5단계)
- 커뮤니티 매칭 (싱크로율 기반)
- 멀티 페르소나 기능 (프리미엄)

#### CodeTalk (코드토크)
- **목적**: 일일 키워드 기반 정의각인 기록 및 공유
- **핵심 기능**: 100일 코드토크 방법론 디지털화
- **상태**: 프로덕션 준비 완료 (2025-08)
- **현재 완성도**: 80%

**주요 기능:**
1. 매일 하나의 키워드
2. 정의 공유 → 각인 추적 → 원인 분석 (3단계)
3. 18시-02시 퍼블릭스토리 운영 (KST 시간대 기반)
4. 가상 유저 시스템 (20명, 자동화 완료)
   - 현실적 시간 패턴 (출근시간 25%, 저녁 20-22시 35%)
   - 자연스러운 글쓰기 (페르소나별)
5. AI 관계조언 서비스 (프리미엄)

**결제 시스템:**
- PortOne (해외 카드 + 한국 간편결제)

#### DIVE (다이브)
- **목적**: AI 기반 연애 심리 상담 및 관계 분석
- **핵심 기능**: F모드/T모드 이중 상담 시스템
- **상태**: MVP 단계
- **현재 완성도**: 70%

**주요 기능:**
1. **F모드 (감정 공감형)**: 공감, 수긍, 격려 중심
2. **T모드 (분석형)**: 
   - 감정 분석
   - 핵심 갈등 요약
   - 상대 행동 패턴
   - 해결책 A/B/C
3. 관계력 추적 시스템
   - 감정 안정도
   - 갈등 발생 빈도
   - 대화 회복도
4. 전문가 상담 연결 (WebRTC 음성상담)
5. 나만의 AI 상담사 생성 (프리미엄)
   - 얼굴 + 목소리 선택
   - Voice Cloning (ElevenLabs)
6. 커뮤니티: '내가 만난 가장 사이코' (익명 기반)

### 2.2 통합 플랫폼 구조

```
┌─────────────────────────────────────────┐
│         VEILRUM (단일 플랫폼)           │
├─────────────────────────────────────────┤
│                                         │
│  Module 1: PRIPER (자기 이해)          │
│  - Prime Perspective 발견              │
│  - 행복/고통 패턴 분석                  │
│  - 각인 순간 추적                       │
│  - Ikigai 설계                          │
│  - 브랜드 설계                          │
│                                         │
│  Module 2: CodeTalk (관계 언어)        │
│  - 일일 키워드                          │
│  - 정의각인 기록                        │
│  - 100일 코드토크                       │
│  - 퍼블릭스토리 (18-02시)               │
│  - AI 관계조언                          │
│                                         │
│  Module 3: DIVE (관계 성장)            │
│  - F모드 (감정 공감)                    │
│  - T모드 (분석)                         │
│  - 관계력 추적                          │
│  - 전문가 연결                          │
│  - AI 상담사 생성                       │
│                                         │
│  Module 4: Community (커뮤니티)        │
│  - 유형별 자동 그룹 배치                │
│  - 토픽별 포럼                          │
│  - 익명/실명 선택                       │
│  - 경험담 공유                          │
│                                         │
│  Module 5: Connect (1:1 연결)          │
│  - 커뮤니티 내 DM                       │
│  - 상대방 동의 필수                     │
│  - 대화 기록                            │
│                                         │
│  Module 6: Dating (선택 기능, Year 2+) │
│  - 매칭 알고리즘                        │
│  - "데이팅 모드" 자발적 전환            │
│  - Prime Perspective 기반 매칭         │
│                                         │
├─────────────────────────────────────────┤
│    ↓ 하나의 통합 데이터베이스 ↓        │
├─────────────────────────────────────────┤
│  - 사용자 프로필 (통합)                 │
│  - Prime Perspective                    │
│  - 단어 정의 패턴                       │
│  - 관계 데이터                          │
│  - 감정 분석 기록                       │
│  - 7개 프레임워크 결과                  │
│  - 커뮤니티 활동 기록                   │
│  - 관계력 지표                          │
└─────────────────────────────────────────┘
```

### 2.3 통합의 이점

#### 사용자 관점
- **하나의 계정**: PRIPER/CodeTalk/DIVE 따로 가입 불필요
- **하나의 구독**: 월 $9.99로 모든 기능 사용
- **데이터 자동 연결**: 한 번 입력하면 모든 모듈에서 활용
- **일관된 UX**: 앱 간 이동 없이 매끄러운 경험

#### 비즈니스 관점
- **데이터 통합**: 사용자 행동 완전 추적 가능
- **크로스셀**: PRIPER → CodeTalk → DIVE 자연스러운 전환
- **이탈률 감소**: 하나의 생태계 안에서 모든 니즈 해결
- **브랜드 일관성**: "Veilrum = 관계의 모든 것"

#### 기술 관점
- **단일 코드베이스**: 유지보수 비용 절감
- **공통 인프라**: AWS/Supabase 통합
- **AI 파이프라인 공유**: GPT-4o, Whisper 효율적 활용
- **데이터베이스 통합**: 중복 저장 없음

---

## 3. 핵심 기능 상세

### 3.1 Module 1: PRIPER (자기 이해)

#### 3.1.1 Why 컨설팅 (10단계)

**목표**: 사용자의 Prime Perspective 발견

**프로세스:**

1. **직업 브레인스토밍 (10분)**
   - 타이머 기반
   - 자유 연상 방식
   - "어떤 직업에 끌리나요?" 질문

2. **정의 작성**
   - 각 직업에 대한 개인적 정의
   - "당신에게 [직업]이란?"

3. **각인 순간 기록**
   - 해당 직업에 끌린 구체적 순간
   - 시간/장소/상황

4. **행복/고통/중립 분류**
   - 각인 순간의 감정 상태
   - 3가지 카테고리

5. **이유 작성**
   - 왜 행복/고통/중립이었는지

6. **경험 기록**
   - 구체적 에피소드

7. **1차 분석 (공통 분모)**
   - AI가 패턴 추출
   - "당신은 이런 상황에서 행복합니다"

8. **2차 분석 (각인 뿌리)**
   - 유년기/청소년기 각인 추적
   - 뿌리 경험 도출

9. **가치관 매핑**
   - 핵심 가치 3-5개 추출

10. **Prime Perspective 도출**
    - 최종 결과: "당신의 렌즈는 [X]입니다"

#### 3.1.2 Ikigai 설계

**4가지 영역:**
- 좋아하는 것 (Passion)
- 잘하는 것 (Profession)
- 세상이 필요로 하는 것 (Mission)
- 보상받을 수 있는 것 (Vocation)

**결과물:**
- Ikigai 다이어그램
- 교집합 영역 도출
- 실행 가능한 액션 플랜

#### 3.1.3 브랜드 설계 (5단계)

1. 핵심 가치 정의
2. 타겟 오디언스 설정
3. 차별화 포인트
4. 메시지 크래프팅
5. 비주얼 아이덴티티

**프리미엄 기능:**
- 멀티 페르소나 (직장/연애/가족 등)
- 각 페르소나별 브랜드

### 3.2 Module 2: CodeTalk (관계 언어)

#### 3.2.1 100일 코드토크

**개념:**
- 매일 하나의 키워드
- 파트너와 정의 비교
- 100일 = 관계 언어 완전 학습

**프로세스:**

**Day 1-30: 기본 단어**
- 사랑, 행복, 자유, 신뢰, 존중 등
- 일상적이지만 정의가 다른 단어

**Day 31-60: 관계 단어**
- 헌신, 배려, 질투, 소유, 거리 등
- 관계에서 갈등 유발 단어

**Day 61-100: 깊은 단어**
- 성, 돈, 가족, 미래, 죽음 등
- 회피하기 쉬운 무거운 단어

**3단계 딥다이브:**

1. **정의 공유**
   - "나에게 [단어]란?"
   - 각자 작성 후 공개

2. **각인 추적**
   - "왜 그렇게 정의하게 되었나?"
   - 구체적 경험 탐색

3. **원인 분석**
   - "그 경험은 어디서 왔나?"
   - 뿌리 찾기

#### 3.2.2 퍼블릭스토리 (18시-02시)

**개념:**
- 매일 같은 키워드로 전체 유저가 소통
- KST 18시 시작 → 다음날 02시 종료

**가상 유저 시스템:**
- 20명 자동화
- 현실적 시간 패턴
  - 출근시간 (07-09시): 25%
  - 점심시간 (12-13시): 15%
  - 저녁시간 (20-22시): 35%
  - 심야 (23-01시): 25%
- 페르소나별 자연스러운 글쓰기

**프리미엄 AI 조언:**
- 파트너 정의 비교 → 갈등 예측
- "이 단어에서 충돌할 가능성 78%"
- 대화 가이드 제공

### 3.3 Module 3: DIVE (관계 성장)

#### 3.3.1 F모드 (감정 공감형)

**목적**: 감정 지지 및 공감

**응답 스타일:**
- "정말 힘들었겠어요"
- "충분히 그렇게 느낄 수 있어요"
- "당신 잘못이 아니에요"

**활용 시나리오:**
- 감정 폭발 후
- 위로가 필요할 때
- 상대 비난 시

#### 3.3.2 T모드 (분석형)

**목적**: 패턴 분석 및 해결책 제시

**분석 프로세스:**

1. **감정 분석**
   - 텍스트에서 감정 키워드 추출
   - 강도 측정 (1-10)

2. **핵심 갈등 요약**
   - "문제의 본질은 [X]입니다"
   - 표면/심층 구분

3. **상대 행동 패턴**
   - 과거 데이터 기반
   - "이 상황에서 상대는 통상 [Y] 반응"

4. **해결책 A/B/C**
   - A: 즉시 실행 가능
   - B: 중기 전략
   - C: 근본 해결

#### 3.3.3 관계력 추적 시스템

**3가지 지표:**

1. **감정 안정도 (0-100)**
   - 일일 기분 기록
   - 변동성 측정
   - 추세 분석

2. **갈등 발생 빈도**
   - 주간/월간 갈등 횟수
   - 패턴 인식
   - 트리거 분석

3. **대화 회복도**
   - 갈등 → 화해 시간
   - 회복 방법 패턴

**대시보드:**
- 3개월 추세 그래프
- 주간 요약 리포트
- AI 인사이트

#### 3.3.4 전문가 연결

**WebRTC 음성상담:**
- 인앱 통화 (별도 번호 불필요)
- 녹음 옵션 (동의 시)
- 30분/60분 세션

**전문가 풀:**
- 커플치료사
- 임상심리사
- 성상담사
- 이혼전문가

#### 3.3.5 나만의 AI 상담사 (프리미엄)

**커스터마이징:**
- 얼굴 선택 (10가지 프리셋)
- 목소리 선택 (남/여, 5가지 톤)
- Voice Cloning (ElevenLabs)

**페르소나 설정:**
- 친구 같은 상담사
- 엄격한 코치
- 따뜻한 선생님

### 3.4 Module 4: Community (커뮤니티)

#### 3.4.1 유형별 자동 그룹 배치

**기준:**
- Prime Perspective
- 애착 유형
- 성적 스펙트럼
- 아비투스

**그룹 예시:**
- "회피형 애착 극복 모임"
- "포식형 6종 경험담"
- "BDSM과 친밀감 토론"
- "이혼 후 회복 과정"
- "퀴어 관계 고민"

#### 3.4.2 토픽별 포럼

**카테고리:**
- 소통 (대화법, 싸움 후 화해)
- 섹스 (욕구 차이, 성적 호환)
- 돈 (가계 관리, 소비 패턴)
- 가족 (시댁, 양육, 가족 계획)
- 위기 (외도, 중독, 폭력)
- 문화 (종교, 국제 관계, 가치관)

#### 3.4.3 익명/실명 선택

**익명 모드:**
- 닉네임만 표시
- 민감한 주제 토론

**실명 모드:**
- 프로필 + Prime Perspective 공개
- 신뢰 기반 대화

#### 3.4.4 경험담 공유

**특별 섹션:**
- "내가 만난 가장 사이코" (DIVE 커뮤니티)
- "100일 코드토크 후기"
- "Prime Perspective 발견 스토리"

### 3.5 Module 5: Connect (1:1 연결)

#### 3.5.1 커뮤니티 내 DM

**작동 방식:**
- 커뮤니티에서 먼저 교류
- "이 사람과 대화 시작" 버튼
- 상대방 동의 필수

**안전 장치:**
- 신고 시스템
- 블록 기능
- AI 유해 메시지 필터

#### 3.5.2 대화 기록

- 자동 저장
- 검색 가능
- 백업 (클라우드)

### 3.6 Module 6: Dating (Year 2+, 선택 기능)

#### 3.6.1 "데이팅 모드" 전환

**자발적 선택:**
- 사용자가 원할 때만 활성화
- 강제 아님
- 언제든 비활성화 가능

#### 3.6.2 매칭 알고리즘

**43명 데이터 기반:**
- Prime Perspective 매칭도
- 애착 유형 호환성
- 성적 스펙트럼 조합
- 아비투스 계층 분석
- 과거 관계 패턴

**예측:**
- "이 조합 장기 관계 성공률 83%"
- "예상 갈등 지점: 소통 방식 (해결책 포함)"
- "5년 후 관계 유지 확률 78%"

---

## 4. 통합 아키텍처

### 4.1 프론트엔드

**기술 스택:**
- React 18+
- TypeScript
- Tailwind CSS
- React Query (서버 상태 관리)
- Zustand (클라이언트 상태 관리)

**컴포넌트 구조:**

```
src/
├── components/
│   ├── common/           # 공통 컴포넌트
│   ├── priper/           # PRIPER 모듈
│   ├── codetalk/         # CodeTalk 모듈
│   ├── dive/             # DIVE 모듈
│   ├── community/        # 커뮤니티
│   ├── connect/          # 1:1 연결
│   └── dating/           # 데이팅 (Year 2+)
├── pages/
│   ├── home/
│   ├── priper/
│   ├── codetalk/
│   ├── dive/
│   ├── community/
│   └── profile/
├── hooks/                # 커스텀 훅
├── utils/                # 유틸리티
├── api/                  # API 클라이언트
└── types/                # TypeScript 타입
```

**네비게이션:**

하단 탭 바 (5개):
1. 홈 (대시보드)
2. 자기 이해 (PRIPER)
3. 키워드 (CodeTalk)
4. 상담 (DIVE)
5. 커뮤니티

상단 메뉴:
- 프로필
- 설정
- 알림
- (데이팅 모드 활성화 시) 매칭

### 4.2 백엔드

**기술 스택:**
- Supabase (PostgreSQL + Auth + RLS + Storage)
- Edge Functions (Deno)
- Realtime Subscriptions

**API 구조:**

```
/api/
├── auth/                 # 인증
├── users/                # 사용자 관리
├── priper/               # PRIPER 데이터
├── codetalk/             # CodeTalk 데이터
├── dive/                 # DIVE 상담
├── community/            # 커뮤니티
├── matching/             # 매칭 (Year 2+)
└── admin/                # 관리자
```

### 4.3 AI 파이프라인

**OpenAI GPT-4o:**
- DIVE F/T 모드 상담
- CodeTalk AI 조언
- 커뮤니티 유해 콘텐츠 필터
- 프로필 분석

**Whisper API:**
- 음성 → 텍스트 변환 (전문가 상담 녹음)

**ElevenLabs:**
- Voice Cloning (나만의 AI 상담사)
- TTS (Text-to-Speech)

**AI 워크플로우:**

1. **사용자 입력** → 2. **전처리** → 3. **GPT-4o 처리** → 4. **후처리** → 5. **응답 반환**

**비용 최적화:**
- 응답 캐싱
- 토큰 제한 (max_tokens)
- 배치 처리

### 4.4 보안 아키텍처

**인증:**
- Supabase Auth (이메일/소셜 로그인)
- JWT 토큰
- Refresh Token 자동 갱신

**권한 관리:**
- Row Level Security (RLS)
  - 자신의 데이터만 읽기/쓰기
  - 커뮤니티는 공개 읽기
- Role-based Access Control
  - User
  - Premium User
  - Expert (전문가)
  - Admin

**데이터 암호화:**
- 전송: HTTPS/TLS 1.3
- 저장: AES-256
- 민감 정보: 추가 암호화 레이어

**프라이버시:**
- GDPR 준수
- 데이터 삭제 요청 처리
- 익명화 옵션

---

## 5. 데이터 구조

### 5.1 핵심 테이블

#### users (사용자)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 구독
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free/premium
  subscription_expires_at TIMESTAMP,
  
  -- 프로필
  age INTEGER,
  gender VARCHAR(20),
  location VARCHAR(100),
  
  -- 프라이버시
  profile_visibility VARCHAR(20) DEFAULT 'public', -- public/private
  dating_mode_enabled BOOLEAN DEFAULT FALSE
);
```

#### prime_perspectives (Prime Perspective)

```sql
CREATE TABLE prime_perspectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Why 컨설팅 결과
  perspective_text TEXT NOT NULL, -- "당신의 렌즈는 [X]"
  core_values JSONB, -- ["정의", "자유", "창의성"]
  ikigai JSONB, -- {passion, profession, mission, vocation}
  
  -- 분석 데이터
  happiness_patterns JSONB, -- 행복 패턴
  pain_patterns JSONB, -- 고통 패턴
  imprinting_moments JSONB, -- 각인 순간들
  
  -- 브랜드
  brand_identity JSONB -- {values, audience, differentiation, message, visual}
);
```

#### codetalk_entries (CodeTalk 기록)

```sql
CREATE TABLE codetalk_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 키워드
  keyword VARCHAR(50) NOT NULL,
  day_number INTEGER, -- 1-100
  
  -- 3단계 딥다이브
  definition TEXT NOT NULL, -- 정의
  imprinting_moment TEXT, -- 각인 순간
  root_cause TEXT, -- 원인 분석
  
  -- 메타데이터
  is_public BOOLEAN DEFAULT FALSE,
  partner_id UUID REFERENCES users(id), -- 파트너 연결
  ai_insights JSONB -- AI 분석 결과
);
```

#### dive_sessions (DIVE 상담 기록)

```sql
CREATE TABLE dive_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 세션 타입
  mode VARCHAR(10) NOT NULL, -- 'F' or 'T'
  
  -- 대화
  messages JSONB NOT NULL, -- [{role, content, timestamp}]
  
  -- 분석
  emotion_analysis JSONB, -- {primary, intensity, keywords}
  conflict_summary TEXT,
  partner_pattern TEXT,
  solutions JSONB, -- [{option, description, difficulty}]
  
  -- 관계력 지표
  emotional_stability INTEGER, -- 0-100
  conflict_frequency INTEGER, -- 주간 횟수
  recovery_speed INTEGER -- 시간 (분)
);
```

#### community_posts (커뮤니티 게시글)

```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES community_groups(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 콘텐츠
  title VARCHAR(200),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- 메타데이터
  tags JSONB, -- ["애착유형", "소통"]
  upvotes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0
);
```

#### community_groups (커뮤니티 그룹)

```sql
CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 그룹 정보
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 소통/섹스/돈/가족/위기/문화
  
  -- 자동 배치 기준
  auto_assign_criteria JSONB, -- {attachment_type: "avoidant", ...}
  
  -- 통계
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0
);
```

#### matches (매칭 - Year 2+)

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID REFERENCES users(id),
  user_b_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 매칭 스코어
  compatibility_score INTEGER, -- 0-100
  long_term_success_rate INTEGER, -- 0-100
  
  -- 분석
  matching_factors JSONB, -- {prime_perspective: 85, attachment: 92, ...}
  predicted_conflicts JSONB, -- [{area, severity, solution}]
  
  -- 상태
  status VARCHAR(20) DEFAULT 'suggested', -- suggested/accepted/rejected
  
  UNIQUE(user_a_id, user_b_id)
);
```

### 5.2 43명 연구팀 전용 테이블

#### researchers (연구원 프로필)

```sql
CREATE TABLE researchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  
  -- 기본 정보
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  group VARCHAR(10), -- A/B/C/D
  division INTEGER, -- 1-12
  
  -- 연구 데이터
  prime_perspective TEXT,
  attachment_type VARCHAR(20),
  sexual_spectrum JSONB, -- {dominance, submission, ...}
  habitus VARCHAR(20),
  
  -- 메타데이터
  enrollment_date DATE,
  is_active BOOLEAN DEFAULT TRUE
);
```

#### researcher_daily_logs (일일 로그)

```sql
CREATE TABLE researcher_daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_id UUID REFERENCES researchers(id),
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 일일 데이터
  mood_score INTEGER, -- 0-10
  energy_level INTEGER, -- 0-10
  met_with JSONB, -- [researcher_ids]
  sexual_activity BOOLEAN,
  
  -- 자유 기록
  notes TEXT,
  
  UNIQUE(researcher_id, log_date)
);
```

#### relationship_events (관계 이벤트)

```sql
CREATE TABLE relationship_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_a_id UUID REFERENCES researchers(id),
  researcher_b_id UUID REFERENCES researchers(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- 이벤트 정보
  event_type VARCHAR(50), -- 대화/섹스/갈등/화해/...
  location VARCHAR(100),
  duration_minutes INTEGER,
  
  -- 미디어
  video_url TEXT,
  audio_url TEXT,
  transcript TEXT,
  
  -- AI 분석
  emotion_analysis JSONB,
  interaction_quality INTEGER -- 0-100
);
```

#### biometric_data (생체 데이터)

```sql
CREATE TABLE biometric_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_id UUID REFERENCES researchers(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- 생체 정보
  heart_rate INTEGER,
  stress_level INTEGER, -- 0-100
  hormone_levels JSONB, -- {cortisol, oxytocin, ...}
  
  -- 컨텍스트
  activity VARCHAR(50), -- 휴식/운동/관계/...
  event_id UUID REFERENCES relationship_events(id)
);
```

### 5.3 데이터 관계도

```
users (사용자)
  ├─ prime_perspectives (1:1)
  ├─ codetalk_entries (1:N)
  ├─ dive_sessions (1:N)
  ├─ community_posts (1:N)
  ├─ matches (N:N via matches 테이블)
  └─ researchers (1:1, 43명만)
       ├─ researcher_daily_logs (1:N)
       ├─ relationship_events (N:N)
       └─ biometric_data (1:N)

community_groups (그룹)
  └─ community_posts (1:N)
```

---

## 6. 사용자 여정

### 6.1 신규 가입 (Day 1)

**1단계: 회원가입**
- 이메일 또는 소셜 로그인
- 기본 프로필 설정 (나이, 성별, 지역)

**2단계: 온보딩**
- Veilrum 소개 (1분 영상)
- 3개 모듈 설명 (PRIPER/CodeTalk/DIVE)
- "어디서 시작할까요?" 선택지

**3단계: 첫 경험 (추천: PRIPER)**
- Why 컨설팅 10단계 (30-45분)
- Prime Perspective 발견
- "당신의 렌즈는 [X]입니다" 결과

**4단계: 커뮤니티 자동 배치**
- Prime Perspective 기반 그룹 추천
- "이런 사람들과 함께 해보세요"
- 가입 옵션

### 6.2 일상 사용 (Day 2-30)

**아침 (07-09시):**
- CodeTalk 오늘의 키워드 알림
- "오늘은 '신뢰'입니다. 정의를 작성해보세요"

**낮 (12-18시):**
- 커뮤니티 활동
  - 새 글 알림
  - 댓글 달기
  - 경험담 공유

**저녁 (18-02시):**
- CodeTalk 퍼블릭스토리 참여
  - 다른 사람들 정의 읽기
  - 공감/댓글
  - 파트너와 비교 (파트너 있는 경우)

**필요시:**
- DIVE F/T 모드 상담
  - 갈등 발생 시 즉시 상담
  - 관계력 지표 확인

### 6.3 심화 사용 (Day 31-100)

**CodeTalk 100일 완주:**
- Day 1-30: 기본 단어 (사랑, 행복, 자유...)
- Day 31-60: 관계 단어 (헌신, 질투, 소유...)
- Day 61-100: 깊은 단어 (성, 돈, 죽음...)

**PRIPER 심화:**
- Ikigai 재설계
- 브랜드 업데이트
- 멀티 페르소나 추가 (프리미엄)

**커뮤니티 깊이:**
- 토론 참여 증가
- 1:1 DM 시작
- 오프라인 모임 (선택)

### 6.4 관계 형성 (Day 100+)

**커뮤니티 → 1:1:**
- "이 사람과 대화하고 싶어요" 클릭
- 상대방 동의
- DM 시작

**관계 발전:**
- DM → 카카오톡/전화
- 오프라인 만남
- 실제 관계 시작

**데이팅 모드 (Year 2+, 선택):**
- "데이팅 모드" 활성화
- AI 매칭 추천
- "이 사람과 83% 호환"

### 6.5 프리미엄 전환

**무료 → 프리미엄 ($9.99/월)**

**트리거:**
1. PRIPER 브랜드 설계 접근 시
2. CodeTalk AI 조언 5회 사용 후
3. DIVE 전문가 상담 예약 시
4. 커뮤니티 고급 기능 (파일 업로드 등)
5. 나만의 AI 상담사 생성 시

**프리미엄 혜택:**
- PRIPER: 멀티 페르소나, 브랜드 설계
- CodeTalk: 무제한 AI 조언, 파트너 연동
- DIVE: 나만의 AI 상담사, 전문가 상담 할인
- 커뮤니티: 파일 업로드, 프라이빗 그룹 생성
- 데이팅: 매칭 우선순위 (Year 2+)

---

## 7. 개발 로드맵

### 7.1 Year 1 (2026): Research Edition

**Q1 (Jan-Mar): 기반 구축**

**개발:**
- Supabase 프로젝트 셋업
- 기본 데이터베이스 구조
- 인증 시스템
- 43명 연구원 전용 앱 (일일 로그)

**마일스톤:**
- 43명 온보딩 완료
- 첫 1개월 데이터 수집

**예산:**
- 개발: $50K
- 인프라: $5K

**Q2 (Apr-Jun): 프레임워크 진단**

**개발:**
- 7개 프레임워크 진단 모듈
- 관계 추적 대시보드
- 드론 촬영 예약 시스템

**마일스톤:**
- 7개 프레임워크 1차 데이터 수집
- 관계 매트릭스 가시화

**예산:**
- 개발: $75K
- 드론/장비: $30K

**Q3 (Jul-Sep): 생체 데이터 통합**

**개발:**
- 생체데이터 입력 시스템
- AI 분석 파이프라인 (GPT-4o)
- 영상 전사 (Whisper API)

**마일스톤:**
- 멀티모달 데이터 통합
- 첫 AI 인사이트 도출

**예산:**
- 개발: $50K
- AI API: $20K

**Q4 (Oct-Dec): 최적화 및 분석**

**개발:**
- 데이터 품질 검증
- 알고리즘 1차 개발
- 백업/보안 강화

**마일스톤:**
- Year 1 데이터 완료
- 학술 논문 1차 초안

**예산:**
- 개발: $25K
- 보안/백업: $10K

**Year 1 총 예산: $265K**

---

### 7.2 Year 2 (2027): 알고리즘 개발

**Q1: 데이터 분석**
- 43명 Year 1 데이터 심층 분석
- 패턴 추출 및 검증
- 학술 논문 작성

**Q2: 알고리즘 설계**
- Prime Perspective 매칭 알고리즘
- 관계 예측 모델
- 갈등 해결 추천 시스템

**Q3: 베타 테스트**
- 선별된 외부 유저 100명 초대
- 피드백 수집
- 알고리즘 조정

**Q4: 통합 플랫폼 개발 시작**
- PRIPER/CodeTalk/DIVE 통합 설계
- 공통 컴포넌트 개발
- 단일 데이터베이스 마이그레이션

**Year 2 총 예산: $400K**

---

### 7.3 Year 3 (2028): MVP 출시

**Q1: 통합 플랫폼 완성**
- 3개 모듈 완전 통합
- 단일 앱 퍼블리싱 (iOS/Android)
- 커뮤니티 기능 구현

**Q2: 클로즈드 베타**
- 초대제 베타 (1,000명)
- 유료 구독 테스트 ($9.99/월)
- 프리미엄 기능 검증

**Q3: 공개 베타**
- 대기자 명단 오픈
- 순차 초대 (5,000명)
- 마케팅 시작

**Q4: 정식 출시**
- Public Launch
- 앱스토어 Featured 목표
- PR 캠페인

**Year 3 총 예산: $600K**

---

### 7.4 Year 4+ (2029-): 확장

**Year 4: 성장**
- 사용자 50,000명 목표
- 데이팅 모드 추가 (Module 6)
- 국제 확장 (영어권)

**Year 5: 스케일**
- 사용자 500,000명 목표
- 기업/정부 B2B 시작
- 데이팅 앱 라이센싱

**Year 6+: 생태계**
- 글로벌 확장 (10개 언어)
- IPO 준비
- $1B+ 밸류에이션

---

## 8. 기술 스택

### 8.1 프론트엔드

| 기술 | 용도 | 버전 |
|------|------|------|
| React | UI 프레임워크 | 18+ |
| TypeScript | 타입 안정성 | 5+ |
| Tailwind CSS | 스타일링 | 3+ |
| React Query | 서버 상태 관리 | 5+ |
| Zustand | 클라이언트 상태 관리 | 4+ |
| React Router | 라우팅 | 6+ |
| Framer Motion | 애니메이션 | 10+ |

### 8.2 백엔드

| 기술 | 용도 | 이유 |
|------|------|------|
| Supabase | BaaS | PostgreSQL + Auth + RLS + Realtime |
| PostgreSQL | 데이터베이스 | 관계형, JSONB 지원 |
| Edge Functions | 서버리스 | Deno 기반, 빠른 응답 |
| Stripe | 결제 (레거시) | 국제 결제 |
| PortOne | 결제 (신규) | 한국 간편결제 |

### 8.3 AI/ML

| 서비스 | 용도 | 비용 |
|--------|------|------|
| OpenAI GPT-4o | DIVE 상담, AI 조언 | $10/1M 토큰 (입력), $30/1M 토큰 (출력) |
| Whisper API | 음성 → 텍스트 | $0.006/분 |
| ElevenLabs | Voice Cloning, TTS | $22/월 (스타터), $99/월 (프로) |

### 8.4 인프라

| 서비스 | 용도 | 예상 비용 |
|--------|------|-----------|
| AWS S3 | 영상/음성/이미지 저장 | $500-1,000/월 |
| AWS CloudFront | CDN | $200/월 |
| Supabase Pro | 데이터베이스 + Auth | $25/월 |
| Vercel | 프론트엔드 호스팅 | $20/월 (프로) |

### 8.5 모니터링 및 분석

| 서비스 | 용도 |
|--------|------|
| Sentry | 에러 추적 |
| Mixpanel | 사용자 분석 |
| LogRocket | 세션 리플레이 |
| Google Analytics | 트래픽 분석 |

### 8.6 개발 도구

| 도구 | 용도 |
|------|------|
| GitHub | 코드 저장소 |
| GitHub Actions | CI/CD |
| Figma | 디자인 |
| Linear | 프로젝트 관리 |
| Slack | 팀 커뮤니케이션 |

---

## 9. 수익 모델

### 9.1 B2C (소비자)

#### 무료 티어
- PRIPER: Why 컨설팅 10단계 (기본)
- CodeTalk: 일일 키워드 + 정의 작성
- DIVE: F모드 상담 (주 3회 제한)
- 커뮤니티: 읽기 + 댓글

**전환율 목표:** 10% (무료 → 프리미엄)

#### 프리미엄 티어 ($9.99/월)
- PRIPER: Ikigai 설계, 브랜드 설계, 멀티 페르소나
- CodeTalk: 무제한 AI 조언, 파트너 연동
- DIVE: T모드 상담, 나만의 AI 상담사, 전문가 상담 할인
- 커뮤니티: 파일 업로드, 프라이빗 그룹 생성
- 데이팅: 매칭 우선순위 (Year 2+)

**예상 수익:**
- Year 4: 50,000 유저 × 10% 전환 × $9.99 = $49,950/월 = $599K/년
- Year 5: 500,000 유저 × 10% 전환 × $9.99 = $499,500/월 = $5.99M/년

### 9.2 B2B - Clinical (치료사)

#### Veilrum Pro ($2,000/년)

**기능:**
- 환자 관리 대시보드
- 43명 데이터 기반 인사이트
- "이 커플 조합은 87% 확률로..."
- 개입 방법 추천
- 진행 상황 추적

**목표:**
- Year 5: 1,000명 치료사 × $2,000 = $2M/년
- Year 7: 10,000명 치료사 × $2,000 = $20M/년

### 9.3 B2B - Corporate (기업 HR)

#### Veilrum Enterprise ($50,000/년)

**기능:**
- 직원 관계 건강도 모니터링
- 이혼 위기 조기 경보
- EAP (직원 지원 프로그램) 통합
- 맞춤형 관계 교육 콘텐츠

**목표:**
- Year 6: 100개 기업 × $50,000 = $5M/년
- Year 8: 1,000개 기업 × $50,000 = $50M/년

### 9.4 B2B - Tech (데이팅 앱)

#### 데이터 라이센싱 ($5M-10M/년)

**제공:**
- 매칭 알고리즘 API
- 43명 데이터 기반 예측 모델
- 관계 성공률 예측

**목표 파트너:**
- Tinder, Bumble, Hinge, Match.com
- 한국: 틴더 코리아, 아만다, 글램

**예상 수익:**
- Year 6: 2개 플랫폼 × $7.5M = $15M/년
- Year 8: 5개 플랫폼 × $7.5M = $37.5M/년

### 9.5 B2G (정부)

#### 정부 컨설팅 ($1M-5M/프로젝트)

**서비스:**
- 국가별 관계 패턴 분석
- 저출산 대응 정책 설계
- 결혼/출산 장려 프로그램

**목표 국가:**
- 한국, 싱가포르, 일본 (저출산 심각)
- 북유럽 (복지 정책 선진국)

**예상 수익:**
- Year 7: 5개 프로젝트 × $3M = $15M/년

### 9.6 Academic (학술)

#### 데이터셋 판매 ($100K/년)

**제공:**
- 43명 × 3년 익명화 데이터
- 7개 프레임워크 × 102개 도메인
- 학술 연구용 라이센스

**목표:**
- Year 5: 50개 기관 × $100K = $5M/년
- Year 7: 200개 기관 × $100K = $20M/년

### 9.7 수익 종합 예측

| Year | B2C | Clinical | Corporate | Tech | Gov | Academic | 총계 |
|------|-----|----------|-----------|------|-----|----------|------|
| 4 | $600K | - | - | - | - | - | $600K |
| 5 | $6M | $2M | - | - | - | $5M | $13M |
| 6 | $15M | $5M | $5M | $15M | - | $10M | $50M |
| 7 | $30M | $10M | $10M | $30M | $15M | $20M | $115M |
| 8 | $50M | $20M | $50M | $37.5M | $30M | $30M | $217.5M |

**Year 8 목표: $217.5M/년 = 약 $18M/월**

---

## 10. 시장 전략

### 10.1 시장 세분화

#### Segment 1: 20-30대 연애 중 (Primary)
- **규모**: 미국 3,000만 명, 한국 500만 명
- **특징**: 앱 사용 능숙, 관계 교육 니즈 높음
- **진입 전략**: SNS 마케팅, 인플루언서

#### Segment 2: 30-40대 결혼 준비/초기 (Secondary)
- **규모**: 미국 2,000만 명, 한국 300만 명
- **특징**: 진지한 관계, 지불 의사 높음
- **진입 전략**: 콘텐츠 마케팅, 웨딩 플래너 제휴

#### Segment 3: 40-50대 관계 위기 (Tertiary)
- **규모**: 미국 1,500만 명, 한국 200만 명
- **특징**: 이혼 위기, 치료 니즈
- **진입 전략**: 치료사 추천, 병원 제휴

### 10.2 경쟁 분석

#### 직접 경쟁자

**1. 데이팅 앱 (Tinder, Bumble, Hinge)**
- **강점**: 사용자 기반 거대, 네트워크 효과
- **약점**: 겉모습 중심, 관계 교육 없음, 단기 만남
- **우리 차별점**: 학습 → 성장 → 자연스러운 만남

**2. 관계 상담 앱 (BetterHelp, Talkspace)**
- **강점**: 전문가 풀, 신뢰도
- **약점**: 비쌈 ($260-400/월), 일반론적
- **우리 차별점**: AI + 데이터 기반 맞춤형, 저렴함 ($9.99/월)

**3. 자기계발 앱 (Headspace, Calm)**
- **강점**: 명상/마음챙김 시장 선점
- **약점**: 관계에 특화되지 않음
- **우리 차별점**: 관계 전문, 7개 프레임워크

#### 간접 경쟁자

**4. 커뮤니티 플랫폼 (Reddit, Discord)**
- **강점**: 활발한 토론, 다양한 주제
- **약점**: 전문성 없음, 데이터 기반 아님
- **우리 차별점**: 학술적 권위 + AI 인사이트

**5. 심리 테스트 앱 (16Personalities, Enneagram)**
- **강점**: 재미, 공유 욕구
- **약점**: 피상적, 실용성 부족
- **우리 차별점**: 7개 프레임워크 × 102개 도메인 깊이

### 10.3 진입 전략

#### Phase 1: 학술적 권위 확보 (Year 1-3)
- Nature/Science 논문 발표
- TED Talk (밀라르쉬)
- 학술 컨퍼런스 발표

#### Phase 2: 인플루언서 마케팅 (Year 4)
- 관계 테마 유튜버/인스타그래머
- 무료 프리미엄 제공 → 리뷰
- "나의 Prime Perspective는?" 챌린지

#### Phase 3: 콘텐츠 마케팅 (Year 4-5)
- 블로그: "관계 심리학 101"
- 유튜브: "100일 코드토크 후기"
- 팟캐스트: 밀라르쉬 인터뷰

#### Phase 4: 바이럴 그로스 (Year 5+)
- "친구 초대 시 1개월 무료"
- "커플 가입 시 2개월 무료"
- "Prime Perspective 공유" 기능

### 10.4 지역별 전략

#### 미국/영어권
- **진입:** Year 4
- **전략:** TikTok/Instagram 중심, 인플루언서
- **목표:** Year 5 100,000 유저

#### 한국
- **진입:** Year 4
- **전략:** 네이버 블로그, 유튜브, 카카오톡 연동
- **목표:** Year 5 50,000 유저

#### 일본
- **진입:** Year 6
- **전략:** LINE 연동, 애니메이션 스타일 UI
- **목표:** Year 7 30,000 유저

#### 유럽 (북유럽 우선)
- **진입:** Year 6
- **전략:** 복지 정책과 연계, 정부 협력
- **목표:** Year 7 20,000 유저

---

## 11. 43명 데이터 활용

### 11.1 데이터 수집 (Year 1-3)

#### 수집 데이터

**1. 인구통계**
- 43명 × (나이, 성별, 국적, 학력, 직업)

**2. 7개 프레임워크**
- 가면 12종 전환 패턴
- 성적 스펙트럼 3축 × 모든 조합
- 애착 4유형 × 관계 패턴
- 아비투스 4유형 × 계층 이동
- 트라우마 → 회복 경로
- 이혼 4유형 × 해체 과정
- 퀴어 관계 전 스펙트럼

**3. 관계 데이터**
- 43명 내부 관계 (누구와 언제 어떻게)
- 일일 로그 (1,095일 × 43명 = 47,085개 로그)
- 관계 이벤트 (대화, 섹스, 갈등 등)

**4. 멀티모달 데이터**
- 영상: 드론 촬영
- 음성: 대화 녹음
- 생체: 호르몬, 심박, 각성
- 텍스트: 일일 로그, 설문, 인터뷰

**예상 데이터 규모:**
- 구조화 데이터: 10GB
- 영상: 10TB
- 음성: 1TB
- 생체: 100GB
- **총: 약 11TB**

### 11.2 알고리즘 개발 (Year 2-3)

#### 핵심 알고리즘

**1. Prime Perspective 매칭 알고리즘**

```python
def calculate_pp_compatibility(user_a_pp, user_b_pp):
    """
    43명 데이터 기반:
    - Prime Perspective 조합별 장기 관계 성공률
    - 예: PP_A + PP_B → 83% 성공률 (n=12 케이스)
    """
    historical_matches = query_43_data(user_a_pp, user_b_pp)
    success_rate = calculate_success_rate(historical_matches)
    return success_rate
```

**2. 갈등 예측 모델**

```python
def predict_conflicts(user_a, user_b):
    """
    43명 데이터 기반:
    - 애착 유형 조합별 갈등 패턴
    - 예: 회피 + 불안 → 87% 확률로 "거리두기 vs 집착" 갈등
    """
    attachment_combo = (user_a.attachment, user_b.attachment)
    conflict_patterns = query_43_data_conflicts(attachment_combo)
    return conflict_patterns
```

**3. 관계 수명 예측**

```python
def predict_relationship_duration(user_a, user_b):
    """
    43명 데이터 기반:
    - 각 조합별 평균 관계 지속 기간
    - 해체 시점 예측
    """
    combo_features = extract_features(user_a, user_b)
    similar_cases = query_43_data_similar(combo_features)
    avg_duration = calculate_avg_duration(similar_cases)
    return avg_duration
```

**4. 개입 방법 추천**

```python
def recommend_intervention(user_a, user_b, conflict_type):
    """
    43명 데이터 기반:
    - 각 갈등 유형별 효과적인 개입 방법
    - 예: "소통 방식 갈등" → CodeTalk 100일 권장 (효과 92%)
    """
    similar_conflicts = query_43_data_conflicts_type(conflict_type)
    successful_interventions = filter_successful(similar_conflicts)
    return rank_by_effectiveness(successful_interventions)
```

### 11.3 앱 업그레이드 적용

#### PRIPER 2.0

**43명 데이터 활용:**

**Before (기존):**
- "당신의 Prime Perspective는 [X]입니다"
- 일반론적 설명

**After (업그레이드):**
- "당신과 같은 Prime Perspective를 가진 12명의 실제 데이터:"
  - 이들의 평균 관계 만족도: 7.8/10
  - 가장 잘 맞는 파트너 유형: Prime Perspective [Y]
  - 예상 갈등 지점: 소통 방식 (해결책 포함)
- "당신의 Prime Perspective로는 이런 파트너와 83% 호환"

#### CodeTalk 2.0

**43명 데이터 활용:**

**Before (기존):**
- 일일 키워드 + 정의 작성
- 파트너 정의 비교

**After (업그레이드):**
- "이 단어('사랑')에서 가장 많이 충돌한 조합 Top 10:"
  1. 회피형 + 불안형 (충돌률 78%)
  2. 포식형6 + 안정형 (충돌률 65%)
  ...
- "당신 조합(회피+불안)은 '사랑' 정의에서 87% 확률로 충돌"
- AI 가이드: "당신의 '사랑 = 자유' 정의는 유년기 [X] 각인에서 나왔을 가능성 78%"

#### DIVE 2.0

**43명 데이터 활용:**

**Before (기존):**
- F모드: 일반적 공감
- T모드: 일반론적 분석

**After (업그레이드):**
- F모드: "같은 상황(이별 통보)에서 안정형 애착 43%가 이렇게 반응했어요: [실제 사례]"
- T모드:
  - "당신 조합(회피+불안)은 87% 확률로 이런 패턴으로 갑니다: [43명 데이터 기반 예측]"
  - "43명 중 유사 케이스 8건 분석 결과, 가장 효과적인 개입: CodeTalk 100일 (성공률 92%)"
- 예측 정확도: 43명 실제 데이터 기반이므로 **정확도 ↑↑**

### 11.4 학술적 산출물

#### 논문 발표 (Year 3-4)

**1. Nature/Science 급 논문 (7편)**
- 각 프레임워크별 1편
- 예: "Attachment Patterns and Long-term Relationship Outcomes: A 3-Year Longitudinal Study of 43 Participants"

**2. 통합 이론서 (1편)**
- "The Complete Psychology of Relationships: Integrating 7 Frameworks Across 102 Domains"

**3. 데이터셋 공개**
- 익명화된 43명 데이터
- 학술 연구용 라이센스
- Kaggle/Zenodo 배포

#### 학술적 가치

**세계 최초:**
- 7개 프레임워크 × 102개 도메인 완전 매핑
- 43명 × 3년 멀티모달 관계 데이터
- 실제 관계 성과 예측 모델

**인용 예상:**
- 5년 내 1,000회 이상 인용
- 관계 심리학 필독 논문

---

## 12. 인프라 및 예산

### 12.1 클라우드 인프라

#### AWS 구성

**S3 (저장소):**
- 영상: 10TB
- 음성: 1TB
- 이미지: 500GB
- 백업: 11TB (전체 복제)
- **총: 22.5TB**

**비용:**
- 저장: $0.023/GB/월 × 22,500GB = $517/월
- 전송 (out): $0.09/GB × 1TB/월 = $90/월
- **총: $607/월**

**CloudFront (CDN):**
- 영상 스트리밍
- 이미지 최적화
- **비용: $200/월**

**총 AWS: $807/월 = $9,684/년**

#### Supabase

**Supabase Pro:**
- 데이터베이스: PostgreSQL
- 인증: Auth
- 보안: RLS
- 실시간: Realtime Subscriptions
- **비용: $25/월 = $300/년**

#### Vercel (프론트엔드 호스팅)

**Vercel Pro:**
- 무제한 배포
- Edge Functions
- Analytics
- **비용: $20/월 = $240/년**

### 12.2 AI/ML 비용

#### OpenAI GPT-4o

**사용량 예상:**
- DIVE 상담: 100만 대화/월
- 평균 입력: 500 토큰
- 평균 출력: 300 토큰
- **총 토큰: 800M/월**

**비용:**
- 입력: 500M × $10/1M = $5,000/월
- 출력: 300M × $30/1M = $9,000/월
- **총: $14,000/월 = $168K/년**

**최적화 후:**
- 캐싱: -30%
- 배치 처리: -20%
- **실제: $84K/년**

#### Whisper API

**사용량 예상:**
- 전문가 상담 녹음: 1,000시간/월
- **비용: 1,000 × 60분 × $0.006 = $360/월 = $4,320/년**

#### ElevenLabs

**Voice Cloning:**
- 프로 플랜: $99/월
- **비용: $1,188/년**

**총 AI/ML: $89,508/년**

### 12.3 개발 인력 (Year 1 기준)

#### Veilrum 팀 (11명)

**비서실 (5명):**
- Base 연봉 합계: 350M ($2.6M)
- 성과급: 200M ($1.5M)
- **총: $4.1M/년**

**IT 핵심 (3명):**
- Kai (Backend Lead): 150M ($1.1M)
- Rafael (AI/ML Lead): 160M ($1.2M)
- Leo (Backend Dev): 130M ($970K)
- **총: $3.27M/년**

**마케팅 (2명):**
- Mateo (Brand Lead): 130M ($970K)
- Nathan (Performance Lead): 120M ($895K)
- **총: $1.87M/년**

**운영 (1명):**
- Henrik (CS Lead): 115M ($858K)

**Year 1 인건비 총계: $10.1M**

#### 외주 개발 (추가)

- 디자인: $50K
- QA: $30K
- 법무/컴플라이언스: $40K
- **총: $120K**

### 12.4 마케팅 예산

**Year 1-3 (연구 단계):**
- 마케팅 없음
- **$0**

**Year 4 (클로즈드 베타):**
- 인플루언서: $100K
- 콘텐츠 제작: $50K
- SNS 광고: $50K
- **총: $200K**

**Year 5 (공개 베타):**
- 인플루언서: $300K
- SNS 광고: $500K
- 콘텐츠: $200K
- PR: $100K
- **총: $1.1M**

### 12.5 총 예산 요약

#### Year 1 (2026)

| 항목 | 금액 |
|------|------|
| 인건비 (11명) | $10.1M |
| 외주 개발 | $120K |
| 인프라 (AWS + Supabase + Vercel) | $10K |
| AI/ML (베타) | $20K |
| 드론/장비 | $30K |
| 보안/백업 | $10K |
| 운영비 | $50K |
| **총계** | **$10.34M** |

#### Year 2 (2027)

| 항목 | 금액 |
|------|------|
| 인건비 (확대) | $15M |
| 인프라 | $100K |
| AI/ML | $90K |
| 외주 | $200K |
| **총계** | **$15.39M** |

#### Year 3 (2028)

| 항목 | 금액 |
|------|------|
| 인건비 (23명 전원) | $20M |
| 인프라 | $150K |
| AI/ML (스케일) | $200K |
| 마케팅 (준비) | $100K |
| **총계** | **$20.45M** |

#### Year 4 (2029)

| 항목 | 금액 |
|------|------|
| 인건비 | $25M |
| 인프라 | $300K |
| AI/ML (프로덕션) | $500K |
| 마케팅 | $1M |
| **총계** | **$26.8M** |

**3년 총 투자 필요: $46.18M**
**4년 총 투자 필요: $72.98M**

---

## 13. 다음 단계 (CTO 및 사업개발팀)

### 13.1 즉시 실행 (Week 1-2)

**Beth (CEO):**
1. CTO 후보 리스트 작성
2. 사업개발 담당자 채용 공고
3. 법무팀과 데이터 보호 검토

**사빈 (COO):**
1. 상세 개발 일정표 작성
2. 벤더 리스트 (Supabase, AWS, OpenAI 등)
3. 예산 상세 항목별 분해

**Group Heads:**
1. 43명 데이터 수집 프로토콜 확정
2. 7개 프레임워크 디지털화 우선순위
3. 윤리 검토 (IRB 준비)

### 13.2 단기 (Month 1-3)

**CTO 영입 완료:**
- Sebastian Cross (비서실장) 주도
- David Nakamura (전략 비서관) 지원
- 후보: Meta/Google/Stripe 출신

**개발팀 구성:**
- Backend Lead: Kai Andersen
- AI/ML Lead: Rafael Costa
- Frontend: 외주 (초기)

**43명 온보딩:**
- Research Edition 앱 프로토타입
- 일일 로그 시스템
- 첫 1개월 데이터 수집

### 13.3 중기 (Month 4-12)

**Year 1 개발 완료:**
- 연구원 전용 앱
- 7개 프레임워크 진단
- 관계 추적 대시보드
- 생체데이터 통합

**학술 논문 준비:**
- 1차 데이터 분석
- 논문 초안 작성

### 13.4 장기 (Year 2-4)

**알고리즘 개발:**
- 43명 데이터 완전 분석
- 매칭/예측 모델 구축

**통합 플랫폼 구축:**
- PRIPER/CodeTalk/DIVE 통합
- 단일 앱 퍼블리싱

**공개 베타:**
- 1,000명 → 5,000명 → 50,000명
- 프리미엄 구독 검증

---

## 부록

### A. 기술 용어집

| 용어 | 정의 |
|------|------|
| Prime Perspective | 개인의 독특한 세계 인식 렌즈 (PRIPER 핵심 개념) |
| 100일 코드토크 | 매일 하나의 키워드로 100일간 정의각인 탐색 |
| F모드 | DIVE의 감정 공감형 상담 모드 |
| T모드 | DIVE의 분석형 상담 모드 |
| RLS | Row Level Security (Supabase 보안) |
| Edge Functions | 서버리스 함수 (Deno 기반) |
| WebRTC | 실시간 음성/영상 통신 프로토콜 |

### B. 참고 문서

1. **기존 앱 문서:**
   - `PRIPER_종합개발문서.md`
   - `CodeTalk_완전가이드.md`
   - `DIVE_종합문서.md`

2. **연구팀 문서:**
   - `Millarche_Research_Team_Meeting_Agenda_A001_20260214.md`
   - `Team_Roster_Quick_Reference_20260214.md`

3. **프레임워크 문서:**
   - `Mille_Arche_Project_Bible_v1_0_20260213_VEILRUM_20260214.md`
   - `Mille_Arche_Character_Bible_v2_2_20260213_VEILRUM_20260214.md`

### C. 연락처

**Beth Birkin (CEO of Veilrum)**
- Email: beth@veilrum.com
- Slack: @beth

**Sabine Crawford (COO of M43)**
- Email: sabine@veilrum.com
- Slack: @sabine

**Mille Arche (CEO of M43, Chief Research Advisor of Veilrum)**
- Email: mille@millearche.org
- Slack: @mille

---

**작성:** Sabine Crawford, COO of M43  
**검토:** Beth Birkin, CEO of Veilrum  
**승인 대기:** Mille Arche, CEO of M43, Chief Research Advisor of Veilrum

**다음 회의:** CTO 후보 인터뷰 (일정 미정)

---

*Veilrum Confidential - Internal Use Only*  
*이 문서는 Veilrum 내부 개발 가이드이며 외부 유출 시 법적 조치 대상입니다.*
