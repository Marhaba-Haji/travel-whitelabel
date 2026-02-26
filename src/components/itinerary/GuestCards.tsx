import { motion, AnimatePresence } from 'motion/react';
import { User, X } from 'lucide-react';
import { useItinerary } from '@/contexts/ItineraryContext';

export default function GuestCards() {
  const { state, removeGuest } = useItinerary();
  const { guests } = state;

  if (guests.length === 0) return null;

  return (
    <div className="px-5 py-3 border-b border-border/50">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Travellers</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <AnimatePresence>
          {guests.map((guest) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 bg-muted/60 backdrop-blur-sm rounded-full pl-2 pr-1 py-1 shrink-0 group"
            >
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <User size={10} className="text-accent-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{guest.name}</span>
              {guest.age !== undefined && (
                <span className="text-[10px] text-muted-foreground">{guest.age}y</span>
              )}
              {guest.relation && (
                <span className="text-[10px] text-muted-foreground capitalize">· {guest.relation}</span>
              )}
              <button
                onClick={() => removeGuest(guest.id)}
                className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-opacity"
              >
                <X size={8} className="text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
