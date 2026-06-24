import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { TabBar } from "../../components/ui/TabBar";
import { ADDRESSES, STATUS_COLOR, type AddressStatus, type AddressSummary } from "../../data/addresses";

type Filter = "todas" | "activas" | "pendentes";

const STATUS_TONE: Record<AddressStatus, { bg: string; fg: string }> = {
  ACTIVO: { bg: "#EBF1ED", fg: "#2F7A57" },
  PENDENTE: { bg: "#F4EAD6", fg: "#B98421" },
  RASCUNHO: { bg: "#EDE4D5", fg: "#8A8073" },
};

export function AddressesScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("todas");

  const items = useMemo(() => {
    if (filter === "activas") return ADDRESSES.filter((a) => a.status === "ACTIVO");
    if (filter === "pendentes") return ADDRESSES.filter((a) => a.status === "PENDENTE");
    return ADDRESSES;
  }, [filter]);

  const drafts = ADDRESSES.filter((a) => a.status === "RASCUNHO").length;

  const chips: { id: Filter; label: string }[] = [
    { id: "todas", label: `Todas · ${ADDRESSES.length}` },
    { id: "activas", label: "Activas" },
    { id: "pendentes", label: "Pendentes" },
  ];

  return (
    <PhoneChrome tabBar={<TabBar active="addresses" />}>
      <div style={{ padding: "8px 22px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ font: "700 24px Inter", color: "#1A1814", margin: 0, letterSpacing: "-.01em" }}>As minhas moradas</h2>
          <button onClick={() => navigate("/type")} aria-label="Nova morada" style={addBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* filter chips */}
        <div style={{ display: "flex", gap: 8 }}>
          {chips.map((c) => {
            const on = c.id === filter;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                style={{
                  border: on ? "none" : "1.5px solid #E6DCCC",
                  borderRadius: 18,
                  padding: "7px 14px",
                  font: `${on ? 700 : 600} 12px Inter`,
                  cursor: "pointer",
                  color: on ? "#2D2519" : "#8A8073",
                  background: on ? "var(--afl-grad-glow)" : "transparent",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {items.map((a) => (
            <AddressCard key={a.id} a={a} onOpen={() => navigate(a.status === "RASCUNHO" ? "/type" : "/detail")} />
          ))}
        </div>

        {/* offline sync note */}
        {drafts > 0 && filter !== "activas" && filter !== "pendentes" && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#F4EAD6", borderRadius: 14, padding: "11px 14px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B98421" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10a5 5 0 0 0-9.6-1.8A4 4 0 1 0 7 16h10a4 4 0 0 0 1-7.9z" />
              <path d="M12 12v5M9.5 14.5L12 17l2.5-2.5" />
            </svg>
            <span style={{ font: "500 12px Inter", color: "#7C6A4A" }}>
              {drafts} rascunho {drafts === 1 ? "aguarda" : "aguardam"} sincronização
            </span>
          </div>
        )}
      </div>
    </PhoneChrome>
  );
}

function AddressCard({ a, onOpen }: { a: AddressSummary; onOpen: () => void }) {
  const tone = STATUS_TONE[a.status];
  const isDraft = a.status === "RASCUNHO";
  return (
    <button
      onClick={onOpen}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "flex",
        gap: 13,
        alignItems: "center",
        background: "#FFFDF9",
        border: "1.5px solid #EAE3D7",
        borderRadius: 18,
        padding: 13,
      }}
    >
      <MiniMap status={a.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ font: "700 15px Inter", color: "#1A1814" }}>{a.name}{a.place ? ` · ${a.place}` : ""}</span>
          <span style={{ font: "700 9px Inter", letterSpacing: ".08em", color: tone.fg, background: tone.bg, borderRadius: 6, padding: "3px 7px" }}>
            {a.status}
          </span>
        </div>
        <div style={{ font: "500 12px 'Space Mono'", color: isDraft ? "#A99E8C" : "#8A8073", marginTop: 4 }}>
          {a.code ?? "— por concluir —"}
        </div>
        <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 2 }}>{a.note}</div>
      </div>
      {a.ats != null ? (
        <div style={{ textAlign: "right", flex: "none" }}>
          <div style={{ font: "700 16px 'Space Mono'", color: a.status === "ACTIVO" ? "#2F7A57" : "#B98421" }}>{a.ats}</div>
          <div style={{ font: "600 9px Inter", color: "#A99E8C", letterSpacing: ".08em" }}>ATS</div>
        </div>
      ) : (
        <span style={{ font: "700 12px Inter", color: "#B0831F", flex: "none" }}>Concluir →</span>
      )}
    </button>
  );
}

function MiniMap({ status }: { status: AddressStatus }) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 13,
        flex: "none",
        position: "relative",
        overflow: "hidden",
        background: "repeating-linear-gradient(135deg,#EFE7DA 0 9px,#E9E0D1 9px 18px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#1c181510 1px,transparent 1px),linear-gradient(90deg,#1c181510 1px,transparent 1px)",
          backgroundSize: "13px 13px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: STATUS_COLOR[status],
          border: "3px solid #FFFDF9",
          boxShadow: "0 3px 7px -2px rgba(28,24,21,.5)",
        }}
      />
    </div>
  );
}

const addBtn = {
  width: 40,
  height: 40,
  borderRadius: 13,
  border: "none",
  background: "#1A1814",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;
