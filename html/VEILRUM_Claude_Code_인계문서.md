# VEILRUM — Claude Code 인계 문서
## HTML → React/JSX 포팅 + 백엔드 연결 전체 가이드
**2026-03-21**

---

## 0. 이 문서의 목적

5개 HTML 파일을 React/JSX로 포팅하고, 백엔드/DB를 연결하기 위한 전체 컨텍스트 문서다.
HTML 파일은 디자인 스펙 + 인터랙션 레퍼런스로 사용하되, **코드를 복사하는 게 아니라 보고 재구현한다.**

> 앱 경로: `/Desktop/VEILRUM-APP/`

### Claude Code가 이 문서로 할 수 있는 것

- 5개 탭 HTML → React 컴포넌트 포팅
- Supabase 연결 및 실시간 데이터 로드
- Zone Control 토글 → `persona_zones` 테이블 실시간 CRUD
- signals 저장/로드 흐름 구현
- 정밀도% 계산 함수 작성
- AI 캐릭터 이름/언어 설정 앱 전체 반영

---

## 1. 인계 파일 목록

| 파일명 | 탭 | 버전 | 핵심 역할 |
|--------|-----|------|-----------|
| `veilrum_vent_v5.html` | Vent | v5 | 감정 표출. 감정칩 8개 → AI 대화. 나의 레이어(Zone 13개). |
| `veilrum_dig_v12.html` | Dig | v12 | 패턴 탐색. CodeTalk 3단계 + PRIPER 진입. |
| `veilrum_get_v5.html` | Get | v5 | 통찰. Amber+Frost AI 코칭. 결산 카드 4개. |
| `veilrum_set_v4.html` | Set | v4 | 통합. 패턴 리스트 → 선택 → 3단계 가이드. |
| `veilrum_me_v4.html` | Me | v4 | 마이페이지. 성장/사람들/Zone + 설정 시트(⚙). |

---

## 2. 앱 철학 — 반드시 이해하고 구현할 것

베일럼은 **"관계의 모든 고통을 덜어주는 곳"** 이다.
핵심 인사이트: 대부분의 관계 고통은 자기 자신을 모르는 것에서 온다.

### 5탭 구조의 기원 — 상담 4단계

탭 구조는 임의로 정한 게 아니라, 실제 상담 단계에서 왔다.

| 탭 | 상담 단계 | 핵심 | 탭 포인트 컬러 |
|----|----------|------|---------------|
| Vent | 표출 (Catharsis) | 감정을 꺼낸다 | `#D4A574` |
| Dig | 탐색 (Exploration) | 패턴과 뿌리를 찾는다 | `#A07850` |
| Get | 통찰 (Insight) | 나는 이런 사람이구나 수용 | `#8C7060` |
| Set | 통합 (Integration) | 새로운 나로 셋팅 | `#C4A355` |
| Me | 누적 (Archive) | 변화 추적 | `#E7C17A` |

---

## 3. Supabase 연결 정보

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | `qwiwotodwfgkpdasdhhl` |
| 스키마 | `veilrum` (모든 테이블은 이 스키마 안에 있음) |
| 앱 경로 | `/Desktop/VEILRUM-APP/` |
| 기술 스택 | React 18 + TypeScript + Vite + Tailwind + Zustand + Supabase |

> ⚠️ 모든 쿼리는 `veilrum` 스키마를 명시할 것. 예: `FROM veilrum.user_profiles`

---

## 4. DB 테이블 전체 현황 (veilrum 스키마)

아래 테이블들은 **모두 이미 존재한다.** 신규 생성 없이 바로 연결 가능하다.

### 4-1. 핵심 유저 테이블

#### `user_profiles` — 유저 기본 정보 + 설정

```
user_id, display_name, age, gender, relationship_status
subscription_tier (free/pro), subscription_expires_at
onboarding_step          -- null / zone_setup / status_check / completed
priper_completed (bool), priper_completed_at
primary_mask, secondary_mask    -- PRIPER 결과 가면 유형
axis_scores (jsonb)      -- {attachment, communication, expression, role}
ai_companion_name (text) -- Amber 이름 커스터마이징 (기본값: 엠버)
ai_companion_type (text) -- amber / frost / both
preferred_lang (text)    -- ko / en / ja
input_mode (text)        -- text / voice
held_last_emotion (text) -- Vent 마지막 감정칩 값
held_session_count (int) -- Vent 세션 누적 횟수
```

---

#### `persona_zones` — Zone Control 설정 ✅ 이미 존재

