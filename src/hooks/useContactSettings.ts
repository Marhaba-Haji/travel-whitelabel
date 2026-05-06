import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CONTACT_QUERY_KEY = ["contact-settings"];

interface ContactData {
  whatsapp: string;
  phone: string;
  email: string;
  address?: string;
}

const defaultContact: ContactData = {
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
};

export const useContactSettings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: CONTACT_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "contact")
        .maybeSingle();
      if (error) throw error;
      const merged = { ...defaultContact, ...(data?.value as Partial<ContactData>) };
      return merged as ContactData;
    },
  });

  const whatsapp = data?.whatsapp ?? defaultContact.whatsapp;
  const phone = data?.phone ?? defaultContact.phone;
  const email = data?.email ?? defaultContact.email;
  const address = data?.address ?? defaultContact.address;

  const whatsappNumber = whatsapp.replace(/\D/g, "");

  return {
    whatsapp,
    phone,
    email,
    address,
    whatsappUrl: `https://wa.me/${whatsappNumber}`,
    whatsappUrlWithMessage: (message: string) =>
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    isLoading,
    error,
  };
};
