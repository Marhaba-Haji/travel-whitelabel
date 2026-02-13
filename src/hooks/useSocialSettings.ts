import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SOCIAL_QUERY_KEY = ["social-settings"];

interface SocialData {
  facebook: string;
  instagram: string;
  linkedin: string;
  x: string;
}

const defaultSocial: SocialData = {
  facebook: "",
  instagram: "",
  linkedin: "",
  x: "",
};

export const useSocialSettings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: SOCIAL_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "social")
        .single();
      if (error) throw error;
      const merged = { ...defaultSocial, ...(data?.value as Partial<SocialData>) };
      return merged as SocialData;
    },
  });

  return {
    facebook: data?.facebook ?? defaultSocial.facebook,
    instagram: data?.instagram ?? defaultSocial.instagram,
    linkedin: data?.linkedin ?? defaultSocial.linkedin,
    x: data?.x ?? defaultSocial.x,
    socialLinks: [
      { platform: "facebook" as const, url: data?.facebook ?? "", label: "Facebook" },
      { platform: "instagram" as const, url: data?.instagram ?? "", label: "Instagram" },
      { platform: "linkedin" as const, url: data?.linkedin ?? "", label: "LinkedIn" },
      { platform: "x" as const, url: data?.x ?? "", label: "X (Twitter)" },
    ].filter((s) => s.url?.trim()),
    isLoading,
    error,
  };
};
