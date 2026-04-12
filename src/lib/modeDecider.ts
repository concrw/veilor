/**
 * Mode Decider — 코드가 대화 모드를 결정하고, Claude에게 명시적으로 전달
 * tab(현재 탭) + messageCount(대화 수) + riskLevel(위기 수준)을 기반으로 결정
 *
 * - held: 감정 수용 (vent 탭, 초기 대화)
 * - dig: 패턴 탐색 (dig 탭, 또는 vent에서 10턴 이상 + 위기 없음)
 * - get: 자기이해 (get 탭)
 * - set: 변화 실천 (set 탭)
 */

export type ConversationMode = 'held' | 'dig' | 'get' | 'set';

export interface ModeDecision {
  mode: ConversationMode;
  instruction: string;
}

const MODE_INSTRUCTIONS: Record<ConversationMode, string> = {
  held: '지금은 감정 수용 모드입니다. 사용자가 감정을 충분히 쏟아낼 수 있도록 깊이 들어주세요. 조언, 분석, 긍정적 재구성은 하지 마세요. 감정을 있는 그대로 인정하고 공감하는 것이 전부입니다.',
  dig: '지금은 패턴 탐색 모드입니다. 사용자가 반복되는 감정 패턴과 관계 역동의 뿌리를 스스로 발견하도록 도와주세요. 질문 위주로 진행하되, 결론을 먼저 말하지 마세요.',
  get: '지금은 자기이해 모드입니다. V-File 결과와 가면 구조를 바탕으로 사용자가 자신을 통찰하도록 도와주세요. 지적이고 차분하게, 판단 없이 진행하세요.',
  set: '지금은 변화 실천 모드입니다. 사용자가 새로운 관계 패턴을 구체적으로 설계하고 실천할 수 있도록 안내해 주세요. 구체적이고 실행 가능한 방향을 제시하세요.',
};

/**
 * 탭 + 대화 수 + 위기 수준을 기반으로 대화 모드를 결정합니다.
 */
export function decideMode(
  tab: string,
  messageCount: number,
  riskLevel: 'critical' | 'high' | 'medium' | 'none' = 'none',
): ModeDecision {
  // 위기 수준이 높으면 항상 held 모드
  if (riskLevel === 'critical' || riskLevel === 'high') {
    return { mode: 'held', instruction: MODE_INSTRUCTIONS.held };
  }

  let mode: ConversationMode;

  switch (tab) {
    case 'vent':
      // vent 탭에서 10턴 이상 + 위기 없음 → dig로 자연 전환 유도
      mode = messageCount >= 10 ? 'dig' : 'held';
      break;
    case 'dig':
      mode = 'dig';
      break;
    case 'get':
      mode = 'get';
      break;
    case 'set':
      mode = 'set';
      break;
    case 'me':
      // me 탭은 반성/회고 → dig 유사
      mode = 'dig';
      break;
    default:
      mode = 'held';
  }

  return { mode, instruction: MODE_INSTRUCTIONS[mode] };
}

/**
 * Mode Decider 결정을 시스템 프롬프트에 주입할 수 있는 형태로 반환
 */
export function getModeSystemSnippet(
  tab: string,
  messageCount: number,
  riskLevel: 'critical' | 'high' | 'medium' | 'none' = 'none',
): string {
  const { instruction } = decideMode(tab, messageCount, riskLevel);
  return `\n[현재 대화 모드 — 이 지침을 최우선으로 따르세요]\n${instruction}`;
}
