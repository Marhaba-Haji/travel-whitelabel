import { Moon, Star, Palmtree, Car, Ticket, Users, Compass, MapPinned, type LucideIcon } from "lucide-react";
import SoftCard from "@/components/ui/SoftCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  surface: string;
  blobSurface: string;
  iconTone: string;
};

const surfaces = [
  { surface: "bg-[#FFF8F6]", blobSurface: "bg-[#FFE6DD]", iconTone: "text-[#412A86]" },
  { surface: "bg-[#F4FBF9]", blobSurface: "bg-[#DDF7F1]", iconTone: "text-teal-600" },
  { surface: "bg-[#F7F4FD]", blobSurface: "bg-[#E9DFF9]", iconTone: "text-purple-600" },
  { surface: "bg-[#F7FAFF]", blobSurface: "bg-[#E2EBFB]", iconTone: "text-blue-600" },
  { surface: "bg-[#FBF5FF]", blobSurface: "bg-[#F1E1FB]", iconTone: "text-fuchsia-600" },
  { surface: "bg-[#FDF8F0]", blobSurface: "bg-[#F6E8C9]", iconTone: "text-orange-500" },
  { surface: "bg-[#F5FAF8]", blobSurface: "bg-[#DCF1E8]", iconTone: "text-emerald-600" },
  { surface: "bg-[#FFF2EE]", blobSurface: "bg-[#FFD9CB]", iconTone: "text-rose-500" },
];

const items: Omit<Service, "surface" | "blobSurface" | "iconTone">[] = [
  { icon: Moon, title: "Hajj Packages", description: "Curated Hajj journeys with vetted operators and end-to-end pilgrim support." },
  { icon: Star, title: "Umrah Packages", description: "Year-round Umrah departures bundled with visa, transport, and ziyarat." },
  { icon: Palmtree, title: "Halal Holiday Packages", description: "Family-friendly halal-certified getaways across destinations worldwide." },
  { icon: Car, title: "Car & Transport", description: "Private transfers, intercity cabs, and luxury fleet bookings on demand." },
  { icon: Ticket, title: "Activities Booking", description: "Tours, experiences and tickets across 100+ destinations, instantly confirmed." },
  { icon: Users, title: "Group Packages", description: "Custom group itineraries with negotiated fares for flights and hotels." },
  { icon: Compass, title: "Independent Packages", description: "Tailor-made FIT itineraries with full flexibility and traveller control." },
  { icon: MapPinned, title: "Guide Booking", description: "Certified local guides bookable on-demand in your preferred language." },
];

const services: Service[] = items.map((item, i) => ({ ...item, ...surfaces[i % surfaces.length] }));

const OurServices = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  return (
    <section className="relative w-full overflow-hidden bg-[#F7FAFF] py-24">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={cn(
            "mx-auto mb-14 max-w-3xl text-center opacity-0",
            headerVisible && "animate-fade-in",
          )}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#412A86] px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-sm mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            Our Services
          </span>
          <h2 className="font-poppins text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="text-[#412A86]">Our</span> Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
            We offer white-label solutions that let you launch your own branded product quickly and effortlessly.
            <span className="block">You sell under your name—we manage the technology behind the scenes.</span>
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service, index) => (
            <SoftCard
              key={service.title}
              hover
              className={cn(
                "group relative flex min-h-[260px] flex-col items-center overflow-hidden border-black/5 p-8 text-center opacity-0",
                service.surface,
                gridVisible && "animate-scale-in",
              )}
              style={{ animationDelay: `${index * 0.06}s` } as React.CSSProperties}
            >
              <div className={cn("pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-70 transition-transform duration-500 group-hover:scale-110", service.blobSurface)} />

              <div className={cn("relative mb-6 flex h-16 w-16 items-center justify-center rounded-[34%_66%_56%_44%/39%_40%_60%_61%] shadow-sm ring-1 ring-black/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", service.blobSurface)}>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                  <service.icon className={cn("h-5 w-5", service.iconTone)} strokeWidth={1.8} />
                </div>
              </div>

              <h3 className="relative text-lg font-bold text-gray-900">{service.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-gray-500">
                {service.description}
              </p>
            </SoftCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurServices;