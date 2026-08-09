import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { householdMeta, members } from "../../data/household";
import { useAuth } from "../../state/auth";
import { useCitizenData } from "../../state/citizenData";
import {
  listResidents, approveResident, removeResident, statusMeta, REL_LABEL, isApproved, isPending,
  type ResidentRow,
} from "../../lib/supabase/residents";

const MAX_RESIDENTS = 15;

function initialsOf(name: string): string {
  const p = (name || "").trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "·";
}

const TONE: Record<"green" | "amber" | "red", { bg: string; fg: string }> = {
  green: { bg: "#EBF1ED", fg: "#2F7A57" },
  amber: { bg: "#FBF2DC", fg: "#B0831F" },
  red: { bg: "#FBEAE7", fg: "#D14B3A" },
};

export function HouseholdScreen() {
  const navigate = useNavigate();
  const { configured, profile } = useAuth();
  const { primary } = useCitizenData();
  const recordId = primary?.id ?? null;
  const [rows, setRows] = useState<ResidentRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!configured || !recordId) { setRows([]); return; }
    setRows(await listResidents(recordId));
  }, [configured, recordId]);
  useEffect(() => { refresh(); }, [refresh]);

  const useReal = configured && !!recordId;

  async function act(id: string, fn: () => Promise<{ ok: boolean; message: string }>) {
    setBusy(id);
    setMsg(null);
    try {
      const r = await fn();
      if (!r.ok) setMsg(r.message);
      else await refresh();
    } finally {
      setBusy(null);
    }
  }

  // Residentes reais (exclui revogados). Titular sintetizado se não houver linha.
  const realList = rows.filter((r) => r.status !== "revoked");
  const hasTitularRow = realList.some((r) => r.is_primary);
  const coResidents = realList.filter((r) => !r.is_primary);
  const approvedCount = 1 /* titular */ + coResidents.filter((r) => isApproved(r.status)).length;
  const pendingCount = coResidents.filter((r) => isPending(r.status)).length;
  const totalCount = 1 + coResidents.length; // titular + co-residentes

  const demoMembers = members.map((m) => ({
    id: m.id, name: m.name, primary: m.primary,
    sub: m.primary ? "residência primária" : m.hasOwnAfroloc ? "AFROLOC própria" : "Dependente",
  }));

  const chipCode = useReal ? primary!.code : householdMeta.code;
  const chipPlace = useReal ? (primary!.location_line ?? "—") : "Casa · Belas";
  const count = useReal ? totalCount : demoMembers.length;

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Agregado familiar</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* address chip */}
        <div style={{ background: "#1A1814", borderRadius: 16, padding: "14px 16px", color: "#F8F5F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "700 15px 'Space Mono'", color: "#E8C97A", wordBreak: "break-all", maxWidth: 200 }}>{chipCode}</div>
            <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 3 }}>{chipPlace}</div>
          </div>
          <span style={{ font: "700 13px Inter", color: "#F8F5F0", flex: "none", marginLeft: 10 }}>{count} {count === 1 ? "residente" : "residentes"}</span>
        </div>

        {/* estatísticas do agregado (real) */}
        {useReal && (
          <div style={{ display: "flex", gap: 10 }}>
            <Stat label="Aprovados" value={`${approvedCount}/${MAX_RESIDENTS}`} />
            <Stat label="Pendentes" value={String(pendingCount)} tone={pendingCount > 0 ? "amber" : undefined} />
          </div>
        )}

        {msg && (
          <div style={{ font: "600 12.5px Inter", color: "#B23A2A", background: "#FBEAE7", border: "1px solid #F0C9C1", borderRadius: 12, padding: "10px 12px" }}>{msg}</div>
        )}

        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>Residentes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {useReal ? (
              <>
                {!hasTitularRow && (
                  <ResidentCard name={profile?.name ?? "Titular"} sub="residência primária" primary />
                )}
                {realList.map((r) => {
                  const primaryRow = r.is_primary;
                  const sm = statusMeta(r.status);
                  return (
                    <ResidentCard
                      key={r.id}
                      name={r.full_name ?? (primaryRow ? profile?.name ?? "Titular" : "—")}
                      sub={primaryRow ? "residência primária" : REL_LABEL[r.relationship] ?? r.relationship}
                      primary={primaryRow}
                      badge={primaryRow ? undefined : sm}
                      actions={
                        primaryRow ? null : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {isPending(r.status) && (
                              <button
                                disabled={busy === r.id}
                                onClick={() => act(r.id, () => approveResident(r.id, r.status))}
                                style={{ border: "none", borderRadius: 9, background: "#2F7A57", color: "#fff", font: "700 11px Inter", padding: "6px 12px", cursor: "pointer", opacity: busy === r.id ? 0.6 : 1 }}
                              >
                                Aprovar
                              </button>
                            )}
                            <button
                              onClick={() => navigate("/residentDocs", { state: { residentId: r.id, residentName: r.full_name, relationship: r.relationship } })}
                              style={{ border: "1px solid #E2D8C8", borderRadius: 9, background: "transparent", color: "#B0831F", font: "700 11px Inter", padding: "6px 12px", cursor: "pointer" }}
                            >
                              Documentos
                            </button>
                            <button
                              disabled={busy === r.id}
                              onClick={() => act(r.id, () => removeResident(r.id))}
                              style={{ border: "1px solid #E2C4BE", borderRadius: 9, background: "transparent", color: "#D14B3A", font: "700 11px Inter", padding: "6px 12px", cursor: "pointer", opacity: busy === r.id ? 0.6 : 1 }}
                            >
                              Remover
                            </button>
                          </div>
                        )
                      }
                    />
                  );
                })}
                {realList.length === 0 && (
                  <div style={{ font: "400 13px Inter", color: "#A99E8C", padding: "4px 2px" }}>Ainda não há residentes registados.</div>
                )}
              </>
            ) : (
              demoMembers.map((m) => (
                <ResidentCard key={m.id} name={m.name} sub={m.sub} primary={m.primary} />
              ))
            )}
          </div>
        </div>

        <button onClick={() => navigate("/addMember")} style={{ border: "1.5px dashed #D4A853", background: "transparent", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: "#B0831F", cursor: "pointer" }}>
          + Adicionar residente
        </button>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0, textAlign: "center" }}>
          {useReal
            ? "Co-residentes precisam de prova documental e aprovação. A residência primária define o ciclo de verificação."
            : "Uma morada pode abrigar várias pessoas. A residência primária define o ciclo de verificação."}
        </p>
      </div>
    </PhoneChrome>
  );
}

