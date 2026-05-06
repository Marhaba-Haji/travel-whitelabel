import { cn } from "@/lib/utils";

type ChipColor = "blue" | "teal" | "purple" | "pink" | "orange" | "cyan" | "indigo";

const colorMap: Record<ChipColor, string> = {
  blue: "bg-blue-50 text-blue-600",
  teal: "bg-teal-50 text-teal-600",
  purple: "bg-purple-50 text-purple-600",
  pink: "bg-pink-50 text-pink-600",
  orange: "bg-orange-50 text-orange-500",
  cyan: "bg-cyan-50 text-cyan-600",
  indigo: "bg-[#412A86]/10 text-[#412A86]",
};

interface EyebrowChipProps {
  color?: ChipColor;
  className?: string;
  children: React.ReactNode;
}

const EyebrowChip = ({ color = "cyan", className, children }: EyebrowChipProps) => (
  <span
    className={cn(
      "inline-block font-bold tracking-wide text-xs px-4 py-1.5 rounded-full uppercase",
      colorMap[color],
      className,
    )}
  >
    {children}
  </span>
);

export default EyebrowChip;