import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePhoneMode } from "../lib/usePhoneMode";

/**
 * Scales a screen (which carries its own 390×844 phone / 1180×760 web frame)
 * down to fit the available canvas, mirroring the prototype's fit().
 */
export function PhoneFrame({
  format,
  children,
}: {
  format: "phone" | "web";
  children: ReactNode;
}) {
  const phone = usePhoneMode();
  const w = format === "web" ? 1180 : 390;
  const h = format === "web" ? 760 : 844;
  const [scale, setScale] = useState(1);
  const boxRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    function fit() {
      const wrap = boxRef.current?.parentElement;
      if (!wrap) return;
      const availW = wrap.clientWidth - 8;
      const availH = window.innerHeight - 120;
      const s = Math.max(0.3, Math.min(1, availW / w, availH / h));
      setScale(s);
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [w, h]);

  // Instalada / ecrã de telemóvel: preenche o ecrã, sem escalar a moldura fixa.
  if (phone && format === "phone") {
    return <div style={{ width: "100%", height: "100dvh" }}>{children}</div>;
  }

  // Outer box reserves the scaled footprint; inner box renders at design size.
  return (
    <div ref={boxRef} style={{ width: w * scale, height: h * scale }}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}
