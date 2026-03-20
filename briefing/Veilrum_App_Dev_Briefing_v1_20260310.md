# Veilrum 앱 개발 브리핑 — 새 창 시작용

**작성일:** 2026-03-10
**용도:** 새 창에서 Veilrum 앱 통합 개발 시작 시 컨텍스트 로딩
**관련 창:** VEILRUM 창 (M43 연구 콘텐츠 생성 담당)

---

## 1. 핵심 결정 사항 (확정)

### 앱 아키텍처
> **"하나의 계정, 여러 경험"** — Kai Andersen CTO 확정
> Veilrum 계정 하나로 로그인 → PRIPER/CodeTalk/DIVE/RS12가 각각의 인터페이스로 열림
> 뒤에서는 RI API(단일 데이터 레이어) 하나가 돌아가는 구조
> **슈퍼앱 아님. 통합 계정 + 분리된 경험.**

### Veilrum 플랫폼 = 3개 앱 통합
| 모듈 | 현재 위치 | 완성도 | 핵심 기능 |
|------|----------|--------|----------|
| **PRIPER** | `/Desktop/PRIPER/` | 80% | Why 컨설팅 10단계, Prime Perspective, Ikigai, 브랜드 설계 |
| **DIVE** | `/Desktop/DIVE/` | 70% | F/T모드 상담, 관계력 추적, 전문가 상담, AI 상담사 |
| **CodeTalk** | DB에만 있음 (코드 없음) | 기획 완료 | 일일 키워드, 100일 코드토크, 퍼블릭스토리 |
| **Community** | 미개발 | - | 유형별 그룹, 포럼, DM |
| **Dating** | 미개발 | - | Year 2+ 예정 |

### 유저
- **일반 대중** (관계 고민 있는 사람)
- 관계 심리학 → 자기이해 → 커뮤니티 → 자연스러운 만남 순서

---

## 2. 기존 코드 현황

### PRIPER (`/Desktop/PRIPER/`)
```
React 18 + TypeScript + Vite + Tailwind
Supabase (supabase-js ^2.54)
React Router DOM v6
TanStack Query v5
Radix UI (shadcn 기반)
```
**주요 페이지:**
- Brainstorm, Define, Classify, Why, WhyAnalysis, Results — Why 컨설팅 10단계
- Personas, PersonaRelationships — 멀티페르소나
- Ikigai, BrandDesign — 심화 기능
- Community, GroupDetail — 커뮤니티 (일부 구현)
- Dashboard, Onboarding, Chat

**Supabase:** `/Desktop/PRIPER/src/integrations/` 에 클라이언트 설정 있음

---

### DIVE (`/Desktop/DIVE/`)
```
React 18 + TypeScript + Vite + Tailwind (프론트)
Express + OpenAI + Socket.io + Stripe (백엔드 서버, 별도)
```
**주요 페이지:**
- FModeChat, TModeAnalysis — F/T 모드 상담
- RelationshipDashboard — 관계력 추적
- ExpertConsultation, TherapistBooking, VideoConsultation — 전문가 연결
- CustomCounselor, VoiceCloningPage — AI 상담사
- Community, ChallengePage — 커뮤니티

**백엔드 서버:** `/Desktop/DIVE/server/`
- Express + OpenAI + Socket.io + Stripe + Redis
- Railway/Render 배포 설정 있음

---

## 3. Supabase DB 현황

**프로젝트 ID:** `qwiwotodwfgkpdasdhhl`
**3개 플랫폼 공유 (스키마 분리)**

### veilrum 스키마 (15개 테이블)
| 테이블 | 데이터 | 용도 |
|--------|--------|------|
| `user_profiles` | 0 | Veilrum 유저 프로필 |
| `prime_perspectives` | 0 | PRIPER 결과 저장 |
| `codetalk_keywords` | **100개** | 100일 키워드 목록 완비 |
| `codetalk_entries` | 0 | 유저 코드토크 기록 |
| `dive_sessions` | 0 | DIVE 상담 세션 |
| `community_groups` | **24개** | 커뮤니티 그룹 설정 완료 |
| `community_memberships` | 0 | 그룹 멤버십 |
| `community_posts` | 0 | 게시글 |
| `community_comments` | 0 | 댓글 |
| `dm_rooms` | 0 | DM 방 |
| `dm_messages` | 0 | DM 메시지 |
| `researcher_profiles` | **40명** | M43 연구원 프로필 |
| `researcher_daily_logs` | 0 | 연구원 일일 로그 |
| `relationship_events` | 0 | 관계 이벤트 |
| `biometric_data` | 0 | 생체 데이터 |

### public 스키마 — M43 관련 (연결 가능)
- `m43_domain_theories` — 밀라르쉬 발제 이론 (콘텐츠 기반)
- `m43_research_outputs` — 연구원 분석
- `characters_core` — 341명 캐릭터 (Veilrum 상담 캐릭터 포함)

