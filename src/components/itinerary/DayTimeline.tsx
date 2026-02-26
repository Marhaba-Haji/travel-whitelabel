import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useItinerary } from '@/contexts/ItineraryContext';
import ItineraryItemCard from './ItineraryItemCard';
import type { ItemType, ItineraryItem } from '@/types/itinerary';

export default function DayTimeline() {
  const { state, addItem, reorderItem } = useItinerary();
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<ItineraryItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const allItems = useMemo(
    () => state.days.flatMap(d => d.items),
    [state.days]
  );

  const findItem = (id: string) => allItems.find(i => i.id === id);

  const findDayForItem = (itemId: string): number | undefined => {
    for (const d of state.days) {
      if (d.items.some(i => i.id === itemId)) return d.day;
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const item = findItem(String(event.active.id));
    if (item) setActiveItem(item);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // We handle everything in dragEnd for simplicity
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Check if dropping over a droppable day container
    const overDayMatch = overId.match(/^day-(\d+)$/);
    if (overDayMatch) {
      const targetDay = parseInt(overDayMatch[1], 10);
      const targetDayObj = state.days.find(d => d.day === targetDay);
      reorderItem(activeId, targetDay, targetDayObj?.items.length || 0);
      return;
    }

    // Dropping over another item
    const overDay = findDayForItem(overId);
    if (overDay === undefined) return;

    const targetDayObj = state.days.find(d => d.day === overDay);
    if (!targetDayObj) return;
    const overIndex = targetDayObj.items.findIndex(i => i.id === overId);

    reorderItem(activeId, overDay, overIndex >= 0 ? overIndex : 0);
  };

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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

              {/* Sortable items */}
              <div className="ml-11 space-y-2 min-h-[8px]" id={`day-${day.day}`}>
                <SortableContext
                  items={day.items.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {day.items.map((item, idx) => (
                      <ItineraryItemCard key={item.id} item={item} index={idx} sortable />
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeItem && (
            <div className="opacity-90 scale-[1.02] shadow-xl rounded-xl">
              <ItineraryItemCard item={activeItem} index={0} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
