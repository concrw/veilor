import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export const useGrowthSummary = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["growth-summary", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("get_persona_growth_summary", {
        input_user_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const usePersonaGrowthHistory = (personaId: string | null) => {
  return useQuery({
    queryKey: ["persona-growth-history", personaId],
    queryFn: async () => {
      if (!personaId) throw new Error("Persona ID required");

      const { data, error } = await supabase
        .from("persona_growth_metrics")
        .select("*")
        .eq("persona_id", personaId)
        .order("measurement_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!personaId,
  });
};

export const useRecordGrowthMetric = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      personaId,
      strengthScore,
      notes,
    }: {
      personaId: string;
      strengthScore: number;
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("persona_growth_metrics")
        .insert({
          user_id: user.id,
          persona_id: personaId,
          strength_score: strengthScore,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["persona-growth-history", data.persona_id] });
      queryClient.invalidateQueries({ queryKey: ["growth-summary"] });
      toast({ title: "성장 지표가 기록되었습니다" });
    },
    onError: (error) => {
      console.error("Growth metric recording error:", error);
      toast({ title: "성장 지표 기록 중 오류가 발생했습니다", variant: "destructive" });
    },
  });
};
