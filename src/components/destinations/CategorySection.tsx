import { memo, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Category } from "@/lib/destinations-data";
import DestinationCard from "./DestinationCard";
import type { ReactElement } from "react";

interface CategorySectionProps {
  category: Category;
  icon: ReactElement;
  isVisible?: boolean;
}

/**
 * Optimized category section component
 * - Only renders when visible via scroll animation
 * - Memoized to prevent unnecessary re-renders
 * - Suspense wrapper for lazy components
 */
export const CategorySection = memo(function CategorySection({
  category,
  icon,
  isVisible: externalVisible,
}: CategorySectionProps) {
  const { ref, isVisible: scrollVisible } = useScrollAnimation();
  const isVisible = externalVisible !== undefined ? externalVisible : scrollVisible;

  // Don't render until scrolled into view (performance optimization)
  if (!isVisible && externalVisible === undefined) {
    return <div ref={ref} className="h-64" aria-label={`${category.name} section placeholder`} />;
  }

  return (
    <div ref={ref} className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-2xl">{icon}</div>
          <div>
            <h3 className="text-2xl font-bold">{category.name}</h3>
          </div>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          {category.description}
        </p>
      </div>

      {/* Lazy-load destination grid */}
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><SkeletonLoading count={3} /></div>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.destinations.map((destination, idx) => (
            <DestinationCard key={`${category.id}-${idx}`} destination={destination} />
          ))}
        </div>
      </Suspense>
    </div>
  );
});

/**
 * Skeleton loading placeholder
 */
function SkeletonLoading({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default CategorySection;
