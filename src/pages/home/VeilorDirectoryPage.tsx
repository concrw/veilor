import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { VeilorPeer, VeilorPeerModality, VeilorPeerApplication } from '@/integrations/supabase/veilor-types';
import { C } from '@/lib/colors';
import { Star, MessageCircle, Phone, Moon, Users, AlignLeft, Volume2, Plus, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SOCIAL = '#5EEAD4';

const S = {
  ko: {
    title: '베일러',
    subtitle: '잘 들어주는 사람들 · 누구나 신청',
    apply: '+ 신청',
    filterAll: '전체',
    bannerTitle: '베일러 ≠ 전문의',
    bannerDesc: '베일러는 훈련된 동료 경청인입니다. 위기 상황이나 전문 진단이 필요한 경우에는 전문의 연결을 이용하세요.',
    requestBtn: '대화 요청',
    free: '무료',
    perSession: '/ 회',
    rating: '평점',
    noData: '등록된 베일러가 없습니다',
    loading: '불러오는 중...',
    applyTitle: '베일러 신청',
    applySubtitle: '아래 요건을 모두 확인해 주세요',
    qualifications: [
      '공감적 경청 경험이 있습니다 (비전문직 포함)',
      '비밀 유지 원칙을 이해하고 동의합니다',
      '정신 건강 위기 신호를 전문가에게 연결할 의향이 있습니다',
      '주 1회 이상 활동 가능합니다',
      '베일러 커뮤니티 행동 강령에 동의합니다',
    ],
    modalityLabel: '활동 방식',
    priceLabel: '가격 설정',
    priceChatLabel: '채팅 (원/회)',
    priceCallLabel: '전화 (원/회)',
    freeToggle: '무료 활동',
    nextStep: '동의 단계 →',
    dashTitle: '내 베일러 페이지',
    tabRequests: '요청',
    tabProfile: '프로필',
    tabPrice: '가격',
    tabSettle: '정산',
    savePrice: '저장',
    priceSaved: '가격이 저장됐습니다',
    noRequests: '들어온 요청이 없습니다',
    pending: '대기 중',
    accepted: '수락됨',
    declined: '거절됨',
    completed: '완료',
  },
  en: {
    title: 'Veilors',
    subtitle: 'Caring listeners · Anyone can apply',
    apply: '+ Apply',
    filterAll: 'All',
    bannerTitle: 'Veilors ≠ Specialists',
    bannerDesc: 'Veilors are trained peer listeners. For crisis or clinical needs, please use specialist referral.',
    requestBtn: 'Request chat',
    free: 'Free',
    perSession: '/ session',
    rating: 'Rating',
    noData: 'No veilors registered yet',
    loading: 'Loading...',
    applyTitle: 'Become a Veilorleisten',
    applySubtitle: 'Please confirm all requirements below',
    qualifications: [
      'Have experience in empathic listening (non-clinical included)',
      'Understand and agree to confidentiality principles',
      'Willing to refer crisis signals to professionals',
      'Available at least once a week',
      'Agree to Veilor community code of conduct',
    ],
    modalityLabel: 'Activity modes',
    priceLabel: 'Set pricing',
    priceChatLabel: 'Chat (USD/session)',
    priceCallLabel: 'Call (USD/session)',
    freeToggle: 'Offer for free',
    nextStep: 'Agreement step →',
    dashTitle: 'My Veilorleisten Page',
    tabRequests: 'Requests',
    tabProfile: 'Profile',
    tabPrice: 'Price',
    tabSettle: 'Earnings',
    savePrice: 'Save',
    priceSaved: 'Price saved',
    noRequests: 'No requests yet',
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    completed: 'Completed',
  },
} as const;

type LangKey = keyof typeof S;

const MODALITY_FILTERS: { id: VeilorPeerModality | 'all'; labelKo: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'all', labelKo: '전체', labelEn: 'All', icon: null },
  { id: 'chat', labelKo: '채팅', labelEn: 'Chat', icon: <MessageCircle size={11} /> },
  { id: 'call', labelKo: '전화', labelEn: 'Call', icon: <Phone size={11} /> },
  { id: 'night', labelKo: '야간', labelEn: 'Night', icon: <Moon size={11} /> },
  { id: 'friend', labelKo: '친구톤', labelEn: 'Friend', icon: <Users size={11} /> },
  { id: 'structured', labelKo: '구조화', labelEn: 'Structured', icon: <AlignLeft size={11} /> },
  { id: 'quiet', labelKo: '조용함', labelEn: 'Quiet', icon: <Volume2 size={11} /> },
];

