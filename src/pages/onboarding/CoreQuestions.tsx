import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

const CQ_STORAGE_KEY = 'veilor:cq-progress';

const QUESTIONS = [
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
];

export default function CoreQuestions() {
  const navigate = useNavigate();
  const { user, setOnboardingStep } = useAuth();
  const [current, setCurrent] = useState(() => {
    try { return JSON.parse(safeGetItem(CQ_STORAGE_KEY) ?? '{}').current ?? 0; } catch { return 0; }
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try { return JSON.parse(safeGetItem(CQ_STORAGE_KEY) ?? '{}').answers ?? {}; } catch { return {}; }
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
        toast({ title: '저장 실패', description: '잠시 후 다시 시도해 주세요.', variant: 'destructive' });
        return;
      }
    }
    safeRemoveItem(CQ_STORAGE_KEY);
    await setOnboardingStep('priper');
    navigate('/onboarding/vfile/start');
  };

  return (
    <div
      className="min-h-screen flex flex-col px-6 py-12"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col">
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
              {isLast ? '분석 시작하기' : '다음'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
