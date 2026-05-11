// #69 밀라르쉬 외부 콘텐츠 — 스레드 활용 관계 심리 콘텐츠
import { useState } from 'react';
import { useT } from '@/i18n/useT';

interface ContentItem {
  id: string;
  title: string;
  source: string;
  category: string;
  url?: string;
  summary: string;
}

export default function ExternalContentFeed() {
  const t = useT();
  const s = t.communityDomain.externalContentFeed;
  const [category, setCategory] = useState(s.allCategory);

  const filtered = category === s.allCategory
    ? s.content
    : s.content.filter(c => c.category === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{s.sectionTitle}</p>
        <span className="text-[10px] text-muted-foreground">{s.curation}</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {s.categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap transition-colors ${
              category === cat ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="bg-card border rounded-xl p-4 space-y-1.5 cursor-pointer hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{item.category}</span>
              <span className="text-[10px] text-muted-foreground">{item.source}</span>
            </div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
