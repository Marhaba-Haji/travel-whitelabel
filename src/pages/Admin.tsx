import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import OverviewTab from "@/components/admin/OverviewTab";
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

const tabComponents: Record<string, React.FC> = {
  overview: OverviewTab,
  enquiries: ContactEnquiriesTab,
  "voice-ai-leads": VoiceAILeadsTab,
  itineraries: SavedItinerariesTab,
  newsletter: NewsletterTab,
  registrations: RegistrationsTab,
  payments: PaymentsTab,
  pricing: PricingTab,
  coupons: CouponsTab,
  "ai-agent": AIAgentConfigTab,
  settings: SiteSettingsTab,
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const TabComponent = tabComponents[activeTab] ?? OverviewTab;

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <TabComponent />
    </AdminLayout>
  );
};

export default Admin;
