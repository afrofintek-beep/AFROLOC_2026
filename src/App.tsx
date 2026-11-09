import validatorPositions from "./data/fair-validator-positions.json";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./lib/supabase/client";
import { Logo } from "./components/Logo";
import "./styles/fair.css";
type Witness = {
  id: string;
  code: string;
  status: string;
  eligible: boolean;
  distance_m: number | null;
};
type Address = {
  id: string;
  code: string;
  status: string;
  municipality: string | null;
  area: string | null;
  street: string | null;
  number: string | null;
  unit: string | null;
  latitude: number | null;
  longitude: number | null;
  enrolled: boolean;
  reviewed: boolean;
  confirmed: number;
  approved: boolean;
  witnesses: Witness[];
};
type State = {
  addresses: Address[];
  invitations: { id: string; code: string; status: string }[];
  contacts: { phone: string; area: string }[];
  condominiums: { id: string; name: string; municipality: string }[];
  is_validator: boolean;
};
type Info = {
  afroloc_code: string;
  municipality: string;
  street: string;
  number: string;
  unit: string;
  is_witness: boolean;
  status: string;
};
const empty: State = {
  addresses: [],
  invitations: [],
  contacts: [],
  condominiums: [],
  is_validator: false,
};
const statusName = (s: string) =>
  ({
    draft: "Rascunho",
    pending: "Pendente",
    verified: "Verificado",
    certified: "Certificado",
    confirmed: "Confirmado",
    rejected: "Recusado",
    revoked: "Revogado",
    expired: "Expirado",
  })[s] || s;
