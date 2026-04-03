/**
 * Prompt injection 방어 유틸리티
 * 유저 입력을 Claude 프롬프트에 삽입하기 전에 살균합니다.
 */

/**
 * 유저 입력에서 프롬프트 인젝션 패턴을 제거/무력화합니다.
 * - 시스템 프롬프트 탈취 시도 차단
 * - 역할 전환 시도 차단
 * - 과도한 길이 제한
 */
export function sanitizeUserInput(input: string, maxLength = 2000): string {
  if (!input || typeof input !== "string") return "";

  let sanitized = input.slice(0, maxLength);

  // 1단계: leet speak 정규화 (0→O, 1→I, 3→E, @→A)
  const normalized = sanitized
    .replace(/[0Oo]/g, (c) => c === '0' ? 'O' : c)
    .replace(/1/g, 'I')
    .replace(/3/g, 'E')
    .replace(/@/g, 'A');

  // 2단계: 프롬프트 인젝션 패턴 무력화 (대소문자 무관)
  const injectionPatterns = [
    /\[?\s*(IGNORE|DISREGARD|FORGET|OVERRIDE)\s+(ALL\s+)?(PREVIOUS|ABOVE|PRIOR|EARLIER)\s+(INSTRUCTIONS?|PROMPTS?|RULES?|CONSTRAINTS?)\s*\]?/gi,
    /\[?\s*(SYSTEM|ADMIN|DEBUG|DEV)\s*(MODE|PROMPT|ACCESS|OVERRIDE)\s*\]?/gi,
    /\[?\s*(YOU\s+ARE\s+NOW|ACT\s+AS|PRETEND\s+TO\s+BE|SWITCH\s+TO)\s/gi,
    /\[?\s*(REVEAL|SHOW|DISPLAY|OUTPUT|PRINT)\s+(YOUR\s+)?(SYSTEM\s+)?(PROMPT|INSTRUCTIONS?|RULES?)\s*\]?/gi,
    /```\s*(system|prompt|instruction)/gi,
    // 간접 프롬프트 탈취 시도
    /what\s+(are|were)\s+your\s+(instructions?|rules?|prompts?|guidelines?)/gi,
    /summarize\s+your\s+(instructions?|system\s+prompt|rules?)/gi,
    /tell\s+me\s+(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/gi,
    // DAN / jailbreak 패턴
    /\bDAN\b.*?\b(mode|now|anything)\b/gi,
    /\bjailbreak\b/gi,
  ];

  // 원본 + 정규화 버전 둘 다에서 패턴 매칭
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, "[blocked]");
  }
  // leet speak 우회도 차단: 정규화 버전에서 매치되면 전체 경고
  let normalizedCheck = normalized;
  for (const pattern of injectionPatterns) {
    if (pattern.test(normalizedCheck)) {
      sanitized = "[blocked] " + sanitized.replace(/^.*$/m, '').trim();
      break;
    }
    pattern.lastIndex = 0; // regex reset
  }

  return sanitized.trim();
}

/**
 * 배열의 각 요소를 살균합니다.
 */
export function sanitizeArray(arr: unknown[], maxLength = 500): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === "string")
    .map((item) => sanitizeUserInput(item, maxLength));
}
