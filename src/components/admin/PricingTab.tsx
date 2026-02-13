import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const PricingTab = () => {
  const queryClient = useQueryClient();
  const [basePrice, setBasePrice] = useState("");
  const [gstPercent, setGstPercent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", "pricing").single();
      if (error) throw error;
      return data.value as { base_price: number; gst_percent: number; currency: string };
    },
  });

  useEffect(() => {
    if (data) {
      setBasePrice(String(data.base_price));
      setGstPercent(String(data.gst_percent));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update({
        value: { base_price: Number(basePrice), gst_percent: Number(gstPercent), currency: data?.currency ?? "INR" },
        updated_at: new Date().toISOString(),
      }).eq("key", "pricing");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success("Pricing updated!");
    },
    onError: (e) => toast.error(e.message),
  });

  const base = Number(basePrice) || 0;
  const gst = Number(gstPercent) || 0;
  const gstAmount = base * (gst / 100);
  const total = base + gstAmount;

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>Pricing & GST</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Base Price (₹)</Label>
          <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>GST Percent (%)</Label>
          <Input type="number" value={gstPercent} onChange={(e) => setGstPercent(e.target.value)} />
        </div>
        <div className="rounded-md bg-muted p-4 text-sm space-y-1">
          <p>Base: ₹{base.toLocaleString("en-IN")}</p>
          <p>GST ({gst}%): ₹{gstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
          <p className="font-semibold text-foreground">Total: ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving..." : "Save Pricing"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingTab;
