import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/** Brand bar: actual device time, without fabricated signal or battery readings. */
export function StatusBar({ dark = false, offline = false, offlineLabel = "OFFLINE" }: { dark?: boolean; offline?: boolean; offlineLabel?: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(id); }, []);
  return <div style={{ height: 54, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", color: dark ? "#F5F0E8" : "#1A1814" }}>
    <span style={{ font: "600 13px Inter" }}>{now.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}</span>
    <span style={{ font: "700 10px Inter", letterSpacing: ".12em" }}>{offline ? offlineLabel : "AFROLOC"}</span>
  </div>;
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
