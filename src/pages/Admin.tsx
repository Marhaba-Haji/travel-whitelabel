import { lazy, Suspense, useState, type ComponentType } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import OverviewTab from "@/components/admin/OverviewTab";
import SEOHead from "@/components/seo/SEOHead";

// Only the default Overview tab loads eagerly. Every other tab is
// code-split so the admin shell stays small.
const tabComponents: Record<string, ComponentType> = {
  overview: OverviewTab,
  enquiries: lazy(() => import("@/components/admin/ContactEnquiriesTab")),
  newsletter: lazy(() => import("@/components/admin/NewsletterTab")),
  registrations: lazy(() => import("@/components/admin/RegistrationsTab")),
  payments: lazy(() => import("@/components/admin/PaymentsTab")),
  pricing: lazy(() => import("@/components/admin/PricingTab")),
  coupons: lazy(() => import("@/components/admin/CouponsTab")),
  blog: lazy(() => import("@/components/admin/BlogTab")),
  "indexing-logs": lazy(() => import("@/components/admin/IndexingLogsTab")),
  "hero-content": lazy(() => import("@/components/admin/HeroContentTab")),
  "hero-images": lazy(() => import("@/components/admin/HeroImagesTab")),
  faqs: lazy(() => import("@/components/admin/HomeFaqsTab")),
  settings: lazy(() => import("@/components/admin/SiteSettingsTab")),
  partners: lazy(() => import("@/components/admin/PartnersTab")),
  testimonials: lazy(() => import("@/components/admin/TestimonialsTab")),
  "user-management": lazy(() => import("@/components/admin/UserManagementTab")),
  "demo-bookings": lazy(() => import("@/components/admin/DemoBookingsTab")),
  masterclass: lazy(() => import("@/components/admin/MasterclassTab")),
  umrah: lazy(() => import("@/components/admin/UmrahLeadsTab")),
  scripts: lazy(() => import("@/components/admin/ScriptsTab")),
};

const TabFallback = () => (
  <div className="flex items-center justify-center h-64 text-muted-foreground">
    Loading…
  </div>
);

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
      <SEOHead
        title="Admin Dashboard"
        description="marhabaDMC admin dashboard (restricted)."
        path="/admin"
        noIndex
      />
      <Suspense fallback={<TabFallback />}>
        <TabComponent />
      </Suspense>
    </AdminLayout>
  );
};

export default Admin;
