import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Download } from "lucide-react";

const fetchSettings = async () => {
  const { data, error } = await supabase.from("webinar_settings" as any).select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data as any;
};

const fetchRegistrations = async () => {
  const { data, error } = await supabase.from("webinar_registrations" as any).select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return data as any[];
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const JsonField = ({ label, value, onChange, rows = 8 }: { label: string; value: any; onChange: (v: any) => void; rows?: number }) => {
  const [text, setText] = useState(() => JSON.stringify(value ?? [], null, 2));
  useEffect(() => { setText(JSON.stringify(value ?? [], null, 2)); }, [value]);
  return (
    <Field label={label}>
      <Textarea rows={rows} value={text} onChange={(e) => setText(e.target.value)}
        onBlur={() => { try { onChange(JSON.parse(text)); } catch { toast({ title: "Invalid JSON", variant: "destructive" }); } }}
        className="font-mono text-xs" />
    </Field>
  );
};

const SettingsForm = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin_webinar_settings"], queryFn: fetchSettings });
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);
  if (isLoading || !form) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { id, created_at, updated_at, ...payload } = form;
    const { error } = await supabase.from("webinar_settings" as any).update(payload).eq("id", id);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Saved" });
    qc.invalidateQueries({ queryKey: ["admin_webinar_settings"] });
    qc.invalidateQueries({ queryKey: ["webinar_settings"] });
  };

  const dt = form.scheduled_at ? new Date(form.scheduled_at).toISOString().slice(0, 16) : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
        <div className="flex items-center gap-3">
          <Switch checked={form.is_published} onCheckedChange={(v) => update("is_published", v)} />
          <span className="text-sm">{form.is_published ? "Published" : "Hidden"}</span>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Title"><Input value={form.title} onChange={(e) => update("title", e.target.value)} /></Field>
        <Field label="Eyebrow"><Input value={form.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} /></Field>
      </div>
      <Field label="Subtitle"><Textarea rows={2} value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} /></Field>

      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Scheduled at (local)"><Input type="datetime-local" value={dt} onChange={(e) => update("scheduled_at", new Date(e.target.value).toISOString())} /></Field>
        <Field label="Duration (min)"><Input type="number" value={form.duration_minutes} onChange={(e) => update("duration_minutes", Number(e.target.value))} /></Field>
        <Field label="Timezone"><Input value={form.timezone} onChange={(e) => update("timezone", e.target.value)} /></Field>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Field label="Price (INR)"><Input type="number" value={form.price_inr} onChange={(e) => update("price_inr", Number(e.target.value))} /></Field>
        <Field label="Currency"><Input value={form.currency} onChange={(e) => update("currency", e.target.value)} /></Field>
        <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_free} onCheckedChange={(v) => update("is_free", v)} /><span className="text-sm">Free webinar</span></div>
        <Field label="Seats total"><Input type="number" value={form.seats_total} onChange={(e) => update("seats_total", Number(e.target.value))} /></Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Host name"><Input value={form.host_name} onChange={(e) => update("host_name", e.target.value)} /></Field>
        <Field label="Host title"><Input value={form.host_title} onChange={(e) => update("host_title", e.target.value)} /></Field>
      </div>
      <Field label="Host photo URL"><Input value={form.host_photo_url || ""} onChange={(e) => update("host_photo_url", e.target.value)} /></Field>
      <Field label="Host bio"><Textarea rows={6} value={form.host_bio_markdown} onChange={(e) => update("host_bio_markdown", e.target.value)} /></Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Join URL (sent in confirmation)"><Input value={form.join_url || ""} onChange={(e) => update("join_url", e.target.value)} /></Field>
        <Field label="WhatsApp group URL"><Input value={form.whatsapp_group_url || ""} onChange={(e) => update("whatsapp_group_url", e.target.value)} /></Field>
      </div>

      <JsonField label="Who for — Beginner (string array)" value={form.who_for_beginner} onChange={(v) => update("who_for_beginner", v)} />
      <JsonField label="Who for — Scaler (string array)" value={form.who_for_scaler} onChange={(v) => update("who_for_scaler", v)} />
      <JsonField label="Learning points [{icon,title,desc}]" value={form.learning_points} onChange={(v) => update("learning_points", v)} rows={12} />
      <JsonField label="Agenda [{time,title,desc}]" value={form.agenda} onChange={(v) => update("agenda", v)} rows={10} />
      <JsonField label="Bonuses [{title,desc,value}]" value={form.bonuses} onChange={(v) => update("bonuses", v)} rows={8} />
      <JsonField label="FAQs [{q,a}]" value={form.faqs} onChange={(v) => update("faqs", v)} rows={10} />
    </div>
  );
};

const RegistrationsList = () => {
  const { data, isLoading } = useQuery({ queryKey: ["admin_webinar_registrations"], queryFn: fetchRegistrations });
  const [filter, setFilter] = useState<string>("all");

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  const rows = (data || []).filter((r) => filter === "all" || r.status === filter);

  const exportCsv = () => {
    const headers = ["created_at","full_name","email","phone_e164","status","amount_inr","txnid","utm"];
    const lines = [headers.join(",")];
    rows.forEach((r) => lines.push(headers.map((h) => JSON.stringify((r as any)[h] ?? "")).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `webinar-registrations-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {["all", "paid", "pending", "failed"].map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f} {f !== "all" && `(${(data || []).filter((r) => r.status === f).length})`}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> CSV</Button>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide">
            <tr><th className="text-left p-3">Date</th><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</td>
                <td className="p-3">{r.full_name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.phone_e164}</td>
                <td className="p-3">₹{Number(r.amount_inr).toFixed(0)}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "paid" ? "bg-green-100 text-green-700" : r.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{r.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No registrations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MasterclassTab = () => (
  <Tabs defaultValue="settings" className="space-y-4">
    <TabsList>
      <TabsTrigger value="settings">Settings</TabsTrigger>
      <TabsTrigger value="registrations">Registrations</TabsTrigger>
    </TabsList>
    <TabsContent value="settings"><SettingsForm /></TabsContent>
    <TabsContent value="registrations"><RegistrationsList /></TabsContent>
  </Tabs>
);

export default MasterclassTab;