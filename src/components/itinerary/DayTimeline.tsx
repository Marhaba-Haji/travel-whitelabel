import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, Plus } from 'lucide-react';
import { useItinerary } from '@/contexts/ItineraryContext';
import ItineraryItemCard from './ItineraryItemCard';
import type { ItemType } from '@/types/itinerary';
import { useState } from 'react';

export default function DayTimeline() {
  const { state, addItem } = useItinerary();
  const [addingDay, setAddingDay] = useState<number | null>(null);

  const handleQuickAdd = (day: number, type: ItemType) => {
    addItem({
      id: crypto.randomUUID(),
      day,
      type,
      title: `New ${type}`,
      date: state.days.find(d => d.day === day)?.date,
    });
    setAddingDay(null);
  };

  if (state.days.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/60 flex items-center justify-center">
            <CalendarDays size={24} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Your itinerary will appear here</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Tell Nyra about your trip to get started</p>
        </motion.div>
      </div>
    );
  }

  const quickAddTypes: ItemType[] = ['flight', 'hotel', 'activity', 'meal', 'transport', 'transfer', 'visa', 'insurance'];

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-none">
      <AnimatePresence>
        {state.days.map((day, dayIdx) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: dayIdx * 0.08 }}
            className="relative"
          >
            {/* Timeline connector */}
            {dayIdx < state.days.length - 1 && (
              <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
            )}

            {/* Day header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 z-10">
                <span className="text-[10px] font-bold text-primary">{day.day}</span>
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">Day {day.day}</span>
                {day.date && <span className="text-[10px] text-muted-foreground ml-2">{day.date}</span>}
              </div>
              <button
                onClick={() => setAddingDay(addingDay === day.day ? null : day.day)}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Quick add menu */}
            <AnimatePresence>
              {addingDay === day.day && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-11 mb-3 flex flex-wrap gap-1.5"
                >
                  {quickAddTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => handleQuickAdd(day.day, type)}
                      className="text-[10px] px-2 py-1 rounded-full bg-muted/80 hover:bg-primary/10 text-muted-foreground hover:text-primary capitalize transition-colors"
                    >
                      + {type}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Items */}
            <div className="ml-11 space-y-2">
              <AnimatePresence>
                {day.items.map((item, idx) => (
                  <ItineraryItemCard key={item.id} item={item} index={idx} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
