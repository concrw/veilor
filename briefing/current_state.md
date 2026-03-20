# VEILRUM — Current State

**날짜**: 2026-03-16
**Phase**: P5-APP-RESTRUCTURE — 앱 전면 구조 재설계 확정. Phase 1 시작 대기.

---

## 핵심 전환점 (2026-03-16)

기존 PRIPER/DIVE/CODETALK 탭 구조 → **Held/Dig/Get/Set/Me 5탭** 전면 교체 확정.
3개 서비스는 기능 단위로 해체 후 각 탭에 분산. 서비스 이름 유저에게 노출 안 됨.
임원진(Beth/Sebastian/David/Leo) + 밀라르쉬 2026-03-15 오후 세션 확정사항.

---

## 확정된 설계 결정사항

| 항목 | 확정 내용 |
|------|-----------|
| 탭 구조 | Held / Dig / Get / Set / Me |
| 온보딩 완료 기준 | 캐릭터 설정까지. Held 첫 AI 멘트가 마지막 장면 |
| 온보딩 스텝 | `language → naming → char_type → input_mode → completed` |
| 가면진단 타이밍 | AI 유도 카드 or Get 탭 직접 진입 — 두 경로 동일 결과 수렴 |
| 탭 잠금 | 완전 오픈. 맥락 없으면 빈 상태 + 안내 |
| AI 연동 | 고정 텍스트로 시작, 연동 포인트 분리 |
| AI 캐릭터 | 동그라미 placeholder, 탭별 색상 |
| 대화 저장 | `veilrum.tab_conversations` 신규 테이블 (dive_sessions 재활용 안 함) |
| CodeTalk 입력 | 3단계 딥다이브 — definition → imprinting_moment → root_cause |
| 가면 12종 | priperAlgorithm.ts 하드코딩 유지 |
| DIVE 매칭 | m43_domain_questions 1,314개 엔진 Held/Dig에 연결 |
| 커뮤니티/DM | 이번 범위 제외 |
| 음성 모드 | UI 진입점만, STT/TTS 구현 제외 |

---

## 앱 현황 (/Desktop/VEILRUM/app/)

- **위치**: `/Users/brandactivist/Desktop/VEILRUM/app/`
- **스택**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **Dev server**: localhost:3002
- **빌드**: 성공 ✅ (3.49s, 타입 에러 없음)
- **현재 탭**: 홈/PRIPER/TALK/DIVE/커뮤니티 → **교체 예정**
- **완료된 것**:
  - Auth (Login/Signup) — VEILRUM 브랜드로 교체 완료
  - AuthContext — onboarding 상태 관리 (교체 예정)
  - priperAlgorithm.ts — 가면 12종 하드코딩 완료
  - priperQuestions.ts — 40문항 완료
  - Supabase client — Veilrum DB 연결 완료

---

## DB 현황 (qwiwotodwfgkpdasdhhl)

### veilrum 스키마 — 22개 테이블
| 테이블 | 데이터 | 상태 |
|--------|--------|------|
| codetalk_keywords | 100개 | ✅ basic 30 / relationship 30 / deep 40 |
| community_groups | 24개 | ✅ |
| researcher_profiles | 40명 | ✅ m43_researchers 연결 |
| master_checklist | 49개 | ✅ |
| session_briefs | 4건 | ✅ |
| project_docs | 5건 | ✅ |
| virtual_user_profiles | 0 | 구조만 |
| 나머지 | 0 | 구조만 |
| **tab_conversations** | — | **신규 생성 필요** |

### public 스키마 — M43
| 테이블 | 데이터 |
|--------|--------|
| m43_domain_questions | 1,314개 ✅ |
| m43_domain_answers | 1,314개 ✅ |
| m43_researchers | 40명 ✅ |
| m43_domains | 231개 ✅ |

---

## 다음 작업 — Phase 1 (즉시 시작)

1. **DB migration** — onboarding_step 재설계 + tab_conversations 신규 테이블
2. **App.tsx** — `/held` `/dig` `/get` `/set` `/me` 라우팅으로 전면 교체
3. **HomeLayout** — Held/Dig/Get/Set/Me 5탭으로 교체
4. **AuthContext** — onboarding_step 타입 교체

## 열린 결정사항

- V프로필 유형 체계 미확정 — Get 탭 "나의 형태" 카드 M43 세션 결과 대기
- AI 캐릭터 단일/멀티 선택 — 에셋 요구사항 결정 필요
- Claude API 키 미확보 — 다음 스프린트에서 연동
- 연구원 페르소나 유저 노출 방식 미결정
