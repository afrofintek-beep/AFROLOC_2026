import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

type Tag = "URGENTE" | "NOVO" | "EM ANÁLISE" | null;

const QUEUE: { code: string; tag: Tag; name: string; witnesses: number; meta: string }[] = [
  { code: "AO-LUA-BEL-RAM-GEN-G10-X6AU1-Y49J0-0005", tag: "URGENTE", name: "Carlos Nguvu", witnesses: 3, meta: "SLA 1h" },
  { code: "AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001", tag: "NOVO", name: "Ana Cardoso", witnesses: 2, meta: "há 12 min" },
  { code: "AO-LUA-CAZ-HOJ-GEN-G10-X6C03-Y49P2-0001", tag: "EM ANÁLISE", name: "Maria Sousa", witnesses: 2, meta: "há 3h" },
  { code: "AO-LUA-VIA-ZAN-GEN-G10-X6D17-Y49Q8-0001", tag: null, name: "João Bunga", witnesses: 2, meta: "há 5h" },
];

const TAG_TONE: Record<string, { bg: string; fg: string }> = {
  URGENTE: { bg: "#FBE3DE", fg: "#D14B3A" },
  NOVO: { bg: "#FBF2DC", fg: "#B0831F" },
  "EM ANÁLISE": { bg: "#EAE3D7", fg: "#8A8073" },
};

export function ValidatorInboxScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#B0831F" }}>VALIDADOR REGIONAL</div>
            <div style={{ font: "700 22px Inter", color: "#1A1814", marginTop: 4 }}>Pedidos de validação</div>
            <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 3 }}>Belas · +244 900 000 001</div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EBF1ED", borderRadius: 18, padding: "5px 11px", font: "700 10px Inter", color: "#2F7A57", letterSpacing: ".06em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5BC48E" }} />
            ONLINE
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {[
            { v: "7", l: "Pendentes" },
            { v: "12", l: "Hoje" },
            { v: "4h", l: "SLA médio" },
          ].map((s) => (
            <div key={s.l} style={{ flex: 1, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "13px 10px", textAlign: "center" }}>
              <div style={{ font: "700 20px 'Space Mono'", color: "#1A1814" }}>{s.v}</div>
              <div style={{ font: "500 11px Inter", color: "#8A8073", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>Fila de pedidos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {QUEUE.map((q) => (
              <button key={q.code} onClick={() => navigate("/validatorReview")} style={{ all: "unset", cursor: "pointer", background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ font: "700 13.5px 'Space Mono'", color: "#1A1814" }}>{q.code}</span>
                  {q.tag && (
                    <span style={{ font: "700 9px Inter", letterSpacing: ".06em", color: TAG_TONE[q.tag].fg, background: TAG_TONE[q.tag].bg, borderRadius: 6, padding: "3px 7px" }}>{q.tag}</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ font: "400 12px Inter", color: "#8A8073" }}>{q.name} · {q.witnesses} testemunhas</span>
                  <span style={{ font: "600 11px Inter", color: "#A99E8C" }}>{q.meta}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PhoneChrome>
  );
}
