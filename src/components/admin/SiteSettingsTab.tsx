import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT_QUERY_KEY } from "@/hooks/useContactSettings";
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

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", "contact").single();
      if (error) throw error;
      return data.value as { whatsapp: string; phone: string; email: string; address?: string };
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

  const save = useMutation({
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

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
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
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@marhabadmc.com" />
        </div>
        <div className="space-y-2">
          <Label>Address (optional)</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, PIN" />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsTab;
