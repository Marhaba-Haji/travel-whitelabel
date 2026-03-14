import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuroraLogo from "@/components/AuroraLogo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "About", href: "/about", isPage: true },
    { name: "Blog", href: "/blog", isPage: true },
    { name: "Destinations", href: "/categories-destinations", isPage: true },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-white/10 shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <AuroraLogo size="sm" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isPage ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handlePageNavigation}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.name}
                </button>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition-all flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              Login
            </a>
            <Button asChild className="rounded-full px-5 bg-gradient-to-r from-aurora-blue to-primary hover:shadow-[0_0_20px_hsl(210_100%_50%_/_0.25)] transition-shadow">
              <a href="/signup">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Mobile / Tablet: Login pill + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href="/login"
              className="text-sm font-medium text-foreground/80 px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/5 transition-colors"
            >
              Login
            </a>
            <button
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.isPage ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={handlePageNavigation}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all text-left"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all text-left"
                  >
                    {link.name}
                  </button>
                )
              )}
              <div className="pt-4 mt-2 border-t border-white/10">
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