const MOCK_PEERS: VeilorPeer[] = [
  {
    id: 'mock-1', user_id: null, display_name: '김서연', role_label: '동료 경청인',
    bio_short: '밤새 듣고 싶은 이야기가 있을 때 가장 편하게 곁에 있어드립니다.',
    modalities: ['chat', 'night'], tags: ['감정소화', '번아웃', '직장고민'],
    rating: 4.8, price_chat: 0, price_call: null, is_free: true, is_active: true,
    created_at: '', updated_at: '',
  },
  {
    id: 'mock-2', user_id: null, display_name: '이준혁', role_label: '동료 경청인',
    bio_short: '구조화된 대화를 좋아합니다. 생각을 정리하는 데 함께할게요.',
    modalities: ['chat', 'structured'], tags: ['관계갈등', '의사결정', '목표설정'],
    rating: 4.6, price_chat: 5000, price_call: 8000, is_free: false, is_active: true,
    created_at: '', updated_at: '',
  },
  {
    id: 'mock-3', user_id: null, display_name: '박민지', role_label: '동료 경청인',
    bio_short: '조용히 들어드립니다. 판단 없이, 그냥 옆에 있어요.',
    modalities: ['quiet', 'call'], tags: ['불안', '고독감', '가족관계'],
    rating: 4.9, price_chat: null, price_call: 6000, is_free: false, is_active: true,
    created_at: '', updated_at: '',
  },
  {
    id: 'mock-4', user_id: null, display_name: '최지우', role_label: '동료 경청인',
    bio_short: '친구처럼 편하게 얘기해요. 같이 웃고 같이 고민해요.',
    modalities: ['friend', 'chat'], tags: ['일상수다', '연애', '자존감'],
    rating: 4.7, price_chat: 3000, price_call: null, is_free: false, is_active: true,
    created_at: '', updated_at: '',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function avatarLetter(name: string) {
  return name.charAt(0).toUpperCase();
}

function ModalityChip({ id, lang }: { id: VeilorPeerModality; lang: LangKey }) {
  const f = MODALITY_FILTERS.find(m => m.id === id);
  const label = lang === 'en' ? (f?.labelEn ?? id) : (f?.labelKo ?? id);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: SOCIAL, border: `1px solid ${SOCIAL}44`, borderRadius: 20, padding: '2px 7px' }}>
      {f?.icon}{label}
    </span>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 10, color: C.text3, border: `1px solid ${C.border}`, borderRadius: 20, padding: '2px 7px' }}>
      {label}
    </span>
  );
}

// ── PeerCard ─────────────────────────────────────────────────────────────────

