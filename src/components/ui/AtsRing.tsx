/** Address Trust Score ring — an SVG donut filled to `score`% (0–100). */
export function AtsRing({
  score,
  size = 58,
  stroke = 7,
  track = "#E9E0D1",
  fill = "#2F7A57",
  bg = "#F8F5F0",
  fontSize = 17,
  fg = "#1A1814",
}: {
  score: number;
  size?: number;
  stroke?: number;
  track?: string;
  fill?: string;
  bg?: string;
  fontSize?: number;
  fg?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c;
  const center = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx={center} cy={center} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={fill}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: stroke,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: `700 ${fontSize}px Inter`,
          color: fg,
        }}
      >
        {score}
      </div>
    </div>
  );
}
