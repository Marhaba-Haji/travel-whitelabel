import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, CreditCard, CheckCircle2, ShieldCheck, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackLead } from "@/lib/meta-pixel";
import { UMRAH, inr } from "@/lib/umrah-package";

const ROOMS = ["Quad sharing", "Quint sharing", "Triple (private)", "Double (private)", "Not sure yet"];

function readUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach((k) => {
    const v = p.get(k);
    if (v) out[k] = v;
  });
  return out;
}

const UmrahEnquiryForm = ({
  compact = false,
  initialRoomPreference = null,
}: {
  compact?: boolean;
  initialRoomPreference?: string | null;
}) => {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    travellers: "1",
    room_preference: "Quad sharing",
    message: "",
  });
  const [showMore, setShowMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initialRoomPreference) {
      setForm((f) => ({ ...f, room_preference: initialRoomPreference }));
      setShowMore(true);
    }
  }, [initialRoomPreference]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (form.full_name.trim().length < 2) return "Please enter your full name.";
    if (form.phone.replace(/\D/g, "").length < 10) return "Please enter a valid mobile number.";
    return null;
  };

  const phoneE164 = () => {
    const digits = form.phone.replace(/\D/g, "").replace(/^0+/, "");
    return digits.startsWith("91") && digits.length > 10 ? `+${digits}` : `+91${digits.slice(-10)}`;
  };

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setSending(true);
    const { error } = await supabase.from("umrah_leads" as any).insert({
      full_name: form.full_name.trim().slice(0, 100),
      phone_e164: phoneE164(),
      email: form.email.trim().toLowerCase() || null,
      city: form.city.trim() || null,
      travellers: Math.max(1, Math.min(60, parseInt(form.travellers) || 1)),
      room_preference: form.room_preference,
      message: form.message.trim().slice(0, 1000) || null,
      package_slug: UMRAH.slug,
      lead_type: "enquiry",
      status: "new",
      amount_inr: 0,
      utm: readUtm(),
      landing_page: typeof window !== "undefined" ? window.location.pathname : null,
    });
    setSending(false);

    if (error) {
      console.error(error);
      return toast.error("Could not send your enquiry. Please try WhatsApp instead.");
    }
    trackLead("umrah_enquiry", { package: UMRAH.slug, travellers: form.travellers });
    supabase.functions
      .invoke("notify-umrah-lead", {
        body: {
          full_name: form.full_name.trim().slice(0, 100),
          phone_e164: phoneE164(),
          email: form.email.trim().toLowerCase() || null,
          city: form.city.trim() || null,
          travellers: Math.max(1, Math.min(60, parseInt(form.travellers) || 1)),
          room_preference: form.room_preference,
          message: form.message.trim().slice(0, 1000) || null,
          package_slug: UMRAH.slug,
          lead_type: "enquiry",
          status: "new",
          amount_inr: 0,
          utm: readUtm(),
          landing_page: typeof window !== "undefined" ? window.location.pathname : null,
        },
      })
      .catch(() => {});
    setDone(true);
    toast.success("Enquiry received. Our Umrah desk will call you shortly.");
  };

  const payAdvance = async () => {
    const err = validate();
    if (err) return toast.error(err);

    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-umrah-booking", {
        body: {
          fullName: form.full_name.trim(),
          phone: form.phone,
          email: form.email.trim(),
          city: form.city.trim(),
          travellers: parseInt(form.travellers) || 1,
          roomPreference: form.room_preference,
          message: form.message.trim(),
          utm: readUtm(),
        },
      });
      if (error || !data?.action) throw error || new Error("Payment unavailable");

      trackLead("umrah_booking", { package: UMRAH.slug });

      const f = document.createElement("form");
      f.method = "POST";
      f.action = data.action;
      Object.entries(data.params as Record<string, string>).forEach(([k, v]) => {
        const i = document.createElement("input");
        i.type = "hidden";
        i.name = k;
        i.value = v;
        f.appendChild(i);
      });
      document.body.appendChild(f);
      f.submit();
    } catch (e) {
      console.error(e);
      toast.error("Payment could not be started. Please try again or contact us on WhatsApp.");
      setPaying(false);
    }
  };

  if (done) {
    return (
      <div className="mh-card p-8 text-center">
        <CheckCircle2 className="h-10 w-10 mx-auto text-[var(--mh-green)]" />
        <h3 className="mh-h3 mt-4">Enquiry received</h3>
        <p className="text-sm text-[var(--mh-ink-soft)] mt-2">
          Our Umrah desk will call you on {phoneE164()} within a few hours. Seats are confirmed only on
          payment of the {inr(UMRAH.advanceAmount)} booking amount.
        </p>
        <button className="mh-btn mh-btn-gold mt-5 w-full" onClick={payAdvance} disabled={paying}>
          {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Pay {inr(UMRAH.advanceAmount)} and confirm my seat
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submitEnquiry} className={`mh-card ${compact ? "p-5" : "p-6 sm:p-7"}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="mh-h3">Reserve your seat</h3>
        <span className="mh-chip mh-chip-gold">{UMRAH.seatsLeft} seats left</span>
      </div>
      <p className="text-sm text-[var(--mh-ink-soft)] mt-1.5">
        {inr(UMRAH.offerPrice)} per person · booking amount {inr(UMRAH.advanceAmount)}
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        <div className="sm:col-span-2">
          <label className="mh-label text-[var(--mh-ink-soft)]" htmlFor="mh-name">Full name</label>
          <input id="mh-name" className="mh-input mt-1.5" value={form.full_name} onChange={set("full_name")} placeholder="As per passport" required />
        </div>
        <div className="sm:col-span-2">
          <label className="mh-label text-[var(--mh-ink-soft)]" htmlFor="mh-phone">WhatsApp number</label>
          <input id="mh-phone" className="mh-input mt-1.5" value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" inputMode="tel" required />
        </div>

        {showMore && (
          <>
            <div>
              <label className="mh-label text-[var(--mh-ink-soft)]" htmlFor="mh-email">Email (optional)</label>
              <input id="mh-email" type="email" className="mh-input mt-1.5" value={form.email} onChange={set("email")} placeholder="you@email.com" />
            </div>
            <div>
              <label className="mh-label text-[var(--mh-ink-soft)]" htmlFor="mh-city">City</label>
              <input id="mh-city" className="mh-input mt-1.5" value={form.city} onChange={set("city")} placeholder="Bangalore" />
            </div>
            <div>
              <label className="mh-label text-[var(--mh-ink-soft)]" htmlFor="mh-trav">Travellers</label>
              <input id="mh-trav" type="number" min={1} max={60} className="mh-input mt-1.5" value={form.travellers} onChange={set("travellers")} />
            </div>
            <div>
              <label className="mh-label text-[var(--mh-ink-soft)]" htmlFor="mh-room">Room preference</label>
              <select id="mh-room" className="mh-input mt-1.5" value={form.room_preference} onChange={set("room_preference")}>
                {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {!compact && (
              <div className="sm:col-span-2">
                <label className="mh-label text-[var(--mh-ink-soft)]" htmlFor="mh-msg">Anything we should know? (optional)</label>
                <textarea id="mh-msg" className="mh-input mt-1.5" value={form.message} onChange={set("message")} placeholder="Elderly parents, wheelchair, group of 12…" />
              </div>
            )}
          </>
        )}
      </div>

      {!showMore && (
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--mh-green)] mt-3"
        >
          <ChevronDown className="h-3.5 w-3.5" /> Add city, travellers &amp; room preference (optional)
        </button>
      )}

      <button type="submit" className="mh-btn mh-btn-primary w-full mt-5" disabled={sending}>
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send my enquiry
      </button>
      <button type="button" onClick={payAdvance} className="mh-btn mh-btn-gold w-full mt-2.5" disabled={paying}>
        {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Pay {inr(UMRAH.advanceAmount)} booking amount
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--mh-ink-soft)] mt-3">
        <ShieldCheck className="h-3.5 w-3.5 text-[var(--mh-green)]" /> Secured by PayU · 256-bit SSL encryption
      </p>
      <p className="text-[11px] text-[var(--mh-ink-soft)] text-center mt-1.5">
        Group of {UMRAH.groupDiscountMin}+? Mention it in the form — a further special discount applies.
      </p>
    </form>
  );
};

export default UmrahEnquiryForm;
