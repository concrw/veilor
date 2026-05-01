import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useSubmitCheckin } from '@/hooks/useB2BOrg';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    saveError: '저장 실패',
    saveErrorDesc: '다시 시도해주세요.',
    doneTitle: '오늘 체크인 완료!',
    doneSubtitle: '잘했어 👍',
    highAlert: '코치 선생님한테 연락이 갈 거야.',
    highAlertDesc: '지금 많이 힘들면 1393에 전화해도 돼. 항상 열려 있어.',
    mediumAlert: '코치 선생님이 곧 연락할 거야 💛',
    backBtn: '돌아가기',
    // 9~11세
    emoji911Title: '오늘 기분이 어때?',
    emoji911Sub: '하나를 골라봐',
    goodThingPrompt: '오늘 연습에서 잘한 것 하나 써볼래? (안 써도 돼)',
    goodThingPlaceholder: '예: 오늘 점프를 더 높이 뛰었어',
    doneBtn: '완료!',
    lowScoreMsg: '힘들다고 느끼는 건 자연스러운 거야. 코치 선생님이 도와줄 거야 💛',
    // 12~14세
    diaryTitle: '오늘 하고 싶은 말 있어?',
    diarySubtitle: '안 써도 돼. 소속사엔 안 보여.',
    diaryPlaceholder: '어떤 순간이 어려웠는지, 뭐가 좋았는지 자유롭게 써봐',
    prev: '이전',
    next: '다음',
    scaleLeft: '별로 그렇지 않아',
    scaleRight: '완전 그래!',
    // 15~17세
    optionalInput: '선택 입력',
    freeTextTitle: '지금 하고 싶은 말이 있나요?',
    freeTextSubtitle: '소속사에는 공개되지 않습니다.',
    freeTextPlaceholder: '자유롭게 적어보세요...',
    lastOne: '마지막으로',
    done2: '완료',
    // 이모지 옵션
    emojiOptions: [
      { emoji: '😄', label: '최고야!',   score: 9 },
      { emoji: '🙂', label: '괜찮아',    score: 7 },
      { emoji: '😐', label: '그냥저냥',  score: 5 },
      { emoji: '😟', label: '좀 힘들어', score: 3 },
      { emoji: '😢', label: '많이 힘들어', score: 1 },
    ],
    // 12~14 슬라이더 질문
    slider1214: [
      { key: 'c_control' as const,    q: '오늘 내 감정이 내 편인 것 같아?' },
      { key: 'c_commitment' as const, q: '지금 하고 있는 것에 계속하고 싶은 마음이 있어?' },
      { key: 'c_challenge' as const,  q: '어려운 일이 생겼을 때 해볼 수 있을 것 같아?' },
      { key: 'c_confidence' as const, q: '나 자신을 믿을 수 있어?' },
    ],
    // 15~17 축 질문
    axes1517: [
      { key: 'c_control' as const,    label: 'Control',    q: '지금 내 감정과 상황을 내가 조절하고 있다' },
      { key: 'c_commitment' as const, label: 'Commitment', q: '지금 내 목표를 향한 의지가 흔들리지 않는다' },
      { key: 'c_challenge' as const,  label: 'Challenge',  q: '지금 내가 마주한 어려움이 성장의 기회로 느껴진다' },
      { key: 'c_confidence' as const, label: 'Confidence', q: '지금 내 능력과 판단을 스스로 신뢰하고 있다' },
    ],
  },
  en: {
    saveError: 'Save failed',
    saveErrorDesc: 'Please try again.',
    doneTitle: "Today's Check-in Complete!",
    doneSubtitle: 'Great job 👍',
    highAlert: 'Your coach will be notified.',
    highAlertDesc: "If you're feeling very down, you can call 1393. It's always open.",
    mediumAlert: 'Your coach will contact you soon 💛',
    backBtn: 'Go Back',
    // 9~11
    emoji911Title: "How are you feeling today?",
    emoji911Sub: 'Pick one',
    goodThingPrompt: "Can you write one thing you did well in practice today? (No need to write)",
    goodThingPlaceholder: 'e.g. I jumped higher today',
    doneBtn: 'Done!',
    lowScoreMsg: "Feeling down is natural. Your coach will help you 💛",
    // 12~14
    diaryTitle: 'Anything you want to share today?',
    diarySubtitle: "You don't have to. It won't be shared with your organization.",
    diaryPlaceholder: 'Write freely about what was hard or what went well',
    prev: 'Previous',
    next: 'Next',
    scaleLeft: 'Not really',
    scaleRight: 'Definitely!',
    // 15~17
    optionalInput: 'Optional',
    freeTextTitle: 'Anything you want to share?',
    freeTextSubtitle: 'This will not be shared with your organization.',
    freeTextPlaceholder: 'Write freely...',
    lastOne: 'Last one',
    done2: 'Done',
    // emoji options
    emojiOptions: [
      { emoji: '😄', label: 'Amazing!',   score: 9 },
      { emoji: '🙂', label: "I'm okay",   score: 7 },
      { emoji: '😐', label: 'So-so',      score: 5 },
      { emoji: '😟', label: 'A bit hard', score: 3 },
      { emoji: '😢', label: 'Very hard',  score: 1 },
    ],
    // 12~14 slider questions
    slider1214: [
      { key: 'c_control' as const,    q: 'Do you feel like your emotions are on your side today?' },
      { key: 'c_commitment' as const, q: 'Do you still want to keep going with what you are doing?' },
      { key: 'c_challenge' as const,  q: 'When something difficult comes up, do you think you can handle it?' },
      { key: 'c_confidence' as const, q: 'Do you believe in yourself?' },
    ],
    // 15~17 axes
    axes1517: [
      { key: 'c_control' as const,    label: 'Control',    q: 'I am in control of my emotions and situation right now.' },
      { key: 'c_commitment' as const, label: 'Commitment', q: 'My commitment to my goals is unwavering right now.' },
      { key: 'c_challenge' as const,  label: 'Challenge',  q: 'The challenges I face right now feel like opportunities for growth.' },
      { key: 'c_confidence' as const, label: 'Confidence', q: 'I trust my own abilities and judgment right now.' },
    ],
  },
} as const;

