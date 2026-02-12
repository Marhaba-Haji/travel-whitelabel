import { Button } from "@/components/ui/button";
import { Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Portals", href: "#portals" },
    { name: "About", href: "/about", isPage: true },
    { name: "Destinations", href: "/categories-destinations", isPage: true },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  const scrollToSection = (href: string) => {
    // If we're not on the home page, navigate to home page with hash
    // The Index page's useEffect will handle scrolling after navigation
    if (location.pathname !== "/") {
      navigate(`/${href}`);
    } else {
      // We're on the home page, scroll immediately
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  };

  const handlePageNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Close mobile menu if open
    setIsMenuOpen(false);
    // Scroll to top of the page when navigating
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2.5">
              <img
                src="/assets/marhaba-dmc-logo.png"
                alt="marhabaDMC"
                className="h-7 w-auto object-contain flex-shrink-0"
              />
              <span className="text-[1.1rem] leading-none">
                <span className="font-marhaba text-foreground">marhaba</span>
                <span className="font-dmc font-semibold text-primary">DMC</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isPage ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handlePageNavigation}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </button>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              Agent Login
            </a>
            <Button asChild>
              <a href="/signup">Get Started</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.isPage ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={handlePageNavigation}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {link.name}
                  </button>
                )
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <a
                  href="/login"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors text-left py-2"
                >
                  <LogIn className="h-4 w-4" />
                  Agent Login
                </a>
                <Button asChild>
                  <a href="/signup">Get Started</a>
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
