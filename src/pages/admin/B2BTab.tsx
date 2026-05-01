import { useEffect, useState } from "react";
import { veilorDb } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLanguageContext } from "@/context/LanguageContext";

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    statCards: {
      totalOrgs: '전체 조직',
      activeOrgs: '활성 조직',
      registeredCoaches: '등록 코치',
      activeCoachesSub: (n: number) => `활성 ${n}명`,
      recentCheckins: '최근 4주 체크인',
    },
    trendSection: { title: '최근 4주 체크인 트렌드', sub: '주간 평균 4C 점수 및 위험 신호 건수' },
    avgC: '평균 4C',
    highRisk: 'HIGH 위험',
    mediumRisk: 'MEDIUM 위험',
    orgSection: { title: 'B2B 조직 목록', sub: '최근 가입 순' },
    noOrgs: '등록된 조직이 없습니다.',
    orgTableHeaders: { name: '조직명', domain: '분야', plan: '플랜', status: '상태', createdAt: '가입일' },
    coachSection: { title: '코치 관리', sub: '코치 등록 및 활성화/비활성화' },
    newCoachTitle: '새 코치 등록',
    namePlaceholder: '이름 (표시명)',
    bioPlaceholder: '한 줄 소개 (선택)',
    maxMembersLabel: '최대 담당 인원',
    saving: '등록 중...',
    register: '등록',
    noCoaches: '등록된 코치가 없습니다.',
    coachSessionCount: (n: number) => `${n}회 진행`,
    coachMemberCount: (cur: number, max: number) => `${cur}/${max}명`,
    statusActive: '활성',
    statusInactive: '비활성',
    unitSuffix: '개',
    personSuffix: '명',
    timeSuffix: '회',
    orgTypeLabels: { sports: '스포츠', entertainment: '엔터테인먼트', corporate: '기업' } as Record<string, string>,
    planLabels: { starter: '스타터', growth: '그로스', enterprise: '엔터프라이즈', trainee_basic: '트레이니 기본', trainee_full: '트레이니 풀' } as Record<string, string>,
    domainOptions: [
      { value: 'sports',        label: '스포츠' },
      { value: 'entertainment', label: '엔터테인먼트' },
      { value: 'corporate',     label: '기업' },
    ],
    errorPrefix: '오류: ',
    coachRegistered: '코치 등록 완료',
  },
  en: {
    statCards: {
      totalOrgs: 'Total Organizations',
      activeOrgs: 'Active Organizations',
      registeredCoaches: 'Registered Coaches',
      activeCoachesSub: (n: number) => `${n} active`,
      recentCheckins: 'Check-ins (Last 4 Weeks)',
    },
    trendSection: { title: 'Check-in Trend (Last 4 Weeks)', sub: 'Weekly avg 4C score and risk signal count' },
    avgC: 'Avg 4C',
    highRisk: 'HIGH Risk',
    mediumRisk: 'MEDIUM Risk',
    orgSection: { title: 'B2B Organization List', sub: 'Most recently joined' },
    noOrgs: 'No organizations registered.',
    orgTableHeaders: { name: 'Name', domain: 'Domain', plan: 'Plan', status: 'Status', createdAt: 'Joined' },
    coachSection: { title: 'Coach Management', sub: 'Register and activate/deactivate coaches' },
    newCoachTitle: 'Register New Coach',
    namePlaceholder: 'Display name',
    bioPlaceholder: 'One-line bio (optional)',
    maxMembersLabel: 'Max assigned members',
    saving: 'Registering...',
    register: 'Register',
    noCoaches: 'No coaches registered.',
    coachSessionCount: (n: number) => `${n} sessions`,
    coachMemberCount: (cur: number, max: number) => `${cur}/${max}`,
    statusActive: 'Active',
    statusInactive: 'Inactive',
    unitSuffix: '',
    personSuffix: '',
    timeSuffix: '',
    orgTypeLabels: { sports: 'Sports', entertainment: 'Entertainment', corporate: 'Corporate' } as Record<string, string>,
    planLabels: { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise', trainee_basic: 'Trainee Basic', trainee_full: 'Trainee Full' } as Record<string, string>,
    domainOptions: [
      { value: 'sports',        label: 'Sports' },
      { value: 'entertainment', label: 'Entertainment' },
      { value: 'corporate',     label: 'Corporate' },
    ],
    errorPrefix: 'Error: ',
    coachRegistered: 'Coach registered',
  },
} as const;

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

