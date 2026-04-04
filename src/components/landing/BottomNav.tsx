import { Home, Layers, Handshake, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "solutions", label: "Solutions", icon: Layers, hash: "#features" },
  { id: "partners", label: "Partners", icon: Handshake, hash: "#features" },
  { id: "profile", label: "Profile", icon: User, href: "/login" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTab = (tab: (typeof tabs)[number]) => {
    if (tab.href) {
      if (tab.href === "/" && location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate(tab.href);
      }
    } else if (tab.hash) {
      if (location.pathname !== "/") {
        navigate(`/${tab.hash}`);
      } else {
        const el = document.querySelector(tab.hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isActive = (tab: (typeof tabs)[number]) => {
    if (tab.href === "/" && location.pathname === "/") return true;
    if (tab.href && tab.href !== "/" && location.pathname === tab.href) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t-surface">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab)}
              className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 py-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
