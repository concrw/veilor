/**
 * Edge Function용 간단한 in-memory rate limiter.
 * Supabase Edge Functions는 요청 간 상태가 일부 유지되므로(warm instance),
 * 동일 인스턴스 내에서는 작동합니다.
 * 완벽하지 않지만 비용 폭탄의 1차 방어선 역할을 합니다.
 */

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

/**
 * 요청이 rate limit 내인지 확인합니다.
 * @param key 유저 ID 또는 IP
 * @param maxRequests 윈도우 내 최대 요청 수 (기본 10)
 * @param windowMs 윈도우 크기 ms (기본 60초)
 * @returns true이면 허용, false이면 차단
 */
export function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Rate limit 초과 시 반환할 Response를 생성합니다.
 */
export function rateLimitResponse(corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }),
    {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
