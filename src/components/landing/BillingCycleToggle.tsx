import { BillingCycle } from "@/hooks/usePlans";
import { cn } from "@/lib/utils";

interface BillingCycleToggleProps {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
  savingsLabel?: string | null;
  size?: "md" | "sm";
  className?: string;
}

const BillingCycleToggle = ({
  value,
  onChange,
  savingsLabel,
  size = "md",
  className,
}: BillingCycleToggleProps) => {
  const pad = size === "sm" ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm";
  return (
    <div
      role="tablist"
      aria-label="Billing cycle"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-[0_4px_16px_rgb(0,0,0,0.04)]",
        className,
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-full font-semibold transition-all duration-200",
          pad,
          value === "monthly"
            ? "bg-[#412A86] text-white shadow-sm"
            : "text-gray-500 hover:text-gray-900",
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "annual"}
        onClick={() => onChange("annual")}
        className={cn(
          "rounded-full font-semibold transition-all duration-200 flex items-center gap-2",
          pad,
          value === "annual"
            ? "bg-[#412A86] text-white shadow-sm"
            : "text-gray-500 hover:text-gray-900",
        )}
      >
        Annual
        {savingsLabel && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide",
              value === "annual"
                ? "bg-white/20 text-white"
                : "bg-emerald-50 text-emerald-600",
            )}
          >
            {savingsLabel}
          </span>
        )}
      </button>
    </div>
  );
};

export default BillingCycleToggle;