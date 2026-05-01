// IdentityTab — V-File mask display, MSK codes, axis scores, persona map, pattern analysis
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MASK_PROFILES, VFILE_CONTEXT_LABELS, classifyVProfile } from '@/lib/vfileAlgorithm';
import type { VFileContext } from '@/lib/vfileAlgorithm';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import RadarTimeCompare from './RadarTimeCompare';
import { useGetTranslations } from '@/hooks/useTranslation';

// V-File 가면명 → MSK 코드 역매핑 (DB에 한글 가면명이 저장된 경우)
const NAME_TO_MSK: Record<string, string> = {};
MASK_PROFILES.forEach(m => {
  NAME_TO_MSK[m.nameKo] = m.mskCode;
  NAME_TO_MSK[m.id] = m.mskCode;
});

// MSK 코드 → 카테고리 (predatory/prey는 코드로 고정)
const MSK_CATEGORY: Record<string, 'predatory' | 'prey'> = {
  PWR: 'predatory', NRC: 'predatory', SCP: 'predatory', MKV: 'predatory', MNY: 'predatory', PSP: 'predatory',
  EMP: 'prey', GVR: 'prey', APV: 'prey', DEP: 'prey', AVD: 'prey', SAV: 'prey',
};

interface IdentityTabProps {
  primaryMask: string | null;
  axisScores: Record<string, number> | null;
  pp: Record<string, unknown> | null;
  isPro: boolean;
  tryAccess: (feature: string) => void;
  totalSessions: number;
  ventCount: number;
  digCount: number;
  setCount: number;
  topEmotions: [string, number][];
  topDomain: { domain: string; cnt: number } | undefined;
  recentKeywords: string[];
  signalTotal: number;
}

