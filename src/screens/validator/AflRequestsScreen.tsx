import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const REQUESTS = [
  { id: "r1", initials: "MS", name: "Maria Sousa", code: "AO-LUA-LDA-MAI-CEN-G10-X6B22-Y49J9-0001", meta: "há 2 h" },
  { id: "r2", initials: "JD", name: "João Dias", code: "AO-LUA-CAC-FUN-GEN-G10-X6E05-Y49R1-0001", meta: "há 5 h" },
  { id: "r3", initials: "LF", name: "Lúcia Ferraz", code: "AO-BEN-LBT-GEN-COM-G10-X5K12-Y48T4-0001", meta: "ontem" },
];

export function AflRequestsScreen() {
  const navigate = useNavigate();
  const [removed, setRemoved] = useState<Record<string, "rej">>({});

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Pedidos AFROLOC</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { v: "14", l: "na fila" },
            { v: "8", l: "hoje aprov." },
            { v: "2,1d", l: "tempo médio" },
          ].map((s) => (
            <div key={s.l} style={{ flex: 1, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "13px 10px", textAlign: "center" }}>
              <div style={{ font: "700 19px 'Space Mono'", color: "#1A1814" }}>{s.v}</div>
              <div style={{ font: "500 11px Inter", color: "#8A8073", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>A aguardar análise</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {REQUESTS.map((r) => (
              <div key={r.id} style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: "50%", flex: "none", background: "#F0EADE", color: "#8A8073", display: "flex", alignItems: "center", justifyContent: "center", font: "700 12px Inter" }}>{r.initials}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>{r.name}</div>
                    <div style={{ font: "500 11.5px 'Space Mono'", color: "#8A8073", marginTop: 1 }}>{r.code} · {r.meta}</div>
                  </div>
                </div>
                {removed[r.id] ? (
                  <div style={{ font: "600 11px Inter", color: "#D14B3A", marginTop: 10, textAlign: "right" }}>Rejeitado</div>
                ) : (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => setRemoved((m) => ({ ...m, [r.id]: "rej" }))} style={{ flex: 1, border: "1.5px solid #E2D8C8", background: "transparent", borderRadius: 11, height: 38, font: "700 12px Inter", color: "#D14B3A", cursor: "pointer" }}>Rejeitar</button>
                    <button onClick={() => navigate("/validatorReview")} style={{ flex: 1, border: "none", background: "#1A1814", borderRadius: 11, height: 38, font: "700 12px Inter", color: "#E8C97A", cursor: "pointer" }}>Rever</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
