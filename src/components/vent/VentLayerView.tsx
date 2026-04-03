// VentLayerView — layer groups + community groups
import { C, alpha } from '@/lib/colors';

const LAYER_LOCKED_BADGE_STYLE = { border: `1px solid ${C.border}`, color: C.text5 } as const;
const LAYER_SENSITIVE_BADGE_STYLE = { border: `1px solid ${alpha(C.amberDim, 0.2)}`, color: C.amberDim, background: alpha(C.amberDim, 0.04) } as const;
const LAYER_NORMAL_BADGE_STYLE = { border: `1px solid ${C.border}`, color: C.text4 } as const;

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
  if (section === 'layer') {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0" style={{ padding: '14px 22px', scrollbarWidth: 'none' }}>
        <p className="text-[11px] font-light mb-1 flex-shrink-0" style={{ color: C.text4 }}>어떤 상황에서의 나를 살펴볼까요?</p>

        {layerActive ? (
          /* 레이어 질문 영역 */
          <div className="flex flex-col gap-[7px]">
            <button onClick={() => onSetLayerActive('')} className="text-[11px] font-light text-left mb-1" style={{ color: C.text4, background: 'none', border: 'none', cursor: 'pointer' }}>← 돌아가기</button>
            <div className="inline-flex items-center px-[10px] py-[3px] rounded-full mb-2" style={{ border: `1px solid ${alpha(C.amber, 0.2)}`, color: C.amber, background: alpha(C.amber, 0.04), fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase' }}>레이어</div>
            <p className="text-[14px] font-light break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text2 }}>이 상황에서의 나는 어떤가요? 자유롭게 털어놔요.</p>
            <div className="rounded-[11px] mt-2" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
              <textarea className="w-full bg-transparent border-none outline-none resize-none text-[15px] font-light leading-[1.6] break-keep p-4"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text, minHeight: 100 }}
                placeholder="떠오르는 것을 써요..." />
            </div>
          </div>
        ) : (
          layerGroups.map(group => (
            <div key={group.id} className="flex flex-col gap-[5px] flex-shrink-0">
              <button onClick={() => onToggleGroup(group.id)}
                className="rounded-[11px] flex items-center justify-between gap-2 text-left cursor-pointer transition-all"
                style={{ background: C.bg2, border: `1px solid ${C.border}`, padding: '13px 15px' }}>
                <div>
                  <p className="text-[17px] font-light mb-[2px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>{group.label}</p>
                  <p className="text-[10px] font-light" style={{ color: C.text4 }}>{group.sub}</p>
                </div>
                <span className="text-[11px] flex-shrink-0 transition-transform" style={{ color: C.text5, transform: expandedGroups[group.id] ? 'rotate(90deg)' : 'none' }}>›</span>
              </button>

              {expandedGroups[group.id] && (
                <div className="flex flex-col gap-[5px] pl-2">
                  {group.items.map(item => (
                    <button key={item.id} onClick={() => !item.locked && onSetLayerActive(item.id)}
                      className="rounded-[9px] flex items-center justify-between gap-2 text-left"
                      style={{
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        padding: '10px 13px',
                        cursor: item.locked ? 'default' : 'pointer',
                        opacity: item.locked ? 0.5 : 1,
                      }}>
                      <span className="text-[15px] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: item.locked ? C.text4 : C.text2 }}>{item.label}</span>
                      {item.locked ? (
                        <span className="text-[9px] px-2 py-[2px] rounded-full flex-shrink-0" style={LAYER_LOCKED_BADGE_STYLE}>🔒 잠김</span>
                      ) : item.sensitive ? (
                        <span className="text-[9px] px-2 py-[2px] rounded-full flex-shrink-0" style={LAYER_SENSITIVE_BADGE_STYLE}>민감</span>
                      ) : (
                        <span className="text-[9px] px-2 py-[2px] rounded-full flex-shrink-0" style={LAYER_NORMAL_BADGE_STYLE}>일반</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  // Community section
  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0" style={{ padding: '14px 22px', scrollbarWidth: 'none' }}>
      <p className="text-[10px] font-light mb-2 flex-shrink-0" style={{ color: C.text5 }}>지금 비슷한 감정인 사람들이에요.</p>
      {commGroups.map((g, i) => (
        <div key={i} className="rounded-[11px] flex-shrink-0" style={{ background: i === 0 ? alpha(C.amber, 0.03) : C.bg2, border: `1px solid ${i === 0 ? alpha(C.amber, 0.2) : C.border}`, padding: '12px 14px' }}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-[15px] font-light break-keep" style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}>{g.title}</span>
            <span className="text-[10px] flex-shrink-0" style={{ color: C.text4 }}>{g.count}명</span>
          </div>
          <p className="text-[11px] font-light" style={{ color: C.text3 }}>{g.desc}</p>
        </div>
      ))}
    </div>
  );
}
