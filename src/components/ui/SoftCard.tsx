import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Surface primitive for the new design system:
 * rounded-3xl white card with hairline border, soft shadow, optional hover lift.
 */
interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const SoftCard = React.forwardRef<HTMLDivElement, SoftCardProps>(
  ({ className, hover = false, as: Comp = "div", ...props }, ref) => {
    const Tag = Comp as any;
    return (
      <Tag
        ref={ref}
        className={cn(
          "rounded-3xl bg-white border border-gray-100 shadow-soft",
          hover &&
            "transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-lg",
          className,
        )}
        {...props}
      />
    );
  },
);
SoftCard.displayName = "SoftCard";

export default SoftCard;