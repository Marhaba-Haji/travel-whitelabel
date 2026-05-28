import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WebinarLearningPoint { icon: string; title: string; desc: string }
export interface WebinarAgendaItem { time: string; title: string; desc: string }
export interface WebinarBonus { title: string; desc: string; value?: string }
export interface WebinarFaq { q: string; a: string }

export interface WebinarSettings {
  id: string;
  is_published: boolean;
  title: string;
  subtitle: string;
  eyebrow: string;
  host_name: string;
  host_title: string;
  host_photo_url: string | null;
  host_bio_markdown: string;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  price_inr: number;
  currency: string;
  is_free: boolean;
  seats_total: number;
  seats_reserved_buffer: number;
  who_for_beginner: string[];
  who_for_scaler: string[];
  learning_points: WebinarLearningPoint[];
  agenda: WebinarAgendaItem[];
  bonuses: WebinarBonus[];
  faqs: WebinarFaq[];
  join_url: string | null;
  whatsapp_group_url: string | null;
}

export const useWebinarSettings = () => {
  return useQuery({
    queryKey: ["webinar_settings"],
    queryFn: async (): Promise<WebinarSettings | null> => {
      const { data, error } = await supabase
        .from("webinar_settings" as any)
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as WebinarSettings | null;
    },
    staleTime: 60_000,
  });
};