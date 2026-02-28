import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NYRA_CONFIG_QUERY_KEY, type NyraConfig } from "@/hooks/useNyraConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bot, BookOpen, Brain, MessageSquare, Trash2, Paperclip, Send, FileText, Loader2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

interface InstructionChatProps {
  entries: string[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  config: NyraConfig;
  field: keyof Pick<NyraConfig, "knowledge_base" | "behavior_instructions" | "additional_notes">;
  onSave: (updated: NyraConfig) => void;
}

const InstructionChat = ({ entries, onAdd, onRemove, placeholder, config, field, onSave }: InstructionChatProps) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  const handleSend = async () => {
    if (processing) return;

    if (file) {
      setProcessing(true);
      try {
        const base64 = await fileToBase64(file);
        const { data, error } = await supabase.functions.invoke("process-agent-document", {
          body: { fileBase64: base64, mimeType: file.type, fileName: file.name },
        });
        if (error) throw error;
        if (data?.extractedText) {
          onAdd(data.extractedText);
        } else {
          toast.error("No content could be extracted from the file.");
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to process file");
      } finally {
        setProcessing(false);
        setFile(null);
      }
      return;
    }

    if (input.trim()) {
      onAdd(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error("Unsupported file type. Use images, PDF, Word, or Excel.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File too large. Maximum 20MB.");
      return;
    }
    setFile(f);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col">
      {entries.length > 0 && (
        <ScrollArea className="max-h-64 mb-3">
          <div className="space-y-2 pr-2">
            {entries.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 group">
                <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-sm text-foreground flex-1 whitespace-pre-wrap break-words">{entry}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(i)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* File chip */}
      {file && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
            <FileText className="h-3 w-3" />
            <span className="max-w-[200px] truncate">{file.name}</span>
            <button onClick={() => setFile(null)} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {processing && (
        <div className="flex items-center gap-2 mb-2 px-1 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Extracting content from {file?.name}...
        </div>
      )}

      {/* Chat-style input bar */}
      <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-2">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => fileRef.current?.click()}
          disabled={processing}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => { setInput(e.target.value); autoGrow(); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={processing}
          className="flex-1 resize-none bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground min-h-[32px] max-h-[160px] py-1"
        />
        <Button
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleSend}
          disabled={(!input.trim() && !file) || processing}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const AIAgentConfigTab = () => {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<NyraConfig>(DEFAULT);
  const [initialLoaded, setInitialLoaded] = useState(false);

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
    if (data && !initialLoaded) {
      setConfig(data);
      setInitialLoaded(true);
    }
  }, [data, initialLoaded]);

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

  const addEntry = (field: keyof Pick<NyraConfig, "knowledge_base" | "behavior_instructions" | "additional_notes">, value: string) => {
    if (!value.trim()) return;
    const updated = { ...config, [field]: [...config[field], value.trim()] };
    setConfig(updated);
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
            Customize Nyra's knowledge, behavior, and communication tools. Type instructions or upload files (images, PDFs, Excel, Word).
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
          <InstructionChat
            entries={config.knowledge_base}
            onAdd={(text) => addEntry("knowledge_base", text)}
            onRemove={(i) => removeEntry("knowledge_base", i)}
            placeholder="Type an instruction or upload a file..."
            config={config}
            field="knowledge_base"
            onSave={(u) => { setConfig(u); save.mutate(u); }}
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
          <InstructionChat
            entries={config.behavior_instructions}
            onAdd={(text) => addEntry("behavior_instructions", text)}
            onRemove={(i) => removeEntry("behavior_instructions", i)}
            placeholder="Type a behavior instruction or upload a file..."
            config={config}
            field="behavior_instructions"
            onSave={(u) => { setConfig(u); save.mutate(u); }}
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
          <InstructionChat
            entries={config.additional_notes}
            onAdd={(text) => addEntry("additional_notes", text)}
            onRemove={(i) => removeEntry("additional_notes", i)}
            placeholder="Type a note or upload a file..."
            config={config}
            field="additional_notes"
            onSave={(u) => { setConfig(u); save.mutate(u); }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentConfigTab;
