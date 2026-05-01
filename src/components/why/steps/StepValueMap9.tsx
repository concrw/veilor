import { Button } from '@/components/ui/button';
import { useLanguageContext } from '@/context/LanguageContext';
import type { AnalysisResult } from '@/types/why';
import type { WhyM43Analysis } from '@/hooks/useM43WhyIntegration';

const S = {
  ko: {
    step: '9단계',
    title: '가치관 매핑',
    subtitle: '7개 프레임워크 렌즈를 통해 당신의 가치관 지도를 구성했습니다.',
    empty: '프레임워크별 가치관 매핑 결과가 아직 생성되지 않았습니다.',
    aiLabel: 'AI 제안 Prime Perspective',
    useThis: '이것으로 사용하고 완성하기',
    prev: '← 각인 연결',
    next: 'Prime Perspective 작성 →',
  },
  en: {
    step: 'Step 9',
    title: 'Value Mapping',
    subtitle: 'Your value map has been constructed through 7 framework lenses.',
    empty: 'Framework-based value mapping results have not been generated yet.',
    aiLabel: 'AI-suggested Prime Perspective',
    useThis: 'Use this and finalize',
    prev: '← Imprint connection',
    next: 'Write Prime Perspective →',
  },
};

interface StepValueMap9Props {
  m43Analysis: WhyM43Analysis | null;
  analysisResult: AnalysisResult | null;
  setPpText: (text: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepValueMap9({ m43Analysis, analysisResult, setPpText, onPrev, onNext }: StepValueMap9Props) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">{s.step}</p>
          <p className="font-semibold mt-0.5">{s.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {s.subtitle}
          </p>
        </div>

        {m43Analysis?.valueMap && m43Analysis.valueMap.length > 0 ? (
          <div className="space-y-3">
            {m43Analysis.valueMap.map((vm, i) => (
              <div key={i} className="border rounded-xl overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-primary">{vm.frameworkCode}</span>
                  <span className="text-sm font-medium">{vm.frameworkNameKo}</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{vm.userPattern}</p>
                  {vm.domains.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {vm.domains.map((d, j) => (
                        <span key={j} className="text-[10px] bg-primary/5 text-primary/80 px-1.5 py-0.5 rounded">
                          {d.code} {d.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              {s.empty}
            </p>
          </div>
        )}

        {analysisResult?.prime_perspective && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
            <p className="text-xs text-primary font-medium">{s.aiLabel}</p>
            <p className="text-sm leading-relaxed">{analysisResult.prime_perspective}</p>
            <Button size="sm" variant="outline" onClick={() => { setPpText(analysisResult.prime_perspective!); onNext(); }}>
              {s.useThis}
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onPrev}>{s.prev}</Button>
        <Button className="flex-1 h-11" onClick={onNext}>
          {s.next}
        </Button>
      </div>
    </div>
  );
}
