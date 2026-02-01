import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
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
          <div>
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
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                />
              </div>
              <Button type="submit" size="lg" variant="secondary" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info & Links */}
          <div className="lg:pl-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Facelyft</h3>
              <p className="text-background/70 mb-6">
                Technology and Marketing Solutions — Empowering travel agencies with world-class B2B portal solutions.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 mb-8">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp: +91 99999 99999</span>
              </a>
              <a
                href="tel:+919999999999"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>+91 99999 99999</span>
              </a>
              <a
                href="mailto:info@facelyft.com"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>info@facelyft.com</span>
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span>New Delhi, India</span>
              </div>
            </div>

            {/* Quick Links */}
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 mt-12 pt-8 text-center text-background/50 text-sm">
          <p>© {new Date().getFullYear()} Facelyft Technology and Marketing Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
