import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { veilorDb } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
} from "recharts";

// ── 색상 팔레트 ─────────────────────────────────────────────────────
const COLORS = ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe","#f5f3ff","#4f46e5","#7c3aed","#9333ea","#c026d3","#e879f9"];
const MASK_LABELS: Record<string, string> = {
  APV: "어프루벌", DEP: "디펜던트", GVR: "기버",
  AVD: "어보이던트", EMP: "엠패스", PWR: "파워",
  SAV: "세이버", NRC: "나르시시스트", MKV: "마키아벨리",
  SCP: "소시오패스", PSP: "사이코패스", MNY: "머니",
};
const CONCERN_LABELS: Record<string, string> = {
  attachment_anxiety: "애착불안", power_dynamics: "권력구조",
  sexual_communication: "성적소통", pattern_repetition: "패턴반복",
  post_breakup: "이별후유증",
};
const RELATION_LABELS: Record<string, string> = {
  single: "싱글", dating: "연애중", married: "기혼", divorced: "이혼",
  separated: "별거", bereaved: "사별", non_romantic: "비연애", complicated: "복잡한관계",
};
const ATTACH_LABELS: Record<string, string> = {
  anxious: "불안형", avoidant: "회피형", secure: "안정형", disorganized: "혼란형",
};
const FRAGMENT_LABELS: Record<string, string> = {
  "순응하는 나": "순응하는 나", "억압된 욕망의 나": "억압된 욕망의 나",
  "감정에 묶인 나": "감정에 묶인 나", "안전을 원하는 나": "안전을 원하는 나",
  "과거를 안고 사는 나": "과거를 안고 사는 나",
};

// ── B2B 타입 ─────────────────────────────────────────────────────────
type B2BOrg = {
  id: string; org_name: string; org_type: string; plan: string;
  status: string; created_at: string; member_count: number;
};
type B2BCoachRow = {
  id: string; display_name: string; domains: string[]; status: string;
  avg_rating: number; session_count: number; current_members: number; max_members: number;
};
type B2BCheckinAgg = {
  week: string; avg_c: number; high_risk: number; medium_risk: number; total: number;
};

// ── 타입 ────────────────────────────────────────────────────────────
type Row = {
  id: string; seq: number; primary_concern: string; relationship_status: string;
  axis_attachment: number; axis_communication: number; axis_expression: number; axis_role: number;
  mask_type: string; attachment_type: string; fragment_count: number; session_count: number;
};

type GroupMembership = {
  user_id: string; group_code: string; source: string;
};

