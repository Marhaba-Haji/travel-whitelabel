

# Real-Time Voice-Driven Itinerary Builder

## Overview

When a customer starts talking to Nyra about a trip, the widget expands into a stunning split-screen experience: Nyra's voice call on one side, and a beautifully designed live itinerary being built in real-time on the other. Nyra adds flights, hotels, visas, activities, transport, meals, insurance -- all organized day-by-day with dates, prices, and guest details. The customer can also manually edit, delete, reorder, or modify any item directly on the page.

---

## Architecture

```text
+---------------------------+     tool calls      +------------------+
|  Gemini Live API (Voice)  | ──────────────────> |  useLiveAPI.ts   |
+---------------------------+                      +------------------+
                                                          |
                                              update_itinerary tool
                                                          |
                                                   React state
                                                   (useItinerary)
                                                          |
                                          +-------------------------------+
                                          |   Expanded Nyra Panel         |
                                          |  [Voice Call] | [Itinerary]   |
                                          +-------------------------------+
```

No database table needed initially -- the itinerary lives in React state during the call. Persistence (save/share/PDF) can be added later.

---

## What Gets Built

### 1. New Gemini Tool: `update_itinerary`

A new function declaration added to `useLiveAPI.ts` tools. Nyra calls this whenever she discusses a travel component:

- **Action**: `add`, `update`, `remove`, `set_guests`, `set_trip_info`
- **Item types**: `flight`, `hotel`, `visa`, `activity`, `transport`, `transfer`, `meal`, `insurance`
- **Fields**: day number, date, title, description, price, currency, guest names/ages, duration, location, etc.

This tool updates a shared React state store (via a new `useItinerary` hook/context) that the UI subscribes to.

### 2. Itinerary Data Model (TypeScript types)

```text
TripInfo: title, destination, startDate, endDate, currency
Guest: name, age, relation (e.g. "spouse", "child")
ItineraryItem: id, day, date, type, title, subtitle, price, details, guestIds
ItineraryState: tripInfo, guests[], days[] (each day has items[])
```

### 3. Itinerary Context (`useItinerary` hook)

- Shared React context providing the itinerary state
- Exposes actions: `addItem`, `updateItem`, `removeItem`, `reorderItem`, `setGuests`, `setTripInfo`
- The `useLiveAPI` tool handler calls these actions
- The UI panel reads from this context for real-time rendering

### 4. Expanded Nyra Widget UI

When Nyra starts building an itinerary, the widget transforms:

- **Collapsed mode** (current): Small floating button + popup card
- **Expanded mode** (new): Full-screen or near-full overlay with two panels:
  - **Left panel (~35%)**: Voice call controls (mic button, speaking indicator, waveform visualization)
  - **Right panel (~65%)**: Live itinerary viewer/editor

The transition uses smooth Motion animations (scale, slide, fade).

### 5. Itinerary Panel Design

**Header section:**
- Trip title with gradient text animation
- Destination with a subtle globe icon
- Date range pill
- Guest count badge
- Total estimated price with animated counter

**Guest cards:**
- Horizontal scrollable cards showing each guest (name, age, relation)
- Ability to click to edit or remove

**Day-by-day timeline:**
- Vertical timeline with animated connector lines
- Each day is a section with the date as a header
- Items within each day are cards with:
  - Type icon (plane for flights, bed for hotels, map-pin for activities, etc.)
  - Color-coded left border per type
  - Title, subtitle, time, price
  - Expand/collapse for details
  - Edit and delete buttons (manual editing)
  - Smooth entry animation (slide-up-fade) when Nyra adds them

**Bottom bar:**
- Running total price with animated counter
- "Share" and "Download PDF" placeholder buttons

### 6. Manual Editing Capabilities

Each itinerary item supports:
- **Inline edit**: Click title/price/date to edit directly
- **Delete**: Remove with confirmation
- **Drag to reorder**: Within the same day
- **Add manually**: "+" button on each day to add items without voice

### 7. Updated System Instruction

Add instructions telling Nyra to use the `update_itinerary` tool as she discusses travel components, building the package step by step.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/contexts/ItineraryContext.tsx` | Create -- itinerary state management |
| `src/types/itinerary.ts` | Create -- TypeScript types |
| `src/components/itinerary/ItineraryPanel.tsx` | Create -- main itinerary viewer |
| `src/components/itinerary/DayTimeline.tsx` | Create -- day-by-day timeline |
| `src/components/itinerary/ItineraryItem.tsx` | Create -- individual item card |
| `src/components/itinerary/GuestCards.tsx` | Create -- guest display/edit |
| `src/components/itinerary/TripHeader.tsx` | Create -- trip info header |
| `src/components/itinerary/ItineraryFooter.tsx` | Create -- totals bar |
| `src/components/NyraWidget.tsx` | Modify -- add expanded panel mode |
| `src/hooks/useLiveAPI.ts` | Modify -- add update_itinerary tool |
| `src/App.tsx` | Modify -- wrap with ItineraryProvider |

---

## Visual Design Details

- **Color coding by item type**: Flights (sky blue), Hotels (violet), Visa (amber), Activities (emerald), Transport (orange), Meals (rose), Insurance (slate)
- **Animated entry**: Each new item slides in with a subtle glow effect when Nyra adds it
- **Glass-morphism cards**: Semi-transparent cards with backdrop blur
- **Gradient timeline line**: Animated gradient flowing down the day connector
- **Price counter**: Numbers animate up/down when prices change (using AnimatedCounter pattern already in the project)
- **Responsive**: On mobile, the expanded view stacks vertically (voice on top, itinerary below as scrollable)

---

## Implementation Sequence

1. Create TypeScript types and ItineraryContext
2. Build the itinerary UI components (panel, timeline, items, guests, header, footer)
3. Add `update_itinerary` tool declaration and handler to `useLiveAPI.ts`
4. Refactor `NyraWidget.tsx` to support expanded panel mode
5. Update system instruction to guide Nyra on itinerary building
6. Wrap App with ItineraryProvider
7. Add manual editing (inline edit, delete, reorder)
8. Polish animations and responsive design

