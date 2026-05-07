import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuroraLogo from "@/components/AuroraLogo";
import { prefetchRoute } from "@/lib/route-prefetch";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  type NavLink = { name: string; href: string; isPage?: boolean; isExternal?: boolean };
  const navLinks: NavLink[] = [
    { name: "Features", href: "#features" },
    { name: "About", href: "/about", isPage: true },
    { name: "Pricing", href: "#pricing" },
    { name: "Destinations", href: "/categories-destinations", isPage: true },
    { name: "Blog", href: "/blog", isPage: true },
    { name: "Contact Us", href: "/contact", isPage: true },
  ];

  const scrollToSection = (href: string) => {
    if (location.pathname !== "/") {
      navigate(`/${href}`);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handlePageNavigation = () => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handlePrefetch = (href: string) => {
    prefetchRoute(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src="/assets/logo.webp" alt="Marhaba DMC" width={140} height={40} className="h-10 w-auto object-contain mr-2" />
            <div className="flex flex-col leading-tight pt-1">
              <span className="font-poppins font-black text-[22px] text-gray-900 tracking-tight">MARHABA</span>
              <span className="font-poppins font-black text-[22px] text-[#412A86] tracking-tight -mt-1">DMC</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isExternal ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gray-600 hover:text-[#412A86] transition-colors"
                >
                  {link.name}
                </a>
              ) : link.isPage ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handlePageNavigation}
                  onMouseEnter={() => handlePrefetch(link.href)}
                  onFocus={() => handlePrefetch(link.href)}
                  onTouchStart={() => handlePrefetch(link.href)}
                  className="text-sm font-semibold text-gray-600 hover:text-[#412A86] transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm font-semibold text-gray-600 hover:text-[#412A86] transition-colors"
                >
                  {link.name}
                </button>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/book-demo"
              onClick={handlePageNavigation}
              onMouseEnter={() => handlePrefetch("/book-demo")}
              className="text-sm font-semibold text-gray-900 px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Book a Demo
            </Link>
            <Button asChild className="rounded-full px-7 py-5 bg-[#412A86] hover:bg-[#412A86]/90 text-white font-semibold shadow-lg shadow-[#412A86]/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
              <Link to="/signup" onClick={handlePageNavigation} onMouseEnter={() => handlePrefetch("/signup")}>
                Sign Up
              </Link>
            </Button>
          </div>

          {/* Mobile / Tablet: hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              className="p-2 -mr-2 rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-100 bg-white absolute left-0 right-0 px-4 shadow-xl animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) =>
                link.isExternal ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-gray-800 hover:text-[#412A86] transition-all"
                  >
                    {link.name}
                  </a>
                ) : link.isPage ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={handlePageNavigation}
                    className="text-base font-semibold text-gray-800 hover:text-[#412A86] transition-all"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-base font-semibold text-gray-800 hover:text-[#412A86] transition-all text-left"
                  >
                    {link.name}
                  </button>
                )
              )}
              <div className="pt-6 mt-2 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  to="/book-demo"
                  onClick={handlePageNavigation}
                  className="w-full text-center text-sm font-semibold text-gray-900 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Book a Demo
                </Link>
                <Button asChild className="w-full rounded-full py-6 bg-[#412A86] hover:bg-[#412A86]/90 text-white font-semibold shadow-lg">
                  <Link to="/signup" onClick={handlePageNavigation}>
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