async function api(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("fair-verification", {
    body: payload,
  });
  if (error) {
    const d = await error.context?.json?.().catch(() => null);
    throw new Error(
      d?.error || "Não foi possível contactar a AFROLOC. Tente atualizar.",
    );
  }
  if (data?.error || (!data?.ok && !data?.success))
    throw new Error(data?.error || "Operação não concluída.");
  return data;
}
export default function App() {
  const [session, setSession] = useState<Session | null>(null),
    [ready, setReady] = useState(false),
    [state, setState] = useState<State>(empty),
    [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [mfa, setMfa] = useState(""),
    [needsMfa, setNeedsMfa] = useState(false);
  const [selected, setSelected] = useState(""),
    [witnessCode, setWitnessCode] = useState(""),
    [consent, setConsent] = useState(false);
  const [invite, setInvite] = useState(
      new URLSearchParams(window.location.search).get("witness") || "",
    ),
    [info, setInfo] = useState<Info | null>(null);
  const [otp, setOtp] = useState(""),
    [name, setName] = useState(""),
    [signature, setSignature] = useState("");
  const [reviewCode, setReviewCode] = useState(""),
    [inspection, setInspection] = useState<Address | null>(null),
    [housing, setHousing] = useState("neighbourhood"),
    [condo, setCondo] = useState(""),
    [condoName, setCondoName] = useState(""),
    [notes, setNotes] = useState(""),
    [reviewConsent, setReviewConsent] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message);
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setState(empty);
      setLoaded(false);
      setInfo(null);
      setInspection(null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const refresh = useCallback(async () => {
    setState(await api({ action: "list" }));
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!session) {
      setState(empty);
      setLoaded(false);
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active) return;
      const needed = data?.nextLevel === "aal2" && data.currentLevel !== "aal2";
      setNeedsMfa(needed);
      if (!needed) await refresh();
    })().catch((e) => {
      if (active) setError(e.message);
    });
    return () => {
      active = false;
    };
  }, [session, refresh]);
  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  }
  async function login(e: FormEvent) {
    e.preventDefault();
    await run(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setPassword("");
    });
  }
  async function verifyMfa(e: FormEvent) {
    e.preventDefault();
    await run(async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const factor = data.totp.find((f) => f.status === "verified");
      if (!factor)
        throw new Error("Conclua a autenticação adicional na AFROLOC.");
      const r = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: mfa,
      });
      if (r.error) throw r.error;
      setMfa("");
      setNeedsMfa(false);
      await refresh();
    });
  }
  const address = state.addresses.find((a) => a.id === selected);
  async function inspectInvite(id: string) {
    setInvite(id);
    setInfo(null);
    setConsent(false);
    setOtp("");
    await run(async () =>
      setInfo(await api({ action: "info", witness_id: id })),
    );
  }
  const signedIn = !!session && !needsMfa;
  return (
    <main className="fair-app">
      <header>
        <Logo size={42} wordmark />
        <a href="https://natal.yamilook.com">Voltar à feira</a>
      </header>
      <section className="fair-hero">
        <span className="fair-eyebrow">FEIRA DE NATAL SOLIDÁRIO 2026</span>
        <h1>
          A sua morada.
          <br />A confiança dos seus vizinhos.
        </h1>
        <p>
          Associe o seu endereço AFROLOC à feira e acompanhe as confirmações e a
          validação oficial.
        </p>
        <div className="fair-rule">
          <strong>3 testemunhas · até 500 m</strong>
          <span>No mesmo condomínio, quando aplicável.</span>
        </div>
      </section>
      <div className="fair-content">
        <section className="fair-card" aria-labelledby="validator-positions-title">
          <h2 id="validator-positions-title">Validadores da feira</h2>
          <p>Posições criadas para designação. As pessoas e os contactos serão associados e verificados antes da ativação.</p>
          <div className="fair-validator-positions">
            {validatorPositions.map((position) => (
              <article key={position.id} className="fair-validator-position">
                <span className="fair-eyebrow">Designação pendente</span>
                <h3>{position.title} · {position.area}</h3>
                <dl>
                  <dt>Nome</dt><dd>A designar</dd>
                  <dt>Tel.</dt><dd>A indicar</dd>
                  <dt>Email</dt><dd>A atribuir · @{position.email_domain}</dd>
                </dl>
              </article>
            ))}
          </div>
          <p className="fair-muted">Estas posições ainda não têm titulares nem autorização para validar endereços. Os contactos habilitados aparecem após a confirmação oficial.</p>
        </section>
        {error && (
          <p role="alert" className="fair-error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="fair-message">
            {message}
          </p>
        )}
        {!ready && <p role="status">A recuperar a sessão…</p>}
        {ready && !isSupabaseConfigured && (
          <p role="alert">
            A ligação à AFROLOC está indisponível. Não é possível consultar ou
            confirmar endereços.
          </p>
        )}
        {ready && isSupabaseConfigured && !session && (
          <section className="fair-card">
            <h2>Entrar na AFROLOC</h2>
            <p>
              Use a mesma conta de afroloc.ao para consultar os seus endereços.
            </p>
            <form onSubmit={login}>
              <label>
                Email
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Palavra-passe
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button disabled={busy}>Entrar</button>
            </form>
            <div className="fair-links">
              <a href="https://www.afroloc.ao/login">
                Criar conta ou recuperar acesso
              </a>
            </div>
          </section>
        )}
        {session && needsMfa && (
          <section className="fair-card">
            <h2>Confirmar a sua identidade</h2>
            <form onSubmit={verifyMfa}>
              <label>
                Código do autenticador
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={mfa}
                  onChange={(e) => setMfa(e.target.value)}
                  required
                />
              </label>
              <button disabled={busy}>Confirmar acesso</button>
            </form>
          </section>
        )}
        {signedIn && (
          <>
            <div className="fair-toolbar">
              <span>{session.user.email || "Conta AFROLOC"}</span>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => run(refresh)}
              >
                Atualizar
              </button>
              <button
                className="secondary"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    setSelected("");
                    setInvite("");
                    setInfo(null);
                    setInspection(null);
                  })
                }
              >
                Sair
              </button>
            </div>
            <section className="fair-card">
              <h2>Os meus endereços</h2>
              <p>
                Os códigos abaixo são os registos da sua conta em afroloc.ao.
              </p>
              <a
                className="fair-link-button"
                href="https://www.afroloc.ao/identities/create"
                target="_blank"
                rel="noopener noreferrer"
              >
                Criar endereço na AFROLOC ↗
              </a>
              <p className="fair-small">
                Depois de criar a morada, volte aqui e carregue em Atualizar.
              </p>
              {!loaded ? (
                <p role="status">A consultar os registos…</p>
              ) : state.addresses.length === 0 ? (
                <p>
                  A sua conta ainda não tem um endereço elegível registado em
                  Angola.
                </p>
              ) : (
                state.addresses.map((a) => (
                  <button
                    key={a.id}
                    className={
                      "fair-address " + (selected === a.id ? "selected" : "")
                    }
                    onClick={() => {
                      setSelected(a.id);
                      setWitnessCode("");
                      setConsent(false);
                    }}
                  >
                    <code>{a.code}</code>
                    <span>
                      {[a.street, a.number, a.unit, a.area, a.municipality]
                        .filter(Boolean)
                        .join(" · ") || "Morada registada"}
                    </span>
                    <span>
                      {statusName(a.status)} ·{" "}
                      {a.enrolled
                        ? a.approved
                          ? "Validado para a feira"
                          : `${a.confirmed}/3 confirmações válidas · processo pendente`
                        : "Ainda não associado à feira"}
                    </span>
                  </button>
                ))
              )}
            </section>
            {address && (
              <section className="fair-card">
                <h2>Verificação para a feira</h2>
                <code className="fair-code">{address.code}</code>
                {!address.enrolled ? (
                  <>
                    <p>
                      A associação exige três testemunhas e revisão oficial. A
                      morada associada fica protegida contra alterações enquanto
                      o processo decorre.
                    </p>
                    <button
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await api({
                            action: "enroll",
                            record_id: address.id,
                          });
                          await refresh();
                          setMessage(
                            "Endereço associado. A verificação para a feira está pendente.",
                          );
                        })
                      }
                    >
                      Associar este endereço à feira
                    </button>
                  </>
                ) : (
                  <>
                    <div className="fair-status-grid">
                      <div>
                        <strong>{address.confirmed}/3</strong>
                        <span>Testemunhas elegíveis</span>
                      </div>
                      <div>
                        <strong>
                          {address.reviewed ? "Verificada" : "Pendente"}
                        </strong>
                        <span>Inspeção da residência</span>
                      </div>
                      <div>
                        <strong>
                          {address.approved ? "Aprovado" : "Pendente"}
                        </strong>
                        <span>Processo da feira</span>
                      </div>
                    </div>
                    {!address.reviewed && (
                      <p>
                        Contacte um validador oficial para verificar a
                        localização da residência e a pertença ao condomínio,
                        quando aplicável. As testemunhas também precisam dessa
                        verificação.
                      </p>
                    )}
                    {address.witnesses.map((w) => (
                      <div className="fair-witness" key={w.id}>
                        <code>{w.code}</code>
                        <span>
                          {statusName(w.status)} ·{" "}
                          {w.eligible ? "Elegível" : "Elegibilidade pendente"}
                        </span>
                        {w.distance_m !== null && (
                          <span>
                            Distância entre moradas:{" "}
                            {Number(w.distance_m).toFixed(1)} m
                          </span>
                        )}
                        {w.status === "pending" && (
                          <button
                            className="secondary"
                            disabled={busy}
                            onClick={() =>
                              run(async () => {
                                const r = await api({
                                  action: "send",
                                  witness_id: w.id,
                                });
                                setMessage(r.message);
                                await refresh();
                              })
                            }
                          >
                            Reenviar código
                          </button>
                        )}
                      </div>
                    ))}
                    {!address.approved && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          run(async () => {
                            const r = await api({
                              action: "request",
                              record_id: address.id,
                              code: witnessCode.trim(),
                              consent: true,
                            });
                            setMessage(r.message || "Pedido registado.");
                            setWitnessCode("");
                            setConsent(false);
                            await refresh();
                          });
                        }}
                      >
                        <label>
                          Endereço AFROLOC completo da testemunha
                          <input
                            value={witnessCode}
                            onChange={(e) => setWitnessCode(e.target.value)}
                            maxLength={100}
                            required
                            autoComplete="off"
                          />
                        </label>
                        <label className="fair-check">
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            required
                          />
                          Confirmo o envio do pedido à testemunha.
                        </label>
                        <button
                          disabled={
                            busy ||
                            !address.reviewed ||
                            !consent ||
                            address.witnesses.filter(
                              (w) => w.status !== "rejected",
                            ).length >= 3
                          }
                        >
                          Pedir confirmação
                        </button>
                      </form>
                    )}
                    <p className="fair-small">
                      Só a própria testemunha pode confirmar, na sua conta, com
                      o código recebido por SMS. O pedido não equivale à
                      confirmação.
                    </p>
                  </>
                )}
              </section>
            )}
            <section className="fair-card">
              <h2>Pedidos para eu testemunhar</h2>
              {invite && (
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => inspectInvite(invite)}
                >
                  Abrir pedido recebido
                </button>
              )}
              {state.invitations.length === 0 ? (
                <p>Não existem pedidos registados para esta conta.</p>
              ) : (
                state.invitations.map((i) => (
                  <button
                    className="fair-address"
                    key={i.id}
                    disabled={busy}
                    onClick={() => inspectInvite(i.id)}
                  >
                    <code>{i.code}</code>
                    <span>{statusName(i.status)}</span>
                  </button>
                ))
              )}
              {info && (
                <div className="fair-invitation">
                  <h3>Confirmar a residência</h3>
                  <code className="fair-code">{info.afroloc_code}</code>
                  <p>
                    {[info.street, info.number, info.unit, info.municipality]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p>Estado: {statusName(info.status)}</p>
                  {info.is_witness && info.status === "pending" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        run(async () => {
                          await api({
                            action: "verify",
                            witness_id: invite,
                            otp_code: otp,
                            full_name: name,
                            signature,
                            consent: true,
                            decision: "confirm",
                          });
                          setInfo(null);
                          setOtp("");
                          setConsent(false);
                          await refresh();
                          setMessage(
                            "Confirmação registada. A aprovação oficial continua a ser uma etapa separada.",
                          );
                        });
                      }}
                    >
                      <label>
                        Nome completo
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          minLength={3}
                          maxLength={160}
                          required
                        />
                      </label>
                      <label>
                        Assinatura — escreva o seu nome
                        <input
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          minLength={3}
                          maxLength={160}
                          required
                        />
                      </label>
                      <label>
                        Código recebido por SMS
                        <input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                        />
                      </label>
                      <label className="fair-check">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          required
                        />
                        Conheço o titular e confirmo que reside neste endereço.
                        Autorizo o registo desta declaração.
                      </label>
                      <button disabled={busy || !consent}>
                        Confirmar o testemunho
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        disabled={
                          busy ||
                          !otp ||
                          name.trim().length < 3 ||
                          signature.trim().length < 3
                        }
                        onClick={() =>
                          run(async () => {
                            await api({
                              action: "verify",
                              witness_id: invite,
                              otp_code: otp,
                              full_name: name,
                              signature,
                              consent: true,
                              decision: "reject",
                            });
                            setInfo(null);
                            await refresh();
                            setMessage("Recusa registada.");
                          })
                        }
                      >
                        Não confirmo esta residência
                      </button>
                    </form>
                  )}
                </div>
              )}
            </section>
            <section className="fair-card">
              <h2>Validadores oficiais</h2>
              {state.contacts.length ? (
                state.contacts.map((c) => (
                  <a
                    className="fair-contact"
                    key={c.phone + c.area}
                    href={"tel:" + c.phone.replace(/[^+0-9]/g, "")}
                  >
                    <strong>{c.area}</strong>
                    <span>{c.phone}</span>
                  </a>
                ))
              ) : (
                <p>
                  Não há contactos oficiais verificados disponíveis para os seus
                  endereços. Os números serão apresentados após o respetivo
                  registo e confirmação.
                </p>
              )}
            </section>
            {state.is_validator && (
              <section className="fair-card">
                <h2>Área do validador oficial</h2>
                <p>
                  Consulte o endereço exato e registe apenas verificações
                  efetivamente realizadas na sua jurisdição.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(async () => {
                      setInspection(
                        (
                          await api({
                            action: "inspect",
                            code: reviewCode.trim(),
                          })
                        ).record,
                      );
                      setReviewConsent(false);
                    });
                  }}
                >
                  <label>
                    Código AFROLOC
                    <input
                      value={reviewCode}
                      onChange={(e) => {
                        setReviewCode(e.target.value);
                        setInspection(null);
                      }}
                      maxLength={100}
                      required
                    />
                  </label>
                  <button disabled={busy}>Consultar processo</button>
                </form>
                {inspection && (
                  <>
                    <code className="fair-code">{inspection.code}</code>
                    <p>
                      {[
                        inspection.street,
                        inspection.number,
                        inspection.unit,
                        inspection.municipality,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p>
                      Coordenadas registadas:{" "}
                      {inspection.latitude ?? "em falta"},{" "}
                      {inspection.longitude ?? "em falta"}
                    </p>
                    <p>
                      {inspection.confirmed}/3 confirmações válidas ·{" "}
                      {inspection.reviewed
                        ? "residência verificada"
                        : "inspeção pendente"}
                    </p>
                    <label>
                      Tipo de residência
                      <select
                        value={housing}
                        onChange={(e) => setHousing(e.target.value)}
                      >
                        <option value="neighbourhood">
                          Fora de condomínio — proximidade
                        </option>
                        <option value="condominium">Condomínio</option>
                      </select>
                    </label>
                    {housing === "condominium" && (
                      <>
                        <label>
                          Condomínio verificado
                          <select
                            value={condo}
                            onChange={(e) => setCondo(e.target.value)}
                          >
                            <option value="">Selecionar</option>
                            {state.condominiums.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} · {c.municipality}
                              </option>
                            ))}
                          </select>
                        </label>
                        <details>
                          <summary>
                            Registar condomínio ainda não listado
                          </summary>
                          <label>
                            Nome oficial
                            <input
                              value={condoName}
                              onChange={(e) => setCondoName(e.target.value)}
                              maxLength={160}
                            />
                          </label>
                          <button
                            className="secondary"
                            disabled={busy || condoName.trim().length < 3}
                            onClick={() =>
                              run(async () => {
                                const r = await api({
                                  action: "condominium",
                                  code: inspection.code,
                                  name: condoName.trim(),
                                });
                                await refresh();
                                setCondo(r.condominium_id);
                                setCondoName("");
                              })
                            }
                          >
                            Registar condomínio verificado
                          </button>
                        </details>
                      </>
                    )}
                    <label>
                      Evidência e observações
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        minLength={10}
                        maxLength={2000}
                        placeholder="Descreva como verificou a residência, a localização e o condomínio."
                      />
                    </label>
                    <label className="fair-check">
                      <input
                        type="checkbox"
                        checked={reviewConsent}
                        onChange={(e) => setReviewConsent(e.target.checked)}
                      />
                      Confirmo que realizei a verificação da residência e da
                      localização indicada.
                    </label>
                    <button
                      disabled={
                        busy ||
                        !reviewConsent ||
                        notes.trim().length < 10 ||
                        (housing === "condominium" && !condo)
                      }
                      onClick={() =>
                        run(async () => {
                          await api({
                            action: "review",
                            code: inspection.code,
                            housing,
                            condominium_id:
                              housing === "condominium" ? condo : null,
                            notes,
                            consent: true,
                          });
                          setInspection(
                            (
                              await api({
                                action: "inspect",
                                code: inspection.code,
                              })
                            ).record,
                          );
                          await refresh();
                          setMessage(
                            "Inspeção registada com a sua identificação. Não foi emitida aprovação automática.",
                          );
                        })
                      }
                    >
                      Registar inspeção da residência
                    </button>
                    <button
                      disabled={
                        busy ||
                        !reviewConsent ||
                        notes.trim().length < 10 ||
                        !inspection.reviewed ||
                        !inspection.enrolled ||
                        inspection.confirmed !== 3
                      }
                      onClick={() =>
                        run(async () => {
                          await api({
                            action: "certify",
                            code: inspection.code,
                            notes,
                            consent: true,
                          });
                          setInspection(
                            (
                              await api({
                                action: "inspect",
                                code: inspection.code,
                              })
                            ).record,
                          );
                          await refresh();
                          setMessage(
                            "Endereço aprovado pelo validador oficial após as três confirmações.",
                          );
                        })
                      }
                    >
                      Aprovar após três confirmações
                    </button>
                  </>
                )}
              </section>
            )}
          </>
        )}
        <footer>
          AFROLOC · Localizar é incluir.
          <br />
          <a href="https://www.afroloc.ao">Abrir afroloc.ao</a>
        </footer>
      </div>
    </main>
  );
}
