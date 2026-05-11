import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";
import { getT } from "@/i18n/useT";
import { toast } from "@/hooks/use-toast";

export const useBrandingStrategy = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["branding-strategy", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("persona_branding_strategies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useSaveBrandingStrategy = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();

  return useMutation({
    mutationFn: async ({
      strategyType,
      customNotes,
    }: {
      strategyType: "unified" | "hybrid" | "separated";
      customNotes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("persona_branding_strategies")
        .upsert(
          {
            user_id: user.id,
            strategy_type: strategyType,
            custom_notes: customNotes,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      const t = getT(language);
      queryClient.invalidateQueries({ queryKey: ["branding-strategy", user?.id] });
      toast({ title: t.personaDomain.toasts.brandingStrategySaved });
    },
    onError: (error) => {
      const t = getT(language);
      console.error("Branding strategy save error:", error);
      toast({ title: t.personaDomain.toasts.brandingStrategySaveError, variant: "destructive" });
    },
  });
};
