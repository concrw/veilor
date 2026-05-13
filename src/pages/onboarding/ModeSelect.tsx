import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode, type UXMode, DOMAIN_MODES } from '@/context/ModeContext';
import { useDomain, type Domain } from '@/context/DomainContext';
import { C, alpha } from '@/lib/colors';
import { useT } from '@/i18n/useT';

// ──────────────────────────────────────────────────────────────────────────────
// 이키가이 SVG 다이어그램
// ──────────────────────────────────────────────────────────────────────────────

const IKIGAI_CIRCLES: {
  id: Domain;
  cx: number; cy: number;
  lx: number; ly: number;
  color: string;
}[] = [
  { id: 'self',     cx: 0,   cy: -52, lx: 0,    ly: -135, color: '#E0B48A' },
  { id: 'work',     cx: 52,  cy: 0,   lx: 135,  ly: 4,    color: '#38BDF8' },
  { id: 'relation', cx: 0,   cy: 52,  lx: 0,    ly: 142,  color: '#FB7185' },
  { id: 'social',   cx: -52, cy: 0,   lx: -135, ly: 4,    color: '#7FB89A' },
];

interface IkigaiDiagramProps {
  selected: Domain;
  onSelect: (d: Domain) => void;
  size?: number;
}

function IkigaiDiagram({ selected, onSelect, size = 280 }: IkigaiDiagramProps) {
  const domains = useT().modeSelect.domains;
  return (
    <svg
      viewBox="-160 -160 320 320"
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible', cursor: 'default' }}
    >
      {IKIGAI_CIRCLES.map(c => {
        const isSelected = selected === c.id;
        return (
          <circle
            key={c.id}
            cx={c.cx}
            cy={c.cy}
            r={80}
            fill={c.color}
            fillOpacity={isSelected ? 0.18 : 0.06}
            stroke={c.color}
            strokeOpacity={isSelected ? 1 : 0.35}
            strokeWidth={isSelected ? 1.5 : 1}
            style={{ transition: 'all .35s', cursor: 'pointer' }}
            onClick={() => onSelect(c.id)}
          />
        );
      })}
      {IKIGAI_CIRCLES.map(c => {
        const isSelected = selected === c.id;
        const label = domains[c.id]?.name ?? c.id;
        const textAnchor =
          c.lx > 50 ? 'start' :
          c.lx < -50 ? 'end' :
          'middle';
        return (
          <text
            key={c.id}
            x={c.lx}
            y={c.ly}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={isSelected ? 600 : 400}
            fill={isSelected ? c.color : C.text3}
            style={{ transition: 'fill .3s', cursor: 'pointer', userSelect: 'none' }}
            onClick={() => onSelect(c.id)}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// i18n
// ──────────────────────────────────────────────────────────────────────────────


// ──────────────────────────────────────────────────────────────────────────────
// 스타일 메타
// ──────────────────────────────────────────────────────────────────────────────

const DOMAIN_META: { id: Domain; color: string }[] = [
  { id: 'self',     color: '#E0B48A' },
  { id: 'work',     color: '#38BDF8' },
  { id: 'relation', color: '#FB7185' },
  { id: 'social',   color: '#7FB89A' },
];

const MODE_META: { id: UXMode; color: string }[] = [
  { id: 'original', color: '#E0B48A' },
  { id: 'clear',    color: '#D6D3D1' },
  { id: 'routine',  color: '#FCD34D' },
  { id: 'focus',    color: '#7DD3FC' },
  { id: 'sprint',   color: '#38BDF8' },
  { id: 'connect',  color: '#FDA4AF' },
  { id: 'mirror',   color: '#FB7185' },
  { id: 'social',   color: '#7FB89A' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

export default function ModeSelect() {
  const { setMode, dismissFirstVisit } = useMode();
  const { setDomain } = useDomain();
  const navigate = useNavigate();
  const t = useT();
  const s = t.modeSelect;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDomain, setSelectedDomain] = useState<Domain>('self');
  const [selectedMode, setSelectedMode] = useState<UXMode>('original');

  function handleDomainConfirm() {
    const available = DOMAIN_MODES[selectedDomain];
    setSelectedMode(available[0]);
    setStep(2);
  }

  function handleConfirm(overrideMode?: UXMode) {
    const finalMode = overrideMode ?? selectedMode;
    setDomain(selectedDomain);
    setMode(finalMode);
    dismissFirstVisit();
    navigate('/home/vent', { replace: true });
  }

  const availableModes = DOMAIN_MODES[selectedDomain];

  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div
        className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14"
        style={{ borderRight: `1px solid ${C.border2}` }}
      >
        <div>
          <div className="flex items-center gap-4 mb-3">
            <img src="/icon-192x192.png" alt="VEILOR" className="w-12 h-12 rounded-xl" />
            <h1 className="text-4xl font-bold tracking-widest" style={{ color: C.amber, letterSpacing: '0.2em' }}>VEILOR</h1>
          </div>
          <p className="text-base font-light" style={{ color: C.text3 }}>{s.brandSubtitle}</p>
        </div>
        <div className="space-y-6">
          {/* Mini 이키가이 다이어그램 — PC 사이드바 (Step 1에서만 표시) */}
          {step === 1 && (
            <div className="flex justify-center">
              <IkigaiDiagram
                selected={selectedDomain}
                onSelect={setSelectedDomain}
                size={280}
              />
            </div>
          )}
          <div className="space-y-4">
            <p className="text-sm font-light leading-relaxed" style={{ color: C.text3, whiteSpace: 'pre-line' }}>
              {s.sidebarHint}
            </p>
            <div className="space-y-3">
              {DOMAIN_META.map(meta => {
                const isSelected = selectedDomain === meta.id;
                return (
                  <div
                    key={meta.id}
                    className="flex gap-3 items-start p-3 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: isSelected ? alpha(meta.color, 0.08) : C.bg3,
                      border: `1px solid ${isSelected ? alpha(meta.color, 0.33) : 'transparent'}`,
                    }}
                    onClick={() => step === 1 && setSelectedDomain(meta.id)}
                  >
                    <div
                      className="w-1 rounded-full flex-shrink-0 mt-1"
                      style={{ background: isSelected ? meta.color : C.text5, height: 32, transition: 'background .3s' }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: isSelected ? meta.color : C.text, transition: 'color .3s' }}>
                        {s.domains[meta.id].name}
                      </p>
                      <p className="text-xs" style={{ color: C.text3 }}>{s.domains[meta.id].sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="text-xs" style={{ color: C.text5 }}>© 2026 VEILOR</p>
      </div>

      {/* 우측 콘텐츠 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[540px] items-center justify-center px-4 py-12">

        {/* ── Step 1: 도메인 선택 ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-8 w-full max-w-sm">
              <h1 className="text-2xl font-semibold leading-snug" style={{ color: C.text, whiteSpace: 'pre-line' }}>
                {s.step1Header}
              </h1>
              <p className="text-sm mt-3" style={{ color: C.text3 }}>{s.step1Sub}</p>
            </div>

            {/* 이키가이 SVG 다이어그램 */}
            <div className="flex justify-center mb-4">
              <IkigaiDiagram
                selected={selectedDomain}
                onSelect={setSelectedDomain}
                size={280}
              />
            </div>

            {/* 선택된 도메인 정보 카드 — key로 fade 효과 */}
            {(() => {
              const meta = DOMAIN_META.find(m => m.id === selectedDomain)!;
              const dt = s.domains[selectedDomain];
              const coreQ = dt.coreQ;
              return (
                <div
                  key={selectedDomain}
                  className="w-full max-w-sm rounded-2xl border p-5 mb-6"
                  style={{
                    borderColor: alpha(meta.color, 0.4),
                    background: alpha(meta.color, 0.07),
                    animation: 'vr-fadeIn .3s ease',
                  }}
                >
                  <style>{`@keyframes vr-fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono uppercase tracking-widest" style={{ color: meta.color }}>
                      {selectedDomain}
                    </span>
                    <span className="text-base font-semibold" style={{ color: meta.color }}>
                      {dt.name}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: C.text3 }}>{dt.desc}</p>
                  <p className="text-xs font-medium" style={{ color: C.text2 }}>
                    {`"${coreQ}"`}
                  </p>
                </div>
              );
            })()}

            <button
              onClick={handleDomainConfirm}
              className="w-full max-w-sm font-semibold text-sm py-3.5 rounded-2xl transition-colors"
              style={{ background: C.amber, color: C.bg }}
            >
              {t.common.next}
            </button>

            <button
              onClick={() => handleConfirm('original')}
              className="mt-3 text-xs transition-colors py-2"
              style={{ color: C.text3 }}
            >
              {s.skipBtn}
            </button>
          </>
        )}

        {/* ── Step 2: UX 스타일 선택 ── */}
        {step === 2 && (
          <>
            <div className="text-center mb-10 w-full max-w-sm">
              <h1 className="text-2xl font-semibold leading-snug" style={{ color: C.text, whiteSpace: 'pre-line' }}>
                {s.step2Header}
              </h1>
              <p className="text-sm mt-3" style={{ color: C.text3 }}>{s.step2Sub}</p>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-3">
              {availableModes.map(modeId => {
                const meta = MODE_META.find(m => m.id === modeId)!;
                const isSelected = selectedMode === modeId;
                const mt = s.modes[modeId];
                return (
                  <button
                    key={modeId}
                    onClick={() => setSelectedMode(modeId)}
                    className="text-left rounded-2xl border p-5 transition-all duration-200"
                    style={{
                      borderColor: isSelected ? alpha(meta.color, 0.6) : alpha(C.border, 0.5),
                      background:  isSelected ? alpha(meta.color, 0.1) : alpha(C.bg, 0.4),
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-base font-semibold" style={{ color: isSelected ? meta.color : C.text }}>
                        {mt.name}
                      </span>
                      {isSelected && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ color: meta.color, background: alpha(C.bg3, 0.6) }}
                        >
                          {s.selected}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-3" style={{ color: isSelected ? C.text : C.text2 }}>
                      {mt.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {mt.keywords.map(kw => (
                        <span
                          key={kw}
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{
                            color:       isSelected ? meta.color : C.text3,
                            borderColor: isSelected ? alpha(meta.color, 0.3) : C.text5,
                          }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleConfirm()}
              className="mt-8 w-full max-w-sm font-semibold text-sm py-3.5 rounded-2xl transition-colors"
              style={{ background: C.amber, color: C.bg }}
            >
              {s.confirm[selectedMode]}
            </button>

            <button
              onClick={() => setStep(1)}
              className="mt-3 text-xs transition-colors py-2"
              style={{ color: C.text3 }}
            >
              {s.back}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
