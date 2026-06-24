import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader, StatGrid } from "./adminUi";

const EVENTS = [
  { title: "Login falhado · 5 tentativas", meta: "admin · IP 197.21.x · 09:42", tone: DARK.danger },
  { title: "2FA ativado", meta: "c.nguvu@gov.ao · 09:10", tone: DARK.green },
  { title: "Função criada · Validador Quenguela", meta: "ontem", tone: DARK.gold },
  { title: "Exportação de KPIs", meta: "relatório nacional · ontem", tone: DARK.muted },
  { title: "Sessão expirada", meta: "validador · há 2 dias", tone: DARK.muted },
];

export function SecurityAuditScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Auditoria" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <StatGrid items={[{ v: "1 284", l: "eventos (7d)", tone: "fg" }, { v: "3", l: "alertas", tone: "danger" }]} />

        <div style={{ font: "700 14px Inter", color: DARK.fg }}>Registo de eventos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {EVENTS.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "12px 14px" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", flex: "none", background: e.tone }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "600 13px Inter", color: DARK.fg }}>{e.title}</div>
                <div style={{ font: "500 11px 'Space Mono'", color: DARK.muted, marginTop: 2 }}>{e.meta}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: DARK.muted, lineHeight: 1.45, margin: 0 }}>
          Registos imutáveis, retidos 24 meses. Exportáveis para a autoridade nacional.
        </p>
      </div>
    </PhoneChrome>
  );
}
