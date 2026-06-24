import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton, GhostButton } from "../../components/ui/primitives";

export function AuthorityDeclarationScreen() {
  const navigate = useNavigate();

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Declaração de residência</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* protocol plate (dark) */}
        <div style={{ background: "#1A1814", borderRadius: 20, padding: 20, color: "#F8F5F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <span style={{ font: "700 10px Inter", letterSpacing: ".14em", color: "#A99E8C", lineHeight: 1.4 }}>
              SERVIÇO DE MIGRAÇÃO
              <br />E ESTRANGEIROS
            </span>
            <span style={{ font: "700 10px Inter", letterSpacing: ".08em", color: "#7FD3A6", background: "#2F7A5733", border: "1px solid #2F7A5766", borderRadius: 8, padding: "4px 9px" }}>DECLARADO</span>
          </div>
          <div style={{ font: "700 20px 'Space Mono'", color: "#E8C97A", marginTop: 14 }}>PROT. SME-2026-09813</div>
          <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 6 }}>Declarado em 24 Out 2026</div>
        </div>

        {/* fields */}
        <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "6px 16px" }}>
          <Row label="Titular" value="Maria Silva · PRT" />
          <Divider />
          <Row label="Morada (AFROLOC)" value="AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001" mono />
          <Divider />
          <Row label="Vínculo" value="Arrendamento · ARR-2026-1184" />
          <Divider />
          <Row label="Senhorio" value="João Bunga" />
        </div>

        {/* renewal reminder */}
        <div style={{ display: "flex", gap: 11, alignItems: "flex-start", background: "#F4EAD6", borderRadius: 14, padding: "13px 15px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B98421" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}>
            <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
          </svg>
          <span style={{ font: "500 12.5px Inter", color: "#7C6A4A", lineHeight: 1.45 }}>
            Renovar a declaração antes de <strong style={{ color: "#B0831F" }}>12 Jan 2027</strong> (validade da autorização de residência).
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <GhostButton onClick={() => navigator.share?.({ title: "Declaração SME", text: "PROT. SME-2026-09813 · AFROLOC AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001" })}>Partilhar</GhostButton>
          </div>
          <div style={{ flex: 1.3 }}>
            <PrimaryButton onClick={() => navigate("/share")}>Descarregar</PrimaryButton>
          </div>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", gap: 12 }}>
      <span style={{ font: "500 11px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", flex: "none" }}>{label}</span>
      <span style={{ font: `700 13.5px ${mono ? "'Space Mono'" : "Inter"}`, color: "#1A1814", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#EFE7DA" }} />;
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
