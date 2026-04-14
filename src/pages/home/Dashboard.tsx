import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';

// #24 동적 질문 카드 — V-File 결과 기반 매일 다른 질문
function DynamicQuestionCard({ primaryMask, axisScores }: { primaryMask: string | null; axisScores: Record<string, number> | null }) {
  if (!primaryMask || !axisScores) return null;

  const MASK_QUESTIONS: Record<string, string[]> = {
    PWR: ['오늘 통제하고 싶었던 순간이 있었나요?', '누군가에게 주도권을 내려놓은 적이 있나요?', '불확실한 상황에서 어떤 감정이 올라왔나요?'],
    NRC: ['오늘 누군가를 의도적으로 밀어낸 순간이 있나요?', '혼자 있고 싶었던 이유가 뭐였을까요?', '신뢰가 흔들린 순간이 있었나요?'],
    SCP: ['규칙을 따르기 싫었던 순간이 있었나요?', '자유를 느낀 순간은 언제였나요?', '누군가의 기대에 반항하고 싶었나요?'],
    MKV: ['오늘 누군가에게 보여주고 싶은 모습이 있었나요?', '진짜 나를 숨긴 순간이 있었나요?', '매력 없이도 괜찮다고 느낀 적 있나요?'],
    MNY: ['유머로 넘긴 감정이 있나요?', '진지해지기 두려웠던 순간이 있었나요?', '돈이나 자원으로 관계를 유지한 적 있나요?'],
    PSP: ['새로운 것을 추구한 이유가 뭐였을까요?', '멈추면 무엇과 마주해야 하나요?', '안전기지가 있다고 느낀 순간이 있나요?'],
    EMP: ['타인의 감정을 내 것처럼 느낀 순간이 있나요?', '나 자신의 감정은 뭐였을까요?', '경계를 설정한 적이 있나요?'],
    GVR: ['오늘 누군가에게 준 것이 있나요?', '받는 것이 불편했던 적 있나요?', '내 필요를 말한 적 있나요?'],
    APV: ['인정받고 싶었던 순간이 있나요?', '완벽하지 않아도 괜찮다고 느낀 적 있나요?', '성취 없이 사랑받을 수 있을까요?'],
    DEP: ['혼자서 해낸 것이 있나요?', '누군가 없으면 불안했던 순간이 있나요?', '무력감이 찾아온 순간이 있었나요?'],
    AVD: ['감정을 드러내기 두려웠던 순간이 있나요?', '지적 우월로 거리를 둔 적 있나요?', '명확하게 말해도 안전했던 경험이 있나요?'],
    SAV: ['누군가를 구해야 한다고 느낀 적 있나요?', '도움이 필요 없는 사람과의 관계는 어떤가요?', '희생하지 않아도 가치 있다고 느끼나요?'],
  };

  const profile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
  const msk = profile?.mskCode ?? '';
  const questions = MASK_QUESTIONS[msk] ?? ['오늘 관계에서 어떤 감정이 올라왔나요?', '반복되는 패턴이 있었나요?', '나에게 필요한 것은 무엇인가요?'];

  // 날짜 기반 질문 선택 (매일 다른 질문)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayQ = questions[dayOfYear % questions.length];

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-2">
      <p className="text-xs text-muted-foreground">오늘의 질문</p>
      <p className="text-sm font-medium leading-relaxed">{todayQ}</p>
      <p className="text-[10px] text-muted-foreground">
        {profile?.nameKo ?? primaryMask} 가면에게 묻는 질문
      </p>
    </div>
  );
}

