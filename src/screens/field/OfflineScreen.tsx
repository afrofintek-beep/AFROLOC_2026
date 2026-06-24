import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

export function OfflineScreen() {
  const navigate = useNavigate();

  return (
    <PhoneChrome bg="#1A1814" dark offline offlineLabel="SEM REDE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#F5F0E8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ width: 38 }} />
        <span style={{ width: 38 }} />
      </div>

      <div style={{ flex: 1, padding: "10px 26px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#F8F5F0", gap: 6, textAlign: "center" }}>
        {/* offline glyph */}
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#262019", border: "1px solid #3A332D", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D99A3A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
            <path d="M3 3l18 18" />
          </svg>
        </div>

        <div style={{ font: "700 11px Inter", letterSpacing: ".18em", color: "#D99A3A" }}>MODO OFFLINE</div>
        <div style={{ font: "700 30px 'Space Mono'", color: "#E8C97A", marginTop: 4 }}>3 na fila</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 18 }}>
          <StatusRow label="GPS ±6m capturado" />
          <StatusRow label="EXIF metadados ok" />
        </div>

        <p style={{ font: "400 12.5px Inter", color: "#A99E8C", lineHeight: 1.5, marginTop: 20, maxWidth: 240 }}>
          Sincroniza automaticamente quando houver rede.
        </p>

        <button
          onClick={() => navigate("/operator")}
          style={{ marginTop: 14, border: "1px solid #3A332D", background: "#262019", color: "#E8C97A", font: "700 13px Inter", borderRadius: 13, padding: "12px 22px", cursor: "pointer" }}
        >
          Ver lote de captura
        </button>
      </div>
    </PhoneChrome>
  );
}

function StatusRow({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, background: "#262019", border: "1px solid #3A332D", borderRadius: 13, padding: "12px 15px" }}>
      <span style={{ width: 24, height: 24, borderRadius: "50%", flex: "none", background: "#2F7A5733", border: "1px solid #2F7A5766", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5BC48E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
      <span style={{ font: "600 13px Inter", color: "#F8F5F0" }}>{label}</span>
    </div>
  );
}

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid #3A332D",
  background: "#262019",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;
