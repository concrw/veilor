import { useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { C } from '@/lib/colors';
import { supabase } from '@/integrations/supabase/client';
import { MonthlyReportData, PsychTrendPoint, OutcomeMetrics } from '@/types/persona';

const MonthlyReportCard = memo(function MonthlyReportCard({ userId, onTriggerUpgrade }: { userId: string; onTriggerUpgrade?: () => boolean }) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, error } = useQuery<MonthlyReportData>({
    queryKey: ['monthly-report', userId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('generate-monthly-report', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      return res.data as MonthlyReportData;
    },
    staleTime: 1000 * 60 * 30,
    enabled: !!userId,
  });

  const changeIcon = (v: number) => v > 0 ? '+' : '';
  const changeColor = (v: number) => v > 0 ? C.amberGold : v < 0 ? '#C08070' : C.text4;

  const now = new Date();
  const monthLabel = `${now.getMonth() + 1}월`;

  const summary = data?.monthly_summary;
  const comparison = data?.comparison;
  const chartData = data?.chart_data;
  const topPatterns = data?.top_patterns ?? [];
  const psychTrend = data?.psych_trend ?? [];
  const outcome = data?.outcome_metrics;

  // 4축 중 가장 큰 변화가 있는 축 찾기
  const psychHighlight = (() => {
    if (psychTrend.length < 2) return null;
    const first = psychTrend[0];
    const last = psychTrend[psychTrend.length - 1];
    const axes: { key: keyof PsychTrendPoint; label: string }[] = [
      { key: 'attachment', label: '애착' },
      { key: 'communication', label: '소통' },
      { key: 'desire', label: '욕구' },
      { key: 'role', label: '역할' },
    ];
    let maxDelta = 0;
    let maxAxis = axes[0];
    for (const a of axes) {
      const delta = Math.abs((last[a.key] as number) - (first[a.key] as number));
      if (delta > maxDelta) { maxDelta = delta; maxAxis = a; }
    }
    return { ...maxAxis, delta: (last[maxAxis.key] as number) - (first[maxAxis.key] as number) };
  })();

  return (
    <div
      onClick={() => {
        if (!expanded && onTriggerUpgrade) {
          // 상세 보기 시도 시 프리미엄 체크
          const allowed = onTriggerUpgrade();
          if (!allowed) return;
        }
        setExpanded(v => !v);
      }}
      className="vr-fade-in"
      style={{
        background: C.bg2,
        border: `1px solid ${expanded ? `${C.amberGold}44` : C.border}`,
        borderRadius: 14, padding: '14px 17px', cursor: 'pointer', transition: 'border-color .2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 99, border: `1px solid ${C.amberGold}33`, background: `${C.amberGold}08` }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.amberGold, display: 'block' }} />
          <span style={{ fontSize: 9, fontWeight: 400, color: C.amberGold }}>{monthLabel} 월간 리포트</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!expanded && onTriggerUpgrade && (
            <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 99, border: `1px solid ${C.amberGold}44`, color: C.amberGold, background: `${C.amberGold}08` }}>Pro</span>
          )}
          <span style={{ fontSize: 12, color: C.text5, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>›</span>
        </div>
      </div>

      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 15, color: C.text, marginBottom: 4, lineHeight: 1.4 }}>
        이번 달 활동 요약
      </p>

      {isLoading && <p style={{ fontSize: 11, fontWeight: 300, color: C.text4 }}>데이터를 불러오는 중...</p>}
      {error && <p style={{ fontSize: 11, fontWeight: 300, color: '#C08070' }}>리포트를 불러올 수 없어요.</p>}

      {summary && (
        <>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {[
              { label: 'Vent', value: `${summary.vent_count}회`, change: comparison?.vent },
              { label: 'Dig', value: `${summary.dig_count}회`, change: comparison?.dig },
              { label: 'Codetalk', value: `${summary.codetalk_days}일`, change: comparison?.codetalk },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '5px 8px' }}>
                <span style={{ fontSize: 9, fontWeight: 300, color: C.text4 }}>{item.label}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: C.text }}>{item.value}</span>
                {item.change !== undefined && item.change !== 0 && (
                  <span style={{ fontSize: 9, fontWeight: 400, color: changeColor(item.change) }}>
                    {changeIcon(item.change)}{item.change}%
                  </span>
                )}
              </div>
            ))}
          </div>

          {expanded && (
            <div onClick={e => e.stopPropagation()} style={{ paddingTop: 12, marginTop: 10, borderTop: `1px solid ${C.border2}` }}>
              {chartData && chartData.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text4, marginBottom: 8 }}>3개월 비교</p>
                  <div style={{ width: '100%', height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border2} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.text4 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: C.text4 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text2 }} />
                        <Legend wrapperStyle={{ fontSize: 9, color: C.text4 }} formatter={(value: string) => {
                          const labels: Record<string, string> = { vent: 'Vent', dig: 'Dig', codetalk: 'Codetalk' };
                          return labels[value] || value;
                        }} />
                        <Bar dataKey="vent" name="vent" fill={C.amber} radius={[3, 3, 0, 0]} barSize={14} />
                        <Bar dataKey="dig" name="dig" fill={C.frost} radius={[3, 3, 0, 0]} barSize={14} />
                        <Bar dataKey="codetalk" name="codetalk" fill={C.amberGold} radius={[3, 3, 0, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ── 3개월 심리 축 추이 차트 ── */}
              {psychTrend.length >= 3 ? (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text4, marginBottom: 4 }}>4축 심리 추이 (3개월)</p>
                  {psychHighlight && (
                    <p style={{ fontSize: 11, fontWeight: 300, color: psychHighlight.delta > 0 ? C.amberGold : '#C08070', marginBottom: 8, lineHeight: 1.4 }}>
                      가장 큰 변화: <span style={{ fontWeight: 500 }}>{psychHighlight.label}</span> {psychHighlight.delta > 0 ? '+' : ''}{psychHighlight.delta}pt
                    </p>
                  )}
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={psychTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border2} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.text4 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: C.text4 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text2 }}
                          formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = { attachment: '애착', communication: '소통', desire: '욕구', role: '역할' };
                            return [`${value}pt`, labels[name] || name];
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 9, color: C.text4 }} formatter={(value: string) => {
                          const labels: Record<string, string> = { attachment: '애착', communication: '소통', desire: '욕구', role: '역할' };
                          return labels[value] || value;
                        }} />
                        <Line type="monotone" dataKey="attachment" name="attachment" stroke={C.amber} strokeWidth={2} dot={{ r: 3, fill: C.amber }} />
                        <Line type="monotone" dataKey="communication" name="communication" stroke={C.frost} strokeWidth={2} dot={{ r: 3, fill: C.frost }} />
                        <Line type="monotone" dataKey="desire" name="desire" stroke={C.amberGold} strokeWidth={2} dot={{ r: 3, fill: C.amberGold }} />
                        <Line type="monotone" dataKey="role" name="role" stroke={C.amberDim} strokeWidth={2} dot={{ r: 3, fill: C.amberDim }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 14, padding: '12px 14px', background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 300, color: C.text4, lineHeight: 1.5 }}>
                    3개월 이상 사용 시 심리 축 비교 차트가 생겨요.
                  </p>
                </div>
              )}

              {topPatterns.length > 0 && (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text4, marginBottom: 6 }}>자주 나온 패턴 키워드</p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {topPatterns.map((kw, i) => (
                      <span key={i} style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 99,
                        border: `1px solid ${i === 0 ? `${C.amberGold}55` : C.border}`,
                        color: i === 0 ? C.amberGold : C.text3,
                        background: i === 0 ? `${C.amberGold}0D` : C.bg,
                        fontWeight: i === 0 ? 400 : 300,
                      }}>
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {topPatterns.length === 0 && !isLoading && (
                <p style={{ fontSize: 11, fontWeight: 300, color: C.text4, lineHeight: 1.5 }}>
                  아직 충분한 데이터가 없어요. Vent, Dig, Codetalk 탭을 사용하면 패턴이 나타나기 시작해요.
                </p>
              )}

              {/* ── 아웃컴 측정: V-File 진단 변화 ── */}
              {outcome && outcome.sessionCount >= 2 && outcome.axisChange && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border2}` }}>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text4, marginBottom: 8 }}>
                    성장 측정 ({outcome.sessionCount}회 진단)
                  </p>
                  {outcome.maskChanged && outcome.firstMask && outcome.latestMask && (
                    <p style={{ fontSize: 11, fontWeight: 300, color: C.text3, marginBottom: 8, lineHeight: 1.4 }}>
                      <span style={{ color: C.text5 }}>{outcome.firstMask}</span>
                      <span style={{ margin: '0 6px', color: C.text5 }}>→</span>
                      <span style={{ color: C.amberGold, fontWeight: 500 }}>{outcome.latestMask}</span>
                    </p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {['A', 'B', 'C', 'D'].map(k => {
                      const AXIS_KO: Record<string, string> = { A: '애착', B: '소통', C: '욕구표현', D: '역할' };
                      const delta = outcome.axisChange![k] ?? 0;
                      const color = delta > 0 ? C.amberGold : delta < 0 ? '#C08070' : C.text5;
                      return (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px' }}>
                          <span style={{ fontSize: 10, color: C.text4, flex: 1 }}>{AXIS_KO[k]}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color, fontFamily: "'Cormorant Garamond', serif" }}>
                            {delta > 0 ? `+${delta}` : delta === 0 ? '±0' : delta}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default MonthlyReportCard;
