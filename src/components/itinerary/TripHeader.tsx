import { Globe, CalendarDays, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useItinerary } from '@/contexts/ItineraryContext';

export default function TripHeader() {
  const { state, totalPrice } = useItinerary();
  const { tripInfo, guests } = state;

  if (!tripInfo) return null;

  const formatCurrency = (amount: number) => {
    const cur = tripInfo.currency || 'INR';
    try {
      return new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(amount);
    } catch { return `${cur} ${amount.toLocaleString()}`; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 py-4 border-b border-border/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-foreground truncate leading-tight">
            {tripInfo.title || 'Your Trip'}
          </h2>
          {tripInfo.destination && (
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
              <Globe size={13} />
              <span className="text-xs font-medium">{tripInfo.destination}</span>
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {(tripInfo.startDate || tripInfo.endDate) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                <CalendarDays size={11} />
                <span>{tripInfo.startDate}{tripInfo.endDate ? ` – ${tripInfo.endDate}` : ''}</span>
              </div>
            )}
            {guests.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                <Users size={11} />
                <span>{guests.length} guest{guests.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
        {totalPrice > 0 && (
          <motion.div
            key={totalPrice}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-right shrink-0"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Est. Total</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalPrice)}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
