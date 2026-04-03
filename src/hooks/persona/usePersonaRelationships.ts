import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export const usePersonaRelationships = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["persona-relationships", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("persona_relationships")
        .select("*")
        .eq("user_id", user.id)
        .order("strength_score", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAnalyzePersonaRelationships = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke(
        "analyze-persona-relationships",
        { body: { userId: user.id } }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persona-relationships", user?.id] });
      toast({ title: "페르소나 관계 분석이 완료되었습니다" });
    },
    onError: (error) => {
      console.error("Relationship analysis error:", error);
      toast({ title: "관계 분석 중 오류가 발생했습니다", variant: "destructive" });
    },
  });
};
