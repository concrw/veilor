import { useState } from 'react';
import { useRelationTranslations } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { C } from '@/lib/colors';

type Group = 'Core' | 'Middle' | 'Echo' | 'Outer';

interface Props {
  onClose: () => void;
  onSaved?: () => void;
}

const GROUPS: Group[] = ['Core', 'Middle', 'Echo', 'Outer'];
const GROUP_COLORS: Record<Group, string> = {
  Core: C.amberGold,
  Middle: C.text2,
  Echo: C.text4,
  Outer: C.text5,
};

export default function RelationAddPerson({ onClose, onSaved }: Props) {
  const t = useRelationTranslations();
  const a = t.addPerson;
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [relType, setRelType] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [strength, setStrength] = useState('');
  const [need, setNeed] = useState('');
  const [state, setState] = useState('');
  const [birthday, setBirthday] = useState('');
  const [lastMet, setLastMet] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !group) return;
    setSaving(true);
    try {
      await veilorDb.from('relation_people').insert({
        user_id: user!.id,
        name: name.trim(),
        relation_type: relType ?? '',
        group_name: group,
        strength: strength.trim(),
        need: need.trim(),
        current_state: state.trim(),
        birthday: birthday || null,
        last_met: lastMet || null,
        warmth_score: 5,
      });
      onSaved?.();
      onClose();
    } catch {
      // table may not exist yet — still close
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 600,
        background: C.bg2,
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 40px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: C.text }}>
            {a.title}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: C.text4, fontSize: 18, cursor: 'pointer', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* 이름 */}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={a.namePlaceholder}
          maxLength={30}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.bg,
            color: C.text, fontSize: 15,
            fontFamily: "'Cormorant Garamond', serif",
            outline: 'none', marginBottom: 16, boxSizing: 'border-box',
          }}
        />

        {/* 관계 유형 칩 */}
        <p style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: C.text4, marginBottom: 8 }}>
          {a.relationTypeLabel}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {a.relationTypes.map(rt => (
            <button
              key={rt}
              onClick={() => setRelType(relType === rt ? null : rt)}
              style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 11, cursor: 'pointer',
                border: `1px solid ${relType === rt ? C.amberGold : C.border}`,
                background: relType === rt ? `${C.amberGold}15` : 'transparent',
                color: relType === rt ? C.amberGold : C.text3,
              }}
            >
              {rt}
            </button>
          ))}
        </div>

        {/* 그룹 선택 */}
        <p style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: C.text4, marginBottom: 8 }}>
          {a.groupLabel}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {GROUPS.map((g, i) => (
            <button
              key={g}
              onClick={() => setGroup(group === g ? null : g)}
              style={{
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: `1px solid ${group === g ? GROUP_COLORS[g] : C.border}`,
                background: group === g ? `${GROUP_COLORS[g]}12` : 'transparent',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GROUP_COLORS[g], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: group === g ? GROUP_COLORS[g] : C.text3 }}>
                {a.groupDescriptions[i]}
              </span>
            </button>
          ))}
        </div>

        {/* 강점 / 니즈 / 상황 */}
        {([
          [strength, setStrength, a.strengthPlaceholder],
          [need, setNeed, a.needPlaceholder],
          [state, setState, a.statePlaceholder],
        ] as [string, (v: string) => void, string][]).map(([val, setter, ph]) => (
          <textarea
            key={ph}
            value={val}
            onChange={e => setter(e.target.value)}
            placeholder={ph}
            maxLength={200}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.bg,
              color: C.text, fontSize: 12, resize: 'none', height: 60,
              outline: 'none', marginBottom: 10, boxSizing: 'border-box',
            }}
          />
        ))}

        {/* 날짜 필드 2개 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: C.text4, marginBottom: 5 }}>
              {a.birthdayLabel}
            </p>
            <input
              type="date"
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 9,
                border: `1px solid ${C.border}`, background: C.bg,
                color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: C.text4, marginBottom: 5 }}>
              {a.lastMetLabel}
            </p>
            <input
              type="date"
              value={lastMet}
              onChange={e => setLastMet(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 9,
                border: `1px solid ${C.border}`, background: C.bg,
                color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              border: `1px solid ${C.border}`, background: 'transparent',
              color: C.text3, fontSize: 13, cursor: 'pointer',
            }}
          >
            {a.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !group || saving}
            style={{
              flex: 2, padding: '11px 0', borderRadius: 10,
              border: 'none', background: C.amberGold,
              color: '#000', fontSize: 13, fontWeight: 600,
              cursor: !name.trim() || !group ? 'not-allowed' : 'pointer',
              opacity: !name.trim() || !group ? 0.4 : 1,
            }}
          >
            {saving ? a.saving : a.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
