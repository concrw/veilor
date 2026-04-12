// Stage 1-1: Me탭 실제 유저 데이터 훅
// tab_conversations, user_signals, persona_instances,
// user_psych_map_snapshots, relationship_entities, user_profiles 연결
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';

// ── 타입 ──────────────────────────────────────────────────────────────────────

export interface MeStats {
  sessionCount: number;   // 전체 대화 세션 수 (tab_conversations)
  signalCount: number;    // 수집된 시그널 수 (user_signals)
  insightCount: number;   // 감정 태그된 시그널 = 통찰
  patternAreaCount: number; // 패턴 발견된 영역 수
}

export interface PersonaData {
  id: string;
  name: string;
  color: string;
  zone: string;
  desc: string;
  tags: string[];
  conflict: string;
  isPrimary: boolean;
  confidenceScore: number;
}

export interface RadarSnapshot {
  axes: string[];
  vals: number[];
  snapshotDate: string | null;
}

export interface MonthlyReport {
  month: string;
  title: string;
  detail: string;
  axisDeltas: { axis: string; delta: number }[];
  snapshotDate: string | null;
}

export interface PersonData {
  id: string;
  name: string;
  relationship: string;
  color: string;
  pattern: string;
  conflict: string;
  tags: string[];
  mentionCount: number;
}

export interface DiagnosisResult {
  primaryMask: string | null;
  axisScores: { axes: string[]; vals: number[] } | null;
  priperCompleted: boolean;
}

// ── DB 행 타입 (Supabase JSON 컬럼 대응) ──────────────────────────────────────

interface PersonaInstanceRow {
  id: string;
  persona_label: string | null;
  persona_layer: string | null;
  vent_signals: unknown;
  dig_signals: unknown;
  insights: unknown[] | null;
  contradictions: unknown[] | null;
  is_primary: boolean | null;
  confidence_score: number | null;
  layer_group: string | null;
}

interface PsychSnapshotRow {
  snapshot_date: string | null;
  snapshot_type?: string | null;
  affect_regulation_score: number | null;
  attachment_security_score: number | null;
  communication_style_score: number | null;
  boundary_power_score: number | null;
  top_patterns?: unknown[] | null;
  unresolved_conflicts?: unknown[] | null;
  top_entities?: unknown[] | null;
  current_goals?: unknown[] | null;
  confidence_bands?: Record<string, unknown> | null;
}

interface RelationshipEntityRow {
  id: string;
  label: string | null;
  relationship: string | null;
  affect_valence: number | null;
  dominant_pattern: string[] | null;
  recent_event_summary: string | null;
  mention_count: number | null;
}

interface UserProfileRow {
  primary_mask: string | null;
  secondary_mask: string | null;
  axis_scores: Record<string, number> | null;
  priper_completed: boolean | null;
}

type JsonItem = string | { keyword?: string; label?: string; description?: string; summary?: string; text?: string; count?: number; signal_count?: number };

// ── 훅 ──────────────────────────────────────────────────────────────────────

