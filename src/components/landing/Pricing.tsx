import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Check,
  Shield,
  CreditCard,
  TrendingUp,
  Star,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useContactSettings } from "@/hooks/useContactSettings";
import { usePlans } from "@/hooks/usePlans";

const coreInfrastructure = [
  "Flight API",
  "Hotel API",
  "Visa API",
  "Activities API",
  "Hajj Packages",
  "Umrah Packages",
  "Holiday Packages",
  "Car Transport at Destination",
  "Guide Module",
  "Group Flights Module",
  "Contracted Rates Access",
  "Admin Portal",
  "B2C Direct Booking Website",
  "Halal Travel Content Library",
  "Add Your Own Content",
];

const growthExtras = [
  "AI Sales Enquiry Handling Agent",
  "Supplier Portal",
  "B2B Sub-Agent Portal",
  "Free .in Domain (1 Year)",
];

const authorityExtras = [
  "Google Business Profile Setup",
  "LinkedIn Business Page Setup",
  "Instagram Business Setup",
  "Facebook Business Setup",
  "X Page Setup",
  "Professional Logo Design",
  "Social Media Banners",
];

type FeatureGroup = {
  title: string;
  items: string[];
  emphasis?: boolean;
};

type PlanCardProps = {
  title: string;
  price: string;
  gstPercent: number;
  summary: string[];
  detailGroups: FeatureGroup[];
  ctaHref: string;
  ctaClassName: string;
  titleClassName?: string;
  badge?: React.ReactNode;
  highlight?: boolean;
  accentClassName?: string;
  detailsLabel: string;
};

const SummaryList = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2 text-sm leading-snug">
        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <span className="text-gray-600">{item}</span>
      </li>
    ))}
  </ul>
);

