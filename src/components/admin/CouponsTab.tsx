import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";

const ALL_PLANS = [
  { key: "launch", label: "Launch" },
  { key: "growth", label: "Growth" },
  { key: "authority", label: "Authority" },
];

const CouponsTab = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
    valid_until: "",
    applicable_plans: [] as string[],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const insertData: Record<string, unknown> = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_until: form.valid_until || null,
      };
      // Only set applicable_plans if user selected specific plans
      if (form.applicable_plans.length > 0) {
        insertData.applicable_plans = form.applicable_plans;
      }
      const { error } = await supabase.from("coupons").insert(insertData as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon created!");
      setOpen(false);
      setForm({ code: "", discount_type: "percentage", discount_value: "", max_uses: "", valid_until: "", applicable_plans: [] });
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("coupons").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  const togglePlan = (planKey: string) => {
    setForm((prev) => ({
      ...prev,
      applicable_plans: prev.applicable_plans.includes(planKey)
        ? prev.applicable_plans.filter((p) => p !== planKey)
        : [...prev.applicable_plans, planKey],
    }));
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Coupon</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SAVE20" /></div>
              <div>
                <Label>Discount Type</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Value</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></div>
              <div><Label>Max Uses (empty = unlimited)</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
              <div><Label>Valid Until (empty = no expiry)</Label><Input type="datetime-local" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
              <div>
                <Label>Applicable Plans (none = all plans)</Label>
                <div className="flex gap-4 mt-2">
                  {ALL_PLANS.map((plan) => (
                    <label key={plan.key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={form.applicable_plans.includes(plan.key)}
                        onCheckedChange={() => togglePlan(plan.key)}
                      />
                      <span className="text-sm">{plan.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => create.mutate()} disabled={create.isPending || !form.code || !form.discount_value}>
                {create.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Plans</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((c) => {
              const plans = (c as any).applicable_plans as string[] | null;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                  <TableCell>
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${Number(c.discount_value).toLocaleString("en-IN")}`}
                  </TableCell>
                  <TableCell>
                    {plans && plans.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {plans.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs capitalize">{p}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">All plans</span>
                    )}
                  </TableCell>
                  <TableCell>{c.times_used} / {c.max_uses ?? "∞"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.valid_until ? format(new Date(c.valid_until), "dd MMM yyyy") : "No expiry"}
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: c.id, is_active: v })} />
                  </TableCell>
                </TableRow>
              );
            })}
            {!data?.length && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No coupons yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CouponsTab;
