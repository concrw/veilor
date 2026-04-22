# VEILOR - Claude Code 작업 가이드

**커뮤니케이션 원칙: 항상 존댓말 사용. 반말 금지.**

---

## 🔴 세션 시작 시 자동 실행 (필수)

Claude Code는 세션 시작 즉시 아래 SQL을 실행하여 운영 가이드를 로드해야 한다.
이 단계를 건너뛰는 것은 절대 금지.

```sql
SELECT content FROM deepplot_core.protocols WHERE protocol_code = 'DEEPPLOT_MASTER_GUIDE';
```

---

## 🔴 구현 여부 판단 원칙 (절대 준수)

**문서·메모리의 ❌/⚠️/미구현 항목을 그대로 믿지 말 것.**

`docs/veilor_integration_briefing.md`, `/memory/` 파일들은 항상 stale할 수 있다.
구현 여부는 반드시 **코드를 직접 확인**해서 판단한다.

- 작업 전 "미구현"이라고 되어 있는 항목 → 코드 grep/read로 직접 확인 후 진행
- 확인 없이 문서만 보고 "미구현이니 구현해야 한다"고 판단하는 것은 금지
- 코드가 truth source다. 문서는 참고용이다.

---

## Supabase 접근 (필수 정보)

- **project_id**: `qwiwotodwfgkpdasdhhl` (절대 변경 금지)
- **platform**: `veilor`
- **Python**: `/opt/homebrew/bin/python3.11` (3.9 사용 금지)
- **supabase-client 경로**: `/Users/brandactivist/Desktop/DEEPPLOT/supabase-client`

---

## 🔴 스프린트 관리 — AOSIS 중앙 관리 (필수)

VEILOR의 스프린트는 AOSIS가 중앙 관리한다. 스프린트 항목은 반드시 `aosis.sprint_items`에 `product = 'veilor'`으로 기록해야 한다.

### 세션 시작 시 — 현재 스프린트 확인 (필수)

세션 시작 즉시 실행:

```sql
SELECT id, sprint_number, status, code
FROM aosis.sprints
WHERE product = 'veilor'
ORDER BY sprint_number DESC
LIMIT 5;
```

| 결과 | 조치 |
|------|------|
| `IN_PROGRESS` 스프린트 있음 | **다음 sprint_number로 새 스프린트 생성** 후 작업 |
| `IN_PROGRESS` 없음 | 새 스프린트 생성 후 작업 |

IN_PROGRESS는 AOSIS runtime이 돌리는 스프린트다. Claude Code 세션에서 끼어들지 않는다.

새 스프린트 생성:
```sql
INSERT INTO aosis.sprints (product, sprint_number, code, status, goal)
VALUES (
  'veilor',
  (SELECT COALESCE(MAX(sprint_number), 0) + 1 FROM aosis.sprints WHERE product = 'veilor'),
  'veilor-sprint-{NNN}',
  'PLANNED',
  '{스프린트 목표}'
)
RETURNING id, sprint_number, code;
```

### sprint_items 작성 규칙 (위반 시 작업 무효)

- 구현 항목이 추가/변경/완료될 때마다 즉시 `aosis.sprint_items` INSERT/UPDATE
- 항목마다 `verification_query` 필수 — 실제 동작을 검증하는 SQL (빈 행 = FAIL)
- 완료 시 `status = 'DONE'`, `verification_result`에 실행 결과 저장
- 세션 끝나기 전 sprint_items 누락 여부 확인 필수 — 구현했는데 DB에 없으면 없는 것과 같다

### INSERT 예시

```sql
INSERT INTO aosis.sprint_items (sprint_id, order_index, title, status, verification_query)
VALUES (
  '[sprint_id]',
  0,
  '[항목 제목]',
  'DONE',
  'SELECT 1 FROM [실제 동작을 검증하는 쿼리]'
);
```

### managed_by 확인 (세션 충돌 방지)

VEILOR product는 `managed_by = 'claude_code'`로 설정되어 있다.
Claude Code 세션이 VEILOR 스프린트를 직접 관리한다.

- AOSIS runtime managed_by=runtime product → Claude Code 세션 접근 차단 (DB 트리거 P0010)
- VEILOR는 claude_code이므로 접근 가능

```sql
-- managed_by 확인
SELECT product, managed_by FROM aosis.sprints WHERE product = 'veilor' LIMIT 1;
```

### 왜 AOSIS인가

AOSIS `closeSprintAndNotify()`는 4단 gate로 스프린트 완료를 차단한다:
1. sprint_items 0개 gate — 항목 없으면 차단 (P0000)
2. DoD gate — 미완료 항목 있으면 차단 (P0001)
3. verification_query 누락 gate — VQ 없는 항목 있으면 차단 (P0002)
4. Double-check gate — VQ 실행 결과 빈 행이면 차단 (P0003)

이 gate는 DB 트리거 레벨 강제화이므로 우회 불가.

---

## 📁 파일 위치 안내

로컬에는 개발 소스만 있습니다. 연구/문서 자료는 Google Drive에 있습니다.

**Google Drive 경로**: `내 드라이브/VEILOR/`  
**로컬 마운트 경로**: `~/Google Drive/내 드라이브/VEILOR/`

| GD 경로 | 내용 |
|---|---|
| `연구_문서/01_연구설계` ~ `05_연구콘텐츠` | M43 연구 설계, 프레임워크, 조직/인물, 회의록, 콘텐츠 |
| `연구_문서/05_운영정책` ~ `08_Notion_Archive` | 운영정책, 베일러, 콘텐츠소스, Notion 아카이브 |
| `연구_문서/M43`, `VCGPT`, `docs` | M43 자료, VCGPT, 아키텍처 문서 |
| `연구_문서/briefing`, `html`, `veilor_automation` | 세션 브리핑, HTML 프로토타입, 자동화 스크립트 |
| `빌드_아티팩트/` | node_modules, dist, playwright-report (재생성 가능) |
| `app_source/` | app 폴더 소스 백업 |

---

*운영 가이드 전문은 DB에 있습니다: `deepplot_core.protocols`*
