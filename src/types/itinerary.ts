export type ItemType = 'flight' | 'hotel' | 'visa' | 'activity' | 'transport' | 'transfer' | 'meal' | 'insurance';

export interface Guest {
  id: string;
  name: string;
  age?: number;
  relation?: string;
}

export interface TripInfo {
  title: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  currency: string;
}

export interface ItineraryItem {
  id: string;
  day: number;
  date?: string;
  type: ItemType;
  title: string;
  subtitle?: string;
  price?: number;
  details?: string;
  time?: string;
  location?: string;
  duration?: string;
}

export interface ItineraryDay {
  day: number;
  date?: string;
  items: ItineraryItem[];
}

export interface ItineraryState {
  tripInfo: TripInfo | null;
  guests: Guest[];
  days: ItineraryDay[];
  isActive: boolean;
}

export type ItineraryAction =
  | { type: 'SET_TRIP_INFO'; payload: Partial<TripInfo> }
  | { type: 'SET_GUESTS'; payload: Guest[] }
  | { type: 'ADD_GUEST'; payload: Guest }
  | { type: 'REMOVE_GUEST'; payload: string }
  | { type: 'ADD_ITEM'; payload: ItineraryItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<ItineraryItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'REORDER_ITEM'; payload: { id: string; newDay: number; newIndex: number } }
  | { type: 'ACTIVATE' }
  | { type: 'RESET' };

export const ITEM_TYPE_CONFIG: Record<ItemType, { label: string; icon: string; color: string }> = {
  flight: { label: 'Flight', icon: 'Plane', color: '199 89% 48%' },
  hotel: { label: 'Hotel', icon: 'BedDouble', color: '263 70% 50%' },
  visa: { label: 'Visa', icon: 'FileCheck', color: '45 93% 47%' },
  activity: { label: 'Activity', icon: 'MapPin', color: '152 69% 40%' },
  transport: { label: 'Transport', icon: 'Car', color: '25 95% 53%' },
  transfer: { label: 'Transfer', icon: 'ArrowRightLeft', color: '280 60% 50%' },
  meal: { label: 'Meal', icon: 'UtensilsCrossed', color: '350 80% 55%' },
  insurance: { label: 'Insurance', icon: 'Shield', color: '215 14% 45%' },
};
