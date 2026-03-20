# Millearche codetalk dev guide v1 20260215 · MD

**버전**: 2025-08-19 복구 완료

**최종 업데이트**: 2025년 12월 18일 (PortOne 마이그레이션 완료)

**용도**: [Lovable.dev](http://Lovable.dev) → Claude Code 이전용 완전 가이드

---

# 1. 프로젝트 개요

## 1.1 기본 정보

| 항목 | 내용 |
| --- | --- |
| **서비스명** | CodeTalk |
| **플랫폼** | [Lovable.dev](http://Lovable.dev) (React + TypeScript) |
| **백엔드** | Supabase (PostgreSQL + Auth + RLS) |
| **서비스 도메인** | 일일 키워드 기반 정의각인 기록 및 공유 |
| **현재 상태** | ✅ 프로덕션 준비 완료 |

## 1.2 핵심 가치

- 매일 하나의 키워드로 사용자들의 개인적 정의와 경험 공유
- 18시-02시 퍼블릭스토리 운영으로 깊이 있는 소통
- AI 관계조언 서비스로 프리미엄 가치 제공
- 가상 유저 시스템으로 자연스러운 커뮤니티 형성

---

# 2. 기술 스택 및 아키텍처

## 2.1 프론트엔드

- React 18 + TypeScript
- Tailwind CSS
- React Query (@tanstack/react-query)
- React Router
- Sonner (Toast 알림)
- Lucide React (아이콘)

## 2.2 백엔드

- Supabase - PostgreSQL 15+
- Row Level Security (RLS)
- Real-time subscriptions
- Edge Functions
- 자동 백업 (Pro 플랜)

## 2.3 폴더 구조

- `src/components/` - React 컴포넌트
- `src/hooks/` - 커스텀 훅
- `src/lib/` - 유틸리티 함수
- `src/constants/` - 텍스트 상수
- `src/pages/` - 페이지 컴포넌트
- `src/integrations/` - Supabase 연동

---

# 3. 데이터베이스 구조

## 3.1 핵심 테이블

- **profiles** - 사용자 프로필 (id, email, role, notifications_enabled)
- **subscribers** - 구독 정보 (user_id, subscription_tier, subscription_end, payment_gateway, portone_customer_id 등)
- **daily_keywords** - 일일 키워드 (date UNIQUE, keyword, definition, example, display_order)
- **stories** - 사용자 스토리 (user_id, keyword, definition, impression)
- **ghost_users** - 가상 유저 (email, nickname, persona_data JSONB, is_active)
- **ghost_stories** - 가상 스토리 (ghost_user_id, keyword, definition, impression)

## 3.2 RLS 정책

- profiles: 본인 데이터만 조회/수정
- stories: 본인 작성만 수정, 퍼블릭스토리 시간대에 전체 조회
- daily_keywords: 전체 조회, 관리자만 수정
- subscribers: 본인 정보만 접근

---

# 4. 핵심 운영 로직 (시간대 기반)

## 4.1 시간 상수

- UNLOCK_HOUR = 18 (퍼블릭스토리 오픈 6PM)
- LOCK_HOUR = 2 (퍼블릭스토리 종료 2AM)

## 4.2 서비스 운영 시간표

| 시간대 | 정의각인 기록 | 퍼블릭스토리 |
| --- | --- | --- |
| 00:00 - 18:00 | 오늘 키워드 기록 가능 | 대기화면 |
| 18:00 - 23:59 | 내일 키워드 기록 가능 | ✅ 오픈 (오늘 참여자만) |

## 4.3 KST 시간 처리

항상 KST 기준으로 처리. `getKSTTime()` 함수로 통일.

## 4.4 활성 키워드 판단

- 18시 이후: 내일 키워드 활성 (period: 'tomorrow')
- 18시 이전: 오늘 키워드 활성 (period: 'today')

## 4.5 퍼블릭스토리 접근 제어

- 오픈 여부: 18:00~23:59만 오픈
- 참여 여부: 해당 시간대의 키워드로 기록한 사용자만 접근

---

# 5. 주요 컴포넌트 및 페이지

## 5.1 페이지 구조

| 파일명 | 용도 |
| --- | --- |
| Index.tsx | 메인 키워드 기록 페이지 |
| Feed.tsx | 퍼블릭스토리 피드 |
| Admin.tsx | 관리자 대시보드 |
| RelationshipAdvice.tsx | AI 관계조언 서비스 (프리미엄) |

## 5.2 핵심 컴포넌트

- TodayKeyword.tsx - 키워드 입력 폼
- StoryFeed.tsx - 스토리 피드 (가상/실제 통합)
- KeywordManagement.tsx - 키워드 CRUD
- GhostUsersManagement.tsx - 가상유저 생성 및 자동화
- MultiPersonaGrid.tsx - 멀티페르소나 관리
- TimeGate.tsx - 시간대 기반 접근 제어
- BottomNavigation.tsx - 하단 네비게이션

## 5.3 핵심 훅

- `useCurrentKeywordInfo` - 현재 키워드 정보 (RPC 대신 직접 쿼리)
- `useUserRole` - 사용자 권한 확인
- `useSubscription` - 구독 관리 (PortOne)

---

# 6. 해결된 주요 문제들

## 6.1 RPC 함수 502 에러 ✅

문제: RPC 함수 불안정. 해결: 직접 쿼리로 대체.

## 6.2 .single() 메서드 에러 ✅

문제: 18개 파일에서 `.single()` 사용으로 에러. 해결: 모든 `.single()`을 배열 접근 `data?.[0]`으로 변경.

## 6.3 텍스트 상수화 ✅

모든 하드코딩 텍스트를 `src/constants/` 하위 상수 파일로 분리 (messages.ts, ui.ts, placeholders.ts)

---

# 7. 가상 유저 시스템

## 7.1 시스템 개요

서비스 초기 활성화와 자연스러운 커뮤니티 형성을 위한 자동화 시스템.

- 20개의 독립적인 가상유저 계정
- 실제 사용자 활동 패턴 기반 시간 분산
- 각 가상유저별 고유 페르소나
- 매일 설정 시간 자동 실행

## 7.2 시간 분포 패턴

| 시간대 | 가중치 | 설명 |
| --- | --- | --- |
| 07:00-09:00 | **25%** | 출근시간대 |
| 13:00-14:00 | 15% | 점심 직후 |
| 18:00-19:00 | 20% | 퇴근시간대 |
| 20:00-22:00 | **35%** | 저녁식사 후 (최고) |
| 기타 | 5% | 나머지 시간대 |

## 7.3 자동화 설정

- 실행 시간: 09:00 KST
- 참여 인원: 10~20명
- 현실적 타임스탬프 생성 (가중치 기반 시간대 선택 → 랜덤 시간)
- 키워드별 자연스러운 정의/각인 기억 생성

---

# 8. 중요한 개발 패턴

## 8.1 에러 처리

- RPC 함수 대신 직접 쿼리 사용
- `.single()` 대신 배열 접근 `data?.[0]`

## 8.2 React Query 사용

- staleTime: 60초, refetchInterval: 60초, retry: 2회

## 8.3 시간 처리

- 항상 KST 기준 `getKSTTime()`
- 시간대 범위 쿼리: `.gte/.lte` 사용 (+09:00)

## 8.4 금지 사항

| 금지 | 설명 |
| --- | --- |
| ❌ .single() | 에러 발생 원인 |
| ❌ RPC 함수 | 불안정 |
| ❌ localStorage | Artifact 제한 |
| ❌ 하드코딩 텍스트 | 상수 파일 사용 필수 |

## 8.5 권장 패턴

| 권장 | 설명 |
| --- | --- |
| ✅ 직접 쿼리 | RPC 대신 |
| ✅ 배열 접근 | data?.[0] |
| ✅ 상수 import | constants에서 |
| ✅ KST 시간 | getKSTTime() |
| ✅ React Query | 서버 상태 관리 |

---

# 9. 배포 및 운영

## 9.1 환경변수

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SUPABASE_SERVICE_ROLE_KEY

## 9.2 백업 정책

- 자동 일일 백업 (7일 보관)
- Point-in-Time Recovery (분 단위 복구)
- 복구 이력: 2025-08-19 → 2025-08-18 14:03 복구 완료

---

# 10. Claude Code 이전 체크리스트

- ✅ 모든 소스 코드 이전 완료
- ✅ 환경변수 설정 완료
- ✅ Supabase 연결 확인
- ⬜ RLS 정책 재확인 필요
- ⬜ 모든 페이지 접근 테스트
- ⬜ 시간대 로직 검증
- ⬜ 가상 유저 자동화 테스트

---

# 11. 결제 시스템 (PortOne)

## 11.1 시스템 개요

- 마이그레이션: Stripe → PortOne (2025-12-18)
- 이유: 해외 카드 + 한국 간편결제 + 한국 계좌 직접 정산

## 11.2 구독 플랜

| 플랜 | 월간 | 연간 | 할인율 |
| --- | --- | --- | --- |
| Basic | $5 | $48 | 20% |
| Premium | $10 | $96 | 20% |

## 11.3 Payment Gateway 구분

| 값 | 의미 |
| --- | --- |
| `portone` | PortOne 실제 결제 |
| `manual` | 관리자 수동 지정 |
| `stripe(legacy)` | 과거 Stripe 레거시 |

## 11.4 핵심 파일

- `src/integrations/portone/types.ts` - 타입 정의
- `src/integrations/portone/client.ts` - PortOne 클라이언트
- `src/hooks/useSubscription.tsx` - 구독 훅
- `supabase/functions/portone-webhook/index.ts` - 웹훅 핸들러

## 11.5 결제 플로우

사용자 플랜 선택 → PortOne SDK requestPayment() → 결제 UI → 결제 정보 입력 → Webhook → subscribers 테이블 업데이트 → 구독 상태 조회

---

# 12. 향후 개발 계획

## 단기 (1주일)

- 누락 데이터 보완
- 전체 시스템 안정성 검증
- 사용자 피드백 수집 강화

## 중기 (1개월)

- 고스트 유저 시스템 고도화
- AI 관계조언 성능 최적화
- 모바일 앱 버전 검토

## 장기 (3개월)

- 사용자 커뮤니티 기능 확장
- 데이터 분석 및 인사이트
- 수익화 모델 고도화

---

# 13. 주요 파일 위치

- `src/lib/timeUtils.ts` - 시간 처리 유틸리티
- `src/hooks/useKeywordSealStatus.tsx` - 키워드 정보 훅
- `src/hooks/useUserRole.tsx` - 사용자 권한 훅
- `src/hooks/useSubscription.tsx` - 구독 관리 (PortOne)
- `src/constants/messages.ts` - 메시지 상수
- `src/components/GhostUsersManagement.tsx` - 가상유저 관리
- `src/integrations/portone/` - PortOne 결제 통합
- `src/pages/Index.tsx` - 메인 페이지
- `src/pages/Feed.tsx` - 퍼블릭스토리
- `src/pages/Admin.tsx` - 관리자 대시보드

---

**문서 작성일**: 2025-11-23

**최종 업데이트**: 2025-12-18 (PortOne 마이그레이션 완료)

**프로젝트 상태**: ✅ 프로덕션 준비 완료