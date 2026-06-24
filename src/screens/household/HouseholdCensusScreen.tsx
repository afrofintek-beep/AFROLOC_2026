import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { HOUSEHOLD_MAX, RELATIONSHIP_LABEL, householdMeta, members } from "../../data/household";
import { Avatar } from "./HouseholdScreen";

export function HouseholdCensusScreen() {
  const navigate = useNavigate();

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Agregado &amp; censo</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* census header card */}
        <div style={{ background: "#1A1814", borderRadius: 18, padding: 18, color: "#F8F5F0" }}>
          <div style={{ font: "700 16px 'Space Mono'", color: "#E8C97A" }}>{householdMeta.code}</div>
          <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 3 }}>
            Titular: {householdMeta.holder} · {householdMeta.place}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            <span style={{ font: "700 22px 'Space Mono'", color: "#F8F5F0" }}>
              {members.length} / {HOUSEHOLD_MAX}
            </span>
            <span style={{ font: "500 12px Inter", color: "#A99E8C" }}>membros</span>
            <span style={{ marginLeft: "auto", font: "700 10px Inter", letterSpacing: ".08em", color: "#7FD3A6", background: "#2F7A5733", border: "1px solid #2F7A5766", borderRadius: 8, padding: "4px 9px" }}>
              RECENSEADO · {householdMeta.censusYear}
            </span>
          </div>
        </div>

        {/* typology */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "13px 16px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "#EBF1ED", color: "#2F7A57", display: "flex", alignItems: "center", justifyContent: "center", font: "700 13px Inter", flex: "none" }}>
            {householdMeta.typology}
          </span>
          <div>
            <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>Tipologia {householdMeta.typology} · {members.length} residentes</div>
            <div style={{ font: "500 12px Inter", color: "#2F7A57", marginTop: 2 }}>{householdMeta.occupancy}</div>
          </div>
        </div>

        {/* members */}
        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>Membros &amp; parentesco</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {members.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <Avatar initials={m.initials} primary={m.primary} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>
                    {m.name} · {m.age}
                  </div>
                  <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 1 }}>
                    {m.primary ? "Titular" : RELATIONSHIP_LABEL[m.relationship]} · {m.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/addMember")} style={{ flex: 1, border: "1.5px solid #D4A853", background: "#FBF2DC", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: "#B0831F", cursor: "pointer" }}>
            Adicionar
          </button>
          <button onClick={() => navigate("/deceased")} style={{ flex: 1, border: "1.5px solid #EAE3D7", background: "#FFFDF9", borderRadius: 14, padding: "13px", font: "600 13px Inter", color: "#8A8073", cursor: "pointer" }}>
            Registar óbito
          </button>
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Os dados do agregado alimentam o recenseamento populacional e a alocação de moradas por tipologia.
        </p>
      </div>
    </PhoneChrome>
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
