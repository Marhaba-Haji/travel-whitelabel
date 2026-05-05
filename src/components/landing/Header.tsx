import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ArrowRight, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import AuroraLogo from "@/components/AuroraLogo";
import { prefetchRoute } from "@/lib/route-prefetch";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "About", href: "/about", isPage: true },
    { name: "Pricing", href: "#pricing" },
    { name: "Destinations", href: "/categories-destinations", isPage: true },
    { name: "Blog", href: "/blog", isPage: true },
    { name: "Contact Us", href: "#contact" },
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
          ? "glass shadow-lg shadow-black/5 dark:shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <div className="flex flex-col leading-tight pt-2">
            <span className="font-poppins font-black text-2xl text-[#3F70E3] tracking-wider">MARHABA</span>
            <span className="font-poppins font-black text-2xl text-[#3F70E3] tracking-wider">DMC</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isExternal ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground bg-muted border border-border px-3 py-2 rounded-lg hover:bg-muted/80 transition-all"
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
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-all"
                >
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-all"
                >
                  {link.name}
                </button>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <a
              href="https://cal.id/harab-rasheed/product-demo?overlayCalendar=true"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-foreground/75 px-6 py-3 rounded-full bg-[#E8E8E8] hover:bg-muted transition-all"
            >
              Book a Demo
            </a>
            <Button asChild className="rounded-full px-6 py-3 bg-[#412A86] hover:bg-[#412A86]/90 shadow-[0_13px_13px_rgba(119,47,217,0.09)] transition-shadow">
              <a href="/signup">
                Sign Up
              </a>
            </Button>
          </div>

          {/* Mobile / Tablet: Login pill + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <a
              href="/login"
              className="text-sm font-medium text-foreground/80 px-4 py-1.5 rounded-full border border-border hover:bg-muted transition-colors"
            >
              Login
            </a>
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.isExternal ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground bg-muted border border-border px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all text-left"
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
                    className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2.5 rounded-lg transition-all text-left"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2.5 rounded-lg transition-all text-left"
                  >
                    {link.name}
                  </button>
                )
              )}
              <div className="pt-4 mt-2 border-t border-border">
                <Button asChild className="w-full rounded-full bg-gradient-to-r from-aurora-blue to-primary">
                  <a href="/signup">
                    Get Started
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </a>
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
