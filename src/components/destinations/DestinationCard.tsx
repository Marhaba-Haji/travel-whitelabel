import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Flag from "react-world-flags";
import { getCountryCode } from "@/lib/destinations-data";
import { Destination } from "@/lib/destinations-data";

interface DestinationCardProps {
  destination: Destination;
  onHover?: () => void;
}

/**
 * Optimized destination card component
 * Memoized to prevent re-renders
 * Uses native HTML for minimal overhead
 */
export const DestinationCard = memo(function DestinationCard({
  destination,
  onHover,
}: DestinationCardProps) {
  const countryCode = getCountryCode(destination.name);

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        destination.featured ? "ring-2 ring-primary" : ""
      }`}
      onMouseEnter={onHover}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {/* Lazy-loaded flag - only render if visible */}
          <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0">
            <Flag code={countryCode} className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{destination.name}</h4>
            {destination.featured && (
              <span className="text-xs text-primary font-medium">Featured</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default DestinationCard;
