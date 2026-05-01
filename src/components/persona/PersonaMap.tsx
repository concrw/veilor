import { useState, memo } from 'react';
import { C } from '@/lib/colors';
import { usePersonaMapData } from '@/hooks/usePersonaMapData';
import { useLanguageContext } from '@/context/LanguageContext';
import type { PersonaInstance, PatternProfile, PersonaContradiction } from '@/types/persona';

const S = {
  ko: {
    mapTitle: '페르소나 맵',
    loading: '불러오는 중...',
    emptyTitle: '아직 발견된 페르소나가 없어요',
    emptyDesc: 'Vent, Dig, Codetalk에서 대화를 나누면\n패턴이 감지되고 페르소나가 생겨나요.',
    activeFmt: (active: number, suppressed: number, conflict: number) => {
      let s = `활성 ${active}개`;
      if (suppressed > 0) s += ` · 억압 후보 ${suppressed}개`;
      if (conflict > 0) s += ` · 충돌 ${conflict}개`;
      return s;
    },
    patternBasis: 'PatternProfile 기반',
    meBadge: '나',
    statusLabels: { active: '활성', dormant: '잠재', suppressed: '억압 후보' },
    conflict: '충돌',
    patternAxis: '패턴 축',
    activeness: '활성도',
    descLabel: '설명',
    suppressedCandidate: '억압된 자아 후보',
    suppressedDesc: '이 자아는 억눌려 있어요. 표현되지 못한 욕구나 감정이 숨어 있을 수 있어요.',
    detectedSignals: '감지된 시그널',
    signalSummary: '관련 시그널 요약',
    noContent: '(내용 없음)',
    conflictRelation: '충돌 관계',
    unknownPersona: '(알 수 없음)',
    contributingPatterns: '기여 패턴',
    confidence: '신뢰도',
    signalCount: '신호 수',
  },
  en: {
    mapTitle: 'Persona Map',
    loading: 'Loading...',
    emptyTitle: 'No personas discovered yet',
    emptyDesc: 'Chat in Vent, Dig, or Codetalk and\npatterns will be detected to form personas.',
    activeFmt: (active: number, suppressed: number, conflict: number) => {
      let s = `${active} active`;
      if (suppressed > 0) s += ` · ${suppressed} suppressed`;
      if (conflict > 0) s += ` · ${conflict} conflicts`;
      return s;
    },
    patternBasis: 'PatternProfile-based',
    meBadge: 'Me',
    statusLabels: { active: 'Active', dormant: 'Dormant', suppressed: 'Suppressed' },
    conflict: 'Conflict',
    patternAxis: 'Pattern Axis',
    activeness: 'Activeness',
    descLabel: 'Description',
    suppressedCandidate: 'Suppressed Self Candidate',
    suppressedDesc: 'This self is suppressed. There may be hidden unmet needs or emotions.',
    detectedSignals: 'Detected Signals',
    signalSummary: 'Related Signal Summary',
    noContent: '(no content)',
    conflictRelation: 'Conflict Relation',
    unknownPersona: '(unknown)',
    contributingPatterns: 'Contributing Patterns',
    confidence: 'Confidence',
    signalCount: 'Signal Count',
  },
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'active':
      return { border: `2px solid ${C.amberGold}`, background: `${C.amberGold}15`, color: C.amberGold, labelColor: C.text };
    case 'dormant':
      return { border: `2px dashed ${C.text4}`, background: `${C.text4}0A`, color: C.text4, labelColor: C.text3 };
    case 'suppressed':
      return { border: `2px dashed #C08070`, background: '#C080700A', color: '#C08070', labelColor: '#C08070' };
    default:
      return { border: `2px solid ${C.border}`, background: C.bg, color: C.text4, labelColor: C.text3 };
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) { case 'rising': return '↑'; case 'declining': return '↓'; default: return '→'; }
};

const getTrendColor = (trend: string) => {
  switch (trend) { case 'rising': return C.amberGold; case 'declining': return '#C08070'; default: return C.text4; }
};

const getNodePosition = (index: number, total: number) => {
  if (total <= 1) return { x: 50, y: 50 };
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  const radius = total <= 3 ? 28 : total <= 6 ? 32 : 35;
  return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
};