type UserStage = 'new' | 'exploring' | 'deepening' | 'growing';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, primaryMask, axisScores, personaContextsCompleted } = useAuth();

  // 사용자 상태 판별
  const { data: userStage = 'new' as UserStage } = useQuery<UserStage>({
    queryKey: ['user-stage', user?.id],
    queryFn: async () => {
      const [sessionRes, signalRes] = await Promise.all([
        veilorDb.from('dive_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        veilorDb.from('user_signals').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      ]);
      const sessions = sessionRes.count ?? 0;
      const signals = signalRes.count ?? 0;
      const personas = personaContextsCompleted.length;

      if (sessions === 0 && signals === 0) return 'new';
      if (sessions < 5 || signals < 10) return 'exploring';
      if (personas >= 2 || signals >= 30) return 'deepening';
      return 'growing';
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const STAGE_MESSAGE: Record<UserStage, { title: string; desc: string; action: string; path: string }> = {
    new: { title: '관계 탐색을 시작해볼까요?', desc: '감정을 하나 골라 이야기를 나눠보세요', action: 'Vent 시작', path: '/home/vent' },
    exploring: { title: '패턴이 보이기 시작해요', desc: '더 많은 대화가 쌓이면 정밀도가 올라갑니다', action: '대화 이어가기', path: '/home/vent' },
    deepening: { title: '다른 맥락의 나도 알아볼 시간', desc: '사회적인 나, 비밀스러운 나를 진단해보세요', action: '세 개의 나 진단', path: '/home/get' },
    growing: { title: '변화가 일어나고 있어요', desc: '주간 패턴을 확인하고 성장을 기록하세요', action: 'Me 확인', path: '/home/me' },
  };

  const stage = STAGE_MESSAGE[userStage];

  // 오늘의 CODETALK 키워드
  const { data: todayKeyword } = useQuery({
    queryKey: ['today-keyword', user?.id],
    queryFn: async () => {
      const { data: profile } = await veilorDb.from('user_profiles')
        .select('codetalk_day').eq('id', user!.id).single();
      const day = profile?.codetalk_day ?? 1;
      const { data } = await veilorDb.from('codetalk_keywords')
        .select('*').eq('day_number', day).single();
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="px-4 py-6 space-y-5">
      {/* 상태별 진입 안내 (#16/#61) */}
      <button
        onClick={() => navigate(stage.path)}
        className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-5 text-left hover:bg-primary/10 transition-colors"
      >
        <p className="font-semibold">{stage.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{stage.desc}</p>
        <span className="inline-block mt-3 text-xs text-primary font-medium">{stage.action} →</span>
      </button>

      {/* 나의 가면 */}
      <div className="bg-card border rounded-2xl p-5">
        <p className="text-xs text-muted-foreground mb-1">나의 가면</p>
        <h2 className="text-xl font-bold">{primaryMask ?? '—'}</h2>
        {axisScores && (
          <div className="flex gap-3 mt-3">
            {(['A','B','C','D'] as const).map(axis => (
              <div key={axis} className="text-center">
                <div className="text-xs text-muted-foreground">{axis}</div>
                <div className="text-sm font-semibold">{axisScores[axis]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* #24 동적 질문 카드 */}
      <DynamicQuestionCard primaryMask={primaryMask} axisScores={axisScores} />

      {/* 오늘의 CODETALK */}
      <button
        onClick={() => navigate('/home/codetalk')}
        className="w-full bg-card border rounded-2xl p-5 text-left hover:border-primary/50 transition-colors"
      >
        <p className="text-xs text-muted-foreground mb-1">오늘의 CODETALK</p>
        <p className="font-semibold">{todayKeyword?.keyword ?? '키워드 로딩 중...'}</p>
        {todayKeyword?.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{todayKeyword.description}</p>
        )}
      </button>

      {/* 모듈 빠른 진입 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'DIVE', desc: '관계 상담', path: '/home/dive', emoji: '🌊' },
          { label: 'V-File', desc: '가면 재진단', path: '/home/priper', emoji: '🎭' },
          { label: 'Community', desc: '그룹 피드', path: '/home/community', emoji: '👥' },
          { label: 'CODETALK', desc: '100일 기록', path: '/home/codetalk', emoji: '💬' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="bg-card border rounded-2xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="font-medium text-sm mt-2">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
