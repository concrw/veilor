// Get — 뿌리가 궁금하다
// 기능: V-File 기반 자기 구조 탐색 + Ikigai / 브랜드 정체성 / 멀티페르소나 (프리미엄)
// Social 도메인 선택 시 관심 영역 탐색(SocialInterestExplorer)으로 전환

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDomain } from '@/context/DomainContext';
import { useGetTranslations } from '@/hooks/useTranslation';
import SocialInterestExplorer from '@/components/get/SocialInterestExplorer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, veilorDb } from '@/integrations/supabase/client';
import { ErrorState } from '@/components/ErrorState';
import { toast } from '@/hooks/use-toast';
import { usePremiumTrigger } from '@/hooks/usePremiumTrigger';
import UpgradeModal from '@/components/premium/UpgradeModal';
import WhyFlow from '@/components/why/WhyFlow';
import IdentityTab from '@/components/get/IdentityTab';
import IkigaiTab from '@/components/get/IkigaiTab';
import BrandTab from '@/components/get/BrandTab';
import CoupleAnalysis from '@/components/couple/CoupleAnalysis';
import CommunityInlineEmbed from '@/components/community/CommunityInlineEmbed';

const GET_ACCENT = '#68D391';

type Tab = 'identity' | 'why' | 'ikigai' | 'brand' | 'couple';

