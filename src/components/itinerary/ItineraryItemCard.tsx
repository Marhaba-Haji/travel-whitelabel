import { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, BedDouble, FileCheck, MapPin, Car, ArrowRightLeft, UtensilsCrossed, Shield, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import type { ItineraryItem as IItem, ItemType } from '@/types/itinerary';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ICONS: Record<ItemType, React.ElementType> = {
  flight: Plane, hotel: BedDouble, visa: FileCheck, activity: MapPin,
  transport: Car, transfer: ArrowRightLeft, meal: UtensilsCrossed, insurance: Shield,
};

const COLORS: Record<ItemType, string> = {
  flight: '199 89% 48%', hotel: '263 70% 50%', visa: '45 93% 47%', activity: '152 69% 40%',
  transport: '25 95% 53%', transfer: '280 60% 50%', meal: '350 80% 55%', insurance: '215 14% 45%',
};

interface Props {
  item: IItem;
  index: number;
  sortable?: boolean;
}

export default function ItineraryItemCard({ item, index, sortable }: Props) {
  const { updateItem, removeItem, state } = useItinerary();
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editPrice, setEditPrice] = useState(item.price?.toString() || '');
  const [editDetails, setEditDetails] = useState(item.details || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !sortable || isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderLeftWidth: '3px',
    borderLeftColor: `hsl(${COLORS[item.type] || '215 14% 45%'})`,
  };

  const Icon = ICONS[item.type] || MapPin;
  const color = COLORS[item.type] || '215 14% 45%';
  const currency = state.tripInfo?.currency || 'INR';

  const formatPrice = (p: number) => {
    try {
      return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(p);
    } catch { return `${currency} ${p}`; }
  };

  const saveEdit = () => {
    updateItem(item.id, { title: editTitle, price: editPrice ? parseFloat(editPrice) : undefined, details: editDetails || undefined });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditTitle(item.title);
    setEditPrice(item.price?.toString() || '');
    setEditDetails(item.details || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
      className="group relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Glow on entry */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, hsl(${color} / 0.15), transparent 70%)` }}
      />

      <div className="relative p-3">
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          {sortable && !isEditing && (
            <button
              {...attributes}
              {...listeners}
              className="w-5 h-8 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-0.5 touch-none"
              tabIndex={-1}
            >
              <GripVertical size={14} />
            </button>
          )}

          {/* Type icon */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: `hsl(${color} / 0.12)` }}>
            <Icon size={15} style={{ color: `hsl(${color})` }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full text-sm font-semibold bg-muted/60 rounded px-2 py-1 text-foreground border border-border/50 outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <input
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  placeholder="Price"
                  type="number"
                  className="w-full text-xs bg-muted/60 rounded px-2 py-1 text-foreground border border-border/50 outline-none focus:ring-1 focus:ring-ring"
                />
                <textarea
                  value={editDetails}
                  onChange={e => setEditDetails(e.target.value)}
                  placeholder="Details..."
                  rows={2}
                  className="w-full text-xs bg-muted/60 rounded px-2 py-1 text-foreground border border-border/50 outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <div className="flex gap-1.5">
                  <button onClick={saveEdit} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Check size={10} /> Save
                  </button>
                  <button onClick={cancelEdit} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                    <X size={10} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground truncate">{item.title}</h4>
                  {item.price !== undefined && item.price > 0 && (
                    <span className="text-xs font-bold text-foreground shrink-0">{formatPrice(item.price)}</span>
                  )}
                </div>
                {item.subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {item.time && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.time}</span>}
                  {item.location && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.location}</span>}
                  {item.duration && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.duration}</span>}
                </div>
                {item.details && (
                  <>
                    <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-0.5 text-[10px] text-primary mt-1.5 hover:underline">
                      {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      {expanded ? 'Less' : 'Details'}
                    </button>
                    {expanded && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {item.details}
                      </motion.p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/80 hover:bg-muted transition-colors">
              <Pencil size={10} className="text-muted-foreground" />
            </button>
            <button onClick={() => removeItem(item.id)} className="w-6 h-6 rounded-md flex items-center justify-center bg-destructive/10 hover:bg-destructive/20 transition-colors">
              <Trash2 size={10} className="text-destructive" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