export function useUserMeData() {
  const { user } = useAuth();
  const uid = user?.id;

  // 1. Seed 카드 통계 (세션 수, 시그널 수)
  const statsQuery = useQuery<MeStats>({
    queryKey: ['me-stats', uid],
    queryFn: async () => {
      const [convRes, signalRes] = await Promise.all([
        veilorDb
          .from('tab_conversations')
          .select('session_count')
          .eq('user_id', uid!),
        veilorDb
          .from('user_signals')
          .select('id, emotion, severity')
          .eq('user_id', uid!),
      ]);

      const conversations = (convRes.data ?? []) as { session_count: number }[];
      const signals = (signalRes.data ?? []) as { id: string; emotion: string | null; severity: string | null }[];

      const sessionCount = conversations.reduce((s, c) => s + (c.session_count ?? 0), 0);
      const signalCount = signals.length;
      const insightCount = signals.filter(s => s.emotion && s.emotion !== '').length;

      // 패턴 발견 영역: severity가 있거나 emotion이 다양한 경우 집계
      const uniqueEmotions = new Set(signals.map(s => s.emotion).filter(Boolean));
      const patternAreaCount = Math.min(uniqueEmotions.size, 9); // 최대 9개 축

      return { sessionCount, signalCount, insightCount, patternAreaCount };
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 3,
  });

  // 2. 멀티페르소나 (persona_instances)
  const personasQuery = useQuery<PersonaData[]>({
    queryKey: ['me-personas', uid],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('persona_instances')
        .select('id, persona_label, persona_layer, vent_signals, dig_signals, insights, contradictions, is_primary, confidence_score, layer_group')
        .eq('user_id', uid!)
        .order('is_primary', { ascending: false })
        .order('confidence_score', { ascending: false })
        .limit(6);

      if (!data || data.length === 0) return [];

      const LAYER_COLOR: Record<string, string> = {
        social: '#7BA8C4',
        daily:  '#D4A574',
        secret: '#A07850',
      };

      return (data as PersonaInstanceRow[]).map(row => {
        const insights = (row.insights ?? []) as JsonItem[];
        const contradictions = (row.contradictions ?? []) as JsonItem[];
        const tags = insights.slice(0, 3).map((ins) =>
          typeof ins === 'string' ? ins : ins?.keyword ?? ins?.label ?? ''
        ).filter(Boolean);
        const first = contradictions[0];
        const conflictText = first
          ? (typeof first === 'string' ? first : first?.description ?? '')
          : '';

        return {
          id: row.id,
          name: `"${row.persona_label ?? '알 수 없음'}" 나`,
          color: LAYER_COLOR[row.persona_layer ?? 'daily'] ?? '#D4A574',
          zone: row.layer_group ?? row.persona_layer ?? '',
          desc: insights.slice(0, 2).map((ins) =>
            typeof ins === 'string' ? ins : ins?.description ?? ''
          ).filter(Boolean).join(' ') || '더 많은 대화로 패턴이 선명해져요.',
          tags: tags.length > 0 ? tags : ['패턴 수집 중'],
          conflict: conflictText || '다른 페르소나와의 관계를 분석 중이에요.',
          isPrimary: !!row.is_primary,
          confidenceScore: row.confidence_score ?? 0,
        };
      });
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });

  // 3. 레이더차트 — user_psych_map_snapshots (최신 2개)
  const radarQuery = useQuery<{ now: RadarSnapshot; prev: RadarSnapshot | null }>({
    queryKey: ['me-radar', uid],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('user_psych_map_snapshots')
        .select('snapshot_date, affect_regulation_score, attachment_security_score, communication_style_score, boundary_power_score')
        .eq('user_id', uid!)
        .order('snapshot_date', { ascending: false })
        .limit(2);

      const AXES = ['애착', '소통', '욕구', '역할'];

      const toSnapshot = (row: PsychSnapshotRow): RadarSnapshot => ({
        axes: AXES,
        vals: [
          Math.round((row.attachment_security_score ?? 50) * 100),
          Math.round((row.communication_style_score ?? 44) * 100),
          Math.round((row.affect_regulation_score ?? 38) * 100),
          Math.round((row.boundary_power_score ?? 77) * 100),
        ],
        snapshotDate: row.snapshot_date ?? null,
      });

      if (!data || data.length === 0) {
        // 스냅샷 없으면 user_profiles.axis_scores 폴백
        const { data: profile } = await veilorDb
          .from('user_profiles')
          .select('axis_scores')
          .eq('user_id', uid!)
          .single();

        const axisScores = (profile as UserProfileRow | null)?.axis_scores;
        if (axisScores && typeof axisScores === 'object') {
          const vals = [
            axisScores.attachment ?? 50,
            axisScores.communication ?? 44,
            axisScores.desire ?? 38,
            axisScores.role ?? 77,
          ];
          return {
            now: { axes: AXES, vals, snapshotDate: null },
            prev: null,
          };
        }
        return {
          now: { axes: AXES, vals: [50, 44, 38, 77], snapshotDate: null },
          prev: null,
        };
      }

      return {
        now: toSnapshot(data[0]),
        prev: data.length > 1 ? toSnapshot(data[1]) : null,
      };
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });

  // 4. 월간 리포트 — user_psych_map_snapshots 최근 2개 비교
  const reportQuery = useQuery<MonthlyReport | null>({
    queryKey: ['me-report', uid],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('user_psych_map_snapshots')
        .select('snapshot_date, snapshot_type, affect_regulation_score, attachment_security_score, communication_style_score, boundary_power_score, top_patterns, unresolved_conflicts')
        .eq('user_id', uid!)
        .order('snapshot_date', { ascending: false })
        .limit(2);

      if (!data || data.length < 2) return null;

      const [nowRow, prevRow] = data as PsychSnapshotRow[];
      const AXES = ['애착', '소통', '욕구', '역할'];
      const nowVals = [
        Math.round((nowRow.attachment_security_score ?? 0) * 100),
        Math.round((nowRow.communication_style_score ?? 0) * 100),
        Math.round((nowRow.affect_regulation_score ?? 0) * 100),
        Math.round((nowRow.boundary_power_score ?? 0) * 100),
      ];
      const prevVals = [
        Math.round((prevRow.attachment_security_score ?? 0) * 100),
        Math.round((prevRow.communication_style_score ?? 0) * 100),
        Math.round((prevRow.affect_regulation_score ?? 0) * 100),
        Math.round((prevRow.boundary_power_score ?? 0) * 100),
      ];

      const axisDeltas = AXES.map((axis, i) => ({
        axis,
        delta: nowVals[i] - prevVals[i],
      }));

      const patterns = (nowRow.top_patterns ?? []) as JsonItem[];
      const conflicts = (nowRow.unresolved_conflicts ?? []) as JsonItem[];

      const monthStr = nowRow.snapshot_date
        ? `${new Date(nowRow.snapshot_date).getMonth() + 1}월`
        : '최근';

      const firstPattern = patterns[0];
      const title = firstPattern
        ? (typeof firstPattern === 'string' ? firstPattern : firstPattern?.summary ?? firstPattern?.label ?? '패턴이 발견됐어요')
        : '관계 패턴이 수집되고 있어요';

      const firstConflict = conflicts[0];
      const detail = firstConflict
        ? (typeof firstConflict === 'string' ? firstConflict : firstConflict?.description ?? '')
        : '더 많은 대화로 인사이트가 깊어져요.';

      return {
        month: monthStr,
        title,
        detail,
        axisDeltas,
        snapshotDate: nowRow.snapshot_date ?? null,
      };
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 10,
  });

  // 5. 내 사람들 (relationship_entities)
  const peopleQuery = useQuery<PersonData[]>({
    queryKey: ['me-people', uid],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('relationship_entities')
        .select('id, label, relationship, affect_valence, dominant_pattern, recent_event_summary, mention_count')
        .eq('user_id', uid!)
        .order('mention_count', { ascending: false })
        .limit(6);

      if (!data || data.length === 0) return [];

      const VALENCE_COLOR = (v: number | null) => {
        if (v === null) return '#A8A29E';
        if (v >= 0.3) return '#D4A574';
        if (v <= -0.3) return '#7BA8C4';
        return '#A07850';
      };

      return (data as RelationshipEntityRow[]).map(row => {
        const patterns = row.dominant_pattern ?? [];
        return {
          id: row.id,
          name: row.label ?? '이름 없음',
          relationship: row.relationship ?? '관계',
          color: VALENCE_COLOR(row.affect_valence),
          pattern: row.recent_event_summary ?? '대화에서 언급된 사람이에요.',
          conflict: patterns.length > 0
            ? `${patterns.slice(0, 2).join(', ')} 패턴이 관찰됐어요.`
            : '더 많은 대화로 패턴이 보여요.',
          tags: patterns.slice(0, 3),
          mentionCount: row.mention_count ?? 0,
        };
      });
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 3,
  });

  // 6. 처음 분석 결과 (user_profiles)
  const diagnosisQuery = useQuery<DiagnosisResult>({
    queryKey: ['me-diagnosis', uid],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('user_profiles')
        .select('primary_mask, secondary_mask, axis_scores, priper_completed')
        .eq('user_id', uid!)
        .single();

      const profile = data as UserProfileRow | null;
      const axisScores = profile?.axis_scores;
      let parsedAxes: { axes: string[]; vals: number[] } | null = null;
      if (axisScores && typeof axisScores === 'object') {
        parsedAxes = {
          axes: ['애착', '소통', '욕구', '역할'],
          vals: [
            axisScores.attachment ?? 50,
            axisScores.communication ?? 44,
            axisScores.desire ?? 38,
            axisScores.role ?? 77,
          ],
        };
      }

      return {
        primaryMask: profile?.primary_mask ?? null,
        axisScores: parsedAxes,
        priperCompleted: !!profile?.priper_completed,
      };
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 10,
  });

  // 7. 주간 리포트 (user_psych_map_snapshots snapshot_type='weekly' 최신 1건)
  const weeklyQuery = useQuery({
    queryKey: ['me-weekly-report', uid],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('user_psych_map_snapshots')
        .select('snapshot_date, top_patterns, unresolved_conflicts, top_entities, current_goals, confidence_bands')
        .eq('user_id', uid!)
        .eq('snapshot_type', 'weekly')
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return null;
      const d = data as PsychSnapshotRow;
      const topPatterns = (d.top_patterns ?? []) as JsonItem[];
      const unresolvedConflicts = (d.unresolved_conflicts ?? []) as JsonItem[];
      const topEntities = (d.top_entities ?? []) as JsonItem[];
      const currentGoals = (d.current_goals ?? []) as JsonItem[];
      const bands = d.confidence_bands ?? {};
      return {
        weekOf: d.snapshot_date as string,
        patterns: topPatterns.map((p) => typeof p === 'string' ? p : p?.summary ?? ''),
        unresolved: unresolvedConflicts[0] ? (typeof unresolvedConflicts[0] === 'string' ? unresolvedConflicts[0] : unresolvedConflicts[0]?.description ?? null) : null,
        encouragement: currentGoals[0] ? (typeof currentGoals[0] === 'string' ? currentGoals[0] : currentGoals[0]?.text ?? null) : null,
        topEmotions: topEntities.map((e) => typeof e === 'string' ? { label: e, count: 0 } : { label: e?.label ?? '', count: e?.count ?? 0 }),
        signalCount: (bands as Record<string, unknown>)?.signal_count as number ?? 0,
      };
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 10,
  });

  return {
    stats: statsQuery.data ?? null,
    statsLoading: statsQuery.isLoading,

    personas: personasQuery.data ?? [],
    personasLoading: personasQuery.isLoading,

    radar: radarQuery.data ?? null,
    radarLoading: radarQuery.isLoading,

    report: reportQuery.data ?? null,
    reportLoading: reportQuery.isLoading,

    weeklyReport: weeklyQuery.data ?? null,
    weeklyReportLoading: weeklyQuery.isLoading,

    people: peopleQuery.data ?? [],
    peopleLoading: peopleQuery.isLoading,

    diagnosis: diagnosisQuery.data ?? null,
    diagnosisLoading: diagnosisQuery.isLoading,
  };
}
