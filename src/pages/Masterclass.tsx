import { useMemo, useState, lazy, Suspense } from "react";
import {
  Compass, Layers, Plug, Cpu, TrendingUp, IndianRupee, Map as MapIcon,
  Award, CheckCircle2, Sparkles, Clock, Users, Gift, ShieldCheck,
  Calendar, Timer, BadgeCheck, Zap, ArrowRight, Star,
} from "lucide-react";
import { useWebinarSettings } from "@/hooks/useWebinarSettings";
import SEOHead from "@/components/seo/SEOHead";
import CountdownPill from "@/components/masterclass/CountdownPill";
import RegisterDialog from "@/components/masterclass/RegisterDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE_URL } from "@/lib/seo-schemas";
import "@/styles/masterclass.css";

const Footer = lazy(() => import("@/components/landing/Footer"));

const ICONS: Record<string, any> = {
  Compass, Layers, Plug, Cpu, TrendingUp, IndianRupee, Map: MapIcon, Award, Sparkles, Users,
};

function formatIST(iso: string) {
  try {
    return (
      new Date(iso).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short", day: "numeric", month: "short",
        hour: "numeric", minute: "2-digit", hour12: true,
      }) + " IST"
    );
  } catch { return iso; }
}

const Section = ({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) => (
  <section id={id} className={`py-20 md:py-28 ${className}`}>
    <div className="container mx-auto px-5 md:px-8 max-w-[1200px]">{children}</div>
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
      <div className="mc-scope min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--mc-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!s.is_published) {
    return (
      <div className="mc-scope min-h-screen mc-bg-radial flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Sparkles className="h-10 w-10 text-[var(--mc-primary)] mx-auto mb-4" />
          <h1 className="mc-h-md text-[var(--mc-on-surface)]">Next session coming soon</h1>
          <p className="text-[var(--mc-on-surface-variant)] mt-3">
            Check back shortly — we're scheduling the next live masterclass.
          </p>
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

  const totalBonusValue = s.bonuses.reduce((sum, b) => {
    const n = Number(String(b.value || "").replace(/[^0-9]/g, "")) || 0;
    return sum + n;
  }, 0);

  const PrimaryCTA = ({ className = "", label }: { className?: string; label?: string }) => (
    <button onClick={() => setOpen(true)} className={`mc-cta mc-cta-primary ${className}`}>
      {label || (s.is_free ? "Reserve My Free Seat" : `Register for ${priceLabel}`)}
      <ArrowRight className="h-4 w-4" />
    </button>
  );

  return (
    <div className="mc-scope min-h-screen">
      <SEOHead
        title={`${s.title} — Live Masterclass with ${s.host_name}`}
        description={s.subtitle}
        path="/masterclass"
        type="website"
        jsonLd={eventJsonLd as any}
        keywords={[
          "travel business masterclass",
          "start travel agency india",
          "scale travel business",
          "tourism webinar",
          s.host_name,
        ]}
      />

      {/* Sticky top countdown bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--mc-surface)]/85 border-b border-[rgba(213,189,240,0.12)]">
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-center md:justify-between gap-3 max-w-[1200px]">
          <div className="flex items-center gap-2 min-w-0 text-sm">
            <Clock className="h-4 w-4 text-[var(--mc-primary)] shrink-0" />
            <span className="hidden sm:inline text-[var(--mc-on-surface-variant)]">Live in</span>
            <CountdownPill scheduledAt={s.scheduled_at} variant="light" compact className="!py-1 !px-2" />
          </div>
          <button
            onClick={() => setOpen(true)}
            className="hidden md:block shrink-0 rounded-full bg-[var(--mc-secondary)] text-[var(--mc-on-secondary)] font-bold px-4 py-1.5 text-sm hover:bg-[var(--mc-secondary-bright)] transition"
          >
            {s.is_free ? "Reserve" : `Register ${priceLabel}`}
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden mc-bg-radial">
        <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-[var(--mc-tertiary)]/15 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[var(--mc-secondary)]/10 blur-[120px]" />
        <div className="container mx-auto px-5 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28 relative max-w-[1200px]">
          <div className="max-w-3xl mx-auto text-center">
            <span className="mc-chip">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--mc-secondary)] opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--mc-secondary)]" />
              </span>
              {s.eyebrow}
            </span>

            <h1 className="mc-h-xl mt-6 text-[var(--mc-on-surface)]">
              {s.title.split(" ").slice(0, -3).join(" ")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mc-primary)] via-[var(--mc-tertiary)] to-[var(--mc-secondary)]">
                {s.title.split(" ").slice(-3).join(" ")}
              </span>
            </h1>

            <p className="mt-6 mc-body-lg text-[var(--mc-on-surface-variant)] max-w-2xl mx-auto">
              {s.subtitle}
            </p>

            {/* Register card */}
            <div className="mt-12 mx-auto max-w-xl mc-glass-strong p-6 md:p-7 text-left relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[var(--mc-tertiary)]/25 blur-3xl pointer-events-none" />

              <div className="relative grid grid-cols-3 gap-3 pb-5 border-b border-[rgba(213,189,240,0.12)]">
                <div>
                  <div className="mc-label text-[var(--mc-on-surface-variant)] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />Date
                  </div>
                  <div className="font-bold text-[var(--mc-on-surface)] text-sm mt-2">
                    {whenLabel.split(",")[0]},{" "}
                    {whenLabel.split(",")[1]?.trim().split(" ").slice(0, 2).join(" ")}
                  </div>
                </div>
                <div className="border-x border-[rgba(213,189,240,0.12)] px-3">
                  <div className="mc-label text-[var(--mc-on-surface-variant)] flex items-center gap-1">
                    <Timer className="h-3 w-3" />Duration
                  </div>
                  <div className="font-bold text-[var(--mc-on-surface)] text-sm mt-2">
                    {s.duration_minutes} min
                  </div>
                </div>
                <div className="text-right">
                  <div className="mc-label text-[var(--mc-on-surface-variant)] flex items-center gap-1 justify-end">
                    <Users className="h-3 w-3" />Seats
                  </div>
                  <div className="font-bold text-[var(--mc-secondary-bright)] text-sm mt-2">
                    {seatsLeft} left
                  </div>
                </div>
              </div>

              <div className="relative mt-4">
                <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--mc-secondary)] to-[var(--mc-secondary-bright)] shadow-[0_0_12px_rgba(157,248,0,0.6)] transition-all"
                    style={{ width: `${seatsPct}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-[var(--mc-on-surface-variant)] flex justify-between">
                  <span>Filling fast</span>
                  <span>{seatsPct}% remaining</span>
                </div>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="mc-cta mc-cta-primary relative mt-5 w-full h-14 text-base"
              >
                {s.is_free ? "Reserve My Free Seat" : `Register for ${priceLabel} Only`}
                <ArrowRight className="h-5 w-5" />
              </button>

              <p className="relative mt-3 text-xs text-center text-[var(--mc-on-surface-variant)] inline-flex items-center justify-center gap-1.5 w-full">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--mc-secondary-bright)]" />
                {s.is_free ? "100% free · No card needed" : "Secure PayU checkout · 24-hour full refund"}
              </p>

              <div className="relative mt-6 pt-5 border-t border-[rgba(213,189,240,0.12)]">
                <div className="mc-label text-[var(--mc-on-surface-variant)] text-center mb-3">Doors close in</div>
                <div className="flex justify-center">
                  <CountdownPill scheduledAt={s.scheduled_at} variant="dark" />
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-14 grid grid-cols-3 max-w-2xl mx-auto divide-x divide-[rgba(213,189,240,0.15)]">
              {[
                ["100+", "Agents trained"],
                ["30+", "Global destinations"],
                ["15+ yrs", "Of experience"],
              ].map(([n, l]) => (
                <div key={l} className="px-2">
                  <div className="text-2xl md:text-3xl font-extrabold text-[var(--mc-primary)]">{n}</div>
                  <div className="mc-label text-[var(--mc-on-surface-variant)] mt-2">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="mc-chip">Who this is for</span>
            <h2 className="mc-h-lg mt-4 text-[var(--mc-on-surface)]">Is this you?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Beginner */}
            <div className="group mc-glass p-8 md:p-10 relative overflow-hidden hover:-translate-y-2 hover:border-[rgba(213,189,240,0.35)] hover:shadow-[0_20px_40px_-15px_rgba(208,188,255,0.15)] transition-all duration-500 rounded-[2rem]">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[var(--mc-tertiary)]/10 blur-3xl group-hover:bg-[var(--mc-tertiary)]/25 group-hover:scale-110 transition-all duration-700" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--mc-primary)]/5 blur-3xl group-hover:bg-[var(--mc-primary)]/15 group-hover:scale-110 transition-all duration-700" />
              
              <div className="relative">
                <span className="mc-chip bg-[var(--mc-tertiary-container)] border-[var(--mc-tertiary)]/20 text-[var(--mc-primary)]">
                  <Sparkles className="h-4 w-4" /> Brand new to travel
                </span>
                
                <h3 className="mt-6 font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-br from-white to-[var(--mc-tertiary)] leading-tight">
                  Start from zero — the right way
                </h3>
                
                <div className="w-12 h-1 bg-gradient-to-r from-[var(--mc-primary)] to-transparent rounded-full mt-6 mb-8 opacity-50 group-hover:w-20 transition-all duration-500" />

                <ul className="space-y-4">
                  {s.who_for_beginner.map((b) => (
                    <li key={b} className="flex items-start gap-4 text-[var(--mc-on-surface)]/85">
                      <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-[var(--mc-tertiary)]/15 border border-[var(--mc-tertiary)]/30 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--mc-primary)]" />
                      </div>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Scaler */}
            <div className="group mc-glass-strong p-8 md:p-10 relative overflow-hidden hover:-translate-y-2 hover:border-[rgba(157,248,0,0.35)] hover:shadow-[0_20px_40px_-15px_rgba(157,248,0,0.15)] transition-all duration-500 rounded-[2rem]">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[var(--mc-secondary)]/10 blur-3xl group-hover:bg-[var(--mc-secondary)]/20 group-hover:scale-110 transition-all duration-700" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--mc-secondary-bright)]/5 blur-3xl group-hover:bg-[var(--mc-secondary-bright)]/10 group-hover:scale-110 transition-all duration-700" />
              
              <div className="relative">
                <span className="mc-chip mc-chip-green bg-[rgba(157,248,0,0.1)] border-[rgba(157,248,0,0.2)]">
                  <TrendingUp className="h-4 w-4" /> Already in travel — want to scale
                </span>
                
                <h3 className="mt-6 font-extrabold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-br from-[var(--mc-secondary-bright)] to-white leading-tight">
                  Break the plateau. Own the decade.
                </h3>
                
                <div className="w-12 h-1 bg-gradient-to-r from-[var(--mc-secondary)] to-transparent rounded-full mt-6 mb-8 opacity-50 group-hover:w-20 transition-all duration-500" />

                <ul className="space-y-4">
                  {s.who_for_scaler.map((b) => (
                    <li key={b} className="flex items-start gap-4 text-[var(--mc-on-surface)]/90">
                      <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-[var(--mc-secondary)]/15 border border-[var(--mc-secondary)]/30 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--mc-secondary-bright)]" />
                      </div>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* WHAT YOU WILL LEARN */}
      <Section className="mc-bg-violet">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="mc-chip">Curriculum</span>
            <h2 className="mc-h-lg mt-4 text-[var(--mc-on-surface)]">
              What you'll learn in 2 hours
            </h2>
            <p className="text-[var(--mc-on-surface-variant)] mt-4 max-w-xl mx-auto">
              Seven modules, no fluff. Built from 15+ years of real travel-business operations.
            </p>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:overflow-visible md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {s.learning_points.map((lp, i) => {
              const Icon = ICONS[lp.icon] || Sparkles;
              return (
                <div
                  key={i}
                  className="snap-center shrink-0 w-[85vw] sm:w-[320px] md:w-auto group mc-glass p-6 md:p-7 hover:-translate-y-1 hover:border-[rgba(213,189,240,0.35)] transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-[var(--mc-tertiary-container)] border border-[rgba(213,189,240,0.25)] text-[var(--mc-primary)] flex items-center justify-center group-hover:bg-[var(--mc-secondary)] group-hover:text-[var(--mc-on-secondary)] group-hover:border-[var(--mc-secondary)] transition-all">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="mc-label text-[var(--mc-outline)]">
                      MODULE {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[var(--mc-on-surface)] leading-snug">
                    {lp.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--mc-on-surface-variant)] leading-relaxed">
                    {lp.desc}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <PrimaryCTA label={`Get full access for ${priceLabel}`} />
          </div>
        </div>
      </Section>

      {/* WHY NOW */}
      <Section>
        <div className="max-w-5xl mx-auto text-center">
          <span className="mc-chip">Why now</span>
          <h2 className="mc-h-lg mt-4 text-[var(--mc-on-surface)]">
            India's travel boom is just getting started
          </h2>
          <p className="mt-5 text-[var(--mc-on-surface-variant)] max-w-2xl mx-auto mc-body-lg">
            Outbound spend is projected to cross{" "}
            <strong className="text-[var(--mc-secondary-bright)]">$410 billion by 2030</strong>.
            Hajj &amp; Umrah pilgrims from India are scheduled to grow to{" "}
            <strong className="text-[var(--mc-secondary-bright)]">3.5 lakh+ annually</strong>. The
            agents who move now own the next decade.
          </p>
          <div className="grid sm:grid-cols-3 gap-5 mt-12">
            {[
              ["$410B", "India outbound by 2030"],
              ["+15%", "YoY growth in international travel"],
              ["3.5L+", "Annual Hajj & Umrah pilgrims"],
            ].map(([n, l]) => (
              <div key={l} className="mc-glass p-7">
                <div className="text-4xl font-extrabold text-[var(--mc-secondary-bright)]">{n}</div>
                <div className="text-sm text-[var(--mc-on-surface-variant)] mt-2">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* HOST */}
      <Section className="mc-bg-violet">
        <div className="max-w-5xl mx-auto">
          <div className="group mc-glass p-8 md:p-12 relative overflow-hidden rounded-[2.5rem]">
            {/* Ambient background glows for the card */}
            <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[var(--mc-tertiary)]/10 blur-[100px] pointer-events-none group-hover:bg-[var(--mc-tertiary)]/20 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[var(--mc-secondary)]/10 blur-[100px] pointer-events-none group-hover:bg-[var(--mc-secondary)]/15 transition-all duration-1000" />
            
            <div className="relative grid md:grid-cols-[300px_1fr] gap-10 md:gap-14 items-center">
              {/* Photo Side */}
              <div className="relative mx-auto w-full max-w-[300px] md:max-w-none">
                <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-[var(--mc-tertiary)] via-[var(--mc-primary)] to-[var(--mc-secondary)] p-1 shadow-[0_20px_40px_-15px_rgba(208,188,255,0.3)] group-hover:shadow-[0_20px_50px_-10px_rgba(208,188,255,0.4)] transition-all duration-500 group-hover:-translate-y-2">
                  <div className="h-full w-full rounded-[1.8rem] bg-[var(--mc-surface-c)] overflow-hidden flex items-center justify-center relative">
                    {s.host_photo_url ? (
                      <img src={s.host_photo_url} alt={s.host_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[var(--mc-primary)] to-[var(--mc-tertiary)] opacity-60">
                        {s.host_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    {/* Inner overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-5 -right-5 md:-right-8 mc-glass-strong px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-[rgba(213,189,240,0.3)] group-hover:scale-105 transition-transform duration-500">
                  <div className="h-10 w-10 rounded-full bg-[var(--mc-secondary)]/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-[var(--mc-secondary-bright)]" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--mc-on-surface-variant)] font-semibold">Your Host</div>
                    <div className="text-sm font-extrabold text-[var(--mc-on-surface)] leading-tight">Masterclass</div>
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div>
                <span className="mc-chip bg-[var(--mc-tertiary-container)] border-[var(--mc-tertiary)]/20 text-[var(--mc-primary)]">
                  <Star className="h-3.5 w-3.5" fill="currentColor" /> Meet your host
                </span>
                
                <h2 className="text-3xl md:text-5xl font-extrabold mt-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-[var(--mc-tertiary)] leading-tight">
                  {s.host_name}
                </h2>
                
                <p className="text-lg md:text-xl text-[var(--mc-secondary-bright)] mt-2 font-bold tracking-tight">
                  {s.host_title}
                </p>
                
                <div className="w-16 h-1 bg-gradient-to-r from-[var(--mc-primary)] to-transparent rounded-full mt-6 mb-6 opacity-60 group-hover:w-24 transition-all duration-500" />
                
                <p className="text-[var(--mc-on-surface)]/85 leading-relaxed md:text-lg whitespace-pre-line font-medium">
                  {s.host_bio_markdown}
                </p>
                
                <div className="mt-10 flex flex-wrap gap-2.5">
                  {[
                    "Founder, MarhabaDMC",
                    "15+ yrs of Experience",
                    "100+ Agents Trained",
                    "AI-First DMC",
                    "Hajj & Umrah Expert",
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="text-xs md:text-sm font-semibold rounded-full bg-white/[0.03] text-[var(--mc-on-surface)] border border-white/[0.08] px-4 py-2 hover:bg-[var(--mc-primary)]/10 hover:border-[var(--mc-primary)]/30 hover:text-[var(--mc-primary)] transition-colors cursor-default"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* AGENDA */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="mc-chip">Agenda</span>
            <h2 className="mc-h-md mt-4 text-[var(--mc-on-surface)]">Inside the 2-hour session</h2>
          </div>
          <div className="relative">
            <div className="absolute left-[58px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--mc-tertiary)]/40 via-[var(--mc-tertiary)]/15 to-transparent hidden sm:block" />
            <div className="space-y-4 md:space-y-3">
              {s.agenda.map((a, i) => (
                <div 
                  key={i} 
                  className="mc-glass p-5 flex gap-4 sm:gap-5 items-start relative sticky md:static transition-transform duration-300 md:hover:-translate-y-1 shadow-[0_-8px_20px_-8px_rgba(0,0,0,0.8)] md:shadow-none"
                  style={{ top: `calc(70px + ${i * 8}px)`, zIndex: i }}
                >
                  <div className="mc-num text-sm font-bold text-[var(--mc-primary)] rounded-lg bg-[var(--mc-tertiary-container)] border border-[rgba(213,189,240,0.25)] px-3 py-1.5 shrink-0">
                    {a.time}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--mc-on-surface)]">{a.title}</h3>
                    <p className="text-sm text-[var(--mc-on-surface-variant)] mt-1">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* BONUSES */}
      <Section className="mc-bg-violet">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="mc-chip">Bonuses</span>
            <h2 className="mc-h-lg mt-4 text-[var(--mc-on-surface)]">Everything you get</h2>
            <p className="text-[var(--mc-on-surface-variant)] mt-4">
              Yours to keep — even if you can't attend live.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {s.bonuses.map((b, i) => (
              <div
                key={i}
                className="mc-glass overflow-hidden hover:-translate-y-1 transition-transform duration-300"
              >
                <div
                  className={`h-28 ${
                    i === 1
                      ? "bg-gradient-to-br from-[var(--mc-secondary)] to-[var(--mc-secondary-bright)]"
                      : "bg-gradient-to-br from-[var(--mc-tertiary)] to-[var(--mc-primary)]"
                  } flex items-center justify-center`}
                >
                  <Gift className="h-12 w-12 text-black/25" />
                </div>
                <div className="p-6">
                  <span className="mc-chip mc-chip-green text-[10px]">Bonus #{i + 1}</span>
                  <h3 className="font-bold text-lg mt-3 text-[var(--mc-on-surface)]">{b.title}</h3>
                  <p className="text-sm text-[var(--mc-on-surface-variant)] mt-2 leading-relaxed">
                    {b.desc}
                  </p>
                  {b.value && (
                    <div className="mt-5 pt-5 border-t border-[rgba(213,189,240,0.12)] flex items-center justify-between">
                      <span className="text-xs text-[var(--mc-outline)] line-through">
                        Worth {b.value}
                      </span>
                      <span className="text-xs font-bold text-[var(--mc-secondary-bright)] uppercase tracking-wider">
                        Free
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalBonusValue > 0 && (
            <div className="mt-12 max-w-2xl mx-auto mc-glass-strong p-6 md:p-8 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[var(--mc-secondary)]/15 blur-3xl pointer-events-none" />
              <div className="relative space-y-2.5 text-sm">
                {s.bonuses.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-[var(--mc-on-surface)]/85">
                    <span className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-[var(--mc-secondary-bright)]" /> {b.title}
                    </span>
                    <span className="mc-num text-[var(--mc-on-surface-variant)] line-through">
                      {b.value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-[rgba(213,189,240,0.15)] text-base font-semibold text-[var(--mc-on-surface)]">
                  <span>Total value</span>
                  <span className="line-through text-[var(--mc-on-surface-variant)]">
                    ₹{totalBonusValue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xl font-extrabold text-[var(--mc-on-surface)]">
                  <span>Today, your seat</span>
                  <span className="text-[var(--mc-secondary-bright)]">{priceLabel}</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(true)}
                className="mc-cta mc-cta-primary relative mt-6 w-full h-12"
              >
                Claim my seat for {priceLabel} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="mc-chip">FAQ</span>
            <h2 className="mc-h-lg mt-4 text-[var(--mc-on-surface)]">Questions, answered</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {s.faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="mc-glass px-5 border-0"
              >
                <AccordionTrigger className="text-left font-bold text-[var(--mc-on-surface)] hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[var(--mc-on-surface-variant)] leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden mc-bg-radial">
        <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-[var(--mc-tertiary)]/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[var(--mc-secondary)]/15 blur-[120px]" />
        <div className="container mx-auto px-5 md:px-8 relative max-w-[1200px]">
          <div className="max-w-2xl mx-auto text-center">
            <span className="mc-chip mc-chip-green">
              <Star className="h-3 w-3" fill="currentColor" /> Final call
            </span>
            <h2 className="mc-h-lg mt-5 text-[var(--mc-on-surface)]">
              Your next 90 days could{" "}
              <span className="text-[var(--mc-secondary-bright)]">change everything</span>
            </h2>
            <p className="mt-5 text-[var(--mc-on-surface-variant)] mc-body-lg">
              Join {s.host_name} live for 2 hours. Walk away with a blueprint, not a plan.
            </p>

            <div className="mt-10 mc-glass-strong p-6 md:p-8">
              <div className="mc-label text-[var(--mc-on-surface-variant)] mb-3">Doors close in</div>
              <div className="flex justify-center">
                <CountdownPill scheduledAt={s.scheduled_at} variant="dark" />
              </div>
              <button
                onClick={() => setOpen(true)}
                className="mc-cta mc-cta-primary mt-6 w-full h-14 text-base"
              >
                {s.is_free ? "Reserve My Free Seat" : `Register Now for ${priceLabel}`}
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="mt-3 text-sm text-[var(--mc-on-surface-variant)] inline-flex items-center justify-center gap-2 w-full">
                <ShieldCheck className="h-4 w-4" />{" "}
                {s.is_free ? "Free · No card needed" : "Secure PayU · 24-hour refund"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-[var(--mc-surface)]/90 border-t border-[rgba(213,189,240,0.15)] px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => setOpen(true)}
          className="mc-cta mc-cta-primary w-full h-12 text-sm"
        >
          {s.is_free ? "Reserve Free Seat" : `Register for ${priceLabel}`}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <RegisterDialog
        open={open}
        onOpenChange={setOpen}
        priceInr={Number(s.price_inr)}
        isFree={s.is_free}
        title={s.title}
      />
    </div>
  );
};

export default Masterclass;
