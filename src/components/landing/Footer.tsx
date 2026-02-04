import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, MessageCircle, Shield, Lock, CreditCard, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Footer = () => {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to our newsletter.",
    });
    setNewsletterEmail("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const quickLinks = [
    { name: "Features", href: "#features" },
    { name: "Portals", href: "#portals" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/nomadore", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/nomadore", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/nomadore", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/nomadore", label: "LinkedIn" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div
            ref={formRef}
            className={`opacity-0 ${formVisible ? "animate-fade-in-left" : ""}`}
          >
            <h3 className="text-2xl font-bold mb-2">Get in Touch</h3>
            <p className="text-background/70 mb-6">
              Have questions? Fill out the form and our team will get back to you within 24 hours.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-background/90">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    maxLength={100}
                    className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-background/90">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    maxLength={255}
                    className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-background/90">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  maxLength={20}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-background/90">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements..."
                  rows={4}
                  required
                  maxLength={1000}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                />
              </div>
              <Button type="submit" size="lg" variant="secondary" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info & Links */}
          <div
            ref={infoRef}
            className={`lg:pl-8 opacity-0 ${infoVisible ? "animate-fade-in-right" : ""}`}
          >
            <div className="mb-8">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-2xl font-bold">
                  <span className="text-background">NOMAD</span>
                  <span className="text-primary">ORE</span>
                </span>
              </div>
              <p className="text-background/70 mb-6">
                Travel Entrepreneurs Start Here — Launch your own travel business with complete training and support.
              </p>

              {/* Newsletter Signup */}
              <div className="bg-background/5 rounded-lg p-4 border border-background/10">
                <h4 className="font-semibold mb-2">Subscribe to Our Newsletter</h4>
                <p className="text-background/60 text-sm mb-3">Get the latest updates, tips, and industry insights.</p>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    maxLength={255}
                    className="bg-background/10 border-background/20 text-background placeholder:text-background/50 flex-1"
                  />
                  <Button type="submit" variant="secondary" size="icon" className="shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 mb-8">
              <a
                href="https://wa.me/919008447887"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp: +91 90084 47887</span>
              </a>
              <a
                href="tel:+919008447887"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>+91 90084 47887</span>
              </a>
              <a
                href="mailto:hello@nomadore.com"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>hello@nomadore.com</span>
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span>New Delhi, India</span>
              </div>
            </div>

            {/* Quick Links & Social */}
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="flex flex-wrap gap-4">
                  {quickLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => scrollToSection(link.href)}
                      className="text-background/70 hover:text-background transition-colors"
                    >
                      {link.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/70 hover:bg-background/20 hover:text-background transition-all"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="border-t border-background/10 mt-12 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            {/* Security Badges */}
            <div className="flex items-center gap-2 text-background/60">
              <Shield className="w-5 h-5" />
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-background/60">
              <Lock className="w-5 h-5" />
              <span className="text-sm">256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-background/60">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Secure Payments</span>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-background/20" />
            
            {/* Payment Icons */}
            <div className="flex items-center gap-2">
              <div className="bg-background/10 border border-background/20 rounded px-2 py-1">
                <span className="text-[10px] font-bold text-background/80 tracking-wider">VISA</span>
              </div>
              <div className="bg-background/10 border border-background/20 rounded px-2 py-1 flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-background/40 -ml-1" />
              </div>
              <div className="bg-background/10 border border-background/20 rounded px-2 py-1">
                <span className="text-[10px] font-bold text-background/80">UPI</span>
              </div>
              <div className="bg-background/10 border border-background/20 rounded px-2 py-1">
                <span className="text-[10px] font-bold text-background/60">RuPay</span>
              </div>
              <div className="bg-background/10 border border-background/20 rounded px-2 py-1">
                <span className="text-[10px] font-bold text-background/60">NetBanking</span>
              </div>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <a
              href="/terms-of-service"
              className="text-background/60 hover:text-background transition-colors text-sm"
            >
              Terms of Service
            </a>
            <span className="text-background/40">•</span>
            <a
              href="/privacy-policy"
              className="text-background/60 hover:text-background transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <span className="text-background/40">•</span>
            <a
              href="/refund-policy"
              className="text-background/60 hover:text-background transition-colors text-sm"
            >
              Refund Policy
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-background/50 text-sm">
            <p>© {new Date().getFullYear()} NOMADORE. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