export default function GetPage() {
  const { user, primaryMask, axisScores } = useAuth();
  const { domain } = useDomain();
  const qc = useQueryClient();
  const get = useGetTranslations();

  if (domain === 'social') {
    return (
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <SocialInterestExplorer />
      </div>
    );
  }
  const { isPro, modalOpen, activeTrigger, tryAccess, closeModal } = usePremiumTrigger();
  const [tab, setTab] = useState<Tab>('identity');

  // prime_perspectives 최신 레코드
  const { data: pp, isError: ppError, refetch: refetchPp } = useQuery({
    queryKey: ['prime-perspective', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.from('prime_perspectives')
        .select('*').eq('user_id', user!.id)
        .order('created_at', { ascending: false }).limit(1).single();
      return data;
    },
    enabled: !!user,
  });

  // 누적 패턴 집계
  const { data: patternSummary } = useQuery({
    queryKey: ['pattern-summary', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.rpc('get_user_pattern_summary', { p_user_id: user!.id });
      return data as {
        top_emotions: { emotion: string; cnt: number }[];
        top_domains: { domain: string; cnt: number }[];
        keywords: string[];
        vent_count: number; dig_count: number; set_count: number; signal_total: number;
      } | null;
    },
    enabled: !!user,
  });

  const ventCount = patternSummary?.vent_count ?? 0;
  const digCount = patternSummary?.dig_count ?? 0;
  const setCount = patternSummary?.set_count ?? 0;
  const totalSessions = ventCount + digCount + setCount;
  const topEmotions = (patternSummary?.top_emotions ?? []).slice(0, 3).map(e => [e.emotion, e.cnt] as [string, number]);
  const topDomain = (patternSummary?.top_domains ?? [])[0];
  const recentKeywords = (patternSummary?.keywords ?? []).slice(0, 5) as string[];

  // Ikigai state
  const [ikigaiEdit, setIkigaiEdit] = useState(false);
  const [ikigaiForm, setIkigaiForm] = useState({ love: '', good_at: '', world_needs: '', paid_for: '' });
  const [ikigaiAiLoading, setIkigaiAiLoading] = useState(false);
  const [ikigaiAiInsight, setIkigaiAiInsight] = useState('');

  const ikigaiSave = useMutation({
    mutationFn: async () => {
      const ikigai = {
        love: ikigaiForm.love.split('\n').filter(Boolean),
        good_at: ikigaiForm.good_at.split('\n').filter(Boolean),
        world_needs: ikigaiForm.world_needs.split('\n').filter(Boolean),
        paid_for: ikigaiForm.paid_for.split('\n').filter(Boolean),
        updated_at: new Date().toISOString(),
      };
      await veilorDb.from('prime_perspectives').upsert({ user_id: user!.id, ikigai }, { onConflict: 'user_id' });
    },
    onSuccess: () => {
      toast({ title: get.ikigai.savedToast });
      setIkigaiEdit(false);
      qc.invalidateQueries({ queryKey: ['prime-perspective', user?.id] });
    },
  });

  const handleIkigaiAiInsight = async () => {
    if (!isPro && !tryAccess('ikigai_design')) return;
    if (!ikigai) { toast({ title: get.ikigai.notYet, variant: 'destructive' }); return; }
    setIkigaiAiLoading(true); setIkigaiAiInsight('');
    try {
      const { data, error } = await supabase.functions.invoke('generate-ikigai', { body: {} });
      if (error) throw error;
      if (data?.final_ikigai) setIkigaiAiInsight(data.final_ikigai);
      else if (data?.ikigai_intersections) setIkigaiAiInsight(`${data.ikigai_intersections.Passion?.join(', ') ?? ''}`);
      toast({ title: get.ikigai.aiInsight });
    } catch { toast({ title: get.brand.aiFailToast, description: get.brand.aiFailDesc, variant: 'destructive' }); }
    finally { setIkigaiAiLoading(false); }
  };

  // Brand state
  const [brandEdit, setBrandEdit] = useState(false);
  const [brandForm, setBrandForm] = useState({ name: '', tagline: '', core_value: '', target: '', tone: '' });
  const [brandAiLoading, setBrandAiLoading] = useState(false);

  const brandSave = useMutation({
    mutationFn: async () => {
      const brand_identity = { ...brandForm, updated_at: new Date().toISOString() };
      await veilorDb.from('prime_perspectives').upsert({ user_id: user!.id, brand_identity }, { onConflict: 'user_id' });
    },
    onSuccess: () => {
      toast({ title: get.brand.savedToast });
      setBrandEdit(false);
      qc.invalidateQueries({ queryKey: ['prime-perspective', user?.id] });
    },
  });

  const handleBrandAiGenerate = async () => {
    if (!isPro && !tryAccess('brand_identity')) return;
    setBrandAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-brand-strategy', {
        body: { ikigai: pp?.ikigai ?? null, whyAnalysis: pp?.perspective_text ? { prime_perspective: pp.perspective_text } : null, user: { email: user?.email } },
      });
      if (error) throw error;
      if (data?.brand_direction) {
        setBrandForm(prev => ({
          ...prev,
          tagline: data.brand_direction.positioning ?? prev.tagline,
          core_value: data.brand_direction.core_message ?? prev.core_value,
          target: data.target_audience?.age_range ?? prev.target,
          tone: data.brand_direction.field ?? prev.tone,
        }));
        setBrandEdit(true);
      }
      toast({ title: get.brand.aiCompleteToast });
    } catch { toast({ title: get.brand.aiFailToast, description: get.brand.aiFailDesc, variant: 'destructive' }); }
    finally { setBrandAiLoading(false); }
  };

  const ikigai = pp?.ikigai as Record<string, unknown> | null;
  const brand = pp?.brand_identity as Record<string, unknown> | null;

  const tabs: [Tab, string][] = [
    ['identity', get.tabs.identity],
    ['why', get.tabs.why],
    ['ikigai', get.tabs.ikigai],
    ['brand', get.tabs.brand],
    ['couple', get.tabs.couple],
  ];

  if (ppError) return <ErrorState title={get.errors.loadFailed} onRetry={() => refetchPp()} />;

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* PC 전용 좌측 탭 내비 */}
      <nav className="hidden lg:flex flex-col flex-shrink-0 py-6 px-3 border-r border-border" style={{ width: 140 }}>
        <p className="text-xs text-muted-foreground mb-4 px-2 tracking-wide">{get.header}</p>
        {tabs.map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-left px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors
              ${tab === t ? 'bg-card text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
            {label}
          </button>
        ))}
      </nav>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-5 max-w-3xl">
          <div>
            <h2 className="text-lg font-semibold">{get.header}</h2>
            <p className="text-sm text-muted-foreground mt-1">{get.subtitle}</p>
          </div>

          {/* 모바일 탭 바 */}
          <div className="lg:hidden bg-card border rounded-2xl p-1 flex">
            {tabs.map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors
                  ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'identity' && (
            <>
              <IdentityTab
                primaryMask={primaryMask} axisScores={axisScores} pp={pp}
                isPro={isPro} tryAccess={tryAccess}
                totalSessions={totalSessions} ventCount={ventCount} digCount={digCount} setCount={setCount}
                topEmotions={topEmotions} topDomain={topDomain} recentKeywords={recentKeywords}
                signalTotal={patternSummary?.signal_total ?? 0}
              />
              <CommunityInlineEmbed tab="get" accent={GET_ACCENT} />
            </>
          )}

          {tab === 'why' && <WhyFlow />}

          {tab === 'ikigai' && (
            <IkigaiTab
              isPro={isPro} tryAccess={tryAccess} ikigai={ikigai}
              ikigaiEdit={ikigaiEdit} ikigaiForm={ikigaiForm}
              ikigaiAiLoading={ikigaiAiLoading} ikigaiAiInsight={ikigaiAiInsight}
              ikigaiSavePending={ikigaiSave.isPending}
              onSetIkigaiEdit={setIkigaiEdit} onSetIkigaiForm={setIkigaiForm}
              onIkigaiSave={() => ikigaiSave.mutate()} onIkigaiAiInsight={handleIkigaiAiInsight}
            />
          )}

          {tab === 'brand' && (
            <BrandTab
              isPro={isPro} tryAccess={tryAccess} brand={brand}
              brandEdit={brandEdit} brandForm={brandForm}
              brandAiLoading={brandAiLoading} brandSavePending={brandSave.isPending}
              onSetBrandEdit={setBrandEdit} onSetBrandForm={setBrandForm}
              onBrandSave={() => brandSave.mutate()} onBrandAiGenerate={handleBrandAiGenerate}
            />
          )}

          {tab === 'couple' && <CoupleAnalysis />}
        </div>
      </div>

      <UpgradeModal open={modalOpen} onClose={closeModal} trigger={activeTrigger} />
    </div>
  );
}
