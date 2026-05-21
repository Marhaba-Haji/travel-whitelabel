import { useEffect, useState } from "react";
import { z } from "zod";
import {
  MapPin, Mail, Phone, MessageCircle, Send, Clock, Globe,
  Sparkles, CheckCircle2, Loader2, ArrowRight,
  Facebook, Instagram, Twitter, Linkedin, Headphones,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import EyebrowChip from "@/components/ui/EyebrowChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useContactSettings } from "@/hooks/useContactSettings";
import { useSocialSettings } from "@/hooks/useSocialSettings";
import { supabase } from "@/integrations/supabase/client";
import { DIAL_CODES } from "@/lib/dial-codes";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { breadcrumbSchema, SITE_URL } from "@/lib/seo-schemas";

const enquirySchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  country_code: z.string().min(2),
  phone_number: z.string().trim().regex(/^\d{6,15}$/, "Enter a valid phone number (digits only)"),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(2, "Please enter a subject").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

const FIELD =
  "mt-1.5 h-12 rounded-2xl border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-500 shadow-sm focus-visible:ring-2 focus-visible:ring-[#412A86]/20 focus-visible:ring-offset-2 focus-visible:bg-white transition-colors";
const TEXTAREA_CLS =
  "mt-1.5 min-h-[130px] rounded-2xl border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-500 shadow-sm focus-visible:ring-2 focus-visible:ring-[#412A86]/20 focus-visible:ring-offset-2 focus-visible:bg-white transition-colors";
const SEL_TRIGGER =
  "h-12 rounded-2xl border-gray-200 bg-gray-50/50 text-gray-900 [&>span]:text-gray-900 shadow-sm focus:ring-2 focus:ring-[#412A86]/20 focus:ring-offset-2";

const socialIcons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, x: Twitter } as const;

const CARD_COLORS = [
  { bg: "bg-[#412A86]/8", icon: "text-[#412A86]", ring: "group-hover:ring-[#412A86]/20" },
  { bg: "bg-blue-500/8", icon: "text-blue-600", ring: "group-hover:ring-blue-500/20" },
  { bg: "bg-emerald-500/8", icon: "text-emerald-600", ring: "group-hover:ring-emerald-500/20" },
  { bg: "bg-amber-500/8", icon: "text-amber-600", ring: "group-hover:ring-amber-500/20" },
];