```
user_id
layer       -- social / daily / secret
sub_zone    -- s1~s4, d1~d4, t1~t5
is_enabled (bool)
enabled_at (timestamp)
```

> 온보딩 완료 시 13개 row 일괄 INSERT (`is_enabled = true`). 이후 유저 토글 → UPDATE.

---

#### `persona_instances` — 멀티페르소나 분석 결과

```
user_id, persona_label, persona_layer
vent_signals, dig_signals, get_signals, set_signals (jsonb)
consistency_score, confidence_score (int)
contradictions (jsonb)   -- 페르소나 간 충돌 데이터
insights, recommendations (jsonb)
is_primary (bool), layer_group (text)
```

---

#### `persona_layer_meta` — Zone 레이어 메타데이터 (레퍼런스)

```
layer_key (s1~t5), layer_group (social/daily/secret)
label_ko, label_en, description
sensitivity (int 1-3), requires_trust (bool)
```

---

### 4-2. 탭별 데이터 테이블

#### `tab_conversations` — 탭별 대화 기록

```
user_id, tab (vent / dig / get / set)
messages (jsonb)         -- 대화 전체 배열
context_summary (text)   -- AI가 생성한 맥락 요약
held_keywords (array)    -- Vent에서 추출된 키워드
dig_patterns (jsonb)     -- Dig에서 발견된 패턴
session_count (int), last_active_at (timestamp)
```

#### `dive_sessions` — AI 코칭 세션 (Get 탭 기반)

```
user_id, mode (amber / frost / both)
messages (jsonb), emotion_analysis (jsonb)
conflict_summary, partner_pattern (text)
emotional_stability, conflict_frequency (int)
```

#### `codetalk_entries` — CodeTalk 키워드 (Dig 탭)

```
user_id, keyword, definition, imprinting_moment, root_cause
is_public (bool), partner_id (uuid)
ai_insights (jsonb)
```

#### `priper_sessions` — PRIPER 10단계 진행 상태

```
user_id
responses (jsonb)        -- 단계별 응답
axis_scores (jsonb)      -- 4축 점수 결과
primary_mask, secondary_mask (text)
insights (jsonb), is_completed (bool)
```

#### `prime_perspectives` — 통합 자아 프로필 (Get 출력)

```
user_id, perspective_text (text)
core_values (array), ikigai (jsonb)
persona_type, attachment_type (text)
axis_scores (jsonb), confidence_score, signal_count (int)
```

---

### 4-3. 콘텐츠 테이블

#### `content_items`

```
content_type, title, body
tags (array), target_masks (array), target_axes (jsonb)
difficulty_level (int), is_premium (bool), is_published (bool)
```

> ⚠️ Zone 기반 콘텐츠 노출: `content_items`에 `zone_tags` 컬럼 추가 필요. 주 zone/부 zone 다대다 태깅 구조.

#### `content_consumption`

```
user_id, content_id, consumed_at, completion_rate, reaction
```

---

### 4-4. 커뮤니티 테이블

- `community_groups` — 그룹 (`auto_assign_criteria jsonb` 포함)
- `community_memberships` — 유저-그룹 멤버십
- `community_posts`, `community_comments` — 게시글/댓글
- `dm_rooms`, `dm_messages` — 1:1 DM

---

### 4-5. 기타 핵심 테이블

- `subscriptions` — `user_id, tier, status, started_at, expires_at`
- `cq_responses` — `user_id, question_key, response_value`
- `virtual_user_profiles` — 가상 유저 100명 (4축+고민+CodeTalk)

---

### 4-6. 신규 생성 필요 테이블

> ✅ 아래 1개 테이블만 신규 생성이 필요하다. 나머지는 모두 기존 테이블 활용.

#### `person_profiles` — Me 탭 "내 사람들" 영구 저장

```sql
CREATE TABLE veilrum.person_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL,
  person_name         TEXT NOT NULL,
  relationship        TEXT,       -- 연인 / 가족 / 친구 / 직장
  zone_layer          TEXT,       -- daily / social / secret
  discovered_patterns JSONB,      -- 발견된 패턴 배열
  persona_conflict    TEXT,       -- 페르소나 충돌 설명
  tags                TEXT[],
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. AI 캐릭터 구조

| 항목 | Amber (엠버) | Frost (프로스트) |
|------|-------------|----------------|
| 역할 | F모드 비서 — 감성적, 공감, 따뜻한 호흡 | T모드 닥터 — 이성적, 냉철한 분석 |
| 컬러 | `#D4A574` | `#7BA8C4` |
| 등장 탭 | Vent(단독), Dig(단독), Get(+Frost), Set(+Frost), Me(+Frost) | **Get부터. Vent/Dig에는 절대 없음.** |
| UI 위치 | 헤더 우상단 단독 또는 좌측 | Amber 오른쪽에 나란히 |
| 히스토리 | 탭별 독립 유지 | 탭별 독립 유지 |
| 이름 설정 | `user_profiles.ai_companion_name` | 별도 컬럼 또는 jsonb 확장 |

