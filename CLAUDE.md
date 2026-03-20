# VEILRUM - Claude Code 작업 가이드

**커뮤니케이션 원칙: 항상 존댓말 사용. 반말 금지.**

---

## 🔴 세션 시작 시 자동 실행 (필수)

Claude Code는 세션 시작 즉시 아래 SQL을 실행하여 운영 가이드를 로드해야 한다.
이 단계를 건너뛰는 것은 절대 금지.

```sql
SELECT content FROM deepplot_core.protocols WHERE protocol_code = 'DEEPPLOT_MASTER_GUIDE';
```

---

## Supabase 접근 (필수 정보)

- **project_id**: `qwiwotodwfgkpdasdhhl` (절대 변경 금지)
- **platform**: `veilrum`
- **Python**: `/opt/homebrew/bin/python3.11` (3.9 사용 금지)
- **supabase-client 경로**: `/Users/brandactivist/Desktop/DEEPPLOT/supabase-client`

---

*운영 가이드 전문은 DB에 있습니다: `deepplot_core.protocols`*
