/**
 * Aurora Design System – shared gradient tokens
 * 3 core gradients for ~25% color variation reduction
 */

/** Standard vertical section padding on marketing pages */
export const SECTION_PY = "py-24";

/** Centered content width + horizontal padding */
export const SECTION_CONTAINER = "container mx-auto px-4 relative";

export const AURORA_GRADIENTS = [
  "from-aurora-blue to-aurora-teal",
  "from-aurora-purple to-aurora-blue",
  "from-aurora-teal to-emerald-500",
] as const;

export type AuroraGradient = (typeof AURORA_GRADIENTS)[number];

/** Get gradient by index (cycles for arrays longer than 3) */
export function getAuroraGradient(index: number): AuroraGradient {
  return AURORA_GRADIENTS[index % AURORA_GRADIENTS.length];
}

/**
 * Brand palette for the new (light, travel-marketing) design system.
 * Use these literal hex values via arbitrary Tailwind classes
 * (e.g. `bg-[#412A86]`, `text-[#B968C7]`).
 */
export const BRAND = {
  indigo: "#412A86", // primary CTA / headings accent
  violet: "#B968C7", // headline highlight word
  sky: "#2D9BFC", // illustration/hero shape
  pink: "#F472B6", // decorative dashed line
} as const;

/** Card base — rounded-3xl white surface with hairline border + soft shadow. */
export const CARD_BASE =
  "rounded-3xl bg-white border border-gray-100 shadow-soft";

/** Card hover lift. */
export const CARD_HOVER =
  "transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-lg";

/** Primary indigo pill button. */
export const PRIMARY_BTN =
  "inline-flex items-center justify-center h-12 rounded-full px-6 bg-[#412A86] hover:bg-[#412A86]/90 text-white font-semibold shadow-lg transition-colors";

/** Secondary white pill button. */
export const SECONDARY_BTN =
  "inline-flex items-center justify-center h-12 rounded-full px-6 bg-white border border-gray-200 hover:border-[#412A86]/40 text-gray-900 font-semibold shadow-sm transition-colors";
