// #69 밀라르쉬 외부 콘텐츠 — 스레드 활용 관계 심리 콘텐츠
import { useState } from 'react';
import { useLanguageContext } from '@/context/LanguageContext';

interface ContentItem {
  id: string;
  title: string;
  source: string;
  category: string;
  url?: string;
  summary: string;
}

const S = {
  ko: {
    content: [
      {
        id: '1', title: '회피형 애착이 관계에서 하는 5가지 행동', source: '관계심리학',
        category: '애착', summary: '회피형 애착 유형이 무의식적으로 반복하는 패턴과 그 이면의 심리',
      },
      {
        id: '2', title: '갈등 후 관계 회복의 3단계', source: '커뮤니케이션 연구',
        category: '소통', summary: '건강한 갈등 해결을 위한 단계적 접근법',
      },
      {
        id: '3', title: '경계 설정이 어려운 사람들의 공통점', source: '자기돌봄 가이드',
        category: '역할', summary: '경계를 설정하지 못하는 심리적 원인과 첫 번째 실천법',
      },
      {
        id: '4', title: '사랑의 언어와 욕구 표현의 차이', source: '관계 전문가',
        category: '욕구표현', summary: '상대에게 원하는 것을 전달하는 것과 사랑의 언어의 관계',
      },
      {
        id: '5', title: '재진단이 보여주는 것: 변하지 않는 나 vs 성장하는 나', source: 'VEILOR',
        category: '성장', summary: 'V-File 재진단 결과가 달라졌다면, 그것이 의미하는 것',
      },
    ] as ContentItem[],
    categories: ['전체', '애착', '소통', '역할', '욕구표현', '성장'],
    allCategory: '전체',
    sectionTitle: '관계 인사이트',
    curation: '큐레이션',
  },
  en: {
    content: [
      {
        id: '1', title: '5 Behaviors of Avoidant Attachment in Relationships', source: 'Relationship Psychology',
        category: 'Attachment', summary: 'Patterns unconsciously repeated by avoidant attachment types and the psychology behind them',
      },
      {
        id: '2', title: '3 Stages of Relationship Recovery After Conflict', source: 'Communication Research',
        category: 'Communication', summary: 'A step-by-step approach to healthy conflict resolution',
      },
      {
        id: '3', title: 'What People Who Struggle to Set Boundaries Have in Common', source: 'Self-Care Guide',
        category: 'Roles', summary: 'Psychological reasons for difficulty setting limits and the first practice step',
      },
      {
        id: '4', title: 'Love Languages vs. Expressing Needs', source: 'Relationship Expert',
        category: 'Needs', summary: 'The relationship between conveying what you want and love languages',
      },
      {
        id: '5', title: 'What Re-diagnosis Reveals: The Unchanging You vs. The Growing You', source: 'VEILOR',
        category: 'Growth', summary: 'What it means when your V-File re-diagnosis results change',
      },
    ] as ContentItem[],
    categories: ['All', 'Attachment', 'Communication', 'Roles', 'Needs', 'Growth'],
    allCategory: 'All',
    sectionTitle: 'Relationship Insights',
    curation: 'Curated',
  },
} as const;

export default function ExternalContentFeed() {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
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
