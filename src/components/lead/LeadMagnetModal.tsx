import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSessionId, getAttribution } from "@/hooks/useSessionTracking";
import { useContactSettings } from "@/hooks/useContactSettings";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  source?: string;
  title?: string;
  description?: string;
  benefitBullets?: string[];
}

const LeadMagnetModal = ({
  open,
  onOpenChange,
  source = "exit_intent",
  title = "Free: B2B Travel Business Starter Guide",
  description = "Get our 28-page playbook covering portal setup, supplier negotiation, and the first 90 days of running a profitable travel business.",
  benefitBullets = [
    "Step-by-step launch checklist",
    "Supplier negotiation scripts",
    "Pricing & margin templates",
    "First-90-days marketing plan",
  ],
}: Props) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const { email: supportEmail } = useContactSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const attr = getAttribution();
      // Subscribe to newsletter (attribution)
      await supabase.from("newsletter_subscriptions").insert([{
        email: email.trim().toLowerCase(),
        source,
        utm: (attr as any) || {},
      }]);
      // Track download record
      await supabase.from("lead_magnet_downloads").insert([{
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        source,
        utm: (attr as any) || {},
        session_id: getSessionId(),
      }]);
      setDone(true);
      toast({
        title: "Check your inbox",
        description: `Your guide is on its way. Add ${supportEmail} to your contacts.`,
      });
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: `Please try again or email ${supportEmail}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-display">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="font-medium">You're in. The guide is on its way.</p>
            <p className="text-sm text-muted-foreground">
              We'll also share occasional industry insights — no spam, unsubscribe anytime.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-2 text-sm">
              {benefitBullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <Input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>Send Me the Free Guide</>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                We respect your inbox. Unsubscribe with one click.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadMagnetModal;