import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {},
  veilrumDb: {
    rpc: mocks.rpc,
    from: mocks.from,
  },
}));

const { saveVentMessage, saveVentSummary, saveDigSignal, saveSetSignal, saveVentSessionSummary, saveVentPartialSession } =
  await import('@/hooks/useSignalPipeline');

describe('useSignalPipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Rebuild chain: from() → insert() → select() → single()
    mocks.from.mockReturnValue({ insert: mocks.insert, update: mocks.update });
    mocks.insert.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.update.mockReturnValue({ eq: mocks.eq });
  });

  describe('saveVentMessage', () => {
    it('calls append_vent_signal RPC with correct params', async () => {
      mocks.rpc.mockResolvedValue({
        data: { signal_id: 'sig-1', crisis_severity: 'none' },
        error: null,
      });

      const result = await saveVentMessage('user-1', 'happy', 'hello', 0);

      expect(mocks.rpc).toHaveBeenCalledWith('append_vent_signal', {
        p_user_id: 'user-1',
        p_emotion: 'happy',
        p_message: 'hello',
        p_turn_index: 0,
      });
      expect(result).toEqual({ signalId: 'sig-1', crisisSeverity: 'none' });
    });

    it('returns defaults on RPC error', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: { message: 'rpc failed' } });

      const result = await saveVentMessage('user-1', 'sad', 'test', 1);
      expect(result).toEqual({ signalId: null, crisisSeverity: 'none' });
    });

    it('handles crisis severity', async () => {
      mocks.rpc.mockResolvedValue({
        data: { signal_id: 'sig-2', crisis_severity: 'high' },
        error: null,
      });

      const result = await saveVentMessage('user-1', 'angry', 'help', 2);
      expect(result.crisisSeverity).toBe('high');
    });
  });

  describe('saveVentSummary', () => {
    it('calls append_vent_summary RPC', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: null });

      await saveVentSummary('user-1', 'calm', 'take a walk');

      expect(mocks.rpc).toHaveBeenCalledWith('append_vent_summary', {
        p_user_id: 'user-1',
        p_emotion: 'calm',
        p_suggestion: 'take a walk',
      });
    });
  });

  describe('saveDigSignal', () => {
    it('calls append_dig_signal RPC', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: null });

      await saveDigSignal('user-1', {
        situation: 'work',
        text: 'feeling stuck',
        matchedQuestion: 'Q1',
        domain: 'career',
        score: 0.8,
      });

      expect(mocks.rpc).toHaveBeenCalledWith('append_dig_signal', {
        p_user_id: 'user-1',
        p_situation: 'work',
        p_text: 'feeling stuck',
        p_matched_question: 'Q1',
        p_domain: 'career',
        p_score: 0.8,
      });
    });
  });

  describe('saveSetSignal', () => {
    it('calls append_set_signal RPC', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: null });

      await saveSetSignal('user-1', {
        keyword: 'empathy',
        dayNumber: 5,
        definition: 'understanding others',
      });

      expect(mocks.rpc).toHaveBeenCalledWith('append_set_signal', {
        p_user_id: 'user-1',
        p_keyword: 'empathy',
        p_day_number: 5,
        p_definition: 'understanding others',
      });
    });
  });

  describe('saveVentSessionSummary', () => {
    it('returns session id on RPC success', async () => {
      mocks.rpc.mockResolvedValue({ data: 'session-abc', error: null });

      const result = await saveVentSessionSummary(
        'user-1', 'grateful',
        [{ role: 'user', text: 'thanks' }],
        'keep going', 4,
      );

      expect(result).toBe('session-abc');
    });

    it('falls back to direct insert on RPC failure', async () => {
      mocks.rpc.mockResolvedValue({ data: null, error: { message: 'rpc fail' } });
      mocks.single.mockResolvedValue({ data: { id: 'fallback-id' }, error: null });
      mocks.eq.mockResolvedValue({ data: null, error: null });

      const result = await saveVentSessionSummary(
        'user-1', 'sad',
        [{ role: 'user', text: 'bad day' }],
        'rest well', 4,
      );

      expect(result).toBe('fallback-id');
      expect(mocks.from).toHaveBeenCalledWith('dive_sessions');
    });
  });

  describe('saveVentPartialSession', () => {
    it('returns null for zero turns', async () => {
      const result = await saveVentPartialSession('user-1', 'sad', [], 0);
      expect(result).toBeNull();
    });

    it('saves partial session for 1+ turns', async () => {
      mocks.single.mockResolvedValue({ data: { id: 'partial-id' }, error: null });

      const result = await saveVentPartialSession(
        'user-1', 'angry',
        [{ role: 'user', text: 'frustrated' }],
        2,
      );

      expect(result).toBe('partial-id');
      expect(mocks.from).toHaveBeenCalledWith('dive_sessions');
    });
  });
});
