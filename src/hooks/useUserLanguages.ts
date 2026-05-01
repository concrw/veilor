import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';

export function useUserLanguages(): string[] {
  const { user } = useAuth();
  const [languages, setLanguages] = useState<string[]>(['ko']);

  useEffect(() => {
    if (!user) return;
    veilorDb
      .from('user_profiles')
      .select('languages')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const langs = data?.languages;
        if (Array.isArray(langs) && langs.length > 0) {
          setLanguages(langs);
        }
      });
  }, [user]);

  return languages;
}
