import { Button } from '@/components/ui/button';
import type { JobEntry } from '@/types/why';
import type { WhyM43Analysis } from '@/hooks/useM43WhyIntegration';

interface StepImprint8Props {
  jobs: JobEntry[];
  m43Analysis: WhyM43Analysis | null;
  onPrev: () => void;
  onNext: () => void;
}

export function StepImprint8({ jobs, m43Analysis, onPrev, onNext }: StepImprint8Props) {
  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">8단계</p>
          <p className="font-semibold mt-0.5">각인 순간 연결</p>
          <p className="text-xs text-muted-foreground mt-1">
            각 직업을 처음 알게 된 순간이 관계 심리 도메인과 어떻게 맞닿아 있는지 보여드립니다.
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
              각인 순간과 도메인 사이의 직접적 키워드 일치가 발견되지 않았습니다.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              이는 정상적이며, 더 깊은 탐색을 통해 연결이 드러날 수 있습니다.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">기록한 각인 순간들</p>
          {jobs.filter(j => j.first_memory).slice(0, 5).map((j, i) => (
            <div key={i} className="text-xs bg-muted/20 rounded-lg px-3 py-2">
              <span className="font-medium">{j.job_name}</span>
              <span className="text-muted-foreground"> — {(j.first_memory ?? '').slice(0, 60)}...</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onPrev}>← 도메인 분석</Button>
        <Button className="flex-1 h-11" onClick={onNext}>
          가치관 매핑 보기 →
        </Button>
      </div>
    </div>
  );
}
