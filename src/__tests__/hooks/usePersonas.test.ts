import { describe, it, expect } from 'vitest';

// Test that the barrel re-export works correctly
import * as personaExports from '@/hooks/usePersonas';

describe('usePersonas barrel exports', () => {
  it('exports all persona query hooks', () => {
    expect(personaExports.usePersonas).toBeDefined();
    expect(personaExports.useAccessiblePersonas).toBeDefined();
    expect(personaExports.usePersona).toBeDefined();
    expect(personaExports.useMainPersona).toBeDefined();
    expect(personaExports.useHasMultiplePersonas).toBeDefined();
  });

  it('exports all persona mutation hooks', () => {
    expect(personaExports.useDetectPersonas).toBeDefined();
    expect(personaExports.useUpdatePersona).toBeDefined();
    expect(personaExports.useVerifyPersona).toBeDefined();
    expect(personaExports.useDeactivatePersona).toBeDefined();
    expect(personaExports.useSetActivePersona).toBeDefined();
  });

  it('exports persona relationship hooks', () => {
    expect(personaExports.usePersonaRelationships).toBeDefined();
    expect(personaExports.useAnalyzePersonaRelationships).toBeDefined();
  });

  it('exports persona ikigai hooks', () => {
    expect(personaExports.usePersonaIkigai).toBeDefined();
    expect(personaExports.useUpsertPersonaIkigai).toBeDefined();
  });

  it('exports branding strategy hooks', () => {
    expect(personaExports.useBrandingStrategy).toBeDefined();
    expect(personaExports.useSaveBrandingStrategy).toBeDefined();
  });

  it('exports milestone hooks', () => {
    expect(personaExports.usePersonaMilestones).toBeDefined();
    expect(personaExports.useAllMilestones).toBeDefined();
    expect(personaExports.useToggleMilestone).toBeDefined();
    expect(personaExports.useCreateMilestone).toBeDefined();
  });

  it('exports growth metric hooks', () => {
    expect(personaExports.useGrowthSummary).toBeDefined();
    expect(personaExports.usePersonaGrowthHistory).toBeDefined();
    expect(personaExports.useRecordGrowthMetric).toBeDefined();
  });

  it('exports exactly 22 hooks (no missing, no extra)', () => {
    const hookNames = Object.keys(personaExports).filter(k => k.startsWith('use'));
    expect(hookNames).toHaveLength(23);
  });
});
