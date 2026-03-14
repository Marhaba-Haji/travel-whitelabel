import { useState, useRef, useEffect } from "react";

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurSize?: number;
}

/**
 * Image component with a tiny inline blur placeholder.
 * Uses a small canvas to generate a blurred preview from the 400w variant,
 * then cross-fades to the full image once loaded.
 */
const BlurImage = ({ src, alt, className, blurSize = 20, ...props }: BlurImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Generate a tiny placeholder from the smallest available image
    const isBlogImage = src.includes("/blog-images/");
    const base = src.replace(/-\d+w\.webp$/, "");
    const thumbUrl = isBlogImage && base !== src ? `${base}-400w.webp` : src;

    const tiny = new Image();
    tiny.crossOrigin = "anonymous";
    tiny.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = blurSize / Math.max(tiny.width, tiny.height);
        canvas.width = Math.max(1, Math.round(tiny.width * scale));
        canvas.height = Math.max(1, Math.round(tiny.height * scale));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(tiny, 0, 0, canvas.width, canvas.height);
          setPlaceholder(canvas.toDataURL("image/webp", 0.3));
        }
      } catch {
        // CORS or other error — skip placeholder
      }
    };
    tiny.src = thumbUrl;
  }, [src, blurSize]);

  useEffect(() => {
    // If image is already cached and loaded instantly
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <span className={`relative overflow-hidden block ${className || ""}`} style={{ isolation: "isolate" }}>
      {/* Blur placeholder */}
      {placeholder && !loaded && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(20px)", transform: "scale(1.1)" }}
        />
      )}
      {/* Real image */}
      <img
        ref={imgRef}
        {...props}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto ${loaded ? "opacity-100" : "opacity-0 transition-opacity duration-500"}`}
      />
    </span>
  );
};

export default BlurImage;
