import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import {
  DOC_TYPES, suggestedDocFor, listResidentDocs, uploadResidentDoc,
  type ResidentDocType, type ResidentDocRow,
} from "../../lib/supabase/residentDocs";
import { REL_LABEL } from "../../lib/supabase/residents";

interface DocsState {
  residentId?: string;
  residentName?: string;
  relationship?: string;
}

const DOC_LABEL = Object.fromEntries(DOC_TYPES.map((d) => [d.value, d.label]));
const STATUS_LABEL: Record<string, { t: string; c: string; b: string }> = {
  pending: { t: "A aguardar validação", c: "#B0831F", b: "#FBF2DC" },
  approved: { t: "Validado", c: "#2F7A57", b: "#EBF1ED" },
  verified: { t: "Validado", c: "#2F7A57", b: "#EBF1ED" },
  rejected: { t: "Recusado", c: "#D14B3A", b: "#FBEAE7" },
};

export function ResidentDocsScreen() {
  const navigate = useNavigate();
  const st = (useLocation().state ?? {}) as DocsState;
  const residentId = st.residentId ?? null;

  const [docType, setDocType] = useState<ResidentDocType>(suggestedDocFor(st.relationship ?? ""));
  const [rows, setRows] = useState<ResidentDocRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    if (!residentId) return;
    setRows(await listResidentDocs(residentId));
  }, [residentId]);
  useEffect(() => { refresh(); }, [refresh]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !residentId) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await uploadResidentDoc(residentId, docType, file);
      setMsg({ ok: r.ok, text: r.message });
      if (r.ok) await refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message ?? "Ocorreu um erro." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={{ all: "unset", cursor: "pointer", width: 38, height: 38, borderRadius: 11, background: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1814" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div>
          <div style={{ font: "700 16px Inter", color: "#1A1814" }}>Documentos</div>
          {st.residentName && (
            <div style={{ font: "400 12px Inter", color: "#8A8073" }}>{st.residentName}{st.relationship ? ` · ${REL_LABEL[st.relationship] ?? st.relationship}` : ""}</div>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {!residentId ? (
          <div style={{ marginTop: 8, background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 18, padding: "26px 20px", textAlign: "center", font: "400 14px Inter", color: "#8A8073", lineHeight: 1.5 }}>
            Abra os documentos a partir de um residente, no Agregado.
          </div>
        ) : (
          <>
            <p style={{ font: "400 13.5px Inter", color: "#8A8073", lineHeight: 1.5, margin: 0 }}>
              Submeta a <strong>prova da relação</strong> com o titular. Fica a aguardar validação.
            </p>

            {/* tipo de documento */}
            <div>
              <div style={{ font: "700 11px Inter", letterSpacing: ".08em", color: "#A0937E", marginBottom: 8 }}>TIPO DE DOCUMENTO</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DOC_TYPES.map((d) => {
                  const on = docType === d.value;
                  return (
                    <button key={d.value} onClick={() => setDocType(d.value)} style={{ border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7", background: on ? "#FBF2DC" : "#FFFDF9", borderRadius: 11, padding: "8px 12px", font: `${on ? 700 : 600} 12.5px Inter`, color: "#1A1814", cursor: "pointer" }}>
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* enviar ficheiro */}
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onFile} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} disabled={busy} style={{ border: "1.5px solid #D4A853", background: "#FBF2DC", color: "#B0831F", borderRadius: 14, height: 52, font: "700 14px Inter", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
              {busy ? "A enviar…" : `Enviar ${DOC_LABEL[docType]}`}
            </button>

            {msg && (
              <div style={{ font: "600 12.5px Inter", color: msg.ok ? "#2F7A57" : "#B23A2A", background: msg.ok ? "#EBF1ED" : "#FBEAE7", border: `1px solid ${msg.ok ? "#CDE4D6" : "#F0C9C1"}`, borderRadius: 12, padding: "10px 12px", lineHeight: 1.4 }}>{msg.text}</div>
            )}

            {/* documentos enviados */}
            <div>
              <div style={{ font: "700 11px Inter", letterSpacing: ".08em", color: "#A0937E", margin: "2px 0 8px" }}>ENVIADOS</div>
              {rows.length === 0 ? (
                <div style={{ font: "400 13px Inter", color: "#A99E8C" }}>Ainda não há documentos.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {rows.map((d) => {
                    const s = STATUS_LABEL[d.status] ?? { t: d.status, c: "#B0831F", b: "#FBF2DC" };
                    return (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                        <span style={{ width: 38, height: 38, borderRadius: 10, background: "#F4EAD6", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B98421" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: "700 13px Inter", color: "#1A1814", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{DOC_LABEL[d.document_type] ?? d.document_type}</div>
                          <div style={{ font: "400 11.5px Inter", color: "#8A8073", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.file_name}</div>
                        </div>
                        <span style={{ font: "700 10px Inter", color: s.c, background: s.b, borderRadius: 8, padding: "4px 8px", flex: "none", whiteSpace: "nowrap" }}>{s.t}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PhoneChrome>
  );
}
