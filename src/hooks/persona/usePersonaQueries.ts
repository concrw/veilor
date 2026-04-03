import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PersonaWithDetails } from "@/integrations/supabase/persona-types";

export const usePersonas = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["personas", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("persona_profiles")
        .select(
          `
          *,
          persona_keywords (keyword, frequency),
          persona_perspectives (*),
          persona_ikigai (*),
          persona_brands (*)
        `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("rank_order", { ascending: true });

      if (error) throw error;
      return data as PersonaWithDetails[];
    },
    enabled: !!user,
  });
};

export const useAccessiblePersonas = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["accessible-personas", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("get_accessible_personas", {
        input_user_id: user.id,
      });

      if (error) throw error;
      return data as PersonaWithDetails[];
    },
    enabled: !!user,
  });
};

export const usePersona = (personaId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["persona", personaId],
    queryFn: async () => {
      if (!user || !personaId) throw new Error("Missing required data");

      const { data, error } = await supabase
        .from("persona_profiles")
        .select(
          `
          *,
          persona_keywords (keyword, frequency),
          persona_perspectives (*),
          persona_ikigai (*),
          persona_brands (*)
        `
        )
        .eq("id", personaId)
        .single();

      if (error) throw error;
      return data as PersonaWithDetails;
    },
    enabled: !!user && !!personaId,
  });
};

export const useMainPersona = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["main-persona", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("persona_profiles")
        .select(
          `
          *,
          persona_keywords (keyword, frequency),
          persona_perspectives (*),
          persona_ikigai (*),
          persona_brands (*)
        `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .eq("rank_order", 1)
        .single();

      if (error) throw error;
      return data as PersonaWithDetails;
    },
    enabled: !!user,
  });
};

export const useHasMultiplePersonas = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["has-multiple-personas", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("has_multiple_personas, subscription_tier")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      return {
        hasMultiple: data.has_multiple_personas,
        subscriptionTier: data.subscription_tier as "free" | "pro" | "elite",
        canAccessAll: data.subscription_tier !== "free",
      };
    },
    enabled: !!user,
  });
};