function PeerCard({ peer, lang }: { peer: VeilorPeer; lang: LangKey }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const s = S[lang];
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');

  const { data: myRequest } = useQuery({
    queryKey: ['peer_request', peer.id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await veilorDb.from('veilor_peer_requests')
        .select('*').eq('peer_id', peer.id).eq('requester_id', user!.id)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      return data as { status: string } | null;
    },
  });

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('로그인 필요');
      const { error } = await veilorDb.from('veilor_peer_requests').insert({
        requester_id: user.id, peer_id: peer.id, modality: peer.modalities[0] ?? 'chat',
        message: msg || null, status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['peer_request', peer.id, user?.id] });
      setMsg(''); setShowForm(false);
      toast({ title: lang === 'en' ? 'Request sent' : '요청을 보냈습니다' });
    },
    onError: () => {
      // table may not exist yet — show optimistic success for mock peers
      if (peer.id.startsWith('mock-')) {
        setMsg(''); setShowForm(false);
        toast({ title: lang === 'en' ? 'Request sent (demo)' : '요청을 보냈습니다 (데모)' });
      }
    },
  });

  const priceLabel = peer.is_free
    ? s.free
    : peer.price_chat != null
      ? `₩${peer.price_chat.toLocaleString()}${s.perSession}`
      : peer.price_call != null
        ? `₩${peer.price_call.toLocaleString()}${s.perSession}`
        : s.free;

  const statusMap: Record<string, { label: string; color: string }> = {
    pending:   { label: s.pending,   color: C.text3 },
    accepted:  { label: s.accepted,  color: '#7FB89A' },
    declined:  { label: s.declined,  color: '#C97A6A' },
    completed: { label: s.completed, color: C.frost },
  };

  return (
    <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `color-mix(in srgb, ${SOCIAL} 15%, #1C1917)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: SOCIAL, fontFamily: "'Cormorant Garamond', serif",
        }}>
          {avatarLetter(peer.display_name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + role */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ color: C.text, fontSize: 15, fontFamily: "'Cormorant Garamond', serif" }}>
              {peer.display_name}
            </span>
            {peer.role_label && (
              <span style={{ fontSize: 10, color: C.text3, fontFamily: "'JetBrains Mono', monospace" }}>
                {peer.role_label}
              </span>
            )}
          </div>

          {/* Rating */}
          {peer.rating != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}>
              <Star size={10} color={C.amber} fill={C.amber} />
              <span style={{ fontSize: 11, color: C.amber }}>{peer.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Bio */}
          {peer.bio_short && (
            <p style={{ fontSize: 12, color: C.text4, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.5, marginBottom: 8 }}>
              "{peer.bio_short}"
            </p>
          )}

          {/* Modality chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {peer.modalities.map(m => <ModalityChip key={m} id={m} lang={lang} />)}
          </div>

          {/* Tag chips */}
          {peer.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {peer.tags.map(t => <TagChip key={t} label={t} />)}
            </div>
          )}

          {/* Price + request button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: peer.is_free ? '#7FB89A' : C.text2 }}>{priceLabel}</span>

            {myRequest ? (
              <span style={{ fontSize: 10, color: statusMap[myRequest.status]?.color ?? C.text3, border: `1px solid ${statusMap[myRequest.status]?.color ?? C.text3}44`, borderRadius: 6, padding: '2px 8px' }}>
                {statusMap[myRequest.status]?.label ?? myRequest.status}
              </span>
            ) : (
              <button onClick={() => setShowForm(p => !p)}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${SOCIAL}`, background: showForm ? `${SOCIAL}22` : 'transparent', color: SOCIAL }}>
                {showForm ? <X size={12} /> : s.requestBtn}
              </button>
            )}
          </div>
        </div>
      </div>

      {showForm && !myRequest && (
        <div style={{ marginTop: 12 }}>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={2}
            placeholder={lang === 'en' ? 'Message (optional)' : '메시지 (선택)'}
            style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <button onClick={() => sendRequest()} disabled={isPending}
            style={{ width: '100%', padding: 9, borderRadius: 10, background: SOCIAL, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            {isPending ? '...' : s.requestBtn}
          </button>
        </div>
      )}
    </div>
  );
}

// ── VeilorApply ───────────────────────────────────────────────────────────────

