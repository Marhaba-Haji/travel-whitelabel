import { useEffect, useState } from "react";
import {
  Plane, BedDouble, MapPin, Utensils, ShieldCheck, Luggage, CalendarDays, Sparkles,
  Check, X, Users, Star, Clock, Gift, MessageCircle, ChevronDown, Building2, Droplets, Shirt,
} from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import UmrahCountdown from "@/components/umrah/UmrahCountdown";
import UmrahEnquiryForm from "@/components/umrah/UmrahEnquiryForm";
import { useContactSettings } from "@/hooks/useContactSettings";
import { UMRAH, inr, savings, totalWithTaxes } from "@/lib/umrah-package";
import heroImg from "@/assets/umrah-hero-makkah.jpg";
import { SITE_URL } from "@/lib/seo-schemas";
import "@/styles/marhaba-haji.css";

const scrollToBook = () => {
  document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Section = ({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`py-14 sm:py-20 ${className}`}>
    <div className="container mx-auto px-4 max-w-6xl">{children}</div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="mh-label text-[var(--mh-gold)]">{children}</p>
);

const UmrahPackage = () => {
  const { whatsappUrlWithMessage } = useContactSettings();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showBar, setShowBar] = useState(false);
  const [booking, setBooking] = useState<{ state: string; order: string } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const state = q.get("booking");
    if (state === "success" || state === "failed") {
      setBooking({ state, order: q.get("order") || "" });
      window.history.replaceState({}, "", UMRAH.route);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 520);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waUrl = whatsappUrlWithMessage(
    `Assalamu alaikum, I'm interested in the ${UMRAH.title} (${UMRAH.departLabel} – ${UMRAH.returnLabel}) at ${inr(UMRAH.offerPrice)}. Please share the details.`,
  );

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${UMRAH.title} — ${UMRAH.brand}`,
      description: `14-day guided group Umrah from Bangalore departing ${UMRAH.departLabel}. Saudia direct flight, 9 days Makkah, 5 days Madinah, hotels close to the Haramain, all ziyarats included.`,
      brand: { "@type": "Brand", name: UMRAH.brand },
      offers: {
        "@type": "Offer",
        price: UMRAH.offerPrice,
        priceCurrency: "INR",
        availability: "https://schema.org/LimitedAvailability",
        url: `${SITE_URL}${UMRAH.route}`,
        priceValidUntil: "2026-08-25",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: UMRAH.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const glance = [
    { icon: CalendarDays, t: `${UMRAH.nights} days`, s: `${UMRAH.departLabel} – ${UMRAH.returnLabel}` },
    { icon: Plane, t: UMRAH.airline, s: `${UMRAH.flightNote}, no stopovers` },
    { icon: Luggage, t: UMRAH.baggage, s: "Generous baggage allowance" },
    { icon: Building2, t: `${UMRAH.makkahDays} days Makkah`, s: UMRAH.makkahDistance },
    { icon: Building2, t: `${UMRAH.madinahDays} days Madinah`, s: UMRAH.madinahDistance },
    { icon: Sparkles, t: UMRAH.umrahOpportunities, s: "Including Umrah from Jorana" },
    { icon: Utensils, t: "Buffet 3 times a day", s: "Indian-friendly menu" },
    { icon: ShieldCheck, t: "1-year multi-entry visa", s: "Travel again within validity" },
  ];

  return (
    <div className="mh-scope min-h-screen">
      <SEOHead
        title={`Group Umrah from Bangalore — ${UMRAH.departLabel} | ${inr(UMRAH.offerPrice)} | Marhaba Haji`}
        description={`14-day guided group Umrah departing Bangalore ${UMRAH.departLabel}. Saudia direct flight, 40kg baggage, 9 days Makkah + 5 days Madinah near the Haramain, all ziyarats, buffet meals. ${inr(UMRAH.offerPrice)} per person.`}
        path={UMRAH.route}
        jsonLd={jsonLd}
      />

      {booking && (
        <div
          role="status"
          className={`sticky top-0 z-[60] text-center text-sm font-semibold py-3 px-4 ${
            booking.state === "success"
              ? "bg-[var(--mh-green)] text-[#f6ecd4]"
              : "bg-[var(--mh-red)] text-white"
          }`}
        >
          {booking.state === "success"
            ? `Booking amount received. Your seat is reserved — order ${booking.order}. Our Umrah desk will call you with the next steps.`
            : `Payment could not be completed${booking.order ? ` (order ${booking.order})` : ""}. Please try again or reach us on WhatsApp.`}
        </div>
      )}

      {/* Sticky urgency bar */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ${showBar ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="bg-[var(--mh-green-deep)] text-[#f6ecd4]">
          <div className="container mx-auto px-4 max-w-6xl py-2.5 flex items-center justify-between gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-[var(--mh-gold)] mh-live-dot" />
              Only {UMRAH.seatsLeft} seats left · closes {UMRAH.deadlineLabel}
            </div>
            <UmrahCountdown deadlineISO={UMRAH.deadlineISO} dark className="scale-90 origin-left" />
            <button className="mh-btn mh-btn-gold !py-2.5 !px-5 text-sm" onClick={scrollToBook}>
              Book now
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <header className="mh-hero-bg pt-10 pb-14 sm:pt-16 sm:pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 mb-8">
            <span className="mh-display text-xl font-bold text-[var(--mh-green)]">Marhaba Haji</span>
            <span className="text-[11px] text-[var(--mh-ink-soft)] border-l border-[var(--mh-line)] pl-2">
              by {UMRAH.legalEntity}
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
            <div>
              <Eyebrow>Bangalore departure · September 2026</Eyebrow>
              <h1 className="mh-h1 mt-3">
                14 Days of Umrah, <span className="text-[var(--mh-green)]">guided from start to finish</span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--mh-ink-soft)] mt-4 max-w-xl">
                {UMRAH.departLabel} – {UMRAH.returnLabel}. Saudia direct flight, {UMRAH.makkahDays} days in Makkah and{" "}
                {UMRAH.madinahDays} days in Madinah — both hotels a short walk from the Haramain, with every
                ziyarat, meal and transfer arranged for you.
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                <span className="mh-chip"><Plane className="h-3.5 w-3.5" /> Direct Saudia flight</span>
                <span className="mh-chip"><Luggage className="h-3.5 w-3.5" /> 40kg + 7kg baggage</span>
                <span className="mh-chip"><ShieldCheck className="h-3.5 w-3.5" /> 1-year multi-entry visa</span>
                <span className="mh-chip"><Utensils className="h-3.5 w-3.5" /> 3 buffet meals daily</span>
              </div>

              <div className="mh-card-dark mt-8 p-6 sm:p-7">
                <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                  <span className="text-[#f6ecd4]/60 line-through text-lg">{inr(UMRAH.listPrice)}</span>
                  <span className="mh-display text-4xl sm:text-5xl font-bold text-[var(--mh-gold)]">
                    {inr(UMRAH.offerPrice)}
                  </span>
                  <span className="text-[#f6ecd4]/75 text-sm pb-1">per person</span>
                  <span className="mh-chip mh-chip-gold ml-auto">Save {inr(savings)}</span>
                </div>
                <p className="text-[13px] text-[#f6ecd4]/70 mt-3">
                  Quad or quint sharing. GST {UMRAH.gstPercent}% and TCS {UMRAH.tcsPercent}% extra
                  (approx. {inr(totalWithTaxes(UMRAH.offerPrice))} all-in). Triple and double rooms are private rooms.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button className="mh-btn mh-btn-gold flex-1" onClick={scrollToBook}>
                    Reserve my seat
                  </button>
                  <a className="mh-btn mh-btn-wa flex-1" href={waUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp us
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-sm text-[var(--mh-ink-soft)]">
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> Small guided group</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4" /> Expert scholar with the group</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> Bookings close {UMRAH.deadlineLabel}</span>
              </div>
            </div>

            <div className="relative">
              <img
                src={heroImg}
                width={1280}
                height={1600}
                alt="Pilgrims performing tawaf around the Kaaba at Masjid al-Haram in Makkah at golden hour"
                fetchPriority="high"
                className="rounded-3xl w-full h-[420px] lg:h-[560px] object-cover shadow-[0_30px_70px_-40px_rgba(8,48,30,0.6)]"
              />
              <div className="mh-card absolute -bottom-6 left-4 right-4 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="mh-label text-[var(--mh-ink-soft)]">Bookings close in</p>
                  <UmrahCountdown deadlineISO={UMRAH.deadlineISO} className="mt-1" />
                </div>
                <span className="mh-chip mh-chip-gold whitespace-nowrap">{UMRAH.seatsLeft} seats left</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SEATS / URGENCY */}
      <Section className="!pt-8">
        <div className="mh-card p-6 sm:p-8">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{UMRAH.seatsTotal - UMRAH.seatsLeft} of {UMRAH.seatsTotal} seats already booked</span>
                <span className="text-[var(--mh-red)]">Only {UMRAH.seatsLeft} left</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--mh-green-light)] mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--mh-green)] to-[var(--mh-gold)]"
                  style={{ width: `${((UMRAH.seatsTotal - UMRAH.seatsLeft) / UMRAH.seatsTotal) * 100}%` }}
                />
              </div>
              <p className="text-sm text-[var(--mh-ink-soft)] mt-3">
                Seats are released in the order booking amounts are received. Visa and ticketing close on{" "}
                {UMRAH.deadlineLabel}.
              </p>
            </div>
            <div className="mh-card !shadow-none border-dashed p-5 text-center bg-[var(--mh-gold-soft)]">
              <Gift className="h-6 w-6 mx-auto text-[var(--mh-gold)]" />
              <p className="font-bold mt-2">Travelling with {UMRAH.groupDiscountMin}+ people?</p>
              <p className="text-sm text-[var(--mh-ink-soft)] mt-1">
                Families and groups of {UMRAH.groupDiscountMin} or more get a further special discount on top of the
                offer price.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* AT A GLANCE */}
      <Section>
        <Eyebrow>The package at a glance</Eyebrow>
        <h2 className="mh-h2 mt-2">Everything is arranged. You only focus on ibadah.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {glance.map((g) => (
            <div key={g.t} className="mh-card p-5">
              <g.icon className="h-6 w-6 text-[var(--mh-green)]" />
              <p className="font-bold mt-3 leading-snug">{g.t}</p>
              <p className="text-sm text-[var(--mh-ink-soft)] mt-1">{g.s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* STAY */}
      <Section className="bg-white border-y border-[var(--mh-line)]">
        <Eyebrow>Where you stay</Eyebrow>
        <h2 className="mh-h2 mt-2">Walking distance from both Haramain</h2>
        <div className="grid md:grid-cols-2 gap-5 mt-8">
          {[
            {
              city: "Makkah",
              days: `${UMRAH.makkahDays} days`,
              hotel: UMRAH.makkahHotel,
              dist: UMRAH.makkahDistance,
              points: ["Walk to the Haram for every salah", "Buffet meals in the hotel", "Makkah ziyarat + Jorana Umrah"],
            },
            {
              city: "Madinah",
              days: `${UMRAH.madinahDays} days`,
              hotel: UMRAH.madinahHotel,
              dist: UMRAH.madinahDistance,
              points: ["Inside the Markaziya (central) zone", "Riyadh-ul-Jannah guidance from our team", "Madinah, Uhud and Badr ziyarat"],
            },
          ].map((h) => (
            <div key={h.city} className="mh-card p-6">
              <div className="flex items-center justify-between">
                <h3 className="mh-h3">{h.city}</h3>
                <span className="mh-chip">{h.days}</span>
              </div>
              <p className="flex items-start gap-2 mt-4 font-semibold">
                <BedDouble className="h-5 w-5 text-[var(--mh-green)] shrink-0" /> {h.hotel}
              </p>
              <p className="flex items-start gap-2 mt-2 text-sm text-[var(--mh-ink-soft)]">
                <MapPin className="h-4 w-4 text-[var(--mh-gold)] shrink-0 mt-0.5" /> {h.dist}
              </p>
              <ul className="mt-4 space-y-2">
                {h.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-[var(--mh-green)] shrink-0 mt-0.5" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mh-card p-6 mt-5">
          <div className="grid sm:grid-cols-3 gap-5 text-sm">
            <div>
              <p className="mh-label text-[var(--mh-ink-soft)]">Departure</p>
              <p className="font-bold mt-1">{UMRAH.departLabel} · Bangalore</p>
            </div>
            <div>
              <p className="mh-label text-[var(--mh-ink-soft)]">Airline</p>
              <p className="font-bold mt-1">{UMRAH.airline} · {UMRAH.flightNote}</p>
            </div>
            <div>
              <p className="mh-label text-[var(--mh-ink-soft)]">Return</p>
              <p className="font-bold mt-1">{UMRAH.returnLabel} · Bangalore</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ROOMS & PRICING */}
      <Section>
        <Eyebrow>Room options</Eyebrow>
        <h2 className="mh-h2 mt-2">Sharing or a private room for your family</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {UMRAH.rooms.map((r) => (
            <div key={r.type} className={`mh-card p-5 ${r.price ? "border-[var(--mh-gold)]" : ""}`}>
              <span className="mh-chip mh-chip-gold">{r.tag}</span>
              <h3 className="mh-h3 mt-3">{r.type}</h3>
              <p className="text-sm text-[var(--mh-ink-soft)] mt-1">{r.occupancy}</p>
              <p className="mh-display text-2xl font-bold mt-4 text-[var(--mh-green)]">
                {r.price ? inr(r.price) : "On request"}
              </p>
              <p className="text-xs text-[var(--mh-ink-soft)] mt-1">
                {r.price ? "per person + GST & TCS" : "Private room — ask for the rate"}
              </p>
              <button className="mh-btn mh-btn-ghost w-full mt-4 !py-2.5" onClick={scrollToBook}>
                Select
              </button>
            </div>
          ))}
        </div>
        <p className="text-sm text-[var(--mh-ink-soft)] mt-5">
          Quad and quint rooms are shared with other pilgrims of the same gender. Triple and double bed rooms are
          allotted as private rooms and are never shared with strangers. GST {UMRAH.gstPercent}% and TCS{" "}
          {UMRAH.tcsPercent}% are applicable extra on all rooms.
        </p>
      </Section>

      {/* ZIYARAT */}
      <Section className="bg-white border-y border-[var(--mh-line)]">
        <Eyebrow>Guided ziyarat programme</Eyebrow>
        <h2 className="mh-h2 mt-2">Five ziyarats, explained by scholars who know the seerah</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          {UMRAH.ziyarats.map((z, i) => (
            <div key={z.city} className="mh-card p-5">
              <span className="mh-display text-3xl font-bold text-[var(--mh-gold)]/60">0{i + 1}</span>
              <h3 className="mh-h3 mt-2">{z.city}</h3>
              <p className="text-sm text-[var(--mh-ink-soft)] mt-1.5">{z.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* INCLUSIONS / EXCLUSIONS */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="mh-card p-6 sm:p-7">
            <h2 className="mh-h3 flex items-center gap-2">
              <Check className="h-5 w-5 text-[var(--mh-green)]" /> What's included
            </h2>
            <ul className="mt-5 grid sm:grid-cols-2 gap-x-5 gap-y-2.5">
              {UMRAH.inclusions.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-[var(--mh-green)] shrink-0 mt-0.5" /> {i}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mt-5">
              <span className="mh-chip"><Droplets className="h-3.5 w-3.5" /> Zamzam</span>
              <span className="mh-chip"><Shirt className="h-3.5 w-3.5" /> Laundry</span>
              <span className="mh-chip"><Utensils className="h-3.5 w-3.5" /> Buffet ×3 daily</span>
            </div>
          </div>

          <div className="mh-card p-6 sm:p-7">
            <h2 className="mh-h3 flex items-center gap-2">
              <X className="h-5 w-5 text-[var(--mh-red)]" /> What's not included
            </h2>
            <ul className="mt-5 space-y-2.5">
              {UMRAH.exclusions.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--mh-ink-soft)]">
                  <X className="h-4 w-4 text-[var(--mh-red)]/70 shrink-0 mt-0.5" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* SECRET GUEST */}
      <Section>
        <div className="mh-card-dark p-8 sm:p-12 text-center">
          <span className="mh-chip mh-chip-gold">Secret bonus for this group</span>
          <h2 className="mh-h2 mt-5 text-[#f6ecd4]">
            One well-known guest is travelling with this group
          </h2>
          <p className="text-[#f6ecd4]/75 max-w-2xl mx-auto mt-4">
            A widely followed Muslim personality from Bangalore — over 1.2 million followers — will perform Umrah
            along with this jamaat. We are keeping the name a surprise for confirmed pilgrims only. Book your seat and
            our team will reveal it to you privately.
          </p>
          <button className="mh-btn mh-btn-gold mt-7" onClick={scrollToBook}>
            Book a seat and find out
          </button>
        </div>
      </Section>

      {/* WHY */}
      <Section className="bg-white border-y border-[var(--mh-line)]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <Eyebrow>Why Marhaba Haji</Eyebrow>
            <h2 className="mh-h2 mt-2">A Hajj &amp; Umrah specialist, not a general travel agency</h2>
            <p className="text-[var(--mh-ink-soft)] mt-4">
              Marhaba Haji is the Hajj and Umrah brand of {UMRAH.legalEntity}. Every group is small, escorted and led by
              people who have made the journey many times — so first-timers, elders and families are never left guessing.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Users, t: "Escorted group", s: "Our team travels with you from Bangalore and back." },
              { icon: Building2, t: "Haramain-close hotels", s: "500 m in Makkah, 200 m in Madinah — no long walks." },
              { icon: Sparkles, t: "Scholar-guided", s: "Duas, rites and ziyarat history explained on the spot." },
              { icon: ShieldCheck, t: "Transparent pricing", s: "One price, taxes stated upfront, no hidden extras." },
            ].map((c) => (
              <div key={c.t} className="mh-card p-5">
                <c.icon className="h-6 w-6 text-[var(--mh-green)]" />
                <p className="font-bold mt-3">{c.t}</p>
                <p className="text-sm text-[var(--mh-ink-soft)] mt-1">{c.s}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* BOOK */}
      <Section id="book" className="scroll-mt-24">
        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-10 items-start">
          <div>
            <Eyebrow>Three ways to book</Eyebrow>
            <h2 className="mh-h2 mt-2">Confirm your seat before {UMRAH.deadlineLabel}</h2>
            <p className="text-[var(--mh-ink-soft)] mt-4">
              Send an enquiry and our Umrah desk will call you, message us directly on WhatsApp, or pay the{" "}
              {inr(UMRAH.advanceAmount)} booking amount right now to lock one of the remaining {UMRAH.seatsLeft} seats.
            </p>

            <div className="mh-card p-5 mt-6">
              <p className="mh-label text-[var(--mh-ink-soft)]">Bookings close in</p>
              <UmrahCountdown deadlineISO={UMRAH.deadlineISO} className="mt-2" />
            </div>

            <a className="mh-btn mh-btn-wa w-full mt-4" href={waUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Chat with our Umrah desk on WhatsApp
            </a>

            <div className="mh-card p-5 mt-4">
              <p className="text-sm">
                <strong>Payment schedule:</strong> {inr(UMRAH.advanceAmount)} per person confirms your seat. The
                balance of {inr(UMRAH.offerPrice - UMRAH.advanceAmount)} plus GST and TCS is payable before ticketing
                and visa processing.
              </p>
            </div>
          </div>

          <UmrahEnquiryForm />
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-white border-t border-[var(--mh-line)]">
        <Eyebrow>Questions pilgrims ask us</Eyebrow>
        <h2 className="mh-h2 mt-2">Frequently asked questions</h2>
        <div className="mt-8 space-y-3 max-w-3xl">
          {UMRAH.faqs.map((f, i) => (
            <div key={f.q} className="mh-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between gap-4 text-left p-5"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <p className="px-5 pb-5 -mt-1 text-sm text-[var(--mh-ink-soft)]">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="bg-[var(--mh-green-deep)] text-[#f6ecd4]/80 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="mh-display text-xl font-bold text-[#f6ecd4]">Marhaba Haji</p>
          <p className="text-sm mt-2 max-w-xl">
            A Hajj &amp; Umrah brand of {UMRAH.legalEntity}. Prices are per person and subject to availability,
            airline fare changes and Saudi authority regulations. GST {UMRAH.gstPercent}% and TCS {UMRAH.tcsPercent}%
            applicable extra.
          </p>
          <div className="flex flex-wrap gap-5 text-sm mt-6">
            <a href="/terms-of-service" className="hover:text-[var(--mh-gold)]">Terms of Service</a>
            <a href="/privacy-policy" className="hover:text-[var(--mh-gold)]">Privacy Policy</a>
            <a href="/refund-policy" className="hover:text-[var(--mh-gold)]">Refund Policy</a>
            <a href="/contact" className="hover:text-[var(--mh-gold)]">Contact</a>
          </div>
          <p className="text-xs mt-8 text-[#f6ecd4]/50">
            © {new Date().getFullYear()} {UMRAH.legalEntity}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white border-t border-[var(--mh-line)] p-3 flex gap-2">
        <a className="mh-btn mh-btn-wa flex-1 !py-3 text-sm" href={waUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <button className="mh-btn mh-btn-primary flex-1 !py-3 text-sm" onClick={scrollToBook}>
          Reserve seat
        </button>
      </div>
      <div className="h-16 sm:hidden" />
    </div>
  );
};

export default UmrahPackage;
