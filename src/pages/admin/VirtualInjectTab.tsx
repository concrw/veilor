import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { veilorDb } from "@/integrations/supabase/client";
import { useLanguageContext } from "@/context/LanguageContext";

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    todayActivityTitle: '오늘 활동 현황',
    todayCommPosts: '오늘 커뮤니티 포스트',
    todayCodetalkEntries: '오늘 코드탁 엔트리',
    totalCommPosts: '전체 커뮤니티 포스트',
    totalCodetalkEntries: '전체 코드탁 엔트리',
    injectTitle: '가상유저 활동 주입',
    injectSub: '버튼을 누르면 가상유저들이 오늘 날짜에 불규칙한 시간으로 활동을 남깁니다',
    commLabel: '커뮤니티 포스트 수 (명)',
    commNote: '오늘 이미 활동한 유저는 자동 제외됩니다',
    codetalkLabel: '코드탁 엔트리 수 (명)',
    codetalkNote: '오늘 이미 작성한 유저는 자동 제외됩니다',
    injecting: '주입 중...',
    injectBtn: (commCount: number, codetalkCount: number) => `가상유저 활동 주입 (커뮤니티 ${commCount}명 + 코드탁 ${codetalkCount}명)`,
    injectDone: '주입 완료',
    dateLabel: '기준일: ',
    commResult: (inserted: number, skipped: number) => `커뮤니티: ${inserted}건 삽입 / ${skipped}명 중복 제외`,
    codetalkResult: (inserted: number, skipped: number) => `코드탁: ${inserted}건 삽입 / ${skipped}명 중복 제외`,
    errorPrefix: '오류: ',
  },
  en: {
    todayActivityTitle: "Today's Activity",
    todayCommPosts: "Today's Community Posts",
    todayCodetalkEntries: "Today's Codetalk Entries",
    totalCommPosts: 'Total Community Posts',
    totalCodetalkEntries: 'Total Codetalk Entries',
    injectTitle: 'Inject Virtual User Activity',
    injectSub: 'Clicking the button will have virtual users leave activity at irregular times today',
    commLabel: 'Community Posts (users)',
    commNote: 'Users who already posted today will be skipped',
    codetalkLabel: 'Codetalk Entries (users)',
    codetalkNote: 'Users who already posted today will be skipped',
    injecting: 'Injecting...',
    injectBtn: (commCount: number, codetalkCount: number) => `Inject Virtual Activity (Community ${commCount} + Codetalk ${codetalkCount})`,
    injectDone: 'Injection Complete',
    dateLabel: 'Date: ',
    commResult: (inserted: number, skipped: number) => `Community: ${inserted} inserted / ${skipped} duplicates skipped`,
    codetalkResult: (inserted: number, skipped: number) => `Codetalk: ${inserted} inserted / ${skipped} duplicates skipped`,
    errorPrefix: 'Error: ',
  },
} as const;

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/50 mb-1">{label}</p>
    <p className="text-2xl font-semibold text-white">{value}</p>
    {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
  </div>
);

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

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
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

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
