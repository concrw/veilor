---
name: VEILOR Design System

colors:
  # Signature — Amber accent (warm gold)
  primary: "#E0B48A"
  primary-gold: "#EDD08E"
  primary-deep: "#D4B46A"
  primary-dim: "#B8956A"
  on-primary: "#1C1917"

  # Frost — secondary accent (cool blue)
  frost: "#95BDD6"
  on-frost: "#1C1917"

  # Surface — warm near-black
  background: "#1C1917"
  surface: "#242120"
  surface-raised: "#292524"
  surface-high: "#3C3835"
  on-surface: "#E7E5E4"
  on-surface-muted: "#B8B3AF"
  on-surface-subtle: "#9C9590"
  on-surface-faint: "#87817C"

  # Borders
  border: "#3C3835"
  border-subtle: "#2A2624"

  # Semantic
  error: "#F87171"

typography:
  display:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 2.25rem
    fontWeight: "300"
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 1.5rem
    fontWeight: "300"
    lineHeight: 1.3
    letterSpacing: -0.01em
  title:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 1.125rem
    fontWeight: "400"
    lineHeight: 1.4
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 1rem
    fontWeight: "300"
    lineHeight: 1.6
  body-sm:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 0.875rem
    fontWeight: "300"
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: 1.4
  caption:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: 0.75rem
    fontWeight: "300"
    lineHeight: 1.4

spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-max: 1280px
  gutter-mobile: 16px
  gutter-desktop: 32px

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  full: 9999px

components:
  button-primary:
    backgroundColor: "#E0B48A"
    textColor: "#1C1917"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "10px 24px"
    height: 44px
  button-primary-hover:
    backgroundColor: "#EDD08E"
  button-secondary:
    backgroundColor: "#242120"
    textColor: "#E7E5E4"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "10px 24px"
    height: 44px
  button-secondary-hover:
    backgroundColor: "#292524"
  card:
    backgroundColor: "#242120"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "#242120"
    textColor: "#E7E5E4"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
    height: 44px
  input-focus:
    backgroundColor: "#292524"
---

## Overview

VEILOR는 패션·스타일 플랫폼입니다. Warm dark(#1C1917) 배경에 Amber gold(#E0B48A)와 Frost blue(#95BDD6) 투-톤 accent를 사용하는 고급스러운 다크 시스템입니다.

디자인 원칙:
- **완전 다크**: `#1C1917` warm near-black 배경. 라이트 모드 없음
- **Amber 원포인트**: `#E0B48A` — CTA, 강조 텍스트. 4단계 농도 조절 가능
- **Frost 보조**: `#95BDD6` — 정보성 강조, 링크. Amber와 역할 구분
- **Light weight 타이포**: font-weight 300 기본 — 고급스러운 느낌
- **WCAG AA 준수**: 모든 텍스트 색상 대비 4.5:1 이상 유지

## Colors

**Amber 4단계**: primary(`#E0B48A`) → gold(`#EDD08E`) → deep(`#D4B46A`) → dim(`#B8956A`).  
강조 강도에 따라 위계적으로 사용. Amber on dark는 충분한 대비(5.2:1) 확보.

**Frost `#95BDD6`** — Amber의 보완색. 같은 컴포넌트에 동시 사용 금지.

Surface: `#1C1917 → #242120 → #292524 → #3C3835`.

## Typography

시스템 폰트, font-weight 300 기본(라이트 타입). 헤드라인도 300으로 고급감 유지. 버튼·레이블만 400.

## Shapes

`--radius: 1.25rem` — device-like softer corners. 버튼 `20px`, 카드 `16px`.

## Do's and Don'ts

**Do:**
- 배경은 항상 `#1C1917` warm dark
- Amber(`#E0B48A`)를 CTA에 사용, 텍스트는 `#1C1917`(어두운 색)
- Frost는 Amber의 보완용으로 역할 분리
- font-weight 300으로 가볍고 고급스럽게

**Don't:**
- 라이트 배경 금지
- Amber와 Frost를 같은 CTA에 동시 사용 금지
- font-weight 700+ 헤드라인 금지 (무거워짐)
- 순수 블랙(`#000000`) 배경 금지 — warm dark 유지
