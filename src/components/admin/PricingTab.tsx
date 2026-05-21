import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PLANS_QUERY_KEY } from "@/hooks/usePlans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface PlanPricingData {
  launch: number;
  growth: number;
  authority: number;
  launch_monthly: number;
  growth_monthly: number;
  authority_monthly: number;
  gst_percent: number;
  currency: string;
}

const DEFAULTS: PlanPricingData = {
  launch: 19999,
  growth: 29999,
  authority: 39999,
  launch_monthly: 2999,
  growth_monthly: 3999,
  authority_monthly: 4999,
  gst_percent: 18,
  currency: "INR",
};

const PricingTab = () => {
  const queryClient = useQueryClient();

  const [launch, setLaunch] = useState("");
  const [growth, setGrowth] = useState("");
  const [authority, setAuthority] = useState("");
  const [gstPercent, setGstPercent] = useState("");
  const [launchM, setLaunchM] = useState("");
  const [growthM, setGrowthM] = useState("");
  const [authorityM, setAuthorityM] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-plans-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "plans_pricing")
        .single();
      if (error) throw error;
      return { ...DEFAULTS, ...(data?.value as Partial<PlanPricingData>) } as PlanPricingData;
    },
  });

  useEffect(() => {
    if (data) {
      setLaunch(String(data.launch));
      setGrowth(String(data.growth));
      setAuthority(String(data.authority));
      setGstPercent(String(data.gst_percent));
      setLaunchM(String(data.launch_monthly));
      setGrowthM(String(data.growth_monthly));
      setAuthorityM(String(data.authority_monthly));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: PlanPricingData = {
        launch: Number(launch),
        growth: Number(growth),
        authority: Number(authority),
        launch_monthly: Number(launchM),
        growth_monthly: Number(growthM),
        authority_monthly: Number(authorityM),
        gst_percent: Number(gstPercent),
        currency: data?.currency ?? "INR",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from("site_settings")
        .update({ value: payload as any, updated_at: new Date().toISOString() })
        .eq("key", "plans_pricing");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans-pricing"] });
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      toast.success("Plan pricing updated — changes are live on the site.");
    },
    onError: (e) => toast.error(e.message),
  });

  const gst = Number(gstPercent) || 0;

  const planPreview = [
    {
      label: "Launch Plan",
      annual: Number(launch) || 0,
      monthly: Number(launchM) || 0,
    },
    {
      label: "Growth Plan",
      annual: Number(growth) || 0,
      monthly: Number(growthM) || 0,
    },
    {
      label: "Authority Plan",
      annual: Number(authority) || 0,
      monthly: Number(authorityM) || 0,
    },
  ];

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Plan Prices */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan Pricing</CardTitle>
          <CardDescription>
            Set the base price for each plan across both billing cycles. GST is applied on top of the base price and shown
            to users on checkout. Changes are reflected immediately on the home page pricing section and signup page.
            Note: monthly plans are currently billed as single PayU charges (recurring auto-renewal is a separate setup).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* GST row */}
          <div className="space-y-2">
            <Label>GST (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
              className="max-w-[160px]"
            />
            <p className="text-xs text-muted-foreground">Applied uniformly to all plans</p>
          </div>

          <Separator />

          {/* Annual prices */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Annual base price (₹/year)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Launch", value: launch, setter: setLaunch },
                { label: "Growth", value: growth, setter: setGrowth },
                { label: "Authority", value: authority, setter: setAuthority },
              ].map(({ label, value, setter }) => (
                <div key={label} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Monthly prices */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly base price (₹/month)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Launch", value: launchM, setter: setLaunchM },
                { label: "Growth", value: growthM, setter: setGrowthM },
                { label: "Authority", value: authorityM, setter: setAuthorityM },
              ].map(({ label, value, setter }) => (
                <div key={label} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => save.mutate()} disabled={save.isPending} className="mt-2">
            {save.isPending ? "Saving..." : "Save Pricing"}
          </Button>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Price Preview</CardTitle>
          <CardDescription>What users see on the site (base + GST) for each billing cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {planPreview.map(({ label, annual, monthly }) => (
              <div key={label} className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                <div className="pt-1">
                  <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">Monthly</p>
                  <p className="text-sm text-muted-foreground">Base: ₹{monthly.toLocaleString("en-IN")}</p>
                  <p className="text-sm font-semibold text-foreground">
                    Total: ₹{Math.round(monthly * (1 + gst / 100)).toLocaleString("en-IN")}/mo
                  </p>
                </div>
                <div className="pt-2 border-t border-border/60">
                  <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">Annual</p>
                  <p className="text-sm text-muted-foreground">Base: ₹{annual.toLocaleString("en-IN")}</p>
                  <p className="text-sm font-semibold text-foreground">
                    Total: ₹{Math.round(annual * (1 + gst / 100)).toLocaleString("en-IN")}/yr
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingTab;
