import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PersonaInstance, PatternProfile, PersonaContradiction, SignalSummary } from '@/types/persona';

interface PersonaInstanceRow {
  id: string;
  persona_label: string;
  persona_layer: string;
  activation_score: number | null;
  status: string | null;
  description: string | null;
  contributing_patterns: unknown;
  confidence_score: number;
  signal_count: number;
  detected_signals: unknown;
}

interface PatternProfileRow {
  id: string;
  pattern_axis: string;
  score: number;
  confidence: number;
  trend: string;
}

interface PersonaContradictionRow {
  id: string;
  persona_a_id: string;
  persona_b_id: string;
  contradiction_type: string;
  severity: number | null;
  description: string | null;
}

interface VentSignalRow {
  persona_id: string;
  text_snippet: string | null;
  emotion_tag: string | null;
  created_at: string;
}

interface DigSignalRow {
  persona_id: string;
  text_snippet: string | null;
  layer_tag: string | null;
  created_at: string;
}

export function usePersonaMapData(userId: string) {
  const [personas, setPersonas] = useState<PersonaInstance[]>([]);
  const [patterns, setPatterns] = useState<PatternProfile[]>([]);
  const [contradictions, setContradictions] = useState<PersonaContradiction[]>([]);
  const [signalSummaries, setSignalSummaries] = useState<SignalSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const [pRes, ptRes, cRes] = await Promise.all([
        supabase
          .from('persona_instances')
          .select('id, persona_label, persona_layer, activation_score, status, description, contributing_patterns, confidence_score, signal_count, detected_signals')
          .eq('user_id', userId),
        supabase
          .from('pattern_profiles')
          .select('id, pattern_axis, score, confidence, trend')
          .eq('user_id', userId),
        supabase
          .from('persona_contradictions')
          .select('id, persona_a_id, persona_b_id, contradiction_type, severity, description')
          .eq('user_id', userId),
      ]);
      if (cancelled) return;

      if (pRes.data) {
        const mapped = (pRes.data as PersonaInstanceRow[]).map(r => ({
          ...r,
          activation_score: r.activation_score ?? 0,
          status: r.status ?? 'active',
          contributing_patterns: Array.isArray(r.contributing_patterns) ? r.contributing_patterns : [],
          detected_signals: Array.isArray(r.detected_signals) ? r.detected_signals : [],
        }));
        setPersonas(mapped);

        const suppressedIds = mapped.filter(p => p.status === 'suppressed').map(p => p.id);
        if (suppressedIds.length > 0) {
          const [ventRes, digRes] = await Promise.all([
            supabase
              .from('vent_signals')
              .select('persona_id, text_snippet, emotion_tag, created_at')
              .eq('user_id', userId)
              .in('persona_id', suppressedIds)
              .order('created_at', { ascending: false })
              .limit(20),
            supabase
              .from('dig_signals')
              .select('persona_id, text_snippet, layer_tag, created_at')
              .eq('user_id', userId)
              .in('persona_id', suppressedIds)
              .order('created_at', { ascending: false })
              .limit(20),
          ]);
          if (!cancelled) {
            const summaryMap: Record<string, SignalSummary> = {};
            suppressedIds.forEach(id => { summaryMap[id] = { persona_id: id, vent_signals: [], dig_signals: [] }; });
            if (ventRes.data) {
              (ventRes.data as VentSignalRow[]).forEach(r => {
                if (summaryMap[r.persona_id]) {
                  summaryMap[r.persona_id].vent_signals.push({ text: r.text_snippet ?? '', emotion: r.emotion_tag ?? '', created_at: r.created_at });
                }
              });
            }
            if (digRes.data) {
              (digRes.data as DigSignalRow[]).forEach(r => {
                if (summaryMap[r.persona_id]) {
                  summaryMap[r.persona_id].dig_signals.push({ text: r.text_snippet ?? '', layer: r.layer_tag ?? '', created_at: r.created_at });
                }
              });
            }
            setSignalSummaries(Object.values(summaryMap));
          }
        }
      }
      if (ptRes.data) setPatterns(ptRes.data as PatternProfileRow[] as PatternProfile[]);
      if (cRes.data) setContradictions((cRes.data as PersonaContradictionRow[]).map(r => ({ ...r, severity: r.severity ?? 0 })));
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [userId]);

  const getSignalSummary = (personaId: string): SignalSummary | undefined =>
    signalSummaries.find(s => s.persona_id === personaId);

  return { personas, patterns, contradictions, signalSummaries, loading, getSignalSummary };
}
