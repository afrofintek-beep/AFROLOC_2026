import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { useCreateFlow } from "../../state/createFlow";
import { COUNTRIES, countryByIso } from "../../data/africaAdmin";

export function AdminDivisionScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();
  const [iso, setIso] = useState(draft.division.countryIso);
  const [query, setQuery] = useState("");
  const selected = countryByIso(iso);

  const countries = query
    ? COUNTRIES.filter((c) => c.pais.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES;

  function pickCountry(nextIso: string) {
    setIso(nextIso);
    const c = countryByIso(nextIso);
    if (c) {
      dispatch({
        type: "setDivision",
        value: {
          countryIso: c.iso,
          countryName: c.pais,
          level1Type: c.nivel1_tipo,
          province: undefined,
          municipio: undefined,
          comuna: undefined,
        },
      });
    }
  }

  function pickProvince(name: string) {
    dispatch({ type: "setDivision", value: { province: name } });
    navigate(-1);
  }

  return (
    <PhoneChrome>
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={chevronBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Divisão administrativa</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "16px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ font: "700 10px Inter", letterSpacing: ".14em", color: "#8A8073", textTransform: "uppercase" }}>
            País
          </span>
          <span style={{ font: "500 11px Inter", color: "#A99E8C" }}>{COUNTRIES.length} no continente</span>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar país…"
          style={{
            marginTop: 8,
            height: 40,
            borderRadius: 12,
            border: "1.5px solid #EAE3D7",
            background: "#FFFDF9",
            padding: "0 12px",
            font: "500 13px Inter",
            color: "#1A1814",
            outline: "none",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            marginTop: 12,
            maxHeight: 168,
            overflowY: "auto",
            paddingRight: 2,
          }}
        >
          {countries.map((c) => {
            const on = c.iso === iso;
            return (
              <button
                key={c.iso}
                onClick={() => pickCountry(c.iso)}
                title={c.pais}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "10px 4px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: on ? "#FBF2DC" : "#FFFDF9",
                  border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{c.flag}</span>
                <span style={{ font: "600 10px Inter", color: "#1A1814", textAlign: "center", lineHeight: 1.1 }}>
                  {c.pais}
                </span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div style={{ marginTop: 14, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ font: "700 16px Inter", color: "#1A1814" }}>
              {selected.flag} {selected.pais}
            </div>
            <div style={{ font: "500 12px Inter", color: "#8A8073", marginTop: 2 }}>
              Nível 1: {selected.nivel1_tipo} · {selected.nivel1.length} unidades
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 7,
                marginTop: 10,
                overflowY: "auto",
                alignContent: "flex-start",
              }}
            >
              {selected.nivel1.map((u) => {
                const on = u.nome === draft.division.province;
                return (
                  <button
                    key={u.codigo}
                    onClick={() => pickProvince(u.nome)}
                    style={{
                      font: "600 12px Inter",
                      color: on ? "#2D2519" : "#1A1814",
                      background: on ? "var(--afl-grad-glow)" : "#F0EADE",
                      border: "none",
                      borderRadius: 11,
                      padding: "7px 12px",
                      cursor: "pointer",
                    }}
                  >
                    {u.nome}
                  </button>
                );
              })}
            </div>
            <div style={{ font: "400 11px Inter", color: "#A99E8C", margin: "10px 0 6px", lineHeight: 1.4 }}>
              A nomenclatura adapta-se por país: província · província (wilaya) · departamento · distrito ·
              governadoria · ilha…
            </div>
          </div>
        )}
      </div>
    </PhoneChrome>
  );
}

const chevronBtn = {
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
