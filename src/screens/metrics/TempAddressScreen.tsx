import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const TEMP = [
  { name: "Hotel Presidente · quarto 412", code: "AO-LUA-TMP-G10-X6A21-Y49K0", expiry: "Expira em 3 dias", days: 3, total: 7 },
  { name: "Residencial Kianda", code: "AO-LUA-TMP-G10-X6B07-Y49M3", expiry: "Expira em 12 dias", days: 12, total: 30 },
  { name: "Estadia · Talatona", code: "AO-LUA-TMP-G10-X6C58-Y49P1", expiry: "Expira amanhã", days: 1, total: 7 },
];

export function TempAddressScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Moradas temporárias</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ font: "400 13px Inter", color: "#8A8073", lineHeight: 1.5, margin: 0 }}>
          Moradas de curta duração — hotelaria, alojamento temporário e estadias — com validade automática.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEMP.map((t) => {
            const pct = Math.round((1 - t.days / t.total) * 100);
            const urgent = t.days <= 1;
            return (
              <div key={t.code} style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 15px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ font: "700 14px Inter", color: "#1A1814" }}>{t.name}</span>
                  <span style={{ font: "700 9px Inter", letterSpacing: ".08em", color: "#B0831F", background: "#FBF2DC", borderRadius: 6, padding: "3px 7px" }}>TEMP</span>
                </div>
                <div style={{ font: "500 12px 'Space Mono'", color: "#8A8073", marginTop: 5 }}>{t.code}</div>
                <div style={{ height: 6, borderRadius: 3, background: "#EDE4D5", overflow: "hidden", margin: "10px 0 6px" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: urgent ? "#D14B3A" : "#D4A853" }} />
                </div>
                <div style={{ font: "600 11.5px Inter", color: urgent ? "#D14B3A" : "#B98421" }}>{t.expiry}</div>
              </div>
            );
          })}
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Moradas temporárias não exigem testemunhas, mas expiram e não geram certificado permanente.
        </p>

        <button onClick={() => navigate("/type")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.6)" }}>
          Emitir morada temporária
        </button>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
