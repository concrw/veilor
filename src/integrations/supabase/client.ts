import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { VeilorDatabase } from './veilor-types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

// Import the supabase client like this:
// import { supabase, veilorDb } from "@/integrations/supabase/client";

// storageKey 명시 — veilorDb와 동일 키 사용으로 세션 공유 보장
const STORAGE_KEY = (() => {
  try { return `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`; } catch { return undefined; }
})();

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: STORAGE_KEY,
  }
});

// Typed client for the veilor schema
// storageKey를 supabase와 동일하게 맞춰 localStorage 세션 공유
//
// veilorDb는 DB 전용이다 (veilorDb.auth를 쓰는 코드는 없다).
// 그런데 autoRefreshToken / detectSessionInUrl이 켜져 있으면 supabase 클라이언트와
// 같은 storageKey를 두고 각자 토큰 갱신·세션 감지를 수행해 onAuthStateChange가
// 중복 발화한다. 그 결과 syncOnboarding이 여러 번 겹쳐 실행되면서 나중에 도착한
// 응답이 앞선 상태를 덮어써, 로그인 후 홈이 무한 로딩에 빠졌다.
// 세션은 읽기만 하고(persistSession) 갱신은 supabase 클라이언트에 일임한다.
export const veilorDb = createClient<VeilorDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: STORAGE_KEY,
  },
  db: { schema: 'veilor' },
});