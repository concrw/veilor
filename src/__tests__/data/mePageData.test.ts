import { describe, it, expect } from 'vitest';
import { ZONES, TOTAL_ZONES, RADAR_DATA, PERSONAS, PEOPLE, FRIENDS, SEED_STAGES } from '@/data/mePageData';

describe('MePage Static Data', () => {
  describe('ZONES', () => {
    it('has 3 layer groups', () => {
      expect(ZONES).toHaveLength(3);
      expect(ZONES.map(z => z.layer)).toEqual(['social', 'daily', 'secret']);
    });

    it('all items have required fields', () => {
      for (const group of ZONES) {
        expect(group).toHaveProperty('layer');
        expect(group).toHaveProperty('title');
        expect(group).toHaveProperty('color');
        expect(group).toHaveProperty('items');
        for (const item of group.items) {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('desc');
          expect(typeof item.sensitive).toBe('boolean');
          expect(typeof item.defaultOn).toBe('boolean');
        }
      }
    });

    it('all item IDs are unique', () => {
      const ids = ZONES.flatMap(g => g.items.map(i => i.id));
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('TOTAL_ZONES matches actual count', () => {
      const actual = ZONES.reduce((sum, g) => sum + g.items.length, 0);
      expect(TOTAL_ZONES).toBe(actual);
    });
  });

  describe('RADAR_DATA', () => {
    it('has prev and now with matching axes', () => {
      expect(RADAR_DATA.prev.axes).toEqual(RADAR_DATA.now.axes);
      expect(RADAR_DATA.prev.vals).toHaveLength(4);
      expect(RADAR_DATA.now.vals).toHaveLength(4);
    });

    it('all values are 0-100 range', () => {
      for (const v of [...RADAR_DATA.prev.vals, ...RADAR_DATA.now.vals]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('PERSONAS', () => {
    it('has 4 personas with required fields', () => {
      expect(PERSONAS).toHaveLength(4);
      for (const p of PERSONAS) {
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('color');
        expect(p).toHaveProperty('zone');
        expect(p).toHaveProperty('desc');
        expect(p).toHaveProperty('tags');
        expect(p).toHaveProperty('conflict');
        expect(Array.isArray(p.tags)).toBe(true);
      }
    });
  });

  describe('PEOPLE', () => {
    it('has 4 people with required fields', () => {
      expect(PEOPLE).toHaveLength(4);
      for (const p of PEOPLE) {
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('rel');
        expect(p).toHaveProperty('pattern');
        expect(p).toHaveProperty('conflict');
        expect(p).toHaveProperty('tags');
      }
    });
  });

  describe('FRIENDS', () => {
    it('has entries with match percentages', () => {
      expect(FRIENDS.length).toBeGreaterThan(0);
      for (const f of FRIENDS) {
        expect(f).toHaveProperty('name');
        expect(f).toHaveProperty('match');
        expect(f.match).toMatch(/^\d+%$/);
      }
    });
  });

  describe('SEED_STAGES', () => {
    it('has ascending thresholds', () => {
      for (let i = 1; i < SEED_STAGES.length; i++) {
        expect(SEED_STAGES[i].threshold).toBeGreaterThan(SEED_STAGES[i - 1].threshold);
      }
    });
  });
});
