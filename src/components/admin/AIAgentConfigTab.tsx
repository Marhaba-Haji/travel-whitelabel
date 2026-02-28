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
import { Bot, BookOpen, Brain, MessageSquare, Plus, Trash2 } from "lucide-react";

function migrateConfig(raw: any): NyraConfig {
  const toArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val.trim()) return [val];
    return [];
  };
  return {
    knowledge_base: toArray(raw?.knowledge_base),
    behavior_instructions: toArray(raw?.behavior_instructions),
    communication_enabled: {
      email: raw?.communication_enabled?.email ?? false,
      whatsapp: raw?.communication_enabled?.whatsapp ?? false,
      sms: raw?.communication_enabled?.sms ?? false,
    },
    additional_notes: toArray(raw?.additional_notes),
  };
}

const DEFAULT: NyraConfig = {
  knowledge_base: [],
  behavior_instructions: [],
  communication_enabled: { email: false, whatsapp: false, sms: false },
  additional_notes: [],
};

interface InstructionLogProps {
  entries: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
  rows?: number;
}

const InstructionLog = ({ entries, inputValue, onInputChange, onAdd, onRemove, placeholder, rows = 4 }: InstructionLogProps) => (
  <div className="space-y-3">
    {entries.length > 0 && (
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3">
            <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">{i + 1}.</span>
            <p className="text-sm text-foreground flex-1 whitespace-pre-wrap">{entry}</p>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-destructive hover:text-destructive" onClick={() => onRemove(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    )}
    <div className="flex gap-2">
      <Textarea
        rows={rows}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
    <Button variant="outline" size="sm" onClick={onAdd} disabled={!inputValue.trim()}>
      <Plus className="h-4 w-4 mr-1" /> Add Instruction
    </Button>
  </div>
);

const AIAgentConfigTab = () => {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<NyraConfig>(DEFAULT);
  const [knowledgeInput, setKnowledgeInput] = useState("");
  const [behaviorInput, setBehaviorInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-nyra-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "nyra_config")
        .maybeSingle();
      if (error) throw error;
      return data ? migrateConfig(data.value) : DEFAULT;
    },
  });

  useEffect(() => {
    if (data) setConfig(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async (newConfig: NyraConfig) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { key: "nyra_config", value: newConfig as any, updated_at: new Date().toISOString() },
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

  const addEntry = (field: keyof Pick<NyraConfig, "knowledge_base" | "behavior_instructions" | "additional_notes">, value: string, clearFn: (v: string) => void) => {
    if (!value.trim()) return;
    const updated = { ...config, [field]: [...config[field], value.trim()] };
    setConfig(updated);
    clearFn("");
    save.mutate(updated);
  };

  const removeEntry = (field: keyof Pick<NyraConfig, "knowledge_base" | "behavior_instructions" | "additional_notes">, index: number) => {
    const updated = { ...config, [field]: config[field].filter((_, i) => i !== index) };
    setConfig(updated);
    save.mutate(updated);
  };

  const updateComms = (key: "email" | "whatsapp" | "sms", val: boolean) => {
    const updated = { ...config, communication_enabled: { ...config.communication_enabled, [key]: val } };
    setConfig(updated);
    save.mutate(updated);
  };

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
          <CardDescription>Visa prices, package details, document requirements, destination info, seasonal offers, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <InstructionLog
            entries={config.knowledge_base}
            inputValue={knowledgeInput}
            onInputChange={setKnowledgeInput}
            onAdd={() => addEntry("knowledge_base", knowledgeInput, setKnowledgeInput)}
            onRemove={(i) => removeEntry("knowledge_base", i)}
            placeholder="e.g. Dubai tourist visa Rs. 6,500..."
            rows={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Behavior Instructions</CardTitle>
          </div>
          <CardDescription>How to handle pauses, interruptions, frustration, aggression, call flow, tone adjustments.</CardDescription>
        </CardHeader>
        <CardContent>
          <InstructionLog
            entries={config.behavior_instructions}
            inputValue={behaviorInput}
            onInputChange={setBehaviorInput}
            onAdd={() => addEntry("behavior_instructions", behaviorInput, setBehaviorInput)}
            onRemove={(i) => removeEntry("behavior_instructions", i)}
            placeholder="e.g. When the caller sounds frustrated, acknowledge their concern first..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Communication Tools</CardTitle>
          </div>
          <CardDescription>Enable/disable communication channels Nyra can use during calls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>WhatsApp</Label>
            <Switch checked={config.communication_enabled.whatsapp} onCheckedChange={(v) => updateComms("whatsapp", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Email</Label>
              <p className="text-xs text-muted-foreground">Send emails to callers via Resend</p>
            </div>
            <Switch checked={config.communication_enabled.email} onCheckedChange={(v) => updateComms("email", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS</Label>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Switch checked={config.communication_enabled.sms} onCheckedChange={(v) => updateComms("sms", v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Notes</CardTitle>
          <CardDescription>Any other context or overrides for the agent.</CardDescription>
        </CardHeader>
        <CardContent>
          <InstructionLog
            entries={config.additional_notes}
            inputValue={notesInput}
            onInputChange={setNotesInput}
            onAdd={() => addEntry("additional_notes", notesInput, setNotesInput)}
            onRemove={(i) => removeEntry("additional_notes", i)}
            placeholder="Any extra instructions or context..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentConfigTab;
