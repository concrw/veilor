import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";
import {
  PersonaProfile,
  PersonaDetectionResult,
} from "@/integrations/supabase/persona-types";
import { toast } from "@/hooks/use-toast";

export const useDetectPersonas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();
  const isEn = language === 'en';

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke(
        "detect-personas",
        { body: { userId: user.id } }
      );

      if (error) throw error;
      return data as PersonaDetectionResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["personas", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["accessible-personas", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["has-multiple-personas", user?.id] });

      toast({ title: isEn ? `${data.count} persona(s) detected!` : `${data.count}개의 페르소나가 발견되었습니다!`, description: isEn ? 'Review and validate each persona.' : '각 페르소나를 확인하고 검증해주세요.' });
    },
    onError: (error) => {
      console.error("Persona detection error:", error);
      toast({ title: isEn ? 'Error detecting personas' : '페르소나 감지 중 오류가 발생했습니다', description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdatePersona = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();
  const isEn = language === 'en';

  return useMutation({
    mutationFn: async ({
      personaId,
      updates,
    }: {
      personaId: string;
      updates: Partial<PersonaProfile>;
    }) => {
      const { data, error } = await supabase
        .from("persona_profiles")
        .update(updates)
        .eq("id", personaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["persona", variables.personaId] });
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast({ title: isEn ? 'Persona updated' : '페르소나가 업데이트되었습니다' });
    },
    onError: (error) => {
      console.error("Persona update error:", error);
      toast({ title: isEn ? 'Error updating persona' : '페르소나 업데이트 중 오류가 발생했습니다', variant: "destructive" });
    },
  });
};

export const useVerifyPersona = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();
  const isEn = language === 'en';

  return useMutation({
    mutationFn: async (personaId: string) => {
      const { data, error } = await supabase
        .from("persona_profiles")
        .update({ is_user_verified: true })
        .eq("id", personaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast({ title: isEn ? 'Persona confirmed' : '페르소나를 확인했습니다' });
    },
    onError: (error) => {
      console.error("Persona verification error:", error);
      toast({ title: isEn ? 'Error confirming persona' : '페르소나 확인 중 오류가 발생했습니다', variant: "destructive" });
    },
  });
};

export const useDeactivatePersona = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();
  const isEn = language === 'en';

  return useMutation({
    mutationFn: async (personaId: string) => {
      const { data, error } = await supabase
        .from("persona_profiles")
        .update({ is_active: false })
        .eq("id", personaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast({ title: isEn ? 'Persona deactivated' : '페르소나를 비활성화했습니다' });
    },
    onError: (error) => {
      console.error("Persona deactivation error:", error);
      toast({ title: isEn ? 'Error deactivating persona' : '페르소나 비활성화 중 오류가 발생했습니다', variant: "destructive" });
    },
  });
};

export const useSetActivePersona = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();
  const isEn = language === 'en';

  return useMutation({
    mutationFn: async (personaId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update({ active_persona_id: personaId })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: isEn ? 'Active persona changed' : '활성 페르소나가 변경되었습니다' });
    },
    onError: (error) => {
      console.error("Set active persona error:", error);
      toast({ title: isEn ? 'Error changing active persona' : '활성 페르소나 변경 중 오류가 발생했습니다', variant: "destructive" });
    },
  });
};
