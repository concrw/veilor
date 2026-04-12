import { describe, it, expect } from 'vitest';
import { detectCrisisLevel } from '@/lib/crisisDetect';

describe('detectCrisisLevel', () => {
  // ── 직접 위기 → critical ──────────────────────────────────────
  describe('직접 위기 표현 (critical)', () => {
    it.each([
      '너무 힘들어서 죽고싶어',
      '죽고 싶다는 생각이 들어',
      '자살 생각이 자꾸 나',
      '자해를 하고 싶어',
      '손목을 긋고 싶어',
      '손목 긋는 게 낫겠다',
      '약을 먹어버릴까',
      '약을 많이 먹으면 어떻게 될까',
      '뛰어내리고 싶어',
      '목을 매면 끝날 것 같아',
      '목매버릴까',
      '살고 싶지 않아',
      '살고싶지 않아요',
      '스스로 목숨을 끊고 싶어',
      '살려주세요 너무 힘들어',
      '칼로 베고 싶어',
      '베고 싶다는 생각이',
    ])('"%s" → critical', (text) => {
      expect(detectCrisisLevel(text)).toBe('critical');
    });
  });

  // ── 간접 위기 2개 이상 → critical ────────────────────────────
  describe('간접 위기 복합 (critical)', () => {
    it('간접 표현 2개 이상 조합 → critical', () => {
      expect(detectCrisisLevel('사라지고 싶고 더 이상 버틸 수 없어')).toBe('critical');
      expect(detectCrisisLevel('없어지고 싶어. 살 이유가 없어')).toBe('critical');
      expect(detectCrisisLevel('끝내고 싶어. 살아있는 게 고통이야')).toBe('critical');
      expect(detectCrisisLevel('태어나지 않았으면 아무도 그리워하지 않을 텐데')).toBe('critical');
      expect(detectCrisisLevel('내가 없어지면 다 편할 것 같아')).toBe('critical');
    });
  });

  // ── 간접 위기 1개 → high ─────────────────────────────────────
  describe('간접 위기 표현 (high)', () => {
    it.each([
      '그냥 사라지고 싶어',
      '없어지고 싶다는 생각만 해',
      '끝내고 싶어. 다 끝냈으면',
      '더 이상 버틸 수가 없을 것 같아',
      '마지막 대화가 될 것 같은 느낌',
      '살 이유를 못 찾겠어',
      '존재할 가치가 없는 것 같아',
      '태어나지 않았으면 좋았을 텐데',
      '못 버티겠어 진짜',
    ])('"%s" → high', (text) => {
      expect(detectCrisisLevel(text)).toBe('high');
    });
  });

  // ── 안전한 맥락 → none ───────────────────────────────────────
  describe('안전한 맥락 (none)', () => {
    it.each([
      '시험이 너무 어려워서 죽겠어',
      '웃겨 죽겠다',
      '배고파서 죽을 것 같아',
      '졸려서 죽겠어',
      '이 음식 죽이는 맛이야',
      '죽여주는 드라마야',
      '귀여워 죽겠다',
    ])('"%s" → none (관용적 표현)', (text) => {
      expect(detectCrisisLevel(text)).toBe('none');
    });

    it.each([
      '오늘 날씨가 좋아서 기분이 좋아',
      '어제 친구랑 영화 봤어',
      '밥 먹고 싶어',
      '주말에 뭐 할까',
      '',
      '안',
    ])('"%s" → none (일반 텍스트)', (text) => {
      expect(detectCrisisLevel(text)).toBe('none');
    });
  });

  // ── 짧은 텍스트 엣지 케이스 ──────────────────────────────────
  describe('엣지 케이스', () => {
    it('빈 문자열 → none', () => {
      expect(detectCrisisLevel('')).toBe('none');
    });

    it('2자 이하 → none', () => {
      expect(detectCrisisLevel('아')).toBe('none');
      expect(detectCrisisLevel('죽')).toBe('none');
    });

    it('대소문자 구분 없이 처리', () => {
      // 한국어는 대소문자 없으나 영문 혼합 시에도 none 반환 검증
      expect(detectCrisisLevel('나 OK야 그냥 지쳐서')).toBe('none');
    });

    it('공백 정규화 후 감지', () => {
      // 공백이 여러 개여도 감지
      expect(detectCrisisLevel('죽고   싶어')).toBe('critical');
    });
  });
});
