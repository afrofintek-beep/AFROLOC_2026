import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

interface Lang {
  code: string;
  name: string;
  region: string;
  group: "Angola" | "Continente";
  downloaded?: boolean;
  rtl?: boolean;
}

const LANGS: Lang[] = [
  { code: "P", name: "Português", region: "Oficial · descarregada", group: "Angola", downloaded: true },
  { code: "U", name: "Umbundu", region: "Planalto Central", group: "Angola" },
  { code: "K", name: "Kimbundu", region: "Luanda · Malanje", group: "Angola" },
  { code: "K", name: "Kikongo", region: "Zaire · Uíge", group: "Angola" },
  { code: "C", name: "Côkwe", region: "Lunda · Moxico", group: "Angola" },
  { code: "E", name: "English", region: "Franca pan-africana", group: "Continente" },
  { code: "F", name: "Français", region: "Franca pan-africana", group: "Continente" },
  { code: "S", name: "Kiswahili", region: "África Oriental", group: "Continente" },
  { code: "H", name: "Hausa", region: "África Ocidental", group: "Continente" },
  { code: "Y", name: "Yorùbá", region: "Nigéria · Benim", group: "Continente" },
  { code: "Z", name: "isiZulu", region: "África Austral", group: "Continente" },
  { code: "አ", name: "አማርኛ · Amárico", region: "Etiópia", group: "Continente" },
  { code: "ع", name: "العربية · Árabe", region: "Norte de África · RTL", group: "Continente", rtl: true },
];

export function LanguageScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("Português");
  const [q, setQ] = useState("");

  const filtered = q ? LANGS.filter((l) => l.name.toLowerCase().includes(q.toLowerCase())) : LANGS;
  const groups: Lang["group"][] = ["Angola", "Continente"];

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Idioma</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "12px 22px 0", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar língua"
          style={{ height: 42, borderRadius: 13, border: "1.5px solid #EAE3D7", background: "#FFFDF9", padding: "0 14px", font: "500 13px Inter", color: "#1A1814", outline: "none" }} />

        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 8 }}>
          {groups.map((g) => {
            const items = filtered.filter((l) => l.group === g);
            if (!items.length) return null;
            return (
              <div key={g}>
                <div style={{ font: "700 10px Inter", letterSpacing: ".14em", color: "#B0831F", textTransform: "uppercase", marginBottom: 8 }}>{g}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {items.map((l) => {
                    const on = selected === l.name;
                    return (
                      <button key={l.name} onClick={() => setSelected(l.name)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: on ? "#FBF2DC" : "#FFFDF9", border: on ? "1.5px solid #D4A853" : "1px solid #EAE3D7", borderRadius: 13, padding: "11px 13px" }}>
                        <span style={{ width: 34, height: 34, borderRadius: "50%", flex: "none", background: "#F0EADE", color: "#8A8073", display: "flex", alignItems: "center", justifyContent: "center", font: "700 14px Inter" }}>{l.code}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: "700 13.5px Inter", color: "#1A1814" }} dir={l.rtl ? "rtl" : "ltr"}>{l.name}</div>
                          <div style={{ font: "400 11px Inter", color: "#8A8073", marginTop: 1 }}>{l.region}</div>
                        </div>
                        {l.downloaded ? (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                        ) : (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p style={{ font: "400 11.5px Inter", color: "#8A8073", lineHeight: 1.45, margin: "2px 0 0" }}>
            13 línguas · a tradução automática mantém os conteúdos atualizados. Descarregue uma língua para a usar offline.
          </p>
        </div>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
