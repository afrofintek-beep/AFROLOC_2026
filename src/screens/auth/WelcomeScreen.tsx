import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { MapPlaceholder, Pill, PrimaryButton, GhostButton } from "../../components/ui/primitives";

export function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "6px 22px 0" }}>
        <MapPlaceholder height={280} caption="mapa · grelha QGSQ 10×10m" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "26px 30px 0" }}>
        <Pill label="Validado pela comunidade" tone="green" />
        <h1 style={{ font: "700 31px Inter", color: "#1A1814", lineHeight: 1.12, margin: "18px 0 0", letterSpacing: "-.01em", textWrap: "balance" }}>
          Um endereço digital para cada cidadão.
        </h1>
        <p style={{ font: "400 15px Inter", color: "#8A8073", lineHeight: 1.5, margin: "14px 0 0" }}>
          Crie a sua AFROLOC: um identificador único, georreferenciado e verificável — mesmo sem rua ou número.
        </p>

        <div style={{ marginTop: "auto", paddingBottom: 14, display: "flex", flexDirection: "column", gap: 11 }}>
          <PrimaryButton onClick={() => navigate("/register")}>Criar a minha AFROLOC</PrimaryButton>
          <GhostButton onClick={() => navigate("/login")}>Já tenho conta · Entrar</GhostButton>
        </div>
      </div>
    </PhoneChrome>
  );
}
