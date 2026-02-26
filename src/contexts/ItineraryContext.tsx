import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ItineraryState, ItineraryAction, ItineraryItem, Guest, TripInfo } from '@/types/itinerary';

const initialState: ItineraryState = {
  tripInfo: null,
  guests: [],
  days: [],
  isActive: false,
};

function itineraryReducer(state: ItineraryState, action: ItineraryAction): ItineraryState {
  switch (action.type) {
    case 'ACTIVATE':
      return { ...state, isActive: true };

    case 'RESET':
      return { ...initialState };

    case 'SET_TRIP_INFO':
      return {
        ...state,
        isActive: true,
        tripInfo: state.tripInfo
          ? { ...state.tripInfo, ...action.payload }
          : { title: '', destination: '', currency: 'INR', ...action.payload },
      };

    case 'SET_GUESTS':
      return { ...state, guests: action.payload };

    case 'ADD_GUEST':
      return { ...state, guests: [...state.guests, action.payload] };

    case 'REMOVE_GUEST':
      return { ...state, guests: state.guests.filter(g => g.id !== action.payload) };

    case 'ADD_ITEM': {
      const item = action.payload;
      const existingDay = state.days.find(d => d.day === item.day);
      if (existingDay) {
        return {
          ...state,
          isActive: true,
          days: state.days.map(d =>
            d.day === item.day ? { ...d, items: [...d.items, item] } : d
          ).sort((a, b) => a.day - b.day),
        };
      }
      return {
        ...state,
        isActive: true,
        days: [...state.days, { day: item.day, date: item.date, items: [item] }].sort((a, b) => a.day - b.day),
      };
    }

    case 'UPDATE_ITEM':
      return {
        ...state,
        days: state.days.map(d => ({
          ...d,
          items: d.items.map(i => i.id === action.payload.id ? { ...i, ...action.payload.updates } : i),
        })),
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        days: state.days
          .map(d => ({ ...d, items: d.items.filter(i => i.id !== action.payload) }))
          .filter(d => d.items.length > 0),
      };

    case 'REORDER_ITEM': {
      const { id, newDay, newIndex } = action.payload;
      let movedItem: ItineraryItem | null = null;
      let daysWithout = state.days.map(d => {
        const found = d.items.find(i => i.id === id);
        if (found) {
          movedItem = { ...found, day: newDay };
          return { ...d, items: d.items.filter(i => i.id !== id) };
        }
        return d;
      }).filter(d => d.items.length > 0);

      if (!movedItem) return state;

      const targetDay = daysWithout.find(d => d.day === newDay);
      if (targetDay) {
        const items = [...targetDay.items];
        items.splice(newIndex, 0, movedItem);
        daysWithout = daysWithout.map(d => d.day === newDay ? { ...d, items } : d);
      } else {
        daysWithout.push({ day: newDay, date: movedItem.date, items: [movedItem] });
        daysWithout.sort((a, b) => a.day - b.day);
      }
      return { ...state, days: daysWithout };
    }

    default:
      return state;
  }
}

interface ItineraryContextValue {
  state: ItineraryState;
  dispatch: React.Dispatch<ItineraryAction>;
  addItem: (item: ItineraryItem) => void;
  updateItem: (id: string, updates: Partial<ItineraryItem>) => void;
  removeItem: (id: string) => void;
  setTripInfo: (info: Partial<TripInfo>) => void;
  setGuests: (guests: Guest[]) => void;
  addGuest: (guest: Guest) => void;
  removeGuest: (id: string) => void;
  totalPrice: number;
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null);

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(itineraryReducer, initialState);

  const addItem = useCallback((item: ItineraryItem) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const updateItem = useCallback((id: string, updates: Partial<ItineraryItem>) => dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } }), []);
  const removeItem = useCallback((id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const setTripInfo = useCallback((info: Partial<TripInfo>) => dispatch({ type: 'SET_TRIP_INFO', payload: info }), []);
  const setGuests = useCallback((guests: Guest[]) => dispatch({ type: 'SET_GUESTS', payload: guests }), []);
  const addGuest = useCallback((guest: Guest) => dispatch({ type: 'ADD_GUEST', payload: guest }), []);
  const removeGuest = useCallback((id: string) => dispatch({ type: 'REMOVE_GUEST', payload: id }), []);

  const totalPrice = state.days.reduce((sum, d) => sum + d.items.reduce((s, i) => s + (i.price || 0), 0), 0);

  return (
    <ItineraryContext.Provider value={{ state, dispatch, addItem, updateItem, removeItem, setTripInfo, setGuests, addGuest, removeGuest, totalPrice }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const ctx = useContext(ItineraryContext);
  if (!ctx) throw new Error('useItinerary must be used within ItineraryProvider');
  return ctx;
}
