import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import OverviewTab from "@/components/admin/OverviewTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import ContactEnquiriesTab from "@/components/admin/ContactEnquiriesTab";
import VoiceAILeadsTab from "@/components/admin/VoiceAILeadsTab";
import SavedItinerariesTab from "@/components/admin/SavedItinerariesTab";
import NewsletterTab from "@/components/admin/NewsletterTab";
import RegistrationsTab from "@/components/admin/RegistrationsTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import PricingTab from "@/components/admin/PricingTab";
import CouponsTab from "@/components/admin/CouponsTab";
import AIAgentConfigTab from "@/components/admin/AIAgentConfigTab";
import SiteSettingsTab from "@/components/admin/SiteSettingsTab";
import BlogTab from "@/components/admin/BlogTab";
import IndexingLogsTab from "@/components/admin/IndexingLogsTab";
import UserManagementTab from "@/components/admin/UserManagementTab";
import PartnersTab from "@/components/admin/PartnersTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import HeroContentTab from "@/components/admin/HeroContentTab";
import HeroImagesTab from "@/components/admin/HeroImagesTab";
import HomeFaqsTab from "@/components/admin/HomeFaqsTab";

const tabComponents: Record<string, React.FC> = {
  overview: OverviewTab,
  analytics: AnalyticsTab,
  enquiries: ContactEnquiriesTab,
  "voice-ai-leads": VoiceAILeadsTab,
  itineraries: SavedItinerariesTab,
  newsletter: NewsletterTab,
  registrations: RegistrationsTab,
  payments: PaymentsTab,
  pricing: PricingTab,
  coupons: CouponsTab,
  blog: BlogTab,
  "ai-agent": AIAgentConfigTab,
  "indexing-logs": IndexingLogsTab,
  "hero-content": HeroContentTab,
  "hero-images": HeroImagesTab,
  faqs: HomeFaqsTab,
  settings: SiteSettingsTab,
  partners: PartnersTab,
  testimonials: TestimonialsTab,
  "user-management": UserManagementTab,
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { isSuperadmin, hasAccess } = useAuth();

  // Prevent accessing a module without permission
  const canView = activeTab === "user-management"
    ? isSuperadmin
    : hasAccess(activeTab, "view");

  const TabComponent = canView
    ? (tabComponents[activeTab] ?? OverviewTab)
    : () => (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don't have access to this module.
        </div>
      );

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <TabComponent />
    </AdminLayout>
  );
};

export default Admin;
