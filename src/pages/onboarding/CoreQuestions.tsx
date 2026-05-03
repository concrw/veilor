import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    subtitle: '관계의 가면을 발견하는 여정',
    sidebarTitle: '핵심 질문이란?',
    sidebarDesc1: '4가지 질문을 통해 당신의 관계 목표, 감정 처리 방식, 관계 스타일을 파악합니다.',
    sidebarDesc2: '솔직하게 답할수록 V-File 진단이 더 정확해집니다.',
    progressSuffix: '완료',
    toastTitle: '저장 실패',
    toastDesc: '잠시 후 다시 시도해 주세요.',
    btnStart: '분석 시작하기',
    btnNext: '다음',
    questions: [
      {
        key: 'relationship_goal',
        question: '지금 관계에서 가장 원하는 것은?',
        type: 'choice' as const,
        options: ['더 깊은 이해', '성장', '연결감', '치유'],
      },
      {
        key: 'current_challenge',
        question: '관계에서 반복되는 어려움이 있다면? (선택)',
        type: 'text' as const,
        placeholder: '자유롭게 적어주세요 (최대 200자)',
      },
      {
        key: 'emotion_style',
        question: '나는 주로 어떻게 감정을 처리하나요?',
        type: 'choice' as const,
        options: ['혼자 생각 정리', '대화로 해소', '행동으로 전환', '시간이 지나면서'],
      },
      {
        key: 'relationship_style',
        question: '관계를 대할 때 나의 스타일은?',
        type: 'choice' as const,
        options: ['분석적으로 파악', '감정으로 공감', '실용적으로 해결'],
      },
    ],
  },
  en: {
    subtitle: 'A journey to discover your relational mask',
    sidebarTitle: 'What are Core Questions?',
    sidebarDesc1: 'Four questions to understand your relationship goals, emotional processing style, and relational approach.',
    sidebarDesc2: 'The more honest your answers, the more accurate your V-File diagnosis.',
    progressSuffix: 'done',
    toastTitle: 'Save failed',
    toastDesc: 'Please try again in a moment.',
    btnStart: 'Start analysis',
    btnNext: 'Next',
    questions: [
      {
        key: 'relationship_goal',
        question: 'What do you want most from a relationship right now?',
        type: 'choice' as const,
        options: ['Deeper understanding', 'Growth', 'Connection', 'Healing'],
      },
      {
        key: 'current_challenge',
        question: 'Any recurring difficulties in relationships? (optional)',
        type: 'text' as const,
        placeholder: 'Write freely (up to 200 characters)',
      },
      {
        key: 'emotion_style',
        question: 'How do you usually process emotions?',
        type: 'choice' as const,
        options: ['Think it through alone', 'Talk it out', 'Channel into action', 'Let time pass'],
      },
      {
        key: 'relationship_style',
        question: 'What is your style when approaching relationships?',
        type: 'choice' as const,
        options: ['Analytical understanding', 'Empathetic feeling', 'Practical problem-solving'],
      },
    ],
  },
};

const CQ_STORAGE_KEY = 'veilor:cq-progress';

export default function CoreQuestions() {
  const navigate = useNavigate();
  const { user, setOnboardingStep } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const QUESTIONS = s.questions;

  const [current, setCurrent] = useState(() => {
    try { return JSON.parse(safeGetItem(CQ_STORAGE_KEY) ?? '{}').current ?? 0; } catch { console.warn('[CoreQuestions] Failed to parse stored answers'); return 0; }
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try { return JSON.parse(safeGetItem(CQ_STORAGE_KEY) ?? '{}').answers ?? {}; } catch { console.warn('[CoreQuestions] Failed to parse stored answers'); return {}; }
  });

  useEffect(() => {
    safeSetItem(CQ_STORAGE_KEY, JSON.stringify({ current, answers }));
  }, [current, answers]);

  const q = QUESTIONS[current];
  const isLast = current === QUESTIONS.length - 1;

  const handleSelect = async (value: string) => {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (!isLast) {
      setCurrent(current + 1);
    } else {
      await saveAndProceed(next);
    }
  };

  const handleTextNext = async () => {
    const next = { ...answers };
    if (!next[q.key]) next[q.key] = '';
    setAnswers(next);
    if (!isLast) {
      setCurrent(current + 1);
    } else {
      await saveAndProceed(next);
    }
  };

  const saveAndProceed = async (data: Record<string, string>) => {
    if (user) {
      const rows = Object.entries(data).map(([k, v]) => ({
        user_id: user.id, question_key: k, response_value: v,
      }));
      const { error } = await veilorDb.from('cq_responses').upsert(rows);
      if (error) {
        toast({ title: s.toastTitle, description: s.toastDesc, variant: 'destructive' });
        return;
      }
    }
    safeRemoveItem(CQ_STORAGE_KEY);
    await setOnboardingStep('priper');
    navigate('/onboarding/vfile/start');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14" style={{ borderRight: '1px solid #2A2624' }}>
        <div>
          <h1 className="text-4xl font-bold tracking-widest mb-3" style={{ color: '#D4A574', letterSpacing: '0.2em' }}>VEILOR</h1>
          <p className="text-base font-light" style={{ color: '#A8A29E' }}>{s.subtitle}</p>
        </div>
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
          <p className="text-xs font-medium" style={{ color: '#A8A29E' }}>{s.sidebarTitle}</p>
          <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>
            {s.sidebarDesc1}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>
            {s.sidebarDesc2}
          </p>
          <div className="flex gap-1.5 pt-2">
            {QUESTIONS.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= current ? '#D4A574' : '#3A3530' }} />
            ))}
          </div>
          <p className="text-xs" style={{ color: '#57534E' }}>{current + 1} / {QUESTIONS.length} {s.progressSuffix}</p>
        </div>
        <p className="text-xs" style={{ color: '#44403C' }}>© 2026 VEILOR</p>
      </div>

      {/* 우측 콘텐츠 영역 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[480px] items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full flex-1 flex flex-col">
        {/* 진행바 */}
        <div className="flex gap-1.5 mb-10">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: i <= current ? '#D4A574' : '#292524' }}
            />
          ))}
        </div>

        <p className="text-xs mb-2" style={{ color: '#A8A29E' }}>{current + 1} / {QUESTIONS.length}</p>
        <h2 className="text-xl font-semibold mb-8 leading-snug" style={{ color: '#F5F5F4' }}>{q.question}</h2>

        {q.type === 'choice' && (
          <div className="space-y-3">
            {q.options!.map(opt => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all"
                style={{
                  border: `1px solid ${answers[q.key] === opt ? '#D4A574' : '#44403C'}`,
                  background: answers[q.key] === opt ? '#D4A57410' : 'transparent',
                  color: answers[q.key] === opt ? '#D4A574' : '#F5F5F4',
                  fontWeight: answers[q.key] === opt ? 500 : 400,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === 'text' && (
          <div className="space-y-4">
            <textarea
              placeholder={q.placeholder}
              maxLength={200}
              value={answers[q.key] ?? ''}
              onChange={e => setAnswers({ ...answers, [q.key]: e.target.value })}
              className="w-full h-32 resize-none rounded-xl p-3 text-sm outline-none"
              style={{
                background: '#292524',
                border: '1px solid #44403C',
                color: '#F5F5F4',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={handleTextNext}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{
                background: '#D4A574',
                color: '#1C1917',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isLast ? s.btnStart : s.btnNext}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
