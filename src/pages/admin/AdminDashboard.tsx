import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import B2BTab from "./B2BTab";
import VirtualInjectTab from "./VirtualInjectTab";
import { StatCard, Section } from "./AdminComponents";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import type { FunnelRow, DashboardRow as Row, GroupMembership } from "@/hooks/useAdminDashboardData";
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';
import { veilorDb } from "@/integrations/supabase/client";

interface AiInterestUser {
  user_id: string;
  display_name: string | null;
  email: string;
  joined_at: string;
  in_free_period: boolean;
  click_count: number;
  last_clicked_at: string;
  is_subscribed: boolean;
}

function AiInterestTab() {
  const [users, setUsers] = useState<AiInterestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    veilorDb
      .from('v_ai_interest_users' as never)
      .select('*')
      .then(({ data }) => {
        setUsers((data as AiInterestUser[]) ?? []);
        setLoading(false);
      });
  }, []);

  const sendNudge = useCallback(async (user: AiInterestUser) => {
    setSending(p => ({ ...p, [user.user_id]: true }));
    try {
      await veilorDb.functions.invoke('send-email', {
        body: {
          to: user.email,
          template: 'ai_subscription_nudge',
          data: { name: user.display_name ?? '' },
        },
      });
      setSent(p => ({ ...p, [user.user_id]: true }));
    } finally {
      setSending(p => ({ ...p, [user.user_id]: false }));
    }
  }, []);

  if (loading) return <div className="text-white/40 text-sm p-8">로딩 중...</div>;

  const unsub = users.filter(u => !u.is_subscribed);
  const subbed = users.filter(u => u.is_subscribed);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="bg-white/5 rounded-xl p-4 flex-1 text-center">
          <p className="text-2xl font-semibold text-amber-400">{unsub.length}</p>
          <p className="text-xs text-white/40 mt-1">미구독 관심 유저</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 flex-1 text-center">
          <p className="text-2xl font-semibold text-emerald-400">{subbed.length}</p>
          <p className="text-xs text-white/40 mt-1">이미 구독 중</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 flex-1 text-center">
          <p className="text-2xl font-semibold text-white">{users.length}</p>
          <p className="text-xs text-white/40 mt-1">전체 클릭 유저</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-left border-b border-white/10">
              <th className="pb-2 pr-4">유저</th>
              <th className="pb-2 pr-4">이메일</th>
              <th className="pb-2 pr-4 text-right">클릭 수</th>
              <th className="pb-2 pr-4">마지막 클릭</th>
              <th className="pb-2 pr-4">상태</th>
              <th className="pb-2">이메일 발송</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id} className="border-b border-white/5">
                <td className="py-2 pr-4 text-white/80">{u.display_name ?? '—'}</td>
                <td className="py-2 pr-4 text-white/50 font-mono text-xs">{u.email}</td>
                <td className="py-2 pr-4 text-right font-mono text-amber-400">{u.click_count}</td>
                <td className="py-2 pr-4 text-white/40 text-xs">
                  {new Date(u.last_clicked_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="py-2 pr-4">
                  {u.is_subscribed
                    ? <span className="text-xs text-emerald-400">구독 중</span>
                    : u.in_free_period
                    ? <span className="text-xs text-amber-400">무료 기간</span>
                    : <span className="text-xs text-red-400">미구독</span>}
                </td>
                <td className="py-2">
                  {u.is_subscribed ? (
                    <span className="text-xs text-white/20">불필요</span>
                  ) : sent[u.user_id] ? (
                    <span className="text-xs text-emerald-400">발송 완료</span>
                  ) : (
                    <button
                      onClick={() => sendNudge(u)}
                      disabled={sending[u.user_id]}
                      style={{ background: '#E0B48A', color: '#1C1917', borderRadius: 20, padding: '4px 12px', fontSize: 12, border: 'none', cursor: 'pointer', opacity: sending[u.user_id] ? 0.5 : 1 }}
                    >
                      {sending[u.user_id] ? '발송 중...' : '이메일 발송'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">AI 기능 클릭 기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 이중언어 문자열

const COLORS = ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe","#f5f3ff","#4f46e5","#7c3aed","#9333ea","#c026d3","#e879f9"];

function countBy<T>(arr: T[], key: (item: T) => string) {
  const map: Record<string, number> = {};
  arr.forEach(item => { const k = key(item); map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function avg(arr: number[]) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}


export default function AdminDashboard() {
  const { rows, fragments, memberships, funnel, loading } = useAdminDashboardData();
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b' | 'virtual' | 'ai_interest'>('b2c');
  const { language } = useLanguageContext();
  const t = useT();
  const s = t.adminDomain.dashboard;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const total = rows.length;
  const withSession = rows.filter(r => r.session_count > 0).length;

  const fragDist = s.fragCountLabels.map((name, idx) => ({
    name,
    value: idx < 4
      ? rows.filter(r => r.fragment_count === idx).length
      : rows.filter(r => r.fragment_count >= 4).length,
  }));

  const maskDist = countBy(rows, r => s.maskLabels[r.mask_type] || r.mask_type);
  const concernDist = countBy(rows, r => s.concernLabels[r.primary_concern] || r.primary_concern);
  const relationDist = countBy(rows, r => s.relationLabels[r.relationship_status] || r.relationship_status);
  const attachDist = countBy(rows, r => s.attachLabels[r.attachment_type] || r.attachment_type || s.attachUnknown);
  const fragNameDist = countBy(fragments, f => f.name_ko);

  const GROUP_CODES = ['APV','DEP','GVR','AVD','EMP','PWR','SAV','SCP'];
  const groupDist = GROUP_CODES.map(code => {
    const primary = memberships.filter(m => m.group_code === code && m.source === 'primary').length;
    const fragment = memberships.filter(m => m.group_code === code && m.source === 'fragment').length;
    return { name: s.maskLabels[code] || code, primary, fragment, total: primary + fragment };
  }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);

  const userGroupCount: Record<string, number> = {};
  memberships.forEach(m => { userGroupCount[m.user_id] = (userGroupCount[m.user_id] || 0) + 1; });
  const groupCountDist = [1,2,3,4,5].map((n, i) => ({
    name: s.fragCountLabels[i] ?? `${n}`,
    value: Object.values(userGroupCount).filter(c => n === 5 ? c >= 5 : c === n).length,
  }));

  const axisAvg = [
    { axis: s.axisLabels[0], value: avg(rows.map(r => r.axis_attachment).filter(Boolean)) },
    { axis: s.axisLabels[1], value: avg(rows.map(r => r.axis_communication).filter(Boolean)) },
    { axis: s.axisLabels[2], value: avg(rows.map(r => r.axis_expression).filter(Boolean)) },
    { axis: s.axisLabels[3], value: avg(rows.map(r => r.axis_role).filter(Boolean)) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{s.title}</h1>
          <p className="text-white/40 text-sm mt-1">{s.subtitle}</p>
        </div>
        <p className="text-white/30 text-xs">{s.totalSuffix(total.toLocaleString())}</p>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {s.tabs.map(({ key, label }) => (
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
      {activeTab === 'ai_interest' && (
        <Section title="AI 관심 유저 목록" sub="AI 기능 진입 시도 후 미구독 유저 — 이메일로 구독 안내 발송">
          <AiInterestTab />
        </Section>
      )}
      {activeTab === 'b2c' && (
        <div className="space-y-8">
          <Section title={s.sections.funnel.title} sub={s.sections.funnel.sub}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-left border-b border-white/10">
                    <th className="pb-2 pr-4">단계</th>
                    <th className="pb-2 pr-4 text-right">유저 수</th>
                    <th className="pb-2 text-right">{s.sections.funnel.convRate}</th>
                  </tr>
                </thead>
                <tbody>
                  {funnel.map((f, i) => {
                    const prev = funnel[i - 1]?.count ?? f.count;
                    const rate = prev > 0 ? Math.round((f.count / prev) * 100) : 100;
                    return (
                      <tr key={f.stage} className="border-b border-white/5">
                        <td className="py-2 pr-4 text-white/80">
                          <span className="text-white/40 text-xs mr-2">{f.stage}</span>
                          {language === 'en' ? f.label_en : f.label_ko}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-white">
                          {f.count.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          {i === 0 ? (
                            <span className="text-white/30 text-xs">—</span>
                          ) : (
                            <span className={`text-xs font-medium ${rate >= 60 ? 'text-green-400' : rate >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {rate}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label={s.statCards.totalVirtual} value={`${total}${s.userCountSuffix}`} />
            <StatCard label={s.statCards.withSession} value={`${withSession}${s.userCountSuffix}`} sub={`${Math.round(withSession*100/total)}%`} />
            <StatCard label={s.statCards.multiGroup} value={`${Object.values(userGroupCount).filter(c => c >= 2).length}${s.userCountSuffix}`} sub={s.statCards.multiGroupSub} />
            <StatCard label={s.statCards.avgGroup} value={(memberships.length / total).toFixed(1)} sub={s.statCards.avgGroupSuffix(memberships.length.toString())} />
          </div>

          <Section title={s.sections.fragDist.title} sub={s.sections.fragDist.sub}>
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
                  <span className="font-medium text-white">{d.name}</span>: {d.value}{s.userCountSuffix} ({Math.round(d.value*100/total)}%)
                </div>
              ))}
            </div>
          </Section>

          <Section title={s.sections.groupDist.title} sub={s.sections.groupDist.sub}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupDist} layout="vertical" margin={{ left: 72, right: 16 }}>
                  <XAxis type="number" tick={{ fill: "#ffffff80", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#ffffffb0", fontSize: 12 }} width={72} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
                  <Bar dataKey="primary" name="Primary" stackId="a" fill="#6366f1" radius={[0,0,0,0]} />
                  <Bar dataKey="fragment" name="Fragment" stackId="a" fill="#a78bfa" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {groupDist.map(d => (
                <div key={d.name} className="text-xs text-white/60">
                  <span className="font-medium text-white">{d.name}</span>: {d.total}{s.userCountSuffix}
                  <span className="text-white/40"> (P:{d.primary} F:{d.fragment})</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title={s.sections.groupCountDist.title} sub={s.sections.groupCountDist.sub}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupCountDist} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#ffffff80", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#ffffff80", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8 }} />
                  <Bar dataKey="value" name={s.userCountSuffix.trim() || 'Users'} radius={[4,4,0,0]}>
                    {groupCountDist.map((_, i) => <Cell key={i} fill={COLORS[i * 2]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
              {groupCountDist.filter(d => d.value > 0).map(d => (
                <div key={d.name} className="text-center">
                  <p className="text-lg font-semibold text-indigo-300">{d.value}{s.userCountSuffix}</p>
                  <p className="text-xs text-white/50">{s.sections.groupCountSuffix(d.name)}</p>
                </div>
              ))}
            </div>
          </Section>

          <div className="grid md:grid-cols-2 gap-6">
            <Section title={s.sections.maskDist.title} sub={s.sections.maskDist.sub}>
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

            <Section title={s.sections.attachDist.title} sub={s.sections.attachDist.sub}>
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

            <Section title={s.sections.concernDist.title} sub={s.sections.concernDist.sub}>
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

            <Section title={s.sections.relationDist.title} sub={s.sections.relationDist.sub}>
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

          <Section title={s.sections.fragNameDist.title} sub={s.sections.fragNameDist.sub}>
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

          <Section title={s.sections.axisAvg.title} sub={s.sections.axisAvg.sub}>
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

          <Section title={s.sections.axisDist.title} sub={s.sections.axisDist.sub}>
            <div className="grid md:grid-cols-2 gap-4">
              {(["axis_attachment","axis_communication","axis_expression","axis_role"] as const).map((axis, idx) => {
                const buckets = Array.from({ length: 10 }, (_, i) => ({
                  name: `${i*10}~`,
                  value: rows.filter(r => r[axis] >= i*10 && r[axis] < (i+1)*10).length,
                }));
                return (
                  <div key={axis}>
                    <p className="text-xs text-white/50 mb-2">{s.axisLabels[idx]}</p>
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
        </div>
      )}
      </div>
    </div>
  );
}
