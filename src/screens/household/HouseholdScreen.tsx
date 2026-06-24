import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { householdMeta, members } from "../../data/household";

export function HouseholdScreen() {
  const navigate = useNavigate();

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Agregado familiar</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* address chip */}
        <div style={{ background: "#1A1814", borderRadius: 16, padding: "14px 16px", color: "#F8F5F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ font: "700 16px 'Space Mono'", color: "#E8C97A" }}>{householdMeta.code}</div>
            <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 3 }}>Casa · Belas</div>
          </div>
          <span style={{ font: "700 13px Inter", color: "#F8F5F0" }}>{members.length} residentes</span>
        </div>

        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>Residentes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {members.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <Avatar initials={m.initials} primary={m.primary} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 14px Inter", color: "#1A1814" }}>{m.name}</div>
                  <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 1 }}>
                    {m.primary ? "Titular · " : m.hasOwnAfroloc ? "Adulto · " : "Dependente"}
                    {m.primary ? "residência primária" : m.hasOwnAfroloc ? "AFROLOC própria" : ""}
                  </div>
                </div>
                {m.primary && (
                  <span style={{ font: "700 9px Inter", letterSpacing: ".08em", color: "#B0831F", background: "#FBF2DC", borderRadius: 6, padding: "3px 7px" }}>PRIMÁRIA</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate("/addMember")} style={{ border: "1.5px dashed #D4A853", background: "transparent", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: "#B0831F", cursor: "pointer" }}>
          + Adicionar residente
        </button>

        <button onClick={() => navigate("/householdCensus")} style={{ all: "unset", cursor: "pointer", textAlign: "center", font: "700 13px Inter", color: "#1A1814" }}>
          Ver agregado &amp; censo →
        </button>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0, textAlign: "center" }}>
          Uma morada pode abrigar várias pessoas. A residência primária define o ciclo de verificação.
        </p>
      </div>
    </PhoneChrome>
  );
}

export function Avatar({ initials, primary }: { initials: string; primary?: boolean }) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        font: "700 13px Inter",
        background: primary ? "linear-gradient(135deg,#D4A853,#E07B2C)" : "#F0EADE",
        color: primary ? "#2D2519" : "#8A8073",
      }}
    >
      {initials}
    </span>
  );
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
