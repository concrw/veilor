// #10 고민 유형 분기 — 고민 카테고리별 맞춤 경로 안내
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/useT';

export default function ConcernRouter() {
  const navigate = useNavigate();
  const t = useT();
  const s = t.concernRouter;
  const [selected, setSelected] = useState<string | null>(null);

  const concern = s.concerns.find(c => c.id === selected);

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <p className="text-xs text-muted-foreground">{s.title}</p>

      <div className="grid grid-cols-3 gap-2">
        {s.concerns.map(c => (
          <button key={c.id} onClick={() => setSelected(c.id)}
            aria-label={`${c.label}`}
            aria-pressed={selected === c.id}
            className={`rounded-xl p-2.5 text-center transition-all ${
              selected === c.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50 border border-transparent'
            }`}>
            <span className="text-lg block" aria-hidden="true">{c.icon}</span>
            <p className="text-[10px] mt-1">{c.label}</p>
          </button>
        ))}
      </div>

      {concern && (
        <button onClick={() => navigate(concern.route)}
          className="w-full bg-primary/5 border border-primary/20 rounded-xl p-3 text-left hover:bg-primary/10 transition-colors">
          <p className="text-xs font-medium text-primary">{concern.desc}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{concern.label} → {concern.route.split('/').pop()} {s.tabSuffix}</p>
        </button>
      )}
    </div>
  );
}
