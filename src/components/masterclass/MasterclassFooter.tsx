import { MapPin, Clock, Mail, Phone, Instagram, Facebook, Twitter, Linkedin, MailOpen } from "lucide-react";
import { useState } from "react";
import { useSocialSettings } from "@/hooks/useSocialSettings";
import { useContactSettings } from "@/hooks/useContactSettings";

const MasterclassFooter = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { socialLinks } = useSocialSettings();
  const { whatsapp, phone, email, address, isLoading } = useContactSettings();

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    x: Twitter,
  } as const;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  return (
    <footer id="contact" className="relative pt-20 overflow-hidden w-full border-t border-[rgba(213,189,240,0.12)] bg-[var(--mc-surface)]">
      <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[var(--mc-tertiary)]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-[var(--mc-secondary)]/5 blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-5 md:px-8 relative z-10 pb-32 max-w-[1200px]">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <img src="/assets/logo.webp" alt="Marhaba DMC" width={140} height={40} loading="lazy" decoding="async" className="h-10 w-auto object-contain mr-2 brightness-0 invert" />
              <div className="flex flex-col leading-tight pt-1">
                <span className="font-poppins font-black text-[20px] text-[var(--mc-on-surface)] tracking-tight">MARHABA</span>
                <span className="font-poppins font-black text-[20px] text-[var(--mc-primary)] tracking-tight -mt-1">DMC</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-[var(--mc-on-surface-variant)] text-sm leading-relaxed">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--mc-primary)]" />
              <span className="whitespace-pre-line">{isLoading ? "Loading contact details..." : address}</span>
            </div>
            
            <div className="flex items-center gap-3 text-[var(--mc-on-surface-variant)] text-sm">
              <Clock className="w-5 h-5 flex-shrink-0 text-[var(--mc-primary)]" />
              <span>{isLoading ? "Loading contact details..." : `Whatsapp - ${whatsapp}`}</span>
            </div>
            
            <div className="flex items-center gap-3 text-[var(--mc-on-surface-variant)] text-sm">
              <Mail className="w-5 h-5 flex-shrink-0 text-[var(--mc-primary)]" />
              <span>{isLoading ? "Loading contact details..." : email}</span>
            </div>
          </div>

          {/* Right: Newsletter */}
          <div>
            <h4 className="font-bold text-[var(--mc-on-surface)] text-lg mb-6">Subscribe For Newsletter</h4>
            <form onSubmit={handleNewsletterSubmit} className="relative flex items-center w-full max-w-sm mb-3">
              <div className="absolute left-4 text-[var(--mc-on-surface-variant)]">
                <MailOpen className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-11 pr-32 py-3 rounded-full bg-[var(--mc-surface-c)] border border-[rgba(213,189,240,0.12)] focus:outline-none focus:border-[var(--mc-primary)] text-sm text-[var(--mc-on-surface)] placeholder:text-[var(--mc-on-surface-variant)]"
                required
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 bg-[var(--mc-primary)] text-[var(--mc-on-primary)] px-6 rounded-full font-semibold text-sm hover:bg-[var(--mc-primary)]/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-[var(--mc-on-surface-variant)]">No ads. No trails. No commitments</p>
          </div>
        </div>

        {/* Middle Section (Socials, Phone, Payments) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10 items-center">
          {/* Follow us */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-[var(--mc-on-surface)] mb-4 text-base text-center md:text-left">Follow us</h4>
            <div className="flex gap-3 justify-center md:justify-start">
              {socialLinks.map(({ platform, url, label }) => {
                const Icon = socialIcons[platform];

                if (!Icon) {
                  return null;
                }

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full mc-glass flex items-center justify-center text-[var(--mc-on-surface)] hover:text-[var(--mc-primary)] hover:border-[var(--mc-primary)]/50 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Need help */}
          <div className="flex flex-col items-center md:items-center">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-5 h-5 text-[var(--mc-primary)]" />
              <span className="font-bold text-[var(--mc-on-surface)] text-base">Need help? Call us</span>
            </div>
            <a
              href={phone ? `tel:${phone}` : whatsapp ? `tel:${whatsapp}` : undefined}
              className="text-2xl font-bold text-[var(--mc-on-surface)] pl-0 md:pl-0 text-center hover:text-[var(--mc-primary)] transition-colors"
            >
              {isLoading ? "Loading contact details..." : phone || whatsapp || ""}
            </a>
          </div>

          {/* Payments */}
          <div className="md:flex md:flex-col md:items-end">
            <h4 className="font-bold text-[var(--mc-on-surface)] mb-4 text-base w-full md:text-right">Payments</h4>
            <div className="flex gap-2 w-full justify-center md:justify-end">
              <div className="mc-glass rounded px-3 py-1.5 shadow-sm flex items-center justify-center w-14 border border-[rgba(213,189,240,0.12)]">
                <span className="text-[10px] font-bold text-white">PayPal</span>
              </div>
              <div className="mc-glass rounded px-3 py-1.5 shadow-sm flex items-center justify-center w-14 border border-[rgba(213,189,240,0.12)]">
                <span className="text-[10px] font-bold text-white">stripe</span>
              </div>
              <div className="mc-glass rounded px-3 py-1.5 shadow-sm flex items-center gap-0.5 justify-center w-14 border border-[rgba(213,189,240,0.12)]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] -ml-1" />
              </div>
              <div className="mc-glass rounded px-3 py-1.5 shadow-sm flex items-center justify-center w-14 border border-[rgba(213,189,240,0.12)]">
                <span className="text-[10px] font-bold text-white">Skrill</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Line */}
        <div className="h-px w-full bg-[rgba(213,189,240,0.12)] mb-6"></div>

        {/* Bottom Section (Copyright & Links) */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-[var(--mc-on-surface-variant)] gap-4">
          <p>© 2026 MarhabaDMC All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--mc-on-surface)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--mc-on-surface)] transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-[var(--mc-on-surface)] transition-colors">Legal notice</a>
            <a href="#" className="hover:text-[var(--mc-on-surface)] transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MasterclassFooter;
