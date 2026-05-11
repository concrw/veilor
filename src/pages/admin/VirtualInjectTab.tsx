import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { veilorDb } from "@/integrations/supabase/client";
import { StatCard, Section } from "./AdminComponents";
import { useT } from '@/i18n/useT';

// ─────────────────────────────────────────────
// 이중언어 문자열


export default function VirtualInjectTab() {
  const [communityCount, setCommunityCount] = useState(40);
  const [codetalkCount, setCodetalkCount] = useState(15);
  const [injecting, setInjecting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    date?: string;
    community_inserted?: number;
    codetalk_inserted?: number;
    skipped_community?: number;
    skipped_codetalk?: number;
    error?: string;
  } | null>(null);
  const [stats, setStats] = useState<{
    today_community: number;
    today_codetalk: number;
    total_community: number;
    total_codetalk: number;
  } | null>(null);
  const t = useT();
  const s = t.adminDomain.virtualInjectTab;

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const [{ count: tc }, { count: tct }, { count: ac }, { count: act }] = await Promise.all([
      veilorDb.from('community_posts').select('*', { count: 'exact', head: true })
        .gte('created_at', today + 'T00:00:00Z'),
      veilorDb.from('codetalk_entries').select('*', { count: 'exact', head: true })
        .gte('created_at', today + 'T00:00:00Z'),
      veilorDb.from('community_posts').select('*', { count: 'exact', head: true }),
      veilorDb.from('codetalk_entries').select('*', { count: 'exact', head: true }),
    ]);
    setStats({
      today_community: tc ?? 0,
      today_codetalk: tct ?? 0,
      total_community: ac ?? 0,
      total_codetalk: act ?? 0,
    });
  };

  const handleInject = async () => {
    setInjecting(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('inject-virtual-activity', {
        body: { community_count: communityCount, codetalk_count: codetalkCount },
      });
      if (error) throw error;
      setResult(data);
      await loadStats();
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Section title={s.todayActivityTitle} sub={`${s.dateLabel}${today}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label={s.todayCommPosts} value={stats?.today_community ?? '-'} />
          <StatCard label={s.todayCodetalkEntries} value={stats?.today_codetalk ?? '-'} />
          <StatCard label={s.totalCommPosts} value={stats?.total_community?.toLocaleString() ?? '-'} />
          <StatCard label={s.totalCodetalkEntries} value={stats?.total_codetalk?.toLocaleString() ?? '-'} />
        </div>
      </Section>

      <Section title={s.injectTitle} sub={s.injectSub}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 block mb-1.5">{s.commLabel}</label>
              <input
                type="number" min={1} max={200}
                value={communityCount}
                onChange={e => setCommunityCount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
              />
              <p className="text-xs text-white/30 mt-1">{s.commNote}</p>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1.5">{s.codetalkLabel}</label>
              <input
                type="number" min={1} max={100}
                value={codetalkCount}
                onChange={e => setCodetalkCount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
              />
              <p className="text-xs text-white/30 mt-1">{s.codetalkNote}</p>
            </div>
          </div>

          <button
            onClick={handleInject}
            disabled={injecting}
            className="w-full py-3 rounded-xl text-sm font-medium transition-opacity"
            style={{ background: injecting ? '#4f46e540' : '#4f46e5', color: '#fff', opacity: injecting ? 0.7 : 1 }}
          >
            {injecting ? s.injecting : s.injectBtn(communityCount, codetalkCount)}
          </button>

          {result && (
            <div className={`rounded-xl p-4 text-sm ${result.ok ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {result.ok ? (
                <div className="space-y-1">
                  <p className="font-medium text-green-400">{s.injectDone}</p>
                  <p className="text-white/60">{s.dateLabel}{result.date}</p>
                  <p className="text-white/60">{s.commResult(result.community_inserted ?? 0, result.skipped_community ?? 0)}</p>
                  <p className="text-white/60">{s.codetalkResult(result.codetalk_inserted ?? 0, result.skipped_codetalk ?? 0)}</p>
                </div>
              ) : (
                <p className="text-red-400">{s.errorPrefix}{result.error}</p>
              )}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
