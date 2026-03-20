# Veilrum 세션 시작 브리핑

> 이 파일 하나만 읽으면 어느 창(Claude / Claude Code)에서든 즉시 작업 시작 가능.
> **세션 시작 시 Claude에게 이 파일을 붙여넣거나 경로를 알려주세요.**

---

## ⚡ 핵심 컨텍스트 (30초 요약)

| 항목 | 내용 |
|------|------|
| **프로젝트** | Veilrum — 관계 플랫폼 (발견→관리→만족) |
| **DB** | Supabase `qwiwotodwfgkpdasdhhl` (딥플롯 DB 공유, `veilrum` 스키마) |
| **기존 코드** | PRIPER 80% `/Desktop/PRIPER/` / DIVE 70% `/Desktop/DIVE/` |
| **신규 앱** | `/Desktop/VEILRUM-APP/` (미생성, 통합 프로젝트) |
| **스택** | React 18 + TypeScript + Vite + Tailwind + Supabase |
| **기준 문서** | `VEILRUM/Veilrum_통합기획문서_v1_20260310.md` |

---

## 🗂️ 창별 역할

### 이 창 (Claude Code — VEILRUM 폴더)
- Veilrum 사이트 개발 (앱 빌드, DB 연동)
- M43 연구 콘텐츠 생성 (밀라르쉬 발제, 연구원 분석, 세션)
- Supabase MCP 직접 연결 ✅

### Claude 웹 창
- 기획 토론, 콘텐츠 생성, 캐릭터 작업
- 긴 문서 분석

---

## 📁 핵심 파일 경로

```
/Users/brandactivist/Desktop/VEILRUM/
├── Veilrum_통합기획문서_v1_20260310.md   ← 전체 기획 기준 문서
├── briefing/
│   ├── SESSION_START.md               ← 이 파일 (세션 브리핑)
│   ├── current_state.md               ← 현재 Phase 스냅샷
│   ├── CHANGELOG.md                   ← 세션 이력
│   ├── Veilrum_App_Dev_Briefing_v1_20260310.md  ← 앱 개발 상세
│   └── Claude_DB_Review_Brief_20260310.md       ← DB 구조 점검
├── 06_베일럼/                          ← C-Level 프로필, 브레인스토밍
└── 04_회의록/                          ← 플랫폼 통합 설계 원본
```

---

## 🔴 지금 당장 할 일 (우선순위 순)

- [ ] **VEILRUM-APP 통합 프로젝트 스캐폴딩** — React+Vite+TS+Tailwind
- [ ] Supabase `veilrum` 스키마 TypeScript 타입 생성
- [ ] 인증 시스템 구축 (Supabase Auth)
- [ ] PRIPER Why 컨설팅 10단계 이식
- [ ] CodeTalk 개발 (키워드 100개 DB 완비)
- [ ] DIVE F/T 모드 이식
- [ ] Community 통합

---

## 🗃️ DB 연결

**Supabase MCP:** ✅ Claude Code에서 직접 실행 가능
**프로젝트 ID:** `qwiwotodwfgkpdasdhhl`

```bash
# Python 직접 접근 시
cd /Users/brandactivist/Desktop/DEEPPLOT/supabase-client
/opt/homebrew/bin/python3.11 - << 'PYEOF'
import sys; sys.path.insert(0, '.')
from db import get_supabase_client
sb = get_supabase_client()
# veilrum 스키마 접근
sb.schema("veilrum").table("codetalk_keywords").select("*").execute()
PYEOF
```

**veilrum 스키마 완비 테이블:**
- `codetalk_keywords` — 100개 ✅
- `community_groups` — 24개 ✅
- `researcher_profiles` — 40명 ✅

---

## 🔵 Veilrum 핵심 철학 (개발 원칙)

- **브랜드:** "관계의 Banksy" — 자극적이지만 근거 있음
- **원명제:** "합의되지 않은 것만이 악하다"
- **프로덕트 원칙:** "수위를 검열하지 않는다. 합의를 검증한다."
- **유저 저니:** 발견(PRIPER) → 관리(CodeTalk+DIVE) → 만족
- **아키텍처:** "하나의 계정, 여러 경험" — 슈퍼앱 아님

---

## 📋 세션 종료 시 할 일

1. `briefing/current_state.md` 덮어쓰기 (현재 Phase + 다음 할 일)
2. `briefing/CHANGELOG.md` 맨 위에 세션 로그 추가
3. `briefing/logs/YYYY-MM-DD_session.md` 생성/추가

---

*SESSION_START.md | 2026-03-10 | 세션마다 이 파일을 기준으로 시작*
