import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/i18n/useT';

const CQ_STORAGE_KEY = 'veilor:cq-progress';

export default function CoreQuestions() {
  const navigate = useNavigate();
  const { user, setOnboardingStep } = useAuth();
  const t = useT();
  const s = t.coreQuestions;
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
          <div className="flex items-center gap-4 mb-3">
            <img src="/icon-192x192.png" alt="VEILOR" className="w-12 h-12 rounded-xl" />
            <h1 className="text-4xl font-bold tracking-widest" style={{ color: '#E0B48A', letterSpacing: '0.2em' }}>VEILOR</h1>
          </div>
          <p className="text-base font-light" style={{ color: '#B8B3AF' }}>{s.subtitle}</p>
        </div>
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
          <p className="text-xs font-medium" style={{ color: '#B8B3AF' }}>{s.sidebarTitle}</p>
          <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>
            {s.sidebarDesc1}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>
            {s.sidebarDesc2}
          </p>
          <div className="flex gap-1.5 pt-2">
            {QUESTIONS.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= current ? '#E0B48A' : '#3A3530' }} />
            ))}
          </div>
          <p className="text-xs" style={{ color: '#87817C' }}>{current + 1} / {QUESTIONS.length} {s.progressSuffix}</p>
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
              style={{ background: i <= current ? '#E0B48A' : '#292524' }}
            />
          ))}
        </div>

        <p className="text-xs mb-2" style={{ color: '#B8B3AF' }}>{current + 1} / {QUESTIONS.length}</p>
        <h2 className="text-xl font-semibold mb-8 leading-snug" style={{ color: '#F5F5F4' }}>{q.question}</h2>

        {q.type === 'choice' && (
          <div className="space-y-3">
            {q.options!.map(opt => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all"
                style={{
                  border: `1px solid ${answers[q.key] === opt ? '#E0B48A' : '#44403C'}`,
                  background: answers[q.key] === opt ? '#E0B48A10' : 'transparent',
                  color: answers[q.key] === opt ? '#E0B48A' : '#F5F5F4',
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
                background: '#E0B48A',
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
