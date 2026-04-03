/**
 * Anthropic Claude model constants.
 * Single source of truth — update here to upgrade across all functions.
 */
export const MODELS = {
  SONNET: "claude-sonnet-4-6",
  HAIKU: "claude-haiku-4-5-20251001",
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];

/**
 * 용도별 권장 temperature.
 * 분석/해석: 낮게 (0.3) — 일관성 중시
 * 대화/감정: 중간 (0.7) — 자연스러움 중시
 * 창작/브랜딩: 높게 (0.9) — 다양성 중시
 */
export const TEMPERATURES = {
  ANALYSIS: 0.3,
  CONVERSATION: 0.7,
  CREATIVE: 0.9,
} as const;
