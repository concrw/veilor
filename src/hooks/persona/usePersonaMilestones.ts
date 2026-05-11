import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";
import { getT } from "@/i18n/useT";
import { toast } from "@/hooks/use-toast";

export const usePersonaMilestones = (personaId: string | null) => {
  return useQuery({
    queryKey: ["persona-milestones", personaId],
    queryFn: async () => {
      if (!personaId) throw new Error("Persona ID required");

      const { data, error } = await supabase
        .from("persona_milestones")
        .select("*")
        .eq("persona_id", personaId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!personaId,
  });
};

export const useAllMilestones = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-milestones", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("persona_milestones")
        .select("*, persona:persona_profiles(persona_name, color_hex)")
        .eq("user_id", user.id)
        .order("target_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useToggleMilestone = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();

  return useMutation({
    mutationFn: async ({
      milestoneId,
      isCompleted,
    }: {
      milestoneId: string;
      isCompleted: boolean;
    }) => {
      const { data, error } = await supabase
        .from("persona_milestones")
        .update({ is_completed: isCompleted })
        .eq("id", milestoneId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["persona-milestones", data.persona_id] });
      queryClient.invalidateQueries({ queryKey: ["all-milestones"] });
      toast({ title: data.is_completed ? t.personaDomain.toasts.milestoneComplete : t.personaDomain.toasts.milestoneIncomplete });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Milestone toggle error:", error);
      toast({ title: t.personaDomain.toasts.milestoneUpdateError, variant: "destructive" });
    },
  });
};

export const useCreateMilestone = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();

  return useMutation({
    mutationFn: async ({
      personaId,
      title,
      description,
      milestoneType,
      targetDate,
    }: {
      personaId: string;
      title: string;
      description?: string;
      milestoneType?: string;
      targetDate?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("persona_milestones")
        .insert({
          user_id: user.id,
          persona_id: personaId,
          title,
          description,
          milestone_type: milestoneType,
          target_date: targetDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["persona-milestones", data.persona_id] });
      queryClient.invalidateQueries({ queryKey: ["all-milestones"] });
      toast({ title: t.personaDomain.toasts.milestoneCreated });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Milestone creation error:", error);
      toast({ title: t.personaDomain.toasts.milestoneCreateError, variant: "destructive" });
    },
  });
};
