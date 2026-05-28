import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import { useWebinarSettings } from "@/hooks/useWebinarSettings";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";

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
  const { data: s } = useWebinarSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ff] via-white to-[#fef0f8] flex items-center justify-center px-4 py-12">
      <SEOHead title="You're In — Masterclass Confirmation" description="Your seat is confirmed." path="/masterclass/success" noIndex />
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-[#412A86] to-[#B968C7] flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-white" />
        </div>
        <h1 className="font-poppins font-bold text-3xl mt-5">You're in!</h1>
        <p className="text-foreground/70 mt-2">
          {s ? `Your seat for "${s.title}" is confirmed.` : "Your seat is confirmed."} A confirmation email and WhatsApp message are on the way.
        </p>

        {s && (
          <div className="mt-6 rounded-2xl bg-[#faf8ff] border border-[#412A86]/10 p-5 text-left">
            <div className="text-sm text-foreground/60">When</div>
            <div className="font-semibold text-gray-900">
              {new Date(s.scheduled_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true })} IST
            </div>
            <div className="text-sm text-foreground/60 mt-3">Host</div>
            <div className="font-semibold text-gray-900">{s.host_name} · {s.host_title}</div>
          </div>
        )}

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          {s && (
            <a target="_blank" rel="noreferrer"
              href={buildGoogleCalUrl(s.title, s.scheduled_at, s.duration_minutes, s.subtitle)}
              className="inline-flex items-center justify-center gap-2 h-12 rounded-full border border-gray-200 hover:border-[#412A86]/40 font-semibold text-sm">
              <Calendar className="h-4 w-4" /> Add to Calendar
            </a>
          )}
          {s?.whatsapp_group_url && (
            <a href={s.whatsapp_group_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#25D366]/90">
              <MessageCircle className="h-4 w-4" /> Join WhatsApp Group
            </a>
          )}
        </div>

        <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#412A86] font-semibold mt-8 hover:underline">
          Back to home <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        {regId && <p className="text-[10px] text-foreground/40 mt-6">Ref: {regId.slice(0,8)}</p>}
      </div>
    </div>
  );
};

export default MasterclassSuccess;