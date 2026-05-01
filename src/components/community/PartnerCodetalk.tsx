// #53 파트너 코드토크 — 커플 공동 키워드 기록
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    title: '파트너 코드토크',
    desc: '같은 키워드에 대한 서로의 정의를 비교해보세요',
    me: '나:',
    partner: '파트너:',
    emailPlaceholder: '파트너 이메일',
    inviteButton: '파트너 초대하기',
    inviteSent: '초대 전송됨!',
    partnerNotFound: '파트너를 찾을 수 없습니다',
    inviteKeyword: '파트너 초대',
    inviteDefinition: '함께 코드토크를 시작해요',
  },
  en: {
    title: 'Partner Codetalk',
    desc: 'Compare your definitions of the same keyword with your partner',
    me: 'Me:',
    partner: 'Partner:',
    emailPlaceholder: 'Partner email',
    inviteButton: 'Invite Partner',
    inviteSent: 'Invitation sent!',
    partnerNotFound: 'Partner not found',
    inviteKeyword: 'Partner Invitation',
    inviteDefinition: "Let's start codetalk together",
  },
} as const;

export default function PartnerCodetalk() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const [partnerEmail, setPartnerEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const { data: partnerEntries = [] } = useQuery({
    queryKey: ['partner-codetalk', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('partner_codetalk')
        .select('*')
        .or(`user_id.eq.${user!.id},partner_id.eq.${user!.id}`)
        .order('created_at', { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !partnerEmail.trim()) return;
      // 파트너 유저 ID 찾기
      const { data: partner } = await veilorDb
        .from('user_profiles')
        .select('user_id')
        .eq('email', partnerEmail.trim())
        .single();

      if (!partner) throw new Error(s.partnerNotFound);

      // 초대 생성 (첫 빈 엔트리)
      await veilorDb.from('partner_codetalk').insert({
        user_id: user.id,
        partner_id: partner.user_id,
        keyword: s.inviteKeyword,
        user_definition: s.inviteDefinition,
      });
    },
    onSuccess: () => {
      setInviteSent(true);
      setPartnerEmail('');
      qc.invalidateQueries({ queryKey: ['partner-codetalk'] });
    },
  });

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">💑</span>
        <p className="text-sm font-medium">{s.title}</p>
      </div>
      <p className="text-xs text-muted-foreground">{s.desc}</p>

      {partnerEntries.length > 0 ? (
        <div className="space-y-2">
          {partnerEntries.slice(0, 3).map((entry: { id: string; keyword: string; user_definition?: string; partner_definition?: string; comparison_insight?: string }) => (
            <div key={entry.id} className="bg-muted/30 rounded-xl p-3 space-y-1">
              <p className="text-xs font-medium text-primary">{entry.keyword}</p>
              {entry.user_definition && (
                <p className="text-xs"><span className="text-muted-foreground">{s.me}</span> {entry.user_definition}</p>
              )}
              {entry.partner_definition && (
                <p className="text-xs"><span className="text-muted-foreground">{s.partner}</span> {entry.partner_definition}</p>
              )}
              {entry.comparison_insight && (
                <p className="text-[10px] text-primary bg-primary/5 rounded px-2 py-1 mt-1">{entry.comparison_insight}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={partnerEmail}
            onChange={e => setPartnerEmail(e.target.value)}
            placeholder={s.emailPlaceholder}
            type="email"
            className="w-full bg-background border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => inviteMutation.mutate()}
            disabled={!partnerEmail.includes('@') || inviteMutation.isPending}
            className="w-full text-xs py-2 rounded-lg bg-primary text-white disabled:opacity-40"
          >
            {inviteSent ? s.inviteSent : inviteMutation.isPending ? '...' : s.inviteButton}
          </button>
        </div>
      )}
    </div>
  );
}
