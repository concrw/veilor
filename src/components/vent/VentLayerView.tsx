// VentLayerView — layer groups + community groups
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, alpha } from '@/lib/colors';
import { useVentTranslations } from '@/hooks/useTranslation';

const LAYER_LOCKED_BADGE_STYLE = { border: `1px solid ${C.border}`, color: C.text5 } as const;
const LAYER_SENSITIVE_BADGE_STYLE = { border: `1px solid ${alpha(C.amberDim, 0.2)}`, color: C.amberDim, background: alpha(C.amberDim, 0.04) } as const;
const LAYER_NORMAL_BADGE_STYLE = { border: `1px solid ${C.border}`, color: C.text4 } as const;

// 트라우마 인폼드 동의 모달 — secret_desire 열기 전 표시
function DesireUnlockModal({ onConfirm, onCancel, labels }: {
  onConfirm: () => void;
  onCancel: () => void;
  labels: {
    title: string; body1: string; body2: string; body3: string;
    encrypted: string; cancel: string; open: string;
  };
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
      style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: C.bg, border: `1px solid ${C.border}` }}>
        <div className="text-center space-y-1">
          <h3 className="text-base font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>
            {labels.title}
          </h3>
        </div>
        <div className="space-y-2 text-xs font-light leading-relaxed" style={{ color: C.text2 }}>
          <p>{labels.body1}</p>
          <p>{labels.body2}</p>
          <p>{labels.body3}</p>
        </div>
        <div className="rounded-xl p-3 text-xs font-light leading-relaxed"
          style={{ background: alpha(C.amber, 0.05), border: `1px solid ${alpha(C.amber, 0.15)}`, color: C.text3 }}>
          {labels.encrypted}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onCancel}
            className="flex-1 h-10 rounded-xl text-xs font-light"
            style={{ border: `1px solid ${C.border}`, color: C.text4, background: 'transparent' }}>
            {labels.cancel}
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-10 rounded-xl text-xs font-medium"
            style={{ background: alpha(C.amber, 0.12), border: `1px solid ${alpha(C.amber, 0.3)}`, color: C.amber }}>
            {labels.open}
          </button>
        </div>
      </div>
    </div>
  );
}

interface LayerItem {
  id: string;
  label: string;
  sensitive: boolean;
  locked?: boolean;
}

interface LayerGroup {
  id: string;
  label: string;
  sub: string;
  items: LayerItem[];
}

interface CommGroup {
  title: string;
  count: number;
  desc: string;
}

interface VentLayerViewProps {
  section: 'layer' | 'community';
  layerGroups: LayerGroup[];
  commGroups: CommGroup[];
  expandedGroups: Record<string, boolean>;
  layerActive: string;
  onToggleGroup: (id: string) => void;
  onSetLayerActive: (id: string) => void;
}