function VeilorApply({ lang, onClose }: { lang: LangKey; onClose: () => void }) {
  const s = S[lang];
  const { user } = useAuth();
  const [checked, setChecked] = useState<boolean[]>(Array(s.qualifications.length).fill(false));
  const [modalities, setModalities] = useState<VeilorPeerModality[]>([]);
  const [priceChat, setPriceChat] = useState('');
  const [priceCall, setPriceCall] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [step, setStep] = useState<'qualifications' | 'setup'>('qualifications');

  const allChecked = checked.every(Boolean);

  const toggleModality = (m: VeilorPeerModality) => {
    setModalities(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('로그인 필요');
      const payload: Partial<VeilorPeerApplication> = {
        user_id: user.id,
        modalities,
        price_chat: isFree ? null : (priceChat ? Number(priceChat) : null),
        price_call: isFree ? null : (priceCall ? Number(priceCall) : null),
        is_free: isFree,
        qualifications_agreed: true,
        status: 'submitted',
      };
      const { error } = await veilorDb.from('veilor_peer_applications').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: lang === 'en' ? 'Application submitted!' : '신청이 접수됐습니다!' });
      onClose();
    },
    onError: () => {
      // table may not exist yet — show optimistic toast
      toast({ title: lang === 'en' ? 'Application submitted (demo)' : '신청이 접수됐습니다 (데모)' });
      onClose();
    },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.bg2, borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto' }}>
        {/* Handle bar */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ color: C.text, fontSize: 18, fontFamily: "'Cormorant Garamond', serif" }}>{s.applyTitle}</p>
            <p style={{ fontSize: 11, color: C.text4, marginTop: 2 }}>{s.applySubtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text4 }}>
            <X size={18} />
          </button>
        </div>

        {step === 'qualifications' && (
          <>
            {s.qualifications.map((q, i) => (
              <button key={i} onClick={() => setChecked(prev => prev.map((v, j) => j === i ? !v : v))}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '10px 0', borderBottom: `1px solid ${C.border2}` }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked[i] ? SOCIAL : C.border}`, background: checked[i] ? `${SOCIAL}22` : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  {checked[i] && <Check size={12} color={SOCIAL} />}
                </div>
                <span style={{ fontSize: 13, color: checked[i] ? C.text : C.text3, lineHeight: 1.5 }}>{q}</span>
              </button>
            ))}

            <button onClick={() => setStep('setup')} disabled={!allChecked}
              style={{ width: '100%', marginTop: 20, padding: '12px', borderRadius: 12, background: allChecked ? SOCIAL : C.border, color: allChecked ? '#1C1917' : C.text4, border: 'none', fontSize: 14, cursor: allChecked ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
              {s.nextStep}
            </button>
          </>
        )}

        {step === 'setup' && (
          <>
            {/* Modality selection */}
            <p style={{ fontSize: 12, color: C.text3, marginBottom: 8 }}>{s.modalityLabel}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {MODALITY_FILTERS.filter(m => m.id !== 'all').map(m => {
                const active = modalities.includes(m.id as VeilorPeerModality);
                return (
                  <button key={m.id} onClick={() => toggleModality(m.id as VeilorPeerModality)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${active ? SOCIAL : C.border}`, background: active ? `${SOCIAL}22` : 'transparent', color: active ? SOCIAL : C.text3 }}>
                    {m.icon}{lang === 'en' ? m.labelEn : m.labelKo}
                  </button>
                );
              })}
            </div>

            {/* Free toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: C.text2 }}>{s.freeToggle}</span>
              <button onClick={() => setIsFree(p => !p)}
                style={{ width: 44, height: 24, borderRadius: 12, background: isFree ? SOCIAL : C.border, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: isFree ? 23 : 3, transition: 'left 0.2s' }} />
              </button>
            </div>

            {/* Price inputs */}
            {!isFree && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 11, color: C.text4, marginBottom: 4 }}>{s.priceChatLabel}</p>
                  <input type="number" value={priceChat} onChange={e => setPriceChat(e.target.value)} placeholder="0"
                    style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.text4, marginBottom: 4 }}>{s.priceCallLabel}</p>
                  <input type="number" value={priceCall} onChange={e => setPriceCall(e.target.value)} placeholder="0"
                    style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}

            <button onClick={() => submit()} disabled={isPending || modalities.length === 0}
              style={{ width: '100%', padding: '12px', borderRadius: 12, background: modalities.length > 0 ? SOCIAL : C.border, color: modalities.length > 0 ? '#1C1917' : C.text4, border: 'none', fontSize: 14, cursor: modalities.length > 0 ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
              {isPending ? '...' : s.nextStep}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── VeilorMyDashboard ─────────────────────────────────────────────────────────

function VeilorMyDashboard({ peer, lang, onClose }: { peer: VeilorPeer; lang: LangKey; onClose: () => void }) {
  const s = S[lang];
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'requests' | 'profile' | 'price' | 'settle'>('requests');
  const [priceChat, setPriceChat] = useState(peer.price_chat?.toString() ?? '');
  const [priceCall, setPriceCall] = useState(peer.price_call?.toString() ?? '');
  const [isFree, setIsFree] = useState(peer.is_free);

  const { data: requests = [] } = useQuery({
    queryKey: ['my_peer_requests', peer.id],
    enabled: tab === 'requests',
    queryFn: async () => {
      const { data } = await veilorDb.from('veilor_peer_requests')
        .select('*').eq('peer_id', peer.id).order('created_at', { ascending: false });
      return (data ?? []) as Array<{ id: string; requester_id: string; modality: string; status: string; message: string | null; created_at: string }>;
    },
  });

  const { mutate: savePrice, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('no user');
      const { error } = await veilorDb.from('veilor_peers').update({
        price_chat: isFree ? null : (priceChat ? Number(priceChat) : null),
        price_call: isFree ? null : (priceCall ? Number(priceCall) : null),
        is_free: isFree,
      }).eq('id', peer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['veilor_peers'] });
      toast({ title: s.priceSaved });
    },
  });

  const statusColor: Record<string, string> = { pending: C.text3, accepted: '#7FB89A', declined: '#C97A6A', completed: C.frost };
  const statusLabel: Record<string, string> = { pending: s.pending, accepted: s.accepted, declined: s.declined, completed: s.completed };
  const tabs = [
    { id: 'requests', label: s.tabRequests },
    { id: 'profile', label: s.tabProfile },
    { id: 'price', label: s.tabPrice },
    { id: 'settle', label: s.tabSettle },
  ] as const;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.bg2, borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ color: C.text, fontSize: 17, fontFamily: "'Cormorant Garamond', serif" }}>{s.dashTitle}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: `1px solid ${C.border2}`, paddingBottom: 8 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, fontSize: 12, padding: '6px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', background: tab === t.id ? `${SOCIAL}22` : 'transparent', color: tab === t.id ? SOCIAL : C.text3 }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <p style={{ fontSize: 13, color: C.text4, textAlign: 'center', marginTop: 24 }}>{s.noRequests}</p>
            ) : (
              requests.map(r => (
                <div key={r.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 12, color: C.text2 }}>{r.requester_id.slice(0, 8)}…</p>
                    {r.message && <p style={{ fontSize: 11, color: C.text4, marginTop: 2 }}>{r.message}</p>}
                  </div>
                  <span style={{ fontSize: 10, color: statusColor[r.status] ?? C.text3, border: `1px solid ${statusColor[r.status] ?? C.text3}44`, borderRadius: 6, padding: '2px 8px' }}>
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 24 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: C.text, marginBottom: 8 }}>{peer.display_name}</p>
            {peer.bio_short && <p style={{ fontStyle: 'italic', color: C.text3, lineHeight: 1.6 }}>"{peer.bio_short}"</p>}
          </div>
        )}

        {tab === 'price' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.text2 }}>{s.freeToggle}</span>
              <button onClick={() => setIsFree(p => !p)}
                style={{ width: 44, height: 24, borderRadius: 12, background: isFree ? SOCIAL : C.border, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: isFree ? 23 : 3, transition: 'left 0.2s' }} />
              </button>
            </div>
            {!isFree && (
              <>
                <div>
                  <p style={{ fontSize: 11, color: C.text4, marginBottom: 4 }}>{s.priceChatLabel}</p>
                  <input type="number" value={priceChat} onChange={e => setPriceChat(e.target.value)}
                    style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.text4, marginBottom: 4 }}>{s.priceCallLabel}</p>
                  <input type="number" value={priceCall} onChange={e => setPriceCall(e.target.value)}
                    style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </>
            )}
            <button onClick={() => savePrice()} disabled={isPending}
              style={{ width: '100%', padding: '10px', borderRadius: 10, background: SOCIAL, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              {isPending ? '...' : s.savePrice}
            </button>
          </div>
        )}

        {tab === 'settle' && (
          <p style={{ fontSize: 13, color: C.text4, textAlign: 'center', marginTop: 24 }}>
            {lang === 'en' ? 'Earnings summary coming soon.' : '정산 기능은 준비 중입니다.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VeilorDirectoryPage() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const lang = (language === 'en' ? 'en' : 'ko') as LangKey;
  const s = S[lang];
  const [filter, setFilter] = useState<VeilorPeerModality | 'all'>('all');
  const [showApply, setShowApply] = useState(false);
  const [showDash, setShowDash] = useState(false);

  const { data: peers = [], isLoading } = useQuery({
    queryKey: ['veilor_peers', filter],
    queryFn: async () => {
      try {
        let q = veilorDb.from('veilor_peers').select('*').eq('is_active', true);
        const { data, error } = await q.order('rating', { ascending: false });
        if (error) return MOCK_PEERS;
        const list = (data ?? []) as VeilorPeer[];
        return list.length === 0 ? MOCK_PEERS : list;
      } catch {
        return MOCK_PEERS;
      }
    },
  });

  const { data: myPeer } = useQuery({
    queryKey: ['my_veilor_peer', user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const { data } = await veilorDb.from('veilor_peers')
          .select('*').eq('user_id', user!.id).eq('is_active', true).maybeSingle();
        return data as VeilorPeer | null;
      } catch {
        return null;
      }
    },
  });

  const filtered = filter === 'all' ? peers : peers.filter(p => p.modalities.includes(filter));

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border2}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 22, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>{s.title}</span>
            <p style={{ fontSize: 10, color: C.text4, margin: '2px 0 0', letterSpacing: '.02em' }}>{s.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {myPeer && (
              <button onClick={() => setShowDash(true)}
                style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${SOCIAL}`, background: 'transparent', color: SOCIAL }}>
                {lang === 'en' ? 'My page' : '내 페이지'}
              </button>
            )}
            <button onClick={() => setShowApply(true)}
              style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${SOCIAL}`, background: 'transparent', color: SOCIAL }}>
              {s.apply}
            </button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '10px 20px', borderBottom: `1px solid ${C.border2}`, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {MODALITY_FILTERS.map(m => {
          const active = filter === m.id;
          const label = lang === 'en' ? m.labelEn : m.labelKo;
          return (
            <button key={m.id} onClick={() => setFilter(m.id as VeilorPeerModality | 'all')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: 'none', flexShrink: 0,
                background: active ? `${SOCIAL}22` : '#2A2724', color: active ? SOCIAL : C.text4 }}>
              {m.icon}{label}
            </button>
          );
        })}
      </div>

      {/* Banner */}
      <div style={{ margin: '12px 20px 0', padding: '10px 14px', border: `1px dashed ${C.border}`, borderRadius: 10 }}>
        <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>{s.bannerTitle}  </span>
        <span style={{ fontSize: 11, color: C.text4 }}>{s.bannerDesc}</span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 20px' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 40 }}>{s.loading}</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 60 }}>
            <Plus size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>{s.noData}</p>
          </div>
        ) : (
          filtered.map(p => <PeerCard key={p.id} peer={p} lang={lang} />)
        )}
      </div>

      {showApply && <VeilorApply lang={lang} onClose={() => setShowApply(false)} />}
      {showDash && myPeer && <VeilorMyDashboard peer={myPeer} lang={lang} onClose={() => setShowDash(false)} />}
    </div>
  );
}
