import EyebrowChip from "@/components/ui/EyebrowChip";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Plane,
  Building2,
  MessageSquare,
  CreditCard,
  Map,
  Globe,
  Palette,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: "cyan" | "purple" | "indigo";
  surface: string;
  blobSurface: string;
  iconTone: string;
  kicker: string;
};

const featureSurfaces: Array<Pick<Feature, "surface" | "blobSurface" | "iconTone" | "kicker">> = [
  { surface: "bg-[#FFF8F6] border-[#F4E7E3]", blobSurface: "bg-[#FFE6DD]", iconTone: "text-[#412A86]", kicker: "Real-time" },
  { surface: "bg-[#F4FBF9] border-[#DDF1EC]", blobSurface: "bg-[#DDF7F1]", iconTone: "text-teal-600", kicker: "Inventory" },
  { surface: "bg-[#F7F4FD] border-[#E7E0F6]", blobSurface: "bg-[#E9DFF9]", iconTone: "text-purple-600", kicker: "Automation" },
  { surface: "bg-[#F7FAFF] border-[#E3ECFB]", blobSurface: "bg-[#E2EBFB]", iconTone: "text-blue-600", kicker: "Processing" },
  { surface: "bg-[#FBF5FF] border-[#EFE0F9]", blobSurface: "bg-[#F1E1FB]", iconTone: "text-fuchsia-600", kicker: "Discovery" },
  { surface: "bg-[#FDF8F0] border-[#F4E7CF]", blobSurface: "bg-[#F6E8C9]", iconTone: "text-orange-500", kicker: "Brand control" },
  { surface: "bg-[#F5FAF8] border-[#DBEEE7]", blobSurface: "bg-[#DCF1E8]", iconTone: "text-emerald-600", kicker: "White label" },
];

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const features: Feature[] = [
    {
      icon: Plane,
      title: "Flight API",
      description: "Access real-time flight inventory from global GDS systems. Book domestic & international flights with instant confirmation.",
      badge: "Popular",
      badgeColor: "cyan",
      surface: featureSurfaces[0].surface,
      blobSurface: featureSurfaces[0].blobSurface,
      iconTone: featureSurfaces[0].iconTone,
      kicker: featureSurfaces[0].kicker,
    },
    {
      icon: Building2,
      title: "Hotel API",
      description: "Connect to 1M+ hotels worldwide. From budget stays to luxury resorts, offer your customers the best rates.",
      badge: "Popular",
      badgeColor: "cyan",
      surface: featureSurfaces[1].surface,
      blobSurface: featureSurfaces[1].blobSurface,
      iconTone: featureSurfaces[1].iconTone,
      kicker: featureSurfaces[1].kicker,
    },
    {
      icon: MessageSquare,
      title: "AI Sales Executive",
      description: "Multilingual chatbot and voicebot that converts visitors 24/7. Like a sales team that never sleeps — at a fraction of the cost.",
      badge: "Add-on",
      badgeColor: "purple",
      surface: featureSurfaces[2].surface,
      blobSurface: featureSurfaces[2].blobSurface,
      iconTone: featureSurfaces[2].iconTone,
      kicker: featureSurfaces[2].kicker,
    },
    {
      icon: CreditCard,
      title: "Visa API",
      description: "Streamline visa processing for 100+ countries. Digital applications, document management, and status tracking.",
      surface: featureSurfaces[3].surface,
      blobSurface: featureSurfaces[3].blobSurface,
      iconTone: featureSurfaces[3].iconTone,
      kicker: featureSurfaces[3].kicker,
    },
    {
      icon: Map,
      title: "Activities API",
      description: "Tours, experiences, and local activities. Give your customers access to thousands of curated experiences.",
      surface: featureSurfaces[4].surface,
      blobSurface: featureSurfaces[4].blobSurface,
      iconTone: featureSurfaces[4].iconTone,
      kicker: featureSurfaces[4].kicker,
    },
    {
      icon: Globe,
      title: "Own Domain",
      description: "Use your own custom domain. Your brand, your identity. No marhabaDMC branding visible to your customers.",
      surface: featureSurfaces[5].surface,
      blobSurface: featureSurfaces[5].blobSurface,
      iconTone: featureSurfaces[5].iconTone,
      kicker: featureSurfaces[5].kicker,
    },
    {
      icon: Palette,
      title: "White-Label Branding",
      description: "Complete customization with your logo, and available design themes. Make it truly yours with essential branding control.",
      surface: featureSurfaces[6].surface,
      blobSurface: featureSurfaces[6].blobSurface,
      iconTone: featureSurfaces[6].iconTone,
      kicker: featureSurfaces[6].kicker,
    },
  ];

  return (
    <section
      id="features"
      className="relative w-full overflow-hidden bg-white py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-repeat-x bg-bottom opacity-[0.04]" style={{ backgroundImage: "url('/assets/skyline.svg')" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={headerRef}
          className={cn(
            "relative mx-auto mb-16 max-w-3xl text-center opacity-0",
            headerVisible && "animate-fade-in",
          )}
        >
          <div className="absolute left-1/2 top-1 h-20 w-20 -translate-x-1/2 rounded-full bg-[#412A86]/10 blur-3xl" />
          <span className="inline-flex items-center gap-2 rounded-full bg-[#412A86] px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-sm mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            Complete API Suite
          </span>
          <h2 className="font-poppins text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Complete <span className="text-[#412A86]">API Suite</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
            Your integrated platform for travel business operations.
          </p>
          <div className="hidden lg:block absolute top-0 right-10 w-64 h-32 opacity-40 pointer-events-none bg-no-repeat bg-right mix-blend-multiply" style={{ backgroundImage: 'url("/assets/flight-path.svg")' }} />
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12"
        >
          {features.map((feature, index) => {
            const isTopRow = index < 3;
            const colSpanClass = isTopRow ? "lg:col-span-4" : "lg:col-span-3";

            return (
              <article
                key={feature.title}
                className={cn(
                  "group relative flex min-h-[240px] flex-col overflow-hidden rounded-2xl border p-8 opacity-0 shadow-sm transition-all duration-300",
                  "motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-soft-lg",
                  "border-black/5",
                  colSpanClass,
                  gridVisible && "animate-scale-in",
                )}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className={cn("pointer-events-none absolute right-4 top-4 h-20 w-20 rounded-full blur-2xl opacity-70 transition-transform duration-500 group-hover:scale-110", feature.blobSurface)} />
                <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#412A86]/10 transition-opacity duration-300 group-hover:opacity-100", index % 2 === 0 ? "opacity-60" : "opacity-40")} />

                <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
                  <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:translate-x-1">
                    {feature.kicker}
                  </span>

                  {feature.badge && (
                    <EyebrowChip color={feature.badgeColor ?? "cyan"} className="shrink-0 bg-cyan-50 text-cyan-600">
                      {feature.badge}
                    </EyebrowChip>
                  )}
                </div>

                <div className="relative z-10 flex flex-1 flex-col">
                  <div className="mb-5 flex items-center gap-4">
                    <div className={cn("flex h-16 w-16 items-center justify-center rounded-[34%_66%_56%_44%/39%_40%_60%_61%] shadow-sm ring-1 ring-black/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", feature.blobSurface)}>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                        <feature.icon className={cn("h-5 w-5", feature.iconTone)} strokeWidth={1.8} />
                      </div>
                    </div>

                    <div className="h-px flex-1 bg-gradient-to-r from-black/10 via-black/5 to-transparent" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#412A86]/60 transition-transform duration-300 group-hover:scale-125" />
                    <span>Designed for fast deployment and clear operations</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
