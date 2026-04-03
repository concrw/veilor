import { describe, it, expect } from 'vitest';
import { STEP_LABELS, TIMER_SECONDS } from '@/types/why';
import type { WhySession, JobEntry, AnalysisResult } from '@/types/why';

describe('WhySession types and constants', () => {
  describe('STEP_LABELS', () => {
    it('has 11 items', () => {
      expect(STEP_LABELS).toHaveLength(11);
    });

    it('starts with 준비 and ends with Prime Perspective', () => {
      expect(STEP_LABELS[0]).toBe('준비');
      expect(STEP_LABELS[10]).toBe('Prime Perspective');
    });

    it('contains all expected step names', () => {
      expect(STEP_LABELS).toContain('직업 브레인스토밍');
      expect(STEP_LABELS).toContain('행복/고통 분류');
      expect(STEP_LABELS).toContain('가치관 매핑');
    });
  });

  describe('TIMER_SECONDS', () => {
    it('is 600 (10 minutes)', () => {
      expect(TIMER_SECONDS).toBe(600);
    });
  });

  describe('WhySession interface', () => {
    it('has required fields in a valid object', () => {
      const session: WhySession = {
        id: 'test-id',
        status: 'active',
        current_step: 3,
        timer_started_at: null,
        timer_ended_at: null,
        prime_perspective: null,
        happy_patterns: null,
        pain_patterns: null,
        value_alignment: null,
        completed_at: null,
      };
      expect(session.id).toBe('test-id');
      expect(session.status).toBe('active');
      expect(session.current_step).toBe(3);
    });
  });

  describe('JobEntry interface', () => {
    it('supports correct category values', () => {
      const happyJob: JobEntry = {
        id: 'j1', job_name: 'Designer', definition: null,
        first_memory: null, category: 'happy', reason: null,
        has_experience: true, experience_note: null, sort_order: 1,
      };
      const painJob: JobEntry = {
        id: 'j2', job_name: 'Accountant', definition: null,
        first_memory: null, category: 'pain', reason: null,
        has_experience: false, experience_note: null, sort_order: 2,
      };
      const neutralJob: JobEntry = {
        id: 'j3', job_name: 'Teacher', definition: null,
        first_memory: null, category: 'neutral', reason: null,
        has_experience: false, experience_note: null, sort_order: 3,
      };
      expect(happyJob.category).toBe('happy');
      expect(painJob.category).toBe('pain');
      expect(neutralJob.category).toBe('neutral');
    });
  });

  describe('AnalysisResult interface', () => {
    it('has correct structure', () => {
      const result: AnalysisResult = {
        happy_patterns: { jobs: ['Designer'], keywords: ['creative'] },
        pain_patterns: { jobs: ['Accountant'], keywords: ['numbers'] },
        value_alignment: {},
        prime_perspective: 'creative explorer',
      };
      expect(result.happy_patterns.jobs).toHaveLength(1);
      expect(result.pain_patterns.keywords).toContain('numbers');
      expect(result.prime_perspective).toBe('creative explorer');
    });
  });
});
