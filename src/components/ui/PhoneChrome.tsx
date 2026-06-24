import type { CSSProperties, ReactNode } from "react";

/** iOS-style status bar (9:41, signal, 5G, battery) as in the design mocks. */
export function StatusBar({
  dark = false,
  offline = false,
  offlineLabel = "OFFLINE",
}: {
  dark?: boolean;
  offline?: boolean;
  offlineLabel?: string;
}) {
  const ink = dark ? "#F5F0E8" : "#1A1814";
  return (
    <div
      style={{
        height: 54,
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px 0 34px",
      }}
    >
      <span style={{ font: "600 15px Inter", color: ink }}>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 11 }}>
          {[4, 6, 8, 11].map((h) => (
            <div key={h} style={{ width: 3, height: h, background: ink, borderRadius: 1 }} />
          ))}
        </div>
        <span style={{ font: "700 11px Inter", color: offline ? "#D99A3A" : ink }}>
          {offline ? offlineLabel : "5G"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div
            style={{
              width: 23,
              height: 12,
              border: `1.5px solid ${ink}`,
              borderRadius: 3,
              padding: 1.5,
            }}
          >
            <div style={{ width: "72%", height: "100%", background: ink, borderRadius: 1 }} />
          </div>
          <div style={{ width: 2, height: 5, background: ink, borderRadius: "0 2px 2px 0" }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Full 390×844 phone frame: status bar + scrollable content + home indicator.
 * The screen content is the children; pass `bg` to match the design surface.
 */
export function PhoneChrome({
  children,
  bg = "#F8F5F0",
  dark = false,
  offline = false,
  offlineLabel,
  tabBar,
}: {
  children: ReactNode;
  bg?: string;
  dark?: boolean;
  offline?: boolean;
  offlineLabel?: string;
  /** Optional fixed bottom tab bar, rendered above the home indicator. */
  tabBar?: ReactNode;
}) {
  const frame: CSSProperties = {
    width: 390,
    height: 844,
    borderRadius: 46,
    background: bg,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 40px 70px -34px rgba(28,24,21,.5), 0 0 0 1px rgba(28,24,21,.05)",
    display: "flex",
    flexDirection: "column",
  };
  return (
    <div style={frame}>
      <StatusBar dark={dark} offline={offline} offlineLabel={offlineLabel} />
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {children}
      </div>
      {tabBar}
      <div
        style={{
          height: 26,
          flex: "none",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 9,
        }}
      >
        <div
          style={{
            width: 134,
            height: 5,
            borderRadius: 3,
            background: dark ? "#F5F0E8" : "#1A1814",
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}
