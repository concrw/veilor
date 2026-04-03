import { describe, it, expect } from 'vitest';
import { C } from '@/lib/colors';

describe('Veilrum Color Tokens', () => {
  it('exports all required color keys', () => {
    const requiredKeys = [
      'bg', 'bg2', 'bg3',
      'border', 'border2',
      'text', 'text2', 'text3', 'text4', 'text5',
      'amber', 'amberGold', 'amberDeep', 'amberDim',
      'frost',
    ];
    for (const key of requiredKeys) {
      expect(C).toHaveProperty(key);
    }
  });

  it('all values are valid hex colors', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const [key, value] of Object.entries(C)) {
      expect(value, `C.${key} should be a valid hex color`).toMatch(hexPattern);
    }
  });

  it('C is readonly (as const)', () => {
    expect(C.bg).toBe('#1C1917');
    expect(C.amber).toBe('#E0B48A');
    expect(C.frost).toBe('#95BDD6');
  });
});
