import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { z } from "zod";
import {
  CalendarDays,
  Clock,
  Video,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  Globe,
  Download,
  Home,
} from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SoftCard from "@/components/ui/SoftCard";
import EyebrowChip from "@/components/ui/EyebrowChip";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARD_BASE, PRIMARY_BTN, SECONDARY_BTN, SECTION_CONTAINER, SECTION_PY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { DIAL_CODES } from "@/lib/dial-codes";
import { buildICS, downloadICS } from "@/lib/ics";
import { Link } from "react-router-dom";

const ALL_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

const COVERED = [
  "Walkthrough of all 4 portals (Admin, Supplier, B2B, B2C)",
  "Contracted inventory & live API capabilities",
  "AI Sales Assistant (Nyra) in action",
  "White-label setup & branding controls",
  "Pricing, GST and subscription model",
  "Live Q&A with our solutions team",
];

const detailsSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  country_code: z.string().min(2),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^\d{6,15}$/, "Enter a valid WhatsApp number (digits only)"),
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .max(255)
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).optional(),
});

type Step = 1 | 2 | 3 | 4;

const FIELD_CLASS =
  "mt-1.5 h-11 rounded-3xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:ring-2 focus-visible:ring-[#412A86]/20 focus-visible:ring-offset-2";

const TEXTAREA_CLASS =
  "mt-1.5 min-h-[90px] rounded-3xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:ring-2 focus-visible:ring-[#412A86]/20 focus-visible:ring-offset-2";

const SELECT_TRIGGER_CLASS =
  "h-11 rounded-3xl border-gray-200 bg-white text-gray-900 [&>span]:text-gray-900 shadow-sm focus:ring-2 focus:ring-[#412A86]/20 focus:ring-offset-2";

const PRIMARY_BUTTON_CLASS = cn(PRIMARY_BTN, "px-6");
const SECONDARY_BUTTON_CLASS = cn(SECONDARY_BTN, "h-11 px-5");

