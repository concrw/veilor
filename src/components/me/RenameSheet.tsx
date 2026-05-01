import { useState, useEffect } from 'react';
import { C } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: { closeLabel: '시트 닫기', closeBtn: '닫기', hint: '이 캐릭터를 뭐라고 부를까요? 언제든 바꿀 수 있어요.', srLabel: '새 이름', placeholder: '새 이름을 입력해요...', apply: '적용하기' },
  en: { closeLabel: 'Close sheet', closeBtn: 'Close', hint: "What would you like to call this character? You can change it anytime.", srLabel: 'New name', placeholder: 'Enter a new name...', apply: 'Apply' },
};

function RenameSheet({
  open, onClose, title, currentName, onApply,
}: {
  open: boolean; onClose: () => void; title: string; currentName: string; onApply: (n: string) => void;
}) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [val, setVal] = useState('');
  useEffect(() => { if (open) setVal(currentName); }, [open, currentName]);

  return (
    <>
      <div role="button" tabIndex={0} aria-label={s.closeLabel} onClick={onClose} onKeyDown={e => e.key === 'Enter' && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none', transition: 'opacity .3s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: C.bg,
        borderRadius: '22px 22px 0 0', border: `1px solid #44403C`, borderBottom: 'none',
        zIndex: 51, maxHeight: '50%', display: 'flex', flexDirection: 'column',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ width: 32, height: 3, borderRadius: 99, background: C.border, margin: '10px auto 0', flexShrink: 0 }} />
        <div style={{ padding: '12px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border2}`, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 18, color: C.text }}>{title}</span>
          <button aria-label={s.closeBtn} onClick={onClose} style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', color: C.text4, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 11, color: C.text4 }}>{s.hint}</p>
          <label htmlFor="rename-input" className="sr-only">{s.srLabel}</label>
          <input
            id="rename-input"
            value={val} onChange={e => setVal(e.target.value)}
            placeholder={s.placeholder}
            style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 13px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.text2, outline: 'none', width: '100%' }}
          />
          <button
            onClick={() => { if (val.trim()) { onApply(val.trim()); onClose(); } }}
            style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', background: C.amberGold, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, color: C.bg, cursor: 'pointer' }}
          >{s.apply}</button>
        </div>
      </div>
    </>
  );
}

export default RenameSheet;