function ResidentCard({
  name, sub, primary, badge, actions,
}: {
  name: string; sub: string; primary?: boolean;
  badge?: { label: string; tone: "green" | "amber" | "red" };
  actions?: React.ReactNode;
}) {
  return (
    <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar initials={initialsOf(name)} primary={primary} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: "700 14px Inter", color: "#1A1814" }}>{name}</div>
          <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 1 }}>{sub}</div>
        </div>
        {primary ? (
          <span style={{ font: "700 9px Inter", letterSpacing: ".08em", color: "#B0831F", background: "#FBF2DC", borderRadius: 6, padding: "3px 7px", flex: "none" }}>PRIMÁRIA</span>
        ) : badge ? (
          <span style={{ font: "700 10px Inter", color: TONE[badge.tone].fg, background: TONE[badge.tone].bg, borderRadius: 8, padding: "4px 8px", flex: "none", whiteSpace: "nowrap" }}>{badge.label}</span>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "amber" }) {
  return (
    <div style={{ flex: 1, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ font: "700 20px 'Space Mono'", color: tone === "amber" ? "#B0831F" : "#1A1814" }}>{value}</div>
      <div style={{ font: "400 11.5px Inter", color: "#8A8073", marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function Avatar({ initials, primary }: { initials: string; primary?: boolean }) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        font: "700 13px Inter",
        background: primary ? "linear-gradient(135deg,#D4A853,#E07B2C)" : "#F0EADE",
        color: primary ? "#2D2519" : "#8A8073",
      }}
    >
      {initials}
    </span>
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
