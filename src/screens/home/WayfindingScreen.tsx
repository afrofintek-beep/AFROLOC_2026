import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton, GhostButton } from "../../components/ui/primitives";
import { primaryAddress } from "../../data/account";
import { useGeolocation } from "../../lib/useGeolocation";
import { useDeviceHeading } from "../../lib/useDeviceHeading";
import { bearingDeg, cardinalFull, cardinalShort, formatDistance, haversineMeters, walkMinutes } from "../../lib/geo";

const TARGET = { lat: -8.899, lng: 13.205 };
// Seeded "current" position ~240 m SW of the target, so the target lies NE
// (matches the design) until real GPS replaces it.
const SEED_CURRENT = { lat: -8.900524, lng: 13.203457 };

const STEPS = [
  "Igreja Sant'Ana — vire à direita",
  "Depósito de água azul à esquerda",
  "3.ª casa à direita — destino",
];

export function WayfindingScreen() {
  const navigate = useNavigate();
  const { fix, locate } = useGeolocation();
  const { heading, request } = useDeviceHeading();

  useEffect(() => {
    locate();
  }, [locate]);

  const cur = fix ?? SEED_CURRENT;
  const dist = haversineMeters(cur.lat, cur.lng, TARGET.lat, TARGET.lng);
  const bearing = bearingDeg(cur.lat, cur.lng, TARGET.lat, TARGET.lng);
  // Arrow points to target; if a live compass heading exists, make it relative
  // to where the device is facing.
  const arrowDeg = heading != null ? (bearing - heading + 360) % 360 : bearing;
  const live = heading != null;

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 14px 'Space Mono'", color: "#1A1814" }}>{primaryAddress.code}</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "10px 22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* direction dial (dark) */}
        <div style={{ background: "var(--afl-grad-hero)", borderRadius: 24, padding: "26px 20px", color: "#F8F5F0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Dial arrowDeg={arrowDeg} cardinal={cardinalShort(bearing)} />
          <div style={{ font: "700 40px 'Space Mono'", color: "#E8C97A", marginTop: 18 }}>{formatDistance(dist)}</div>
          <div style={{ font: "500 13px Inter", color: "#A99E8C", marginTop: 6, textAlign: "center" }}>
            Siga para {cardinalFull(bearing)} · ~{walkMinutes(dist)} min a pé
          </div>
          <div style={{ font: "600 10px Inter", letterSpacing: ".08em", color: live ? "#7FD3A6" : "#A99E8C", marginTop: 10 }}>
            {live ? "● BÚSSOLA ACTIVA" : "BÚSSOLA INACTIVA · rumo a partir do norte"}
          </div>
        </div>

        {/* landmark steps */}
        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>Marcos no caminho</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", flex: "none", background: i === STEPS.length - 1 ? "#D4A853" : "#F0EADE", color: i === STEPS.length - 1 ? "#2D2519" : "#8A8073", display: "flex", alignItems: "center", justifyContent: "center", font: "700 12px 'Space Mono'" }}>
                  {i + 1}
                </span>
                <span style={{ font: "500 13px Inter", color: "#1A1814" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton onClick={() => { void request(); void locate(); }}>Iniciar guia</PrimaryButton>
          <a href="tel:+244923303030" style={{ textDecoration: "none" }}>
            <GhostButton>Ligar ao titular</GhostButton>
          </a>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Dial({ arrowDeg, cardinal }: { arrowDeg: number; cardinal: string }) {
  return (
    <div style={{ position: "relative", width: 168, height: 168 }}>
      <svg width="168" height="168" viewBox="0 0 168 168">
        <circle cx="84" cy="84" r="80" fill="none" stroke="#2E2720" strokeWidth="2" />
        <circle cx="84" cy="84" r="68" fill="none" stroke="#3A332D" strokeWidth="1" />
        {/* tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          const major = i % 6 === 0;
          const r1 = 80;
          const r2 = major ? 70 : 75;
          return (
            <line
              key={i}
              x1={84 + r1 * Math.sin(a)}
              y1={84 - r1 * Math.cos(a)}
              x2={84 + r2 * Math.sin(a)}
              y2={84 - r2 * Math.cos(a)}
              stroke={major ? "#A99E8C" : "#3A332D"}
              strokeWidth={major ? 2 : 1}
            />
          );
        })}
        {/* rotating arrow */}
        <g transform={`rotate(${arrowDeg} 84 84)`}>
          <path d="M84 28 L98 92 L84 80 L70 92 Z" fill="#D4A853" />
        </g>
      </svg>
      {/* cardinal labels */}
      <Label t="N" style={{ top: 6, left: "50%", transform: "translateX(-50%)" }} />
      <Label t="E" style={{ right: 8, top: "50%", transform: "translateY(-50%)" }} />
      <Label t="S" style={{ bottom: 6, left: "50%", transform: "translateX(-50%)" }} />
      <Label t="O" style={{ left: 8, top: "50%", transform: "translateY(-50%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <span style={{ font: "700 11px Inter", letterSpacing: ".12em", color: "#A99E8C" }}>RUMO</span>
        <span style={{ font: "700 20px 'Space Mono'", color: "#F8F5F0" }}>{cardinal}</span>
      </div>
    </div>
  );
}

function Label({ t, style }: { t: string; style: React.CSSProperties }) {
  return <span style={{ position: "absolute", font: "700 11px Inter", color: "#8A8073", ...style }}>{t}</span>;
}

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid #EAE3D7",
  background: "#FFFDF9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;
