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

- **managed_by**: `claude_code`
- 세션 시작 시 현재 스프린트 확인:
  ```sql
  SELECT id, sprint_number, status, code FROM aosis.sprints
  WHERE product = 'veilor' ORDER BY sprint_number DESC LIMIT 5;
  ```
- `managed_by = 'runtime'`인 스프린트 ACTIVE → Claude Code 접근 불가