export default function B2BTab() {
  const [orgs,    setOrgs]    = useState<B2BOrg[]>([]);
  const [coaches, setCoaches] = useState<B2BCoachRow[]>([]);
  const [checkinTrend, setCheckinTrend] = useState<B2BCheckinAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachForm, setCoachForm] = useState({ display_name: '', bio: '', domains: 'sports', max_members: 10 });
  const [saving, setSaving] = useState(false);
  const [coachMsg, setCoachMsg] = useState('');
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

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
    if (error) { setCoachMsg(`${s.errorPrefix}${error.message}`); }
    else { setCoachMsg(s.coachRegistered); setCoachForm({ display_name: '', bio: '', domains: 'sports', max_members: 10 }); loadB2B(); }
  };

  const toggleCoachStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active';
    await veilorDb.from('b2b_coaches').update({ status: next }).eq('id', id);
    loadB2B();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={s.statCards.totalOrgs} value={`${orgs.length}${s.unitSuffix}`} />
        <StatCard label={s.statCards.activeOrgs} value={`${orgs.filter(o => o.status === 'active').length}${s.unitSuffix}`} />
        <StatCard label={s.statCards.registeredCoaches} value={`${coaches.length}${s.personSuffix}`} sub={s.statCards.activeCoachesSub(coaches.filter(c => c.status === 'active').length)} />
        <StatCard label={s.statCards.recentCheckins} value={`${checkinTrend.reduce((a, b) => a + b.total, 0)}${s.timeSuffix}`} />
      </div>

      {checkinTrend.length > 0 && (
        <Section title={s.trendSection.title} sub={s.trendSection.sub}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={checkinTrend} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <XAxis dataKey="week" tick={{ fill: '#ffffff80', fontSize: 11 }} />
                <YAxis yAxisId="c" domain={[0, 10]} tick={{ fill: '#ffffff80', fontSize: 11 }} />
                <YAxis yAxisId="risk" orientation="right" tick={{ fill: '#ffffff80', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ffffff80' }} />
                <Line yAxisId="c" type="monotone" dataKey="avg_c" name={s.avgC} stroke="#6366f1" strokeWidth={2} dot />
                <Line yAxisId="risk" type="monotone" dataKey="high_risk" name={s.highRisk} stroke="#ef4444" strokeWidth={1.5} dot />
                <Line yAxisId="risk" type="monotone" dataKey="medium_risk" name={s.mediumRisk} stroke="#f59e0b" strokeWidth={1.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      <Section title={s.orgSection.title} sub={s.orgSection.sub}>
        {orgs.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-6">{s.noOrgs}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs border-b border-white/10">
                  <th className="text-left py-2 pr-4">{s.orgTableHeaders.name}</th>
                  <th className="text-left py-2 pr-4">{s.orgTableHeaders.domain}</th>
                  <th className="text-left py-2 pr-4">{s.orgTableHeaders.plan}</th>
                  <th className="text-left py-2 pr-4">{s.orgTableHeaders.status}</th>
                  <th className="text-left py-2">{s.orgTableHeaders.createdAt}</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map(org => (
                  <tr key={org.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-4 font-medium">{org.org_name}</td>
                    <td className="py-2 pr-4 text-white/60">{s.orgTypeLabels[org.org_type] ?? org.org_type}</td>
                    <td className="py-2 pr-4 text-white/60">{s.planLabels[org.plan] ?? org.plan}</td>
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

      <Section title={s.coachSection.title} sub={s.coachSection.sub}>
        <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-white/80">{s.newCoachTitle}</p>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder={s.namePlaceholder}
              value={coachForm.display_name}
              onChange={e => setCoachForm(f => ({ ...f, display_name: e.target.value }))}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={coachForm.domains}
              onChange={e => setCoachForm(f => ({ ...f, domains: e.target.value }))}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
            >
              {s.domainOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              placeholder={s.bioPlaceholder}
              value={coachForm.bio}
              onChange={e => setCoachForm(f => ({ ...f, bio: e.target.value }))}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-indigo-500 md:col-span-2"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50">{s.maxMembersLabel}</label>
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
              {saving ? s.saving : s.register}
            </button>
          </div>
          {coachMsg && <p className="text-xs text-green-400">{coachMsg}</p>}
        </div>

        {coaches.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">{s.noCoaches}</p>
        ) : (
          <div className="space-y-2">
            {coaches.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{c.display_name}</p>
                  <p className="text-xs text-white/40">
                    {c.domains?.join(', ')} · {s.coachSessionCount(c.session_count)} · {s.coachMemberCount(c.current_members, c.max_members)}
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
                  {c.status === 'active' ? s.statusActive : s.statusInactive}
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
