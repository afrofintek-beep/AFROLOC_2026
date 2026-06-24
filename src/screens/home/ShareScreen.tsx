import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { Qr } from "../../components/ui/Qr";
import { currentUser, primaryAddress, addressUrl } from "../../data/account";
import { generateCertificatePdf } from "../../lib/certificatePdf";

const USE_CASES = [
  { title: "Entregas & encomendas", desc: "Estafetas chegam mesmo sem rua.", icon: boxIcon },
  { title: "Banca & inclusão financeira", desc: "Comprovativo de morada para abrir conta.", icon: bankIcon },
  { title: "Serviços públicos", desc: "Água, energia, saúde e censos.", icon: civicIcon },
  { title: "Emergência", desc: "Ambulância e bombeiros encontram-no.", icon: sosIcon },
];

export function ShareScreen() {
  const navigate = useNavigate();
  const a = primaryAddress;
  const verifyUrl = addressUrl(a.code);
  const [toast, setToast] = useState<string | null>(null);

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  }

  async function pdf() {
    flash("A gerar cartão…");
    await generateCertificatePdf({
      code: a.code,
      titular: currentUser.name,
      morada: a.addressLine,
      qgsqCell: a.qgsqCell,
      validator: a.validator,
      issued: a.issued,
      ats: a.ats,
      verifyUrl,
    });
    flash("Cartão PDF gerado");
  }

  function sms() {
    const body = encodeURIComponent(`A minha AFROLOC: ${a.code} (${a.locationLine}). Verificar: ${verifyUrl}`);
    window.location.href = `sms:?&body=${body}`;
  }

  async function share() {
    const text = `A minha AFROLOC: ${a.code} — ${a.locationLine}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "A minha AFROLOC", text, url: verifyUrl });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard?.writeText(`${text}\n${verifyUrl}`);
      flash("Link copiado");
    }
  }

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Partilhar morada</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* code + QR card */}
        <div style={{ background: "#1A1814", borderRadius: 22, padding: 20, color: "#F8F5F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ minWidth: 0, marginRight: 14 }}>
            <div style={{ font: "700 15px 'Space Mono'", lineHeight: 1.32, wordBreak: "break-all" }}>{a.code}</div>
            <div style={{ font: "400 12.5px Inter", color: "#A99E8C", marginTop: 8 }}>Belas · Luanda</div>
          </div>
          <Qr value={verifyUrl} size={92} />
        </div>

        {/* use cases */}
        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>Usar a morada para</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {USE_CASES.map((u) => (
              <div key={u.title} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FBF2DC", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  {u.icon()}
                </span>
                <div>
                  <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>{u.title}</div>
                  <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 1 }}>{u.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {toast && (
          <div style={{ font: "600 12px Inter", color: "#2F7A57", textAlign: "center" }}>{toast}</div>
        )}

        {/* actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <ActionBtn label="Cartão PDF" onClick={pdf} icon={pdfIcon} />
          <ActionBtn label="Link · SMS" onClick={sms} icon={smsIcon} />
          <ActionBtn label="Partilhar" primary onClick={share} icon={shareIcon} />
        </div>
      </div>
    </PhoneChrome>
  );
}

function ActionBtn({ label, onClick, icon, primary }: { label: string; onClick: () => void; icon: () => JSX.Element; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: primary ? "none" : "1.5px solid #E2D8C8",
        background: primary ? "linear-gradient(135deg,#D4A853,#E07B2C)" : "#FFFDF9",
        color: primary ? "#2D2519" : "#1A1814",
        borderRadius: 14,
        padding: "13px 4px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        font: "600 11px Inter",
        boxShadow: primary ? "0 12px 24px -12px rgba(212,168,83,.7)" : "none",
      }}
    >
      {icon()}
      {label}
    </button>
  );
}

const ic = (paths: JSX.Element, stroke = "#B0831F") => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);
function boxIcon() { return ic(<><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>); }
function bankIcon() { return ic(<><path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 21h18" /></>); }
function civicIcon() { return ic(<><path d="M12 3l8 4v3H4V7zM6 10v7M18 10v7M10 10v7M14 10v7M4 21h16" /></>); }
function sosIcon() { return ic(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, "#D14B3A"); }
function pdfIcon() { return ic(<><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 14h6M9 18h4" /></>); }
function smsIcon() { return ic(<><path d="M4 5h16v11H9l-4 4z" /><path d="M8 10h8M8 13h5" /></>); }
function shareIcon() { return ic(<><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></>, "#2D2519"); }

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
