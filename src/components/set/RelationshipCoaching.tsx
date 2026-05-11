// #37 RelationSHIP 12 코칭 + #40 관계 결론 착지 + #41 대화법/질문법 학습
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useT } from '@/i18n/useT';

type Section = 'coaching' | 'skills' | 'closure';

export default function RelationshipCoaching() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const t = useT();
  const s = t.relationshipCoaching;
  const [section, setSection] = useState<Section>('coaching');

  const { data: profile } = useQuery({
    queryKey: ['coaching-week', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('user_profiles')
        .select('coaching_week')
        .eq('user_id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const currentWeek = profile?.coaching_week ?? 0;

  const weekMutation = useMutation({
    mutationFn: async (week: number) => {
      await veilorDb
        .from('user_profiles')
        .update({ coaching_week: week })
        .eq('user_id', user!.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coaching-week', user?.id] }),
  });

  return (
    <div className="space-y-4">
      {/* 섹션 탭 */}
      <div className="flex gap-1 bg-muted rounded-lg p-0.5">
        {s.tabs.map(t => (
          <button key={t.key} onClick={() => setSection(t.key)}
            className={`flex-1 text-xs py-2 rounded-md transition-colors ${
              section === t.key ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* #37 12주 코칭 */}
      {section === 'coaching' && (
        <div className="space-y-3">
          <div className="bg-card border rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">WEEK {s.coaching[currentWeek].week}</p>
              <span className="text-[10px] text-muted-foreground">{currentWeek + 1}/12</span>
            </div>
            <h3 className="font-semibold">{s.coaching[currentWeek].title}</h3>
            <p className="text-xs text-muted-foreground">{s.coaching[currentWeek].topic}</p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-[10px] text-primary font-medium mb-1">{s.thisWeekPractice}</p>
              <p className="text-xs">{s.coaching[currentWeek].exercise}</p>
            </div>
          </div>
          <div className="h-1.5 bg-muted rounded-full">
            <div className="h-1.5 bg-primary rounded-full" style={{ width: `${((currentWeek + 1) / 12) * 100}%` }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => weekMutation.mutate(Math.max(0, currentWeek - 1))} disabled={currentWeek === 0 || weekMutation.isPending}
              className="flex-1 text-xs py-2 border rounded-lg disabled:opacity-30">{s.prevWeek}</button>
            <button onClick={() => weekMutation.mutate(Math.min(11, currentWeek + 1))} disabled={currentWeek === 11 || weekMutation.isPending}
              className="flex-1 text-xs py-2 bg-primary text-white rounded-lg disabled:opacity-30">{s.nextWeek}</button>
          </div>
        </div>
      )}

      {/* #41 대화법/질문법 */}
      {section === 'skills' && (
        <div className="space-y-2">
          {s.skills.map(skill => (
            <div key={skill.id} className="bg-card border rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium">{skill.title}</p>
              <p className="text-xs text-muted-foreground">{skill.desc}</p>
              <div className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground mb-0.5">{s.skillExample}</p>
                <p className="text-xs">{skill.example}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* #40 관계 결론 착지 */}
      {section === 'closure' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{s.closureSubtitle}</p>
          {s.closure.map(step => (
            <div key={step.step} className="bg-card border rounded-xl p-4 flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {step.step}
              </div>
              <div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
