import { useMemo, useState, lazy, Suspense } from "react";
import {
  Compass, Layers, Plug, Cpu, TrendingUp, IndianRupee, Map as MapIcon,
  Award, CheckCircle2, Sparkles, Clock, Users, Globe, Gift, ShieldCheck,
  Calendar, Timer, BadgeCheck, Zap, ArrowRight, Star, Trophy, Rocket, Briefcase, GraduationCap,
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
  const seatsPct = Math.max(8, Math.min(92, Math.round((seatsLeft / Math.max(s.seats_total, 1)) * 100)));
  const priceLabel = s.is_free ? "Free" : `₹${Number(s.price_inr).toFixed(0)}`;
  const GST_RATE = 0.18;
  const gstAmount = s.is_free ? 0 : Math.round(Number(s.price_inr) * GST_RATE);
  const grossPrice = s.is_free ? 0 : Number(s.price_inr) + gstAmount;
  const grossLabel = s.is_free ? "Free" : `₹${grossPrice}`;

  // Total bonus value (sums "₹1,999" style strings)
  const totalBonusValue = s.bonuses.reduce((sum, b) => {
    const n = Number(String(b.value || "").replace(/[^0-9]/g, "")) || 0;
    return sum + n;
  }, 0);

  const CTA = ({ size = "lg", className = "" }: { size?: "lg" | "default"; className?: string }) => (
    <Button
      onClick={() => setOpen(true)}
      className={`rounded-xl font-semibold bg-[#412A86] hover:bg-[#371f78] text-white shadow-sm hover:shadow-md transition-all ${size === "lg" ? "h-14 px-8 text-base" : "h-12 px-6 text-sm"} ${className}`}
    >
      {s.is_free ? "Reserve Free Seat" : `Register for ${grossLabel}`}
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
          <button onClick={() => setOpen(true)} className="shrink-0 rounded-lg bg-white text-[#412A86] font-semibold px-4 py-1.5 text-sm hover:bg-white/90 transition">
            {s.is_free ? "Reserve" : `Register ${grossLabel}`}
          </button>
        </div>
      </div>

      {/* HERO — sharp, editorial, no heavy gradients */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* subtle grid background */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(65,42,134,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(65,42,134,0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
        <div className="container mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-24 relative">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-start">
            {/* Left — copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-md bg-[#412A86]/5 border border-[#412A86]/15 px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-[#412A86]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                {s.eyebrow}
              </span>

              <h1 className="font-poppins font-extrabold text-[2.25rem] sm:text-5xl md:text-[3.75rem] leading-[1.04] tracking-[-0.02em] mt-5 text-[#0f0a24]">
                {s.title.split(" ").slice(0, -3).join(" ")}{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#412A86]">
                    {s.title.split(" ").slice(-3).join(" ")}
                  </span>
                  <span className="absolute left-0 right-0 bottom-1 h-3 md:h-4 bg-[#B968C7]/25 -z-0 rounded-sm" />
                </span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-[#0f0a24]/70 max-w-xl leading-relaxed">
                {s.subtitle}
              </p>

              {/* Credential strip with icons */}
              <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                {[
                  { Icon: GraduationCap, label: "1,000+ agents trained" },
                  { Icon: Globe, label: "14+ countries" },
                  { Icon: Trophy, label: "14 yrs in travel" },
                  { Icon: Rocket, label: "AI-first DMC" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-lg border border-gray-150 bg-white px-3 py-2.5">
                    <div className="h-8 w-8 rounded-md bg-[#412A86]/8 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-[#412A86]" strokeWidth={2.25} />
                    </div>
                    <span className="text-xs font-semibold text-[#0f0a24] leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Outcomes — sharp bullets */}
              <ul className="mt-8 space-y-3 max-w-xl">
                {[
                  "Pick a profitable niche and price your first package",
                  "Plug into IATA / NDC / hotel APIs without writing code",
                  "Run paid acquisition that converts at ₹250 per lead",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-md bg-[#412A86] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-[15px] text-[#0f0a24]/85 leading-snug">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — register card */}
            <div className="lg:sticky lg:top-20">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_-12px_rgba(15,10,36,0.18)] overflow-hidden">
                {/* Top stripe */}
                <div className="bg-[#0f0a24] text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#B968C7]" />
                    <span className="text-[11px] font-bold tracking-[0.18em] uppercase">Live Masterclass</span>
                  </div>
                  <CountdownPill scheduledAt={s.scheduled_at} variant="dark" className="!px-2 !py-1 scale-90 origin-right" />
                </div>

                <div className="p-6">
                  {/* Date / Duration / Seats grid */}
                  <div className="grid grid-cols-3 gap-4 pb-5 border-b border-gray-100">
                    <div className="flex flex-col gap-1">
                      <Calendar className="h-4 w-4 text-[#412A86]" strokeWidth={2.25} />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</div>
                      <div className="font-bold text-[#0f0a24] text-sm leading-tight">
                        {whenLabel.split(",")[1]?.trim().split(" ").slice(0, 2).join(" ")}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 border-x border-gray-100 px-3">
                      <Timer className="h-4 w-4 text-[#412A86]" strokeWidth={2.25} />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Duration</div>
                      <div className="font-bold text-[#0f0a24] text-sm leading-tight">{s.duration_minutes} min</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Users className="h-4 w-4 text-emerald-600" strokeWidth={2.25} />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seats</div>
                      <div className="font-bold text-emerald-600 text-sm leading-tight">{seatsLeft} left</div>
                    </div>
                  </div>

                  {/* Seats bar */}
                  <div className="mt-4">
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${seatsPct}%` }} />
                    </div>
                    <div className="mt-1.5 text-[11px] text-foreground/55 flex justify-between">
                      <span>Filling fast</span>
                      <span>{seatsPct}% remaining</span>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  {!s.is_free && (
                    <div className="mt-5 rounded-lg bg-gray-50 border border-gray-100 p-4 space-y-1.5 text-sm">
                      <div className="flex justify-between text-[#0f0a24]/70">
                        <span>Seat price</span>
                        <span className="font-medium">₹{Number(s.price_inr).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-[#0f0a24]/70">
                        <span>GST (18%)</span>
                        <span className="font-medium">₹{gstAmount}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 text-[#0f0a24] font-bold text-base">
                        <span>Total payable</span>
                        <span>₹{grossPrice}</span>
                      </div>
                    </div>
                  )}

                  <button onClick={() => setOpen(true)}
                    className="mt-5 w-full h-13 py-4 rounded-xl bg-[#412A86] hover:bg-[#371f78] text-white font-bold text-base shadow-sm hover:shadow-md transition-all inline-flex items-center justify-center gap-2">
                    {s.is_free ? "Reserve My Free Seat" : `Register Now · ₹${grossPrice}`}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                  <p className="mt-3 text-xs text-center text-foreground/60 inline-flex items-center justify-center gap-1.5 w-full">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.25} />
                    {s.is_free ? "100% free · No card needed" : "Secure PayU checkout · 24-hour refund"}
                  </p>
                </div>
              </div>

              {/* Trust badges below card */}
              <div className="mt-4 flex items-center justify-center gap-5 text-[11px] text-foreground/55">
                <span className="inline-flex items-center gap-1.5"><Lock /> </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <Section className="bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">Who this is for</p>
            <h2 className="font-poppins font-bold text-3xl md:text-5xl mt-2 tracking-tight">Is this you?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-[#faf8ff] border border-[#412A86]/10 p-7 md:p-9">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#412A86] text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Absolutely new to travel
              </div>
              <h3 className="mt-4 font-bold text-xl text-gray-900">Start from zero — the right way</h3>
              <ul className="mt-5 space-y-3">
                {s.who_for_beginner.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground/85">
                    <CheckCircle2 className="h-5 w-5 text-[#412A86] mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-[#412A86] text-white border border-[#412A86] p-7 md:p-9 relative overflow-hidden shadow-[0_30px_60px_-25px_rgba(65,42,134,0.55)]">
              <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[#B968C7]/30 blur-3xl" />
              <div className="relative inline-flex items-center gap-2 rounded-full bg-[#B968C7] text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Already in travel, want to scale
              </div>
              <h3 className="relative mt-4 font-bold text-xl">Break the plateau, own the decade</h3>
              <ul className="relative mt-5 space-y-3">
                {s.who_for_scaler.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-white/90">
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
            <h2 className="font-poppins font-bold text-3xl md:text-5xl mt-2 tracking-tight">What you will learn in 2 hours</h2>
            <p className="text-foreground/65 mt-3 max-w-xl mx-auto">Seven modules, no fluff. Built from 14 years of real travel-business operations.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {s.learning_points.map((lp, i) => {
              const Icon = ICONS[lp.icon] || Sparkles;
              return (
                <div key={i} className="group rounded-3xl bg-white border border-gray-100 p-6 md:p-7 shadow-[0_4px_20px_-12px_rgba(65,42,134,0.15)] hover:shadow-[0_20px_40px_-15px_rgba(65,42,134,0.25)] hover:-translate-y-1 hover:border-[#B968C7]/30 transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-[#412A86]/5 group-hover:bg-gradient-to-br group-hover:from-[#412A86] group-hover:to-[#B968C7] text-[#412A86] group-hover:text-white flex items-center justify-center transition-all">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold tracking-widest text-gray-300">MODULE {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 leading-snug">{lp.title}</h3>
                  <p className="mt-2 text-sm text-foreground/65 leading-relaxed">{lp.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-[#412A86] font-semibold hover:gap-3 transition-all">
              <Zap className="h-4 w-4" /> Get full access for {priceLabel} <ArrowRight className="h-4 w-4" />
            </button>
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
            <h2 className="font-poppins font-bold text-3xl md:text-5xl mt-2 tracking-tight">Everything you get</h2>
            <p className="text-foreground/65 mt-3">Yours to keep — even if you can't attend live.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {s.bonuses.map((b, i) => (
              <div key={i} className="rounded-3xl bg-white border border-gray-100 shadow-[0_10px_30px_-15px_rgba(65,42,134,0.2)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(65,42,134,0.3)] transition-all overflow-hidden">
                <div className={`h-28 ${i === 1 ? "bg-gradient-to-br from-[#B968C7] to-[#d48be0]" : "bg-gradient-to-br from-[#412A86] to-[#5b3aaf]"} flex items-center justify-center`}>
                  <Gift className="h-12 w-12 text-white/30" />
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold tracking-widest rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 uppercase">Bonus #{i+1}</span>
                  <h3 className="font-bold text-lg mt-3 text-gray-900">{b.title}</h3>
                  <p className="text-sm text-foreground/65 mt-2 leading-relaxed">{b.desc}</p>
                  {b.value && (
                    <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 line-through">Worth {b.value}</span>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Free</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Value stack total */}
          {totalBonusValue > 0 && (
            <div className="mt-10 max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-[#412A86] to-[#5b3aaf] text-white p-6 md:p-8 shadow-[0_25px_50px_-20px_rgba(65,42,134,0.55)]">
              <div className="space-y-2.5 text-sm">
                {s.bonuses.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-white/85">
                    <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#B968C7]" /> {b.title}</span>
                    <span className="font-mono text-white/60 line-through">{b.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-white/15 text-base font-semibold">
                  <span>Total value</span>
                  <span className="line-through text-white/70">₹{totalBonusValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-xl font-extrabold">
                  <span>Today, your seat</span>
                  <span className="text-[#B968C7]">{priceLabel}</span>
                </div>
              </div>
              <button onClick={() => setOpen(true)} className="mt-6 w-full h-12 rounded-full bg-white text-[#412A86] font-bold hover:bg-white/95 inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                Claim my seat for {priceLabel} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-[#faf8ff]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-[#B968C7] uppercase tracking-wider">FAQ</p>
            <h2 className="font-poppins font-bold text-3xl md:text-5xl mt-2 tracking-tight">Questions, answered</h2>
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
        <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[#B968C7]/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-[#412A86]/40 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase">
              <Star className="h-3 w-3 text-[#B968C7] fill-[#B968C7]" /> Final call
            </span>
            <h2 className="font-poppins font-extrabold text-3xl md:text-5xl mt-5 leading-[1.05] tracking-tight">
              Your next 90 days could <span className="text-[#f0d9ff]">change everything</span>
            </h2>
            <p className="mt-5 text-white/80 text-lg">
              Join {s.host_name} live for 2 hours. Walk away with a blueprint, not a plan.
            </p>

            <div className="mt-10 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.4)]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-3">Doors close in</div>
              <div className="flex justify-center">
                <CountdownPill scheduledAt={s.scheduled_at} variant="dark" className="!bg-white/15 !border !border-white/20" />
              </div>
              <button onClick={() => setOpen(true)}
                className="mt-6 w-full h-14 rounded-2xl bg-white text-[#412A86] font-extrabold text-lg hover:bg-white/95 shadow-2xl hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2">
                {s.is_free ? "Reserve My Free Seat" : `Register Now for ${priceLabel}`}
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="mt-3 text-sm text-white/70 inline-flex items-center justify-center gap-2 w-full">
                <ShieldCheck className="h-4 w-4" /> {s.is_free ? "Free · No card needed" : "Secure PayU · 24-hour refund"}
              </p>
            </div>
          </div>
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