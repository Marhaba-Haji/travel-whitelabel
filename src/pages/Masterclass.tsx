import { useMemo, useState, lazy, Suspense } from "react";
import {
  Compass, Layers, Plug, Cpu, TrendingUp, IndianRupee, Map as MapIcon,
  Award, CheckCircle2, Sparkles, Clock, Users, Globe, Gift, ShieldCheck, ChevronDown,
} from "lucide-react";
import { useWebinarSettings } from "@/hooks/useWebinarSettings";
import SEOHead from "@/components/seo/SEOHead";
import CountdownPill from "@/components/masterclass/CountdownPill";
import RegisterDialog from "@/components/masterclass/RegisterDialog";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE_URL } from "@/lib/seo-schemas";

const Footer = lazy(() => import("@/components/landing/Footer"));

const ICONS: Record<string, any> = { Compass, Layers, Plug, Cpu, TrendingUp, IndianRupee, Map: MapIcon, Award, Sparkles, Users };

function formatIST(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short", day: "numeric", month: "short",
      hour: "numeric", minute: "2-digit", hour12: true,
    }) + " IST";
  } catch { return iso; }
}

const Section = ({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) => (
  <section id={id} className={`py-16 md:py-24 ${className}`}>
    <div className="container mx-auto px-4">{children}</div>
  </section>
);

const Masterclass = () => {
  const { data: s, isLoading } = useWebinarSettings();
  const [open, setOpen] = useState(false);

  const eventJsonLd = useMemo(() => {
    if (!s) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: s.title,
      description: s.subtitle,
      startDate: s.scheduled_at,
      endDate: new Date(new Date(s.scheduled_at).getTime() + s.duration_minutes * 60_000).toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: { "@type": "VirtualLocation", url: `${SITE_URL}/masterclass` },
      organizer: { "@type": "Organization", name: "Marhaba DMC", url: SITE_URL },
      performer: { "@type": "Person", name: s.host_name },
      offers: {
        "@type": "Offer",
        price: s.is_free ? "0" : String(s.price_inr),
        priceCurrency: s.currency,
        url: `${SITE_URL}/masterclass`,
        availability: "https://schema.org/InStock",
        validFrom: new Date().toISOString(),
      },
      image: [`${SITE_URL}/og-image.jpg`],
    };
  }, [s]);

  if (isLoading || !s) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 rounded-full border-2 border-[#412A86] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!s.is_published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f4ff] to-white px-4">
        <div className="text-center max-w-md">
          <Sparkles className="h-10 w-10 text-[#B968C7] mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold mb-2">Next session coming soon</h1>
          <p className="text-foreground/70">Check back shortly — we're scheduling the next live masterclass.</p>
        </div>
      </div>
    );
  }

  const whenLabel = formatIST(s.scheduled_at);
  const seatsLeft = Math.max(
    12,
    s.seats_total - s.seats_reserved_buffer - Math.floor(Math.random() * 50),
  );
  const priceLabel = s.is_free ? "Free" : `₹${Number(s.price_inr).toFixed(0)}`;

  const CTA = ({ size = "lg", className = "" }: { size?: "lg" | "default"; className?: string }) => (
    <Button
      onClick={() => setOpen(true)}
      className={`rounded-full font-semibold bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-[0_10px_30px_-10px_rgba(65,42,134,0.55)] hover:-translate-y-0.5 transition-all ${size === "lg" ? "h-14 px-8 text-base" : "h-12 px-6 text-sm"} ${className}`}
    >
      {s.is_free ? "Reserve Free Seat" : `Register for ${priceLabel}`}
    </Button>
  );

  return (
    <div className="min-h-screen bg-white text-foreground">
      <SEOHead
        title={`${s.title} — Live Masterclass with ${s.host_name}`}
        description={s.subtitle}
        path="/masterclass"
        type="website"
        jsonLd={eventJsonLd as any}
        keywords={["travel business masterclass", "start travel agency india", "scale travel business", "tourism webinar", s.host_name]}
      />

      {/* Sticky top countdown bar */}
      <div className="sticky top-0 z-40 bg-[#412A86] text-white">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline opacity-90">Live in</span>
            <CountdownPill scheduledAt={s.scheduled_at} variant="dark" className="!px-2 !py-1 !gap-2 scale-90 origin-left" />
          </div>
          <button onClick={() => setOpen(true)} className="shrink-0 rounded-full bg-white text-[#412A86] font-semibold px-4 py-1.5 text-sm hover:bg-white/90 transition">
            {s.is_free ? "Reserve" : `Register ${priceLabel}`}
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7f4ff] via-white to-[#fef0f8]">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#B968C7]/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#412A86]/15 blur-3xl" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#412A86]/15 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#412A86] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              {s.eyebrow}
            </span>
            <h1 className="font-poppins font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] mt-6 text-gray-900">
              {s.title.split(" ").slice(0, -3).join(" ")}{" "}
              <span className="text-[#B968C7]">{s.title.split(" ").slice(-3).join(" ")}</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
              {s.subtitle}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="rounded-full bg-white border border-gray-200 px-4 py-1.5 font-medium">📅 {whenLabel}</span>
              <span className="rounded-full bg-white border border-gray-200 px-4 py-1.5 font-medium">⏱ {s.duration_minutes} min</span>
              <span className="rounded-full bg-white border border-gray-200 px-4 py-1.5 font-medium">🟢 {seatsLeft} seats left</span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTA />
              <div className="text-sm text-foreground/60">
                {s.is_free ? "100% free · No card needed" : `Only ${priceLabel} · 24-hour refund`}
              </div>
            </div>

            <div className="mt-10">
              <CountdownPill scheduledAt={s.scheduled_at} variant="light" />
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-10 text-foreground/70">
              <div className="text-center"><div className="text-2xl font-bold text-[#412A86]">1,000+</div><div className="text-xs uppercase tracking-wide">Agents trained</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-[#412A86]">14+</div><div className="text-xs uppercase tracking-wide">Countries served</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-[#412A86]">14 yrs</div><div className="text-xs uppercase tracking-wide">In travel</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <Section className="bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">Who this is for</p>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mt-2">Is this you?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-gradient-to-br from-[#f7f4ff] to-white border border-[#412A86]/10 p-7 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#412A86] text-white text-xs font-semibold px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Absolutely new to travel
              </div>
              <ul className="mt-5 space-y-3">
                {s.who_for_beginner.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground/85">
                    <CheckCircle2 className="h-5 w-5 text-[#412A86] mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-[#fef0f8] to-white border border-[#B968C7]/15 p-7 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#B968C7] text-white text-xs font-semibold px-3 py-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Already in travel, want to scale
              </div>
              <ul className="mt-5 space-y-3">
                {s.who_for_scaler.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground/85">
                    <CheckCircle2 className="h-5 w-5 text-[#B968C7] mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* WHAT YOU WILL LEARN */}
      <Section className="bg-gradient-to-b from-white to-[#faf8ff]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">Curriculum</p>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mt-2">What you will learn in 2 hours</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {s.learning_points.map((lp, i) => {
              const Icon = ICONS[lp.icon] || Sparkles;
              return (
                <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-[0_4px_20px_-12px_rgba(65,42,134,0.15)] hover:shadow-[0_10px_30px_-10px_rgba(65,42,134,0.25)] hover:-translate-y-0.5 transition-all">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#412A86] to-[#B968C7] text-white flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{lp.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{lp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* WHY NOW */}
      <Section className="bg-[#0f0a24] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">Why now</p>
          <h2 className="font-poppins font-bold text-3xl md:text-5xl mt-3">India's travel boom is just getting started</h2>
          <p className="mt-5 text-white/70 max-w-2xl mx-auto text-lg">
            Outbound spend is projected to cross <strong className="text-white">$410 billion by 2030</strong>. Hajj &amp; Umrah pilgrims from India are scheduled to grow to <strong className="text-white">3.5 lakh+ annually</strong>. The agents who move now own the next decade.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="text-4xl font-bold text-[#B968C7]">$410B</div>
              <div className="text-sm text-white/60 mt-1">India outbound by 2030</div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="text-4xl font-bold text-[#B968C7]">+15%</div>
              <div className="text-sm text-white/60 mt-1">YoY growth in international travel</div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="text-4xl font-bold text-[#B968C7]">3.5L+</div>
              <div className="text-sm text-white/60 mt-1">Annual Hajj &amp; Umrah pilgrims</div>
            </div>
          </div>
        </div>
      </Section>

      {/* HOST */}
      <Section className="bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#412A86] to-[#B968C7] p-1 shadow-2xl">
                <div className="h-full w-full rounded-[20px] bg-gray-100 overflow-hidden flex items-center justify-center">
                  {s.host_photo_url ? (
                    <img src={s.host_photo_url} alt={s.host_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-6xl font-bold text-[#412A86]/30">{s.host_name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-[#B968C7]" />
                <span className="text-xs font-semibold">Your Host</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">Meet your host</p>
              <h2 className="font-poppins font-bold text-3xl md:text-4xl mt-2">{s.host_name}</h2>
              <p className="text-foreground/60 mt-1 font-medium">{s.host_title}</p>
              <p className="mt-5 text-foreground/80 leading-relaxed whitespace-pre-line">{s.host_bio_markdown}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Founder, MarhabaDMC", "14+ yrs in Travel", "1,000+ Agents Trained", "AI-First DMC", "Hajj &amp; Umrah Expert"].map((chip) => (
                  <span key={chip} className="text-xs font-medium rounded-full bg-[#412A86]/10 text-[#412A86] px-3 py-1.5" dangerouslySetInnerHTML={{ __html: chip }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* AGENDA */}
      <Section className="bg-[#faf8ff]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">Agenda</p>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mt-2">Inside the 2-hour session</h2>
          </div>
          <div className="space-y-3">
            {s.agenda.map((a, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 flex gap-5 items-start">
                <div className="font-mono text-sm font-semibold text-[#412A86] rounded-lg bg-[#412A86]/10 px-3 py-1.5 shrink-0">{a.time}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-foreground/65 mt-1">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* BONUSES */}
      <Section className="bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">Bonuses</p>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mt-2">Everything you get</h2>
            <p className="text-foreground/65 mt-3">All registrants receive these — yours to keep even if you can't attend live.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {s.bonuses.map((b, i) => (
              <div key={i} className="rounded-3xl bg-gradient-to-br from-[#f7f4ff] to-white border border-[#412A86]/10 p-6 relative overflow-hidden">
                <Gift className="absolute -top-4 -right-4 h-24 w-24 text-[#B968C7]/10" />
                <div className="relative">
                  <span className="text-xs font-semibold rounded-full bg-[#B968C7] text-white px-2.5 py-1">BONUS #{i+1}</span>
                  <h3 className="font-semibold text-lg mt-3">{b.title}</h3>
                  <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{b.desc}</p>
                  {b.value && (
                    <div className="mt-4 text-xs text-foreground/50">
                      Worth <span className="line-through">{b.value}</span> · <span className="text-[#412A86] font-semibold">Free with registration</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-[#faf8ff]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">FAQ</p>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mt-2">Questions, answered</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {s.faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl bg-white border border-gray-100 px-5 data-[state=open]:shadow-md transition-shadow">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-foreground/75 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#412A86] via-[#5e3eb8] to-[#B968C7] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-5xl max-w-3xl mx-auto leading-tight">
            Your next 90 days could change everything
          </h2>
          <p className="mt-5 text-white/80 max-w-xl mx-auto text-lg">
            Join {s.host_name} live for 2 hours. Walk away with a plan.
          </p>
          <div className="mt-8 flex justify-center"><CountdownPill scheduledAt={s.scheduled_at} variant="light" /></div>
          <div className="mt-8">
            <Button onClick={() => setOpen(true)}
              className="rounded-full h-14 px-10 text-base font-semibold bg-white text-[#412A86] hover:bg-white/95 shadow-2xl hover:-translate-y-0.5 transition-all">
              {s.is_free ? "Reserve Free Seat" : `Register Now for ${priceLabel}`}
            </Button>
          </div>
          <p className="mt-4 text-sm text-white/60 inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> {s.is_free ? "Free · No card needed" : "Secure PayU checkout · 24-hour refund"}
          </p>
        </div>
      </section>

      <Suspense fallback={null}><Footer /></Suspense>

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <button onClick={() => setOpen(true)}
          className="w-full h-12 rounded-full bg-[#412A86] text-white font-semibold shadow-lg flex items-center justify-center gap-2">
          {s.is_free ? "Reserve Free Seat" : `Register for ${priceLabel}`}
        </button>
      </div>

      <RegisterDialog open={open} onOpenChange={setOpen} priceInr={Number(s.price_inr)} isFree={s.is_free} title={s.title} />
    </div>
  );
};

export default Masterclass;