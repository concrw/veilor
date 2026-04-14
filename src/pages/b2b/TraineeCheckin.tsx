import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useSubmitCheckin } from '@/hooks/useB2BOrg';

// ─────────────────────────────────────────────
// 연령 그룹별 설정
// veilor_b2b.md 섹션 8-3 기준
// ─────────────────────────────────────────────
type AgeGroup = 'group_9_11' | 'group_12_14' | 'group_15_17';

// 그룹 9~11: 이모지 선택 방식
const EMOJI_OPTIONS_911 = [
  { emoji: '😄', label: '최고야!', score: 9 },
  { emoji: '🙂', label: '괜찮아',  score: 7 },
  { emoji: '😐', label: '그냥저냥', score: 5 },
  { emoji: '😟', label: '좀 힘들어', score: 3 },
  { emoji: '😢', label: '많이 힘들어', score: 1 },
];

// 그룹 12~14: 슬라이더 + 일기형
const SLIDER_QUESTIONS_1214 = [
  { key: 'c_control' as const,    q: '오늘 내 감정이 내 편인 것 같아?' },
  { key: 'c_commitment' as const, q: '지금 하고 있는 것에 계속하고 싶은 마음이 있어?' },
  { key: 'c_challenge' as const,  q: '어려운 일이 생겼을 때 해볼 수 있을 것 같아?' },
  { key: 'c_confidence' as const, q: '나 자신을 믿을 수 있어?' },
];

// 그룹 15~17: 성인 버전과 동일 (Checkin.tsx 재사용)
const AXES_1517 = [
  { key: 'c_control' as const,    label: 'Control',    q: '지금 내 감정과 상황을 내가 조절하고 있다' },
  { key: 'c_commitment' as const, label: 'Commitment', q: '지금 내 목표를 향한 의지가 흔들리지 않는다' },
  { key: 'c_challenge' as const,  label: 'Challenge',  q: '지금 내가 마주한 어려움이 성장의 기회로 느껴진다' },
  { key: 'c_confidence' as const, label: 'Confidence', q: '지금 내 능력과 판단을 스스로 신뢰하고 있다' },
];

type Scores = { c_control: number; c_commitment: number; c_challenge: number; c_confidence: number };

// ─────────────────────────────────────────────
// 9~11세 체크인
// ─────────────────────────────────────────────
function Checkin911({ onDone }: { onDone: (scores: Scores, text: string) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [goodThing, setGoodThing] = useState('');

  const selected = EMOJI_OPTIONS_911.find(o => o.score === picked);
  const score = picked ?? 5;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">오늘 기분이 어때?</h1>
        <p className="text-muted-foreground text-sm mt-1">하나를 골라봐</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {EMOJI_OPTIONS_911.map(opt => (
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
          <p className="text-sm font-medium">오늘 연습에서 잘한 것 하나 써볼래? (안 써도 돼)</p>
          <textarea
            value={goodThing}
            onChange={e => setGoodThing(e.target.value)}
            placeholder="예: 오늘 점프를 더 높이 뛰었어"
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
        완료!
      </Button>

      {selected && picked !== null && picked <= 3 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
          힘들다고 느끼는 건 자연스러운 거야. 코치 선생님이 도와줄 거야 💛
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 12~14세 체크인
// ─────────────────────────────────────────────
function Checkin1214({ onDone }: { onDone: (scores: Scores, text: string) => void }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Scores>({ c_control: 5, c_commitment: 5, c_challenge: 5, c_confidence: 5 });
  const [diary, setDiary] = useState('');

  const current = SLIDER_QUESTIONS_1214[step];

  const handleScore = (val: number) =>
    setScores(s => ({ ...s, [current.key]: val }));

  if (step >= SLIDER_QUESTIONS_1214.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">오늘 하고 싶은 말 있어?</h1>
          <p className="text-muted-foreground text-sm mt-1">안 써도 돼. 소속사엔 안 보여.</p>
        </div>
        <textarea
          value={diary}
          onChange={e => setDiary(e.target.value)}
          placeholder="어떤 순간이 어려웠는지, 뭐가 좋았는지 자유롭게 써봐"
          rows={5}
          className="w-full border rounded-xl p-3 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">이전</Button>
          <Button onClick={() => onDone(scores, diary)} className="flex-1">완료!</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 진행 */}
      <div className="flex gap-1">
        {SLIDER_QUESTIONS_1214.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      <div>
        <h1 className="text-lg font-semibold">{current.q}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {step + 1} / {SLIDER_QUESTIONS_1214.length}
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
          <span>별로 그렇지 않아</span>
          <span>완전 그래!</span>
        </div>
        <p className="text-center text-3xl font-bold text-primary">{scores[current.key]}</p>
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">이전</Button>
        )}
        <Button onClick={() => setStep(s => s + 1)} className="flex-1">다음</Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 15~17세 체크인 (성인과 동일 구조)
// ─────────────────────────────────────────────
function Checkin1517({ onDone }: { onDone: (scores: Scores, text: string) => void }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Scores>({ c_control: 5, c_commitment: 5, c_challenge: 5, c_confidence: 5 });
  const [freeText, setFreeText] = useState('');

  const current = AXES_1517[step];

  if (step >= AXES_1517.length) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">선택 입력</p>
          <h1 className="text-xl font-bold">지금 하고 싶은 말이 있나요?</h1>
          <p className="text-sm text-muted-foreground mt-1">소속사에는 공개되지 않습니다.</p>
        </div>
        <textarea
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          placeholder="자유롭게 적어보세요..."
          rows={5}
          className="w-full border rounded-xl p-3 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">이전</Button>
          <Button onClick={() => onDone(scores, freeText)} className="flex-1">완료</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-1">
        {AXES_1517.map((_, i) => (
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
              onClick={() => setScores(s => ({ ...s, [current.key]: n }))}
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
        {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">이전</Button>}
        <Button onClick={() => setStep(s => s + 1)} className="flex-1">
          {step < AXES_1517.length - 1 ? '다음' : '마지막으로'}
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
      toast({ title: '저장 실패', description: '다시 시도해주세요.', variant: 'destructive' });
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
            <h1 className="text-xl font-bold">오늘 체크인 완료!</h1>
            <p className="text-sm text-muted-foreground mt-1">잘했어 👍</p>
          </div>

          {isHigh && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-left space-y-2">
              <p className="font-semibold">코치 선생님한테 연락이 갈 거야.</p>
              <p>지금 많이 힘들면 <strong>1393</strong>에 전화해도 돼. 항상 열려 있어.</p>
            </div>
          )}

          {isMedium && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
              코치 선생님이 곧 연락할 거야 💛
            </div>
          )}

          <Button onClick={() => navigate(`/b2b/dashboard/${orgId}`)} className="w-full">
            돌아가기
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
        {ageGroup === 'group_9_11'  && <Checkin911 onDone={handleDone} />}
        {ageGroup === 'group_12_14' && <Checkin1214 onDone={handleDone} />}
        {ageGroup === 'group_15_17' && <Checkin1517 onDone={handleDone} />}
        {loading && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
