import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const usePersonaIkigai = (personaId: string | null) => {
  return useQuery({
    queryKey: ["persona-ikigai", personaId],
    queryFn: async () => {
      if (!personaId) throw new Error("Persona ID required");

      const { data, error } = await supabase
        .from("persona_ikigai")
        .select("*")
        .eq("persona_id", personaId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!personaId,
  });
};

export const useUpsertPersonaIkigai = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      personaId,
      ikigaiData,
    }: {
      personaId: string;
      ikigaiData: {
        love_elements?: string[];
        good_at_elements?: string[];
        world_needs_elements?: string[];
        paid_for_elements?: string[];
        final_ikigai_text?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from("persona_ikigai")
        .upsert(
          { persona_id: personaId, ...ikigaiData },
          { onConflict: "persona_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["persona-ikigai", variables.personaId] });
      queryClient.invalidateQueries({ queryKey: ["persona", variables.personaId] });
      toast({ title: "Ikigai가 저장되었습니다" });
    },
    onError: (error) => {
      console.error("Ikigai upsert error:", error);
      toast({ title: "Ikigai 저장 중 오류가 발생했습니다", variant: "destructive" });
    },
  });
};
