interface AuroraLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: {
    icon: "h-8",
    name: "text-[15px]",
    dmc: "text-[11px]",
    gap: "gap-2",
    leading: "-space-y-0.5",
  },
  md: {
    icon: "h-10",
    name: "text-lg",
    dmc: "text-xs",
    gap: "gap-2.5",
    leading: "-space-y-0.5",
  },
  lg: {
    icon: "h-12",
    name: "text-xl",
    dmc: "text-sm",
    gap: "gap-3",
    leading: "-space-y-1",
  },
};

const AuroraLogo = ({ size = "md", className = "" }: AuroraLogoProps) => {
  const s = sizes[size];

  return (
    <a href="/" className={`flex items-center ${s.gap} group ${className}`}>
      <img
        src="/assets/marhaba-logo-m.webp"
        alt="Marhaba DMC"
        width={56}
        height={56}
        className={`${s.icon} w-auto object-contain flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}
      />
      <div className={`flex flex-col ${s.leading}`}>
        <span
          className={`${s.name} font-marhaba tracking-[0.12em] text-foreground/90 uppercase`}
        >
          marhaba
        </span>
        <span
          className={`${s.dmc} font-dmc tracking-[0.3em] uppercase aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]`}
        >
          DMC
        </span>
      </div>
    </a>
  );
};

export default AuroraLogo;
