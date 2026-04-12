/**
 * C4 — 클라이언트 사이드 민감 데이터 암호화 유틸
 *
 * Web Crypto API (AES-GCM 256) 기반.
 * 암호화 키는 사용자 ID + 세션 기반 파생 — 서버에 키를 전송하지 않음.
 *
 * 사용 범위:
 * - localStorage에 저장되는 대화 히스토리
 * - 세션 임시 스냅샷
 *
 * 주의: DB 저장 데이터는 Supabase 전송 암호화(TLS)에 의존.
 *       필드 레벨 암호화가 필요한 경우 Edge Function에서 처리 권장.
 */

const ALGO = 'AES-GCM';
const KEY_LEN = 256;

/** 사용자 ID + 유저별 동적 솔트로 AES-GCM 키를 파생합니다
 *  솔트 = userId 앞 8자리 역전 + 고정 suffix → 유저마다 고유한 솔트
 */
async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const userSalt = userId.slice(0, 8).split('').reverse().join('') + '_veilor_v1';
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId + '_veilor_v1'),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(userSalt),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGO, length: KEY_LEN },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** 문자열을 AES-GCM으로 암호화하여 base64 문자열로 반환 */
export async function encryptText(plaintext: string, userId: string): Promise<string> {
  const key = await deriveKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);
  // iv(12B) + ciphertext를 합쳐 base64 인코딩
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/** base64 암호화 문자열을 복호화하여 원문 반환 */
export async function decryptText(cipherBase64: string, userId: string): Promise<string> {
  const key = await deriveKey(userId);
  const combined = Uint8Array.from(atob(cipherBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

/** JSON 직렬화 가능한 객체를 암호화 */
export async function encryptJSON<T>(data: T, userId: string): Promise<string> {
  return encryptText(JSON.stringify(data), userId);
}

/** 암호화된 문자열을 JSON으로 복호화 */
export async function decryptJSON<T>(cipherBase64: string, userId: string): Promise<T> {
  const text = await decryptText(cipherBase64, userId);
  return JSON.parse(text) as T;
}
