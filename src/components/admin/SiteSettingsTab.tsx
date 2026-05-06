import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT_QUERY_KEY } from "@/hooks/useContactSettings";
import { SOCIAL_QUERY_KEY } from "@/hooks/useSocialSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const SiteSettingsTab = () => {
  const queryClient = useQueryClient();
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [x, setX] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", "contact").single();
      if (error) throw error;
      return data.value as { whatsapp: string; phone: string; email: string; address?: string };
    },
  });

  const { data: socialData, isLoading: socialLoading } = useQuery({
    queryKey: ["admin-social-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", "social").single();
      if (error) throw error;
      return data?.value as { facebook?: string; instagram?: string; linkedin?: string; x?: string } | null;
    },
  });

  useEffect(() => {
    if (data) {
      setWhatsapp(data.whatsapp || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setAddress(data.address || "");
    }
  }, [data]);

  useEffect(() => {
    if (socialData) {
      setFacebook(socialData.facebook || "");
      setInstagram(socialData.instagram || "");
      setLinkedin(socialData.linkedin || "");
      setX(socialData.x || "");
    }
  }, [socialData]);

  const saveContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update({
        value: { whatsapp, phone, email, address },
        updated_at: new Date().toISOString(),
      }).eq("key", "contact");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-settings"] });
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEY });
      toast.success("Contact details updated!");
    },
    onError: (e) => toast.error(e.message),
  });

  const saveSocial = useMutation({
    mutationFn: async () => {
      const value = { facebook, instagram, linkedin, x };
      const { error } = await supabase.from("site_settings").upsert(
        {
          key: "social",
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-social-settings"] });
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEY });
      toast.success("Social links updated!");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading || socialLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <Card className="max-w-lg">
        <CardHeader><CardTitle>Site Contact Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+919008447887" />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919008447887" />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={data?.email || "Email address"} />
          </div>
          <div className="space-y-2">
            <Label>Address (optional)</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, PIN" />
          </div>
          <Button onClick={() => saveContact.mutate()} disabled={saveContact.isPending}>
            {saveContact.isPending ? "Saving..." : "Save Contact Details"}
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Add full URLs to display social icons in the footer. Leave blank to hide.</p>
          <div className="space-y-2">
            <Label>Facebook</Label>
            <Input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/yourpage"
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/company/yourpage"
            />
          </div>
          <div className="space-y-2">
            <Label>X (Twitter)</Label>
            <Input
              value={x}
              onChange={(e) => setX(e.target.value)}
              placeholder="https://x.com/yourhandle"
            />
          </div>
          <Button onClick={() => saveSocial.mutate()} disabled={saveSocial.isPending}>
            {saveSocial.isPending ? "Saving..." : "Save Social Links"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsTab;
