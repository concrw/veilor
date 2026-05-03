import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { C } from '@/lib/colors';

// ────────────────────────────────────────────────────────────
// 데이터 모델
// ────────────────────────────────────────────────────────────

type IssueCode = 'env' | 'edu' | 'labor' | 'health' | 'equity' | 'tech' | 'poverty' | 'community';
type InterestStatus = 'active' | 'dormant' | 'revisit';
type Level = 1 | 2 | 3;

interface SocialInterest {
  id: string;
  issue_code: string;
  level: Level;
  status: InterestStatus;
  note: string | null;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────
// 정적 콘텐츠
// ────────────────────────────────────────────────────────────

const AREAS: { code: IssueCode; emoji: string; ko: string; en: string; sub_ko: string[]; sub_en: string[] }[] = [
  {
    code: 'env', emoji: '🌱',
    ko: '환경·기후', en: 'Environment & Climate',
    sub_ko: ['기후 위기 대응', '생물다양성 보전', '플라스틱·폐기물', '에너지 전환', '도시 녹지'],
    sub_en: ['Climate response', 'Biodiversity', 'Plastic & waste', 'Energy transition', 'Urban greening'],
  },
  {
    code: 'edu', emoji: '📚',
    ko: '교육·성장', en: 'Education & Growth',
    sub_ko: ['교육 불평등', '평생학습 접근성', '디지털 리터러시', '자기주도학습', '학교 밖 청소년'],
    sub_en: ['Educational inequality', 'Lifelong learning', 'Digital literacy', 'Self-directed learning', 'Out-of-school youth'],
  },
  {
    code: 'labor', emoji: '⚙️',
    ko: '노동·경제', en: 'Labour & Economy',
    sub_ko: ['불안정 고용', '최저임금', '플랫폼 노동', '일·생활 균형', '청년 실업'],
    sub_en: ['Precarious work', 'Minimum wage', 'Gig economy', 'Work-life balance', 'Youth unemployment'],
  },
  {
    code: 'health', emoji: '🏥',
    ko: '의료·건강', en: 'Health & Wellness',
    sub_ko: ['정신건강 인프라', '의료 접근성', '만성질환 관리', '노인 돌봄', '공중보건 역량'],
    sub_en: ['Mental health infrastructure', 'Healthcare access', 'Chronic disease', 'Elder care', 'Public health'],
  },
  {
    code: 'equity', emoji: '⚖️',
    ko: '차별·인권', en: 'Equity & Human Rights',
    sub_ko: ['젠더 불평등', '장애인 접근성', '이주민·난민', '성소수자 권리', '혐오표현'],
    sub_en: ['Gender inequality', 'Disability access', 'Migrants & refugees', 'LGBTQ+ rights', 'Hate speech'],
  },
  {
    code: 'tech', emoji: '🤖',
    ko: '기술·AI 윤리', en: 'Tech & AI Ethics',
    sub_ko: ['AI 편향성', '디지털 감시', '알고리즘 투명성', '개인정보 보호', '기술 격차'],
    sub_en: ['AI bias', 'Digital surveillance', 'Algorithmic transparency', 'Privacy protection', 'Digital divide'],
  },
  {
    code: 'poverty', emoji: '🏠',
    ko: '빈곤·불평등', en: 'Poverty & Inequality',
    sub_ko: ['주거 불안정', '식품 불안정', '소득 양극화', '아동 빈곤', '사회 안전망'],
    sub_en: ['Housing insecurity', 'Food insecurity', 'Income polarisation', 'Child poverty', 'Social safety net'],
  },
  {
    code: 'community', emoji: '🤝',
    ko: '공동체·지역', en: 'Community & Local',
    sub_ko: ['지역 소멸', '공동체 연대', '자원봉사 문화', '마을 만들기', '세대 간 교류'],
    sub_en: ['Community decline', 'Solidarity', 'Volunteerism', 'Place-making', 'Intergenerational exchange'],
  },
];

const STATUS_COLORS: Record<InterestStatus, string> = {
  active:  '#7FB89A',
  dormant: '#78716C',
  revisit: '#C4A355',
};

const STATUS_LABELS_KO: Record<InterestStatus, string> = {
  active:  '관심 중',
  dormant: '잠시 멀어짐',
  revisit: '다시 보기',
};

const STATUS_LABELS_EN: Record<InterestStatus, string> = {
  active:  'Active',
  dormant: 'Dormant',
  revisit: 'Revisit',
};

// ────────────────────────────────────────────────────────────
// 컴포넌트
// ────────────────────────────────────────────────────────────

export default function SocialInterestExplorer() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const qc = useQueryClient();
  const isKo = language === 'ko';

