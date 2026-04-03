import { describe, it, expect } from 'vitest';
import { STEP_LABELS, TIMER_SECONDS } from '@/types/why';
import type { WhySession, JobEntry, AnalysisResult } from '@/types/why';

describe('why.ts types and constants', () => {
  it('STEP_LABELS has exactly 11 items', () => {
    expect(STEP_LABELS).toHaveLength(11);
  });

  it('TIMER_SECONDS is 600', () => {
    expect(TIMER_SECONDS).toBe(600);
  });

  it('WhySession requires all mandatory fields', () => {
    const session: WhySession = {
      id: 'session-1',
      status: 'completed',
      current_step: 10,
      timer_started_at: '2024-01-01T00:00:00Z',
      timer_ended_at: '2024-01-01T00:10:00Z',
      prime_perspective: 'Creative Builder',
      happy_patterns: { jobs: ['Artist'], keywords: ['color'] },
      pain_patterns: { jobs: ['Analyst'], keywords: ['stress'] },
      value_alignment: { creativity: 0.9 },
      completed_at: '2024-01-01T00:10:00Z',
    };
    expect(session).toBeDefined();
    expect(session.id).toBe('session-1');
    expect(session.current_step).toBe(10);
  });

  it('JobEntry category values are correct set', () => {
    const categories: (JobEntry['category'])[] = ['happy', 'pain', 'neutral', null];
    expect(categories).toContain('happy');
    expect(categories).toContain('pain');
    expect(categories).toContain('neutral');
    expect(categories).toContain(null);
  });

  it('AnalysisResult has happy_patterns and pain_patterns with jobs and keywords', () => {
    const result: AnalysisResult = {
      happy_patterns: { jobs: ['A', 'B'], keywords: ['x'] },
      pain_patterns: { jobs: ['C'], keywords: ['y', 'z'] },
      value_alignment: null,
    };
    expect(result.happy_patterns.jobs).toHaveLength(2);
    expect(result.pain_patterns.keywords).toHaveLength(2);
    expect(result.prime_perspective).toBeUndefined();
  });

  it('STEP_LABELS items are all non-empty strings', () => {
    for (const label of STEP_LABELS) {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
