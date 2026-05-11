// #63 체험형 콘텐츠 3종 + #64 성적 소통 콘텐츠 Lv.4~5
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { useT } from '@/i18n/useT';

// content_items DB UUID 매핑 (veilor.content_items에 등록된 UUID)
const CONTENT_DB_IDS: Record<string, string> = {
  mirror:     'a1b2c3d4-0001-0000-0000-000000000001',
  letter:     'a1b2c3d4-0002-0000-0000-000000000002',
  timeline:   'a1b2c3d4-0003-0000-0000-000000000003',
  boundaries: 'a1b2c3d4-0004-0000-0000-000000000004',
  desire:     'a1b2c3d4-0005-0000-0000-000000000005',
};

// 콘텐츠별 연결 탭 매핑
const CONTENT_TO_TAB: Record<string, { tab: string }> = {
  mirror:     { tab: 'dig' },
  letter:     { tab: 'vent' },
  timeline:   { tab: 'dig' },
  boundaries: { tab: 'set' },
  desire:     { tab: 'vent' },
};

export default function ExperientialContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useT();
  const s = t.experientialContent;

  type ExperienceItem = typeof s.experiences[0];
  const [selected, setSelected] = useState<ExperienceItem | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  function recordCompletion(contentId: string) {
    if (!user) return;
    const dbId = CONTENT_DB_IDS[contentId];
    if (!dbId) return;
    veilorDb.from('content_consumption').insert({
      user_id: user.id,
      content_id: dbId,
      consumed_at: new Date().toISOString(),
      completion_rate: 1.0,
    }).then(({ error }) => { if (error) console.error('[content_consumption]', error); });
  }

  const filtered = levelFilter ? s.experiences.filter(e => e.level <= levelFilter) : s.experiences;

  if (selected) {
    return (
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{selected.title}</p>
          <button onClick={() => { setSelected(null); setCurrentStep(0); }} className="text-xs text-muted-foreground">{s.close}</button>
        </div>
        <p className="text-xs text-muted-foreground">{selected.desc}</p>
        <div className="space-y-2">
          {selected.steps.map((step, i) => (
            <div key={i} className={`flex gap-3 px-3 py-2.5 rounded-xl transition-all ${
              i === currentStep ? 'bg-primary/10 border border-primary/20' :
              i < currentStep ? 'bg-muted/30 opacity-60' : 'bg-muted/10 opacity-40'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                i < currentStep ? 'bg-primary text-white' : i === currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <p className="text-xs leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep === 0}
            className="flex-1 text-xs py-2 border rounded-lg disabled:opacity-30">{s.prev}</button>
          <button
            onClick={() => {
              if (currentStep === selected.steps.length - 1) {
                setCompleted(prev => [...prev, selected.id]);
                recordCompletion(selected.id);
              } else {
                setCurrentStep(prev => Math.min(selected.steps.length - 1, prev + 1));
              }
            }}
            className="flex-1 text-xs py-2 bg-primary text-white rounded-lg">
            {currentStep === selected.steps.length - 1 ? s.complete : s.next}
          </button>
        </div>

        {/* #6 콘텐츠→대화 연결 CTA */}
        {(currentStep === selected.steps.length - 1 || completed.includes(selected.id)) && (() => {
          const link = CONTENT_TO_TAB[selected.id];
          if (!link) return null;
          const tabRoutes: Record<string, string> = {
            vent: '/vent', dig: '/dig', set: '/set',
          };
          const route = tabRoutes[link.tab];
          if (!route) return null;
          const prompt = s.prompts[selected.id as keyof typeof s.prompts] ?? '';
          return (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-medium text-primary">{s.ctaTitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.ctaDesc}
              </p>
              <button
                onClick={() => navigate(route, { state: { prefillText: prompt } })}
                className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              >
                {link.tab === 'vent' ? s.ctaVent : link.tab === 'dig' ? s.ctaDig : s.ctaSet}
              </button>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{s.listTitle}</p>
        <div className="flex gap-1">
          {([null, 3, 5] as (number | null)[]).map(l => (
            <button key={l ?? 'all'} onClick={() => setLevelFilter(l)}
              className={`text-[10px] px-2 py-0.5 rounded-full ${levelFilter === l ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              {l === null ? s.filterAll : s.filterLv(l)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map(exp => (
          <button key={exp.id} onClick={() => setSelected(exp)}
            className="w-full bg-card border rounded-xl p-4 text-left hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{exp.type}</span>
                <span className="text-[10px] text-muted-foreground">Lv.{exp.level}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{exp.duration}</span>
            </div>
            <p className="text-sm font-medium">{exp.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{exp.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
