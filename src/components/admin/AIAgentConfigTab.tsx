import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NYRA_CONFIG_QUERY_KEY, type NyraConfig } from "@/hooks/useNyraConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bot, BookOpen, Brain, MessageSquare, Save } from "lucide-react";

const DEFAULT: NyraConfig = {
  knowledge_base: "",
  behavior_instructions: "",
  communication_enabled: { email: false, whatsapp: false, sms: false },
  additional_notes: "",
};

const AIAgentConfigTab = () => {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<NyraConfig>(DEFAULT);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-nyra-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "nyra_config")
        .maybeSingle();
      if (error) throw error;
      return data ? { ...DEFAULT, ...(data.value as any) } : DEFAULT;
    },
  });

  useEffect(() => {
    if (data) setConfig(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { key: "nyra_config", value: config as any, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-nyra-config"] });
      queryClient.invalidateQueries({ queryKey: NYRA_CONFIG_QUERY_KEY });
      toast.success("AI Agent configuration saved!");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Bot className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Agent Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Customize Nyra's knowledge, behavior, and communication tools. Changes take effect on the next call.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Knowledge Base</CardTitle>
          </div>
          <CardDescription>
            Visa prices, package details, document requirements, destination info, seasonal offers, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={10}
            value={config.knowledge_base}
            onChange={(e) => setConfig({ ...config, knowledge_base: e.target.value })}
            placeholder="Visa prices: Dubai tourist visa Rs. 6,500...\nPackages: Family Dubai 5N/6D from Rs. 45,000...\nDocuments required: Passport, photo, bank statement..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Behavior Instructions</CardTitle>
          </div>
          <CardDescription>
            How to handle pauses, interruptions, frustration, aggression, call flow, tone adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={8}
            value={config.behavior_instructions}
            onChange={(e) => setConfig({ ...config, behavior_instructions: e.target.value })}
            placeholder="When the caller pauses for more than 5 seconds, gently check in...\nIf the caller sounds frustrated, acknowledge their concern first...\nAlways upsell insurance politely after booking flights..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Communication Tools</CardTitle>
          </div>
          <CardDescription>
            Enable/disable communication channels Nyra can use during calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>WhatsApp</Label>
            <Switch
              checked={config.communication_enabled.whatsapp}
              onCheckedChange={(v) =>
                setConfig({ ...config, communication_enabled: { ...config.communication_enabled, whatsapp: v } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Email</Label>
              <p className="text-xs text-muted-foreground">Send emails to callers via Resend</p>
            </div>
            <Switch
              checked={config.communication_enabled.email}
              onCheckedChange={(v) =>
                setConfig({ ...config, communication_enabled: { ...config.communication_enabled, email: v } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS</Label>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Switch
              checked={config.communication_enabled.sms}
              onCheckedChange={(v) =>
                setConfig({ ...config, communication_enabled: { ...config.communication_enabled, sms: v } })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Notes</CardTitle>
          <CardDescription>Any other context or overrides for the agent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={config.additional_notes}
            onChange={(e) => setConfig({ ...config, additional_notes: e.target.value })}
            placeholder="Any extra instructions or context..."
          />
        </CardContent>
      </Card>

      <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {save.isPending ? "Saving..." : "Save Configuration"}
      </Button>
    </div>
  );
};

export default AIAgentConfigTab;
