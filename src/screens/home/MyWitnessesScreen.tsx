import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { useAuth } from "../../state/auth";
import { useCitizenData } from "../../state/citizenData";
import { listWitnesses, addWitnessByCode, type WitnessRow } from "../../lib/supabase/witnesses";

/**
 * Testemunhas REAIS da morada principal do cidadão. Lista as testemunhas de
 * `afroloc_witnesses` e permite adicionar uma pela AFROLOC do vizinho (validação
 * + OTP, como no app oficial). Em modo demo (sem sessão) não há dados reais.
 */
export function MyWitnessesScreen() {
  const navigate = useNavigate();
  const { configured } = useAuth();
  const { primary } = useCitizenData();
  const recordId = primary?.id ?? null;

  const [rows, setRows] = useState<WitnessRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!configured || !recordId) return;
    setLoading(true);
    try {
      setRows(await listWitnesses(recordId));
    } finally {
      setLoading(false);
    }
  }, [configured, recordId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add() {
    if (!recordId || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await addWitnessByCode(recordId, code);
      setMsg({ ok: r.ok, text: r.message });
      if (r.ok) {
        setCode("");
        await refresh();
      }
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message ?? "Ocorreu um erro." });
    } finally {
      setBusy(false);
    }
  }

  const statusLabel = (s: string) =>
    s === "confirmed" ? "Confirmada" : s === "rejected" ? "Recusada" : "A aguardar confirmação";
  const statusTone = (s: string) => (s === "confirmed" ? "#2F7A57" : s === "rejected" ? "#D14B3A" : "#B98421");

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={{ all: "unset", cursor: "pointer", width: 38, height: 38, borderRadius: 11, background: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1814" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Testemunhas</span>
      </div>

      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {!configured ? (
          <Empty text="Inicie sessão para gerir as testemunhas reais da sua morada." />
        ) : !recordId ? (
          <Empty text="Crie primeiro uma morada. Depois pode adicionar testemunhas reais aqui." />
        ) : (
          <>
            <p style={{ font: "400 13.5px Inter", color: "#8A8073", lineHeight: 1.5, margin: 0 }}>
              Adicione vizinhos com AFROLOC <strong>verificada</strong>, introduzindo o código deles. Recebem um código para confirmar.
            </p>

            {/* input */}
            <div style={{ display: "flex", gap: 8, background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 14, padding: 8 }}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="AO-LDA-BEL-…"
                style={{ flex: 1, border: "none", background: "transparent", font: "700 13px 'Space Mono'", color: "#1A1814", outline: "none", paddingLeft: 8 }}
              />
              <button onClick={add} disabled={busy} style={{ border: "none", borderRadius: 10, background: "#1A1814", color: "#E8C97A", font: "700 13px Inter", padding: "0 16px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "…" : "Adicionar"}
              </button>
            </div>

            {msg && (
              <div style={{ font: "600 12.5px Inter", color: msg.ok ? "#2F7A57" : "#B23A2A", background: msg.ok ? "#EBF1ED" : "#FBEAE7", border: `1px solid ${msg.ok ? "#CDE4D6" : "#F0C9C1"}`, borderRadius: 12, padding: "10px 12px", lineHeight: 1.4 }}>
                {msg.text}
              </div>
            )}

            {/* list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading && rows.length === 0 && <div style={{ font: "400 13px Inter", color: "#A99E8C" }}>A carregar…</div>}
              {!loading && rows.length === 0 && (
                <Empty text="Ainda não há testemunhas nesta morada." />
              )}
              {rows.map((w) => (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 16, padding: "12px 14px" }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", flex: "none", background: "#F4EAD6", color: "#B98421", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B98421" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /></svg>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "700 12.5px 'Space Mono'", color: "#1A1814", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.witness_afro_id}</div>
                    <div style={{ font: "600 11.5px Inter", color: statusTone(w.status), marginTop: 3 }}>{statusLabel(w.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PhoneChrome>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 8, background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 18, padding: "26px 20px", textAlign: "center", font: "400 14px Inter", color: "#8A8073", lineHeight: 1.5 }}>
      {text}
    </div>
  );
}
