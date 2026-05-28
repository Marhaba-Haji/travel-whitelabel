import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, MessageSquare, Mail, Users, CreditCard,
  DollarSign, Ticket, Settings, LogOut, Menu, X, Mic, Map, Bot, BarChart3, FileText, Globe, UserCog, Network, Type, Image, Star, CircleHelp, CalendarCheck, GraduationCap
} from "lucide-react";

const allTabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "enquiries", label: "Contact Enquiries", icon: MessageSquare },
  { id: "voice-ai-leads", label: "Voice AI Leads", icon: Mic },
  { id: "demo-bookings", label: "Demo Bookings", icon: CalendarCheck },
  { id: "masterclass", label: "Masterclass", icon: GraduationCap },
  { id: "itineraries", label: "Saved Itineraries", icon: Map },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "registrations", label: "Registrations", icon: Users },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "pricing", label: "Pricing & GST", icon: DollarSign },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "ai-agent", label: "AI Agent Config", icon: Bot },
  { id: "indexing-logs", label: "Indexing Logs", icon: Globe },
  { id: "hero-content", label: "Hero Section", icon: Type },
  { id: "hero-images", label: "Hero Images", icon: Image },
  { id: "partners", label: "Partners", icon: Network },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "faqs", label: "FAQs", icon: CircleHelp },
  { id: "settings", label: "Site Settings", icon: Settings },
];

interface AdminLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const AdminLayout = ({ activeTab, onTabChange, children }: AdminLayoutProps) => {
  const { signOut, user, isSuperadmin, hasAccess } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter tabs based on permissions
  const visibleTabs = isSuperadmin
    ? allTabs
    : allTabs.filter((tab) => hasAccess(tab.id, "view"));

  // Build full tab list with user management for superadmin
  const tabs = isSuperadmin
    ? [...visibleTabs, { id: "user-management", label: "User Management", icon: UserCog }]
    : visibleTabs;

  return (
    <div data-admin-page className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform md:translate-x-0 md:static md:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <h2 className="font-semibold text-sidebar-foreground">Admin Panel</h2>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                activeTab === tab.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground mb-2 truncate">{user?.email}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground">
            {tabs.find((t) => t.id === activeTab)?.label ?? "Dashboard"}
          </h1>
          {!isSuperadmin && (
            <span className="ml-auto text-xs text-muted-foreground">Sub-admin</span>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