// ─────────────────────────────────────────────
// 연령 그룹별 설정
// ─────────────────────────────────────────────
type AgeGroup = 'group_9_11' | 'group_12_14' | 'group_15_17';
type Scores = { c_control: number; c_commitment: number; c_challenge: number; c_confidence: number };

// ─────────────────────────────────────────────
// 9~11세 체크인
// ─────────────────────────────────────────────
function Checkin911({ onDone, s }: { onDone: (scores: Scores, text: string) => void; s: typeof S['ko'] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [goodThing, setGoodThing] = useState('');

  const selected = s.emojiOptions.find(o => o.score === picked);
  const score = picked ?? 5;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">{s.emoji911Title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{s.emoji911Sub}</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {s.emojiOptions.map(opt => (
          <button
            key={opt.score}
            onClick={() => setPicked(opt.score)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
              picked === opt.score
                ? 'border-primary bg-primary/5 scale-105 shadow'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span className="text-xs text-muted-foreground">{opt.label}</span>
          </button>
        ))}
      </div>

      {picked !== null && (
        <div className="space-y-3 animate-in fade-in">
          <p className="text-sm font-medium">{s.goodThingPrompt}</p>
          <textarea
            value={goodThing}
            onChange={e => setGoodThing(e.target.value)}
            placeholder={s.goodThingPlaceholder}
            rows={3}
            className="w-full border rounded-xl p-3 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <Button
        onClick={() => onDone({ c_control: score, c_commitment: score, c_challenge: score, c_confidence: score }, goodThing)}
        disabled={picked === null}
        className="w-full"
      >
        {s.doneBtn}
      </Button>

      {selected && picked !== null && picked <= 3 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
          {s.lowScoreMsg}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 12~14세 체크인
// ─────────────────────────────────────────────
function Checkin1214({ onDone, s }: { onDone: (scores: Scores, text: string) => void; s: typeof S['ko'] }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Scores>({ c_control: 5, c_commitment: 5, c_challenge: 5, c_confidence: 5 });
  const [diary, setDiary] = useState('');

  const questions = s.slider1214;
  const current = questions[step];

  const handleScore = (val: number) =>
    setScores(prev => ({ ...prev, [current.key]: val }));

  if (step >= questions.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">{s.diaryTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{s.diarySubtitle}</p>
        </div>
        <textarea
          value={diary}
          onChange={e => setDiary(e.target.value)}
          placeholder={s.diaryPlaceholder}
          rows={5}
          className="w-full border rounded-xl p-3 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(prev => prev - 1)} className="flex-1">{s.prev}</Button>
          <Button onClick={() => onDone(scores, diary)} className="flex-1">{s.doneBtn}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 진행 */}
      <div className="flex gap-1">
        {questions.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      <div>
        <h1 className="text-lg font-semibold">{current.q}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {step + 1} / {questions.length}
        </p>
      </div>

      {/* 1~10 버튼 */}
      <div className="space-y-3">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => handleScore(n)}
              className={`h-10 rounded-lg text-sm font-medium transition-all ${
                scores[current.key] === n
                  ? 'bg-primary text-primary-foreground scale-110 shadow'
                  : 'bg-muted text-muted-foreground hover:bg-primary/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{s.scaleLeft}</span>
          <span>{s.scaleRight}</span>
        </div>
        <p className="text-center text-3xl font-bold text-primary">{scores[current.key]}</p>
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(prev => prev - 1)} className="flex-1">{s.prev}</Button>
        )}
        <Button onClick={() => setStep(prev => prev + 1)} className="flex-1">{s.next}</Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 15~17세 체크인 (성인과 동일 구조)
// ─────────────────────────────────────────────
function Checkin1517({ onDone, s }: { onDone: (scores: Scores, text: string) => void; s: typeof S['ko'] }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Scores>({ c_control: 5, c_commitment: 5, c_challenge: 5, c_confidence: 5 });
  const [freeText, setFreeText] = useState('');

  const axes = s.axes1517;
  const current = axes[step];

  if (step >= axes.length) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{s.optionalInput}</p>
          <h1 className="text-xl font-bold">{s.freeTextTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{s.freeTextSubtitle}</p>
        </div>
        <textarea
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          placeholder={s.freeTextPlaceholder}
          rows={5}
          className="w-full border rounded-xl p-3 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(prev => prev - 1)} className="flex-1">{s.prev}</Button>
          <Button onClick={() => onDone(scores, freeText)} className="flex-1">{s.done2}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-1">
        {axes.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-primary uppercase tracking-wider">{current.label}</p>
        <h1 className="text-lg font-semibold leading-snug">{current.q}</h1>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setScores(prev => ({ ...prev, [current.key]: n }))}
              className={`h-10 rounded-lg text-sm font-medium transition-all ${
                scores[current.key] === n
                  ? 'bg-primary text-primary-foreground scale-110 shadow'
                  : 'bg-muted text-muted-foreground hover:bg-primary/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-center text-3xl font-bold text-primary">{scores[current.key]}</p>
      </div>
      <div className="flex gap-3">
        {step > 0 && <Button variant="outline" onClick={() => setStep(prev => prev - 1)} className="flex-1">{s.prev}</Button>}
        <Button onClick={() => setStep(prev => prev + 1)} className="flex-1">
          {step < axes.length - 1 ? s.next : s.lastOne}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 라우터
// ─────────────────────────────────────────────
export default function TraineeCheckin() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { submitCheckin, loading } = useSubmitCheckin();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [done, setDone] = useState(false);
  const [riskLevel, setRiskLevel] = useState<string>('normal');

  // 트레이니 프로필에서 연령 그룹 조회
  useEffect(() => {
    if (!user || !orgId) return;
    veilorDb
      .from('b2b_trainee_profiles')
      .select('age_group')
      .eq('member_id', user.id)
      .eq('org_id', orgId)
      .single()
      .then(({ data }) => {
        if (data?.age_group) setAgeGroup(data.age_group as AgeGroup);
        else setAgeGroup('group_15_17'); // fallback
      });
  }, [user, orgId]);

  const handleDone = async (scores: Scores, freeText: string) => {
    if (!orgId) return;
    const res = await submitCheckin({
      org_id: orgId,
      trigger_type: 'scheduled',
      ...scores,
      free_text: freeText || undefined,
    });

    if (res) {
      setRiskLevel(res.risk_level);
      setDone(true);
    } else {
      toast({ title: s.saveError, description: s.saveErrorDesc, variant: 'destructive' });
    }
  };

  // 완료 화면
  if (done) {
    const isHigh = riskLevel === 'high';
    const isMedium = riskLevel === 'medium';

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="text-5xl">{isHigh ? '🆘' : isMedium ? '🌧' : '⭐'}</div>
          <div>
            <h1 className="text-xl font-bold">{s.doneTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">{s.doneSubtitle}</p>
          </div>

          {isHigh && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-left space-y-2">
              <p className="font-semibold">{s.highAlert}</p>
              <p>{s.highAlertDesc}</p>
            </div>
          )}

          {isMedium && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
              {s.mediumAlert}
            </div>
          )}

          <Button onClick={() => navigate(`/b2b/dashboard/${orgId}`)} className="w-full">
            {s.backBtn}
          </Button>
        </div>
      </div>
    );
  }

  // 로딩
  if (!ageGroup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {ageGroup === 'group_9_11'  && <Checkin911 onDone={handleDone} s={s} />}
        {ageGroup === 'group_12_14' && <Checkin1214 onDone={handleDone} s={s} />}
        {ageGroup === 'group_15_17' && <Checkin1517 onDone={handleDone} s={s} />}
        {loading && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
