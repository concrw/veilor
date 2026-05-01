// #63 체험형 콘텐츠 3종 + #64 성적 소통 콘텐츠 Lv.4~5
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    close: '닫기',
    prev: '이전',
    next: '다음',
    complete: '완료',
    ctaTitle: '이 경험, 대화로 이어갈까요?',
    ctaDesc: '방금 한 체험에서 느낀 점을 AI와 함께 탐색해보세요.',
    ctaVent: 'Vent 탭에서 이야기하기',
    ctaDig: 'Dig 탭에서 탐색하기',
    ctaSet: 'Set 탭에서 실천 설계하기',
    listTitle: '체험형 콘텐츠',
    filterAll: '전체',
    filterLv: (n: number) => `Lv.${n}이하`,
    experiences: [
      {
        id: 'mirror', type: '체험', title: '거울 실험',
        desc: '상대의 입장에서 나를 바라보는 3분 명상',
        steps: ['편안한 자세로 눈을 감으세요', '가장 최근 갈등이 있었던 사람을 떠올리세요', '그 사람의 눈으로 나를 바라보세요', '그 사람이 나에게 원하는 것은 무엇일까요?', '천천히 눈을 뜨고, 느낀 것을 기록하세요'],
        duration: '3분', level: 3,
      },
      {
        id: 'letter', type: '체험', title: '보내지 않을 편지',
        desc: '말하지 못한 것을 글로 써보는 감정 정화',
        steps: ['전하고 싶은 사람을 정하세요', '"친애하는..."으로 시작하세요', '절대 보내지 않을 거라고 다짐하세요', '숨기고 있던 모든 것을 써보세요', '다 쓰면 한 번 읽고, 손에서 놓으세요'],
        duration: '10분', level: 2,
      },
      {
        id: 'timeline', type: '체험', title: '관계 타임라인',
        desc: '중요한 관계 사건들을 시간 순으로 나열',
        steps: ['종이를 가로로 놓으세요', '왼쪽에 가장 오래된 관계 기억을 적으세요', '오른쪽으로 이동하며 중요 사건을 표시하세요', '행복했던 순간은 위로, 아팠던 순간은 아래로', '반복되는 패턴이 있나요?'],
        duration: '15분', level: 2,
      },
      {
        id: 'boundaries', type: '소통', title: '친밀한 관계의 경계 대화',
        desc: '파트너와 안전하게 경계를 논의하는 가이드',
        steps: ['서로 편안한 시간을 정하세요', '"나는 이럴 때 불편해"로 시작하세요', '상대의 반응을 판단하지 않고 들으세요', '서로의 경계를 존중하는 합의를 만드세요', '정기적으로 재확인하기로 약속하세요'],
        duration: '20분', level: 4,
      },
      {
        id: 'desire', type: '소통', title: '욕구 표현 연습',
        desc: '원하는 것을 솔직하게 전달하는 안전한 연습',
        steps: ['혼자만의 공간에서 시작하세요', '"내가 정말 원하는 것은..."을 완성하세요', '왜 이것을 원하는지 탐색하세요', '상대에게 전달할 방법을 연습하세요', '거절당해도 괜찮다는 것을 기억하세요'],
        duration: '10분', level: 5,
      },
    ],
    prompts: {
      mirror: '거울 실험을 해봤어요. 상대의 입장에서 나를 바라봤을 때 느낀 점을 이야기하고 싶어요.',
      letter: '보내지 않을 편지 쓰기를 해봤어요. 써놓고 나니 마음이 복잡해요.',
      timeline: '관계 타임라인을 그려봤어요. 반복되는 패턴이 보이는 것 같은데 같이 탐색해보고 싶어요.',
      boundaries: '경계 대화 연습을 해봤어요. 실제로 어떻게 말해야 할지 도움이 필요해요.',
      desire: '욕구 표현 연습을 해봤어요. 내가 원하는 게 뭔지 생각해보니 느끼는 게 있어요.',
    },
  },
  en: {
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    complete: 'Done',
    ctaTitle: 'Want to continue this experience in a conversation?',
    ctaDesc: 'Explore what you felt with AI right after this exercise.',
    ctaVent: 'Talk in Vent',
    ctaDig: 'Explore in Dig',
    ctaSet: 'Design action in Set',
    listTitle: 'Experiential Content',
    filterAll: 'All',
    filterLv: (n: number) => `Lv.${n} or below`,
    experiences: [
      {
        id: 'mirror', type: 'Exercise', title: 'Mirror Experiment',
        desc: 'A 3-minute meditation to see yourself from another\'s perspective',
        steps: ['Close your eyes and find a comfortable position', 'Think of a person you had a recent conflict with', 'See yourself through their eyes', 'What do they want from you?', 'Slowly open your eyes and write down what you felt'],
        duration: '3 min', level: 3,
      },
      {
        id: 'letter', type: 'Exercise', title: 'Letter Never Sent',
        desc: 'Write what you couldn\'t say — an emotional release',
        steps: ['Choose the person you want to address', 'Start with "Dear..."', 'Promise yourself you\'ll never send it', 'Write everything you\'ve been holding back', 'Read it once, then let it go'],
        duration: '10 min', level: 2,
      },
      {
        id: 'timeline', type: 'Exercise', title: 'Relationship Timeline',
        desc: 'Map key relationship events in chronological order',
        steps: ['Place a sheet of paper horizontally', 'Write your oldest relationship memory on the left', 'Move right, marking significant events', 'Happy moments go up, painful ones go down', 'Do you see any recurring patterns?'],
        duration: '15 min', level: 2,
      },
      {
        id: 'boundaries', type: 'Communication', title: 'Boundary Conversation',
        desc: 'A guide to safely discuss boundaries with a partner',
        steps: ['Choose a time when you\'re both comfortable', 'Start with "I feel uncomfortable when..."', 'Listen to their response without judgment', 'Create an agreement that respects both boundaries', 'Promise to revisit regularly'],
        duration: '20 min', level: 4,
      },
      {
        id: 'desire', type: 'Communication', title: 'Expressing Desires',
        desc: 'A safe practice for honestly sharing what you want',
        steps: ['Start in a private space on your own', 'Complete the sentence: "What I truly want is..."', 'Explore why you want it', 'Practice how to communicate it to someone else', 'Remember that it\'s okay to be turned down'],
        duration: '10 min', level: 5,
      },
    ],
    prompts: {
      mirror: 'I tried the Mirror Experiment. I want to talk about what I felt when I saw myself through the other person\'s eyes.',
      letter: 'I wrote a letter I\'ll never send. Now that it\'s done, my feelings are complicated.',
      timeline: 'I drew a relationship timeline. I think I can see recurring patterns — I\'d like to explore them together.',
      boundaries: 'I practiced a boundary conversation. I need help with how to actually say it.',
      desire: 'I did the desire expression exercise. Thinking about what I really want brought up some feelings.',
    },
  },
};

