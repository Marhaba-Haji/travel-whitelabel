import { Compass } from "lucide-react";

interface LogoAnimatedProps {
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const LogoAnimated = ({ className = "", showIcon = true, size = "md" }: LogoAnimatedProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {showIcon && (
        <div className="relative">
          <Compass className={`${iconSizes[size]} text-primary animate-pulse-soft`} />
        </div>
      )}
      <span className={`font-bold ${sizeClasses[size]}`}>
        <span className="text-foreground">NOMAD</span>
        <span className="text-primary">ORE</span>
      </span>
    </div>
  );
};

export default LogoAnimated;
