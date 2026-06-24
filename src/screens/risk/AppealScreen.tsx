import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton } from "../../components/ui/primitives";

export function AppealScreen() {
  const navigate = useNavigate();
  const [reason, setReason] = useState(
    "A testemunha mudou-se recentemente; indico um novo vizinho a 180 m com AFROLOC activa.",
  );
  const [photo, setPhoto] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Apelar decisão</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* rejection banner */}
        <div style={{ display: "flex", gap: 11, alignItems: "flex-start", background: "#FBE3DE", borderRadius: 14, padding: "13px 15px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D14B3A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          <div>
            <div style={{ font: "700 14px Inter", color: "#9c3a2d" }}>Morada rejeitada</div>
            <div style={{ font: "400 12.5px Inter", color: "#9c3a2d", marginTop: 3, lineHeight: 1.4 }}>
              Motivo: testemunha fora do raio de 1 km.
            </div>
          </div>
        </div>

        <div>
          <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Motivo do recurso</div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            style={{ width: "100%", resize: "none", borderRadius: 13, border: "1.5px solid #EAE3D7", background: "#FFFDF9", padding: 12, font: "400 14px Inter", color: "#1A1814", lineHeight: 1.45, outline: "none" }}
          />
        </div>

        <div>
          <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Anexar prova</div>
          <button
            onClick={() => setPhoto((v) => !v)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: photo ? "1.5px solid #2F7A57" : "1.5px dashed #E6DCCC", borderRadius: 14, padding: "13px 15px", cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ width: 42, height: 42, borderRadius: 11, background: photo ? "#EBF1ED" : "#F0EADE", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={photo ? "#2F7A57" : "#8A8073"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
                <circle cx="12" cy="13" r="3.2" />
              </svg>
            </span>
            <span style={{ font: "600 13px Inter", color: "#1A1814" }}>{photo ? "Prova adicionada" : "Adicionar foto"}</span>
          </button>
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          O recurso é analisado pelo administrador da jurisdição em até <strong style={{ color: "#1A1814" }}>5 dias úteis</strong>.
        </p>

        {sent && <div style={{ font: "600 12px Inter", color: "#2F7A57", textAlign: "center" }}>Recurso enviado · em análise</div>}

        <div style={{ paddingTop: 2 }}>
          <PrimaryButton disabled={!reason.trim() || sent} onClick={() => setSent(true)}>
            {sent ? "Recurso enviado" : "Enviar recurso"}
          </PrimaryButton>
        </div>
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
