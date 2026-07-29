// Single source of truth for all pricing surfaced anywhere on the site.
// If a price appears in JSX, it must ultimately trace back to this file
// (via usePlans() for base plan prices, or directly for add-ons).

export type PlanKey = "launch" | "growth" | "authority";

export interface PlanPricingData {
  launch: number;
  growth: number;
  authority: number;
  launch_monthly: number;
  growth_monthly: number;
  // authority_monthly intentionally omitted — Authority is annual-only.
  authority_monthly?: number;
  gst_percent: number;
  currency: string;
}

export const PLAN_DEFAULTS: PlanPricingData = {
  launch: 19999,
  growth: 29999,
  authority: 39999,
  launch_monthly: 2999,
  growth_monthly: 3999,
  gst_percent: 18,
  currency: "INR",
};

export const AUTHORITY_ANNUAL_ONLY = true;

// Copy-only positioning per plan. Names & badges kept identical to previous UI.
export const PLAN_META: Record<
  PlanKey,
  { name: string; subheadline: string; badge: string | null; highlight: boolean }
> = {
  launch: {
    name: "Launch Plan",
    subheadline:
      "For agencies that already have a brand and customers, and need the technology.",
    badge: null,
    highlight: false,
  },
  growth: {
    name: "Growth Plan",
    subheadline:
      "For established agencies ready to automate enquiries and sell through sub-agents.",
    badge: "Most Popular",
    highlight: true,
  },
  authority: {
    name: "Authority Plan",
    subheadline:
      "For new entrants who need the brand, the presence and the platform together.",
    badge: "Complete Brand Setup",
    highlight: false,
  },
};

export const BRAND_SETUP_INCLUDES = [
  "Professional Logo Design (2 revision rounds)",
  "Google Business Profile Setup",
  "LinkedIn Business Page Setup",
  "Instagram Business Setup",
  "Facebook Business Setup",
  "X Page Setup",
  "Social Media Banners",
];

export const ADDONS = {
  brandSetupPack: {
    id: "brand-setup",
    name: "Brand Setup Pack",
    price: 14999,
    cycle: "one-time" as const,
    tagline:
      "Complete brand presence, done for you — logo, Google Business Profile, and five business social accounts.",
    includes: BRAND_SETUP_INCLUDES,
    eligibility:
      "Available to Launch and Growth on any billing cycle. Included free with Authority annual.",
  },
  socialMediaManagement: {
    id: "social-media-management",
    name: "Social Media Management",
    price: 5000,
    cycle: "monthly" as const,
    tagline:
      "Ongoing management of your social accounts — posting, engagement and monthly reporting. Separate from the one-time Brand Setup Pack.",
    eligibility:
      "Available to Growth and Authority customers, and to Launch customers who have purchased the Brand Setup Pack.",
  },
};

// Growth annual + Brand Setup Pack (bought separately) vs. Authority annual.
// e.g. 29999 + 14999 − 39999 = 4999.
export const authorityBundleSavings = (
  pricing: Pick<PlanPricingData, "growth" | "authority">,
): number =>
  Math.max(0, pricing.growth + ADDONS.brandSetupPack.price - pricing.authority);

export const bundleComparisonTotal = (
  pricing: Pick<PlanPricingData, "growth">,
): number => pricing.growth + ADDONS.brandSetupPack.price;