import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

interface Device { id: string; name: string; meta: string; current?: boolean }

const DEVICES: Device[] = [
  { id: "d1", name: "Samsung Galaxy A14", meta: "Luanda · ativo agora", current: true },
  { id: "d2", name: "iPhone 12", meta: "Belas · há 3 dias" },
  { id: "d3", name: "Tablet (partilhado)", meta: "Catete · há 2 semanas" },
];

export function TrustedDevicesScreen() {
  const navigate = useNavigate();
  const [biometric, setBiometric] = useState(true);
  const [removed, setRemoved] = useState<Record<string, boolean>>({});

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Dispositivos de confiança</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px", cursor: "pointer" }}>
          <span>
            <span style={{ font: "700 14px Inter", color: "#1A1814", display: "block" }}>Entrada biométrica</span>
            <span style={{ font: "400 12px Inter", color: "#8A8073", display: "block", marginTop: 2 }}>Impressão digital / rosto neste dispositivo</span>
          </span>
          <Switch on={biometric} onClick={() => setBiometric((v) => !v)} />
        </label>

        <div style={{ font: "700 13px Inter", color: "#1A1814" }}>Dispositivos ativos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {DEVICES.filter((d) => !removed[d.id]).map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flex: "none", background: "#F0EADE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8073" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ font: "700 13.5px Inter", color: "#1A1814" }}>{d.name}</span>
                  {d.current && <span style={{ font: "700 8px Inter", letterSpacing: ".08em", color: "#2F7A57", background: "#EBF1ED", borderRadius: 5, padding: "2px 6px" }}>ESTE</span>}
                </div>
                <div style={{ font: "400 11.5px Inter", color: "#8A8073", marginTop: 2 }}>{d.meta}</div>
              </div>
              {!d.current && (
                <button onClick={() => setRemoved((m) => ({ ...m, [d.id]: true }))} style={{ all: "unset", cursor: "pointer", font: "700 12px Inter", color: "#D14B3A" }}>Remover</button>
              )}
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Sessões em dispositivos não confiáveis exigem sempre OTP. Pode revogar qualquer um remotamente.
        </p>

        <button onClick={() => setRemoved({ d2: true, d3: true })} style={{ border: "1.5px solid #EAE3D7", background: "transparent", borderRadius: 14, padding: "13px", font: "600 14px Inter", color: "#D14B3A", cursor: "pointer" }}>
          Terminar todas as outras sessões
        </button>
      </div>
    </PhoneChrome>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: on ? "#2F7A57" : "#E6DCCC", position: "relative", cursor: "pointer", flex: "none" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </button>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
