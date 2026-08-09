// Pré-visualização pública do Radar (bússola incluída), sem login.
// Acessível por URL direto: /#/radarPreview
import AfrolocRadar from "../shared/AfrolocRadar";
import { MAPBOX_TOKEN } from "../lib/mapbox";

export function RadarPreviewScreen() {
  return (
    <div style={{ width: "100%", height: "100dvh", background: "#0C0B0A" }}>
      <AfrolocRadar
        target={{ lat: -8.899, lng: 13.205 }}
        title="AO-LDA-BELAS-RAMIROS-G10"
        subtitle="pré-visualização do Radar"
        mapboxToken={MAPBOX_TOKEN}
      />
    </div>
  );
}
