

## Plan: Light/Dark Theme Toggle with Bright Default Theme

### Problem
The site currently defaults to a dark theme with hardcoded dark colors in `:root`. There is a `.light` class defined in CSS but it is never used -- no theme provider or toggle exists. The dark-only aesthetic can feel heavy and reduce engagement for first-time visitors.

### Strategy
1. **Default to light theme** for first-time visitors (better conversion psychology for B2B SaaS landing pages)
2. **Add a theme toggle** in the header so users can switch between light and dark
3. **Refine the light palette** to feel warm, bright, and premium (not just a CSS variable swap -- the glassmorphism and hardcoded dark backgrounds need light-mode equivalents)
4. **Persist preference** in localStorage

### Implementation Steps

#### 1. Install `next-themes` (already a dependency via sonner)
Wrap the app in `ThemeProvider` from `next-themes` with `defaultTheme="light"` and `attribute="class"`.

**File: `src/App.tsx`**
- Import `ThemeProvider` from `next-themes`
- Wrap the outermost component tree with `<ThemeProvider attribute="class" defaultTheme="light" storageKey="aurora-theme">`

#### 2. Refine the light theme CSS variables
**File: `src/index.css`**
- Move the current `:root` variables to `.dark` (merge with existing `.dark` block)
- Make `:root` use the `.light` values as the new default
- Warm up the light palette slightly: off-white background (`0 0% 99%`), softer borders, and a slightly richer purple primary
- Add light-mode aurora gradient overrides and glassmorphism utilities that use `bg-black/5` instead of `bg-white/5`

#### 3. Fix hardcoded dark colors across landing components
Several components have hardcoded dark HSL values that will look wrong in light mode:

- **Hero.tsx**: Replace `from-[hsl(230,40%,10%)]` background with theme-aware classes (e.g., `from-background`)
- **Hero.tsx**: The ambient blob uses `bg-aurora-purple/15` -- fine for both themes
- **StickyCTA.tsx**: `glass` utility with `border-white/10` -- needs light-mode variant
- **Header.tsx**: Scrolled state background uses dark glass -- needs conditional styling
- **ProductShowcase.tsx**: Uses `glass-card` and `glass` utilities throughout

#### 4. Update glassmorphism utilities for dual-theme support
**File: `src/index.css`**
```css
.glass {
  @apply bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 dark:border-white/10;
  /* Light mode overrides */
  @apply bg-black/[0.03] border-black/[0.06];
}
/* Use dark: prefix pattern for all glass utilities */
```

#### 5. Add theme toggle button to Header
**File: `src/components/landing/Header.tsx`**
- Import `useTheme` from `next-themes`
- Add a Sun/Moon icon toggle button next to the "Book Demo" button
- Subtle, icon-only button with smooth transition

#### 6. Ensure Sonner toaster uses the theme correctly
**File: `src/components/ui/sonner.tsx`** -- already uses `useTheme`, so this should work automatically once the provider is added.

### Files to Modify
| File | Change |
|------|--------|
| `src/App.tsx` | Wrap with `ThemeProvider` |
| `src/index.css` | Swap `:root` to light, merge dark into `.dark`, add light-mode glass utilities |
| `src/components/landing/Header.tsx` | Add Sun/Moon theme toggle |
| `src/components/landing/Hero.tsx` | Replace hardcoded dark gradient with theme-aware classes |
| `src/components/landing/StickyCTA.tsx` | Update glass border for light mode |
| `src/components/landing/Footer.tsx` | Check and fix any hardcoded dark backgrounds |

### Visual Outcome
- **Light mode (default)**: Clean white/off-white background, soft shadows instead of glows, darker text, purple accent remains, glass cards use subtle gray tint
- **Dark mode**: Current look preserved, with slight refinements
- **Toggle**: Small icon button in the header nav bar (Moon icon in light mode, Sun icon in dark mode)

