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

## Supabase 접근 (필수 정보)

- **project_id**: `qwiwotodwfgkpdasdhhl` (절대 변경 금지)
- **platform**: `veilor`
- **Python**: `/opt/homebrew/bin/python3.11` (3.9 사용 금지)
- **supabase-client 경로**: `/Users/brandactivist/Desktop/DEEPPLOT/supabase-client`

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
