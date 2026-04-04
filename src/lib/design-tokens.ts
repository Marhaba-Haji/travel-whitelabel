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
