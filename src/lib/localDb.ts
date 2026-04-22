import Dexie, { type Table } from 'dexie';

// 오프라인 감정 체크인 레코드
export interface LocalCheckin {
  id?: number;
  userId: string;
  emotion: string;
  score: number;
  note?: string;
  createdAt: number;   // timestamp ms
  synced: boolean;
}

// 오프라인 채팅 히스토리 (AILeadOverlay)
export interface LocalChatMessage {
  id?: number;
  userId: string;
  sessionId: string;
  role: 'user' | 'ai';
  text: string;
  createdAt: number;
  synced: boolean;
}

class VeilorLocalDb extends Dexie {
  checkins!: Table<LocalCheckin>;
  chatMessages!: Table<LocalChatMessage>;

  constructor() {
    super('veilor-local');
    this.version(1).stores({
      checkins:     '++id, userId, synced, createdAt',
      chatMessages: '++id, userId, sessionId, synced, createdAt',
    });
  }
}

export const localDb = new VeilorLocalDb();

// ── 체크인 저장 (오프라인 우선) ──
export async function saveCheckinLocal(data: Omit<LocalCheckin, 'id' | 'synced'>) {
  return localDb.checkins.add({ ...data, synced: false });
}

// ── 미동기화 체크인 배치 조회 ──
export async function getPendingCheckins(userId: string): Promise<LocalCheckin[]> {
  return localDb.checkins.where({ userId, synced: false }).toArray();
}

// ── 동기화 완료 마킹 ──
export async function markCheckinSynced(id: number) {
  return localDb.checkins.update(id, { synced: true });
}

// ── 채팅 메시지 로컬 저장 ──
export async function saveChatMessageLocal(data: Omit<LocalChatMessage, 'id' | 'synced'>) {
  return localDb.chatMessages.add({ ...data, synced: false });
}

// ── 세션별 채팅 히스토리 조회 ──
export async function getChatHistory(userId: string, sessionId: string): Promise<LocalChatMessage[]> {
  return localDb.chatMessages
    .where({ userId, sessionId })
    .sortBy('createdAt');
}
