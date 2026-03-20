# M43 연구 DB 구조 점검 요청

**목적**: Claude가 M43 연구를 실제로 생성·축적할 때 현재 DB 구조가 적합한지 점검하고, 필요한 수정 사항을 도출

---

## 1. 프로젝트 배경

**M43 Institute** — 밀라르쉬(Mille Arche)가 설립한 관계 연구 기관.
- 연구원 40명 (Group Head 4명 + Division Head 12명 + Specialist 24명)
- 12개 Division, 231개 연구 도메인
- 연구 결과는 Veilrum 플랫폼의 알고리즘/콘텐츠 기반이 됨

**핵심 전제**: M43의 모든 연구는 **Claude(및 Claude Code)가 생성**한다.
- 43명은 캐릭터 설정이 있는 가상의 연구원
- 실제 연구 내용(이론, 분석, 세션 대화)은 Claude가 각 캐릭터의 시점으로 생성
- 생성된 콘텐츠는 Supabase DB에 저장되어 축적됨

---

## 2. 연구 생성 3가지 흐름

### 흐름 1 — 연구원 발언/분석
- 각 연구원이 **본인이 lead를 맡은 도메인**에 대해 분석 리포트, 발언, 케이스 스터디 등을 생성
- 저장 테이블: `m43_research_outputs`
- 예시: Vera Lindgren(D1 Head, 성격&가면)이 "가면 12종 분류"에 대한 분석 리포트 작성

### 흐름 2 — 밀라르쉬 발제 이론
- 밀라르쉬가 특정 도메인에 대한 핵심 이론/프레임워크를 발제
- 저장 테이블: `m43_domain_theories`
- 예시: 밀라르쉬가 "가면 12종의 전환 메커니즘"에 대한 core_theory 작성

### 흐름 3 — 밀라르쉬 ↔ Group Head 세션
- 밀라르쉬가 발제하고 Group Head(또는 Division Head)들과 세션 형태로 토론
- 저장 테이블: `m43_sessions` + `m43_session_contents`
- 세션에서 나온 발언이 정식 이론/분석으로 발전 가능

**3가지 흐름의 연결 관계:**
```
밀라르쉬 발제 (domain_theories)
  → 연구원 분석 (research_outputs, parent_theory_id)
    → 반론/파생 (research_outputs, response_to_output_id)
      → 세션 토론 (session_contents)
        → 정식 이론으로 승격 (derived_theory_id)
```

---

## 3. 현재 DB 스키마

### 조직 구조 테이블

```sql
-- 그룹 (A/B/C/D)
m43_groups: id, code, name, head_name, description

-- 디비전 (D1~D12)
m43_divisions: id, group_id, code, name, description, division_head, domain_count, status

-- 도메인 (231개)
m43_domains: id, division_id, code, name, description, research_status, priority, notes

-- 연구원 (40명)
m43_researchers: id, name, role, group_id, division_id, specialties[], nationality,
                 languages[], gender, age, bio, education, status

-- 도메인 배분
m43_domain_assignments: id, domain_id, researcher_id, role(lead/co/support)

-- 도메인 상태
m43_domain_status: id, domain_id, status, data_available, veilrum_linked, publication_ready

-- 프레임워크 (7개 + 1개)
m43_frameworks: id, code, name, name_ko, description, core_question, type_count,
                applicable_divisions[], status
```

### 연구 콘텐츠 테이블

