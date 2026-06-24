import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton, GhostButton } from "../../components/ui/primitives";
import { Qr } from "../../components/ui/Qr";
import { Logo } from "../../components/Logo";
import { currentUser, primaryAddress, addressUrl } from "../../data/account";
import { generateCertificatePdf } from "../../lib/certificatePdf";

export function CertificateScreen() {
  const navigate = useNavigate();
  const a = primaryAddress;
  const verifyUrl = addressUrl(a.code);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setDone(null);
    try {
      const file = await generateCertificatePdf({
        code: a.code,
        titular: currentUser.name,
        morada: a.addressLine,
        qgsqCell: a.qgsqCell,
        validator: a.validator,
        issued: a.issued,
        ats: a.ats,
        verifyUrl,
      });
      setDone(file);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const text = `AFROLOC ${a.code} — ${currentUser.name}, ${a.addressLine}. Verificar: ${verifyUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Certificado AFROLOC", text, url: verifyUrl });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard?.writeText(text);
      setDone("Link copiado");
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
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Certificado</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* document card */}
        <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 22, border: "1px solid #EAE3D7", boxShadow: "0 18px 40px -28px rgba(28,24,21,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Logo size={26} />
            <span style={{ font: "800 14px Inter", color: "#1A1814", letterSpacing: ".02em" }}>AFROLOC</span>
            <span style={{ marginLeft: "auto", font: "700 9px Inter", letterSpacing: ".14em", color: "#8A8073" }}>
              CERTIFICADO DE MORADA
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 18, gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "700 15px 'Space Mono'", color: "#1A1814", letterSpacing: ".01em", lineHeight: 1.32, wordBreak: "break-all", maxWidth: 180 }}>{a.code}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EBF1ED", borderRadius: 18, padding: "5px 11px", marginTop: 10 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                <span style={{ font: "700 11px Inter", color: "#2F7A57", letterSpacing: ".04em" }}>VERIFICADO · ATS {a.ats}</span>
              </div>
            </div>
            <Qr value={verifyUrl} size={78} plate="#FFFFFF" />
          </div>

          <div style={{ height: 1, background: "#EDE4D5", margin: "18px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Field label="Titular" value={currentUser.name} />
            <Field label="Morada" value={a.addressLine} />
            <Field label="Célula QGSQ" value={a.qgsqCell} mono />
            <Field label="Validado por" value={a.validator} />
            <Field label="Emitido" value={a.issued} />
          </div>
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", textAlign: "center", lineHeight: 1.45, margin: 0 }}>
          Documento verificável por QR. Aceite por bancos e serviços públicos.
        </p>

        {done && (
          <div style={{ font: "600 12px Inter", color: "#2F7A57", textAlign: "center" }}>
            {done.endsWith(".pdf") ? `PDF gerado: ${done}` : done}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton onClick={download} disabled={busy}>
            {busy ? "A gerar PDF…" : "Descarregar PDF"}
          </PrimaryButton>
          <GhostButton onClick={share}>Partilhar</GhostButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <span style={{ font: "500 11px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", flex: "none" }}>
        {label}
      </span>
      <span style={{ font: `700 13.5px ${mono ? "'Space Mono'" : "Inter"}`, color: "#1A1814", textAlign: "right" }}>{value}</span>
    </div>
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
