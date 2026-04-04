// #53 파트너 코드토크 — 커플 공동 키워드 기록
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilrumDb } from '@/integrations/supabase/client';

export default function PartnerCodetalk() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const { data: partnerEntries = [] } = useQuery({
    queryKey: ['partner-codetalk', user?.id],
    queryFn: async () => {
      const { data } = await veilrumDb
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
      const { data: partner } = await veilrumDb
        .from('user_profiles')
        .select('user_id')
        .eq('email', partnerEmail.trim())
        .single();

      if (!partner) throw new Error('파트너를 찾을 수 없습니다');

      // 초대 생성 (첫 빈 엔트리)
      await veilrumDb.from('partner_codetalk').insert({
        user_id: user.id,
        partner_id: partner.user_id,
        keyword: '파트너 초대',
        user_definition: '함께 코드토크를 시작해요',
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
        <p className="text-sm font-medium">파트너 코드토크</p>
      </div>
      <p className="text-xs text-muted-foreground">같은 키워드에 대한 서로의 정의를 비교해보세요</p>

      {partnerEntries.length > 0 ? (
        <div className="space-y-2">
          {partnerEntries.slice(0, 3).map((entry: any) => (
            <div key={entry.id} className="bg-muted/30 rounded-xl p-3 space-y-1">
              <p className="text-xs font-medium text-primary">{entry.keyword}</p>
              {entry.user_definition && (
                <p className="text-xs"><span className="text-muted-foreground">나:</span> {entry.user_definition}</p>
              )}
              {entry.partner_definition && (
                <p className="text-xs"><span className="text-muted-foreground">파트너:</span> {entry.partner_definition}</p>
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
            placeholder="파트너 이메일"
            type="email"
            className="w-full bg-background border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => inviteMutation.mutate()}
            disabled={!partnerEmail.includes('@') || inviteMutation.isPending}
            className="w-full text-xs py-2 rounded-lg bg-primary text-white disabled:opacity-40"
          >
            {inviteSent ? '초대 전송됨!' : inviteMutation.isPending ? '...' : '파트너 초대하기'}
          </button>
        </div>
      )}
    </div>
  );
}