const PersonaMap = memo(function PersonaMap({ userId }: { userId: string }) {
  const { personas, patterns, contradictions, loading, getSignalSummary } = usePersonaMapData(userId);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  if (loading) {
    return (
      <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '17px 19px' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>{s.mapTitle}</span>
        <p style={{ fontSize: 11, color: C.text4, marginTop: 8, textAlign: 'center', padding: '20px 0' }}>{s.loading}</p>
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '17px 19px' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>{s.mapTitle}</span>
        <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px dashed ${C.border}`, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, color: C.text5 }}>?</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 300, color: C.text3, lineHeight: 1.5, marginBottom: 4 }}>{s.emptyTitle}</p>
          <p style={{ fontSize: 10, fontWeight: 300, color: C.text5, lineHeight: 1.4 }}>
            {s.emptyDesc.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
        </div>
      </div>
    );
  }

  const activeCount = personas.filter(p => p.status === 'active').length;
  const suppressedCount = personas.filter(p => p.status === 'suppressed').length;
  const contradictionCount = contradictions.length;
  const getRelatedContradictions = (personaId: string) =>
    contradictions.filter(ct => ct.persona_a_id === personaId || ct.persona_b_id === personaId);

  const selected = personas.find(p => p.id === selectedPersona);

  return (
    <>
      <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '17px 19px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>{s.mapTitle}</span>
            <p style={{ fontSize: 10, fontWeight: 300, color: C.text4, marginTop: 2 }}>
              {s.activeFmt(activeCount, suppressedCount, contradictionCount)}
            </p>
          </div>
          <span style={{ fontSize: 9, fontWeight: 300, color: C.text4 }}>{s.patternBasis}</span>
        </div>

        {/* Cluster visualization */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', marginBottom: 12 }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, borderRadius: '50%', background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: C.amberGold, fontWeight: 400 }}>{s.meBadge}</span>
            </div>

            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
              {personas.map((p, i) => {
                const pos = getNodePosition(i, personas.length);
                return (
                  <line key={`line-${i}`} x1="50" y1="50" x2={pos.x} y2={pos.y}
                    stroke={p.status === 'suppressed' ? '#C0807033' : p.status === 'dormant' ? `${C.text4}22` : `${C.amberGold}22`}
                    strokeWidth="0.5" strokeDasharray={p.status !== 'active' ? '2,2' : 'none'} />
                );
              })}
              {contradictions.map((ct) => {
                const idxA = personas.findIndex(p => p.id === ct.persona_a_id);
                const idxB = personas.findIndex(p => p.id === ct.persona_b_id);
                if (idxA < 0 || idxB < 0) return null;
                const posA = getNodePosition(idxA, personas.length);
                const posB = getNodePosition(idxB, personas.length);
                const op = Math.min(0.7, 0.2 + (ct.severity / 100) * 0.5);
                const sw = Math.max(0.4, 0.4 + (ct.severity / 100) * 1.2);
                const mx = (posA.x + posB.x) / 2, my = (posA.y + posB.y) / 2;
                return (
                  <g key={`contra-${ct.id}`}>
                    <line x1={posA.x} y1={posA.y} x2={posB.x} y2={posB.y} stroke={`rgba(192,128,112,${op})`} strokeWidth={sw} strokeDasharray="3,2" />
                    <circle cx={mx} cy={my} r="2.5" fill="#1C1917" stroke="#C08070" strokeWidth="0.5" />
                    <text x={mx} y={my + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="3" fill="#C08070">!</text>
                  </g>
                );
              })}
            </svg>

            {personas.map((p, i) => {
              const pos = getNodePosition(i, personas.length);
              const st = getStatusStyle(p.status);
              const size = Math.max(36, Math.min(56, 36 + (p.activation_score / 100) * 20));
              const isSelected = selectedPersona === p.id;
              const hasContradiction = contradictions.some(ct => ct.persona_a_id === p.id || ct.persona_b_id === p.id);
              return (
                <div key={p.id} onClick={() => setSelectedPersona(isSelected ? null : p.id)}
                  style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -50%) scale(${isSelected ? 1.12 : 1})`, width: size, height: size, borderRadius: '50%', border: st.border, background: st.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .25s', boxShadow: isSelected ? `0 0 12px ${st.color}33` : hasContradiction ? '0 0 6px #C0807022' : 'none', zIndex: isSelected ? 2 : 1 }}>
                  <span style={{ fontSize: 8, fontWeight: 400, color: st.labelColor, textAlign: 'center', lineHeight: 1.15, maxWidth: size - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.persona_label || `P${i + 1}`}
                  </span>
                  <span style={{ fontSize: 7, color: st.color, marginTop: 1 }}>{p.activation_score}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status legend */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          {(['active', 'dormant', 'suppressed'] as const).map(status => {
            const st = getStatusStyle(status);
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: st.border, background: st.background }} />
                <span style={{ fontSize: 9, color: C.text4 }}>{s.statusLabels[status]}</span>
              </div>
            );
          })}
          {contradictionCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 0, borderTop: '1.5px dashed #C08070' }} />
              <span style={{ fontSize: 9, color: C.text4 }}>{s.conflict}</span>
            </div>
          )}
        </div>

        {/* Pattern profiles summary */}
        {patterns.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.border2}`, paddingTop: 10, marginTop: 4 }}>
            <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.07em', textTransform: 'uppercase', color: C.text5, marginBottom: 6 }}>{s.patternAxis}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {patterns.map(pt => (
                <div key={pt.id} style={{ background: C.bg, borderRadius: 7, padding: '7px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 300, color: C.text4, flex: 1 }}>{pt.pattern_axis}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 13, color: C.text }}>{pt.score}</span>
                    <span style={{ fontSize: 9, fontWeight: 400, color: getTrendColor(pt.trend) }}>{getTrendIcon(pt.trend)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 3, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, transition: 'width .5s ease', background: pt.confidence >= 70 ? C.amberGold : pt.confidence >= 40 ? C.amber : C.text4, width: `${pt.confidence}%` }} />
                    </div>
                    <span style={{ fontSize: 8, color: C.text5, minWidth: 28, textAlign: 'right' }}>{pt.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail popup */}
      {selected && (() => {
        const selSt = getStatusStyle(selected.status);
        const relContra = getRelatedContradictions(selected.id);
        const signals = getSignalSummary(selected.id);
        return (
        <>
          <div onClick={() => setSelectedPersona(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 60 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.bg, borderRadius: '20px 20px 0 0', border: `1px solid ${selSt.color}44`, borderBottom: 'none', zIndex: 61, maxHeight: '70%', display: 'flex', flexDirection: 'column', animation: 'slideUp .3s ease' }}>
            <div style={{ width: 32, height: 3, borderRadius: 99, background: C.border, margin: '10px auto 0', flexShrink: 0 }} />
            <div style={{ padding: '12px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border2}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: selSt.border, background: selSt.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, color: selSt.color }}>{selected.activation_score}</span>
                </div>
                <div>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 17, color: C.text }}>{selected.persona_label}</span>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, border: `1px solid ${selSt.color}44`, color: selSt.color, background: selSt.background }}>{s.statusLabels[selected.status as keyof typeof s.statusLabels] ?? selected.status}</span>
                    {selected.persona_layer && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, border: `1px solid ${C.border}`, color: C.text4 }}>{selected.persona_layer}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPersona(null)} style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', color: C.text4, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'✕'}</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: C.text4 }}>{s.activeness}</span>
                  <span style={{ fontSize: 9, color: selSt.color }}>{selected.activation_score}/100</span>
                </div>
                <div style={{ height: 4, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: selSt.color, width: `${selected.activation_score}%`, transition: 'width .5s ease' }} />
                </div>
              </div>

              {selected.description && (
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.06em', textTransform: 'uppercase', color: C.text5, marginBottom: 4 }}>{s.descLabel}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: C.text2, lineHeight: 1.55 }}>{selected.description}</p>
                </div>
              )}

              {selected.status === 'suppressed' && (
                <div style={{ background: '#C080700A', border: '1px dashed #C0807044', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.06em', color: '#C08070', marginBottom: 4 }}>{s.suppressedCandidate}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: C.text3, lineHeight: 1.55, marginBottom: 6 }}>{s.suppressedDesc}</p>
                  {selected.detected_signals && selected.detected_signals.length > 0 && (
                    <div style={{ borderTop: '1px solid #C0807022', paddingTop: 6, marginTop: 2 }}>
                      <p style={{ fontSize: 9, color: '#C08070', marginBottom: 4, opacity: 0.8 }}>{s.detectedSignals}</p>
                      {selected.detected_signals.slice(0, 3).map((sig, si) => (
                        <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, background: '#C0807015', color: '#C08070', border: '1px solid #C0807022' }}>{sig.source}</span>
                          <span style={{ fontSize: 9, color: C.text4, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sig.keyword}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selected.status === 'suppressed' && signals && (signals.vent_signals.length > 0 || signals.dig_signals.length > 0) && (
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.06em', textTransform: 'uppercase', color: C.text5, marginBottom: 6 }}>{s.signalSummary}</p>
                  {signals.vent_signals.length > 0 && (
                    <div style={{ marginBottom: signals.dig_signals.length > 0 ? 8 : 0 }}>
                      <p style={{ fontSize: 8, color: C.amber, marginBottom: 4, letterSpacing: '.05em' }}>VENT</p>
                      {signals.vent_signals.slice(0, 3).map((vs, vi) => (
                        <div key={vi} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4, paddingLeft: 6, borderLeft: `2px solid ${C.amber}22` }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 10, color: C.text3, lineHeight: 1.4 }}>{vs.text || s.noContent}</p>
                            {vs.emotion && <span style={{ fontSize: 8, color: C.text5, marginTop: 1, display: 'inline-block' }}>{vs.emotion}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {signals.dig_signals.length > 0 && (
                    <div>
                      <p style={{ fontSize: 8, color: C.frost, marginBottom: 4, letterSpacing: '.05em' }}>DIG</p>
                      {signals.dig_signals.slice(0, 3).map((ds, di) => (
                        <div key={di} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4, paddingLeft: 6, borderLeft: `2px solid ${C.frost}22` }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 10, color: C.text3, lineHeight: 1.4 }}>{ds.text || s.noContent}</p>
                            {ds.layer && <span style={{ fontSize: 8, color: C.text5, marginTop: 1, display: 'inline-block' }}>{ds.layer}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {relContra.length > 0 && (
                <div style={{ background: C.bg2, border: '1px solid #C0807022', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C08070', marginBottom: 6 }}>{s.conflictRelation}</p>
                  {relContra.map((rc) => {
                    const otherId = rc.persona_a_id === selected.id ? rc.persona_b_id : rc.persona_a_id;
                    const other = personas.find(p => p.id === otherId);
                    return (
                      <div key={rc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '6px 8px', background: '#C080700A', borderRadius: 7, border: '1px solid #C0807015' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px dashed #C08070', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 7, color: '#C08070' }}>!</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 10, color: C.text2, lineHeight: 1.3 }}>
                            {other?.persona_label ?? s.unknownPersona}
                            <span style={{ fontSize: 8, color: C.text5, marginLeft: 4 }}>{rc.contradiction_type}</span>
                          </p>
                          {rc.description && <p style={{ fontSize: 9, color: C.text4, lineHeight: 1.4, marginTop: 2 }}>{rc.description}</p>}
                        </div>
                        <span style={{ fontSize: 10, color: '#C08070', fontFamily: "'Cormorant Garamond', serif" }}>{rc.severity}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {selected.contributing_patterns.length > 0 && (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: '.06em', textTransform: 'uppercase', color: C.text5, marginBottom: 6 }}>{s.contributingPatterns}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selected.contributing_patterns.map((cp, i) => {
                      const matched = patterns.find(pt => pt.pattern_axis === cp.axis);
                      return (
                        <div key={i} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: matched ? 4 : 0 }}>
                            <span style={{ fontSize: 10, color: C.text3, flex: 1 }}>{cp.axis}</span>
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: C.text }}>{cp.score}</span>
                            {matched && <span style={{ fontSize: 9, color: getTrendColor(matched.trend) }}>{getTrendIcon(matched.trend)}</span>}
                          </div>
                          {matched && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, height: 2, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 99, background: matched.confidence >= 70 ? C.amberGold : matched.confidence >= 40 ? C.amber : C.text4, width: `${matched.confidence}%`, transition: 'width .5s ease' }} />
                              </div>
                              <span style={{ fontSize: 7, color: C.text5 }}>{matched.confidence}%</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 9, color: C.text5, marginBottom: 2 }}>{s.confidence}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: C.text }}>{selected.confidence_score}<span style={{ fontSize: 10, color: C.text4 }}>%</span></p>
                </div>
                <div style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 9, color: C.text5, marginBottom: 2 }}>{s.signalCount}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: C.text }}>{selected.signal_count}</p>
                </div>
              </div>
            </div>
          </div>
        </>
        );
      })()}
    </>
  );
});

export default PersonaMap;
