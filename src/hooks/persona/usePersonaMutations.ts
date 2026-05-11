import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";
import { getT } from "@/i18n/useT";
import {
  PersonaProfile,
  PersonaDetectionResult,
} from "@/integrations/supabase/persona-types";
import { toast } from "@/hooks/use-toast";

export const useDetectPersonas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();

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
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["personas", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["accessible-personas", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["has-multiple-personas", user?.id] });

      toast({ title: t.personaDomain.toasts.personasDetectedFmt(data.count), description: t.personaDomain.toasts.personasDetectedDesc });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Persona detection error:", error);
      toast({ title: t.personaDomain.toasts.personaDetectError, description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdatePersona = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();

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
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["persona", variables.personaId] });
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast({ title: t.personaDomain.toasts.personaUpdated });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Persona update error:", error);
      toast({ title: t.personaDomain.toasts.personaUpdateError, variant: "destructive" });
    },
  });
};

export const useVerifyPersona = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();

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
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast({ title: t.personaDomain.toasts.personaConfirmed });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Persona verification error:", error);
      toast({ title: t.personaDomain.toasts.personaConfirmError, variant: "destructive" });
    },
  });
};

export const useDeactivatePersona = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();

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
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast({ title: t.personaDomain.toasts.personaDeactivated });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Persona deactivation error:", error);
      toast({ title: t.personaDomain.toasts.personaDeactivateError, variant: "destructive" });
    },
  });
};

export const useSetActivePersona = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();

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
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: t.personaDomain.toasts.activePersonaChanged });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Set active persona error:", error);
      toast({ title: t.personaDomain.toasts.activePersonaChangeError, variant: "destructive" });
    },
  });
};
