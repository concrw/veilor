import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { C, alpha } from '@/lib/colors';
import {
  analyzeNeedProfile,
  createEmptyNeedResponses,
  NEED_LABELS,
  LAYER_LABELS,
  GAP_LEVEL_COLORS,
  type NeedCode,
  type NeedLayer,
  type NeedResponses,
} from '@/lib/needAlgorithm';

const S = {
  ko: {
    title: '나의 욕구 지도',
    top3Label: '지금 가장 채워지지 않는 욕구',
    layerBarTitle: '레이어별 결핍',
    emptyTitle: '아직 욕구 탐색을 하지 않았어요',
    emptyBtn: '욕구 탐색 시작',
    reExploreBtn: '다시 탐색하기',
    assessedAt: (date: string) => `마지막 탐색: ${date}`,
    gapUnit: 'Gap',
  },
  en: {
    title: 'My Need Map',
    top3Label: 'Needs least fulfilled right now',
    layerBarTitle: 'Deficit by layer',
    emptyTitle: "You haven't explored your needs yet",
    emptyBtn: 'Start need exploration',
    reExploreBtn: 'Explore again',
    assessedAt: (date: string) => `Last explored: ${date}`,
    gapUnit: 'Gap',
  },
} as const;

const NEED_CODES: NeedCode[] = [
  'BIO-SLP', 'BIO-EAT', 'BIO-SEX',
  'SAF-SEC', 'SAF-CTL',
  'CON-BEL', 'CON-INT',
  'GRW-ACH', 'GRW-REC', 'GRW-PWR',
  'EXS-AUT', 'EXS-MNG',
];

const LAYER_COLORS: Record<NeedLayer, string> = {
  BIO: '#f97316',
  SAF: '#eab308',
  CON: '#3b82f6',
  GRW: '#a855f7',
  EXS: '#14b8a6',
};

export default function NeedSummaryCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const lang = language === 'en' ? 'en' : 'ko';

  const { data, isLoading } = useQuery({
    queryKey: ['need-summary', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const keys = NEED_CODES.flatMap(c => [`need_${c}_desired`, `need_${c}_satisfied`]);
      const { data: rows } = await veilorDb
        .from('cq_responses')
        .select('question_key, response_value, created_at')
        .eq('user_id', user.id)
        .in('question_key', keys);
      if (!rows || rows.length === 0) return null;

      const responses = createEmptyNeedResponses();
      rows.forEach(r => {
        const val = Number(r.response_value);
        if (isNaN(val)) return;
        for (const code of NEED_CODES) {
          if (r.question_key === `need_${code}_desired`) {
            (responses as NeedResponses)[code].desired = val;
          } else if (r.question_key === `need_${code}_satisfied`) {
            (responses as NeedResponses)[code].satisfied = val;
          }
        }
      });

      const latestDate = rows.reduce((max, r) => (r.created_at > max ? r.created_at : max), rows[0].created_at);
      const profile = analyzeNeedProfile(responses);
      return { profile, assessedAt: latestDate };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return null;

  if (!data) {
    return (
      <div
        className="mx-4 mt-4 rounded-[16px] p-4"
        style={{ background: '#242120', border: '1px solid #3C3835' }}
      >
        <p className="text-[13px] font-light mb-3" style={{ color: C.text3, fontFamily: "'DM Sans', sans-serif" }}>
          {s.emptyTitle}
        </p>
        <button
          onClick={() => navigate('/home/sexself/need-assessment')}
          className="w-full py-[10px] rounded-[20px] text-[12px] font-medium transition-all"
          style={{ background: '#E0B48A', color: '#1C1917' }}
        >
          {s.emptyBtn}
        </button>
      </div>
    );
  }

  const { profile, assessedAt } = data;
  const top3 = profile.gaps
    .filter(g => profile.top3Deficits.includes(g.code))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const fmtDate = new Date(assessedAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'short', day: 'numeric',
  });

  return (
    <div
      className="mx-4 mt-4 rounded-[16px] p-4 space-y-4"
      style={{ background: '#242120', border: '1px solid #3C3835' }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] tracking-widest uppercase" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif" }}>
          V-NEED
        </p>
        <p className="text-[10px]" style={{ color: C.text4 }}>{s.assessedAt(fmtDate)}</p>
      </div>

      {/* Top 3 결핍 욕구 */}
      <div>
        <p className="text-[11px] mb-2" style={{ color: C.text4 }}>{s.top3Label}</p>
        <div className="space-y-1.5">
          {top3.map((g, i) => {
            const color = GAP_LEVEL_COLORS[g.level];
            return (
              <div key={g.code} className="flex items-center gap-2">
                <span className="text-[10px] w-4 text-right flex-shrink-0" style={{ color: C.text4 }}>{i + 1}</span>
                <div className="flex-1 h-1 rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${g.gap}%`, background: color }}
                  />
                </div>
                <span className="text-[11px] font-light w-14 flex-shrink-0" style={{ color: C.text2 }}>
                  {NEED_LABELS[g.code][lang]}
                </span>
                <span className="text-[10px] flex-shrink-0" style={{ color }}>
                  {s.gapUnit} {g.gap}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 레이어별 평균 갭 바 */}
      <div>
        <p className="text-[11px] mb-2" style={{ color: C.text4 }}>{s.layerBarTitle}</p>
        <div className="space-y-1.5">
          {profile.layerSummary.map(ls => (
            <div key={ls.layer} className="flex items-center gap-2">
              <span
                className="text-[9px] w-10 text-right flex-shrink-0 font-medium"
                style={{ color: LAYER_COLORS[ls.layer] }}
              >
                {LAYER_LABELS[ls.layer][lang]}
              </span>
              <div className="flex-1 h-1 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${ls.avgGap}%`, background: alpha(LAYER_COLORS[ls.layer], 0.8) }}
                />
              </div>
              <span className="text-[10px] w-7 flex-shrink-0 text-right" style={{ color: C.text4 }}>
                {Math.round(ls.avgGap)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 재탐색 버튼 */}
      <button
        onClick={() => navigate('/home/sexself/need-assessment')}
        className="w-full py-[9px] rounded-[20px] text-[11px] font-light transition-all"
        style={{ border: '1px solid #3C3835', background: 'transparent', color: C.text3 }}
      >
        {s.reExploreBtn}
      </button>
    </div>
  );
}
