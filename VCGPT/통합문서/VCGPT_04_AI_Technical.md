# VCGPT_04 — Veilrum AI 엔진 · 데이터셋 설계 · API 스펙 · 라벨링 가이드
**통합 기준일:** 2026-03-16
**통합 출처:** Veilrum_Relationship_Engine_Architecture_20260316.md / veilrum_api_schema_spec.md / Veilrum_Dataset_Design_For_Relationship_LLM_20260316.md / Veilrum_Labeling_Guide_v2_Detailed.md / 05_Veilrum_AI_Training_Architecture.md / 03_ERS_Data_System.md

---

## 목차

1. [왜 별도의 Relationship Engine이 필요한가](#1-왜-별도의-relationship-engine이-필요한가)
2. [전체 아키텍처 개요](#2-전체-아키텍처-개요)
3. [엔진의 핵심 원칙](#3-엔진의-핵심-원칙)
4. [Engine Stack 6 + 2](#4-engine-stack-6--2)
5. [각 엔진 상세](#5-각-엔진-상세)
6. [Conversation Orchestrator — 4가지 모드](#6-conversation-orchestrator--4가지-모드)
7. [Report Generator](#7-report-generator)
8. [API 스펙 — 핵심 엔드포인트](#8-api-스펙--핵심-엔드포인트)
9. [핵심 데이터 모델](#9-핵심-데이터-모델)
10. [그래프 모델](#10-그래프-모델)
11. [엔진 처리 플로우](#11-엔진-처리-플로우)
12. [LLM 프롬프트 구조](#12-llm-프롬프트-구조)
13. [보안 · 안전 필터](#13-보안--안전-필터)
14. [데이터셋 설계 8개 계열](#14-데이터셋-설계-8개-계열)
15. [라벨링 가이드 — 어노테이션 체계](#15-라벨링-가이드--어노테이션-체계)
16. [AI 학습 단계 로드맵](#16-ai-학습-단계-로드맵)

---

## 1. 왜 별도의 Relationship Engine이 필요한가

Veilrum이 외부 LLM 하나에만 의존하면 생기는 한계:

- 말은 자연스럽지만 구조적 일관성이 약하다
- 같은 사용자에게도 매번 다른 관점이 나온다
- 성/금기 영역에서 깊이와 안전을 동시에 확보하기 어렵다
- 장기 메모리 없이 "좋은 한 번의 답"만 제공하게 된다
- Veilrum만의 데이터가 쌓여도 그걸 엔진으로 활용하지 못한다

따라서 Veilrum에는 반드시 **LLM 위에 올라가는 독자 해석 엔진**이 필요하다.

### 엔진의 역할
- 사용자의 현재 상태를 파악한다
- 관계 문제를 사건이 아니라 패턴으로 번역한다
- 내부 프레임워크(M43/PRIPER/CODETALK/DIVE/Mask/Sex/Change 등)와 연결한다
- 외부 LLM이 어떤 방향으로 응답해야 하는지 제어한다
- 장기적으로는 Veilrum 전용 모델로 이행할 수 있는 중간층이 된다

> **이 엔진은 Veilrum의 두뇌에 해당한다.**

---

## 2. 전체 아키텍처 개요

```
[Client Apps]
      ↓
[API Gateway]
      ↓
[Relationship Engine Orchestrator]
      ↓
[Input Layer]
사용자 입력 / 기록 / 진단 / 로그 / 커뮤니티 반응
      ↓
[Parsing Layer]
감정 / 주제 / 관계단계 / 위험신호 / 금기신호 파싱
      ↓
[Inference Layer]
패턴 추론 / 페르소나 활성화 / 욕망구조 / 경계구조 / 성적구조 추론
      ↓
[Risk & Alignment Layer]
관계 위험 / 불일치 / 합의 리스크 / 성적 불일치 / 변화준비도 계산
      ↓
[Orchestration Layer]
무슨 질문을 할지 / 어떤 톤으로 답할지 / 어떤 리포트를 만들지 결정
      ↓
[LLM Response Layer]
상담 응답 / 구조 해석 / 요약 / 질문 생성 / 리포트 생성
      ↓
[Memory & Learning Layer]
대화 결과를 다시 저장하고 장기 프로필 업데이트
      ↓
[Report Generator / Graph Store / Analytics]
```

핵심: **LLM이 "판단"을 전부 하지 않게 하고, Veilrum Engine이 판단 구조를 제공하는 것**

---

## 3. 엔진의 핵심 원칙

### 3.1 사건보다 패턴
- "연락이 줄었다" → 단순 사건
- "상대가 가까워질수록 물러서고, 사용자는 그때 더 추격한다" → 패턴

### 3.2 단일 라벨보다 다층 프로필
한 사람을 하나의 유형으로 고정하지 않는다.
예:
- 연애에서는 불안-추격형
- 일터에서는 통제형
- 성적 관계에서는 수치-욕망 충돌형

### 3.3 감정 수용과 구조 해석을 분리
사용자가 처음 들어왔을 때는 구조 해석보다 먼저 정서적 수용이 필요할 수 있다.
- **Held Mode**: 감정 수용 중심
- **Dig Mode**: 구조 해석 중심

### 3.4 금기 영역에서도 동일한 해석 원칙
성, 판타지, 비배타성, 권력, 수치심 영역도 "금기니까 생략"하지 않는다.
동일하게 패턴/욕망/합의/경계 구조로 해석한다.

### 3.5 안전과 자유를 동시에 관리
항상 작동해야 하는 기준:
- 합법성 / 안전 / 합의 / 철회 가능성 / 비강압성

---

## 4. Engine Stack 6 + 2

핵심 추론 엔진 6개:
1. **Input Understanding Engine**
2. **Pattern Inference Engine**
3. **Persona Activation Engine**
4. **Desire & Boundary Engine**
5. **Sexual Compatibility Engine**
6. **Relationship Risk Engine**

위에 올라가는 조율 레이어 2개:
7. **Conversation Orchestrator**
8. **Report Generator**

---

## 5. 각 엔진 상세

### 5.1 Input Understanding Engine

**역할:** 사용자 입력을 받아 "이 입력이 어떤 종류의 관계 문제인지"를 1차 해석

**입력 소스:**
- 자유 텍스트 / 감정 선택 / 선택형 질문 응답
- 과거 대화 로그 / PRIPER 결과 / CODETALK 키워드
- DIVE 세션 로그 / 커뮤니티 활동 / sex 관련 대화 기록

**출력 예시:**
```json
{
  "primary_emotion": "anxiety",
  "secondary_emotion": "shame",
  "topic_cluster": ["attachment", "sexual_mismatch", "boundary"],
  "relationship_stage": "deepening_or_instability",
  "urgency_level": "medium",
  "needs_holding_first": true
}
```

---

### 5.2 Pattern Inference Engine

**역할:** 사용자의 반복되는 관계 패턴 추론

**핵심 질문:**
- 이 사람은 누구에게 반복적으로 끌리는가?
- 가까워질수록 어떤 반응을 보이는가?
- 갈등 상황에서 어떤 루프가 반복되는가?
- 성적 관계에서 어떤 불일치가 반복되는가?

**다루는 패턴 축:**

| 패턴 축 | 설명 |
|---------|------|
| Attraction Pattern | 누구에게 반복 끌림 |
| Attachment Pattern | 친밀도 변화 반응 |
| Conflict Pattern | 갈등 루프 구조 |
| Power Pattern | 권력 역학 |
| Care Pattern | 돌봄 수수 방식 |
| Boundary Pattern | 경계 설정/침범 |
| Sexual Pattern | 성적 관계 불일치 |
| Commitment Pattern | 헌신 방식 차이 |
| Recovery Pattern | 이별 후 행동 패턴 |

**패턴 저장 방식** — 확률/신뢰도/맥락과 함께 저장:
```json
{
  "pattern": "pursue_withdraw",
  "confidence": 0.73,
  "observed_contexts": ["texting_conflict", "post-sex_distance"],
  "trend": "increasing"
}
```

---

### 5.3 Persona Activation Engine

**역할:** 사용자의 어떤 자아가 지금 전면에 나와 있는지 추정

**왜 필요한가:** 같은 사람도 상황에 따라 다른 자아가 켜진다.
- 버려질까 불안한 자아
- 통제해야 안심하는 자아
- 구원자로 존재 의미를 찾는 자아
- 성적으로만 자신감을 느끼는 자아
- 일상에서는 차갑지만 친밀 관계에서는 붕괴하는 자아

**핵심 자아군:**
- 보호자 자아 / 도망자 자아 / 통제자 자아
- 구원자 자아 / 매혹자 자아 / 인정갈구 자아
- 실험자 자아 / 관찰자 자아 / 붕괴하는 자아 / 비밀스러운 자아

**출력 예시:**
```json
{
  "active_persona": ["approval_seeker", "runner"],
  "trigger": ["delayed_reply", "fear_of_rejection"],
  "hidden_persona_candidate": ["controller"],
  "activation_strength": {
    "approval_seeker": 0.82,
    "runner": 0.57
  }
}
```

**장기 가치:** "사용자가 지금 어떤 기분인지"를 넘어서 **"지금 누가 말하고 있는지"를 이해**하게 됨

---

### 5.4 Desire & Boundary Engine

**역할:** 욕망 구조와 경계 구조를 해석

**욕망 축:**
- intimacy_need / security_need / stimulation_need
- validation_need / freedom_need / control_need
- care_need / exposure_need

**경계 축:**
- 거절 가능성 / 요청 가능성 / 불편함 표현 가능성
- 강한 분위기에서의 경계 붕괴 가능성
- 관계를 잃을까 봐 맞춰주는 경향
- 성적 상황에서의 경계 약화 여부

**엔진이 보는 핵심:**
- 말해진 욕망 vs 말해지지 않은 욕망
- 겉으로 말한 것과 실제 반복 행동의 차이
- 욕망 충돌 / 경계의 안정성 vs 불안정성

**예시:**
입력: "자유로운 관계를 원한다고 생각했는데 막상 상대가 다른 사람 만나는 건 너무 괴롭다"
출력:
```json
{
  "explicit_desire": "freedom",
  "hidden_desire": "exclusivity_validation",
  "contradiction_flag": "high",
  "recommended_topic": "structure_clarification"
}
```

---

### 5.5 Sexual Compatibility Engine

**역할:** 성적 관계 구조와 불일치 지점을 해석

**핵심 입력:**
- orientation / structure preference / role preference
- desire frequency / intimacy-sex linkage
- shame signals / consent-refusal comfort / exploration openness

**보는 문제:**
- 욕망 빈도 불일치 / role mismatch / intimacy linkage mismatch
- novelty vs safety mismatch / shame-desire conflict
- sexless risk / secrecy risk / coercion-blurred consent risk

**예시 출력:**
```json
{
  "sexual_structure_profile": {
    "desire_frequency": "high",
    "intimacy_link": "validation_driven",
    "role_preference": "switch_toward_sub",
    "communication_openness": "low"
  },
  "mismatch_risks": ["frequency_gap", "cannot_discuss_desire"],
  "suggested_conversation_topics": [
    "desire_without_shame",
    "refusal_safety",
    "expectation_alignment"
  ]
}
```

> **전략적 의의:** 현재 시장에 성적 관계 불일치를 구조적으로 다루는 엔진이 거의 없다. Veilrum의 가장 강력한 차별화 포인트.

---

### 5.6 Relationship Risk Engine

**역할:** 현재 또는 미래 관계에서 발생할 수 있는 위험 탐지

**위험 종류:**
- pursue-withdraw loop / emotional dependency escalation
- manipulation vulnerability / boundary collapse
- consent ambiguity / sexual incompatibility escalation
- hidden resentment accumulation / mask mismatch
- change unreadiness / external pressure overload

**위험 레벨:** low / moderate / elevated / high

**경고 표현 원칙:**
- 공포 조장이 아니라 **구조적 주의 신호**로 표현
- "이 구조는 시간이 갈수록 불안-회피 루프를 강화할 가능성이 있습니다." (O)
- "이 관계는 망합니다." (X)
- "상대는 위험인물입니다." (X)

---

## 6. Conversation Orchestrator — 4가지 모드

어떤 엔진 출력을 어떤 순서로 사용자에게 보여줄지 결정.

### Held Mode
- 감정 수용 우선 / 안전감 형성 / 구조 언급은 최소화
- 사용자가 처음 들어왔을 때, 위기 상황

### Dig Mode
- 패턴과 구조 해석 / 반복되는 장면 요약 / 다음 질문

### Get Mode
- 자기 구조 통합 / 자아/욕망/가면 정리

### Set Mode
- 경계/행동/합의 재설정 / 실험 과제 제시

**Orchestrator의 역할:** 같은 사용자에게도, 같은 문제라도 지금 어떤 모드로 대응해야 하는지가 다르다.

---

## 7. Report Generator

### Session Summary
- 오늘의 핵심 감정
- 반복 패턴 후보
- 다음 질문

### Weekly Insight
- 이번 주 반복 감정
- 핵심 트리거
- 자주 켜진 자아
- 위험 신호
- 권장 대화 주제

### Monthly Relationship Report
- 패턴 변화
- 경계 변화
- 욕망 구조 변화
- 관계 위험 추이
- 성적 프로필 변화 (성 영역 사용자)

### Persona Map
- 현재 활성화 빈도 높은 자아들
- 트리거 컨텍스트별 자아 분포
- 억압된 자아 후보

---

## 8. API 스펙 — 핵심 엔드포인트

### 1. Submit Narrative Input
`POST /api/v1/input/narrative`

```json
Request: {
  "user_id": "string",
  "text": "string",
  "emotion_tags": ["optional"],
  "context_type": "held|dig|sex|conflict|general",
  "timestamp": "ISO8601"
}
Response: {
  "session_id": "string",
  "parsed_summary": {},
  "next_stage": "holding|analysis"
}
```

### 2. Run Relationship Analysis
`POST /api/v1/engine/analyze`

```json
Request: { "session_id": "string", "user_id": "string" }
Response: {
  "patterns": {},
  "persona_activation": {},
  "desire_profile": {},
  "sexual_profile": {},
  "risk_flags": {},
  "recommended_questions": []
}
```

### 3. Generate Counseling Response
`POST /api/v1/engine/respond`

```json
Request: { "session_id": "string", "analysis_context": {} }
Response: {
  "response_text": "string",
  "mode": "held|dig|get|set",
  "confidence": 0.0
}
```

### 4. Generate Insight Report
`POST /api/v1/report/generate`

```json
Request: { "user_id": "string", "report_type": "session|weekly|monthly" }
Response: {
  "summary": {},
  "patterns": {},
  "persona_map": {},
  "desire_map": {},
  "sexual_profile": {},
  "risk_profile": {}
}
```

---

## 9. 핵심 데이터 모델

### UserCore
```
user_id / created_at / relationship_status / onboarding_stage
```

### NarrativeRecord
```
narrative_id / user_id / text / emotion_tags / topic_cluster / created_at
```

### PatternProfile
```
user_id / attraction_pattern / attachment_pattern / conflict_pattern
power_pattern / sexual_pattern / boundary_pattern / confidence
```

### PersonaMap
```
user_id / persona_name / activation_score / trigger_context
```

### DesireProfile
```
user_id / intimacy_need / validation_need / stimulation_need
freedom_need / control_need / security_need
```

### SexualProfile
```
user_id / orientation / structure_preference / role_preference
desire_frequency / intimacy_link / communication_openness
```

### RiskProfile
```
user_id / boundary_risk / manipulation_risk / consent_risk
sexual_mismatch_risk / dependency_risk
```

---

## 10. 그래프 모델

### Nodes
User / Persona / Pattern / Desire / RelationshipEvent

### Edges
ACTIVATES / TRIGGERS / DESIRES / REPEATS_PATTERN / CAUSES_CONFLICT

### 예시
```
User A
  → ACTIVATES → ApprovalSeeker
  → DESIRES → Validation
  → REPEATS_PATTERN → PursueWithdraw
  → CONFLICT_WITH → SexualFrequencyMismatch
```

---

## 11. 엔진 처리 플로우

```
1  User submits narrative
2  Input engine extracts emotion + topic
3  Pattern engine checks repeat structures
4  Persona engine estimates active self-state
5  Desire engine maps motivational layer
6  Sexual engine checks compatibility patterns
7  Risk engine evaluates instability signals
8  Orchestrator selects response mode
9  LLM produces conversational output
10 Report generator updates insight data
```

---

## 12. LLM 프롬프트 구조

### System Prompt Context
```json
{
  user_summary,
  persona_activation,
  pattern_candidates,
  desire_conflicts,
  sexual_profile,
  risk_flags
}
```

### LLM 태스크
1. acknowledge emotion (감정 수용)
2. interpret structural pattern (구조 해석)
3. ask one clarifying question (단일 질문)
4. avoid deterministic judgement (확정적 판단 지양)
5. maintain consent-aware framing (합의 프레임 유지)

---

## 13. 보안 · 안전 필터

### 응답 전 필수 필터
- Illegal content filter
- Self-harm / coercion detection
- Non-consensual sexual guidance block
- Manipulative advice block

필터 트리거 시 → fallback safe response

### 스케일링 플랜

| 단계 | 구현 |
|------|------|
| Stage 1 | LLM + rule engine |
| Stage 2 | Specialized classifiers |
| Stage 3 | Graph-assisted reasoning |
| Stage 4 | Veilrum relationship model stack |

---

## 14. 데이터셋 설계 8개 계열

Veilrum이 관계상담(성상담 포함) 전문 LLM을 구축하기 위해 필요한 8개 데이터셋:

### 최상위 원칙

1. **상담 로그는 로그가 아니라 자산이다** — 미래 모델 학습에 재사용 가능하도록 설계
2. **자유서술과 구조화 데이터를 같이 모아야 한다** — Narrative + Structured + Outcome 3축
3. **금기 영역일수록 더 구조화해야 한다** — 안전하고 일관된 태깅 체계 필요
4. **사용자 프라이버시와 연구 활용은 분리해야 한다** — 식별 정보, 학습용 샘플링 규칙 분리
5. **라벨은 낙인이 아니라 해석 구조여야 한다** — "이런 패턴이 관찰되었다" 방식

### Dataset 1 — Narrative Dataset
사용자가 자신의 관계를 어떻게 서사화하는지.
- 연애/이별 서사 / 반복 패턴 설명 / 질투·집착·거리두기
- 성적 불일치 / 성적 수치심 서사 / 거절·합의·압박 경험

기본 스키마:
```json
{
  "narrative_id": "nar_001",
  "user_id": "u_001",
  "domain": "romantic_relationship",
  "subdomain": "breakup_repetition",
  "raw_text": "...",
  "emotion_tags": ["sadness", "anxiety", "shame"],
  "relationship_stage": "dissolution",
  "contains_sexual_content": false,
  "contains_boundary_issue": false
}
```

### Dataset 2 — Diagnostic Dataset
진단/선택형 응답을 구조화해 정형 피처 생성.
포함 프레임: Mask Type / Habitus / Villain-Hero / Sex 3축 / Money-Sex / DIV / CHG / Attachment / Desire Frequency / Boundary Expression

스키마:
```json
{
  "diagnostic_record_id": "diag_001",
  "user_id": "u_001",
  "framework": "mask_type",
  "dimension_scores": { "EMP": 0.82, "APV": 0.67, "NRC": 0.14 },
  "confidence": 0.78
}
```

### Dataset 3 — Conversation Dataset
실제 상담형 대화 학습용.
- A. Holding Conversations (감정 수용, 위기 안정화)
- B. Insight Conversations (반복 패턴 탐지, 구조적 질문)
- C. Sexual Conversations (욕망 언어화, 수치심 완화, 경계와 동의 정리)
- D. Action Conversations (대화 준비, 경계 설정)

대화 한 턴 구조:
```json
{
  "session_id": "sess_001",
  "turn_id": 12,
  "user_text": "이 사람이랑 성적으로 안 맞는 것 같아요",
  "system_mode": "dig",
  "engine_context": { "topic_cluster": ["sexual_mismatch", "intimacy_conflict"] },
  "assistant_text": "안 맞는다는 느낌이 언제부터 생겼는지 먼저 볼 필요가 있어요...",
  "followup_question": "불일치가 욕망 빈도인지, 방식인지, 말하기 어려움 때문인지 느껴지나요?"
}
```

### Dataset 4 — Pattern Label Dataset
서사나 대화를 특정 관계 패턴과 연결.

패턴 라벨 구조:
```json
{
  "sample_id": "nar_001",
  "pattern_labels": {
    "attachment_pattern": ["anxious", "pursue_when_distanced"],
    "conflict_pattern": ["silent_resentment"],
    "boundary_pattern": ["late_boundary_setting"]
  },
  "confidence": { "attachment_pattern": 0.81, "conflict_pattern": 0.59 },
  "annotator_type": "expert_reviewed"
}
```

### Dataset 5 — Sexual Relationship Dataset
**Veilrum의 가장 차별적인 데이터셋.** 성적 관계와 친밀성 영역의 반복 구조 학습.

포함 주제:
- 성적 욕망 빈도 차이 / role mismatch / intimacy-sex linkage mismatch
- sexless relationship / shame vs desire conflict / fantasy disclosure difficulty
- consent-refusal ambiguity / performance anxiety / novelty vs safety tension
- exclusivity-openness conflict / post-sex emotional drop / aftercare mismatch

스키마:
```json
{
  "sexual_case_id": "sex_001",
  "topic": "desire_frequency_mismatch",
  "raw_text": "저는 더 자주 원하고 상대는 거의 원하지 않아요",
  "desire_frequency_self": "high",
  "desire_frequency_partner": "low",
  "contains_shame_signal": true,
  "risk_level": "moderate"
}
```

### Dataset 6 — Boundary / Consent Dataset
경계, 거절, 합의, 압박, 강요, 모호성 구조를 분리.

핵심 분류:
- explicit consent / assumed consent / pressured compliance
- refusal difficulty / unclear boundary communication
- post-event regret / emotional coercion signals / fear_of_loss_based_compliance

### Dataset 7 — Intervention Outcome Dataset
상담 개입의 결과를 추적.
- 어떤 접근이 인사이트로 이어졌는가
- 어떤 질문이 깊은 반응을 이끌었는가
- 어떤 패턴 해석이 거부감을 유발했는가

### Dataset 8 — Evaluation Benchmark Dataset
모델 품질 평가용 테스트셋.
- 감정 인식 정확도
- 패턴 추론 F1
- 안전 필터 정밀도/재현율
- 합의 프레임 유지율
- 사용자 신뢰 지표

---

## 15. 라벨링 가이드 — 어노테이션 체계

### 어노테이션 철학

**Veilrum 어노테이션은 도덕적 판단이 아니다.**
어노테이터는 관계 구조를 라벨링한다 — 행동의 좋고 나쁨이 아니라.

- 나쁜 어노테이션: "This is toxic"
- 올바른 어노테이션: `conflict_pattern = pursue_withdraw` + `power_pattern = dominance_control`

데이터셋은 **관계가 어떻게 작동하는지**를 포착해야 한다, 좋은지 나쁜지가 아니라.

### 어노테이션 단위

| 레벨 | 예시 |
|------|------|
| Level 1 — Narrative Unit | 사용자 스토리 단락 |
| Level 2 — Conversation Turn | 단일 대화 메시지 |
| Level 3 — Session Context | 전체 토론 스레드 |

`annotation_level = narrative | turn | session`

### 관계 패턴 분류 체계

**Attachment Patterns:**
- secure (차분한 소통, 안정적 신뢰)
- anxious (버림받음 공포, 재확인 욕구)
- avoidant (감정적 거리두기, 의존 불편함)
- fearful_avoidant (접근 후 철수)

**Conflict Patterns:**
- pursue_withdraw / silent_resentment / explosive_conflict
- stonewalling / escalation / avoidance_loop

**Power Patterns:**
- dominance_control / submissive_compliance
- equality_negotiation / coercive_control

**Boundary Patterns:**
- clear_boundary / porous_boundary / rigid_boundary
- late_boundary_setting / fear_based_compliance

**Sexual Patterns:**
- frequency_mismatch / role_mismatch / shame_conflict
- desire_suppression / fantasy_concealment / consent_ambiguity

**Desire Patterns:**
- validation_driven / security_driven / stimulation_driven
- freedom_driven / control_driven

### 어노테이션 품질 기준

| 기준 | 설명 |
|------|------|
| Relevance | 라벨이 텍스트에서 실제로 관찰되는가 |
| Specificity | 가능한 가장 구체적인 라벨을 선택했는가 |
| Non-judgement | 가치 판단 없이 구조만 기술했는가 |
| Confidence | 확신 수준이 정확히 반영되었는가 |

### 어노테이터 훈련 프로세스

**4단계 온보딩:**
1. 100개의 사전 어노테이션된 예시 읽기
2. 연습 데이터셋 라벨링
3. 골드 라벨과 비교
4. ≥85% 동의율 달성 후 실제 데이터셋 참여 자격 부여

**품질 관리:**
- **이중 어노테이션**: 모든 샘플에 Annotator A + Annotator B 독립 라벨링
- **불일치 시**: 조정자(adjudicator) 검토
- **목표 합의율**: Cohen's Kappa **≥ 0.75**

**Confidence 점수 체계:**
| 점수 | 의미 |
|------|------|
| 0.4 | 약한 증거 |
| 0.6 | 중간 증거 |
| 0.8 | 강한 증거 |
| 1.0 | 명시적 진술 |

---

## 16. AI 학습 단계 로드맵 (5단계 완전판)

### Phase 1 — API Assisted Counseling (현재)
**상태:** Claude API (Anthropic) 등 외부 LLM 사용

Veilrum 역할:
- 컨텍스트 공급 / 사용자 이력 공급
- 7개 프레임워크 기반 프롬프트 삽입
- 답변 후처리 / 리포트 구조화

**목표:** 사용자가 "정확하다"고 느끼는 상담 경험

---

### Phase 2 — Proprietary Knowledge Layer
**상태:** 외부 LLM은 계속 사용, 판단의 중심은 Veilrum 내부 해석 레이어

필요한 것:
- 관계 패턴 taxonomy 정교화
- sex 불일치 taxonomy
- 합의/경계 대화 템플릿
- 멀티페르소나 해석 규칙
- 위험 신호 rule engine

**목표:** 외부 LLM은 생성 엔진, Veilrum은 해석 엔진

---

### Phase 3 — Fine-tuned Submodels
**상태:** 작은/중간 모델에 Veilrum 전용 파인튜닝

가능한 태스크:
- 관계 패턴 분류 / 감정·갈등 요약
- sex 불일치 탐지 / 경계 리스크 탐지
- Persona activation 추정

**목표:** 부분 자립형 구조 확보, API 의존도 감소

---

### Phase 4 — Veilrum Relationship LLM
**상태:** Veilrum 전용 관계/성상담 모델

기능:
- 관계 상담 / 성 상담 / 갈등 중재
- 사용자별 장기 메모리 기반 상담
- 구조화 리포트 생성
- 금기 영역 대화 지원

**목표:** 범용 모델과 명확히 구분되는 품질 / M43 연구 데이터 플라이휠 완성

---

### Phase 5 — Relationship Intelligence Network
**상태:** 모델 + 데이터 + 커뮤니티 + 리포트가 연결된 생태계

가능해지는 것:
- 글로벌 Relationship Intelligence AI
- 관계 교육 프로그램
- 커플/가족/조직 관계 분석
- B2B/B2G/B2Professional 확장

---

## 17. 멀티모델 구조

Veilrum은 단일 거대 모델 하나가 아니라 **멀티모델 스택**으로 구성된다.

| 모델 | 역할 |
|------|------|
| 분류 모델 | 가면/패턴/욕망/위험 신호 분류 |
| 요약 모델 | 관계 로그 요약 / 주간·월간 리포트 생성 |
| 대화 모델 | 감정 수용 / 구조 해석 / 다음 질문 생성 |
| 검색/지식 모델 | 7개 프레임워크 / 내부 사례·콘텐츠 / 도메인별 답변 검색 |

---

## 18. 데이터 5계층

Veilrum의 모든 데이터는 5계층으로 처리된다.

```
Layer 1 — Raw Input
  가공 전 원본: 자유 텍스트 / 음성 전사 / 선택 응답 / 감정 태그 / 관계 상태

Layer 2 — Normalized Records
  정규화된 기록: 관계 도메인 태깅 / 감정 분류 / 사건 분류 / 시간축 정리

Layer 3 — Pattern Labels
  반복 패턴 라벨: 추격-회피 / 인정갈구 / 구원 패턴 / 성적 불일치 / 경계 붕괴

Layer 4 — Interpretation Objects
  AI가 읽기 쉬운 해석 객체:
  Pattern Profile / Persona Map / Desire Map / Sexual Compatibility Profile / Risk Flags

Layer 5 — Model Training Sets
  실제 모델 학습용: 분류용 / 요약용 / 상담용 / 리포트 생성용
```

---

## 19. 그래프 4종 (장기 목표)

```
Relationship Graph
  누가 어떤 관계를 어떤 패턴으로 반복하는가

Desire Graph
  어떤 욕망이 어떤 갈등/불일치와 연결되는가

Sexual Compatibility Graph
  어떤 sex 구조 조합이 어떤 결과를 내는가

Intervention Graph
  어떤 상담 개입이 어떤 유형에게 효과적인가
```

예시:
```
User A
  → activates → 승인갈구 자아
  → desires → Validation
  → attracted_to → Emotionally Distant Partner
  → triggers → Anxiety Pattern
  → mismatch_in → Sexual Frequency
  → avoids → Boundary Conversation
```

이 구조까지 완성되면 Veilrum은 단순 챗봇이 아니라
**관계 예측과 개입 설계가 가능한 시스템**이 된다.

---

## 21. 현재 확인된 핵심 데이터 자산 현황

*(2026-03-16 기준)*

### Veilrum 스키마
| 테이블 | 현황 |
|--------|------|
| `codetalk_keywords` | 100개 완비 |
| `community_groups` | 24개 완비 |
| `researcher_profiles` | 40명 완비 |
| `master_checklist` | 49개 |
| `session_briefs` | 3건 |
| `codetalk_entries`, `dive_sessions`, `community_posts` | 구조 존재 |

### Public/M43 테이블
| 테이블 | 현황 |
|--------|------|
| `m43_domain_questions` | **1,322개** |
| `m43_domain_answers` | **1,322개** |
| `m43_domain_theories` | **238개** |
| `m43_domains` | 231개 |
| `m43_researchers` | 40명 |
| `m43_user_question_logs` | 자동 기록 |

→ Veilrum은 이미 상당한 관계 데이터 원료를 보유한 상태 (콘텐츠 없는 앱이 아님)

---

## 22. 리포트 구조 상세

Veilrum 리포트는 3종류로 구분된다.

### 22.1 주간 리포트
- 이번 주 반복 감정
- 주요 트리거
- 자주 등장한 키워드
- AI 관찰 한 문장

### 22.2 월간 리포트
- 관계 패턴 변화
- 자주 켜진 자아 (멀티페르소나)
- 욕망 충돌 구조
- 관계 선택 리스크
- 다음 달 실험 제안

### 22.3 분기 리포트
- 3개월 비교
- 장기 변화 추세
- 이전 관계 대비 현재 패턴 변화
- 관계력 성장/후퇴 지표

---

## 23. 구현 우선순위 (3단계)

### Phase 1 — 지금 당장
1. 기록 저장 일관화
2. PRIPER / CODETALK / DIVE 컨텍스트 연결
3. 주간 리포트 기본판
4. 패턴 요약 문장 생성
5. `question_logs`와 리포트 연동

### Phase 2 — 다음 단계
1. Persona Map 정교화
2. Desire Map 도입
3. Community 반응 데이터 연결
4. Relationship Graph 프로토타입

### Phase 3 — 나중 단계
1. 정렬 기반 연결
2. 관계 체크인 데이터 양방향 분석
3. 관계 만족/붕괴 예측
4. 외부 API 또는 B2B/B2G 활용

---

## 20. 성/금기 데이터 수집 시 주의사항

| 원칙 | 내용 |
|------|------|
| 무조건 익명성 보호 | 성적 관계 서사는 개인식별 가능성이 남지 않도록 분리/가명화 필수 |
| 단순 수집보다 구조화 | 자유서술만 쌓으면 나중에 쓰기 어려움 — 욕망 유형 / 불일치 유형 / 경계 문제 / 합의 여부 / 수치심 신호 / 권력 신호 보조 태깅 필수 |
| 안전 필터와 학습 분리 | 실시간 대화 안전 필터와 내부 연구/학습용 정제 데이터는 분리 관리 |

---

---

## 24. ERS (Emotional Relationship Signals) — 완전 신호 체계

> **ERS는 사용자의 서사, 대화, 기록, 커뮤니티 반응, 관계 사건을 관계 해석에 유효한 "신호(signal)"로 변환하여 저장하는 구조화된 관계 데이터 시스템이다.**

ERS 없이는 Veilrum의 AI가 패턴을 학습할 수 없다. ERS는 Veilrum의 **데이터 두뇌**다.

### 24.1 ERS 10개 최상위 계층

1. **Emotion Signals** — 감정 상태 감지 (sadness/anxiety/anger/shame/confusion/longing/resentment/guilt/numbness/relief/hope + 강도/반복/masked 특성)
2. **Narrative Signals** — 서사 구조 (self_blame / victim / rescuer / hero / villain_projection / idealization / collapse / taboo_disclosure / secrecy)
3. **Pattern Signals** — 관계 반복 구조 (attraction/attachment/conflict/care/boundary/commitment 6축)
4. **Persona Signals** — 활성화된 자아 (approval_seeker / controller / runner / rescuer / observer / seducer / protector / collapsed_self / experimental_self / secret_self)
5. **Desire Signals** — 욕망 구조 (validation/intimacy/security/stimulation/freedom/control/caretaking/exposure/exclusivity/admiration/surrender/novelty + explicit/hidden/conflicting/shame/unmet)
6. **Boundary & Consent Signals** — 경계·동의 (clear/late/suppressed/inconsistent/violation + explicit_consent/implied/pressured_compliance/unclear/post_regret/refusal_difficulty/freeze/fear_based_yes)
7. **Sexual Relationship Signals** — 성적 관계 구조 (preference/dynamics/communication 3축, 14개 dynamics 신호)
8. **Power & Resource Signals** — 권력·자원 (balanced/emotional_dependency/dominance_control/withdrawal_as_power/care_as_power/sexual_leverage + economic/housing/social/emotional_labor imbalance)
9. **Relationship State Signals** — 현재 단계 (attraction/idealization/deepening/instability/negotiation/stagnation/dissolution/post_breakup/repair + ambiguity/trust_instability/reconciliation/no_label 등)
10. **Risk & Intervention Signals** — 위험·개입 (manipulation/dependency/coercion/boundary_collapse/sexual_mismatch/hidden_resentment/conflict_escalation/withdrawal_loop + 7개 개입 효과 신호)

### 24.2 Pattern Signals 상세 (6축)

**Attachment:**
- secure / anxious / avoidant / fearful_avoidant
- proximity_seeking / engulfment_fear / abandonment_anxiety

**Conflict:**
- pursue_withdraw_loop / silent_resentment_loop / explosive_conflict_loop / conflict_avoidance_loop / passive_aggression_loop / over_explaining / freeze_during_conflict

**Attraction:**
- attracted_to_distance / instability / rescue_targets / power / safety / validation_sources
- safety_boredom_signal / idealization_fast_attach

**Care:** over_caretaking / rescue_compulsion / care_withdrawal / care_dependency / care_as_control

**Boundary:** late_boundary_setting / suppressed_boundary / rigid_boundary / fluctuating_boundary / boundary_collapse_under_pressure

**Commitment:** fast_commitment / ambiguity_tolerance / commitment_fear / structure_avoidance / exclusivity_need / openness_experiment

### 24.3 Sexual Relationship Signals 상세

**Preference Signals:**
- orientation: hetero / bi / pan / demisexual
- structure: monogamy / serial_monogamy / ENM / polyamory
- role: dom / sub / switch / vanilla

**Dynamics Signals (14개):**
desire_frequency_gap / role_preference_mismatch / intimacy_sex_disconnect / sexual_shame_signal / performance_anxiety / fantasy_disclosure_difficulty / novelty_safety_conflict / sexless_relationship / post_sex_distance / post_sex_drop / validation_through_sex / sex_as_obligation / sex_as_reassurance / sex_as_control

**Communication Signals:**
can/cannot_discuss_desire / can/cannot_refuse_safely / aftercare_need / aftercare_mismatch / consent_language_absent

### 24.4 Signal Weighting Logic

모든 신호는 3가지 weight의 조합으로 scored된다:

```text
signal_score =
  (0.4 × confidence_weight)    ← 텍스트 근거 강도
+ (0.3 × recurrence_weight)    ← 반복 횟수
+ (0.3 × impact_weight)        ← 관계 안정성에 미치는 영향
```

### 24.5 Temporal Signal States

emerging → recurring → escalating / stabilizing / decreasing → resolved

이 상태 추적이 있어야 Veilrum은 **변화 추적과 관계 예측**이 가능해진다.

### 24.6 Sensitivity Levels

| 등급 | 대상 |
|------|------|
| low | 일반 감정, 일반 갈등 |
| medium | 애착 불안, 의존, 숨은 욕망, 수치심 |
| high | 성적 role 선호, 판타지, consent ambiguity, coercion risk, 경계 붕괴, 금기 관계 구조 |

→ 등급에 따라 접근권한 / 리포트 노출 수준 / 학습셋 정제 규칙 차등 적용

### 24.7 Signal Storage Format

```json
{
  "signal_id": "sig_001",
  "user_id": "u_001",
  "annotation_level": "turn",
  "signal_family": "boundary_consent",
  "signal_type": "pressured_compliance",
  "value": true,
  "confidence": 0.86,
  "impact_weight": 0.91,
  "recurrence_count": 2,
  "temporal_status": "recurring",
  "evidence_span": "거절하면 관계가 끝날까봐 그냥 맞췄어요",
  "source_ref": "sess_10_turn_3",
  "sensitivity_level": "high",
  "created_at": "2026-03-16T12:00:00Z"
}
```

### 24.8 ERS Graph Connection Model

**Nodes:** User / Persona / Pattern / Desire / Signal / Relationship Event / Intervention / Topic

**Edges:** ACTIVATES / TRIGGERS / DESIRES / REPEATS / CONFLICTS_WITH / INCREASES / DECREASES / RESPONDS_TO / IMPROVED_BY

```text
User
→ ACTIVATES → approval_seeker_persona
→ DESIRES → validation_need
→ REPEATS → pursue_withdraw_loop
→ CONFLICTS_WITH → partner_avoidant_signal
→ INCREASES → dependency_risk
→ IMPROVED_BY → boundary_clarity_prompt
```

### 24.9 ERS 구축 우선순위

| Phase | 대상 신호 |
|-------|---------|
| Phase 1 — Core | emotion / attachment / conflict / desire / boundary / risk |
| Phase 2 — Advanced | persona / narrative / commitment / repair / intervention_effectiveness |
| Phase 3 — Sexual & Taboo | sexual_mismatch / role_preference / shame_desire_conflict / consent_ambiguity / post-sex emotional / exclusivity_openness |
| Phase 4 — Graph-native | evolving signals / causal edges / intervention edges |

---

## 25. ERS Signal Extraction Rulebook

### 25.1 추출 파이프라인

```text
Narrative Capture
→ Signal Extraction (이 문서의 규칙)
→ ERS Encoding
→ Dataset Formation
→ Model Training
```

### 25.2 핵심 추출 원칙 5가지

1. **사건보다 구조를 뽑는다** — "답장이 늦었다"가 아니라 "답장 지연 → abandonment anxiety → reassurance_seeking 활성화"
2. **도덕 판단 대신 관계 구조** — "toxic" 금지, pursue_withdraw_loop / pressured_compliance처럼 구조화
3. **신호 묶음을 뽑는다** — 한 문장에서 여러 신호 동시 추출 가능
4. **confidence + evidence_span 함께 저장** — 모든 신호에 근거 span 필수
5. **sex/금기 영역은 더 엄격하게** — 더 높은 evidence threshold + high sensitivity 태깅

### 25.3 입력 소스별 추출 전략

| 소스 | 특징 | 우선 추출 신호 |
|------|------|-------------|
| PRIPER | 길고 자기서사적, 시간축 있음 | narrative / persona / desire / relationship_state / long-term pattern |
| CODETALK | 짧고 키워드 중심, 루틴 데이터 | emotion / micro desire / communication style / recurring keyword-linked pattern |
| DIVE | 깊고 시나리오 풍부 | pattern / sexual / boundary-consent / power-resource / intervention candidates |
| COMMUNITY | 익명, 집단 반응 | collective narrative / normalized taboo / shared resentment / topic cluster / community-level patterns |

### 25.4 탭(UX 상태)별 추출 전략

| 탭 | 유저 상태 | 추출 우선 |
|----|---------|---------|
| Held | 감정이 올라와 있음, 수용 먼저 | primary emotion / urgency / immediate risk / broad topic cluster |
| Dig | 패턴 찾고 싶음 | recurring pattern candidates / trigger-event mapping / contradiction signals |
| Get | 뿌리가 궁금함 | persona / narrative identity / hidden desire structures / origin-linked patterns |
| Set | 바꾸고 싶음 | intervention readiness / boundary repair / alignment-mismatch / change_readiness |
| Me | 축적된 나를 보고 싶음 | trend signals / temporal shifts / improvement-escalation markers / intervention effectiveness |

### 25.5 추출 레벨

- **Turn-level** — 한 발화, 빠르고 실시간 가능, 문맥 부족 위험
- **Session-level** — 한 세션 전체, contradiction detection 가능
- **Longitudinal** — 전체 시간축, recurrence/escalation/persona-switching/intervention 효과 추적

### 25.6 신호 계층별 핵심 추출 규칙

**Emotion:** 감정 단어 있으면 explicit / 행동으로 추정 가능하면 inferred / 강도 표현 있으면 intensity↑ / 반복 등장 시 recurring 부착

**Pattern:** 1문장 = candidate, 세션 내 2회↑ = probable, longitudinal 반복 = stable pattern

**Persona:** "그 사람 앞에서만 다르다" = persona_switch_detected 후보 / 돌봄 정체성 = rescuer / 관계 상실 공포로 자기표현 지움 = approval_seeker

**Desire:** 원한다/필요하다 = explicit / 행동 반복 암시 = hidden / 말과 행동 충돌 = conflicting_desires

**Boundary/Consent:** "싫다고 못 했다" = suppressed / "원치 않았는데 했다" = pressured_compliance 강신호 / "거절하면 화낼까봐" = fear_based_yes + coercion risk 후보

**Sexual:** desire frequency 직접 언급 → desire_frequency_gap / "민망해서 말 못 하겠다" → fantasy_disclosure_difficulty / "끝나고 나면 멀어진다" → post_sex_distance / "사랑받는 느낌을 sex로 확인" → validation_through_sex

**Power/Resource:** 돈/집/생활비가 선택 제한 = economic_imbalance / care로 영향력 행사 = care_as_power / 침묵으로 흐름 장악 = withdrawal_as_power

### 25.7 Confidence 점수 기준

| 범위 | 의미 |
|------|------|
| 0.90–1.00 | Explicit statement |
| 0.70–0.89 | Strong implied |
| 0.50–0.69 | Moderate implied |
| 0.30–0.49 | Weak candidate |

### 25.8 Multi-Signal Conflict 처리

충돌하는 신호는 하나를 지우지 않고 **내적 충돌 자체를 신호화**한다:

```json
{
  "conflicting_signals": ["freedom_need", "exclusivity_need"],
  "conflict_type": "desire_conflict"
}
```

### 25.9 반드시 피해야 하는 오류

1. **과잉 도덕화** — "toxic", "wrong", "bad person" 라벨 금지
2. **과잉 확정** — 1회 표현으로 "조종자", "회피형" 고정 금지
3. **sex 영역 축소 해석** — 모든 성적 고민을 libido 차이로만 환원 금지 (수치심/경계/합의/권력/aftercare/validation 구조를 함께 봐야 함)
4. **문맥 무시** — 같은 "그냥 했다"도 일반 갈등 / 성적 압박 / 습관적 맞춤이 다를 수 있음

### 25.10 Rulebook 운영 로드맵

| 단계 | 방식 |
|------|------|
| 초기 | 룰 기반 추출 + 라벨러 검수 + 일부 LLM 보조 |
| 중기 | classifier-assisted + disagreement queue + high-risk signals human review |
| 장기 | graph-aware extraction / temporal reasoning / intervention-aware / Veilrum 전용 모델로 신호 추출 |

---

---

## 26. AI 상담 엔진 스펙 (Counseling Engine Spec)

> Veilrum AI는 일반 챗봇이 아니라 **관계 상담 오케스트레이터**다.
> 감정 수용 → 관계 패턴 탐색 → 자기 구조 통찰 → 행동/대화 적용 지원을 동시에 수행한다.

### 26.1 전체 흐름 (13단계 파이프라인)

```text
User Input
→ UX State Detection (Held / Dig / Get / Set / Me)
→ Narrative Parsing
→ ERS Signal Extraction
→ Pattern / Persona / Desire / Boundary / Sexual Reasoning
→ Response Strategy Selection
→ M43 Framework Injection
→ Question Generation
→ Counseling Response (4칸 구조)
→ Memory Update
→ Report Update
```

### 26.2 UX State Routing — 탭별 AI 우선순위

| 탭 | 유저 상태 | AI 우선순위 | 금지 |
|----|---------|-----------|------|
| Held | 감정이 올라와 있음 | 감정 수용 → 위험 감지 → 다음 말 유도 | 성급한 패턴 확정, 분석 과잉 |
| Dig | 패턴 찾고 싶음 | 반복 패턴 후보 → 트리거 식별 → 직접적 질문 | — |
| Get | 뿌리가 궁금함 | 가면/페르소나 추정 → Why → origin → hidden desire | — |
| Set | 바꾸고 싶음 | 선택지 구조화 → 경계/합의/대화 적용 → partner dialogue guide | — |
| Me | 누적된 나를 보고 싶음 | trend summary → 반복 패턴 재정리 → 성장/후퇴 비교 | — |

**Held 예시 출력:**
- "지금 많이 불안한 상태로 들려요."
- "어떤 순간이 제일 크게 마음에 걸렸는지 한 장면만 더 말해줄래요?"

**Me 예시 출력:**
- "처음엔 답장 지연만으로도 바로 불안이 커졌는데, 최근에는 그 감정을 바로 행동으로 옮기지 않고 한 번 멈추는 패턴이 보입니다."

### 26.3 상담 엔진 내부 Reasoning Layers (6계층)

1. **Emotion Layer** — primary/secondary emotion + intensity + urgency + recurring 여부
2. **ERS Signal Layer** — attraction/trust/jealousy/emotional_dependency/sexual_dynamics/conflict_patterns → signal_family + confidence + sensitivity_level + temporal_status
3. **Pattern Layer** — attachment / conflict_loop / care / boundary / sexual_mismatch pattern
4. **Persona Layer** — approval_seeker / rescuer / controller / runner / observer / hidden_self / sexual_self
5. **Desire Layer** — intimacy / validation / security / stimulation / freedom / control / exclusivity need
6. **Risk Layer** — dependency / coercion / manipulation / boundary_collapse / sexual_mismatch / hidden_resentment risk

### 26.4 M43 Framework Injection

상담 AI는 raw signal만으로 답하지 않고 M43 연구 프레임워크를 해석 렌즈로 사용한다:

- **Mask Identity Framework** — 자기축소형 가면, 승인갈구 등
- **Habitus Analysis** — 반복 관계 패턴의 근원
- **Sexual Typology** — 성적 유형 및 불일치
- **Power and Resource Dynamics** — 권력/자원 구조
- **Relationship Breakdown Models** — 붕괴 선행 패턴
- **Narrative Identity Patterns** — 자기서사 구조

```
입력: "관계는 괜찮은데 성적으로는 너무 안 맞아요."
→ SEX framework + sexual_mismatch + intimacy-sex_disconnect + relationship_breakdown_precursor
```

### 26.5 Question Generation Spec

**질문 타입:**
holding_question / clarification_question / pattern_question / origin_question / desire_question / boundary_question / application_question / reflection_question

**우선순위 규칙:**
1. 위험이 있으면 위험 먼저
2. Held → 감정, Dig → 패턴, Get → 원인과 자아, Set → 행동/대화 설계, Me → 요약과 변화

**좋은 질문 기준:** 한 번에 하나만 / 다음 말문을 열게 함 / 진단보다 탐색 / judgment-free / 구체적 / 문맥에 맞음

**나쁜 질문:** "왜 그러세요?" 반복 / 너무 포괄적 / 답이 정해진 유도 질문 / Held에서 구조 강요

### 26.6 Sexual Dialogue Subsystem

**진입 트리거:** sexual_mismatch / shame / fantasy_disclosure_difficulty / consent_ambiguity / role_conflict / desire_frequency_gap / sexless_relationship / post-sex_emotional_drop

**핵심 원칙:** 판단보다 해석 / 안전·합의·합법성 우선 / 수치심 악화 금지 / role/fantasy/mismatch 단일 도덕화 금지

**핵심 질문 예:**
- "이건 하고 싶은데 못 말하는 건가요, 아니면 하고 싶지 않은데 맞추고 있는 건가요?"
- "거절이 안전하다고 느껴지는 관계인가요?"
- "욕망 빈도의 차이인지, 방식의 차이인지, 말하기 어려움의 문제인지 어느 쪽에 가깝나요?"

**즉시 우선 위험:** coerced_compliance / fear_based_yes / cannot_refuse_safely / consent_ambiguity_high / severe_shame_with_partner_pressure

### 26.7 Response Strategy (4칸 구조)

| 칸 | 내용 | Held | Dig | Set |
|----|------|------|-----|-----|
| Acknowledge | 감정/상태 수용 | 큼 | 중간 | 짧게 |
| Interpret | 구조/패턴 짧게 해석 | 작게 | 큼 | 중간 |
| Question | 다음 질문 하나 | 하나 | 하나 | 실행형 |
| Guide | 실천/정리 제안 | 거의 없음 | 적음 | 큼 |

### 26.8 Safety & Escalation Rules

**즉시 우선 처리:**
coercion / non-consensual implication / self-harm mention / severe_dependency_isolation / high-pressure_sexual_situation

**금지 행동:**
- direct harm encouragement
- manipulative advice
- sexual coercion normalization
- "너 잘못" 프레임
- 필요 시 전문가 연결은 Held 루트로 자연스럽게 안내

### 26.9 M43 데이터 현황 및 확장 필요 영역

| 항목 | 현황 |
|------|------|
| 연구 도메인 | 231개 |
| 핵심 이론 | 239개 |
| 연구 산출물 | 1,707개 |
| 세션 발언 | 1,848개 |
| Q&A | 1,322개 |

**D5 성·친밀감 확장 필요:** partner Q&A 3개로 상대적으로 얕음 → partner-centered sexual mismatch dialogues / refusal-consent dialogues / shame disclosure / sexless relationship repair / exclusivity-openness negotiation 데이터 추가 수집 필요

---

## 27. Cognitive Architecture — 사용자 마음 모델링 시스템

### 27.1 전체 구조 (5단계 레이어)

```text
User Experience Layer (Held → Dig → Get → Set → Me)
↓
Interaction Layer (Narratives / Conversations / Reflections / Community posts)
↓
Signal Extraction (Emotion / Persona / Desire / Boundary / Sexual Signals)
↓
ERS Storage (Relational signals database)
↓
Cognitive Model (Self Model + Persona Graph + Desire Model + Relationship Graph)
↓
AI Reasoning (Relationship insight / Risk detection / Intervention suggestion)
```

### 27.2 Self Model

사용자에 대한 장기적 심리 프로파일:

- identity_signals
- core_values
- emotional_baseline
- relationship_history
- pattern_clusters

예시:
```
- attachment_tendency: anxious_leaning
- validation_need: high
- novelty_desire: medium
- sexual_openness: moderate
- boundary_strength: inconsistent
```

### 27.3 Persona Graph

사용자는 하나의 자아가 아니라 여러 페르소나를 가진다:
approval_seeker / rescuer / controller / observer / sexual_self / hidden_self

기록 항목: persona_activation / persona_switching / persona_dominance

### 27.4 Desire Model

| 핵심 축 | 충돌 구조 예시 |
|--------|-------------|
| Intimacy / Validation / Security / Novelty / Freedom / Control | freedom_need vs exclusivity_need |

### 27.5 Emotional State Engine

상태 변수: anxiety / sadness / hope / resentment / shame

시간 차원: emerging → stable → escalating → decreasing

### 27.6 Memory System

- **Short-term session memory** — 현재 세션 내 문맥
- **Long-term relational memory** — ERS 기반 저장, 누적 패턴 및 변화 추적

### 27.7 Reasoning Engine 핵심 질문

1. Why is this happening?
2. What pattern is repeating?
3. What desire is unmet?
4. What boundary is missing?

이 구조가 완성되면 Veilrum은 **Relationship Specialist LLM**의 기반이 된다.

---

---

## 28. Service API Spec — Claude API 오케스트레이션 기준

> **Veilrum은 클라이언트가 Claude API에 직접 접근하는 것을 허용하지 않는다.** 모든 외부 LLM 호출은 반드시 AI Orchestrator를 통해야 한다.

### 28.1 External LLM Policy (Claude API)

**Claude API 역할 (사용해야 하는 것):**
- counseling response generation
- clarification question generation
- report drafting
- structured summarization
- grounded reflective writing

**Claude가 단독으로 결정해선 안 되는 것:**
- 최종 risk tier
- coercion 여부 (signal evidence 없이)
- escalation 필요 여부 (orchestrator 확인 없이)
- 의료/정신과 진단
- unsupported relationship certainty
- unsupported sexual interpretation

**Claude input contract:**
- ✅ 받아야 하는 것: journey_state / session_context / active_signal_bundle / pattern_hypotheses / M43_retrieval_context / safety_instructions / response_mode_constraints
- ❌ 받으면 안 되는 것: 불필요한 raw long-term 이력 / 필요 범위를 넘는 민감 데이터 / 비근거적 추측 지시

### 28.2 내부 서비스 맵 (14개)

**Client-facing:** Journey API / Session API / Report API / Community API / Safety-Support API

**Internal:** User Service / Journey State Service / Session Service / Narrative Service / ERS Signal Service / Pattern Service / Persona-Desire Service / Sexual Dynamics Service / Risk-Crisis Service / M43 Retrieval Service / AI Orchestrator Service / Report Service / Dataset Builder Service / Moderation-Review Service / Audit Service

### 28.3 Journey API 요청/응답 예시

**POST /journey/held/message:**
```json
Request: { "user_id": "usr_001", "session_id": "ses_001", "message": "요즘 관계 때문에 너무 불안해요.", "input_mode": "text" }
Response: { "journey_state": "held", "response_mode": "holding", "assistant_message": "지금 많이 불안한 상태로 들려요. 어떤 장면이 가장 크게 마음에 걸리는지 한 가지만 더 말해줄래요?", "risk": { "tier": 1, "escalation_required": false }, "signals_summary": { "emotion": ["anxiety"], "topic_clusters": ["relationship_distress"] } }
```

**POST /journey/dig/explore:**
```json
Response: { "journey_state": "dig", "response_mode": "pattern_exploration", "assistant_message": "상대가 멀어질수록 더 붙잡게 되는 흐름이 반복되는 것처럼 보여요.", "pattern_candidates": [{ "pattern_type": "pursue_withdraw_loop", "confidence": 0.74 }] }
```

**GET /journey/me/summary:**
```json
Response: { "summary": { "recurring_patterns": ["pursue_withdraw_loop"], "persona_tendencies": ["approval_seeker"], "desire_tensions": ["security_vs_freedom"], "sexual_topic_presence": true, "risk_trend": "stable" } }
```

### 28.4 내부 서비스 계약 (핵심)

**ERS Signal Service — 규칙:**
```json
Input: { "narrative_id": "nar_001", "raw_text": "상대가 답이 늦으면 너무 불안해요.", "journey_state": "dig" }
Output: { "signals": [{ "signal_id": "sig_001", "signal_family": "emotion", "signal_type": "anxiety", "evidence_span": "너무 불안해요", "confidence": 0.91, "sensitivity_level": "low" }] }
Rule: evidence_span이 없는 신호는 저장하지 않는다.
```

**Risk/Crisis Service — 규칙:**
```json
Output: { "risk_tier": 3, "risk_signals": ["self_harm_ideation", "hopelessness_extreme"], "escalation_required": true, "escalation_mode": "clinical" }
Rule: Risk tier는 Claude가 결정하지 않는다. Veilrum safety logic이 결정한다.
```

**M43 Retrieval Service:**
```json
Input: { "topic_clusters": ["attachment", "communication_conflict"], "journey_state": "dig" }
Output: { "framework_refs": ["MSK", "HAB"], "qa_refs": ["m43_qa_120", "m43_qa_332"], "theory_refs": ["theory_024", "theory_078"] }
```

### 28.5 Report/Community/Safety API 엔드포인트

| API | 엔드포인트 |
|-----|----------|
| Report | GET /reports/session/:id / GET /reports/weekly / GET /reports/monthly |
| Community | GET /community/feed / POST /community/posts / POST /community/comments (moderation + safety + PII scrubbing 필수) |
| Safety | GET /support/resources / POST /support/escalation-ack |

---

## 29. Relationship Intelligence Dataset Spec — 6레이어 구조

> **목표:** Relationship Specialist LLM + Sexual Counseling LLM + Pattern prediction + Risk detection + Intervention recommendation

### 29.1 4축 최상위 데이터 소스

1. **Veilrum User Data** — Held/Dig/Get/Set/Me 대화, PRIPER 저널, CODETALK 루틴, DIVE 탐색, Community 익명 글/반응
2. **ERS Signal Data** — attraction/trust/jealousy/emotional_dependency/sexual_dynamics/communication_conflict_patterns
3. **M43 Research Data** — theories / research_outputs / Q&A / sessions / framework_metadata
4. **Outcome/Feedback Data** — user-reported relief / report_usefulness / follow-up_action / intervention_effectiveness

### 29.2 6레이어 구조

| 레이어 | 목적 | 핵심 필드 |
|--------|------|---------|
| **L1 Raw Narrative** | 관계를 어떤 언어로 말하는지 보존 | sample_id / ux_state / raw_text / contains_sexual_content / contains_boundary_issue |
| **L2 Structured Interaction** | 제품 상호작용 → 상담 맥락 학습 | session_id / turn_id / ux_state / question_type / emotional_intensity / sensitivity_level |
| **L3 ERS Signal** | 원문 → machine-readable relational signals | signal_id / signal_family / signal_type / confidence / impact_weight / evidence_span / temporal_status |
| **L4 M43 Interpretation** | 신호 → 이론적 grounding (RAG 기반) | framework_tags / theory_refs / qa_refs / domain_links |
| **L5 Training Examples** | 실제 모델 학습 포맷 | Pattern Detection / Counseling Dialogue / Sexual Counseling / Report Generation / Intervention Recommendation |
| **L6 Evaluation Benchmark** | 모델 품질 반복 측정 | empathy / structure_accuracy / question_quality / risk_recognition / sexual_mismatch_explanation / consent_sensitivity / longitudinal_consistency |

### 29.3 핵심 테이블 스펙

**pattern_profiles:** user_id + attraction/attachment/conflict/power/care/boundary/sexual_pattern

**persona_profiles:** user_id + active_personas + hidden_persona_candidates + activation_contexts

**desire_profiles:** user_id + intimacy/validation/security/stimulation/freedom/control/exclusivity_need

**sexual_profiles:** user_id + orientation + structure_preference + role_preference + desire_frequency + intimacy_link + communication_openness + shame_signal_level

**intervention_outcomes:** intervention_id + session_id + intervention_type + target_issue + short_term_outcome + followup_outcome + self_reported_helpfulness

### 29.4 M43 통합 (현황: 7,763 레코드)

| M43 데이터 | Veilrum 역할 |
|----------|------------|
| theories (239개) | 상담 해석의 이론적 grounding, report explanation 근거 |
| research_outputs (1,707개) | 사례형 설명 강화, nuanced interpretation |
| Q&A (1,322개) | DIVE/Dig 응답 근거 데이터, retrieval source |
| sessions/contents (1,848발언) | 대화적 설명 스타일 학습 |

### 29.5 D5 성·친밀감 신규 수집 축

D5는 핵심 분야이지만 partner Q&A 3개로 얕다. 필수 확장:

- **sexual_partner_dialogue_cases** — frequency/role mismatch conversations, refusal difficulty, fantasy disclosure, exclusivity/open relationship negotiations
- **consent_boundary_cases** — implied vs explicit consent, fear-based yes, pressured compliance, post-event regret
- **sexual_repair_cases** — sexless relationship repair, aftercare mismatch repair, shame disclosure + recovery

### 29.6 수집 우선순위 (3 Phase)

| Phase | 수집 항목 |
|-------|---------|
| Phase 1 | raw narrative + interaction metadata + ERS core signals + M43 theory linking + counseling dialogue dataset |
| Phase 2 | sexual counseling dataset + consent/boundary dataset + intervention outcome dataset + evaluation benchmark |
| Phase 3 | graph-native datasets + longitudinal identity change + couple/partner co-analysis + multilingual |

### 29.7 안전/익명화 원칙

identity removal / partner anonymization / location removal / explicit access tiering / high-sensitivity training pipeline separation

---

## 30. Relationship Graph Spec

관계 데이터는 테이블 구조만으로 충분하지 않다. 관계는 다중 연결 / 시간 변화 / 패턴 반복 / 감정 영향 특성을 갖는다.

### 30.1 Graph Node & Edge 구조

**Nodes:** User / Partner / Relationship / Event / Signal / Pattern / Persona / Desire / Conversation / Intervention / Topic

**Edges:**
| Edge | 의미 |
|------|------|
| ACTIVATES | User → Persona |
| TRIGGERS | Signal → Risk |
| DESIRES | User → Desire type |
| CONFLICTS_WITH | Desire A ↔ Desire B |
| REPEATS | User → Pattern |
| CAUSES | Pattern → Outcome |
| IMPROVED_BY | Signal → Intervention |
| EXPERIENCED | User → Event |

### 30.2 Temporal Graph

모든 Edge는 시간 속성을 갖는다: start_time / end_time / confidence

### 30.3 패턴 감지 쿼리 예시

```
MATCH user → desire → conflict     → desire mismatch 감지
MATCH persona → relationship_failure  → 반복 붕괴 감지
MATCH signal → escalation          → 위험 신호 연결
MATCH signal[pursue_withdraw] + signal[anxiety] + signal[abandonment_fear] → pursue_withdraw_loop 확정
```

### 30.4 AI 활용

- Pattern analysis: 반복 구조 시각화
- Risk detection: 위험 신호 연결 추론
- Intervention recommendation: 어떤 개입이 효과적인지 edge 기반 학습

**장기 목표:** Relationship Graph → Global Relationship Dataset의 기반

---

## 31. Relational Intelligence Architecture — 전체 시스템 통합 구조

> **Veilrum은 UX에서 시작해 관계 경험을 수집하고, ERS로 구조화하고, M43로 해석하고, 데이터셋으로 축적해, 장기적으로 관계/성상담 전문 LLM으로 진화하는 Relational Intelligence Platform이다.**

### 31.1 최상위 6레이어 구조

```text
[RESEARCH LAYER]      M43 Research Frameworks + Theories/Q&A/Outputs/Sessions
         ↓
[PRODUCT UX LAYER]    Held → Dig → Get → Set → Me
         ↓
[INTERACTION LAYER]   PRIPER/CODETALK/DIVE/COMMUNITY → UX 탭 전반에 분산
         ↓
[DATA STRUCTURING LAYER] Narrative Capture → Signal Extraction → ERS Encoding
         ↓
[INTELLIGENCE LAYER]  Pattern / Persona / Desire / Boundary-Sexual / Risk / Intervention
         ↓
[MODEL LAYER]         Counseling LLM + Report Generator + Signal Classifiers → Relationship Specialist LLM
```

### 31.2 데이터 플라이휠

```text
User speaks
→ Veilrum captures narrative
→ ERS extracts signals
→ AI gives better insight
→ user speaks more deeply
→ M43 + Veilrum datasets expand
→ models improve
→ better counseling
→ stronger retention
→ more data
```

이 루프가 돌면 Veilrum은 상담앱/데이팅앱/심리테스트앱을 넘어 **관계 데이터 플랫폼**이 된다.

### 31.3 M43은 시작점, Veilrum은 증폭기

M43는 지식 기반 → Veilrum은 경험 수집 기반 → ERS는 구조화 기반. 이 셋이 결합해야 관계 LLM이 된다.

특히 D5 성·친밀감은 M43에서 시작하지만, Veilrum 사용 과정에서 sexual_partner_communication / consent-boundary_negotiation / shame_disclosure / mismatch_repair 데이터를 다시 생성하며 증폭된다.

### 31.4 최종 목표

이 구조가 완성되면 Veilrum은 "관계 때문에 힘든 사람을 돕는 앱"을 넘어서
**인간 관계와 친밀성을 이해하는 운영체제**가 된다.

---

---

## 32. Database Schema Spec (PostgreSQL/Supabase)

> **목적:** Veilrum 전체 운영 인프라의 데이터 골격. 단순 앱 DB가 아니라 상담 UX + 안전 시스템 + 연구 기반 해석 + 미래 LLM 인프라를 동시에 지탱한다.

### 32.1 설계 5원칙

1. **운영 DB와 학습 DB 분리** — 프로덕션 PostgreSQL은 source of truth, 학습용은 별도 Dataset Builder 파이프라인 거쳐 익명화 후 warehouse로 이동
2. **민감도 3등급 접근 제어** — low/medium/high 별 테이블/컬럼 접근 분리
3. **모든 해석 결과에 evidence + lineage** — signal/pattern/risk는 반드시 source_reference + evidence_span + confidence + model_version + created_at 보유
4. **UX 상태 기준으로 구조화** — 세션과 상호작용은 journey_state 기준
5. **RLS(Row Level Security) 기본값** — narrative/sexual_content/risk_flags는 소유자/운영 역할에 따라 엄격 분리

### 32.2 권장 Schema 분할 (12개)

```
auth_ext   → auth 연동 확장
core       → 사용자 / 세션 / journey / 기본 메타
narrative  → 원문 입력 / 대화 / journaling / reflections
ers        → signal / pattern / persona / desire / sexual / risk
knowledge  → M43 research grounding
graph      → relationship graph materialization
reports    → session/weekly/monthly reports
community  → 게시글 / 댓글 / 반응 / moderation
safety     → crisis escalation / review / moderation
dataset    → review queue / labeling / training export metadata
audit      → lineage / access / model / event logs
analytics  → product aggregates / materialized views (선택)
```

### 32.3 핵심 Enum/Reference Tables

| 테이블 | 값 |
|-------|---|
| `core.ref_journey_states` | held / dig / get / set / me |
| `ers.ref_signal_families` | emotion / attachment / trust / conflict / boundary / sexual / power / relationship_state / risk / narrative / persona / desire |
| `safety.ref_risk_tiers` | 0=normal / 1=mild_concern / 2=elevated / 3=clinical_risk / 4=emergency |
| `reports.ref_report_types` | session / weekly / monthly / sexual_note / boundary_note / risk_summary |
| `dataset.ref_review_status` | pending / reviewed / approved / rejected / ambiguous |

### 32.4 핵심 테이블 구조

**`core.users`** — user_id(PK) / auth_user_id / locale / timezone / current_journey_state(FK) / current_risk_tier

**`core.sessions`** — session_id / user_id / journey_state / started_at / ended_at / active_topic_clusters(jsonb) / current_mode / current_risk_tier / escalation_required

**`narrative.narratives`** — narrative_id / user_id / session_id / journey_state / source_type / raw_text / raw_text_redacted / contains_sexual_content / contains_boundary_issue / sensitivity_level

**`narrative.turns`** — turn_id / session_id / speaker(user/assistant/system) / turn_order / content / response_mode / question_type / **claude_request_id**

**`ers.signals`** (핵심) — signal_id / user_id / session_id / narrative_id / signal_family / signal_type / evidence_span / evidence_start_char / confidence_score / impact_weight / recurrence_count / temporal_status / sensitivity_level / **extraction_method(rule/model/hybrid/human)** / extraction_version

**`ers.signal_lineage`** — 신호 생성 경로 추적 (source_ref_type/source_ref_id/parent_signal_ids/parent_model_run_id)

**`ers.pattern_profiles`** — attraction/attachment/conflict/care/boundary/sexual/power_pattern + confidence_summary(jsonb)

**`ers.sexual_signal_details`** — signal_id(FK) / is_consent_related / is_shame_related / is_frequency_related / is_role_related / is_post_sex_affect_related / reviewer_required

**`ers.sexual_profiles`** — orientation / structure_preference / role_preference / desire_frequency / intimacy_link / communication_openness / shame_signal_level / consent_safety_level

**`safety.risk_assessments`** — risk_tier / risk_domain_scores(jsonb) / escalation_required / escalation_mode / engine_version

**`safety.high_risk_review_queue`** — 사람 검토 큐 (queue_status / assigned_to / priority)

**`knowledge.frameworks`** — framework_code(MSK/HAB/SEX 등) / framework_name / status

**`knowledge.qa_items`** — qa_id / framework_id / topic_cluster / question_text / answer_text / tags(jsonb)

**`graph.nodes`** — node_id / graph_owner_user_id / node_type / external_ref_id / properties(jsonb)

**`graph.edges`** — edge_id / from_node_id / to_node_id / edge_type / weight / properties(jsonb)

**`audit.model_runs`** — model_provider(anthropic) / model_name(Claude 모델 ID) / prompt_version / request_ref

**`audit.response_audits`** — safety_passed / unsupported_claims_detected / notes

### 32.5 Claude API 관련 DB 필드

```
audit.model_runs     → model_provider=anthropic, model_name=Claude모델명, prompt_version, request_ref
narrative.turns      → claude_request_id, response_mode, question_type
audit.response_audits → safety_passed, unsupported_claims_detected
```
**원칙:** Claude는 DB 관점에서 생성 엔진 기록 대상이지, 진실의 근거가 아니다.

### 32.6 Migration 우선순위 (4 Phase)

| Phase | 대상 |
|-------|------|
| Phase 1 Safe MVP | core.users/sessions/journey_state_history + narrative.narratives/turns + ers.signals + safety.risk_assessments/escalation_events + reports.reports + audit.model_runs/response_audits |
| Phase 2 Intelligence | ers.pattern/persona/desire/sexual profiles + knowledge.frameworks/theories/qa_items/retrieval_logs |
| Phase 3 Community + Review | community.* + dataset.review_items/annotations/gold_labels |
| Phase 4 Graph + Training | graph.nodes/edges + dataset.training_exports/example_lineage + analytics |

### 32.7 End-to-End 데이터 흐름 예시

**Held distress:** sessions 생성 → narratives 저장 → signals 생성(emotion/risk) → risk_assessments 계산 → Claude 호출(audit.model_runs) → turns 저장 → response_audits → reports 생성

**Sexual mismatch:** narratives → signals + sexual_signal_details → sexual_profiles 업데이트 → (위험 있으면) risk_assessments → grounded response → dataset.review_items 후보

---

## 33. Prompt Architecture Spec (Claude API 오케스트레이션)

> **핵심 원칙:** Claude는 "그냥 답하는" 것이 아니라, Veilrum이 user_state 결정 → evidence 구조화 → risk 확인 → interpretation grounding → 허용된 응답 형식 제한을 완료한 후에만 답한다.

### 33.1 프롬프트 파이프라인

```text
User Input
→ Session Context Builder
→ Journey State Controller
→ Signal Bundle Builder
→ Risk Gate
→ M43 Retrieval Context Builder
→ Prompt Policy Layer (6레이어)
→ Claude Request Builder
→ Claude Response
→ Output Parser
→ Safety Post-Check
→ Response Formatter
→ User
```

"단일 master prompt"가 아니라 **프롬프트 구성 파이프라인**이다.

### 33.2 Prompt 6레이어 구조

| 레이어 | 내용 |
|--------|------|
| **Layer 1 — Global System Policy** | no diagnosis / no unsupported certainty / evidence-first / risk-first override / no moralizing / no coercion normalization / no fabricated memory |
| **Layer 2 — Journey State Policy** | 각 탭(Held/Dig/Get/Set/Me)별 behavior 규칙 |
| **Layer 3 — Safety Policy** | Risk tier 기반 제한 및 escalation 지시 |
| **Layer 4 — Signal/Pattern Context** | active ERS signals + pattern candidates + persona + desire tensions + sexual signals |
| **Layer 5 — M43 Grounding Context** | framework_refs + theory_snippets + qa_snippets |
| **Layer 6 — Output Contract** | Claude가 반환해야 하는 정확한 구조 |

### 33.3 Global Policy Block (매 요청 포함)

```text
You are Veilrum's response generation layer.
You are not the primary risk classifier or diagnostic authority.
You must only interpret using the provided signals, pattern hypotheses, risk status, and research context.
If evidence is weak, prefer a question over a conclusion.
Do not diagnose. Do not moralize.
Do not introduce claims about the user or partner not grounded in the provided context.
```

### 33.4 Journey State별 프롬프트 정책 (Response Style Matrix)

| 탭 | 톤 | 해석 깊이 | 확실성 | 질문 수 | 조언 수준 |
|----|----|---------|----|------|------|
| Held | 따뜻/수용적 | low | low | 1 | very low |
| Dig | 탐색적/명확 | medium | tentative | 1 | low |
| Get | 성찰적/통찰 | medium-high | tentative | 1 | low |
| Set | 실용적/차분 | medium | moderate | 0-1 | medium |
| Me | 통합적/요약 | medium | low-moderate | 0-1 | low |

**Held prompt insert 예시:**
```text
Current journey state: HELD. Emotional containment, not deep interpretation.
Use warm, calm language. Ask only one next question.
```

**Dig prompt insert 예시:**
```text
Current journey state: DIG. Pattern exploration.
Present patterns as possibilities, not fixed truths. Mention most likely + one alternative if mixed.
```

### 33.5 Safety Prompt 아키텍처 (Risk Tier별 behavior)

| Tier | 행동 |
|------|------|
| 0 Normal | 일반 journey 행동 |
| 1 Mild | 정상 + 주의. 미약한 concern 언급 가능 |
| 2 Elevated | Safety-aware 모드. 해석 야망 줄임. 확인 질문 가능 |
| 3 Clinical | 일반 상담 중단. concern 명확 표현 + 전문가/병원 권고 |
| 4 Emergency | 모든 상담 중단. 짧고 명확한 긴급 지원 안내 |

### 33.6 Signal Bundle 프롬프트 계약

```json
{
  "signals": [{"signal_family": "emotion", "signal_type": "anxiety", "evidence_span": "너무 불안해요", "confidence": 0.91}],
  "pattern_candidates": [{"pattern_type": "pursue_withdraw_loop", "confidence": 0.74}],
  "persona_candidates": [{"persona": "approval_seeker", "confidence": 0.63}],
  "desire_tensions": [{"tension": "security_vs_freedom", "confidence": 0.58}]
}
```

**Confidence 기반 사용 규칙:**
- < 0.40 → 해석 금지, 질문만 사용
- 0.40–0.69 → tentative 해석
- ≥ 0.70 → stronger 해석, 그래도 non-diagnostic

### 33.7 Hypothesis 아키텍처 (다중 가설 모드)

Veilrum은 "정답"을 출력하지 않는다:
- **가장 가능성 높은 해석** (primary)
- **가능한 대안 해석** (alternative)
- **둘을 구별하는 성찰적 질문** (question)

**사용 조건:** pattern confidence 혼재 / 복수 플로 가능 / partner 의도 불명확 / sexual mismatch 다차원적

### 33.8 Sexual Dialogue Prompt 제약

```text
Sexual topic active.
Explore desire mismatch, communication difficulty, shame, or consent ambiguity only within provided evidence.
Do not moralize. Do not infer hidden preferences without support.
If refusal does not appear safe, prioritize safety over compatibility discussion.
```

**즉시 escalation으로 전환:** cannot_refuse_safely / pressured_compliance / severe_shame_with_coercive_context / sexual_trauma_acute_distress

### 33.9 Output Contract (Claude 반환 형식)

```json
{
  "assistant_message": "...",
  "response_mode": "pattern_exploration",
  "question_type": "pattern_question",
  "question_text": "이런 비슷한 장면이 전에도 있었나요?"
}
```

**Output 거부 조건:** diagnosis 포함 / risk tier 행동 위반 / unsupported certainty / state contract 무시 / malformed JSON

**Fallback (검증 실패 시):**
```json
{ "assistant_message": "지금 상황은 조금 더 조심스럽게 살펴보는 게 좋겠어요. 가장 크게 마음에 걸리는 장면이 무엇인지 한 가지만 더 말해줄래요?", "response_mode": "holding", "question_type": "clarification_question" }
```

### 33.10 프롬프트 버저닝 (필수)

모든 Claude 호출에 버전 기록: global_policy_version / journey_policy_version / safety_policy_version / output_contract_version / orchestrator_version / M43_grounding_version / Claude_model_version

→ 이 없으면 안전 실패 추적 / 데이터셋 품질 비교 / fine-tuning 준비 불가

### 33.11 구현 로드맵 (4 Phase)

| Phase | 내용 |
|-------|------|
| Phase 1 | Global policy + Held/Dig state prompts + risk-tier override + JSON output contract + post-check |
| Phase 2 | Get/Set/Me prompt families + sexual dialogue + M43 grounding builder + prompt version registry |
| Phase 3 | multi-hypothesis mode + report prompt + benchmark replay + high-risk escalation templates |
| Phase 4 | prompt analytics + A/B testing + state-conditioned specialized model → 외부 prompt 복잡성 점진적 감소 |

---

*VCGPT_04_AI_Technical.md | 통합 버전 v4 | 2026-03-16*
