# Millarche_Agenda_A001_06_2_Veilrum_Platform_Integration_v1_20260215 (Part 2: 아키텍처·DB·여정·로드맵)

> Part 1: 플랫폼 비전 · 3개 앱 · 핵심 기능
> 

> **Part 2: 통합 아키텍처 · 데이터 구조 · 사용자 여정 · 개발 로드맵**
> 

> Part 3: 기술 스택 · 수익 모델 · 시장 전략 · 43명 데이터 · 인프라/예산
> 

---

## 4. 통합 아키텍처

### 4.1 프론트엔드

**기술 스택:** React 18+, TypeScript, Tailwind CSS, React Query, Zustand

**네비게이션 (5탭 바):** 홈, 자기 이해(PRIPER), 키워드(CodeTalk), 상담(DIVE), 커뮤니티

```
src/
├── components/ (common/priper/codetalk/dive/community/connect/dating)
├── pages/
├── hooks/
├── utils/
├── api/
└── types/
```

### 4.2 백엔드

**기술 스택:** Supabase (PostgreSQL + Auth + RLS + Realtime), Edge Functions (Deno)

```
/api/ (auth / users / priper / codetalk / dive / community / matching / admin)
```

### 4.3 AI 파이프라인

| 서비스 | 용도 |
| --- | --- |
| OpenAI GPT-4o | DIVE F/T 모드, CodeTalk AI 조언, 커뮤니티 필터, 프로필 분석 |
| Whisper API | 음성 → 텍스트 (전문가 상담 녹음) |
| ElevenLabs | Voice Cloning, TTS |

**비용 최적화:** 응답 캐싱, 토큰 제한, 배치 처리

### 4.4 보안 아키텍처

- **인증:** Supabase Auth (JWT, Refresh Token)
- **권한:** Row Level Security (RLS), RBAC (User/Premium/Expert/Admin)
- **암호화:** 전송 HTTPS/TLS 1.3, 저장 AES-256
- **프라이비시:** GDPR 준수, 데이터 삭제 요청, 익명화

---

## 5. 데이터 구조

### 핵심 테이블 (SQL)

**users:** id, email, subscription_tier (free/premium), dating_mode_enabled

**prime_perspectives:** perspective_text, core_values, ikigai, happiness_patterns, pain_patterns, imprinting_moments, brand_identity

**codetalk_entries:** keyword, day_number(1-100), definition, imprinting_moment, root_cause, partner_id, ai_insights

**dive_sessions:** mode('F'/'T'), messages(JSONB), emotion_analysis, conflict_summary, partner_pattern, solutions, emotional_stability, conflict_frequency, recovery_speed

**community_posts:** title, content, is_anonymous, tags, upvotes

**community_groups:** name, category, auto_assign_criteria, member_count

**matches (Year 2+):** user_a_id, user_b_id, compatibility_score, long_term_success_rate, predicted_conflicts, status

### 43명 연구팀 전용 테이블

**researchers:** name, age, group(A/B/C/D), division(1-12), prime_perspective, attachment_type, sexual_spectrum, habitus

**researcher_daily_logs:** mood_score, energy_level, met_with, sexual_activity, notes

**relationship_events:** event_type(대화/섹스/갈등/화해...), location, duration_minutes, video_url, audio_url, transcript, emotion_analysis

**biometric_data:** heart_rate, stress_level, hormone_levels(cortisol/oxytocin...), activity

### 데이터 관계도

```
users
  ├─ prime_perspectives (1:1)
  ├─ codetalk_entries (1:N)
  ├─ dive_sessions (1:N)
  ├─ community_posts (1:N)
  ├─ matches (N:N)
  └─ researchers (1:1, 43명만)
       ├─ researcher_daily_logs (1:N)
       ├─ relationship_events (N:N)
       └─ biometric_data (1:N)
```

---

## 6. 사용자 여정

### Day 1 (신규 가입)

1. 회원가입 (이메일/소셜 로그인)
2. 온보딩 (Veilrum 소개 1분 영상 + 3개 모듈 설명)
3. 첫 경험: PRIPER Why 콘설팅 (30-45분) → Prime Perspective 발견
4. 커뮤니티 자동 배치

### Day 2-30 (일상 사용)

- 아침 (07-09시): CodeTalk 오늘의 키워드 알림
- 낙 (12-18시): 커뮤니티 활동
- 저녀 (18-02시): 퍼블릭스토리
- 필요 시: DIVE F/T 모드

### Day 31-100 (심화)

- CodeTalk 100일 완주
- PRIPER Ikigai/브랜드/멀티 페르소나
- 커뮤니티 디프 다이브

### Day 100+ (관계 형성)

- 커뮤니티 → 1:1 DM → 실제 관계
- 데이팅 모드 (Year 2+, 선택)

### 프리미엄 전환 트리거

1. PRIPER 브랜드 설계 접근
2. CodeTalk AI 조언 5회 사용 후
3. DIVE 전문가 상담 예약
4. 커뮤니티 고급 기능
5. AI 상담사 생성

---

## 7. 개발 로드맵

### Year 1 (2026): Research Edition

| 분기 | 개발 내용 | 예산 |
| --- | --- | --- |
| Q1 | Supabase 셋업, 43명 온보딩, 일일 로그 | $55K |
| Q2 | 7개 프레임워크 진단, 드론 예약 | $105K |
| Q3 | 생체데이터 통합, AI 파이프라인 | $70K |
| Q4 | 데이터 검증, 알고리즘 1차, 안호/백업 | $35K |
| **Year 1 총** |  | **$265K** |

### Year 2 (2027): 알고리즘 개발

- Q1: Year 1 데이터 심층 분석, 패턴 추출
- Q2: Prime Perspective 매칭 알고리즘, 관계 예측 모델
- Q3: 베타 테스트 (외부 유저 100명)
- Q4: PRIPER/CodeTalk/DIVE 통합 설계 시작
- **Year 2 총: $400K**

### Year 3 (2028): MVP 출시

- Q1: 3개 모듈 완전 통합, 단일 앱 (iOS/Android)
- Q2: 클로즈드 베타 (1,000명), $9.99/월 테스트
- Q3: 공개 베타 (5,000명), 마케팅 시작
- Q4: Public Launch, 앱스토어 Featured 목표
- **Year 3 총: $600K**

### Year 4+ (2029-)

- Year 4: 50,000명, 데이팅 모드, 영어권 확장
- Year 5: 500,000명, B2B 시작
- Year 6+: 글로벌 (10개 언어), IPO 준비

**3년 총 투자 필요:** $46.18M | **4년 총:** $72.98M