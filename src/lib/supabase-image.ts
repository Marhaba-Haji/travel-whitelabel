// Supabase Storage image-transformation helpers.
// Converts /storage/v1/object/public/... URLs into the on-the-fly /render/image/public/...
// endpoint so we can request resized + WebP variants without re-uploading assets.

const OBJECT_SEGMENT = "/storage/v1/object/public/";
const RENDER_SEGMENT = "/storage/v1/render/image/public/";

export interface SupabaseImageOpts {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
}

export function transformSupabaseImage(url: string | null | undefined, opts: SupabaseImageOpts = {}): string {
  if (!url) return "";
  if (!url.includes(OBJECT_SEGMENT)) return url;

  const base = url.replace(OBJECT_SEGMENT, RENDER_SEGMENT);
  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  params.set("quality", String(opts.quality ?? 70));
  if (opts.resize) params.set("resize", opts.resize);
  // The render endpoint negotiates WebP/AVIF via Accept header automatically.
  return `${base}?${params.toString()}`;
}

/**
 * Build a `srcset` string with multiple width variants for responsive images.
 * Falls back to the original URL when transformations are not applicable.
 */
export function buildSupabaseSrcSet(
  url: string | null | undefined,
  widths: number[],
  opts: Omit<SupabaseImageOpts, "width"> = {},
): string {
  if (!url || !url.includes(OBJECT_SEGMENT)) return "";
  return widths
    .map((w) => `${transformSupabaseImage(url, { ...opts, width: w })} ${w}w`)
    .join(", ");
}
