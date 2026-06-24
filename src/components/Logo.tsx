/** AFROLOC brand mark — house outline enclosing a pin/person, on a gold-gradient
 *  rounded square. Recreated as SVG per the brand book (do not recolor/distort). */
export function Logo({ size = 32, wordmark = false }: { size?: number; wordmark?: boolean }) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="AFROLOC" role="img">
      <defs>
        <linearGradient id="afl-logo-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8C97A" />
          <stop offset="1" stopColor="#D4A853" />
        </linearGradient>
        <mask id="afl-logo-mask">
          <rect width="100" height="100" fill="#000" />
          <path
            d="M25 75 V47 Q25 41 29.5 37 L46 22 Q50 18.3 54 22 L70.5 37 Q75 41 75 47 V75"
            stroke="#fff"
            strokeWidth="8.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M50 55.5 C37.5 55.5 32.5 65.5 32.5 75 L67.5 75 C67.5 65.5 62.5 55.5 50 55.5 Z"
            fill="#fff"
          />
          <circle cx="50" cy="45" r="12.3" fill="#fff" />
          <circle cx="50" cy="45" r="5.1" fill="#000" />
        </mask>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#afl-logo-gold)" />
      <rect width="100" height="100" fill="#1A1814" mask="url(#afl-logo-mask)" />
    </svg>
  );

  if (!wordmark) return mark;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {mark}
      <span style={{ font: "800 18px Inter", letterSpacing: "0.02em" }}>AFROLOC</span>
    </span>
  );
}
