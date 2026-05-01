import { Button } from '@/components/ui/button';
import { useLanguageContext } from '@/context/LanguageContext';
import type { JobEntry } from '@/types/why';
import type { WhyM43Analysis } from '@/hooks/useM43WhyIntegration';

const S = {
  ko: {
    step: '8단계',
    title: '각인 순간 연결',
    subtitle: '각 직업을 처음 알게 된 순간이 관계 심리 도메인과 어떻게 맞닿아 있는지 보여드립니다.',
    noMatchMain: '각인 순간과 도메인 사이의 직접적 키워드 일치가 발견되지 않았습니다.',
    noMatchSub: '이는 정상적이며, 더 깊은 탐색을 통해 연결이 드러날 수 있습니다.',
    imprintSectionTitle: '기록한 각인 순간들',
    prev: '← 도메인 분석',
    next: '가치관 매핑 보기 →',
  },
  en: {
    step: 'Step 8',
    title: 'Imprint Moment Connection',
    subtitle: 'Shows how the moment you first learned about each career connects to relationship psychology domains.',
    noMatchMain: 'No direct keyword match was found between the imprint moment and domain.',
    noMatchSub: 'This is normal — connections may emerge through deeper exploration.',
    imprintSectionTitle: 'Recorded imprint moments',
    prev: '← Domain analysis',
    next: 'View value mapping →',
  },
};

interface StepImprint8Props {
  jobs: JobEntry[];
  m43Analysis: WhyM43Analysis | null;
  onPrev: () => void;
  onNext: () => void;
}

export function StepImprint8({ jobs, m43Analysis, onPrev, onNext }: StepImprint8Props) {
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

        {m43Analysis?.imprintConnections && m43Analysis.imprintConnections.length > 0 ? (
          <div className="space-y-3">
            {m43Analysis.imprintConnections.map((conn, i) => (
              <div key={i} className="bg-muted/30 border rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{conn.jobName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">{conn.domainCode}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono">{conn.frameworkCode}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{conn.connection}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {s.noMatchMain}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {s.noMatchSub}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{s.imprintSectionTitle}</p>
          {jobs.filter(j => j.first_memory).slice(0, 5).map((j, i) => (
            <div key={i} className="text-xs bg-muted/20 rounded-lg px-3 py-2">
              <span className="font-medium">{j.job_name}</span>
              <span className="text-muted-foreground"> — {(j.first_memory ?? '').slice(0, 60)}...</span>
            </div>
          ))}
        </div>
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
