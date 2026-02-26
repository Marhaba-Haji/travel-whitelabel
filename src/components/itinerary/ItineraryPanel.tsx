import { motion } from 'motion/react';
import { useItinerary } from '@/contexts/ItineraryContext';
import TripHeader from './TripHeader';
import GuestCards from './GuestCards';
import DayTimeline from './DayTimeline';

export default function ItineraryPanel() {
  const { state, totalPrice } = useItinerary();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-background/95 backdrop-blur-md"
    >
      {/* Header */}
      <TripHeader />

      {/* Guests */}
      <GuestCards />

      {/* Day timeline */}
      <DayTimeline />

      {/* Footer with total */}
      {totalPrice > 0 && state.days.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-3 border-t border-border/50 bg-muted/30 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Total</span>
            <motion.span
              key={totalPrice}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-base font-bold text-foreground"
            >
              {(() => {
                const cur = state.tripInfo?.currency || 'INR';
                try { return new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(totalPrice); }
                catch { return `${cur} ${totalPrice.toLocaleString()}`; }
              })()}
            </motion.span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
