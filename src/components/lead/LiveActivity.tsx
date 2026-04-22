import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface Activity {
  initial: string;
  city: string;
  plan: string;
  ago: string;
}

const ROTATION_MS = 7000;

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86_400) return `${Math.floor(sec / 3600)}h ago`;
  const days = Math.floor(sec / 86_400);
  return `${days}d ago`;
}

/**
 * Subtle social-proof pill anchored bottom-left.
 * Shows anonymized recent registrations rotating every few seconds.
 */
const LiveActivity = () => {
  const [items, setItems] = useState<Activity[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
        const { data } = await supabase
          .from("registrations")
          .select("full_name, city, plan_name, created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(15);
        if (!data || cancelled) return;
        const mapped = data
          .filter((r: any) => r.full_name)
          .map((r: any) => ({
            initial: (r.full_name || "?").split(" ").slice(0, 2).map((s: string) => s[0]).join("").toUpperCase(),
            city: r.city || "India",
            plan: r.plan_name || "Growth",
            ago: timeAgo(new Date(r.created_at)),
          }));
        if (mapped.length > 0) {
          setItems(mapped);
          setTimeout(() => setVisible(true), 4000);
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), ROTATION_MS);
    return () => clearInterval(t);
  }, [items]);

  if (!visible || items.length === 0) return null;
  const a = items[idx];

  return (
    <div
      className="pointer-events-auto fixed bottom-4 left-4 z-30 hidden max-w-xs animate-fade-in items-center gap-3 rounded-full border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur md:flex"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
        {a.initial}
      </div>
      <div className="text-xs leading-tight">
        <p className="font-medium">
          New partner from <span className="text-primary">{a.city}</span>
        </p>
        <p className="text-muted-foreground">
          Joined {a.plan} · {a.ago}
        </p>
      </div>
      <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </div>
  );
};

export default LiveActivity;