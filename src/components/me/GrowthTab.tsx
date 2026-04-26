import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '@/lib/colors';
import { RADAR_DATA, PERSONAS, FRIENDS } from '@/data/mePageData';
import PersonaMap from '@/components/persona/PersonaMap';
import MonthlyReportCard from '@/components/me/MonthlyReportCard';
import CommunicationPatternCard from '@/components/me/CommunicationPatternCard';
import PatternDeviationCard from '@/components/me/PatternDeviationCard';
import ShareCard from '@/components/me/ShareCard';
import FeedEvolutionBanner from '@/components/me/FeedEvolutionBanner';
import SeedCard from '@/components/me/SeedCard';
import WeeklyReportSection from '@/components/me/WeeklyReportSection';
import DiagnosisSection from '@/components/me/DiagnosisSection';
import RelationshipTimeline from '@/components/me/RelationshipTimeline';
import PersonaFragmentsSection from '@/components/me/PersonaFragmentsSection';
import RadarChart from '@/components/me/RadarChart';
import type { useUserMeData } from '@/hooks/useUserMeData';

const PERSONA_TAG_STYLE = { fontSize: 9, padding: '2px 7px', borderRadius: 99, border: `1px solid ${C.border}`, color: C.text4 } as const;

interface GrowthTabProps {
  meData: ReturnType<typeof useUserMeData>;
  pct: number;
  closedCount: number;
  seedTitle: string;
  stageStatus: (i: number) => 'done' | 'active' | 'none';
  userId: string;
}