### Amber 어텐션 애니메이션 — 모든 탭 공통 훅으로 분리

앱 첫 진입 후 5~9초 뒤 첫 번쩍임 → 이후 9~22초 랜덤 인터벌 반복.
글로우 + 스케일업 조합. "뭐지?" 하고 눌러보게 만드는 어텐션 유도 목적.

```typescript
// 공통 훅으로 분리 권장
function useAmberAttention(btnRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    function flash() {
      btnRef.current?.classList.add('flashing');
      setTimeout(() => btnRef.current?.classList.remove('flashing'), 1400);
      setTimeout(flash, 9000 + Math.random() * 13000);
    }
    const t = setTimeout(flash, 5000 + Math.random() * 4000);
    return () => clearTimeout(t);
  }, []);
}
```

### AI 시트 공통 구조

- Amber / Frost 각각 히스토리 분리 유지 (같은 세션 내에서도)
- 시트 UI는 동일, 색상만 전환 (amber: `#D4A574`, frost: `#7BA8C4`)
- 탭별 초기 메시지가 다름 — HTML 파일 참조
- `user_profiles.ai_companion_name` → 시트 이름 표시에 사용

---

## 6. Zone Control 구조

유저가 탐색할 레이어를 직접 켜고 끄는 구조.
**모든 서비스는 열린 zone 범위 안에서만 작동한다.**
온보딩 기본값: 전체 열림.

### 13개 서브레이어

| 레이어 | sub_zone ID | 이름 | sensitive |
|--------|-------------|------|-----------|
| 사회적인 나 (social) | s1 | 직장/학교에서의 나 | N |
| | s2 | 처음 만나는 사람 앞 | N |
| | s3 | SNS에서의 나 | N |
| | s4 | 공식적인 자리에서 | N |
| 일상적인 나 (daily) | d1 | 가족 안에서의 나 | N |
| | d2 | 친한 친구 앞에서 | N |
| | d3 | 연인/파트너 앞에서 | **Y** |
| | d4 | 혼자 있을 때의 나 | N |
| 비밀스러운 나 (secret) | t1 | 감정적 비밀 | **Y** |
| | t2 | 관계적 비밀 | **Y** |
| | t3 | 욕망/성적 영역 | **Y** |
| | t4 | 수치심 영역 | **Y** |
| | t5 | 야망/욕심 영역 | N |

### 정밀도% 계산

- 기본 공식: `열린 zone 개수 / 전체 zone 개수 × 100`
- 심화 공식: layer별 가중치 적용 (비밀스러운 나 가중치 높음)
- Frost가 닫힌 zone 감지 시 → Get/Me에서 고지
- **정밀도% 계산은 DB 함수(Supabase Function)로 처리 권장**

```sql
-- 기본 정밀도 계산 함수
CREATE OR REPLACE FUNCTION veilrum.calc_precision(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total      INT;
  open_count INT;
BEGIN
  SELECT COUNT(*) INTO total
    FROM veilrum.persona_zones WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO open_count
    FROM veilrum.persona_zones
    WHERE user_id = p_user_id AND is_enabled = true;
  IF total = 0 THEN RETURN 0; END IF;
  RETURN ROUND((open_count::FLOAT / total) * 100);
END;
$$ LANGUAGE plpgsql;
```

---

## 7. 온보딩 플로우

앱 최초 진입 시 아래 순서로 진행한다. 바텀 탭 없이 전체 화면으로 표시.

| 단계 | 화면 | DB 처리 |
|------|------|---------|
| 1 | **Zone Control 설정** — 13개 서브레이어 전체 표시. "어떤 대화를 나누고 싶으세요?" 기본값 전체 열림. 유저가 원하는 걸 끔. | `persona_zones`에 13개 row INSERT (`is_enabled = true`). 끈 것만 UPDATE false. |
| 2 | **간단한 상태 체크** — "지금 가장 마음에 걸리는 것" 선택. 첫 signals 입력값. | `user_profiles.held_last_emotion` 업데이트. `tab_conversations (tab=vent)` 첫 row 생성. |
| 3 | **Vent 탭으로 앱 진입** | `user_profiles.onboarding_step = 'completed'` |

