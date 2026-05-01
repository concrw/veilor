import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    anonUser: '익명 사용자',
    continueChat: '대화 이어가기',
    sendMessage: '메시지 보내기',
    back: '← 뒤로',
    startChatTitle: '대화를 시작할까요?',
    startChatDesc: '상대방이 수락하면 메시지를 주고받을 수 있습니다. 안전하게 보호됩니다.',
    cancel: '취소',
    requesting: '요청 중...',
    start: '시작',
    errorTitle: '오류',
    errorDesc: '대화방을 만들 수 없습니다.',
  },
  en: {
    anonUser: 'Anonymous user',
    continueChat: 'Continue chat',
    sendMessage: 'Send message',
    back: '← Back',
    startChatTitle: 'Start a conversation?',
    startChatDesc: 'Once the other person accepts, you can exchange messages. Your privacy is protected.',
    cancel: 'Cancel',
    requesting: 'Requesting...',
    start: 'Start',
    errorTitle: 'Error',
    errorDesc: 'Could not create a chat room.',
  },
};

interface DmRoom {
  id: string;
  user_a_id: string;
  user_b_id: string;
  is_active: boolean;
  consent_a: boolean;
  consent_b: boolean;
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  // 상대방 프로필 조회
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('user_profiles')
        .select('user_id, nickname, primary_mask, axis_scores')
        .eq('user_id', userId!)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  // 기존 DM 룸 확인 (양방향)
  const { data: existingRoom } = useQuery({
    queryKey: ['dm-room-check', user?.id, userId],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('dm_rooms')
        .select('*')
        .or(
          `and(user_a_id.eq.${user!.id},user_b_id.eq.${userId}),and(user_a_id.eq.${userId},user_b_id.eq.${user!.id})`
        )
        .eq('is_active', true)
        .maybeSingle();
      return data as DmRoom | null;
    },
    enabled: !!user && !!userId,
  });

  // DM 룸 생성
  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await veilorDb
        .from('dm_rooms')
        .insert({
          user_a_id: user!.id,
          user_b_id: userId!,
          is_active: true,
          consent_a: true,
          consent_b: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data as DmRoom;
    },
    onSuccess: (room) => {
      qc.invalidateQueries({ queryKey: ['dm-rooms'] });
      setShowConfirmModal(false);
      navigate('/home/dm', { state: { roomId: room.id, partnerUserId: userId } });
    },
    onError: () => {
      toast({ title: s.errorTitle, description: s.errorDesc, variant: 'destructive' });
    },
  });

  const handleSendMessage = () => {
    if (!user) { navigate('/auth/login'); return; }
    if (user.id === userId) return;
    if (existingRoom) {
      navigate('/home/dm', { state: { roomId: existingRoom.id, partnerUserId: userId } });
      return;
    }
    setShowConfirmModal(true);
  };

  const isOwnProfile = user?.id === userId;
  const displayName = profile?.nickname ?? profile?.primary_mask ?? s.anonUser;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917' }}>
        <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid #D4A574', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* PC 좌측 패널 */}
        <div className="hidden lg:flex flex-col flex-shrink-0 justify-center items-center border-r px-12 py-10 space-y-6" style={{ width: 320, borderColor: '#2A2624' }}>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-semibold"
            style={{ background: '#D4A57420', border: '1px solid #D4A57440', color: '#D4A574' }}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium" style={{ color: '#F5F5F4' }}>{displayName}</h2>
            {profile?.primary_mask && (
              <span className="inline-block text-xs px-2.5 py-1 rounded-full" style={{ background: '#D4A57415', border: '1px solid #D4A57430', color: '#D4A574' }}>
                {profile.primary_mask}
              </span>
            )}
          </div>
          {!isOwnProfile && (
            <button
              onClick={handleSendMessage}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ background: '#D4A574', color: '#1C1917' }}
            >
              {existingRoom ? s.continueChat : s.sendMessage}
            </button>
          )}
        </div>

        {/* 우측 / 모바일 메인 */}
        <div className="flex-1 px-4 py-6" style={{ maxWidth: 600 }}>
          <div className="space-y-5">
            {/* 뒤로가기 */}
            <button onClick={() => navigate(-1)} className="text-xs" style={{ color: '#A8A29E' }}>{s.back}</button>

            {/* 모바일 프로필 카드 */}
            <div className="lg:hidden rounded-2xl p-6 space-y-5" style={{ background: '#292524', border: '1px solid #44403C' }}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold" style={{ background: '#D4A57420', border: '1px solid #D4A57440', color: '#D4A574' }}>
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-base font-medium" style={{ color: '#F5F5F4' }}>{displayName}</h2>
                  {profile?.primary_mask && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full" style={{ background: '#D4A57415', border: '1px solid #D4A57430', color: '#D4A574' }}>
                      {profile.primary_mask}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 모바일 메시지 버튼 */}
            {!isOwnProfile && (
              <button className="lg:hidden w-full py-3 rounded-xl text-sm font-medium" onClick={handleSendMessage} style={{ background: '#D4A574', color: '#1C1917' }}>
                {existingRoom ? s.continueChat : s.sendMessage}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="mx-4 max-w-xs w-full rounded-2xl p-6 space-y-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
              <div className="space-y-1">
                <h3 className="text-sm font-medium" style={{ color: '#F5F5F4' }}>{s.startChatTitle}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#A8A29E' }}>
                  {s.startChatDesc}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={createRoomMutation.isPending}
                  className="flex-1 py-2 rounded-xl text-xs"
                  style={{ border: '1px solid #44403C', color: '#A8A29E', background: 'transparent' }}
                >
                  {s.cancel}
                </button>
                <button
                  onClick={() => createRoomMutation.mutate()}
                  disabled={createRoomMutation.isPending}
                  className="flex-1 py-2 rounded-xl text-xs font-medium"
                  style={{ background: '#D4A574', color: '#1C1917' }}
                >
                  {createRoomMutation.isPending ? s.requesting : s.start}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
