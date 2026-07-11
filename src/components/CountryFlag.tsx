interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 code (also accepts "UN"/"EU") */
  code: string;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

/**
 * Lightweight replacement for react-world-flags, which bundled every flag SVG
 * into a single multi-MB chunk. flagcdn serves tiny PNGs from a CDN instead.
 */
const CountryFlag = ({ code, className, style, "aria-label": ariaLabel }: CountryFlagProps) => {
  const cc = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      alt={ariaLabel || `${code} flag`}
      width={40}
      height={27}
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
    />
  );
};

export default CountryFlag;