const FeatureDisclosure = ({ groups, label }: { groups: FeatureGroup[]; label: string }) => (
  <Accordion type="single" collapsible className="mt-5">
    <AccordionItem value="details" className="border-0">
      <AccordionTrigger className="px-0 py-0 hover:no-underline [&>svg]:hidden">
        <div className="w-full flex items-center justify-between rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-left transition-colors hover:bg-gray-100/80">
          <span className="text-xs font-semibold text-gray-600">{label}</span>
          <span className="text-xs font-bold text-[#412A86]">View details</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-0">
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
                {group.title}
              </p>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${group.emphasis ? "text-gray-900" : "text-primary"}`} />
                    <span className={group.emphasis ? "text-gray-900 font-semibold" : "text-gray-500"}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

const PlanCard = ({
  title,
  price,
  gstPercent,
  summary,
  detailGroups,
  ctaHref,
  ctaClassName,
  titleClassName = "text-gray-500",
  badge,
  highlight = false,
  accentClassName = "",
  detailsLabel,
}: PlanCardProps) => (
  <div
    className={`group relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 md:p-7 flex flex-col h-full transition-all duration-300 motion-safe:hover:-translate-y-1 ${highlight ? "ring-1 ring-[#412A86]/10" : ""}`}
  >
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${titleClassName}`}>{title}</p>
        {badge}
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-4xl font-bold text-gray-900 ${accentClassName}`}>{price}</span>
      </div>
      <p className="text-xs text-gray-500">per year + {gstPercent}% GST</p>
    </div>

    <div className="border-t border-gray-100 pt-4 flex-1">
      <SummaryList items={summary} />
      <FeatureDisclosure groups={detailGroups} label={detailsLabel} />
    </div>

    <Button variant={highlight ? "default" : "outline"} className={ctaClassName} asChild>
      <Link to={ctaHref}>Get Started</Link>
    </Button>
  </div>
);

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { whatsappUrl } = useContactSettings();
  const { pricing, gstPercent, symbol } = usePlans();

  const fmt = (base: number) =>
    `${symbol}${base.toLocaleString("en-IN")}`;

  return (
    <section id="pricing" className="py-24 bg-[#FAFAFC] relative overflow-hidden w-full" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 1000px' }}>
      <div className="container mx-auto px-4 relative z-10">

        {/* ── 1. Section Header ── */}
        <div
          ref={ref}
          className={`text-center mb-12 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <Badge className="mb-4 bg-cyan-50 text-cyan-600 hover:bg-cyan-50 border-0 shadow-none font-bold tracking-wide text-xs px-4 py-1.5 rounded-full">
            Subscription Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 max-w-3xl mx-auto leading-tight font-poppins">
            Launch Your Own Travel Business — With Real Infrastructure
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-3">
            MarhabaDMC provides the complete operating layer for halal travel businesses — from global APIs and contracted rates to structured destination management and distribution tools.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Every plan includes our core travel infrastructure. You simply decide how far you want to scale.
          </p>
        </div>

        {/* ── 2. Three-Plan Comparison Grid ── */}
        <div className={`max-w-5xl mx-auto mb-14 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.2s" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Launch Plan */}
            <PlanCard
              title="Launch Plan"
              price={fmt(pricing.launch)}
              gstPercent={gstPercent}
              summary={[
                "15 core modules for a complete travel operation",
                "Flight, hotel, visa, activities, and transport infrastructure",
                "Admin portal, B2C booking site, and content library",
              ]}
              detailGroups={[
                {
                  title: "Core infrastructure",
                  items: coreInfrastructure,
                },
              ]}
              ctaHref="/signup?plan=launch"
              ctaClassName="w-full h-14 rounded-full border-cyan-100 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-200"
              detailsLabel="See the full Launch list"
            />

            {/* Growth Plan — Most Popular */}
            <div className="relative md:scale-[1.03] flex flex-col">
              <div className="flex justify-center mb-3">
                <Badge className="bg-[#412A86] text-white px-4 py-1 text-xs font-bold shadow-lg rounded-full border-0">
                  Most Popular
                </Badge>
              </div>

              <PlanCard
                title="Growth Plan"
                price={fmt(pricing.growth)}
                gstPercent={gstPercent}
                summary={[
                  "Everything in Launch, plus automation and distribution",
                  "AI enquiry handling, supplier portal, and agent access",
                  "Free .in domain for the first year",
                ]}
                detailGroups={[
                  {
                    title: "Core infrastructure",
                    items: coreInfrastructure,
                  },
                  {
                    title: "Growth add-ons",
                    items: growthExtras,
                    emphasis: true,
                  },
                ]}
                ctaHref="/signup?plan=growth"
                ctaClassName="w-full h-14 rounded-full bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg"
                titleClassName="text-[#412A86]"
                highlight
                detailsLabel="See everything included in Growth"
              />
            </div>

            {/* Authority Plan */}
            <PlanCard
              title="Authority Plan"
              price={fmt(pricing.authority)}
              gstPercent={gstPercent}
              summary={[
                "Everything in Growth with full brand setup",
                "Google, social, and visual identity support",
                "Launch-ready presence from day one",
              ]}
              detailGroups={[
                {
                  title: "Core infrastructure",
                  items: coreInfrastructure,
                },
                {
                  title: "Growth add-ons",
                  items: growthExtras,
                  emphasis: true,
                },
                {
                  title: "Brand setup",
                  items: authorityExtras,
                  emphasis: true,
                },
              ]}
              ctaHref="/signup?plan=authority"
              ctaClassName="w-full h-14 rounded-full border-cyan-100 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-200"
              titleClassName="text-gray-500"
              badge={
                <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 border-0 rounded-full px-2.5 py-0.5 shadow-none">
                  Complete Brand Setup
                </Badge>
              }
              detailsLabel="See the full Authority scope"
            />
          </div>
        </div>

        {/* ── 4. Persuasion Blocks ── */}
        <div className={`max-w-4xl mx-auto mb-14 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.3s" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900">Why Most Choose Growth Plan</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                For just {symbol}{(pricing.growth - pricing.launch).toLocaleString("en-IN")} more than Launch, you unlock AI automation, supplier control, agent distribution, and free domain — making it the smart scaling choice.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900">Why Authority Plan Wins Long-Term</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                For another {symbol}{(pricing.authority - pricing.growth).toLocaleString("en-IN")}, you receive complete brand presence — logo, social media setup, and Google visibility structured from day one.
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. CTA Section ── */}
        <div className={`text-center mb-14 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.4s" }}>
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-poppins">Ready to Build Your Travel Business?</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 rounded-full px-8 bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg" asChild>
                <Link to="/signup">Get Started Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 rounded-full px-8 border-gray-200 bg-white text-gray-900 hover:border-[#412A86]/30 hover:bg-white" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Talk to Our Team</a>
              </Button>
            </div>
          </div>
        </div>

        {/* ── 6. Trust Bar ── */}
        <div className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.5s" }}>
          <div className="border-t border-gray-100 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-wrap mb-4 text-center">
              <div className="flex items-center gap-2 text-gray-500">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm">No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-sm">Secure Payments</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-primary tracking-wider">VISA</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-full px-3 py-1 flex items-center gap-0.5 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60 -ml-1" />
              </div>
              <div className="bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-foreground">UPI</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
