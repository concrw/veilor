import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";
import { getT } from "@/i18n/useT";
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
  const { language } = useLanguageContext();

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
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["persona-relationships", user?.id] });
      toast({ title: t.personaDomain.toasts.relationshipAnalysisComplete });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Relationship analysis error:", error);
      toast({ title: t.personaDomain.toasts.relationshipAnalysisError, variant: "destructive" });
    },
  });
};