export default function GrowthTab({ meData, pct, closedCount, seedTitle, stageStatus, userId }: GrowthTabProps) {
  const navigate = useNavigate();
  const [openPersona, setOpenPersona] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'prev' | 'now'>('now');
  const [dmToast, setDmToast] = useState('');
  const [shareToast, setShareToast] = useState(false);

  const radarNow = meData.radar?.now ?? RADAR_DATA.now;
  const radarPrev = meData.radar?.prev ?? RADAR_DATA.prev;
  const radarCurrent = chartMode === 'now' ? radarNow : (radarPrev ?? radarNow);
  const displayPersonas = meData.personas.length > 0 ? meData.personas : PERSONAS;

  const sendDM = (name: string) => {
    setDmToast(`${name}에게 대화 신청을 보냈어요`);
    setTimeout(() => setDmToast(''), 2200);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 80px', display: 'flex', flexDirection: 'column', gap: 11 }}>
      <SeedCard pct={pct} seedTitle={seedTitle} stats={meData.stats} stageStatus={stageStatus} />
      <FeedEvolutionBanner />
      <PatternDeviationCard />
      <CommunicationPatternCard />
      <MonthlyReportCard />
      <ShareCard />

      {closedCount > 0 && (
        <div className="vr-fade-in" style={{ background: `${C.frost}08`, border: `1px solid ${C.frost}22`, borderRadius: 10, padding: '9px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 17, height: 17, borderRadius: '50%', background: `${C.frost}15`, border: `1px solid ${C.frost}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.frost, display: 'block' }} />
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: C.text3, flex: 1, lineHeight: 1.5 }}>
            "현재 정밀도 {pct}%. {closedCount}개 영역이 닫혀 있어요. 열면 더 정확해져요."
          </p>
          <span style={{ fontSize: 9, color: C.text5, flexShrink: 0, marginTop: 2 }}>Frost</span>
        </div>
      )}

      <PersonaMap userId={userId} />
      <PersonaFragmentsSection />

      {/* 멀티페르소나 */}
      <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '15px 17px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>멀티페르소나</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 300, color: C.text4 }}>
              {meData.personasLoading ? '...' : `${displayPersonas.length}개 발견됨`}
            </span>
            <button onClick={() => navigate('/personas')} style={{ fontSize: 9, padding: '3px 9px', borderRadius: 99, border: `1px solid ${C.amberGold}44`, color: C.amberGold, background: `${C.amberGold}08`, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
              전체 보기
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {displayPersonas.map((p, i) => {
            const isOpen = openPersona === i;
            return (
              <div key={i} onClick={() => setOpenPersona(isOpen ? null : i)} style={{ background: isOpen ? `${C.amberGold}06` : C.bg, border: `1px solid ${isOpen ? `${C.amberGold}44` : C.border}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer', transition: 'all .2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'block' }} />
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 14, color: C.text, flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, border: `1px solid ${isOpen ? `${C.amberGold}33` : C.border}`, color: isOpen ? C.amberGold : C.text4 }}>{p.zone}</span>
                </div>
                {isOpen && (
                  <div style={{ paddingTop: 9, marginTop: 9, borderTop: `1px solid ${C.border2}` }}>
                    <p style={{ fontSize: 11, fontWeight: 300, color: C.text3, lineHeight: 1.55, marginBottom: 6 }}>{p.desc}</p>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 7 }}>
                      {p.tags.map(tag => <span key={tag} style={PERSONA_TAG_STYLE}>{tag}</span>)}
                    </div>
                    <div style={{ background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`, borderRadius: 7, padding: '7px 9px' }}>
                      <p style={{ fontSize: 9, color: C.amberGold, marginBottom: 2, fontWeight: 400, letterSpacing: '.05em' }}>다른 페르소나와의 충돌</p>
                      <p style={{ fontSize: 11, fontWeight: 300, color: C.text2, lineHeight: 1.5 }}>{p.conflict}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 관계 프로필 변화 (Radar) */}
      <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '15px 17px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>관계 프로필 변화</span>
          <div style={{ display: 'flex', gap: 5 }}>
            {(['prev', 'now'] as const).map(m => (
              <button key={m} onClick={() => setChartMode(m)} disabled={m === 'prev' && !radarPrev}
                style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, border: `1px solid ${chartMode === m ? `${C.amberGold}44` : C.border}`, color: chartMode === m ? C.amberGold : C.text4, background: chartMode === m ? `${C.amberGold}08` : 'transparent', cursor: (m === 'prev' && !radarPrev) ? 'default' : 'pointer', opacity: (m === 'prev' && !radarPrev) ? 0.4 : 1, transition: 'all .15s' }}>
                {m === 'prev' ? '1개월 전' : '지금'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <RadarChart mode={chartMode} data={radarCurrent} prev={radarPrev} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {radarCurrent.axes.map((axis, i) => {
            const nowVal = radarCurrent.vals[i];
            const prevVal = radarPrev?.vals[i] ?? nowVal;
            const delta = nowVal - prevVal;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.bg, borderRadius: 7, padding: '5px 8px' }}>
                <span style={{ fontSize: 9, fontWeight: 300, color: C.text4, flex: 1 }}>{axis}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 14, color: C.text }}>{nowVal}</span>
                {chartMode === 'now' && radarPrev
                  ? <span style={{ fontSize: 9, fontWeight: 400, color: delta >= 0 ? C.amberGold : C.text4 }}>{delta >= 0 ? '+' : ''}{delta}</span>
                  : <span style={{ fontSize: 10, fontWeight: 300, color: C.text5, marginLeft: 2 }}>기준</span>}
              </div>
            );
          })}
        </div>
      </div>

      <RelationshipTimeline />
      <WeeklyReportSection weeklyReport={meData.weeklyReport} weeklyReportLoading={meData.weeklyReportLoading} />
      <DiagnosisSection diagnosis={meData.diagnosis} />

      {/* 친구 추천 */}
      <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 17px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>대화가 잘 통할 것 같아요</span>
          <span style={{ fontSize: 9, fontWeight: 300, color: C.text4 }}>패턴과 zone 교집합 기준</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FRIENDS.map((f, i) => (
            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 11, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 14, color: C.bg }}>{f.av}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 14, color: C.text, marginBottom: 2 }}>{f.name}</p>
                <p style={{ fontSize: 10, fontWeight: 300, color: C.text4, lineHeight: 1.4 }}>{f.reason}</p>
              </div>
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, border: `1px solid ${C.amberGold}33`, color: C.amberGold, background: `${C.amberGold}08`, flexShrink: 0, whiteSpace: 'nowrap' }}>{f.match}</span>
              <button onClick={() => sendDM(f.name)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v8H8l-3 2V10H2z" stroke={C.text4} strokeWidth="1.2" strokeLinejoin="round"/></svg>
              </button>
            </div>
          ))}
        </div>
        {dmToast && <p style={{ fontSize: 10, fontWeight: 300, color: C.amberGold, textAlign: 'center', marginTop: 6 }}>{dmToast}</p>}
      </div>

      {/* 공유 카드 */}
      <div className="vr-fade-in" style={{ background: `linear-gradient(135deg,${C.amberGold}08,${C.bg})`, border: `1px solid ${C.amberGold}33`, borderRadius: 14, padding: '14px 17px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${C.amberGold}15`, border: `1px solid ${C.amberGold}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 10l4-4 3 3 5-6" stroke={C.amberGold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 15, color: C.text }}>나의 변화 공유하기</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 300, color: C.text4, lineHeight: 1.5, marginBottom: 9 }}>처음과 지금이 얼마나 달라졌는지 한 장으로.</p>
        <button onClick={() => { setShareToast(true); setTimeout(() => setShareToast(false), 2500); }}
          style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: C.amberGold, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 400, color: C.bg, cursor: 'pointer' }}>
          공유 카드 만들기
        </button>
        {shareToast && <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 300, color: C.amberGold, marginTop: 7 }}>준비 중이에요 — 곧 만들 수 있어요</p>}
      </div>
    </div>
  );
}