function ReanalysisHistory({ userId, currentScores, currentMask, id }: {
  userId: string | undefined;
  currentScores: Record<string, number> | null;
  currentMask: string | null;
  id: ReturnType<typeof useGetTranslations>['identity'];
}) {
  const { data: sessions } = useQuery({
    queryKey: ['priper-history', userId],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('priper_sessions')
        .select('axis_scores, primary_mask, msk_code, completed_at, context')
        .eq('user_id', userId!)
        .eq('is_completed', true)
        .eq('context', 'general')
        .order('completed_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!userId,
  });

  if (!sessions || sessions.length < 2 || !currentScores) return null;

  const prev = sessions[1];
  const prevScores = prev.axis_scores as Record<string, number> | null;
  if (!prevScores) return null;

  const diff = (key: string) => (currentScores[key] ?? 0) - (prevScores[key] ?? 0);

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{id.reanalysisCompare}</p>
        <span className="text-[10px] text-muted-foreground">
          {id.diagnosisCount.replace('{count}', String(sessions.length))}
        </span>
      </div>
      {prev.primary_mask && currentMask && prev.primary_mask !== currentMask && (
        <p className="text-sm">
          <span className="text-muted-foreground">{prev.primary_mask}</span>
          <span className="mx-2">→</span>
          <span className="font-semibold">{currentMask}</span>
        </p>
      )}
      <div className="space-y-1.5">
        {(['A', 'B', 'C', 'D'] as const).map(k => {
          const d = diff(k);
          return (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-muted-foreground">{id.axisLabels[k] ?? k}</span>
              <span className="w-6 text-right text-muted-foreground">{prevScores[k]}</span>
              <span className="mx-1">→</span>
              <span className="w-6 font-medium">{currentScores[k]}</span>
              <span className={`ml-auto font-medium ${d > 0 ? 'text-emerald-500' : d < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {d > 0 ? `+${d}` : d === 0 ? '±0' : d}
              </span>
            </div>
          );
        })}
      </div>
      {prev.completed_at && (
        <p className="text-[10px] text-muted-foreground">
          {id.prevDiagnosis.replace('{date}', new Date(prev.completed_at).toLocaleDateString())}
        </p>
      )}
    </div>
  );
}

export default function IdentityTab({
  primaryMask, axisScores, pp,
  totalSessions, ventCount, digCount, setCount,
  topEmotions, topDomain, recentKeywords, signalTotal,
}: IdentityTabProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const get = useGetTranslations();
  const id = get.identity;

  const resolveMask = (mask: string): { code: string; name: string; categoryKey: 'predatory' | 'prey' } | null => {
    let code = MSK_CATEGORY[mask] !== undefined ? mask : NAME_TO_MSK[mask];
    if (!code) return null;
    const category = MSK_CATEGORY[code];
    if (!category) return null;
    return { code, name: id.maskLabels[code] ?? code, categoryKey: category };
  };

  const { data: personas } = useQuery({
    queryKey: ['persona-profiles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('persona_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('rank_order', { ascending: true });
      return data ?? [];
    },
    enabled: !!user,
  });

  const contexts: VFileContext[] = ['general', 'social', 'secret'];

  const startDiagnosis = (ctx: VFileContext) => {
    navigate('/onboarding/vfile/questions', { state: { context: ctx, fromGet: true } });
  };

  return (
    <>
      {/* V-File 가면 + 기원 프로필 */}
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <p className="text-xs text-muted-foreground">{id.vfileTitle}</p>
        {(() => {
          const resolved = primaryMask ? resolveMask(primaryMask) : null;
          if (!resolved) return <p className="text-2xl font-bold">—</p>;
          const profile = MASK_PROFILES.find(m => m.mskCode === resolved.code);
          const isPredatory = resolved.categoryKey === 'predatory';
          return (
            <>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-2xl font-bold">{resolved.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                      {id.notFixedPattern}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/onboarding/vfile/questions', { state: { context: 'general', fromGet: true } })}
                    className="flex-shrink-0 text-[10px] text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors mt-1"
                  >
                    {id.reanalyze}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{resolved.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isPredatory ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {isPredatory ? id.maskLabels['_predatory'] ?? resolved.categoryKey : id.maskLabels['_prey'] ?? resolved.categoryKey}
                  </span>
                </div>
                {profile && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{profile.description}</p>
                )}
              </div>

              {/* 기원 심리 프로필 */}
              {profile && (
                <div className="space-y-2.5 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground">{id.originProfile}</p>
                  <div className="grid gap-2">
                    <div className="bg-muted/50 rounded-xl px-3.5 py-2.5 space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">{id.coreWound}</p>
                      <p className="text-xs font-medium">{profile.coreWound}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-3.5 py-2.5 space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">{id.coreFear}</p>
                      <p className="text-xs font-medium">{profile.coreFear}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-3.5 py-2.5 space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">{id.coreNeed}</p>
                      <p className="text-xs font-medium">{profile.coreNeed}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-3.5 py-2.5 space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">{id.genPath}</p>
                      <p className="text-xs font-medium">{profile.genPath}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/home/vent', {
                      state: {
                        originExplore: true,
                        systemPrompt: `사용자의 V-File 가면은 "${profile.nameKo}"(${profile.mskCode}, ${profile.category === 'predatory' ? '포식형' : '피식형'})입니다. 핵심 상처: "${profile.coreWound}", 핵심 두려움: "${profile.coreFear}", 생성 경로: "${profile.genPath}". 이 정보를 바탕으로 사용자가 이 가면이 어떤 경험에서 형성되었는지 스스로 탐색하도록 부드럽게 질문해 주세요. 판단하지 말고, 공감하면서 기원을 함께 찾아가세요.`,
                      },
                    })}
                    className="w-full text-xs text-center py-2.5 rounded-xl border border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                  >
                    {id.exploreWithAI}
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* 축 점수 */}
      {axisScores && (
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <p className="text-xs text-muted-foreground">{id.fourAxes}</p>
          <div className="space-y-2">
            {(Object.entries(axisScores) as [string, number][]).map(([axis, score]) => (
              <div key={axis} className="flex items-center gap-3">
                <span className="text-xs w-20 text-muted-foreground">{id.axisLabels[axis] ?? axis}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full">
                  <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${score}%` }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* V프로필 16유형 */}
      {axisScores && (
        <div className="bg-card border rounded-2xl p-5 space-y-2">
          <p className="text-xs text-muted-foreground">{id.vprofileType}</p>
          {(() => {
            const vp = classifyVProfile(axisScores as Record<string, number>);
            return (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono tracking-wider">{vp.code}</span>
                  <span className="text-xs text-muted-foreground">{vp.nameKo}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{vp.description}</p>
                <div className="flex gap-1.5 pt-1">
                  {(['A', 'B', 'C', 'D'] as const).map(k => (
                    <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full ${
                      vp.axes[k] === 'high' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {vp.axes[k] === 'high' ? (id.axisLabels[k] ?? k) + '↑' : (id.axisLabels[k] ?? k) + '↓'}
                    </span>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* #56 레이더 차트 시간 비교 + #60 페르소나 변화 추적 */}
      <RadarTimeCompare />

      {/* 애착 유형 */}
      {pp?.attachment_type && (
        <div className="bg-card border rounded-2xl p-5 space-y-1">
          <p className="text-xs text-muted-foreground">{id.attachmentType}</p>
          <p className="font-semibold">{id.attachmentLabels[pp.attachment_type as string] ?? pp.attachment_type}</p>
        </div>
      )}

      {/* Prime Perspective */}
      {pp?.perspective_text && (
        <div className="bg-card border rounded-2xl p-5 space-y-2">
          <p className="text-xs text-muted-foreground">{id.primePerspective}</p>
          <p className="font-semibold">{pp.perspective_text as string}</p>
        </div>
      )}

      {/* 세 개의 나 — 멀티페르소나 V-File */}
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{id.threePersonas}</p>
          <span className="text-xs text-muted-foreground">
            {id.personasComplete.replace('{count}', String(personas?.length ?? 0))}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{id.personasDesc}</p>
        <div className="space-y-2.5">
          {contexts.map((ctx) => {
            const ctxLabel = VFILE_CONTEXT_LABELS[ctx];
            const persona = personas?.find((p: Record<string, unknown>) => p.vfile_context === ctx);
            const resolved = persona ? resolveMask(persona.primary_mask ?? persona.msk_code) : null;

            return (
              <div key={ctx} className="bg-muted/50 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ctxLabel.icon}</span>
                    <span className="text-sm font-medium">{ctxLabel.ko}</span>
                  </div>
                  {resolved ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded" style={{ color: persona.color_hex }}>
                        {resolved.code}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: persona.color_hex }}>
                        {resolved.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => startDiagnosis(ctx)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      {ctx === 'general' ? id.reanalyze : id.startAnalysis}
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{ctxLabel.desc}</p>
                {resolved && persona.axis_scores && (
                  <div className="flex gap-3 pt-1">
                    {(Object.entries(persona.axis_scores) as [string, number][]).map(([axis, score]) => (
                      <div key={axis} className="flex-1 text-center">
                        <div className="h-1 bg-background rounded-full mb-1">
                          <div className="h-1 rounded-full" style={{ width: `${score}%`, backgroundColor: persona.color_hex }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{id.axisLabels[axis] ?? axis}</span>
                      </div>
                    ))}
                  </div>
                )}
                {resolved && (
                  <button
                    onClick={() => startDiagnosis(ctx)}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    {id.reanalyze}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 누적 신호 패턴 분석 */}
      {totalSessions > 0 && (
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{id.patternAnalysis}</p>
            <span className="text-xs font-medium text-primary">{id.totalInput.replace('{count}', String(totalSessions))}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ventCount > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center space-y-1">
                <p className="text-xl font-bold">{ventCount}</p>
                <p className="text-xs text-muted-foreground">{id.ventConversation}</p>
              </div>
            )}
            {digCount > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center space-y-1">
                <p className="text-xl font-bold">{digCount}</p>
                <p className="text-xs text-muted-foreground">{id.digExploration}</p>
              </div>
            )}
            {setCount > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center space-y-1">
                <p className="text-xl font-bold">{setCount}</p>
                <p className="text-xs text-muted-foreground">{id.setRecord}</p>
              </div>
            )}
          </div>
          {topEmotions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{id.frequentEmotions}</p>
              <div className="flex flex-wrap gap-1.5">
                {topEmotions.map(([emo, count]) => (
                  <span key={emo} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    {emo} <span className="opacity-60">{id.times.replace('{count}', String(count))}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {topDomain && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{id.repeatExploration}</p>
              <p className="text-sm font-medium">
                {topDomain.domain}
                <span className="text-xs text-muted-foreground font-normal ml-1">({id.timesExplored.replace('{count}', String(topDomain.cnt))})</span>
              </p>
            </div>
          )}
          {recentKeywords.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{id.recentKeywords}</p>
              <div className="flex flex-wrap gap-1.5">
                {recentKeywords.map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {signalTotal > 0 && (
            <p className="text-xs text-muted-foreground border-t pt-3">
              {id.signalAccumulated.replace('{count}', String(signalTotal))}
            </p>
          )}
        </div>
      )}

      {/* #8 재진단 시간 비교 */}
      <ReanalysisHistory userId={user?.id} currentScores={axisScores} currentMask={primaryMask} id={id} />

      <Button variant="outline" className="w-full" onClick={() => startDiagnosis('general')}>
        {id.priperReanalysis}
      </Button>
    </>
  );
}
