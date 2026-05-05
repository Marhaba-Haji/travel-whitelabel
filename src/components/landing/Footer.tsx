import { MapPin, Clock, Mail, Phone, Instagram, Facebook, Twitter, Youtube, MailOpen } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };

  return (
    <footer className="relative bg-white pt-20 overflow-hidden w-full">
      <div className="container mx-auto px-4 relative z-10 pb-32">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <img src="/assets/logo.png" alt="Marhaba DMC" className="h-10 w-auto object-contain mr-2" />
              <div className="flex flex-col leading-tight pt-1">
                <span className="font-poppins font-black text-[20px] text-gray-900 tracking-tight">MARHABA</span>
                <span className="font-poppins font-black text-[20px] text-[#412A86] tracking-tight -mt-1">DMC</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-gray-500 text-sm leading-relaxed">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-600" />
              <span>Paramount Avenue , 63/1 , 3rd Floor Mosque<br/>road cross Frazer Town , Banagalore 560005</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <Clock className="w-5 h-5 flex-shrink-0 text-gray-600" />
              <span>Whatsapp - +9184784492129</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <Mail className="w-5 h-5 flex-shrink-0 text-gray-600" />
              <span>Hello@marhabadmc.com</span>
            </div>
          </div>

          {/* Middle: Quick Links */}
          <div className="md:px-8">
            <h4 className="font-bold text-gray-900 text-lg mb-6">Quick Links</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <a href="/about" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">About</a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Pricing</a>
              <a href="/umrah-visa-check" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Umrah Visa Check</a>
              <a href="#faq" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">FAQ</a>
              <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Features</a>
            </div>
          </div>

          {/* Right: Newsletter */}
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-6">Subscribe For Newsletter</h4>
            <form onSubmit={handleNewsletterSubmit} className="relative flex items-center w-full max-w-sm mb-3">
              <div className="absolute left-4 text-gray-400">
                <MailOpen className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-11 pr-32 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                required
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 bg-black text-white px-6 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-400">No ads. No trails. No commitments</p>
          </div>
        </div>

        {/* Middle Section (Socials, Phone, Payments) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10 items-center">
          {/* Follow us */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-base">Follow us</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Need help */}
          <div className="flex flex-col md:items-center">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-5 h-5 text-gray-900" />
              <span className="font-bold text-gray-900 text-base">Need help? Call us</span>
            </div>
            <a href="tel:18002228888" className="text-2xl font-bold text-gray-900 pl-7 md:pl-0">
              1-800-222-8888
            </a>
          </div>

          {/* Payments */}
          <div className="md:flex md:flex-col md:items-end">
            <h4 className="font-bold text-gray-900 mb-4 text-base w-full md:text-right">Payments</h4>
            <div className="flex gap-2 w-full md:justify-end">
              <div className="bg-white border border-gray-200 rounded px-3 py-1.5 shadow-sm flex items-center justify-center w-14">
                <span className="text-[10px] font-bold text-[#003087]">PayPal</span>
              </div>
              <div className="bg-white border border-gray-200 rounded px-3 py-1.5 shadow-sm flex items-center justify-center w-14">
                <span className="text-[10px] font-bold text-[#635BFF]">stripe</span>
              </div>
              <div className="bg-white border border-gray-200 rounded px-3 py-1.5 shadow-sm flex items-center gap-0.5 justify-center w-14">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] -ml-1" />
              </div>
              <div className="bg-white border border-gray-200 rounded px-3 py-1.5 shadow-sm flex items-center justify-center w-14">
                <span className="text-[10px] font-bold text-[#811E68]">Skrill</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Line */}
        <div className="h-px w-full bg-gray-200 mb-6"></div>

        {/* Bottom Section (Copyright & Links) */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© 2026 MarhabaDMC All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Legal notice</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Accessibility</a>
          </div>
        </div>
      </div>

      {/* Decorative Mountains Background */}
      {/* We use an SVG to replicate the layered mountain and pine tree look */}
      <div className="absolute bottom-0 left-0 w-full h-[250px] z-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 250" className="w-full h-full object-cover object-bottom" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          {/* Layer 1 (Back) */}
          <path d="M0,150 Q100,100 250,140 T500,130 T750,160 T1000,120 T1250,150 T1440,130 L1440,250 L0,250 Z" fill="#99C9BA" />
          {/* Layer 2 */}
          <path d="M0,180 Q150,140 300,170 T600,150 T900,190 T1200,160 T1440,180 L1440,250 L0,250 Z" fill="#71A792" />
          {/* Layer 3 (Front) */}
          <path d="M0,210 Q200,180 400,220 T800,190 T1200,230 T1440,200 L1440,250 L0,250 Z" fill="#427A62" />
          
          {/* Decorative Pine Trees */}
          <g fill="#214A3A">
            {/* Tree 1 */}
            <path d="M50,220 L40,250 L60,250 Z M50,190 L35,230 L65,230 Z M50,160 L30,210 L70,210 Z M50,130 L25,190 L75,190 Z" />
            <rect x="47" y="240" width="6" height="10" />
            {/* Tree 2 */}
            <path d="M220,230 L212,250 L228,250 Z M220,210 L208,235 L232,235 Z M220,190 L204,220 L236,220 Z M220,170 L200,205 L240,205 Z" />
            <rect x="218" y="245" width="4" height="5" />
            {/* Tree 3 */}
            <path d="M950,230 L942,250 L958,250 Z M950,210 L938,235 L962,235 Z M950,190 L934,220 L966,220 Z M950,170 L930,205 L970,205 Z" />
            {/* Tree 4 */}
            <path d="M1350,220 L1340,250 L1360,250 Z M1350,190 L1335,230 L1365,230 Z M1350,160 L1330,210 L1370,210 Z M1350,130 L1325,190 L1375,190 Z" />
          </g>
        </svg>
      </div>
    </footer>
  );
};

export default Footer;
