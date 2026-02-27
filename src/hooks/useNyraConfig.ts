import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NyraConfig {
  knowledge_base: string;
  behavior_instructions: string;
  communication_enabled: { email: boolean; whatsapp: boolean; sms: boolean };
  additional_notes: string;
}

const DEFAULT_CONFIG: NyraConfig = {
  knowledge_base: "",
  behavior_instructions: "",
  communication_enabled: { email: false, whatsapp: false, sms: false },
  additional_notes: "",
};

export const NYRA_CONFIG_QUERY_KEY = ["nyra-config"];

export function useNyraConfig() {
  return useQuery({
    queryKey: NYRA_CONFIG_QUERY_KEY,
    queryFn: async (): Promise<NyraConfig> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "nyra_config")
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...(data.value as any) };
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}