// ── 헬퍼 ────────────────────────────────────────────────────────────
function countBy<T>(arr: T[], key: (item: T) => string) {
  const map: Record<string, number> = {};
  arr.forEach(item => { const k = key(item); map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function avg(arr: number[]) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}

// ── 카드 ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/50 mb-1">{label}</p>
    <p className="text-2xl font-semibold text-white">{value}</p>
    {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
  </div>
);

// ── B2B 탭 컴포넌트 ─────────────────────────────────────────────────
function B2BTab() {
  const [orgs,    setOrgs]    = useState<B2BOrg[]>([]);
  const [coaches, setCoaches] = useState<B2BCoachRow[]>([]);
  const [checkinTrend, setCheckinTrend] = useState<B2BCheckinAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachForm, setCoachForm] = useState({ display_name: '', bio: '', domains: 'sports', max_members: 10 });
  const [saving, setSaving] = useState(false);
  const [coachMsg, setCoachMsg] = useState('');

  useEffect(() => { loadB2B(); }, []);

  const loadB2B = async () => {
    setLoading(true);
    const [{ data: orgData }, { data: coachData }, { data: ciData }] = await Promise.all([
      veilorDb.from('b2b_orgs').select('id,org_name,org_type,plan,status,created_at').order('created_at', { ascending: false }).limit(50),
      veilorDb.from('b2b_coaches').select('*').order('created_at', { ascending: false }),
      veilorDb.from('b2b_checkin_sessions')
        .select('created_at,risk_level,c_avg')
        .gte('created_at', new Date(Date.now() - 28 * 86400_000).toISOString())
        .order('created_at', { ascending: true }),
    ]);

    // 주간 체크인 집계
    const weekMap: Record<string, { total: number; sumC: number; high: number; medium: number }> = {};
    ((ciData ?? []) as { created_at: string; risk_level: string; c_avg: number }[]).forEach(r => {
      const week = new Date(r.created_at).toISOString().slice(0, 10).slice(0, 7) + '-W' +
        Math.ceil(new Date(r.created_at).getDate() / 7);
      if (!weekMap[week]) weekMap[week] = { total: 0, sumC: 0, high: 0, medium: 0 };
      weekMap[week].total++;
      weekMap[week].sumC += r.c_avg ?? 0;
      if (r.risk_level === 'high')   weekMap[week].high++;
      if (r.risk_level === 'medium') weekMap[week].medium++;
    });
    const trend = Object.entries(weekMap).map(([week, v]) => ({
      week, avg_c: Math.round((v.sumC / v.total) * 10) / 10,
      high_risk: v.high, medium_risk: v.medium, total: v.total,
    }));

    setOrgs((orgData ?? []) as B2BOrg[]);
    setCoaches((coachData ?? []) as B2BCoachRow[]);
    setCheckinTrend(trend);
    setLoading(false);
  };

  const handleCoachRegister = async () => {
    setSaving(true);
    setCoachMsg('');
    const { error } = await veilorDb.from('b2b_coaches').insert({
      display_name:    coachForm.display_name,
      bio:             coachForm.bio || null,
      domains:         [coachForm.domains],
      max_members:     coachForm.max_members,
      current_members: 0,
      session_count:   0,
      avg_rating:      0,
      status:          'active',
    });
    setSaving(false);
    if (error) { setCoachMsg(`오류: ${error.message}`); }
    else { setCoachMsg('코치 등록 완료'); setCoachForm({ display_name: '', bio: '', domains: 'sports', max_members: 10 }); loadB2B(); }
  };

  const toggleCoachStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active';
    await veilorDb.from('b2b_coaches').update({ status: next }).eq('id', id);
    loadB2B();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  const ORG_TYPE_LABELS: Record<string, string> = { sports: '스포츠', entertainment: '엔터테인먼트', corporate: '기업' };
  const PLAN_LABELS: Record<string, string> = { starter: '스타터', growth: '그로스', enterprise: '엔터프라이즈', trainee_basic: '트레이니 기본', trainee_full: '트레이니 풀' };

  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="전체 조직" value={`${orgs.length}개`} />
        <StatCard label="활성 조직" value={`${orgs.filter(o => o.status === 'active').length}개`} />
        <StatCard label="등록 코치" value={`${coaches.length}명`} sub={`활성 ${coaches.filter(c => c.status === 'active').length}명`} />
        <StatCard label="최근 4주 체크인" value={`${checkinTrend.reduce((a, b) => a + b.total, 0)}회`} />
      </div>

      {/* 4주 체크인 트렌드 */}
      {checkinTrend.length > 0 && (
        <Section title="최근 4주 체크인 트렌드" sub="주간 평균 4C 점수 및 위험 신호 건수">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={checkinTrend} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <XAxis dataKey="week" tick={{ fill: '#ffffff80', fontSize: 11 }} />
                <YAxis yAxisId="c" domain={[0, 10]} tick={{ fill: '#ffffff80', fontSize: 11 }} />
                <YAxis yAxisId="risk" orientation="right" tick={{ fill: '#ffffff80', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ffffff80' }} />
                <Line yAxisId="c" type="monotone" dataKey="avg_c" name="평균 4C" stroke="#6366f1" strokeWidth={2} dot />
                <Line yAxisId="risk" type="monotone" dataKey="high_risk" name="HIGH 위험" stroke="#ef4444" strokeWidth={1.5} dot />
                <Line yAxisId="risk" type="monotone" dataKey="medium_risk" name="MEDIUM 위험" stroke="#f59e0b" strokeWidth={1.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* 조직 목록 */}
      <Section title="B2B 조직 목록" sub="최근 가입 순">
        {orgs.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-6">등록된 조직이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs border-b border-white/10">
                  <th className="text-left py-2 pr-4">조직명</th>
                  <th className="text-left py-2 pr-4">분야</th>
                  <th className="text-left py-2 pr-4">플랜</th>
                  <th className="text-left py-2 pr-4">상태</th>
                  <th className="text-left py-2">가입일</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map(org => (
                  <tr key={org.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-4 font-medium">{org.org_name}</td>
                    <td className="py-2 pr-4 text-white/60">{ORG_TYPE_LABELS[org.org_type] ?? org.org_type}</td>
                    <td className="py-2 pr-4 text-white/60">{PLAN_LABELS[org.plan] ?? org.plan}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${org.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-2 text-white/40 text-xs">{org.created_at.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 코치 관리 */}
      <Section title="코치 관리" sub="코치 등록 및 활성화/비활성화">
        {/* 등록 폼 */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-white/80">새 코치 등록</p>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="이름 (표시명)"
              value={coachForm.display_name}
              onChange={e => setCoachForm(f => ({ ...f, display_name: e.target.value }))}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={coachForm.domains}
              onChange={e => setCoachForm(f => ({ ...f, domains: e.target.value }))}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
            >
              <option value="sports">스포츠</option>
              <option value="entertainment">엔터테인먼트</option>
              <option value="corporate">기업</option>
            </select>
            <input
              placeholder="한 줄 소개 (선택)"
              value={coachForm.bio}
              onChange={e => setCoachForm(f => ({ ...f, bio: e.target.value }))}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-indigo-500 md:col-span-2"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50">최대 담당 인원</label>
              <input
                type="number" min={1} max={50}
                value={coachForm.max_members}
                onChange={e => setCoachForm(f => ({ ...f, max_members: Number(e.target.value) }))}
                className="w-20 bg-white/10 rounded-lg px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleCoachRegister}
              disabled={saving || !coachForm.display_name}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm rounded-lg px-4 py-2 transition-colors"
            >
              {saving ? '등록 중...' : '등록'}
            </button>
          </div>
          {coachMsg && <p className="text-xs text-green-400">{coachMsg}</p>}
        </div>

        {/* 코치 목록 */}
        {coaches.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">등록된 코치가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {coaches.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{c.display_name}</p>
                  <p className="text-xs text-white/40">
                    {c.domains?.join(', ')} · {c.session_count}회 진행 · {c.current_members}/{c.max_members}명
                    {c.avg_rating > 0 && ` · ★ ${c.avg_rating.toFixed(1)}`}
                  </p>
                </div>
                <button
                  onClick={() => toggleCoachStatus(c.id, c.status)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    c.status === 'active'
                      ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                      : 'bg-white/10 text-white/40 hover:bg-green-500/20 hover:text-green-400'
                  }`}
                >
                  {c.status === 'active' ? '활성' : '비활성'}
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── 가상유저 활동 주입 탭 ─────────────────────────────────────────────
function VirtualInjectTab() {
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
      <Section title="오늘 활동 현황" sub={`기준일: ${today}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="오늘 커뮤니티 포스트" value={stats?.today_community ?? '-'} />
          <StatCard label="오늘 코드탁 엔트리" value={stats?.today_codetalk ?? '-'} />
          <StatCard label="전체 커뮤니티 포스트" value={stats?.total_community?.toLocaleString() ?? '-'} />
          <StatCard label="전체 코드탁 엔트리" value={stats?.total_codetalk?.toLocaleString() ?? '-'} />
        </div>
      </Section>

      <Section title="가상유저 활동 주입" sub="버튼을 누르면 가상유저들이 오늘 날짜에 불규칙한 시간으로 활동을 남깁니다">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 block mb-1.5">커뮤니티 포스트 수 (명)</label>
              <input
                type="number"
                min={1} max={200}
                value={communityCount}
                onChange={e => setCommunityCount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
              />
              <p className="text-xs text-white/30 mt-1">오늘 이미 활동한 유저는 자동 제외됩니다</p>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1.5">코드탁 엔트리 수 (명)</label>
              <input
                type="number"
                min={1} max={100}
                value={codetalkCount}
                onChange={e => setCodetalkCount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
              />
              <p className="text-xs text-white/30 mt-1">오늘 이미 작성한 유저는 자동 제외됩니다</p>
            </div>
          </div>

          <button
            onClick={handleInject}
            disabled={injecting}
            className="w-full py-3 rounded-xl text-sm font-medium transition-opacity"
            style={{
              background: injecting ? '#4f46e540' : '#4f46e5',
              color: '#fff',
              opacity: injecting ? 0.7 : 1,
            }}
          >
            {injecting ? '주입 중...' : `가상유저 활동 주입 (커뮤니티 ${communityCount}명 + 코드탁 ${codetalkCount}명)`}
          </button>

          {result && (
            <div className={`rounded-xl p-4 text-sm ${result.ok ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {result.ok ? (
                <div className="space-y-1">
                  <p className="font-medium text-green-400">주입 완료</p>
                  <p className="text-white/60">기준일: {result.date}</p>
                  <p className="text-white/60">커뮤니티: <span className="text-white">{result.community_inserted}건</span> 삽입 / {result.skipped_community}명 중복 제외</p>
                  <p className="text-white/60">코드탁: <span className="text-white">{result.codetalk_inserted}건</span> 삽입 / {result.skipped_codetalk}명 중복 제외</p>
                </div>
              ) : (
                <p className="text-red-400">오류: {result.error}</p>
              )}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fragments, setFragments] = useState<{ name_ko: string }[]>([]);
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b' | 'virtual'>('b2c');

  useEffect(() => {
    async function load() {
      const [{ data: vData }, { data: fData }, { data: mData }] = await Promise.all([
        supabase.from("admin_dashboard_stats" as never).select("*").limit(2000),
        supabase.from("persona_fragments" as never).select("name_ko"),
        supabase.from("user_group_memberships" as never).select("user_id,group_code,source").limit(5000),
      ]);
      setRows((vData as Row[]) || []);
      setFragments((fData as { name_ko: string }[]) || []);
      setMemberships((mData as GroupMembership[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const total = rows.length;
  const withSession = rows.filter(r => r.session_count > 0).length;

  // 멀티페르소나 분포
  const fragDist = [
    { name: "0개", value: rows.filter(r => r.fragment_count === 0).length },
    { name: "1개", value: rows.filter(r => r.fragment_count === 1).length },
    { name: "2개", value: rows.filter(r => r.fragment_count === 2).length },
    { name: "3개", value: rows.filter(r => r.fragment_count === 3).length },
    { name: "4개+", value: rows.filter(r => r.fragment_count >= 4).length },
  ];

  // 가면 12종 분포
  const maskDist = countBy(rows, r => MASK_LABELS[r.mask_type] || r.mask_type);

  // 핵심 고민 분포
  const concernDist = countBy(rows, r => CONCERN_LABELS[r.primary_concern] || r.primary_concern);

  // 관계 상태 분포
  const relationDist = countBy(rows, r => RELATION_LABELS[r.relationship_status] || r.relationship_status);

  // 애착 유형 분포
  const attachDist = countBy(rows, r => ATTACH_LABELS[r.attachment_type] || r.attachment_type || "미입력");

  // 페르소나 조각 분포
  const fragNameDist = countBy(fragments, f => f.name_ko);

  // 그룹 멤버십 집계
  const GROUP_CODES = ['APV','DEP','GVR','AVD','EMP','PWR','SAV','SCP'];
  const groupDist = GROUP_CODES.map(code => {
    const primary = memberships.filter(m => m.group_code === code && m.source === 'primary').length;
    const fragment = memberships.filter(m => m.group_code === code && m.source === 'fragment').length;
    return { name: MASK_LABELS[code] || code, primary, fragment, total: primary + fragment };
  }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);

  // 유저당 그룹 소속 수 분포
  const userGroupCount: Record<string, number> = {};
  memberships.forEach(m => { userGroupCount[m.user_id] = (userGroupCount[m.user_id] || 0) + 1; });
  const groupCountDist = [1,2,3,4,5].map(n => ({
    name: `${n}개`,
    value: Object.values(userGroupCount).filter(c => n === 5 ? c >= 5 : c === n).length,
  }));

  // 4축 평균
  const axisAvg = [
    { axis: "애착", value: avg(rows.map(r => r.axis_attachment).filter(Boolean)) },
    { axis: "소통", value: avg(rows.map(r => r.axis_communication).filter(Boolean)) },
    { axis: "욕구표현", value: avg(rows.map(r => r.axis_expression).filter(Boolean)) },
    { axis: "역할", value: avg(rows.map(r => r.axis_role).filter(Boolean)) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <p className="text-white/40 text-sm mt-1">Veilor 전체 현황</p>
        </div>
        <p className="text-white/30 text-xs">총 {total.toLocaleString()}명 기준</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-white/10">
        {([['b2c', 'B2C 유저 분석'], ['b2b', 'B2B 조직·코치'], ['virtual', '가상유저 활동']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'border-b-2 border-indigo-400 text-indigo-300'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'b2b' && <B2BTab />}
      {activeTab === 'virtual' && <VirtualInjectTab />}
      {activeTab === 'b2c' && (<>

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="전체 가상유저" value={`${total}명`} />
        <StatCard label="세션 보유" value={`${withSession}명`} sub={`${Math.round(withSession*100/total)}%`} />
        <StatCard
          label="멀티그룹 소속"
          value={`${Object.values(userGroupCount).filter(c => c >= 2).length}명`}
          sub="2개 이상 그룹 소속"
        />
        <StatCard
          label="평균 그룹 소속"
          value={(memberships.length / total).toFixed(1) + "개"}
          sub={`총 ${memberships.length}건`}
        />
      </div>

      {/* 멀티페르소나 분포 */}
      <Section title="페르소나 조각 보유 수 분포" sub="전체 회원 중 몇 개의 조각을 보유하는지">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fragDist} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#ffffff80", fontSize: 12 }} />
              <YAxis tick={{ fill: "#ffffff80", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]}>
                {fragDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {fragDist.map(d => (
            <div key={d.name} className="text-xs text-white/60">
              <span className="font-medium text-white">{d.name}</span>: {d.value}명 ({Math.round(d.value*100/total)}%)
            </div>
          ))}
        </div>
      </Section>

      {/* 그룹 멤버십 — primary + fragment 스택 */}
      <Section title="그룹 소속 분포 (멀티페르소나 반영)" sub="primary: mask_type 기준 / fragment: 페르소나 조각 기반 추가 소속">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupDist} layout="vertical" margin={{ left: 72, right: 16 }}>
              <XAxis type="number" tick={{ fill: "#ffffff80", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#ffffffb0", fontSize: 12 }} width={72} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#ffffff80" }} />
              <Bar dataKey="primary" name="Primary" stackId="a" fill="#6366f1" radius={[0,0,0,0]} />
              <Bar dataKey="fragment" name="Fragment" stackId="a" fill="#a78bfa" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {groupDist.map(d => (
            <div key={d.name} className="text-xs text-white/60">
              <span className="font-medium text-white">{d.name}</span>: 총 {d.total}명
              <span className="text-white/40"> (P:{d.primary} F:{d.fragment})</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 그룹 중복 소속 분포 */}
      <Section title="유저당 그룹 소속 수 분포" sub="멀티페르소나로 인해 복수 그룹 소속 가능">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupCountDist} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#ffffff80", fontSize: 12 }} />
              <YAxis tick={{ fill: "#ffffff80", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
              <Bar dataKey="value" name="유저 수" radius={[4,4,0,0]}>
                {groupCountDist.map((_, i) => <Cell key={i} fill={COLORS[i * 2]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 justify-center">
          {groupCountDist.filter(d => d.value > 0).map(d => (
            <div key={d.name} className="text-center">
              <p className="text-lg font-semibold text-indigo-300">{d.value}명</p>
              <p className="text-xs text-white/50">{d.name} 소속</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 2열 그리드 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 가면 12종 */}
        <Section title="가면 유형 분포 (12종)" sub="M43 MSK 프레임워크 기준">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maskDist} layout="vertical" margin={{ left: 60, right: 8 }}>
                <XAxis type="number" tick={{ fill: "#ffffff80", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#ffffffb0", fontSize: 12 }} width={60} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {maskDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* 애착 유형 */}
        <Section title="애착 유형 분포" sub="불안/회피/안정/혼란">
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attachDist} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  {attachDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* 핵심 고민 */}
        <Section title="핵심 고민 분포" sub="유저가 앱에 들어오는 주된 이유">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={concernDist} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#ffffff80", fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: "#ffffff80", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {concernDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* 관계 상태 */}
        <Section title="관계 상태 분포" sub="현재 어떤 관계에 있는지">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={relationDist} layout="vertical" margin={{ left: 60, right: 8 }}>
                <XAxis type="number" tick={{ fill: "#ffffff80", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#ffffffb0", fontSize: 12 }} width={60} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {relationDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* 페르소나 조각 5종 */}
      <Section title="페르소나 조각 분포 (5종)" sub="detect_persona_fragments 결과">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fragNameDist} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#ffffff80", fontSize: 11 }} angle={-15} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#ffffff80", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {fragNameDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* 4축 평균 레이더 */}
      <Section title="4축 점수 평균" sub="전체 유저 axis 평균값">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={axisAvg} cx="50%" cy="50%" outerRadius={90}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "#ffffffb0", fontSize: 13 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#ffffff40", fontSize: 10 }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 justify-center mt-2">
          {axisAvg.map(a => (
            <div key={a.axis} className="text-center">
              <p className="text-lg font-semibold text-indigo-300">{a.value}</p>
              <p className="text-xs text-white/50">{a.axis}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4축 분포 히스토그램 (10단위 버킷) */}
      <Section title="4축 점수 분포" sub="0~100 점수대별 유저 분포">
        <div className="grid md:grid-cols-2 gap-4">
          {(["axis_attachment","axis_communication","axis_expression","axis_role"] as const).map((axis, idx) => {
            const labels = ["애착", "소통", "욕구표현", "역할"];
            const buckets = Array.from({ length: 10 }, (_, i) => ({
              name: `${i*10}~`,
              value: rows.filter(r => r[axis] >= i*10 && r[axis] < (i+1)*10).length,
            }));
            return (
              <div key={axis}>
                <p className="text-xs text-white/50 mb-2">{labels[idx]}</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets} margin={{ top: 2, right: 4, bottom: 2, left: -16 }}>
                      <XAxis dataKey="name" tick={{ fill: "#ffffff60", fontSize: 9 }} />
                      <YAxis tick={{ fill: "#ffffff60", fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
                      <Bar dataKey="value" fill={COLORS[idx*2]} radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      </>)}
    </div>
  );
}

// ── 섹션 래퍼 ───────────────────────────────────────────────────────
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
