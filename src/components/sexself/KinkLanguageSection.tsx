// KinkLanguageSection — 나의 성적 언어 결과 UI
// ANXIETY_FROZEN 시 전체 숨김, SHA < 40 시 수치심 안내 카드 추가 표시

import { C, alpha } from '@/lib/colors';
import type { KinkLanguageResult } from '@/lib/kinkLanguageAlgorithm';

interface Props {
  kinkResult: KinkLanguageResult;
  sha: number;
}

// Intensity(-1~+1) → 강도 바 색상
function intensityColor(intensity: number): string {
  if (intensity >= 0.5) return '#ef4444'; // red
  if (intensity >= 0.0) return '#f43f5e'; // rose
  return '#f59e0b'; // amber
}

export default function KinkLanguageSection({ kinkResult, sha }: Props) {
  if (kinkResult.isAnxietyFrozen) return null;

  const { roleLabel, kinkTags, summaryText, sexAxes } = kinkResult;
  const intensity = sexAxes.intensity;

  // 강도 바: -1 ~ +1 → 0% ~ 100%
  const barPercent = Math.round(((intensity + 1) / 2) * 100);
  const barColor = intensityColor(intensity);

  return (
    <div className="space-y-4">
      {/* 섹션 제목 */}
      <p className="text-xs uppercase tracking-widest" style={{ color: C.text4 }}>
        나의 성적 언어
      </p>

      {/* SHA 수치심 안내 카드 (SHA < 40) */}
      {sha < 40 && (
        <div
          className="rounded-xl p-4"
          style={{ background: alpha('#ec4899', 0.06), border: `1px solid ${alpha('#ec4899', 0.2)}` }}
        >
          <p className="text-xs font-medium mb-1.5" style={{ color: '#ec4899' }}>
            먼저 확인해 주세요
          </p>
          <p className="text-xs font-light leading-relaxed" style={{ color: C.text2 }}>
            수치심이 성적 탐색을 막고 있을 수 있어요. 아래 취향 언어는 참고용이며,
            판단 없이 나를 알아가는 첫 단계로 봐주세요.
            원하는 것을 원하는 것은 이상한 일이 아닙니다.
          </p>
        </div>
      )}

      {/* 역할 레이블 뱃지 */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: alpha(C.amber, 0.12), color: C.amber, border: `1px solid ${alpha(C.amber, 0.3)}` }}
        >
          {roleLabel}
        </span>
      </div>

      {/* 강도 스펙트럼 바 */}
      <div>
        <div className="flex justify-between text-[10px] mb-1" style={{ color: C.text4 }}>
          <span>Vanilla</span>
          <span>Edge Play</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: alpha(C.border, 0.6) }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${barPercent}%`, background: barColor }}
          />
        </div>
        <p className="text-[10px] mt-1 text-right" style={{ color: C.text4 }}>
          {kinkResult.intensityLabel}
        </p>
      </div>

      {/* 취향 언어 태그 3개 */}
      {kinkTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {kinkTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2.5 py-1 rounded-full"
              style={{ background: alpha(C.frost, 0.08), color: C.frost, border: `1px solid ${alpha(C.frost, 0.2)}` }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 종합 문장 */}
      <div
        className="rounded-xl p-4"
        style={{ background: C.bg2, border: `1px solid ${C.border}` }}
      >
        <p className="text-xs font-light leading-relaxed" style={{ color: C.text2 }}>
          {summaryText}
        </p>
      </div>
    </div>
  );
}
