/**
 * C5 — 대화 히스토리 localStorage 영속성
 *
 * 새로고침/탭 이탈 시 진행 중인 대화를 복원.
 * 암호화 저장 (C4 cryptoUtils 사용).
 * 최대 보관: 24시간 또는 세션 완료 시 삭제.
 */

import { useCallback } from 'react';
import { encryptJSON, decryptJSON } from '@/lib/cryptoUtils';

interface StoredSession {
  emotion: string;
  msgs: Array<{ role: 'ai' | 'user'; text: string; tone?: string }>;
  msgCount: number;
  savedAt: number; // timestamp
}

const STORAGE_KEY_PREFIX = 'vr_chat_session_';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24시간

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function useLocalChatHistory(userId: string | undefined) {
  /** 현재 대화 상태를 localStorage에 암호화 저장 */
  const saveLocal = useCallback(
    async (session: Omit<StoredSession, 'savedAt'>) => {
      if (!userId || session.msgCount < 1) return;
      try {
        const payload: StoredSession = { ...session, savedAt: Date.now() };
        const encrypted = await encryptJSON(payload, userId);
        localStorage.setItem(storageKey(userId), encrypted);
      } catch {
        // 암호화 실패 시 조용히 무시 (비필수 기능)
      }
    },
    [userId],
  );

  /** localStorage에서 이전 세션 복원 (24시간 내) */
  const loadLocal = useCallback(async (): Promise<StoredSession | null> => {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(storageKey(userId));
      if (!raw) return null;
      const session = await decryptJSON<StoredSession>(raw, userId);
      // 만료 확인
      if (Date.now() - session.savedAt > MAX_AGE_MS) {
        localStorage.removeItem(storageKey(userId));
        return null;
      }
      return session;
    } catch {
      // 복호화 실패 (키 불일치 등) — 오염된 데이터 삭제
      localStorage.removeItem(storageKey(userId));
      return null;
    }
  }, [userId]);

  /** 세션 완료 또는 명시적 삭제 시 호출 */
  const clearLocal = useCallback(() => {
    if (!userId) return;
    localStorage.removeItem(storageKey(userId));
  }, [userId]);

  return { saveLocal, loadLocal, clearLocal };
}
