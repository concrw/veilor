# VEILOR

**멘탈 퍼포먼스 루틴 플랫폼**

엘리트 선수·아이돌·트레이니의 멘탈 상태를 일상 데이터로 추적하고, AI 코칭 어시스턴트 "엠버"와 함께 자기이해와 성장을 쌓는 플랫폼.

---

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Style**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions + Realtime)
- **결제**: Stripe
- **음성**: Web Speech API

## 로컬 개발

```bash
bun install
bun dev
```

## 문서

| 파일 | 내용 |
|------|------|
| [veilor_master.md](veilor_master.md) | 통합 현황 — 설계·구현·갭 분석 |
| [veilor_b2b.md](veilor_b2b.md) | B2B 서비스 전략 전체 |
| [veilor_ux_modes.md](veilor_ux_modes.md) | 3가지 UX 모드 설계 |
| [veilor_systemmode_plan.md](veilor_systemmode_plan.md) | 시스템모드(Clear) 프론트엔드 기획 |
| [veilor_systemmode_benchmark.md](veilor_systemmode_benchmark.md) | 경쟁사 6개 UX 벤치마킹 |

과거 PRIPER 시절 문서는 [docs/archive/](docs/archive/) 에 보관.