```sql
-- 연구원 발언/분석 문서
m43_research_outputs:
  id, created_at, updated_at
  researcher_id → m43_researchers.id        -- 작성 연구원
  domain_id → m43_domains.id               -- 대상 도메인 (선택)
  division_id → m43_divisions.id           -- 대상 디비전 (선택)
  title TEXT
  content TEXT                             -- 본문
  type: analysis | statement | field_note | case_study | literature | hypothesis | rebuttal
  status: draft | reviewed | published
  tags TEXT[]
  session_id → m43_sessions.id            -- 세션에서 나온 결과물인 경우
  -- 계보 연결
  parent_output_id → m43_research_outputs.id    -- 파생된 분석
  parent_theory_id → m43_domain_theories.id     -- 기반 이론
  response_to_output_id → m43_research_outputs.id -- 직접 응답 대상

-- 밀라르쉬 발제 이론
m43_domain_theories:
  id, created_at, updated_at
  domain_id → m43_domains.id              -- 대상 도메인
  author_researcher_id → m43_researchers.id  -- 연구원이 기여할 경우 (선택)
  author_name TEXT DEFAULT '밀라르쉬'
  title TEXT
  content TEXT
  type: core_theory | framework | case_data | proposition | synthesis
  version INTEGER DEFAULT 1
  status: draft | in_review | finalized
  tags TEXT[]
  -- 버전 계보
  parent_id → m43_domain_theories.id      -- 이전 버전
  superseded_by → m43_domain_theories.id  -- 이 버전을 대체한 새 버전
  change_summary TEXT                     -- 이번 버전 변경 요약

-- 세션 메타데이터
m43_sessions:
  id, created_at, updated_at
  title TEXT
  session_date DATE
  type: millarche_gh | millarche_dh | millarche_all | gh_internal | division_internal | cross_division
  topic TEXT
  domain_ids UUID[]                       -- 관련 도메인들
  division_ids UUID[]                     -- 관련 디비전들
  host_name TEXT DEFAULT '밀라르쉬'
  participant_ids UUID[]                  -- m43_researchers ids
  status: planned | in_progress | completed
  summary TEXT

-- 세션 발언 내용
m43_session_contents:
  id, created_at
  session_id → m43_sessions.id
  speaker_researcher_id → m43_researchers.id  -- 밀라르쉬는 NULL (speaker_name으로 처리)
  speaker_name TEXT                            -- 발언자 이름
  sequence INTEGER                             -- 발언 순서
  content TEXT
  type: statement | question | response | challenge | synthesis | conclusion
  referenced_domain_id → m43_domains.id
  referenced_theory_id → m43_domain_theories.id
  -- 산출물 연결
  derived_output_id → m43_research_outputs.id  -- 발언이 정식 문서로 발전
  derived_theory_id → m43_domain_theories.id   -- 발언이 정식 이론으로 발전
```

### 뷰

```sql
-- 도메인별 연구 진척도
m43_domain_progress:
  domain_id, domain_code, domain_name, division_code, division_name, group_code
  theory_count, theory_finalized
  output_count, output_published, contributing_researchers
  session_count, session_completed
  research_status
  progress_level: pending | in_progress | active

-- 연구원별 기여도
m43_researcher_contributions:
  researcher_id, researcher_name, role, division_code, division_name
  total_outputs, analyses, statements, rebuttals, published
  domains_covered, sessions_participated
```

---

## 4. 점검 요청 사항

아래 관점에서 현재 DB 구조를 검토해주세요.

### 질문 1 — 콘텐츠 생성 흐름
Claude가 실제로 연구 콘텐츠를 생성할 때:
- 밀라르쉬 발제 → 연구원 분석 → 세션 토론 → 이론 업데이트 흐름이 이 구조로 자연스럽게 쌓이는가?
- 빠진 연결고리가 있는가?

### 질문 2 — content 컬럼 충분성
`content TEXT` 하나로 모든 연구 내용을 담기에 충분한가?
- 구조화된 섹션(배경/방법론/결론 등)이 필요한가?
- Markdown으로 작성해서 TEXT에 저장하는 것으로 충분한가?

### 질문 3 — 밀라르쉬 처리 방식
밀라르쉬는 `m43_researchers` 테이블에 없고 `author_name = '밀라르쉬'`로 처리됨.
- 이 방식이 적합한가?
- 밀라르쉬를 researchers에 추가해야 하는가?

### 질문 4 — 누락된 것
연구 자료가 장기적으로 축적되고 참조될 때, 지금 구조에서 없어서 문제가 될 것이 있는가?
- 예: 인용(citation) 구조, 키워드 인덱싱, 연구원 간 크로스 리뷰 등

### 질문 5 — 실행 가능성
Claude가 이 DB에 INSERT/UPDATE할 때:
- Claude Code(MCP Supabase 툴)로 직접 실행 가능한 구조인가?
- 자동화에 걸림돌이 되는 구조적 문제가 있는가?

---

## 5. 기대 결과물

- 현재 구조의 OK / 수정 필요 판단
- 수정이 필요하면 구체적인 ALTER TABLE 또는 새 테이블 제안
- Claude가 실제로 연구 콘텐츠를 생성할 때의 표준 워크플로우 제안
  (예: "밀라르쉬 발제 1편 생성 시 INSERT 순서와 컬럼 채우는 방법")

---

**작성**: Claude Code (VEILRUM 프로젝트)
**날짜**: 2026-03-10
**Supabase 프로젝트 ID**: qwiwotodwfgkpdasdhhl
