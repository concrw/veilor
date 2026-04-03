import { describe, it, expect } from 'vitest';

describe('Integration: barrel exports and cross-module checks', () => {
  describe('usePersonas barrel exports', () => {
    it('exports all 23 hooks', async () => {
      const personaExports = await import('@/hooks/usePersonas');
      const hookNames = Object.keys(personaExports).filter(k => k.startsWith('use'));
      expect(hookNames).toHaveLength(23);
    });

    it('exports core query hooks', async () => {
      const mod = await import('@/hooks/usePersonas');
      expect(mod.usePersonas).toBeDefined();
      expect(mod.useMainPersona).toBeDefined();
      expect(mod.useAccessiblePersonas).toBeDefined();
    });

    it('exports mutation hooks', async () => {
      const mod = await import('@/hooks/usePersonas');
      expect(mod.useDetectPersonas).toBeDefined();
      expect(mod.useUpdatePersona).toBeDefined();
      expect(mod.useSetActivePersona).toBeDefined();
    });
  });

  describe('colors module', () => {
    it('has alpha() function', async () => {
      const { alpha } = await import('@/lib/colors');
      expect(typeof alpha).toBe('function');
    });

    it('alpha() generates correct 8-digit hex', async () => {
      const { alpha, C } = await import('@/lib/colors');
      const result = alpha(C.amber, 0.1);
      // 0.1 * 255 = 25.5, rounded = 26, hex = '1a'
      expect(result).toMatch(/^#[0-9A-Fa-f]{8}$/);
      expect(result.startsWith(C.amber)).toBe(true);
    });

    it('alpha(hex, 1) appends ff', async () => {
      const { alpha } = await import('@/lib/colors');
      const result = alpha('#FF0000', 1);
      expect(result).toBe('#FF0000ff');
    });

    it('alpha(hex, 0) appends 00', async () => {
      const { alpha } = await import('@/lib/colors');
      const result = alpha('#FF0000', 0);
      expect(result).toBe('#FF000000');
    });

    it('all design token keys are present', async () => {
      const { C } = await import('@/lib/colors');
      const requiredKeys = [
        'bg', 'bg2', 'bg3', 'border', 'border2',
        'text', 'text2', 'text3', 'text4', 'text5',
        'amber', 'amberGold', 'amberDeep', 'amberDim', 'frost',
      ];
      for (const key of requiredKeys) {
        expect(C).toHaveProperty(key);
      }
    });
  });

  describe('why.ts constants', () => {
    it('STEP_LABELS has 11 entries', async () => {
      const { STEP_LABELS } = await import('@/types/why');
      expect(STEP_LABELS).toHaveLength(11);
    });

    it('TIMER_SECONDS is 600', async () => {
      const { TIMER_SECONDS } = await import('@/types/why');
      expect(TIMER_SECONDS).toBe(600);
    });
  });
});
