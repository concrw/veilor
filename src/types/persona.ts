export interface PersonaInstance {
  id: string;
  persona_label: string;
  persona_layer: string;
  activation_score: number;
  status: 'active' | 'dormant' | 'suppressed';
  description: string | null;
  contributing_patterns: { axis: string; score: number }[];
  confidence_score: number;
  signal_count: number;
  detected_signals?: { source: string; keyword: string; timestamp: string }[];
}

export interface PatternProfile {
  id: string;
  pattern_axis: string;
  score: number;
  confidence: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface PersonaContradiction {
  id: string;
  persona_a_id: string;
  persona_b_id: string;
  contradiction_type: string;
  severity: number;
  description: string | null;
}

export interface SignalSummary {
  persona_id: string;
  vent_signals: { text: string; emotion: string; created_at: string }[];
  dig_signals: { text: string; layer: string; created_at: string }[];
}

export interface PsychTrendPoint {
  month: string;
  attachment: number;
  communication: number;
  desire: number;
  role: number;
}

export interface OutcomeMetrics {
  firstDate: string | null;
  latestDate: string | null;
  sessionCount: number;
  axisChange: Record<string, number> | null;
  maskChanged: boolean;
  firstMask: string | null;
  latestMask: string | null;
}

export interface MonthlyReportData {
  monthly_summary: {
    vent_count: number;
    dig_count: number;
    codetalk_days: number;
    top_keywords: string[];
    top_emotions: string[];
  };
  comparison: { vent: number; dig: number; codetalk: number };
  top_patterns: string[];
  chart_data: { month: string; vent: number; dig: number; codetalk: number }[];
  psych_trend?: PsychTrendPoint[];
  outcome_metrics?: OutcomeMetrics;
}
