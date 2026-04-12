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
const _storageKey = (() => {
  try { return `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`; } catch { return undefined; }
})();

export const veilorDb = createClient<VeilorDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: _storageKey,
  },
  db: { schema: 'veilor' },
});