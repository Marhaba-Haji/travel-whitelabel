import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, MessageCircle, Shield, Lock, CreditCard, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useContactSettings } from "@/hooks/useContactSettings";
import { useSocialSettings } from "@/hooks/useSocialSettings";
import AuroraLogo from "@/components/AuroraLogo";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  x: Twitter,
};

const Footer = () => {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation();
  const { whatsappUrl, phone, email, address } = useContactSettings();
  const { socialLinks } = useSocialSettings();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const [contactLoading, setContactLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: json.error || "Failed to send",
          description: json.message || "Please try again.",
        });
        return;
      }
      toast({
        title: "Message Sent!",
        description: json.message || "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: "Please try again or contact us directly.",
      });
    } finally {
      setContactLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: json.error || "Failed to subscribe",
          description: json.message || "Please try again.",
        });
        return;
      }
      toast({
        title: "Subscribed!",
        description: json.message || "Thank you for subscribing to our newsletter.",
      });
      setNewsletterEmail("");
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to subscribe",
        description: "Please try again later.",
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const quickLinks = [
    { name: "About", href: "/about", isPage: true },
    { name: "Features", href: "#features" },
    { name: "Portals", href: "#portals" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];


  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contact" className="relative overflow-hidden">
      {/* Aurora gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(270_70%_58%_/_0.12),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(210_100%_50%_/_0.08),_transparent_50%)]" />
      <div className="relative text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div
            ref={formRef}
            className={`opacity-0 ${formVisible ? "animate-fade-in-left" : ""}`}
          >
            <h3 className="text-2xl font-bold mb-2">Get in Touch</h3>
            <p className="text-muted-foreground mb-6">
              Have questions? Fill out the form and our team will get back to you within 24 hours.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-foreground/90">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    maxLength={100}
                    className="glass border-white/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground/90">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    maxLength={255}
                    className="glass border-white/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground/90">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  maxLength={20}
                  className="glass border-white/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-foreground/90">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements..."
                  rows={4}
                  required
                  maxLength={1000}
                  className="glass border-white/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" size="lg" variant="secondary" className="w-full sm:w-auto" disabled={contactLoading}>
                {contactLoading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Info & Links */}
          <div
            ref={infoRef}
            className={`lg:pl-8 opacity-0 ${infoVisible ? "animate-fade-in-right" : ""}`}
          >
            <div className="mb-8">
              <div className="mb-4">
                <AuroraLogo size="sm" />
              </div>
              <p className="text-muted-foreground mb-6">
                Travel Entrepreneurs Start Here — Launch your own travel business with complete training and support.
              </p>

              {/* Newsletter Signup */}
              <div className="glass rounded-xl p-4">
                <h4 className="font-semibold mb-2">Subscribe to Our Newsletter</h4>
                <p className="text-muted-foreground text-sm mb-3">Get the latest updates, tips, and industry insights.</p>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    maxLength={255}
                    className="glass border-white/20 text-foreground placeholder:text-muted-foreground flex-1"
                  />
                  <Button type="submit" variant="secondary" size="icon" className="shrink-0" disabled={newsletterLoading}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 mb-8">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp: {phone}</span>
              </a>
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>{email}</span>
              </a>
              {address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <span>{address}</span>
                </a>
              )}
            </div>

            {/* Quick Links & Social */}
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="flex flex-wrap gap-4">
                  {quickLinks.map((link) => (
                    link.isPage ? (
                      <a
                        key={link.name}
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <button
                        key={link.name}
                        onClick={() => scrollToSection(link.href)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Follow Us</h4>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => {
                      const Icon = socialIcons[social.platform];
                      return Icon ? (
                        <a
                          key={social.platform}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                          aria-label={social.label}
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            {/* Security Badges */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5" />
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-5 h-5" />
              <span className="text-sm">256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Secure Payments</span>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-white/20" />
            
            {/* Payment Icons */}
            <div className="flex items-center gap-2">
              <div className="glass rounded px-2 py-1">
                <span className="text-[10px] font-bold text-foreground/80 tracking-wider">VISA</span>
              </div>
              <div className="glass rounded px-2 py-1 flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-foreground/40 -ml-1" />
              </div>
              <div className="glass rounded px-2 py-1">
                <span className="text-[10px] font-bold text-foreground/80">UPI</span>
              </div>
              <div className="glass rounded px-2 py-1">
                <span className="text-[10px] font-bold text-muted-foreground">RuPay</span>
              </div>
              <div className="glass rounded px-2 py-1">
                <span className="text-[10px] font-bold text-muted-foreground">NetBanking</span>
              </div>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <a
              href="/terms-of-service"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Terms of Service
            </a>
            <span className="text-muted-foreground/60">•</span>
            <a
              href="/privacy-policy"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <span className="text-muted-foreground/60">•</span>
            <a
              href="/refund-policy"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Refund Policy
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} marhabaDMC. All rights reserved.</p>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
