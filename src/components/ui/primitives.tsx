import type { CSSProperties, ReactNode } from "react";

/** Back chevron + centered "PASSO X DE N" label + step progress segments. */
export function FlowHeader({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <div style={{ padding: "0 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} aria-label="Voltar" style={chevronBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 11px Inter", letterSpacing: ".14em", color: "#8A8073" }}>
          PASSO {step} DE {total}
        </span>
        <span style={{ width: 38 }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < step ? "var(--afl-gold)" : "#E6DCCC",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const chevronBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid #EAE3D7",
  background: "#FFFDF9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

/** Gradient primary CTA (gradient bg, dark text, gold glow shadow). */
export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "none",
        width: "100%",
        height: 56,
        borderRadius: 16,
        background: disabled ? "#E6DCCC" : "linear-gradient(135deg,#D4A853,#E07B2C)",
        color: disabled ? "#A99E8C" : "#2D2519",
        font: "700 16px Inter",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 12px 24px -10px rgba(212,168,83,.7)",
      }}
    >
      {children}
    </button>
  );
}

/** Secondary outline button. */
export function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1.5px solid #E2D8C8",
        width: "100%",
        height: 54,
        borderRadius: 16,
        background: "transparent",
        color: "#1A1814",
        font: "600 15px Inter",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/** Small status pill with a leading dot. */
export function Pill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "green" | "amber" | "danger";
}) {
  const tones = {
    neutral: { bg: "#F1E7D6", dot: "#8A8073", fg: "#7C6A4A" },
    green: { bg: "#EBF1ED", dot: "#2F7A57", fg: "#2F7A57" },
    amber: { bg: "#F4EAD6", dot: "#D99A3A", fg: "#B98421" },
    danger: { bg: "#FBE3DE", dot: "#D14B3A", fg: "#D14B3A" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: tones.bg,
        borderRadius: 20,
        padding: "6px 13px",
        font: "600 12px Inter",
        color: tones.fg,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: tones.dot }} />
      {label}
    </span>
  );
}

/** Striped map placeholder with QGSQ grid overlay; optional pin/cell highlight. */
export function MapPlaceholder({
  height = 200,
  pin = true,
  caption,
  topLeft,
  bottomRight,
}: {
  height?: number;
  pin?: boolean;
  caption?: string;
  topLeft?: ReactNode;
  bottomRight?: ReactNode;
}) {
  return (
    <div
      style={{
        height,
        borderRadius: 24,
        position: "relative",
        overflow: "hidden",
        background: "repeating-linear-gradient(135deg,#EFE7DA 0 11px,#E9E0D1 11px 22px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#1c181510 1px,transparent 1px),linear-gradient(90deg,#1c181510 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      {topLeft && <div style={{ position: "absolute", left: 12, top: 12 }}>{topLeft}</div>}
      {pin && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "#D4A85322",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#D4A853",
                border: "4px solid #F8F5F0",
                boxShadow: "0 6px 14px -4px rgba(212,168,83,.8)",
              }}
            />
          </div>
        </div>
      )}
      {bottomRight && (
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 12,
            font: "700 11px 'Space Mono'",
            color: "#1A181499",
          }}
        >
          {bottomRight}
        </div>
      )}
      {caption && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 14,
            font: "700 11px 'Space Mono'",
            color: "#1A181499",
            letterSpacing: ".04em",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

/** Dark QGSQ code plate. */
export function CellPlate({ code, sub }: { code: string; sub?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        background: "#1A1814",
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: "#262019",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
            fill="none"
            stroke="#D4A853"
            strokeWidth="1.6"
          />
        </svg>
      </div>
      <div>
        <div style={{ font: "700 16px 'Space Mono'", color: "#F5F0E8", letterSpacing: ".02em" }}>{code}</div>
        {sub && <div style={{ font: "500 12px Inter", color: "#A99E8C", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
