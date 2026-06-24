import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton, Pill } from "../../components/ui/primitives";
import { LiveMap } from "../../components/ui/LiveMap";
import { cellForCoords } from "../../lib/qgsq";

export function AuthorityGpsScreen() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const cell = cellForCoords(-8.8995, 13.2052, 10);

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>GPS da autoridade</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <LiveMap lat={-8.8995} lng={13.2052} accuracy={3} cell={cell} height={210} zoom={19} />
          <div style={{ position: "absolute", left: 12, top: 12, zIndex: 500 }}>
            <Pill label="Autoridade no local · ±3 m" tone="green" />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#EBF1ED", borderRadius: 14, padding: "13px 15px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
          <span style={{ font: "500 12.5px Inter", color: "#2F7A57", lineHeight: 1.4 }}>
            Captura presencial por autoridade certificada dá o nível de confiança máximo.
          </span>
        </div>

        <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <Row label="Morada" value="AO-LUA-LDA-MAI-CEN-G10-X6B22-Y49J9-0001" mono />
          <div style={{ height: 1, background: "#EFE7DA" }} />
          <Row label="Agente" value="Carlos Nguvu · N3" />
          <div style={{ height: 1, background: "#EFE7DA" }} />
          <Row label="Precisão" value={`±3 m · alta precisão`} />
        </div>

        {confirmed && <div style={{ font: "600 12px Inter", color: "#2F7A57", textAlign: "center" }}>Ponto da autoridade confirmado · confiança máxima</div>}

        <div style={{ paddingTop: 2 }}>
          <PrimaryButton disabled={confirmed} onClick={() => setConfirmed(true)}>
            {confirmed ? "Ponto confirmado" : "Confirmar ponto da autoridade"}
          </PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ font: "500 11px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
      <span style={{ font: `700 13.5px ${mono ? "'Space Mono'" : "Inter"}`, color: "#1A1814" }}>{value}</span>
    </div>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
