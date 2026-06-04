import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminTrackingScripts, TRACKING_SCRIPTS_QUERY_KEY, type TrackingScript } from "@/hooks/useTrackingScripts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Pencil, Trash2, AlertTriangle, Code2 } from "lucide-react";
import { toast } from "sonner";

type FormState = {
  name: string;
  provider: string;
  placement: "head" | "body_start" | "body_end";
  load_strategy: "all_pages" | "exclude_admin";
  code: string;
  notes: string;
  is_enabled: boolean;
  sort_order: number;
};

const blankForm: FormState = {
  name: "",
  provider: "google",
  placement: "head",
  load_strategy: "exclude_admin",
  code: "",
  notes: "",
  is_enabled: true,
  sort_order: 0,
};

const providerOptions = [
  { value: "google", label: "Google (Analytics / GTM / Ads)" },
  { value: "facebook", label: "Facebook / Meta Pixel" },
  { value: "linkedin", label: "LinkedIn Insight" },
  { value: "hotjar", label: "Hotjar" },
  { value: "microsoft", label: "Microsoft Clarity / Bing UET" },
  { value: "tiktok", label: "TikTok Pixel" },
  { value: "custom", label: "Custom / Other" },
];

const placementLabel: Record<string, string> = {
  head: "Head",
  body_start: "Body (start)",
  body_end: "Body (end)",
};

const ScriptsTab = () => {
  const qc = useQueryClient();
  const { data: scripts = [], isLoading, refetch } = useAdminTrackingScripts();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["tracking-scripts-admin"] });
    qc.invalidateQueries({ queryKey: TRACKING_SCRIPTS_QUERY_KEY });
  };

  const openNew = () => {
    setEditingId(null);
    setForm(blankForm);
    setOpen(true);
  };

  const openEdit = (s: TrackingScript) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      provider: s.provider,
      placement: s.placement,
      load_strategy: s.load_strategy,
      code: s.code,
      notes: s.notes ?? "",
      is_enabled: s.is_enabled,
      sort_order: s.sort_order,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      provider: form.provider,
      placement: form.placement,
      load_strategy: form.load_strategy,
      code: form.code,
      notes: form.notes.trim() || null,
      is_enabled: form.is_enabled,
      sort_order: form.sort_order,
    };
    const { error } = editingId
      ? await supabase.from("tracking_scripts" as any).update(payload).eq("id", editingId)
      : await supabase.from("tracking_scripts" as any).insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Script updated" : "Script added");
    setOpen(false);
    invalidate();
    refetch();
  };

  const toggleEnabled = async (s: TrackingScript) => {
    const { error } = await supabase
      .from("tracking_scripts" as any)
      .update({ is_enabled: !s.is_enabled })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    invalidate();
    refetch();
  };

  const remove = async (s: TrackingScript) => {
    if (!confirm(`Delete "${s.name}"? This will remove it from the live site.`)) return;
    const { error } = await supabase.from("tracking_scripts" as any).delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Script deleted");
    invalidate();
    refetch();
  };

  const grouped = {
    head: scripts.filter((s) => s.placement === "head"),
    body_start: scripts.filter((s) => s.placement === "body_start"),
    body_end: scripts.filter((s) => s.placement === "body_end"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="h-6 w-6" /> Scripts & Tracking
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Inject third-party scripts, pixels, and tags (GA4, GTM, Meta Pixel, LinkedIn, Hotjar, custom HTML) into the site head or body.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Script
        </Button>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security warning</AlertTitle>
        <AlertDescription>
          Code added here runs on every page of the live site. Only paste snippets you fully trust (from official provider dashboards). Malicious code can steal visitor data.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        (["head", "body_start", "body_end"] as const).map((group) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle className="text-base">{placementLabel[group]} — {grouped[group].length} script(s)</CardTitle>
            </CardHeader>
            <CardContent>
              {grouped[group].length === 0 ? (
                <p className="text-sm text-muted-foreground">No scripts in this placement.</p>
              ) : (
                <div className="space-y-3">
                  {grouped[group].map((s) => (
                    <div key={s.id} className="flex items-start justify-between gap-4 border rounded-md p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{s.name}</span>
                          <Badge variant="outline">{s.provider}</Badge>
                          {s.load_strategy === "exclude_admin" && (
                            <Badge variant="secondary">excludes /admin</Badge>
                          )}
                          {!s.is_enabled && <Badge variant="destructive">disabled</Badge>}
                        </div>
                        {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
                        <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto max-h-24">
                          {s.code.length > 240 ? s.code.slice(0, 240) + "…" : s.code}
                        </pre>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch checked={s.is_enabled} onCheckedChange={() => toggleEnabled(s)} />
                        <Button size="icon" variant="outline" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => remove(s)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit script" : "Add script"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Google Analytics 4" />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={form.provider} onValueChange={(v) => setForm({ ...form, provider: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {providerOptions.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Placement</Label>
                <Select value={form.placement} onValueChange={(v: any) => setForm({ ...form, placement: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head">Head</SelectItem>
                    <SelectItem value="body_start">Body (start)</SelectItem>
                    <SelectItem value="body_end">Body (end)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Load on</Label>
                <Select value={form.load_strategy} onValueChange={(v: any) => setForm({ ...form, load_strategy: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclude_admin">All pages except /admin</SelectItem>
                    <SelectItem value="all_pages">All pages (including /admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.is_enabled} onCheckedChange={(v) => setForm({ ...form, is_enabled: v })} />
                <Label className="!mt-0">Enabled</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Code snippet</Label>
              <Textarea
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                rows={10}
                className="font-mono text-xs"
                placeholder={`<!-- Paste the full snippet, including <script> tags. -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXX');</script>`}
              />
              <p className="text-xs text-muted-foreground">
                Paste the complete snippet provided by your tool. Include the surrounding &lt;script&gt; or &lt;noscript&gt; tags.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Notes (internal)</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes for your team" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : editingId ? "Update" : "Add script"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScriptsTab;