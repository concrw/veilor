import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
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
      queryClient.invalidateQueries({ queryKey: ["persona-milestones", data.persona_id] });
      queryClient.invalidateQueries({ queryKey: ["all-milestones"] });
      toast({ title: data.is_completed ? "마일스톤 완료!" : "마일스톤 미완료로 변경" });
    },
    onError: (error) => {
      console.error("Milestone toggle error:", error);
      toast({ title: "마일스톤 업데이트 중 오류가 발생했습니다", variant: "destructive" });
    },
  });
};

export const useCreateMilestone = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["persona-milestones", data.persona_id] });
      queryClient.invalidateQueries({ queryKey: ["all-milestones"] });
      toast({ title: "마일스톤이 생성되었습니다" });
    },
    onError: (error) => {
      console.error("Milestone creation error:", error);
      toast({ title: "마일스톤 생성 중 오류가 발생했습니다", variant: "destructive" });
    },
  });
};
