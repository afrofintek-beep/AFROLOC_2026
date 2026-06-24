import { DocsChrome } from "../../components/ui/DocsChrome";
import { Logo } from "../../components/Logo";

const COLORS = [
  { name: "Ouro", hex: "#D4A853" },
  { name: "Âmbar", hex: "#E07B2C" },
  { name: "Tinta", hex: "#1A1814" },
  { name: "Verde", hex: "#2F7A57" },
  { name: "Creme", hex: "#F8F5F0" },
];

const DO = ["Manter espaço livre à volta do logótipo", "Usar ouro sobre fundo escuro"];
const DONT = ["Não distorcer nem recolorir o símbolo", "Não aplicar sombras ou contornos"];

export function BrandGuidelinesScreen() {
  return (
    <DocsChrome url="afroloc.ao/brand" topActive="brandGuidelines" side="brandGuidelines">
      <div style={{ padding: "34px 40px", maxWidth: 880 }}>
        <h1 style={{ font: "800 30px 'Playfair Display', serif", color: "#1A1814", margin: 0 }}>Manual da marca</h1>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "10px 0 0" }}>Identidade visual oficial do AFROLOC · v2.0</p>

        {/* logo */}
        <Section title="Logótipo">
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1, background: "#1A1814", borderRadius: 14, padding: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}><Logo size={44} /><span style={{ font: "800 24px Inter", color: "#F8F5F0" }}>AFROLOC</span></span>
            </div>
            <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 14, padding: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}><Logo size={44} /><span style={{ font: "800 24px Inter", color: "#1A1814" }}>AFROLOC</span></span>
            </div>
          </div>
        </Section>

        <Section title="Cores">
          <div style={{ display: "flex", gap: 12 }}>
            {COLORS.map((c) => (
              <div key={c.name} style={{ flex: 1 }}>
                <div style={{ height: 56, borderRadius: 12, background: c.hex, border: c.hex === "#F8F5F0" ? "1px solid #EAE3D7" : "none" }} />
                <div style={{ font: "700 12px Inter", color: "#1A1814", marginTop: 8 }}>{c.name}</div>
                <div style={{ font: "600 11px 'Space Mono'", color: "#8A8073", marginTop: 2 }}>{c.hex}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tipografia">
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 12, padding: 20 }}>
              <div style={{ font: "700 30px 'Playfair Display', serif", color: "#1A1814" }}>Aa</div>
              <div style={{ font: "700 13px Inter", color: "#1A1814", marginTop: 8 }}>Playfair Display</div>
              <div style={{ font: "400 12px Inter", color: "#8A8073" }}>Títulos</div>
            </div>
            <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 12, padding: 20 }}>
              <div style={{ font: "700 30px Inter", color: "#1A1814" }}>Aa</div>
              <div style={{ font: "700 13px Inter", color: "#1A1814", marginTop: 8 }}>Inter</div>
              <div style={{ font: "400 12px Inter", color: "#8A8073" }}>Texto · interface</div>
            </div>
          </div>
        </Section>

        <Section title="Uso correto">
          <div style={{ display: "flex", gap: 16 }}>
            <Rules ok items={DO} />
            <Rules ok={false} items={DONT} />
          </div>
        </Section>
      </div>
    </DocsChrome>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ font: "700 11px Inter", letterSpacing: ".1em", color: "#B0831F", textTransform: "uppercase", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Rules({ ok, items }: { ok: boolean; items: string[] }) {
  return (
    <div style={{ flex: 1, background: ok ? "#EBF1ED" : "#FBE3DE", borderRadius: 12, padding: 18 }}>
      {items.map((t) => (
        <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ok ? "#2F7A57" : "#D14B3A"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}>
            {ok ? <path d="M5 12l5 5L20 7" /> : <path d="M6 6l12 12M18 6L6 18" />}
          </svg>
          <span style={{ font: "500 12.5px Inter", color: ok ? "#2F7A57" : "#9c3a2d", lineHeight: 1.4 }}>{t}</span>
        </div>
      ))}
    </div>
  );
}