const Contact = () => {
  const { whatsapp, phone, email, address, whatsappUrl, isLoading } = useContactSettings();
  const { socialLinks } = useSocialSettings();

  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = enquirySchema.safeParse({
      full_name: fullName, country_code: countryCode, phone_number: phoneNumber,
      email: emailInput, subject, message,
    });
    if (!parsed.success) {
      toast.error(Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] || "Please check your details");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_enquiries").insert({
      name: parsed.data.full_name,
      email: parsed.data.email,
      phone: `${parsed.data.country_code} ${parsed.data.phone_number}`,
      message: `[${parsed.data.subject}]\n\n${parsed.data.message}`,
      landing_page: window.location.pathname,
      session_id: typeof window !== "undefined" ? sessionStorage.getItem("session_id") : null,
    });
    setSubmitting(false);
    if (error) { toast.error("Could not send your message. Please try again."); return; }
    toast.success("Message sent! We'll get back to you shortly.");
    setSubmitted(true);
  };

  const contactCards = [
    { icon: Phone, label: "Call Us", value: phone || whatsapp || "Loading…", href: phone ? `tel:${phone}` : whatsapp ? `tel:${whatsapp}` : undefined, desc: "Speak directly with our team" },
    { icon: Mail, label: "Email Us", value: email || "Loading…", href: email ? `mailto:${email}` : undefined, desc: "We respond within 24 hours" },
    { icon: MessageCircle, label: "WhatsApp", value: whatsapp || "Loading…", href: whatsappUrl, desc: "Quick support on WhatsApp" },
    { icon: MapPin, label: "Visit Us", value: address || "Loading…", href: undefined, desc: "Our head office" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Us"
        description="Get in touch with Marhaba DMC. Call, email, WhatsApp, or visit our office. We're here to help you start and scale your halal travel business."
        path="/contact"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Contact", url: `${SITE_URL}/contact` },
        ])}
      />

      <Header />

      <main className="bg-white w-full overflow-hidden">
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
          {/* Decorative blurs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 left-1/3 h-[420px] w-[420px] rounded-full bg-[#412A86]/6 blur-[100px]" />
            <div className="absolute -bottom-20 right-1/4 h-[350px] w-[350px] rounded-full bg-[#2D9BFC]/8 blur-[100px]" />
            <div className="absolute top-1/2 left-0 h-[250px] w-[250px] rounded-full bg-[#B968C7]/6 blur-[80px]" />
          </div>
          {/* Decorative dashed travel path */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
            <svg viewBox="0 0 1440 500" className="w-full h-full" fill="none">
              <path d="M -50 250 C 200 80 600 400 900 180 S 1500 250 1500 250" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
            </svg>
          </div>

          <div className="container mx-auto px-4 relative max-w-7xl">
            <div className="text-center max-w-3xl mx-auto">
              <EyebrowChip color="indigo" className="mx-auto">
                Get In Touch
              </EyebrowChip>

              <h1 className="mt-6 font-poppins font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-gray-900 leading-[1.08]">
                Let's start a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#412A86] via-[#B968C7] to-[#2D9BFC]">
                  conversation
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Whether you're a travel agent looking to partner with us, or have questions
                about our platform — our team is ready to help you succeed.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                {[
                  { icon: Clock, label: "6-day support" },
                  { icon: Headphones, label: "Dedicated team" },
                  { icon: Globe, label: "Global reach" },
                  { icon: CheckCircle2, label: "24hr response" },
                ].map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-gray-100 shadow-sm text-gray-600 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                    <b.icon className="h-3.5 w-3.5 text-[#412A86]" />
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CONTACT CARDS ═══ */}
        <section className="pb-20 -mt-4">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {contactCards.map((card, i) => {
                const color = CARD_COLORS[i];
                return (
                  <div
                    key={card.label}
                    className={cn(
                      "group relative rounded-3xl bg-white border border-gray-100 shadow-sm p-6 text-center",
                      "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ring-2 ring-transparent",
                      color.ring
                    )}
                  >
                    {/* Accent bar top */}
                    <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full transition-all duration-300 group-hover:w-20", color.bg.replace("/8", ""))} />

                    <div className={cn("mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110", color.bg)}>
                      <card.icon className={cn("h-6 w-6", color.icon)} />
                    </div>
                    <h3 className="font-poppins font-bold text-gray-900 text-lg mb-1">{card.label}</h3>
                    <p className="text-xs text-gray-500 mb-3">{card.desc}</p>
                    {card.href ? (
                      <a
                        href={card.href}
                        target={card.href.startsWith("http") ? "_blank" : undefined}
                        rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className={cn("text-sm font-semibold hover:underline underline-offset-2 break-all", color.icon)}
                      >
                        {isLoading ? "Loading…" : card.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{isLoading ? "Loading…" : card.value}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ FORM + SIDEBAR ═══ */}
        <section className="py-24 relative">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/80 to-white" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="container mx-auto px-4 max-w-7xl relative">
            {/* Section header */}
            <div className="text-center mb-14">
              <EyebrowChip color="cyan" className="mx-auto">Send a Message</EyebrowChip>
              <h2 className="mt-4 font-poppins font-black text-3xl sm:text-4xl text-gray-900">
                Drop us a <span className="text-[#B968C7]">line</span>
              </h2>
              <p className="mt-3 text-gray-500 max-w-lg mx-auto">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
              {/* LEFT — Form */}
              <div className="lg:col-span-7">
                <div className="rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/40 p-7 sm:p-10 relative overflow-hidden">
                  {/* Decorative corner gradient */}
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#412A86]/5 to-[#2D9BFC]/5 blur-2xl pointer-events-none" />

                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <Label htmlFor="contact_name" className="text-sm font-semibold text-gray-700">Full name *</Label>
                          <Input id="contact_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className={FIELD} />
                        </div>
                        <div>
                          <Label htmlFor="contact_email" className="text-sm font-semibold text-gray-700">Email *</Label>
                          <Input id="contact_email" type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="you@company.com" className={FIELD} />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Phone number *</Label>
                        <div className="mt-1.5 flex gap-2">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className={cn("w-[130px]", SEL_TRIGGER)}><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-72">
                              {DIAL_CODES.map((c) => (<SelectItem key={c.code} value={c.dial}>{c.flag} {c.dial}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <Input inputMode="numeric" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" className={cn(FIELD, "flex-1")} />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="contact_subject" className="text-sm font-semibold text-gray-700">Subject *</Label>
                        <Input id="contact_subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Partnership inquiry, pricing question…" className={FIELD} />
                      </div>

                      <div>
                        <Label htmlFor="contact_message" className="text-sm font-semibold text-gray-700">Message *</Label>
                        <Textarea id="contact_message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us more about what you need…" className={TEXTAREA_CLS} maxLength={2000} />
                        <p className="mt-1.5 text-xs text-gray-500 text-right">{message.length}/2000</p>
                      </div>

                      <Button
                        type="submit" disabled={submitting}
                        className="h-13 rounded-full px-10 bg-[#412A86] hover:bg-[#412A86]/90 text-white font-semibold shadow-lg shadow-[#412A86]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto text-base"
                      >
                        {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>) : (<><Send className="h-4 w-4 mr-2" /> Send Message</>)}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-16 relative">
                      <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                      </div>
                      <h3 className="font-poppins font-black text-3xl text-gray-900">Message sent!</h3>
                      <p className="mt-3 text-gray-500 max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
                      </p>
                      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Button
                          onClick={() => { setSubmitted(false); setFullName(""); setEmailInput(""); setPhoneNumber(""); setSubject(""); setMessage(""); }}
                          variant="outline"
                          className="h-12 rounded-full px-6 border-gray-200 hover:border-[#412A86]/30 font-semibold transition-all"
                        >Send another message</Button>
                        <Link to="/">
                          <Button className="h-12 rounded-full px-6 bg-[#412A86] hover:bg-[#412A86]/90 text-white font-semibold shadow-lg transition-all">
                            Back to home <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT — Sidebar */}
              <div className="lg:col-span-5 space-y-5">
                {/* Office Hours */}
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-cyan-600" />
                    </div>
                    <h3 className="font-poppins font-bold text-lg text-gray-900">Office Hours</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { day: "Monday – Friday", time: "9:00 AM – 6:00 PM", active: true },
                      { day: "Saturday", time: "10:00 AM – 4:00 PM", active: true },
                      { day: "Sunday", time: "Closed", active: false },
                    ].map((row) => (
                      <div key={row.day} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-600">{row.day}</span>
                        <span className={cn("text-sm font-semibold", row.active ? "text-gray-900" : "text-gray-500")}>{row.time}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                      <Globe className="h-3.5 w-3.5" /> IST (UTC +5:30)
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="rounded-3xl border border-emerald-100 shadow-sm p-6 sm:p-7 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-poppins font-bold text-lg text-gray-900">WhatsApp</h3>
                        <p className="text-xs text-emerald-600 font-medium">Usually responds in minutes</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Need an immediate answer? Chat with our team directly for the fastest response.
                    </p>
                    <a
                      href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all w-full"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </div>
                </div>

                {/* Social */}
                {socialLinks.length > 0 && (
                  <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-7">
                    <h3 className="font-poppins font-bold text-lg text-gray-900 mb-4">Follow us</h3>
                    <div className="flex gap-3">
                      {socialLinks.map(({ platform, url, label }) => {
                        const Icon = socialIcons[platform];
                        if (!Icon) return null;
                        return (
                          <a key={platform} href={url} target="_blank" rel="noreferrer" aria-label={label}
                            className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#412A86] hover:text-white hover:border-[#412A86] hover:shadow-lg hover:shadow-[#412A86]/20 hover:-translate-y-0.5 transition-all duration-200"
                          ><Icon className="w-5 h-5" /></a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Book Demo CTA */}
                <div className="rounded-3xl border border-[#412A86]/10 shadow-sm p-6 sm:p-7 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-blue-50/50 to-violet-50/30 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-[#412A86]/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-[#412A86]" />
                      </div>
                      <h3 className="font-poppins font-bold text-lg text-gray-900">Live walkthrough</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Book a free 30-minute demo and see the entire platform in action.
                    </p>
                    <Link
                      to="/book-demo"
                      className="flex items-center justify-center h-12 rounded-full bg-[#412A86] hover:bg-[#412A86]/90 text-white font-semibold shadow-lg shadow-[#412A86]/20 hover:shadow-xl transition-all w-full"
                    >Book a Demo <ArrowRight className="h-4 w-4 ml-2" /></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
