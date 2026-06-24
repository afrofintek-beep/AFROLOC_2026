import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const BY_VALIDATOR = [
  { name: "Carlos Nguvu", place: "Belas", n: 1240 },
  { name: "Inês Tavares", place: "Cacuaco", n: 880 },
  { name: "Pedro Lemos", place: "Viana", n: 640 },
  { name: "Por atribuir", place: "Quenguela", n: 0 },
];

export function ValidationsDashboardScreen() {
  const navigate = useNavigate();
  const max = Math.max(...BY_VALIDATOR.map((b) => b.n), 1);

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Painel de validações</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* headline stat (dark) */}
        <div style={{ background: "var(--afl-grad-hero)", borderRadius: 20, padding: 20, color: "#F8F5F0" }}>
          <div style={{ font: "800 38px 'Space Mono'", color: "#E8C97A", letterSpacing: ".01em" }}>3 284</div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 6 }}>
            <span style={{ font: "500 13px Inter", color: "#A99E8C" }}>validações este mês</span>
            <span style={{ font: "700 11px Inter", color: "#7FD3A6", background: "#2F7A5733", border: "1px solid #2F7A5766", borderRadius: 8, padding: "3px 8px" }}>+18%</span>
          </div>
        </div>

        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 12 }}>Por validador</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {BY_VALIDATOR.map((b) => (
              <div key={b.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ font: "600 13px Inter", color: b.n === 0 ? "#A99E8C" : "#1A1814" }}>{b.name} · {b.place}</span>
                  <span style={{ font: "700 13px 'Space Mono'", color: b.n === 0 ? "#A99E8C" : "#B0831F" }}>{b.n}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#E6DCCC", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(b.n / max) * 100}%`, borderRadius: 4, background: "var(--afl-grad-glow)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate("/validatorInbox")} style={{ border: "1.5px solid #EAE3D7", background: "#FFFDF9", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: "#1A1814", cursor: "pointer" }}>
          Ver caixa do validador
        </button>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
