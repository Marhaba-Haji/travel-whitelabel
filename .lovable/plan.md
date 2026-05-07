## Goal

Fix the readability/contrast issues the user spotted: faded text in the admin panel, the date picker on `/book-demo`, and several low-contrast buttons across the site. Changes are purely visual (color/opacity tokens) — no layout, copy, or behavior changes.

## What I found

**1. Calendar (`/book-demo` and any other usage)** — `src/components/ui/calendar.tsx`
- `day_outside` uses `opacity-50` on top of already-muted text → numbers nearly invisible on white.
- `day_disabled` uses `opacity-50 text-muted-foreground` → disabled weekdays/Sundays look ghosted.
- `head_cell` (Mon/Tue/…) is `text-muted-foreground` at `text-[0.8rem]` → low contrast.
- `nav_button` uses `opacity-50` → arrows nearly invisible until hover.

**2. Admin panel** — `src/components/admin/AdminLayout.tsx` + tabs
- Sidebar inactive items are `text-sidebar-foreground` (HSL `240 5% 26%`) — OK, but the *active* state uses `bg-sidebar-accent` (very pale violet `270 55% 95%`) with `text-sidebar-accent-foreground` (`270 60% 40%`) — passes AA but feels washed on white. We'll deepen the active foreground to `270 65% 30%` and bump active background to `270 55% 92%` for a clearer selected state.
- `text-muted-foreground` is used heavily for table secondary cells (`NewsletterTab`, `OverviewTab`, etc.). Light-mode token is `215 18% 42%` — borderline. Bumping to `215 22% 32%` improves legibility in tables/cards without affecting dark mode.
- Sub-admin badge (`text-xs text-muted-foreground`) and user email in sidebar footer become readable as a side effect.

**3. Buttons** — `src/components/ui/button.tsx`
- `variant="ghost"` has no text color → inherits page color. On colored hero/footer backgrounds it can disappear. Add explicit `text-foreground`.
- `variant="outline"` uses `bg-background` + default text inheritance. Add explicit `text-foreground` so it never inherits a faded parent color.
- `variant="link"` is fine.
- The custom `SECONDARY_BTN` in `src/lib/design-tokens.ts` uses `text-gray-900` on `bg-white` — fine. No change.

**4. BookDemo time-slot grid** — `src/pages/BookDemo.tsx` line ~471
- Disabled (booked) slots use `text-gray-300` on `bg-gray-50` — fails AA. Change to `text-gray-400` on `bg-gray-100` with `line-through` retained, so users still understand they're unavailable but can read the time.

## Changes (minimal)

### `src/components/ui/calendar.tsx`
- `head_cell`: `text-muted-foreground` → `text-foreground/70 font-medium`
- `nav_button`: drop `opacity-50 hover:opacity-100` (keep hover bg)
- `day_outside`: `opacity-50` → `opacity-70` and use `text-foreground/55`
- `day_disabled`: `opacity-50` → keep `text-muted-foreground` but raise to `opacity-70` + add `line-through` for clarity

### `src/index.css` (light mode tokens only)
- `--muted-foreground: 215 18% 42%` → `215 22% 32%`
- `--sidebar-accent: 270 55% 95%` → `270 60% 92%`
- `--sidebar-accent-foreground: 270 60% 40%` → `270 65% 28%`

(Dark mode tokens untouched.)

### `src/components/ui/button.tsx`
- `ghost`: add `text-foreground` to the variant class
- `outline`: add `text-foreground` to the variant class

### `src/pages/BookDemo.tsx` (line ~471)
- Booked slot class: `bg-gray-50 text-gray-300 border-gray-100` → `bg-gray-100 text-gray-400 border-gray-200`

## Out of scope / will NOT change

- Brand palette (indigo `#412A86`, violet `#B968C7`, etc.)
- Hero/landing page typography colors (already AA)
- Dark-mode tokens (no reported issue)
- Any component layout, spacing, or behavior

## Verification

After approval I'll spot-check: `/admin` (Overview, Newsletter table, sidebar active state), `/book-demo` (calendar past/Sunday cells, booked time slots), and a ghost/outline button on the landing page header.