---

## 8. signals 데이터 흐름

각 탭에서 생성되는 signals는 `tab_conversations.messages (jsonb)`에 누적된다.
구조화된 분석 결과는 `persona_instances`에 저장된다.

| 탭 | signals 타입 | 주요 필드 | 저장 테이블 |
|----|-------------|----------|------------|
| Vent | vent_signals | emotion, keywords, layer_hint, codetalk_entry | tab_conversations |
| Dig | dig_signals | pattern_summary, root_moment, mask_candidates, codetalk_signals | tab_conversations + codetalk_entries |
| Get | get_signals | confirmed_mask, persona_instances, relation_sentiment | tab_conversations + prime_perspectives |
| Set | set_signals | persona_brands, relation_decisions, declaration, next_direction | tab_conversations |
| Me | 전체 합산 | 정밀도%, 레이더차트 4축, 멀티페르소나 | persona_instances 업데이트 |

---

## 9. 각 탭 핵심 구현 포인트

### 9-1. Vent (`veilrum_vent_v5.html`)

- 감정칩 8개: 불안해 / 슬퍼 / 화가 나 / 혼란스러워 / 외로워 / 무감각해 / 지쳐 / 상처받았어
- 칩 선택 → AI 대화 뷰로 슬라이드 전환 (`translateX` 애니메이션)
- `"나의 레이어"` 탭 = Zone 13개 서브레이어 리스트. 탭하면 해당 레이어 맥락 질문 진입
- **Amber 단독 (Frost 없음)**
- 대화 N개 후 감정 요약 카드 노출 → Dig 진입 유도 CTA
- 저장: `tab_conversations (tab=vent)`, `user_profiles.held_last_emotion` 업데이트

---

### 9-2. Dig (`veilrum_dig_v12.html`)

- CodeTalk 3단계 카드: 정의 → 각인 순간 → 뿌리 원인
- **Amber 단독 (Frost 없음)**
- Vent에서 넘어온 `held_last_emotion` → 맥락 배지로 표시
- PRIPER 진입 버튼 → `priper_sessions` 테이블 연결
- 저장: `tab_conversations (tab=dig)`, `codetalk_entries`

---

### 9-3. Get (`veilrum_get_v5.html`)

- **Amber + Frost 이중 아바타**
- 결산 카드 4개 (tap to expand) — Dig에서 쌓인 패턴 요약 표시
- Frost: 패턴 분석 코멘트 ("이 패턴은 N개 zone에서 반복됐어요")
- Amber: 관계 마음 반영 ("이 관계에 대해 지금 어떤 마음이에요?")
- Zone 닫힌 것 있으면 Frost가 정밀도% 고지
- 저장: `prime_perspectives`, `tab_conversations (tab=get)`

---

### 9-4. Set (`veilrum_set_v4.html`)

- 패턴 리스트 → `persona_instances` 테이블에서 동적 로드
- 패턴 선택 → **받아들이기 / 바꿀게요 / 떠날게요** 3가지 선택
- 각 선택 → 3단계 가이드
  - 1단계: Amber 코멘트 (감정)
  - 2단계: Frost 분석
  - 3단계: Amber 마무리
- 실천 탭: 3단계 트래커 실시간 업데이트
- 커뮤니티 탭: 선택한 choice type에 따라 matched 그룹 동적 변경
- 저장: `tab_conversations (tab=set)`

---

### 9-5. Me (`veilrum_me_v4.html`)

3개 섹션 탭으로 구성됨.

#### 나의 성장 섹션

- 씨앗 정밀도% → `persona_zones` 기반 실시간 계산
- 씨앗 성장 단계 (씨앗→새싹→뿌리→꽃) → 정밀도% 구간에 따라 동적 업데이트
- 멀티페르소나 → `persona_instances` 로드. 탭하면 설명 + 페르소나 충돌 표시
- 레이더차트: `axis_scores` 이전/지금 비교. 4축 = `attachment / communication / expression / role`
- 월간 리포트: `tab_conversations` 기반 signals 통합 요약
- 처음 진단 결과: `priper_sessions.axis_scores` + `primary_mask`
- 친구 추천: 패턴 + zone 교집합 기준 커뮤니티 유저 매칭
- 1:1 DM 신청: `dm_rooms` 테이블에 room 생성

