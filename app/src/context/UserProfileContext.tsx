import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface UserProfileContextValue {
  amberName: string;
  frostName: string;
  heldEmotion: string | null;
  setHeldEmotion: (emo: string) => Promise<void>;
  renameAmber: (name: string) => Promise<void>;
  renameFrost: (name: string) => Promise<void>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextValue>({
  amberName: '엠버',
  frostName: '프로스트',
  heldEmotion: null,
  setHeldEmotion: async () => {},
  renameAmber: async () => {},
  renameFrost: async () => {},
  loading: true,
});

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [amberName, setAmberName] = useState('엠버');
  const [frostName, setFrostName] = useState('프로스트');
  const [heldEmotion, setHeldEmotionState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    (supabase as any)
      .schema('veilrum')
      .from('user_profiles')
      .select('ai_companion_name, held_last_emotion')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: any }) => {
        if (data) {
          if (data.ai_companion_name) {
            // ai_companion_name 형식: "엠버/프로스트" 또는 단일값
            const parts = (data.ai_companion_name as string).split('/');
            if (parts[0]) setAmberName(parts[0].trim());
            if (parts[1]) setFrostName(parts[1].trim());
          }
          if (data.held_last_emotion) setHeldEmotionState(data.held_last_emotion);
        }
        setLoading(false);
      });
  }, [user]);

  const setHeldEmotion = async (emo: string) => {
    setHeldEmotionState(emo);
    if (!user) return;
    await (supabase as any)
      .schema('veilrum')
      .from('user_profiles')
      .update({ held_last_emotion: emo })
      .eq('id', user.id);
  };

  const renameAmber = async (name: string) => {
    setAmberName(name);
    if (!user) return;
    await (supabase as any)
      .schema('veilrum')
      .from('user_profiles')
      .update({ ai_companion_name: `${name}/${frostName}` })
      .eq('id', user.id);
  };

  const renameFrost = async (name: string) => {
    setFrostName(name);
    if (!user) return;
    await (supabase as any)
      .schema('veilrum')
      .from('user_profiles')
      .update({ ai_companion_name: `${amberName}/${name}` })
      .eq('id', user.id);
  };

  return (
    <UserProfileContext.Provider value={{ amberName, frostName, heldEmotion, setHeldEmotion, renameAmber, renameFrost, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