  const [expandedCode, setExpandedCode] = useState<IssueCode | null>(null);
  const [pendingNote, setPendingNote] = useState<Record<string, string>>({});
  const [level3Open, setLevel3Open] = useState<Record<string, boolean>>({});
  const [level3Text, setLevel3Text] = useState<Record<string, string>>({});

  const L3 = {
    ko: {
      question: '왜 이것이 문제라고 생각하나요? 떠오르는 대로 써보세요.',
      placeholder: '분량 제한 없어요...',
      save: '저장',
      skip: '나중에 쓸게요',
      openExisting: '페인포인트 보기',
      openNew: '더 깊이 써볼까요?',
    },
    en: {
      question: 'Why do you think this is a problem? Write whatever comes to mind.',
      placeholder: 'No length limit...',
      save: 'Save',
      skip: 'Maybe later',
      openExisting: 'View pain point',
      openNew: 'Go deeper?',
    },
  };
  const l3 = isKo ? L3.ko : L3.en;

  // 내 관심사 조회
  const { data: interests = [] } = useQuery<SocialInterest[]>({
    queryKey: ['social-interests', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('social_interests')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });
      return (data ?? []) as SocialInterest[];
    },
    enabled: !!user,
  });

  // 관심사 upsert (레벨 1 체크)
  const upsertInterest = useMutation({
    mutationFn: async ({ code, level, note }: { code: string; level: Level; note?: string }) => {
      await veilorDb.from('social_interests').upsert(
        { user_id: user!.id, issue_code: code, level, status: 'active', note: note ?? null },
        { onConflict: 'user_id,issue_code,level' },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-interests', user?.id] }),
  });

  // 상태 변경
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InterestStatus }) => {
      await veilorDb.from('social_interests').update({ status }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-interests', user?.id] }),
  });

  // 서브이슈 노트 저장 (Level 2)
  const saveNote = (code: string, subIdx: number) => {
    const key = `${code}_${subIdx}`;
    const note = pendingNote[key] ?? '';
    upsertInterest.mutate({ code: `${code}__${subIdx}`, level: 2, note });
    toast({ title: isKo ? '저장했어요' : 'Saved' });
  };

  // Level 3 페인포인트 저장
  const saveLevel3 = (areaCode: string, subIdx: number) => {
    const key = `${areaCode}_${subIdx}`;
    const subCode = `${areaCode}__${subIdx}`;
    const note = level3Text[key] ?? '';
    upsertInterest.mutate({ code: subCode, level: 3, note });
    setLevel3Open(prev => ({ ...prev, [key]: false }));
    toast({ title: isKo ? '저장했어요' : 'Saved' });
  };

  const getInterest = (code: string, level: Level) =>
    interests.find(i => i.issue_code === code && i.level === level);

  const isLevel1Checked = (code: IssueCode) => !!getInterest(code, 1);

  const handleLevel1Toggle = (code: IssueCode) => {
    if (isLevel1Checked(code)) {
      setExpandedCode(prev => (prev === code ? null : code));
    } else {
      upsertInterest.mutate({ code, level: 1 });
      setExpandedCode(code);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 4 }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 400,
            color: C.text,
            margin: 0,
          }}
        >
          {isKo ? '관심 영역 탐색' : 'Explore Interests'}
        </h2>
        <p style={{ fontSize: 13, color: C.text3, marginTop: 4, lineHeight: 1.5 }}>
          {isKo ? '관심은 자라기도, 잠들기도 합니다' : 'Interests grow, and sometimes rest.'}
        </p>
      </div>

      {/* 오늘의 만트라 */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(180deg, rgba(127,184,154,.08), transparent)',
        border: '1px solid rgba(127,184,154,.2)',
        borderRadius: 14,
        marginBottom: 4,
      }}>
        <div style={{ fontSize: 10, color: '#7FB89A', fontFamily: 'monospace', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
          {isKo ? '오늘의 만트라' : "Today's Mantra"}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, fontStyle: 'italic', lineHeight: 1.5 }}>
          {isKo
            ? '관심은 바뀌어도 괜찮아요.\n지금 이 순간의 기록일 뿐.'
            : 'It\'s okay for interests to change.\nThis is just a record of now.'}
        </div>
      </div>

      {/* 영역 카드 목록 */}
      {AREAS.map(area => {
        const checked = isLevel1Checked(area.code);
        const isOpen = expandedCode === area.code;
        const lvl1Interest = getInterest(area.code, 1);

        return (
          <div
            key={area.code}
            style={{
              background: C.bg2,
              border: `1px solid ${checked ? '#7FB89A44' : C.border}`,
              borderRadius: 14,
              overflow: 'hidden',
              transition: 'border-color .2s',
            }}
          >
            {/* 레벨 1 행 */}
            <button
              onClick={() => handleLevel1Toggle(area.code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {/* 체크 인디케이터 */}
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: `2px solid ${checked ? '#7FB89A' : C.border}`,
                  background: checked ? '#7FB89A22' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all .2s',
                }}
              >
                {checked && (
                  <span style={{ color: '#7FB89A', fontSize: 11, lineHeight: 1 }}>✓</span>
                )}
              </span>

              <span style={{ fontSize: 18 }}>{area.emoji}</span>

              <span style={{ flex: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: checked ? '#7FB89A' : C.text, display: 'block' }}>
                  {isKo ? area.ko : area.en}
                </span>
              </span>

              {/* 상태 뱃지 */}
              {lvl1Interest && (
                <span
                  style={{
                    fontSize: 10,
                    color: STATUS_COLORS[lvl1Interest.status],
                    border: `1px solid ${STATUS_COLORS[lvl1Interest.status]}55`,
                    borderRadius: 99,
                    padding: '2px 8px',
                  }}
                >
                  {isKo ? STATUS_LABELS_KO[lvl1Interest.status] : STATUS_LABELS_EN[lvl1Interest.status]}
                </span>
              )}

              {/* 펼치기 화살표 */}
              {checked && (
                <span style={{ color: C.text4, fontSize: 12, transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  ▾
                </span>
              )}
            </button>

            {/* 레벨 2 — 하위 이슈 */}
            {isOpen && (
              <div style={{ borderTop: `1px solid ${C.border2}`, padding: '12px 16px 16px' }}>
                <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>
                  {isKo ? '어떤 부분이 특히 신경 쓰이나요?' : 'Which aspect concerns you most?'}
                </p>

                {/* 상태 변경 버튼 */}
                {lvl1Interest && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                    {(['active', 'dormant', 'revisit'] as InterestStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => updateStatus.mutate({ id: lvl1Interest.id, status: st })}
                        style={{
                          fontSize: 10,
                          padding: '3px 10px',
                          borderRadius: 99,
                          border: `1px solid ${lvl1Interest.status === st ? STATUS_COLORS[st] : C.border}`,
                          background: lvl1Interest.status === st ? `${STATUS_COLORS[st]}18` : 'transparent',
                          color: lvl1Interest.status === st ? STATUS_COLORS[st] : C.text4,
                          cursor: 'pointer',
                          transition: 'all .15s',
                        }}
                      >
                        {isKo ? STATUS_LABELS_KO[st] : STATUS_LABELS_EN[st]}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(isKo ? area.sub_ko : area.sub_en).map((sub, idx) => {
                    const subCode = `${area.code}__${idx}`;
                    const subInterest = getInterest(subCode, 2);
                    const noteKey = `${area.code}_${idx}`;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: C.bg3,
                          border: `1px solid ${subInterest ? '#7FB89A33' : C.border2}`,
                          borderRadius: 10,
                          padding: '10px 12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: subInterest ? 8 : 0 }}>
                          <button
                            onClick={() => upsertInterest.mutate({ code: subCode, level: 2 })}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: `1.5px solid ${subInterest ? '#7FB89A' : C.border}`,
                              background: subInterest ? '#7FB89A22' : 'transparent',
                              cursor: 'pointer',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {subInterest && <span style={{ color: '#7FB89A', fontSize: 9 }}>✓</span>}
                          </button>
                          <span style={{ fontSize: 13, color: subInterest ? C.text : C.text2 }}>{sub}</span>
                        </div>

                        {subInterest && (
                          <div style={{ paddingLeft: 24 }}>
                            <textarea
                              placeholder={isKo ? '이 이슈가 나에게 중요한 이유는… (선택)' : 'Why this issue matters to me… (optional)'}
                              value={pendingNote[noteKey] ?? subInterest.note ?? ''}
                              onChange={e => setPendingNote(prev => ({ ...prev, [noteKey]: e.target.value }))}
                              rows={2}
                              style={{
                                width: '100%',
                                background: C.bg2,
                                border: `1px solid ${C.border}`,
                                borderRadius: 8,
                                padding: '8px 10px',
                                fontSize: 12,
                                color: C.text2,
                                resize: 'vertical',
                                fontFamily: "'DM Sans', sans-serif",
                                outline: 'none',
                              }}
                            />
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                              <button
                                onClick={() => saveNote(area.code, idx)}
                                style={{
                                  fontSize: 11,
                                  color: '#7FB89A',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px 0',
                                }}
                              >
                                {isKo ? '저장' : 'Save'}
                              </button>
                              <button
                                onClick={() => {
                                  const l3Existing = getInterest(`${area.code}__${idx}`, 3);
                                  if (l3Existing && !level3Text[noteKey]) {
                                    setLevel3Text(prev => ({ ...prev, [noteKey]: l3Existing.note ?? '' }));
                                  }
                                  setLevel3Open(prev => ({ ...prev, [noteKey]: !prev[noteKey] }));
                                }}
                                style={{
                                  fontSize: 11,
                                  color: getInterest(`${area.code}__${idx}`, 3) ? '#C4A355' : '#7FB89A',
                                  background: 'transparent',
                                  border: `1px solid ${getInterest(`${area.code}__${idx}`, 3) ? '#C4A35544' : '#7FB89A44'}`,
                                  borderRadius: 8,
                                  padding: '3px 9px',
                                  cursor: 'pointer',
                                }}
                              >
                                {getInterest(`${area.code}__${idx}`, 3) ? l3.openExisting : l3.openNew}
                              </button>
                            </div>

                            {/* Level 3 패널 */}
                            {level3Open[noteKey] && (
                              <div style={{ marginTop: 10, padding: '12px 14px', background: '#1A2420', border: '1px solid #7FB89A22', borderRadius: 10 }}>
                                <p style={{ fontSize: 12, color: '#7FB89A', marginBottom: 8, lineHeight: 1.5 }}>
                                  {l3.question}
                                </p>
                                <textarea
                                  placeholder={l3.placeholder}
                                  value={level3Text[noteKey] ?? ''}
                                  onChange={e => setLevel3Text(prev => ({ ...prev, [noteKey]: e.target.value }))}
                                  rows={5}
                                  style={{
                                    width: '100%',
                                    background: C.bg2,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 8,
                                    padding: '8px 10px',
                                    fontSize: 12,
                                    color: C.text2,
                                    resize: 'vertical',
                                    fontFamily: "'DM Sans', sans-serif",
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                  }}
                                  onFocus={e => { e.currentTarget.style.borderColor = '#7FB89A'; }}
                                  onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
                                />
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                  <button
                                    onClick={() => saveLevel3(area.code, idx)}
                                    style={{
                                      fontSize: 11,
                                      color: '#1C1917',
                                      background: '#7FB89A',
                                      border: 'none',
                                      borderRadius: 8,
                                      padding: '5px 14px',
                                      cursor: 'pointer',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {l3.save}
                                  </button>
                                  <button
                                    onClick={() => setLevel3Open(prev => ({ ...prev, [noteKey]: false }))}
                                    style={{
                                      fontSize: 11,
                                      color: C.text4,
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '5px 4px',
                                    }}
                                  >
                                    {l3.skip}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 하단 안내 */}
      <p style={{ fontSize: 11, color: C.text4, textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
        {isKo
          ? '완료 개념 없어요. 언제든 새 영역을 추가하거나 기존 기록을 바꿀 수 있어요.'
          : 'No completion needed. Add or change any area anytime.'}
      </p>
    </div>
  );
}