#### 내 사람들 섹션

- `person_profiles` 테이블 CRUD
- 카드 accordion (하나씩만 열림)
- 발견된 패턴 + 페르소나 충돌 표시

#### Zone 섹션

- `persona_zones` 테이블 실시간 CRUD
- 토글 ON/OFF → `is_enabled` UPDATE → 정밀도% 즉시 재계산
- Frost 고지 배너: 닫힌 zone 개수 + 현재 정밀도%
- 나의 성장 탭 씨앗 카드와 실시간 동기화

#### 설정 시트 (⚙ 톱니바퀴)

- 언어 설정 → `user_profiles.preferred_lang` (`ko / en / ja`) 업데이트
- Amber/Frost 이름 변경 → `user_profiles.ai_companion_name` 업데이트 → 앱 전체 반영
- 알림 설정 → `user_profiles` jsonb 컬럼 확장 또는 `notification_settings` 신규 테이블
- 구독 관리 → `subscriptions` 테이블
- 계정 설정 / 로그아웃 → Supabase Auth

---

## 10. 포팅 우선순위

> Me 탭이 Zone 상태를 관리하므로 가장 먼저 기반을 잡는다.

1. **Me 탭** — Zone Control + `user_profiles` 연결. 정밀도% 계산 함수. 다른 탭 전부에 영향.
2. **Vent** — 감정 입력 → `tab_conversations` 저장. `held_last_emotion` 업데이트.
3. **Dig** — CodeTalk + PRIPER. `codetalk_entries` 연결.
4. **Set** — `persona_instances` 로드. 3단계 가이드 흐름.
5. **Get** — `prime_perspectives` 출력. Amber/Frost 분리 코칭.
6. **탭 간 signals 연결** — context 흐름 (Vent → Dig → Get 맥락 연결).

---

## 11. 주의사항 — 반드시 지킬 것

- HTML 하드코딩 데이터 (패턴명, 페르소나, 사람 이름, 수치값) → **전부 Supabase 동적 로드로 교체**
- Zone 상태(`zoneState`) → `persona_zones` 테이블 실시간 CRUD. 로컬 state만으로 관리하지 말 것.
- Amber 어텐션 애니메이션 → **모든 탭에 공통 훅으로 분리.** HTML별로 따로 구현하지 말 것.
- Amber/Frost 이름 → `user_profiles.ai_companion_name` 로드. 기본값: 엠버/프로스트.
- 언어 설정 → `user_profiles.preferred_lang` 기반 전체 앱 i18n 적용 (`ko / en / ja`)
- 정밀도% → `persona_zones` 기반 실시간 계산. DB 함수 권장.
- `luna-*` 클래스명이 HTML에 잔존할 수 있음 → `amber-*` 로 통일 필요
- Set 탭 패턴 리스트 → `persona_instances`에서 동적 로드. HTML의 하드코딩 데이터 쓰지 말 것.
- Me 탭 레이더차트 4축 = `axis_scores` (`attachment / communication / expression / role`)
- Me 탭 친구 추천 → 현재 하드코딩. `community_groups` + `persona_instances` 교집합 알고리즘으로 교체.
- **Frost는 Get 탭부터만 등장. Vent/Dig에 Frost 아바타 절대 없음.**

---

## 12. 관련 DB 문서

Claude Code 세션 시작 시 아래 SQL로 추가 컨텍스트 로드 가능:

```sql
-- 앱 구조 확정
SELECT content FROM deepplot.documents WHERE doc_id = 'VR-STRUCTURE-CONFIRMED-20260319';

-- 서비스 맵 v3 (38개 서비스 배치)
SELECT content FROM deepplot.documents WHERE doc_id = 'VR-SERVICE-MAP-5TAB-v3';

-- AI 캐릭터 확정 (Amber/Frost)
SELECT content FROM deepplot.documents WHERE doc_id = 'VR-AI-CHARACTERS-v1';

-- Zone Control 구조 확정
SELECT content FROM deepplot.documents WHERE doc_id = 'VR-ZONE-CONTROL-v1';

-- 최신 세션 핸드오프
SELECT content FROM deepplot.documents WHERE doc_id = 'VR-SESSION-HANDOFF-20260320';

-- 이 문서 자체
SELECT content FROM deepplot.documents WHERE doc_id = 'VR-CLAUDE-CODE-HANDOFF-HTML-v1';
```

---

*VR-CLAUDE-CODE-HANDOFF-HTML-v1 | 2026-03-21 | VEILRUM*
