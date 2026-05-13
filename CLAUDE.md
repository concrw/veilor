product: veilor

# VEILOR — Claude Code 작업 가이드

커뮤니케이션 원칙: 항상 존댓말 사용.

## 환경

- **project_id**: `qwiwotodwfgkpdasdhhl`
- **Python**: `/opt/homebrew/bin/python3.11`
- **supabase-client**: `/Users/brandactivist/Desktop/DEEPPLOT/supabase-client`
- **Google Drive**: `~/Google Drive/내 드라이브/VEILOR/` (연구 문서)

## 운영 규칙

세션 시작 시 `SessionStart` hook이 `aosis.memory_entries`에서 global + veilor 규칙을 자동 로드한다.

추가 규칙 조회:
```sql
SELECT key, title, content_json FROM aosis.memory_entries
WHERE scope_ref = 'veilor' AND is_active = true;
```

## 구현 여부 판단 원칙

문서·메모리의 미구현 항목을 그대로 믿지 말 것. 코드를 직접 grep/read로 확인 후 판단한다. 코드가 truth source다.

## 스프린트 관리

- 세션 시작 시 현재 스프린트 확인:
  ```sql
  SELECT id, sprint_number, status, code, managed_by FROM aosis.sprints
  WHERE product = 'veilor' ORDER BY sprint_number DESC LIMIT 5;
  ```

## Code Quality Rules
- Split a component when: (1) cyclomatic complexity > 20, (2) it has more than one reason to change, or (3) logic is reused in 2+ places

## i18n 규칙 (위반 금지)

**새 파일 작성 시 UI 텍스트는 처음부터 i18n 키로 작성한다. 하드코딩 임시 작성 후 나중에 상수화하는 방식 금지.**

- 새 페이지/컴포넌트 생성 시: `useT()` import → i18n 키 추가(en.ts/ko.ts/ja.ts/types.ts) → `t.xxx` 사용. 이 순서 고정.
- JSX 내 한국어/영어 문자열 리터럴 직접 삽입 금지. (`>텍스트<`, placeholder="텍스트", aria-label="텍스트" 포함)
- 파일 내 로컬 `TEXT = {ko, en}` 패턴 신규 작성 금지. 기존 파일의 해당 패턴은 발견 시 i18n으로 이전.
- 작업 완료 선언 전 반드시 실행: `grep -rn "[가-힣]" src/ --include="*.tsx" | grep -v "^\s*//"` → 렌더링 영역 한국어 0건 확인.
