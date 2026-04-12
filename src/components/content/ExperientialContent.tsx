// #63 체험형 콘텐츠 3종 + #64 성적 소통 콘텐츠 Lv.4~5
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';

const EXPERIENCES = [
  {
    id: 'mirror', type: '체험', title: '거울 실험',
    desc: '상대의 입장에서 나를 바라보는 3분 명상',
    steps: ['편안한 자세로 눈을 감으세요', '가장 최근 갈등이 있었던 사람을 떠올리세요', '그 사람의 눈으로 나를 바라보세요', '그 사람이 나에게 원하는 것은 무엇일까요?', '천천히 눈을 뜨고, 느낀 것을 기록하세요'],
    duration: '3분',
    level: 3,
  },
  {
    id: 'letter', type: '체험', title: '보내지 않을 편지',
    desc: '말하지 못한 것을 글로 써보는 감정 정화',
    steps: ['전하고 싶은 사람을 정하세요', '"친애하는..."으로 시작하세요', '절대 보내지 않을 거라고 다짐하세요', '숨기고 있던 모든 것을 써보세요', '다 쓰면 한 번 읽고, 손에서 놓으세요'],
    duration: '10분',
    level: 2,
  },
  {
    id: 'timeline', type: '체험', title: '관계 타임라인',
    desc: '중요한 관계 사건들을 시간 순으로 나열',
    steps: ['종이를 가로로 놓으세요', '왼쪽에 가장 오래된 관계 기억을 적으세요', '오른쪽으로 이동하며 중요 사건을 표시하세요', '행복했던 순간은 위로, 아팠던 순간은 아래로', '반복되는 패턴이 있나요?'],
    duration: '15분',
    level: 2,
  },
  {
    id: 'boundaries', type: '소통', title: '친밀한 관계의 경계 대화',
    desc: '파트너와 안전하게 경계를 논의하는 가이드',
    steps: ['서로 편안한 시간을 정하세요', '"나는 이럴 때 불편해"로 시작하세요', '상대의 반응을 판단하지 않고 들으세요', '서로의 경계를 존중하는 합의를 만드세요', '정기적으로 재확인하기로 약속하세요'],
    duration: '20분',
    level: 4,
  },
  {
    id: 'desire', type: '소통', title: '욕구 표현 연습',
    desc: '원하는 것을 솔직하게 전달하는 안전한 연습',
    steps: ['혼자만의 공간에서 시작하세요', '"내가 정말 원하는 것은..."을 완성하세요', '왜 이것을 원하는지 탐색하세요', '상대에게 전달할 방법을 연습하세요', '거절당해도 괜찮다는 것을 기억하세요'],
    duration: '10분',
    level: 5,
  },
];

// content_items DB UUID 매핑 (veilor.content_items에 등록된 UUID)
const CONTENT_DB_IDS: Record<string, string> = {
  mirror:     'a1b2c3d4-0001-0000-0000-000000000001',
  letter:     'a1b2c3d4-0002-0000-0000-000000000002',
  timeline:   'a1b2c3d4-0003-0000-0000-000000000003',
  boundaries: 'a1b2c3d4-0004-0000-0000-000000000004',
  desire:     'a1b2c3d4-0005-0000-0000-000000000005',
};

// 콘텐츠별 연결 탭 매핑
const CONTENT_TO_TAB: Record<string, { tab: string; prompt: string }> = {
  mirror: { tab: 'dig', prompt: '거울 실험을 해봤어요. 상대의 입장에서 나를 바라봤을 때 느낀 점을 이야기하고 싶어요.' },
  letter: { tab: 'vent', prompt: '보내지 않을 편지 쓰기를 해봤어요. 써놓고 나니 마음이 복잡해요.' },
  timeline: { tab: 'dig', prompt: '관계 타임라인을 그려봤어요. 반복되는 패턴이 보이는 것 같은데 같이 탐색해보고 싶어요.' },
  boundaries: { tab: 'set', prompt: '경계 대화 연습을 해봤어요. 실제로 어떻게 말해야 할지 도움이 필요해요.' },
  desire: { tab: 'vent', prompt: '욕구 표현 연습을 해봤어요. 내가 원하는 게 뭔지 생각해보니 느끼는 게 있어요.' },
};

export default function ExperientialContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<typeof EXPERIENCES[0] | null>(null);
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

  const filtered = levelFilter ? EXPERIENCES.filter(e => e.level <= levelFilter) : EXPERIENCES;

  if (selected) {
    return (
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{selected.title}</p>
          <button onClick={() => { setSelected(null); setCurrentStep(0); }} className="text-xs text-muted-foreground">닫기</button>
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
          <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}
            className="flex-1 text-xs py-2 border rounded-lg disabled:opacity-30">이전</button>
          <button
            onClick={() => {
              if (currentStep === selected.steps.length - 1) {
                setCompleted(prev => [...prev, selected.id]);
                recordCompletion(selected.id);
              } else {
                setCurrentStep(s => Math.min(selected.steps.length - 1, s + 1));
              }
            }}
            className="flex-1 text-xs py-2 bg-primary text-white rounded-lg">
            {currentStep === selected.steps.length - 1 ? '완료' : '다음'}
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
          return (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-medium text-primary">이 경험, 대화로 이어갈까요?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                방금 한 체험에서 느낀 점을 AI와 함께 탐색해보세요.
              </p>
              <button
                onClick={() => navigate(route, { state: { prefillText: link.prompt } })}
                className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              >
                {link.tab === 'vent' ? 'Vent 탭에서 이야기하기' : link.tab === 'dig' ? 'Dig 탭에서 탐색하기' : 'Set 탭에서 실천 설계하기'}
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
        <p className="text-sm font-medium">체험형 콘텐츠</p>
        <div className="flex gap-1">
          {[null, 3, 5].map(l => (
            <button key={l ?? 'all'} onClick={() => setLevelFilter(l)}
              className={`text-[10px] px-2 py-0.5 rounded-full ${levelFilter === l ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              {l === null ? '전체' : `Lv.${l}이하`}
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
