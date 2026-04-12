import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
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

// ── 타입 ────────────────────────────────────────────────────────────
type Row = {
  id: string; seq: number; primary_concern: string; relationship_status: string;
  axis_attachment: number; axis_communication: number; axis_expression: number; axis_role: number;
  mask_type: string; attachment_type: string; fragment_count: number; session_count: number;
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

// ── 메인 ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fragments, setFragments] = useState<{ name_ko: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: vData } = await supabase
        .from("admin_dashboard_stats" as never)
        .select("*")
        .limit(2000);
      const { data: fData } = await supabase
        .from("persona_fragments" as never)
        .select("name_ko");
      setRows((vData as Row[]) || []);
      setFragments((fData as { name_ko: string }[]) || []);
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
          <p className="text-white/40 text-sm mt-1">Veilor 유저 현황 분석</p>
        </div>
        <p className="text-white/30 text-xs">총 {total.toLocaleString()}명 기준</p>
      </div>

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="전체 가상유저" value={`${total}명`} />
        <StatCard label="세션 보유" value={`${withSession}명`} sub={`${Math.round(withSession*100/total)}%`} />
        <StatCard
          label="멀티페르소나 보유"
          value={`${rows.filter(r => r.fragment_count >= 2).length}명`}
          sub="2개 이상"
        />
        <StatCard
          label="평균 페르소나 조각"
          value={(rows.reduce((s, r) => s + r.fragment_count, 0) / total).toFixed(1) + "개"}
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
