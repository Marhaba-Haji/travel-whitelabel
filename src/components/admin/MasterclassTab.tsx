import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Download, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

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

const StringArrayField = ({ label, description, value = [], onChange }: { label: string; description?: string; value: string[]; onChange: (v: string[]) => void }) => {
  return (
    <div className="space-y-3 border p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
      <div>
        <Label className="text-sm font-semibold">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <Textarea
              className="min-h-[40px] h-[40px] py-2"
              value={item}
              onChange={(e) => {
                const nv = [...value];
                nv[idx] = e.target.value;
                onChange(nv);
              }}
            />
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => onChange(value.filter((_, i) => i !== idx))}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => onChange([...value, ""])}>
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>
    </div>
  );
};

const ObjectArrayField = ({ label, description, value = [], onChange, fields }: { label: string; description?: string; value: any[]; onChange: (v: any[]) => void; fields: { key: string; label: string; type: "text" | "textarea" }[] }) => {
  const moveItem = (idx: number, dir: number) => {
    if (idx + dir < 0 || idx + dir >= value.length) return;
    const nv = [...value];
    const temp = nv[idx];
    nv[idx] = nv[idx + dir];
    nv[idx + dir] = temp;
    onChange(nv);
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
      <div>
        <Label className="text-sm font-semibold">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">
        {value.map((item, idx) => (
          <div key={idx} className="flex gap-3 bg-background p-4 border rounded-md relative group">
            <div className="flex flex-col gap-1 items-center justify-center shrink-0">
               <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(idx, -1)} disabled={idx === 0}><ChevronUp className="h-4 w-4" /></Button>
               <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(idx, 1)} disabled={idx === value.length - 1}><ChevronDown className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 grid gap-4">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea value={item[f.key] || ""} onChange={(e) => {
                      const nv = [...value];
                      nv[idx] = { ...nv[idx], [f.key]: e.target.value };
                      onChange(nv);
                    }} />
                  ) : (
                    <Input value={item[f.key] || ""} onChange={(e) => {
                      const nv = [...value];
                      nv[idx] = { ...nv[idx], [f.key]: e.target.value };
                      onChange(nv);
                    }} />
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="icon" className="shrink-0 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onChange(value.filter((_, i) => i !== idx))}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="w-full bg-background" onClick={() => onChange([...value, {}])}>
        <Plus className="h-4 w-4 mr-2" /> Add {label}
      </Button>
    </div>
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
    toast({ title: "Saved successfully" });
    qc.invalidateQueries({ queryKey: ["admin_webinar_settings"] });
    qc.invalidateQueries({ queryKey: ["webinar_settings"] });
  };

  // Format as IST for the datetime-local input
  let dt = "";
  if (form.scheduled_at) {
    const d = new Date(form.scheduled_at);
    const istDate = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    dt = istDate.toISOString().slice(0, 16);
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-20 py-4 border-b">
        <div className="flex items-center gap-3">
          <Switch checked={form.is_published} onCheckedChange={(v) => update("is_published", v)} />
          <span className="font-medium text-sm">{form.is_published ? "Published" : "Hidden"}</span>
        </div>
        <Button onClick={save} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>General Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Title"><Input value={form.title} onChange={(e) => update("title", e.target.value)} /></Field>
              <Field label="Eyebrow"><Input value={form.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} /></Field>
              <Field label="Subtitle"><Textarea rows={3} value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} /></Field>
            </CardContent>
          </Card>

          <Card>
             <CardHeader><CardTitle>Content & Agenda</CardTitle></CardHeader>
             <CardContent className="space-y-8">
               <ObjectArrayField
                 label="Learning Points"
                 value={form.learning_points}
                 onChange={(v) => update("learning_points", v)}
                 fields={[
                   { key: "title", label: "Title", type: "text" },
                   { key: "icon", label: "Icon name (Lucide)", type: "text" },
                   { key: "desc", label: "Description", type: "textarea" },
                 ]}
               />
               <ObjectArrayField
                 label="Agenda"
                 value={form.agenda}
                 onChange={(v) => update("agenda", v)}
                 fields={[
                   { key: "time", label: "Time/Duration", type: "text" },
                   { key: "title", label: "Title", type: "text" },
                   { key: "desc", label: "Description", type: "textarea" },
                 ]}
               />
               <ObjectArrayField
                 label="Bonuses"
                 value={form.bonuses}
                 onChange={(v) => update("bonuses", v)}
                 fields={[
                   { key: "title", label: "Title", type: "text" },
                   { key: "value", label: "Value (e.g. ₹1,999)", type: "text" },
                   { key: "desc", label: "Description", type: "textarea" },
                 ]}
               />
               <ObjectArrayField
                 label="FAQs"
                 value={form.faqs}
                 onChange={(v) => update("faqs", v)}
                 fields={[
                   { key: "q", label: "Question", type: "text" },
                   { key: "a", label: "Answer", type: "textarea" },
                 ]}
               />
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Scheduling & Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Scheduled at (IST)"><Input type="datetime-local" value={dt} onChange={(e) => update("scheduled_at", new Date(e.target.value + "+05:30").toISOString())} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Duration (min)"><Input type="number" value={form.duration_minutes} onChange={(e) => update("duration_minutes", Number(e.target.value))} /></Field>
                <Field label="Seats total"><Input type="number" value={form.seats_total} onChange={(e) => update("seats_total", Number(e.target.value))} /></Field>
              </div>
              <Field label="Timezone">
                <Select value={form.timezone || ""} onValueChange={(v) => update("timezone", v)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                    <SelectItem value="America/New_York">America/New York (EST/EDT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los Angeles (PST/PDT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              
              <div className="pt-4 border-t space-y-4 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Free webinar</span>
                  <Switch checked={form.is_free} onCheckedChange={(v) => update("is_free", v)} />
                </div>
                {!form.is_free && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Price (INR)"><Input type="number" value={form.price_inr} onChange={(e) => update("price_inr", Number(e.target.value))} /></Field>
                    <Field label="Currency"><Input value={form.currency} onChange={(e) => update("currency", e.target.value)} /></Field>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Host Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Host name"><Input value={form.host_name} onChange={(e) => update("host_name", e.target.value)} /></Field>
              <Field label="Host title"><Input value={form.host_title} onChange={(e) => update("host_title", e.target.value)} /></Field>
              <Field label="Host photo URL"><Input value={form.host_photo_url || ""} onChange={(e) => update("host_photo_url", e.target.value)} /></Field>
              <Field label="Host bio"><Textarea rows={4} value={form.host_bio_markdown} onChange={(e) => update("host_bio_markdown", e.target.value)} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Join URL"><Input value={form.join_url || ""} onChange={(e) => update("join_url", e.target.value)} /></Field>
              <Field label="WhatsApp group"><Input value={form.whatsapp_group_url || ""} onChange={(e) => update("whatsapp_group_url", e.target.value)} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Target Audience</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <StringArrayField label="Who for — Beginner" value={form.who_for_beginner} onChange={(v) => update("who_for_beginner", v)} />
              <StringArrayField label="Who for — Scaler" value={form.who_for_scaler} onChange={(v) => update("who_for_scaler", v)} />
            </CardContent>
          </Card>
        </div>
      </div>
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
      <div className="border rounded-lg overflow-x-auto bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide border-b">
            <tr><th className="text-left p-3">Date</th><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</td>
                <td className="p-3 font-medium">{r.full_name}</td>
                <td className="p-3 text-muted-foreground">{r.email}</td>
                <td className="p-3 text-muted-foreground">{r.phone_e164}</td>
                <td className="p-3">₹{Number(r.amount_inr).toFixed(0)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${r.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : r.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {r.status}
                  </span>
                </td>
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
  <Tabs defaultValue="settings" className="space-y-6">
    <TabsList>
      <TabsTrigger value="settings">Settings</TabsTrigger>
      <TabsTrigger value="registrations">Registrations</TabsTrigger>
    </TabsList>
    <TabsContent value="settings" className="m-0"><SettingsForm /></TabsContent>
    <TabsContent value="registrations" className="m-0"><RegistrationsList /></TabsContent>
  </Tabs>
);

export default MasterclassTab;