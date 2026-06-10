import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, MessageCircle, ArrowRight, Copy, Check, Download, Loader2 } from "lucide-react";
import { useWebinarSettings } from "@/hooks/useWebinarSettings";
import SEOHead from "@/components/seo/SEOHead";
import { downloadInvoice } from "@/lib/invoice-pdf";
import { toast } from "sonner";
import "@/styles/masterclass.css";

function buildGoogleCalUrl(title: string, startIso: string, durationMin: number, details: string) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const u = new URL("https://calendar.google.com/calendar/render");
  u.searchParams.set("action", "TEMPLATE");
  u.searchParams.set("text", title);
  u.searchParams.set("dates", `${fmt(start)}/${fmt(end)}`);
  u.searchParams.set("details", details);
  return u.toString();
}

const MasterclassSuccess = () => {
  const [params] = useSearchParams();
  const regId = params.get("reg");
  const orderId = params.get("order");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { data: s } = useWebinarSettings();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Ensure order ID is always visible in the URL
    if (orderId && !window.location.search.includes("order=")) {
      const url = new URL(window.location.href);
      url.searchParams.set("order", orderId);
      window.history.replaceState({}, "", url);
    }
  }, [orderId]);

  const copyOrder = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      await downloadInvoice(orderId);
    } catch (e) {
      toast.error((e as Error).message || "Could not generate invoice");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mc-scope min-h-screen mc-bg-radial flex items-center justify-center px-4 py-12">
      <SEOHead
        title="You're In — Masterclass Confirmation"
        description="Your seat is confirmed."
        path="/masterclass/success"
        noIndex
      />
      <div className="mc-glass-strong w-full max-w-lg p-8 md:p-10 text-center relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-[var(--mc-secondary)]/20 blur-3xl pointer-events-none" />

        <div className="relative h-16 w-16 mx-auto rounded-full bg-[var(--mc-secondary)] flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(157,248,0,0.55)]">
          <CheckCircle2 className="h-9 w-9 text-[var(--mc-on-secondary)]" />
        </div>

        <h1 className="mc-h-md mt-6 text-[var(--mc-on-surface)]">You're in</h1>
        <p className="mt-3 text-[var(--mc-on-surface-variant)]">
          {s ? `Your seat for "${s.title}" is confirmed.` : "Your seat is confirmed."} A
          confirmation email and WhatsApp message are on the way.
        </p>

        {orderId && (
          <div className="mt-6 rounded-2xl bg-white/[0.04] border border-[rgba(213,189,240,0.18)] p-5 text-left">
            <div className="mc-label text-[var(--mc-on-surface-variant)]">Order ID</div>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <code className="font-mono text-sm font-bold text-[var(--mc-on-surface)] break-all">{orderId}</code>
              <button
                type="button"
                onClick={copyOrder}
                className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-[rgba(213,189,240,0.25)] hover:bg-white/[0.06] transition-colors text-[var(--mc-on-surface)]"
                aria-label="Copy order ID"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-[var(--mc-on-surface-variant)] mt-2">
              Save this Order ID for your records and any support requests.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--mc-secondary)] text-[var(--mc-on-secondary)] text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {downloading ? "Preparing invoice…" : "Download Invoice (PDF)"}
            </button>
          </div>
        )}

        {s && (
          <div className="mt-6 rounded-2xl bg-white/[0.04] border border-[rgba(213,189,240,0.18)] p-5 text-left">
            <div className="mc-label text-[var(--mc-on-surface-variant)]">When</div>
            <div className="font-bold text-[var(--mc-on-surface)] mt-1.5">
              {new Date(s.scheduled_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}{" "}
              IST
            </div>
            <div className="mc-label text-[var(--mc-on-surface-variant)] mt-4">Host</div>
            <div className="font-bold text-[var(--mc-on-surface)] mt-1.5">
              {s.host_name} · {s.host_title}
            </div>
          </div>
        )}

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          {s && (
            <a
              target="_blank"
              rel="noreferrer"
              href={buildGoogleCalUrl(s.title, s.scheduled_at, s.duration_minutes, s.subtitle)}
              className="mc-cta mc-cta-secondary h-12 text-sm"
            >
              <Calendar className="h-4 w-4" /> Add to Calendar
            </a>
          )}
          {s?.whatsapp_group_url && (
            <a
              href={s.whatsapp_group_url}
              target="_blank"
              rel="noreferrer"
              className="mc-cta mc-cta-primary h-12 text-sm"
            >
              <MessageCircle className="h-4 w-4" /> Join WhatsApp Group
            </a>
          )}
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--mc-primary)] mt-8 hover:underline"
        >
          Back to home <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        {regId && (
          <p className="text-[10px] text-[var(--mc-on-surface-variant)]/60 mt-6">
            Ref: {regId.slice(0, 8)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MasterclassSuccess;