const BookDemo = () => {
  const [step, setStep] = useState<Step>(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState<Record<number, {
    start_time: string;
    end_time: string;
    unavailable_ranges: { start: string; end: string }[];
    is_holiday: boolean;
  }>>({});

  // Form state
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dateStr = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/demo-booked-slots?date=${dateStr}`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string}`,
          },
        });
        const json = await res.json();
        if (Array.isArray(json?.slots)) setBookedSlots(json.slots);
        else setBookedSlots([]);
      } catch (_e) {
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [date, dateStr]);

  // Load schedule settings for slot availability
  useEffect(() => {
    supabase
      .from("demo_schedule_settings")
      .select("day_of_week, start_time, end_time, unavailable_ranges, is_holiday")
      .then(({ data, error }) => {
        if (error) return;
        const map: Record<number, any> = {};
        (data || []).forEach((r: any) => {
          map[r.day_of_week] = {
            start_time: r.start_time || "09:00",
            end_time: r.end_time || "17:00",
            unavailable_ranges: Array.isArray(r.unavailable_ranges) ? r.unavailable_ranges : [],
            is_holiday: Boolean(r.is_holiday),
          };
        });
        setScheduleSettings(map);
      });
  }, []);

  const goNext = () => setStep((s) => (Math.min(4, s + 1) as Step));
  const goBack = () => setStep((s) => (Math.max(1, s - 1) as Step));

  const handleSubmit = async () => {
    if (!date || !time) return;
    const parsed = detailsSchema.safeParse({
      full_name: fullName,
      country_code: countryCode,
      whatsapp_number: whatsapp,
      email: email || undefined,
      notes,
    });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first || "Please check your details");
      return;
    }

    setSubmitting(true);
    const { data: inserted, error } = await supabase
      .from("demo_bookings")
      .insert({
        full_name: parsed.data.full_name,
        country_code: parsed.data.country_code,
        whatsapp_number: parsed.data.whatsapp_number,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
        booking_date: dateStr,
        booking_time: time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        session_id: typeof window !== "undefined" ? sessionStorage.getItem("session_id") : null,
      })
      .select("id")
      .single();
    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("This slot was just booked. Please pick another time.");
        // Refresh and bounce back to time step
        setBookedSlots((prev) => [...prev, time]);
        setTime(undefined);
        setStep(2);
        return;
      }
      toast.error(error.message || "Could not save booking. Please try again.");
      return;
    }
    if (inserted?.id) {
      // Fire-and-forget: schedule Google Meet + send notifications.
      supabase.functions
        .invoke("demo-booking-confirm", { body: { bookingId: inserted.id } })
        .catch((e) => console.error("demo-booking-confirm failed", e));
    }
    toast.success("Demo booked! We'll be in touch on WhatsApp shortly.");
    setStep(4);
  };

  const handleDownloadICS = () => {
    if (!date || !time) return;
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h, m, 0, 0);
    const ics = buildICS({
      title: "Marhaba DMC — Live Demo",
      description: "Live walkthrough of the Marhaba DMC platform.",
      location: "Online (link will be shared on WhatsApp)",
      start,
      durationMinutes: 30,
    });
    downloadICS(`marhaba-demo-${dateStr}-${time}.ics`, ics);
  };

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Book a Free Demo | Marhaba DMC</title>
        <meta
          name="description"
          content="Book a free 30-minute live demo of the Marhaba DMC platform. Pick a date and time that works for you."
        />
        <link rel="canonical" href="https://marhabadmc.com/book-demo" />
      </Helmet>

      <Header />

      <main className="bg-white w-full overflow-hidden">
        {/* Hero band */}
        <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#2D9BFC]/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#B968C7]/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>
          <div className={cn(SECTION_CONTAINER, "max-w-7xl relative")}>
            <div className="text-center max-w-3xl mx-auto">
              <EyebrowChip color="indigo" className="mx-auto">
                <Sparkles className="h-3.5 w-3.5" /> Live Demo
              </EyebrowChip>
              <h1 className="mt-5 font-poppins font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-gray-900 leading-[1.05]">
                See Marhaba DMC <span className="text-[#B968C7]">in action</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Book a free 30-minute personalised walkthrough with our team. Discover how
                agencies are launching white-label travel portals in days, not months.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                {[
                  { icon: Clock, label: "30 minutes" },
                  { icon: Video, label: "1-on-1 call" },
                  { icon: ShieldCheck, label: "100% free" },
                  { icon: CheckCircle2, label: "No card required" },
                ].map((b) => (
                  <span
                    key={b.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-soft text-gray-700"
                  >
                    <b.icon className="h-3.5 w-3.5 text-[#412A86]" />
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Booking grid */}
        <section className={cn(SECTION_PY, "pt-0")}>
          <div className={cn(SECTION_CONTAINER, "max-w-7xl")}>
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* LEFT: Demo overview */}
            <div className="lg:col-span-5">
              <SoftCard className="p-6 sm:p-8 sticky top-24">
                <EyebrowChip color="indigo">About this demo</EyebrowChip>
                <h2 className="mt-4 font-poppins font-extrabold text-2xl sm:text-3xl text-gray-900 leading-tight">
                  Your end-to-end platform tour
                </h2>
                <p className="mt-3 text-gray-600 text-[15px] leading-relaxed">
                  Get a guided walkthrough of every portal, see real inventory, and explore
                  how AI accelerates your team's productivity.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    What we'll cover
                  </div>
                  {COVERED.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-[#412A86]/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#412A86]" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Host card */}
                <div className={cn("mt-7 p-4", CARD_BASE)}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[#412A86]/10 flex items-center justify-center text-[#412A86] font-bold">
                      MD
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Solutions Team</div>
                      <div className="text-xs text-gray-600">Marhaba DMC · Live host</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                  <Globe className="h-3.5 w-3.5" /> Detected timezone: {tz}
                </div>
              </SoftCard>
            </div>

            {/* RIGHT: Wizard */}
            <div className="lg:col-span-7">
              <SoftCard className="p-6 sm:p-8">
                {/* Stepper */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex-1">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-colors",
                          step >= n ? "bg-[#412A86]" : "bg-gray-200",
                        )}
                      />
                      <div className="mt-2 text-[11px] uppercase tracking-wide font-semibold text-gray-500">
                        Step {n} ·{" "}
                        {n === 1 ? "Date" : n === 2 ? "Time" : "Your details"}
                      </div>
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarDays className="h-5 w-5 text-[#412A86]" />
                      <h3 className="font-poppins font-bold text-xl text-gray-900">
                        Pick a date
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose any weekday that works for you.
                    </p>
                    <div className={cn(CARD_BASE, "block w-full overflow-x-auto")}>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (d < today) return true;
                          if (d.getDay() === 0) return true; // Sundays off
                          const max = new Date();
                          max.setDate(max.getDate() + 60);
                          if (d > max) return true;
                          const dow = d.getDay();
                          const daySettings = scheduleSettings[dow];
                          if (daySettings?.is_holiday) return true; // Disable if marked as holiday
                          return false;
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto w-full"
                      />
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={goNext}
                        disabled={!date}
                        className={PRIMARY_BUTTON_CLASS}
                      >
                        Continue <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-[#412A86]" />
                      <h3 className="font-poppins font-bold text-xl text-gray-900">
                        Pick a time
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {date ? format(date, "EEEE, d MMMM yyyy") : ""} · 30-minute slots ·{" "}
                      <span className="text-gray-500">{tz}</span>
                    </p>

                    {loadingSlots ? (
                      <div className="py-12 flex items-center justify-center text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {(() => {
                          if (!date) return null;
                          const dow = date.getDay();
                          const cfg = scheduleSettings[dow] || { start_time: "09:00", end_time: "17:00", unavailable_ranges: [], is_holiday: false };

                          // Normalize time format: strip seconds if present (e.g. "09:00:00" → "09:00")
                          const normalizeTime = (time: string): string => {
                            return time.split(":").slice(0, 2).join(":");
                          };

                          const normalizedStart = normalizeTime(cfg.start_time);
                          const normalizedEnd = normalizeTime(cfg.end_time);

                          // Helper to add 30 minutes to a time string (HH:MM)
                          const addMinutes = (time: string, mins: number): string => {
                            const [h, m] = time.split(":").map(Number);
                            const total = h * 60 + m + mins;
                            const newH = Math.floor(total / 60) % 24;
                            const newM = total % 60;
                            return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
                          };

                          // Generate all 30-minute slots between start and end times
                          const generateSlots = (start: string, end: string): string[] => {
                            const slots: string[] = [];
                            let current = start;
                            while (current < end) {
                              slots.push(current);
                              current = addMinutes(current, 30);
                            }
                            return slots;
                          };

                          const overlapsUnavailable = (t: string): boolean => {
                            // Check if slot [t, t+30min) overlaps with any unavailable range
                            // Two ranges overlap if: range_start < slot_end AND range_end > slot_start
                            const slotEnd = addMinutes(t, 30);
                            for (const r of cfg.unavailable_ranges || []) {
                              if (!r || !r.start || !r.end) continue;
                              const rStart = normalizeTime(r.start);
                              const rEnd = normalizeTime(r.end);
                              if (rStart < slotEnd && rEnd > t) return true; // Overlap detected
                            }
                            return false;
                          };

                          const allSlots = generateSlots(normalizedStart, normalizedEnd);
                          const visibleSlots = allSlots.filter((s) => !overlapsUnavailable(s));

                          return visibleSlots.map((slot) => {
                            const taken = bookedSlots.includes(slot);
                            const selected = time === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={taken}
                                onClick={() => setTime(slot)}
                                className={cn(
                                  "py-2.5 rounded-full text-sm font-semibold border transition-all",
                                  taken &&
                                    "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through",
                                  !taken && !selected &&
                                    "bg-white border-gray-200 text-gray-700 hover:border-[#412A86] hover:text-[#412A86]",
                                  selected &&
                                    "bg-[#412A86] text-white border-[#412A86] shadow-soft",
                                )}
                              >
                                {slot}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        onClick={goBack}
                        className={SECONDARY_BUTTON_CLASS}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                      </Button>
                      <Button
                        onClick={goNext}
                        disabled={!time}
                        className={PRIMARY_BUTTON_CLASS}
                      >
                        Continue <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <UserIcon className="h-5 w-5 text-[#412A86]" />
                      <h3 className="font-poppins font-bold text-xl text-gray-900">
                        Your details
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-5">
                      Booking for{" "}
                      <span className="font-semibold text-gray-900">
                        {date ? format(date, "EEE, d MMM") : ""} at {time}
                      </span>
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">Full name *</Label>
                        <Input
                          id="full_name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className={FIELD_CLASS}
                        />
                      </div>

                      <div>
                        <Label>WhatsApp number *</Label>
                        <div className="mt-1.5 flex gap-2">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className={cn("w-[130px]", SELECT_TRIGGER_CLASS)}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {DIAL_CODES.map((c) => (
                                <SelectItem key={c.code} value={c.dial}>
                                  {c.flag} {c.dial}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            inputMode="numeric"
                            value={whatsapp}
                            onChange={(e) =>
                              setWhatsapp(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="9876543210"
                            className={cn(FIELD_CLASS, "flex-1")}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email (optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className={FIELD_CLASS}
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Anything specific you'd like to see? (optional)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Focus on B2C portal & flight API integration"
                          className={TEXTAREA_CLASS}
                          maxLength={500}
                        />
                      </div>

                      <p className="text-xs text-gray-500">
                        By confirming, you agree to be contacted by our team about this demo.
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        onClick={goBack}
                        className={SECONDARY_BUTTON_CLASS}
                        disabled={submitting}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={cn(PRIMARY_BUTTON_CLASS, "px-7")}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Confirming...
                          </>
                        ) : (
                          <>Confirm Booking</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="text-center py-6">
                    <div className="mx-auto h-16 w-16 rounded-full bg-[#412A86]/10 flex items-center justify-center">
                      <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                    </div>
                    <h3 className="mt-5 font-poppins font-bold text-2xl text-gray-900">
                      You're booked!
                    </h3>
                    <p className="mt-2 text-gray-600">
                      We'll send a confirmation on WhatsApp shortly.
                    </p>

                    <div className="mt-6 max-w-sm mx-auto p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 border border-white text-left">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarDays className="h-4 w-4 text-[#412A86]" />
                        {date ? format(date, "EEEE, d MMMM yyyy") : ""}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-[#412A86]" />
                        {time} · 30 minutes ({tz})
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                        <UserIcon className="h-4 w-4 text-[#412A86]" />
                        {fullName}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        onClick={handleDownloadICS}
                        variant="outline"
                        className={SECONDARY_BUTTON_CLASS}
                      >
                        <Download className="h-4 w-4 mr-1.5" /> Add to calendar
                      </Button>
                      <Link to="/">
                        <Button className={PRIMARY_BUTTON_CLASS}>
                          <Home className="h-4 w-4 mr-1.5" /> Back to home
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </SoftCard>
            </div>
          </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookDemo;