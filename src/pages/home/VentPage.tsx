import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase, veilorDb } from '@/integrations/supabase/client';
import { invokeHeldChat } from '@/lib/heldChatClient';
import { saveVentMessage, saveVentSummary, saveVentSessionSummary, saveVentPartialSession } from '@/hooks/useSignalPipeline';
import { useDynamicMaskSignal } from '@/hooks/useDynamicMaskSignal';
import { AmberBtn } from '../../layouts/HomeLayout';
import { useAmberAttention } from '../../hooks/useAmberAttention';
import { C, alpha } from '@/lib/colors';
import { CrisisBanner } from '@/components/CrisisBanner';
import { toast } from '@/hooks/use-toast';
import { detectCrisisLevel } from '@/lib/crisisDetect';
import { useLocalChatHistory } from '@/hooks/useLocalChatHistory';
import EmotionSelector from '@/components/vent/EmotionSelector';
import ChatView from '@/components/vent/ChatView';
import VentLayerView from '@/components/vent/VentLayerView';
import AmberSheet from '@/components/vent/AmberSheet';
import { useVentTranslations } from '@/hooks/useTranslation';
import { useVentData } from '@/hooks/useVentData';
import { useLanguageContext } from '@/context/LanguageContext';

export default function VentPage() {
  const { user, axisScores, primaryMask } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const prefillText = (location.state as { prefillText?: string } | null)?.prefillText ?? '';
  const qc = useQueryClient();
  const [section, setSection] = useState<'vent' | 'layer' | 'community'>('vent');
  const [phase, setPhase] = useState<'select' | 'chat'>('select');
  const [curEmo, setCurEmo] = useState('');
  const [msgs, setMsgs] = useState<{ role: 'ai' | 'user'; text: string; tone?: string }[]>([]);
  const [msgCount, setMsgCount] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [msgVal, setMsgVal] = useState(prefillText);
  const [crisisLevel, setCrisisLevel] = useState<'high' | 'critical' | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [amberOpen, setAmberOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [layerActive, setLayerActive] = useState('');
  const [showAmberNudge, setShowAmberNudge] = useState(false);
  const sessionNudgeShownRef = useRef(false);

  const aiSettingsRef = useRef<Record<string, string> | null>(null);
  useEffect(() => {
    if (!user) return;
    veilorDb.from('user_profiles').select('ai_settings').eq('user_id', user.id).single()
      .then(({ data }) => { if (data?.ai_settings) aiSettingsRef.current = data.ai_settings; });
  }, [user]);

  const sessionSavedRef = useRef(false);
  const timerRefs = useRef<number[]>([]);
  const transitionTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { saveLocal, loadLocal: _loadLocal, clearLocal } = useLocalChatHistory(user?.id);
  const { language } = useLanguageContext();
  const isEn = language === 'en';
  const { recordSignal } = useDynamicMaskSignal(user?.id, primaryMask ?? null);
  const vent = useVentTranslations();
  const { EMOTIONS, EMO_DATA, QUICK_CARDS, LAYER_GROUPS, COMM_GROUPS, getTimeGreeting } = useVentData();
  const greeting = getTimeGreeting();
  const aiName = vent.amberName;
  const amberFlash = useAmberAttention();

  const { data: lastSession } = useQuery({
    queryKey: ['last-vent-session', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.from('dive_sessions')
        .select('id, emotion, messages, turn_count, created_at')
        .eq('user_id', user!.id).eq('mode', 'F').eq('session_completed', false)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      return data;
    },
    enabled: !!user, staleTime: 1000 * 60,
  });

  const { data: recentEmotions } = useQuery({
    queryKey: ['recent-emotions', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.from('dive_sessions')
        .select('emotion, created_at')
        .eq('user_id', user!.id).eq('mode', 'F').eq('session_completed', true)
        .order('created_at', { ascending: false }).limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: sexselfData } = useQuery({
    queryKey: ['sexself-vent-ctx', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.from('cq_responses')
        .select('question_key, response_value')
        .eq('user_id', user!.id)
        .in('question_key', ['sexself_profile', 'sexself_sha']);
      if (!data || data.length === 0) return null;
      return Object.fromEntries(data.map(r => [r.question_key, r.response_value]));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const hasSexSelfResult = !!sexselfData?.sexself_profile;

  const { data: similarCount } = useQuery({
    queryKey: ['similar-concern-count', curEmo],
    queryFn: async () => {
      const EMOTION_CONCERN_MAP: Record<string, string> = {
        [vent.emotions.anxious]: 'attachment_anxiety',
        [vent.emotions.sad]: 'post_breakup',
        [vent.emotions.angry]: 'power_dynamics',
        [vent.emotions.confused]: 'pattern_repetition',
        [vent.emotions.lonely]: 'post_breakup',
        [vent.emotions.tired]: 'power_dynamics',
        [vent.emotions.hurt]: 'attachment_anxiety',
      };
      const concern = EMOTION_CONCERN_MAP[curEmo];
      if (!concern) return 0;
      const { count } = await veilorDb.from('tab_conversations').select('id', { count: 'exact', head: true }).eq('tab', 'vent');
      return count ?? 0;
    },
    enabled: !!curEmo,
    staleTime: 1000 * 60 * 10,
  });

  function resumeSession(session: NonNullable<typeof lastSession>) {
    setCurEmo(session.emotion);
    setMsgs(session.messages || []);
    setMsgCount(session.turn_count || 0);
    setPhase('chat');
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && phase === 'chat' && msgCount > 0 && msgCount < 4 && !sessionSavedRef.current) {
        saveVentPartialSession(user.id, curEmo, msgs, msgCount);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      timerRefs.current.forEach(t => window.clearTimeout(t));
      timerRefs.current = [];
      if (user && phase === 'chat' && msgCount > 0 && msgCount < 4 && !sessionSavedRef.current) {
        saveVentPartialSession(user.id, curEmo, msgs, msgCount);
      }
    };
  }, [user, phase, curEmo, msgs, msgCount]);

  function pickEmotion(emo: string) {
    setCurEmo(emo);
    sessionSavedRef.current = false;
    const data = EMO_DATA[emo];
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null;
      setPhase('chat');
      setMsgs([
        { role: 'ai', text: vent.chat.amberIntro, tone: vent.chat.toneWith },
        { role: 'ai', text: data.questions[0][0], tone: data.questions[0][1] },
      ]);
      setMsgCount(0); setQIdx(0); setShowSummary(false);
    }, 300);
  }

  const AMBER_NUDGE_KEYWORDS_KO = ['상처받았', '외로워', '혼란스러워', '외롭', '힘들'];
  const AMBER_NUDGE_KEYWORDS_EN = ['hurt', 'lonely', 'confused', 'exhausted', 'overwhelmed', 'lost'];
  const nudgeKeywords = language === 'en' ? AMBER_NUDGE_KEYWORDS_EN : AMBER_NUDGE_KEYWORDS_KO;

  function checkAmberNudge(messages: { role: 'ai' | 'user'; text: string }[]) {
    if (sessionNudgeShownRef.current) return;
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length < 4) return;
    const hasKeyword = userMessages.some(m =>
      nudgeKeywords.some(kw => m.text.toLowerCase().includes(kw)),
    );
    if (!hasKeyword) return;
    sessionNudgeShownRef.current = true;
    setShowAmberNudge(true);
  }

  function finishSession() {
    if (!user || !curEmo || sessionSavedRef.current) return;
    const data = EMO_DATA[curEmo];
    sessionSavedRef.current = true;
    clearLocal();
    saveVentSummary(user.id, curEmo, data.suggestion);
    saveVentSessionSummary(user.id, curEmo, msgs, data.suggestion, msgCount).then((id) => {
      if (id === null) {
        toast({ title: vent.chat.saveErrorTitle, description: vent.chat.saveErrorDesc, variant: 'destructive' });
      }
    });
    setShowSummary(true);
    qc.invalidateQueries({ queryKey: ['me-stats'] });
    qc.invalidateQueries({ queryKey: ['me-radar'] });
    qc.invalidateQueries({ queryKey: ['recent-emotions'] });
    qc.invalidateQueries({ queryKey: ['last-vent-session'] });
  }

  async function sendMsg() {
    if (!msgVal.trim() || !curEmo || aiThinking) return;
    const txt = msgVal.trim();

    const clientCrisis = detectCrisisLevel(txt);
    if (clientCrisis === 'critical') { setCrisisLevel('critical'); return; }
    if (clientCrisis === 'high') setCrisisLevel('high');

    setMsgVal('');
    const newCount = msgCount + 1;
    const data = EMO_DATA[curEmo];
    const nextQIdx = Math.min(qIdx + 1, data.questions.length - 1);
    setMsgs(m => [...m, { role: 'user', text: txt }]);
    setMsgCount(newCount); setQIdx(nextQIdx);
    const msgsBeforeAI = [...msgs, { role: 'user' as const, text: txt }];

    if (user) {
      saveVentMessage(user.id, curEmo, txt, newCount).then(({ crisisSeverity }) => {
        if (crisisSeverity === 'critical' || crisisSeverity === 'high') setCrisisLevel(crisisSeverity);
      });
      recordSignal(curEmo, txt).then(({ shouldAlert, suggestedMask }) => {
        if (shouldAlert && suggestedMask) {
          toast({
            title: isEn ? `Pattern detected: ${suggestedMask}` : `패턴 감지: ${suggestedMask}`,
            description: isEn ? 'Check Me tab for details.' : 'Me 탭에서 확인해보세요.',
          });
        }
      });
      supabase.functions.invoke('dm-message-filter', { body: { message: txt, userId: user.id } })
        .then(({ data: filterData }) => { if (filterData?.verdict === 'CRISIS') setCrisisLevel('critical'); })
        .catch(() => { console.warn('[VentPage] DM filter request failed'); });
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setAiThinking(true);
    let aiText = data.questions[nextQIdx][0];
    let aiTone = data.questions[nextQIdx][1];

    try {
      const aiData = await invokeHeldChat(
        {
          emotion: curEmo, text: txt, mask: primaryMask ?? undefined,
          axisScores: axisScores ?? null, history: msgs.slice(-6),
          aiSettings: aiSettingsRef.current ?? undefined, tab: 'vent',
          userId: user?.id, similarCount: similarCount ?? undefined,
          sexselfProfile: sexselfData?.sexself_profile ?? null,
          sexselfSha: sexselfData?.sexself_sha ? Number(sexselfData.sexself_sha) : null,
          language,
        },
        abortControllerRef.current.signal,
      );
      if (aiData?.response) { aiText = aiData.response; aiTone = vent.chat.amberListening.replace('...', ''); }
      if (aiData?.crisis === 'critical') setCrisisLevel('critical');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      toast({ title: vent.chat.aiErrorTitle, description: vent.chat.aiErrorDesc, variant: 'destructive' });
    }

    setAiThinking(false);
    const updatedMsgs = [...msgsBeforeAI, { role: 'ai' as const, text: aiText, tone: aiTone }];
    setMsgs(() => updatedMsgs);
    saveLocal({ emotion: curEmo, msgs: updatedMsgs, msgCount: newCount });
    checkAmberNudge(updatedMsgs);

    if (newCount >= 4 && newCount % 4 === 0 && !sessionSavedRef.current) {
      timerRefs.current.push(window.setTimeout(() => {
        setMsgs(m => [...m, { role: 'ai', text: vent.chat.finishSuggestion.replace('{count}', String(newCount)), tone: vent.chat.yourPace }]);
      }, 500));
    }
  }

  // PC 우측 패널 — 최근 감정 히스토리 + 커뮤니티 그룹
  const RightPanel = () => (
    <aside
      className="hidden lg:flex flex-col gap-5 overflow-y-auto flex-shrink-0"
      style={{ width: 280, borderLeft: `1px solid ${C.border2}`, padding: '20px 16px', background: C.bg }}
    >
      {/* 최근 감정 */}
      {recentEmotions && recentEmotions.length > 0 && (
        <div>
          <p className="text-[11px] mb-2" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
            {vent.selector.recentLabel}
          </p>
          <div className="flex flex-col gap-1.5">
            {recentEmotions.map((e, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-[8px]"
                style={{ background: C.bg2 }}>
                <span className="text-[11px] font-light" style={{ color: C.text2, fontFamily: "'DM Sans', sans-serif" }}>{e.emotion}</span>
                <span className="ml-auto text-[10px]" style={{ color: C.text4 }}>
                  {new Date(e.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빠른 시작 카드 */}
      {phase === 'select' && (
        <div>
          <p className="text-[11px] mb-2" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
            {vent.selector.quickCardsTitle}
          </p>
          <div className="flex flex-col gap-1.5">
            {QUICK_CARDS.map(card => (
              <button key={card.key} onClick={() => pickEmotion(card.emo)}
                className="text-left px-3 py-2.5 rounded-[8px] transition-colors"
                style={{ background: C.bg2, border: `1px solid ${C.border2}` }}>
                <span className="text-[11px] font-light leading-relaxed" style={{ color: C.text2, fontFamily: "'DM Sans', sans-serif" }}>
                  {card.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 커뮤니티 그룹 */}
      <div>
        <p className="text-[11px] mb-2" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
          {vent.community.subtitle}
        </p>
        <div className="flex flex-col gap-1.5">
          {COMM_GROUPS.map((g, i) => (
            <div key={i} className="px-3 py-2.5 rounded-[8px]" style={{ background: C.bg2 }}>
              <p className="text-[11px] font-light mb-0.5" style={{ color: C.text, fontFamily: "'DM Sans', sans-serif" }}>{g.title}</p>
              <p className="text-[10px]" style={{ color: C.text4, fontFamily: "'DM Sans', sans-serif" }}>{g.desc}</p>
              <p className="text-[10px] mt-1" style={{ color: C.amber }}>{g.count}{vent.community.people}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex flex-col" style={{ background: C.bg, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      {crisisLevel && <CrisisBanner severity={crisisLevel} onDismiss={() => setCrisisLevel(null)} />}

      {/* 헤더 */}
      <div className="flex-shrink-0 flex items-center gap-[10px] px-5 py-2" style={{ borderBottom: `1px solid ${C.border2}` }}>
        <div className="flex flex-col gap-[2px] flex-shrink-0">
          <span className="text-[22px] leading-none tracking-[.01em]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: C.text }}>{vent.header}</span>
          <span className="text-[10px] font-light tracking-[.02em]" style={{ color: C.text4 }}>{vent.subtitle}</span>
        </div>
        <div className="flex-1" />
        <AmberBtn onClick={() => setAmberOpen(true)} flash={amberFlash} />
      </div>

      {/* 섹션 탭 */}
      <div className="flex-shrink-0 flex px-[22px]" style={{ borderBottom: `1px solid ${C.border2}` }}>
        {(['vent', 'layer', 'community'] as const).map((s, i) => {
          const labels = [vent.sections.mood, vent.sections.layer, vent.sections.community];
          const active = section === s;
          return (
            <button key={s} onClick={() => setSection(s)}
              className="text-[11px] font-light py-[9px] mr-[18px] border-none bg-transparent cursor-pointer transition-colors"
              style={{ color: active ? C.amber : C.text4, fontWeight: active ? 400 : 300, borderBottom: active ? `2px solid ${C.amber}` : '2px solid transparent', fontFamily: "'DM Sans', sans-serif" }}>
              {labels[i]}
            </button>
          );
        })}
      </div>

      {/* 2컬럼 바디 (PC) / 단일 컬럼 (모바일) */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* 좌측: 메인 콘텐츠 */}
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          {section === 'vent' && (
            <div className="flex flex-col flex-1 overflow-hidden min-h-0" style={{ position: 'relative' }}>
              {phase === 'select' ? (
                <EmotionSelector
                  greeting={greeting} curEmo={curEmo}
                  lastSession={lastSession ? { emotion: lastSession.emotion, turn_count: lastSession.turn_count } : null}
                  recentEmotions={recentEmotions ?? null}
                  emotions={EMOTIONS} quickCards={QUICK_CARDS}
                  onPickEmotion={pickEmotion}
                  onResumeSession={() => lastSession && resumeSession(lastSession)}
                />
              ) : (
                <>
                  {similarCount != null && similarCount > 0 && (
                    <div className="flex-shrink-0 mx-4 mt-3 mb-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px]"
                        style={{ background: alpha(C.amber, 0.08), color: C.amber, border: `1px solid ${alpha(C.amber, 0.2)}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, display: 'inline-block' }} />
                        {vent.chat.similarPeople.replace('{emotion}', similarCount.toLocaleString())}
                      </div>
                    </div>
                  )}
                  <ChatView
                    curEmo={curEmo} msgs={msgs} msgCount={msgCount} msgVal={msgVal}
                    aiThinking={aiThinking} showSummary={showSummary}
                    sessionSaved={sessionSavedRef.current}
                    crisisLocked={crisisLevel === 'critical'}
                    emoData={EMO_DATA[curEmo]} greeting={greeting}
                    userId={user?.id}
                    hasSexSelfResult={hasSexSelfResult ?? false}
                    onMsgValChange={setMsgVal} onSendMsg={sendMsg}
                    onFinishSession={finishSession}
                    onContinueChat={() => { setShowSummary(false); setMsgs(m => [...m, { role: 'ai', text: vent.chat.continueResponse, tone: vent.chat.toneContinue }]); }}
                    onNavigateToSexSelf={() => navigate('/home/sexself/questions')}
                  />
                  {showAmberNudge && !showSummary && (
                    <div
                      className="flex-shrink-0 mx-4 mb-3 rounded-[12px] p-4"
                      style={{ background: '#242120', border: '1px solid #3C3835' }}
                    >
                      <p className="text-[14px] font-light leading-[1.6] break-keep mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#E7E5E4' }}>
                        {vent.chat.amberNudgeDeep}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowAmberNudge(false); navigate('/home/sexself/questions'); }}
                          className="flex-1 py-[9px] rounded-[20px] text-[11px] font-medium transition-all"
                          style={{ background: '#E0B48A', color: '#1C1917' }}
                        >
                          {vent.chat.amberNudgeDeepButton}
                        </button>
                        <button
                          onClick={() => setShowAmberNudge(false)}
                          className="flex-1 py-[9px] rounded-[20px] text-[11px] font-light transition-all"
                          style={{ border: '1px solid #3C3835', background: 'transparent', color: '#9C9590' }}
                        >
                          {vent.chat.sexSelfNudgeNo}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {(section === 'layer' || section === 'community') && (
            <VentLayerView
              section={section} layerGroups={LAYER_GROUPS} commGroups={COMM_GROUPS}
              expandedGroups={expandedGroups} layerActive={layerActive}
              onToggleGroup={(id) => setExpandedGroups(g => ({ ...g, [id]: !g[id] }))}
              onSetLayerActive={setLayerActive}
            />
          )}
        </div>

        {/* 우측 패널 — PC 전용 */}
        <RightPanel />
      </div>

      <AmberSheet open={amberOpen} onClose={() => setAmberOpen(false)} aiName={aiName} />
    </div>
  );
}
