// PersonaFragmentsSection — ME탭 "발견된 나" 섹션
// 시스템이 모순에서 감지한 페르소나 조각을 카드로 표시
// 유저는 "맞아요 / 놀라워요 / 아닌 것 같아요"로 반응만 하면 됨

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getPersonaFragments, acknowledgeFragment } from '@/lib/personaContradictionEngine';
import type { PersonaFragmentRow } from '@/lib/personaContradictionEngine';
import { C, alpha } from '@/lib/colors';

const TYPE_LABEL: Record<string, string> = {
  value_behavior: '가치 vs 행동',
  self_image:     '자기상 vs 실제',
  desire_block:   '욕망 차단',
  role_split:     '역할 분리',
};

const TYPE_COLOR: Record<string, string> = {
  value_behavior: '#f59e0b',
  self_image:     '#8b5cf6',
  desire_block:   '#ec4899',
  role_split:     '#3b82f6',
};

const REACTIONS = [
  { key: 'resonates',   label: '맞아요',      icon: '✓' },
  { key: 'surprising',  label: '놀라워요',     icon: '!' },
  { key: 'disagree',    label: '아닌 것 같아요', icon: '×' },
] as const;

function FragmentCard({ fragment, onReact }: {
  fragment: PersonaFragmentRow;
  onReact: (id: string, reaction: 'resonates' | 'surprising' | 'disagree') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = TYPE_COLOR[fragment.contradiction_type] ?? C.amberGold;
  const scoreBar = Math.round(fragment.contradiction_score * 100);

  return (
    <div
      className="vr-fade-in"
      style={{
        background: fragment.is_acknowledged ? C.bg : C.bg2,
        border: `1px solid ${fragment.is_acknowledged ? C.border : alpha(color, 0.3)}`,
        borderRadius: 13,
        overflow: 'hidden',
        transition: 'all .2s',
      }}
    >
      {/* 헤더 */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}
      >
        {/* 모순 강도 인디케이터 */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${alpha(color, 0.4)}`,
          background: alpha(color, 0.08),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color, fontWeight: 400 }}>
            {scoreBar}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            {!fragment.is_acknowledged && (
              <span style={{
                fontSize: 8, padding: '1px 5px', borderRadius: 99,
                background: alpha(color, 0.12), color,
                fontWeight: 500, letterSpacing: '.04em',
              }}>
                새로 발견됨
              </span>
            )}
            <span style={{
              fontSize: 8, padding: '1px 5px', borderRadius: 99,
              border: `1px solid ${C.border}`, color: C.text4,
            }}>
              {TYPE_LABEL[fragment.contradiction_type]}
            </span>
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300, fontSize: 15, color: C.text, lineHeight: 1.2, marginBottom: 2,
          }}>
            {fragment.name_ko}
          </p>
          <p style={{ fontSize: 10, fontWeight: 300, color: C.text4 }}>
            {fragment.context_label}
          </p>
        </div>

        <span style={{
          fontSize: 11, color: C.text5,
          transform: expanded ? 'rotate(90deg)' : 'none',
          transition: 'transform .2s', flexShrink: 0, marginTop: 8,
        }}>
          ›
        </span>
      </div>

      {/* 확장 — 상세 설명 */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border2}`, padding: '12px 15px 14px' }}>

          {/* 설명 */}
          <p style={{
            fontSize: 11, fontWeight: 300, color: C.text2,
            lineHeight: 1.65, marginBottom: 12,
          }}>
            {fragment.description}
          </p>

          {/* 모순의 두 출처 */}
          <div style={{
            background: C.bg, borderRadius: 9, padding: '10px 12px',
            marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <p style={{ fontSize: 9, color: C.text5, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>
              감지된 모순
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, background: alpha(color, 0.06), borderRadius: 7, padding: '7px 9px' }}>
                <p style={{ fontSize: 8, color: color, marginBottom: 2, fontWeight: 500 }}>
                  {fragment.source_a_label}
                </p>
                <p style={{ fontSize: 10, color: C.text3, lineHeight: 1.4 }}>
                  {fragment.source_a_value}
                </p>
              </div>
              <span style={{ fontSize: 14, color: C.text5, flexShrink: 0 }}>⟷</span>
              <div style={{ flex: 1, background: alpha('#ef4444', 0.05), borderRadius: 7, padding: '7px 9px' }}>
                <p style={{ fontSize: 8, color: '#ef4444', marginBottom: 2, fontWeight: 500 }}>
                  {fragment.source_b_label}
                </p>
                <p style={{ fontSize: 10, color: C.text3, lineHeight: 1.4 }}>
                  {fragment.source_b_value}
                </p>
              </div>
            </div>
          </div>

          {/* 모순 강도 바 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: C.text5 }}>모순 강도</span>
              <span style={{ fontSize: 9, color, fontWeight: 500 }}>{scoreBar}%</span>
            </div>
            <div style={{ height: 3, background: C.border2, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: `linear-gradient(90deg, ${alpha(color, 0.5)}, ${color})`,
                width: `${scoreBar}%`, transition: 'width .5s ease',
              }} />
            </div>
          </div>

          {/* 반응 버튼 */}
          {!fragment.is_acknowledged ? (
            <div>
              <p style={{ fontSize: 9, color: C.text5, marginBottom: 7 }}>이 발견이 당신에게 어떻게 느껴지나요?</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {REACTIONS.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => onReact(fragment.id, key)}
                    style={{
                      flex: 1, padding: '7px 0',
                      borderRadius: 8, border: `1px solid ${C.border}`,
                      background: C.bg2, cursor: 'pointer',
                      fontSize: 10, color: C.text3,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 2,
                      transition: 'all .15s',
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 10px', borderRadius: 8,
              background: alpha(color, 0.06), border: `1px solid ${alpha(color, 0.15)}`,
            }}>
              <span style={{ fontSize: 10, color }}>
                {fragment.user_reaction === 'resonates' ? '✓ 공명했어요'
                  : fragment.user_reaction === 'surprising' ? '! 놀라웠어요'
                  : '× 동의하지 않아요'}
              </span>
              <span style={{ fontSize: 9, color: C.text5, marginLeft: 'auto' }}>확인됨</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PersonaFragmentsSection() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: fragments, isLoading } = useQuery<PersonaFragmentRow[]>({
    queryKey: ['me-persona-fragments', user?.id],
    queryFn: () => getPersonaFragments(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 3,
  });

  const handleReact = async (
    id: string,
    reaction: 'resonates' | 'surprising' | 'disagree',
  ) => {
    await acknowledgeFragment(id, reaction);
    qc.invalidateQueries({ queryKey: ['me-persona-fragments', user?.id] });
  };

  if (isLoading) {
    return (
      <div className="vr-fade-in" style={{
        background: C.bg2, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '15px 17px',
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>
          발견된 나
        </span>
        <p style={{ fontSize: 11, color: C.text4, marginTop: 8, textAlign: 'center', padding: '16px 0' }}>
          불러오는 중...
        </p>
      </div>
    );
  }

  if (!fragments || fragments.length === 0) {
    return (
      <div className="vr-fade-in" style={{
        background: C.bg2, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '15px 17px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>
            발견된 나
          </span>
          <span style={{ fontSize: 9, color: C.text5 }}>모순 감지 엔진</span>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: `2px dashed ${C.border}`,
            margin: '0 auto 10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 18, color: C.text5 }}>?</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 300, color: C.text3, lineHeight: 1.5, marginBottom: 4 }}>
            아직 발견된 페르소나가 없어요
          </p>
          <p style={{ fontSize: 10, fontWeight: 300, color: C.text5, lineHeight: 1.5 }}>
            탐색을 계속하면 시스템이 당신 안의<br />
            모순을 감지하고 새로운 자아를 발견해 드려요.
          </p>
        </div>
      </div>
    );
  }

  const newCount = fragments.filter((f) => !f.is_acknowledged).length;

  return (
    <div className="vr-fade-in" style={{
      background: C.bg2, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '15px 17px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text }}>
            발견된 나
          </span>
          {newCount > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 9, padding: '2px 7px', borderRadius: 99,
              background: alpha('#ec4899', 0.12), color: '#ec4899',
              fontWeight: 500,
            }}>
              {newCount}개 새로 발견됨
            </span>
          )}
          <p style={{ fontSize: 10, fontWeight: 300, color: C.text4, marginTop: 2 }}>
            시스템이 당신의 응답 패턴에서 감지했어요
          </p>
        </div>
        <span style={{ fontSize: 9, color: C.text5 }}>{fragments.length}개</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fragments.map((fragment) => (
          <FragmentCard
            key={fragment.id}
            fragment={fragment}
            onReact={handleReact}
          />
        ))}
      </div>

      <p style={{
        fontSize: 9, fontWeight: 300, color: C.text5,
        textAlign: 'center', marginTop: 12, lineHeight: 1.5,
      }}>
        더 많이 탐색할수록 더 많은 내가 발견돼요.
      </p>
    </div>
  );
}
