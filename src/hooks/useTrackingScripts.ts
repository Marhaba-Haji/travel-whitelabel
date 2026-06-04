import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrackingScript {
  id: string;
  name: string;
  provider: string;
  placement: "head" | "body_start" | "body_end";
  code: string;
  is_enabled: boolean;
  load_strategy: "all_pages" | "exclude_admin";
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const TRACKING_SCRIPTS_QUERY_KEY = ["tracking-scripts-public"] as const;

export const useTrackingScripts = () => {
  return useQuery({
    queryKey: TRACKING_SCRIPTS_QUERY_KEY,
    queryFn: async (): Promise<TrackingScript[]> => {
      const { data, error } = await supabase
        .from("tracking_scripts" as any)
        .select("*")
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as unknown as TrackingScript[]) ?? [];
    },
    staleTime: 5 * 60_000,
  });
};

export const useAdminTrackingScripts = () => {
  return useQuery({
    queryKey: ["tracking-scripts-admin"],
    queryFn: async (): Promise<TrackingScript[]> => {
      const { data, error } = await supabase
        .from("tracking_scripts" as any)
        .select("*")
        .order("placement", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as unknown as TrackingScript[]) ?? [];
    },
  });
};