### Supabase 접속 패턴
```bash
# Python으로 직접 쿼리할 때
cd /Users/brandactivist/Desktop/DEEPPLOT/supabase-client
/opt/homebrew/bin/python3.11 - << 'PYEOF'
import sys; sys.path.insert(0, '.')
from db import get_supabase_client
sb = get_supabase_client()
sb.schema("veilrum").table("user_profiles").select("*").execute()
PYEOF
```
> Python 3.9 사용 금지 (타입 힌트 오류). 반드시 `/opt/homebrew/bin/python3.11`

---

## 4. 새 창에서 해야 할 작업

### 즉시 결정해야 할 것

**Q: 개발 방식 선택**
- **A (권장):** 새 통합 프로젝트 생성 (`/Desktop/VEILRUM-APP/`)
  - React + Vite (PRIPER/DIVE와 동일 스택, 통일성)
  - 기존 PRIPER/DIVE 코드 컴포넌트 단위로 이식
  - Veilrum 계정 시스템 + 통합 라우팅 새로 설계
- **B:** PRIPER 코드베이스를 베이스로 확장

**Q: 백엔드 서버 필요 여부**
- DIVE는 Express 서버 별도 있음 (OpenAI 프록시 역할)
- 통합 시 Supabase Edge Functions로 대체 가능 (서버리스)
- 또는 DIVE 서버를 통합 백엔드로 확장

### 추천 시작 순서
1. 통합 프로젝트 스캐폴딩 (`/Desktop/VEILRUM-APP/`)
2. Supabase 연동 + `veilrum` 스키마 TypeScript 타입 생성
3. 인증 시스템 (Supabase Auth)
4. PRIPER 핵심 플로우 이식 (Why 컨설팅 10단계)
5. CodeTalk 신규 개발 (키워드 100개 이미 DB에 있음)
6. DIVE 이식
7. Community 통합

---

## 5. 기술 스택 (확정)

```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS
UI:        Radix UI (shadcn/ui) — PRIPER/DIVE와 동일
State:     TanStack Query v5 + Zustand
Router:    React Router DOM v6
Backend:   Supabase (PostgreSQL + Auth + RLS + Realtime)
AI:        OpenAI GPT-4o (DIVE 상담, CodeTalk AI 조언)
Voice:     ElevenLabs (AI 상담사 목소리)
Deploy:    Vercel (프론트) + Supabase Edge Functions (API)
Payment:   PortOne (한국) + Stripe (해외)
```

---

## 6. 비즈니스 컨텍스트

**발견 → 관리 → 만족** (최상위 프레임)
- 발견 = PRIPER (무료 훅)
- 관리 = CodeTalk + DIVE (구독 $9.99/월)
- 만족 = 합의된 삶 측정, 프리미엄 업셀

**M43 연구와 연결:**
- M43 연구 결과 → Veilrum 알고리즘 + 콘텐츠 기반
- `public.m43_domain_theories` → 앱 내 콘텐츠로 변환
- `characters_core` → Veilrum 상담 캐릭터 (캐릭터가 상담자 역할)

**DEEPPLOT/VIVIDI와의 관계:**
- 3개 플랫폼이 같은 Supabase 프로젝트 공유
- `public.characters_core` (341명)에서 project='Veilrum' 캐릭터 = 상담 캐릭터
- 캐릭터 Core DNA는 어느 플랫폼에서나 동일

---

## 7. 참조 문서

| 문서 | 위치 | 내용 |
|------|------|------|
| 플랫폼 통합 설계 | `/VEILRUM/04_회의록/Millarche_Agenda_A001_06_2_Veilrum_Platform_Integration_v1_20260215.md` | 6모듈 상세, DB 스키마, 개발 로드맵, 수익모델 전체 |
| C-Level 세션 | `/VEILRUM/01_연구설계/M43_E_베일럼.md` | 발견-관리-만족 확정, 팀 구성 |
| 브레인스토밍 | `/VEILRUM/06_베일럼/VR_Brainstorming_Discussion_v1_20260216.md` | 콘텐츠 전략, 플라이휠 구조 |
| PRIPER 개발 문서 | `/Desktop/PRIPER/PRIPER_종합개발문서.md` | 기존 코드 상세 |
| DIVE 개발 문서 | `/Desktop/DIVE/DIVE_프로젝트_종합문서.md` | 기존 코드 상세 |
| 캐릭터DB 비전 | `/Desktop/DEEPPLOT/docs/deepplot_CharacterDB_Vision_v1_20260310.md` | 3플랫폼 캐릭터 공유 구조 |

---

## 8. 이 창에서 하지 않는 것

- M43 연구 콘텐츠 생성 → **VEILRUM 창**에서 담당
- M43 DB 스키마 수정 → **VEILRUM 창**에서 담당
- 연구원 캐릭터 프로필 작업 → **VEILRUM 창**에서 담당

---

*Veilrum_App_Dev_Briefing_v1 | 2026-03-10*