export default function VentLayerView({
  section, layerGroups, commGroups, expandedGroups, layerActive,
  onToggleGroup, onSetLayerActive,
}: VentLayerViewProps) {
  const navigate = useNavigate();
  const vent = useVentTranslations();
  const [desireModalOpen, setDesireModalOpen] = useState(false);
  const [partnerLayerText, setPartnerLayerText] = useState('');
  const [showPartnerNudge, setShowPartnerNudge] = useState(false);
  const partnerNudgeShownRef = useState(false);

  const isPartnerLayer = layerActive === 'daily_partner';

  const handleItemClick = (item: LayerItem) => {
    if (item.locked) {
      // secret_desire: 트라우마 인폼드 모달 표시
      if (item.id === 'secret_desire') {
        setDesireModalOpen(true);
      }
      // secret_shame: 잠금 유지 (향후 별도 확장)
      return;
    }
    onSetLayerActive(item.id);
  };

  if (section === 'layer') {
    return (
      <>
        {desireModalOpen && (
          <DesireUnlockModal
            labels={vent.layers.desireModal}
            onConfirm={() => {
              setDesireModalOpen(false);
              navigate('/home/sexself/questions');
            }}
            onCancel={() => setDesireModalOpen(false)}
          />
        )}

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0" style={{ padding: '14px 22px', scrollbarWidth: 'none' }}>
          <p className="text-[11px] font-light mb-1 flex-shrink-0" style={{ color: C.text4 }}>{vent.layers.prompt}</p>

          {layerActive ? (
            <div className="flex flex-col gap-[7px]">
              <button onClick={() => { onSetLayerActive(''); setPartnerLayerText(''); setShowPartnerNudge(false); }} className="text-[11px] font-light text-left mb-1" style={{ color: C.text4, background: 'none', border: 'none', cursor: 'pointer' }}>← {vent.layers.backButton}</button>
              <div className="inline-flex items-center px-[10px] py-[3px] rounded-full mb-2" style={{ border: `1px solid ${alpha(C.amber, 0.2)}`, color: C.amber, background: alpha(C.amber, 0.04), fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase' }}>{vent.layers.title}</div>
              <p className="text-[14px] font-light break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text2 }}>{vent.layers.activePrompt}</p>
              <div className="rounded-[11px] mt-2" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
                <textarea
                  className="w-full bg-transparent border-none outline-none resize-none text-[15px] font-light leading-[1.6] break-keep p-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text, minHeight: 100 }}
                  placeholder={vent.layers.writePlaceholder}
                  value={isPartnerLayer ? partnerLayerText : undefined}
                  onChange={isPartnerLayer ? (e) => {
                    setPartnerLayerText(e.target.value);
                    if (e.target.value.length >= 20 && !partnerNudgeShownRef[0]) {
                      partnerNudgeShownRef[0] = true;
                      setShowPartnerNudge(true);
                    }
                  } : undefined}
                />
              </div>

              {/* 파트너 레이어 작성 후 SexSelf 넛지 */}
              {isPartnerLayer && showPartnerNudge && (
                <div
                  className="rounded-[11px] p-4 space-y-3"
                  style={{ background: alpha('#ec4899', 0.04), border: `1px solid ${alpha('#ec4899', 0.2)}` }}
                >
                  <p className="text-[13px] font-light leading-relaxed break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text2 }}>
                    {vent.chat.partnerNudge}
                  </p>
                  <p className="text-[10px]" style={{ color: alpha('#ec4899', 0.6) }}>{vent.chat.partnerNudgePrivate}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/home/sexself/questions')}
                      className="flex-1 py-[8px] rounded-[9px] text-[11px] font-light"
                      style={{ background: alpha('#ec4899', 0.08), border: `1px solid ${alpha('#ec4899', 0.3)}`, color: '#ec4899' }}
                    >
                      {vent.chat.partnerNudgeExplore}
                    </button>
                    <button
                      onClick={() => setShowPartnerNudge(false)}
                      className="flex-1 py-[8px] rounded-[9px] text-[11px] font-light"
                      style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text4 }}
                    >
                      {vent.chat.partnerNudgeSkip}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            layerGroups.map(group => {
              const groupT = (vent.layers as Record<string, unknown>)[group.id] as { label: string; sub: string; items: Record<string, string> } | undefined;
              return (
                <div key={group.id} className="flex flex-col gap-[5px] flex-shrink-0">
                  <button onClick={() => onToggleGroup(group.id)}
                    className="rounded-[11px] flex items-center justify-between gap-2 text-left cursor-pointer transition-all"
                    style={{ background: C.bg2, border: `1px solid ${C.border}`, padding: '13px 15px' }}>
                    <div>
                      <p className="text-[17px] font-light mb-[2px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>{groupT?.label ?? group.label}</p>
                      <p className="text-[10px] font-light" style={{ color: C.text4 }}>{groupT?.sub ?? group.sub}</p>
                    </div>
                    <span className="text-[11px] flex-shrink-0 transition-transform" style={{ color: C.text5, transform: expandedGroups[group.id] ? 'rotate(90deg)' : 'none' }}>›</span>
                  </button>

                  {expandedGroups[group.id] && (
                    <div className="flex flex-col gap-[5px] pl-2">
                      {group.items.map(item => {
                        const isDesire = item.id === 'secret_desire';
                        const itemLabel = groupT?.items?.[item.id] ?? item.label;
                        return (
                          <button key={item.id} onClick={() => handleItemClick(item)}
                            className="rounded-[9px] flex items-center justify-between gap-2 text-left transition-all"
                            style={{
                              background: isDesire ? alpha('#ec4899', 0.04) : C.bg,
                              border: `1px solid ${isDesire ? alpha('#ec4899', 0.2) : C.border}`,
                              padding: '10px 13px',
                              cursor: 'pointer',
                            }}>
                            <div>
                              <span className="text-[15px] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: isDesire ? '#ec4899' : (item.locked ? C.text4 : C.text2) }}>
                                {itemLabel}
                              </span>
                              {isDesire && (
                                <p className="text-[10px] font-light mt-[2px]" style={{ color: alpha('#ec4899', 0.6) }}>
                                  {vent.layers.desireHint}
                                </p>
                              )}
                            </div>
                            {item.locked && !isDesire ? (
                              <span className="text-[9px] px-2 py-[2px] rounded-full flex-shrink-0" style={LAYER_LOCKED_BADGE_STYLE}>{vent.layers.tags.locked}</span>
                            ) : isDesire ? (
                              <span className="text-[9px] px-2 py-[2px] rounded-full flex-shrink-0" style={{ border: `1px solid ${alpha('#ec4899', 0.3)}`, color: '#ec4899', background: alpha('#ec4899', 0.06) }}>{vent.layers.tags.sensitive}</span>
                            ) : item.sensitive ? (
                              <span className="text-[9px] px-2 py-[2px] rounded-full flex-shrink-0" style={LAYER_SENSITIVE_BADGE_STYLE}>{vent.layers.tags.sensitive}</span>
                            ) : (
                              <span className="text-[9px] px-2 py-[2px] rounded-full flex-shrink-0" style={LAYER_NORMAL_BADGE_STYLE}>{vent.layers.tags.normal}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </>
    );
  }

  // Community section
  const commT = vent.community;
  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0" style={{ padding: '14px 22px', scrollbarWidth: 'none' }}>
      <p className="text-[10px] font-light mb-2 flex-shrink-0" style={{ color: C.text5 }}>{commT.subtitle}</p>
      {commGroups.map((g, i) => {
        const tGroup = commT.groups[i];
        return (
          <div key={i} className="rounded-[11px] flex-shrink-0" style={{ background: i === 0 ? alpha(C.amber, 0.03) : C.bg2, border: `1px solid ${i === 0 ? alpha(C.amber, 0.2) : C.border}`, padding: '12px 14px' }}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[15px] font-light break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>{tGroup?.title ?? g.title}</span>
              <span className="text-[10px] flex-shrink-0" style={{ color: C.text4 }}>{g.count}{commT.people}</span>
            </div>
            <p className="text-[11px] font-light" style={{ color: C.text3 }}>{tGroup?.desc ?? g.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