// content_items DB UUID 매핑 (veilor.content_items에 등록된 UUID)
const CONTENT_DB_IDS: Record<string, string> = {
  mirror:     'a1b2c3d4-0001-0000-0000-000000000001',
  letter:     'a1b2c3d4-0002-0000-0000-000000000002',
  timeline:   'a1b2c3d4-0003-0000-0000-000000000003',
  boundaries: 'a1b2c3d4-0004-0000-0000-000000000004',
  desire:     'a1b2c3d4-0005-0000-0000-000000000005',
};

// 콘텐츠별 연결 탭 매핑
const CONTENT_TO_TAB: Record<string, { tab: string }> = {
  mirror:     { tab: 'dig' },
  letter:     { tab: 'vent' },
  timeline:   { tab: 'dig' },
  boundaries: { tab: 'set' },
  desire:     { tab: 'vent' },
};

export default function ExperientialContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  type ExperienceItem = typeof s.experiences[0];
  const [selected, setSelected] = useState<ExperienceItem | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  function recordCompletion(contentId: string) {
    if (!user) return;
    const dbId = CONTENT_DB_IDS[contentId];
    if (!dbId) return;
    veilorDb.from('content_consumption').insert({
      user_id: user.id,
      content_id: dbId,
      consumed_at: new Date().toISOString(),
      completion_rate: 1.0,
    }).then(({ error }) => { if (error) console.error('[content_consumption]', error); });
  }

  const filtered = levelFilter ? s.experiences.filter(e => e.level <= levelFilter) : s.experiences;

  if (selected) {
    return (
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{selected.title}</p>
          <button onClick={() => { setSelected(null); setCurrentStep(0); }} className="text-xs text-muted-foreground">{s.close}</button>
        </div>
        <p className="text-xs text-muted-foreground">{selected.desc}</p>
        <div className="space-y-2">
          {selected.steps.map((step, i) => (
            <div key={i} className={`flex gap-3 px-3 py-2.5 rounded-xl transition-all ${
              i === currentStep ? 'bg-primary/10 border border-primary/20' :
              i < currentStep ? 'bg-muted/30 opacity-60' : 'bg-muted/10 opacity-40'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                i < currentStep ? 'bg-primary text-white' : i === currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <p className="text-xs leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep === 0}
            className="flex-1 text-xs py-2 border rounded-lg disabled:opacity-30">{s.prev}</button>
          <button
            onClick={() => {
              if (currentStep === selected.steps.length - 1) {
                setCompleted(prev => [...prev, selected.id]);
                recordCompletion(selected.id);
              } else {
                setCurrentStep(prev => Math.min(selected.steps.length - 1, prev + 1));
              }
            }}
            className="flex-1 text-xs py-2 bg-primary text-white rounded-lg">
            {currentStep === selected.steps.length - 1 ? s.complete : s.next}
          </button>
        </div>

        {/* #6 콘텐츠→대화 연결 CTA */}
        {(currentStep === selected.steps.length - 1 || completed.includes(selected.id)) && (() => {
          const link = CONTENT_TO_TAB[selected.id];
          if (!link) return null;
          const tabRoutes: Record<string, string> = {
            vent: '/vent', dig: '/dig', set: '/set',
          };
          const route = tabRoutes[link.tab];
          if (!route) return null;
          const prompt = s.prompts[selected.id as keyof typeof s.prompts] ?? '';
          return (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-medium text-primary">{s.ctaTitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.ctaDesc}
              </p>
              <button
                onClick={() => navigate(route, { state: { prefillText: prompt } })}
                className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              >
                {link.tab === 'vent' ? s.ctaVent : link.tab === 'dig' ? s.ctaDig : s.ctaSet}
              </button>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{s.listTitle}</p>
        <div className="flex gap-1">
          {([null, 3, 5] as (number | null)[]).map(l => (
            <button key={l ?? 'all'} onClick={() => setLevelFilter(l)}
              className={`text-[10px] px-2 py-0.5 rounded-full ${levelFilter === l ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              {l === null ? s.filterAll : s.filterLv(l)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map(exp => (
          <button key={exp.id} onClick={() => setSelected(exp)}
            className="w-full bg-card border rounded-xl p-4 text-left hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{exp.type}</span>
                <span className="text-[10px] text-muted-foreground">Lv.{exp.level}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{exp.duration}</span>
            </div>
            <p className="text-sm font-medium">{exp.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{exp.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
