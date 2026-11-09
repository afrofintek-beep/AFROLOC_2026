import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { TabBar } from "../../components/ui/TabBar";
import { Qr } from "../../components/ui/Qr";
import { useAuth } from "../../state/auth";
import { useRecords } from "../../state/records";
import { canonical, errorText, placeLabel, statusLabel, type CanonicalAddress, type Country, type Division, type PublicAddress } from "../../lib/supabase/canonical";
import { supabase } from "../../lib/supabase/client";
import "../../styles/services.css";

export function Page({ title, active, children }: { title: string; active?: string; children: ReactNode }) {
  const navigate = useNavigate();
  return <PhoneChrome bg="#F0EADE" tabBar={<TabBar active={active || "services"} />}><main className="live-page">
    <div className="live-actions"><button className="live-button" onClick={() => navigate("/services")}>← Serviços</button></div>
    <h1>{title}</h1>{children}
  </main></PhoneChrome>;
}
const Row = ({ name, value }: { name: string; value: ReactNode }) => <div className="live-row"><span>{name}</span><span>{value ?? "Não registado"}</span></div>;
const dateLabel = (s: string | null) => s ? new Date(s).toLocaleDateString("pt-AO") : "Não registada";
const detailUrl = (a: CanonicalAddress) => "/detail?id=" + encodeURIComponent(a.id);
const publicUrl = (code: string) => `${window.location.origin}/#/publicLookup?code=${encodeURIComponent(code)}`;

function RecordState() {
  const { loading, error, refresh } = useRecords();
  if (loading) return <p role="status">A consultar os seus registos…</p>;
  return error ? <div role="alert" className="live-error">{error}<button className="live-button" onClick={() => void refresh()}>Tentar novamente</button></div> : null;
}
function AddressCard({ address: a }: { address: CanonicalAddress }) {
  const navigate = useNavigate();
  return <button className="live-card" onClick={() => navigate(detailUrl(a))}>
    <h2>{a.property_name || "Morada"}</h2><div className="live-code">{a.code}</div>
    <p>{placeLabel(a)}</p><span className="live-tag">{statusLabel(a.status)}</span>
    {a.ats_score != null && <Row name="Confiança (ATS)" value={a.ats_score} />}
  </button>;
}
export function LiveHomeScreen() {
  const { profile } = useAuth();
  const { records, loading, error } = useRecords();
  const navigate = useNavigate();
  return <Page title={`Olá, ${profile?.name?.split(" ")[0] || "bem-vindo"}`} active="home">
    <p>A sua presença começa com uma morada.</p><RecordState />
    {records[0] && <div className="live-card is-dark"><div className="live-section-title">A minha AFROLOC</div><div className="live-code">{records[0].code}</div><p>{placeLabel(records[0])}</p><span className="live-tag">{statusLabel(records[0].status)}</span><button className="live-button" onClick={() => navigate(detailUrl(records[0]))}>Ver morada</button></div>}
    {!loading && !error && !records.length && <div className="live-card"><h2>Ainda não tem moradas</h2><p>Crie uma morada para iniciar a validação.</p></div>}
    <div className="live-actions"><button className="live-button primary" onClick={() => navigate("/type")}>Criar morada</button><button className="live-button" onClick={() => navigate("/services")}>Todos os serviços</button></div>
    <div className="live-card"><h2>Feira de Natal</h2><p>Três testemunhas, até 500 m e revisão por um validador oficial. No condomínio, as testemunhas devem residir no mesmo condomínio.</p><a className="live-button" href="/feira/">Acompanhar validação da feira</a></div>
  </Page>;
}
export function LiveAddressesScreen() {
  const { records, loading, error } = useRecords();
  const [filter, setFilter] = useState("all"); const navigate = useNavigate();
  const shown = records.filter(a => filter === "all" || (filter === "verified" ? ["verified", "certified"].includes(a.status) : !["verified", "certified"].includes(a.status)));
  return <Page title="As minhas moradas" active="addresses"><RecordState />
    <button className="live-button primary" onClick={() => navigate("/type")}>+ Criar morada</button>
    <label>Filtrar<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Todas</option><option value="verified">Verificadas ou certificadas</option><option value="pending">Restantes estados</option></select></label>
    {!loading && !error && <p>{shown.length} morada(s)</p>}{shown.map(a => <AddressCard key={a.id} address={a} />)}
  </Page>;
}
export function LiveDetailScreen() {
  const { records, loading, error, refresh } = useRecords(); const [params] = useSearchParams();
  const a = params.get("id") ? records.find(r => r.id === params.get("id")) : records[0];
  const [name, setName] = useState(""); const [message, setMessage] = useState(""); const [failure, setFailure] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { setName(a?.property_name || ""); setMessage(""); setFailure(""); }, [a?.id, a?.property_name]);
  async function save(e: FormEvent) { e.preventDefault(); if (!a) return; setBusy(true); setMessage(""); setFailure(""); try { await canonical.rename(a.id, name); await refresh(); setMessage("Nome da morada guardado."); } catch(e) { setFailure(errorText(e)); } finally { setBusy(false); } }
  async function share() { if (!a) return; setMessage(""); setFailure(""); try { const url = publicUrl(a.code); if (navigator.share) await navigator.share({ title: "AFROLOC", text: a.code, url }); else { await navigator.clipboard.writeText(url); setMessage("Ligação copiada."); } } catch(e) { if (!(e instanceof Error && e.name === "AbortError")) setFailure(errorText(e)); } }
  return <Page title="A minha AFROLOC" active="addresses"><RecordState />
    {!loading && !error && !a && <p>Morada não encontrada na sua conta.</p>}
    {a && <><div className="live-card is-dark"><div className="live-code">{a.code}</div><span className="live-tag">{statusLabel(a.status)}</span><p>{placeLabel(a)}</p></div>
      <div className="live-card"><Row name="Rua / número" value={[a.street_name, a.number].filter(Boolean).join(" · ") || null} /><Row name="Fração" value={a.unit} /><Row name="Confiança (ATS)" value={a.ats_score} /><Row name="Última verificação" value={dateLabel(a.last_verified_at)} /><Row name="Próxima verificação" value={dateLabel(a.next_verification_due)} /><Row name="Criada em" value={dateLabel(a.created_at)} /></div>
      <form className="live-card" onSubmit={save}><label>Nome da morada<input value={name} maxLength={120} required onChange={e => setName(e.target.value)} /></label><button className="live-button" disabled={busy}>Guardar nome</button></form>
      <div className="live-card"><h2>Partilhar código</h2><Qr value={publicUrl(a.code)} size={132} /><p>A consulta pública só apresenta registos aprovados, verificados ou certificados. O código não substitui a certificação da residência.</p><button className="live-button primary" onClick={() => void share()}>Partilhar ligação</button></div>
      <div className="live-card"><h2>Validação e documentos</h2><a className="live-button" href="/feira/">Validação para a feira</a><a className="live-button" href={`https://afroloc.ao/identity/${encodeURIComponent(a.id)}`}>Abrir este registo em afroloc.ao</a><p>Os documentos e atos da autoridade dependem do estado e das permissões registadas.</p></div>
    </>}{message && <div role="status" className="live-success">{message}</div>}{failure && <div role="alert" className="live-error">{failure}</div>}
  </Page>;
}
export function LiveLookupScreen() {
  const [params] = useSearchParams(); const [code, setCode] = useState(params.get("code") || "");
  const [result, setResult] = useState<PublicAddress | null>(null); const [searched, setSearched] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const request = useRef(0);
  async function lookup(e: FormEvent) { e.preventDefault(); const id = ++request.current; setBusy(true); setSearched(false); setResult(null); setError(""); try { const r = await canonical.lookup(code); if (id === request.current) { setResult(r); setSearched(true); } } catch(e) { if (id === request.current) setError(errorText(e)); } finally { if (id === request.current) setBusy(false); } }
  return <Page title="Consultar AFROLOC"><p>Consulte o estado publicado de um código.</p><form className="live-card" onSubmit={lookup}><label>Código AFROLOC<input value={code} required onChange={e => { ++request.current; setBusy(false); setCode(e.target.value.toUpperCase()); setResult(null); setSearched(false); setError(""); }} /></label><button className="live-button primary" disabled={busy}>{busy ? "A consultar…" : "Consultar"}</button></form>
    {error && <div role="alert" className="live-error">{error}</div>}{searched && !result && <p role="status">Código não encontrado no registo público. Pode ainda estar pendente de validação.</p>}
    {result && <div className="live-card"><div className="live-code">{result.code}</div><span className="live-tag">{statusLabel(result.status)}</span><Row name="Localização" value={[result.municipio, result.provincia].filter(Boolean).join(" · ") || null} /><Row name="Confiança (ATS)" value={result.ats_score} /><Row name="Última verificação" value={dateLabel(result.last_verified_at)} /></div>}
    <p>A consulta não revela o nome, o contacto ou as coordenadas exatas do titular.</p></Page>;
}
export function LiveMapScreen() {
  const { records } = useRecords();
  const points = records.filter(a => a.geo_lat != null && a.geo_lon != null && Number.isFinite(Number(a.geo_lat)) && Number.isFinite(Number(a.geo_lon)));
  return <Page title="As minhas moradas no mapa" active="identitiesMap"><RecordState />
    {points.length > 0 ? <MapContainer key={points.map(a => a.id).join(",")} center={[Number(points[0].geo_lat), Number(points[0].geo_lon)]} zoom={14} style={{ height: 370, borderRadius: 18, flex: "none" }}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{points.map(a => <CircleMarker key={a.id} center={[Number(a.geo_lat), Number(a.geo_lon)]} radius={9} pathOptions={{ color: "#B0831F" }}><Popup>{a.property_name || a.code}<br />{statusLabel(a.status)}</Popup></CircleMarker>)}</MapContainer> : <p>Sem moradas com coordenadas disponíveis.</p>}
    {points.map(a => <AddressCard key={a.id} address={a} />)}</Page>;
}
export function LiveProfileScreen() {
  const { profile, user, refreshProfile, signOut } = useAuth(); const navigate = useNavigate();
  const [name, setName] = useState(profile?.name || ""), [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  useEffect(() => setName(profile?.name || ""), [profile?.name]);
  async function save(e: FormEvent) { e.preventDefault(); if (!user) return; setBusy(true); setError(""); setMessage(""); try { const { data, error } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("user_id", user.id).select("user_id").single(); if (error) throw error; if (!data) throw new Error("O perfil não foi atualizado."); await refreshProfile(); setMessage("Nome guardado."); } catch(e) { setError(errorText(e)); } finally { setBusy(false); } }
  async function logout() { setError(""); try { await signOut(); navigate("/login"); } catch(e) { setError(errorText(e)); } }
  return <Page title="O meu perfil" active="profile"><form onSubmit={save} className="live-card"><label>Nome<input required maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label><Row name="Email" value={user?.email} /><Row name="Telefone registado" value={profile?.phone} /><button className="live-button primary" disabled={busy}>Guardar nome</button></form>
    <a className="live-button" href="https://afroloc.ao/profile/change-phone">Alterar e verificar telefone em afroloc.ao</a><a className="live-button" href="https://afroloc.ao/profile">Segurança da conta em afroloc.ao</a>
    {error && <div role="alert" className="live-error">{error}</div>}{message && <div role="status" className="live-success">{message}</div>}<button className="live-button" onClick={() => void logout()}>Terminar sessão</button></Page>;
}

const connected = [
  { title: "As minhas moradas", text: "Consultar os registos associados à sua conta.", route: "addresses" },
  { title: "Criar endereço", text: "Código oficial e gravação na AFROLOC.", route: "type" },
  { title: "Consultar código", text: "Estado publicado pelo registo AFROLOC.", route: "publicLookup" },
  { title: "Mapa", text: "Localização das suas moradas registadas.", route: "identitiesMap" },
  { title: "Perfil", text: "Nome, contactos registados e sessão.", route: "profile" },
];
export function ServicesScreen() {
  const navigate = useNavigate();
  return <Page title="Serviços AFROLOC"><p>Localizar é incluir.</p><div className="live-section-title">Ligados ao registo AFROLOC</div>{connected.map(s => <button key={s.route} className="live-card" onClick={() => navigate("/" + s.route)}><h2>{s.title} →</h2><p>{s.text}</p></button>)}
    <div className="live-card"><span className="live-tag">Feira de Natal</span><h2>Testemunhas e validadores</h2><p>Três testemunhas distintas até 500 m. A aprovação exige a revisão de um validador oficial; no condomínio, a residência das testemunhas é verificada no mesmo condomínio.</p><a className="live-button" href="/feira/">Abrir validação da feira</a></div>
    <div className="live-section-title">Disponíveis na plataforma de origem</div><div className="live-card"><h2>Validação, documentos e administração</h2><p>Estes percursos abrem em afroloc.ao e mantêm as permissões da sua conta.</p><a className="live-button" href="https://afroloc.ao/validate-address">Validação oficial</a><a className="live-button" href="https://afroloc.ao/my-addresses">Documentos das minhas moradas</a><a className="live-button" href="https://afroloc.ao/validators">Validadores</a></div>
    <div className="live-card"><span className="live-tag">Integração pendente nesta versão</span><h2>Outros serviços</h2><p>Agregado familiar, arrendamento, operação offline, telecomunicações e painéis especializados ainda precisam de ligação e teste completos.</p><button className="live-button" onClick={() => navigate("/serviceStatus")}>Ver estado das funcionalidades</button></div>
  </Page>;
}
export function PendingScreen() {
  const { screenId } = useParams();
  return <Page title="Ligação em preparação"><div className="live-card"><span className="live-tag">Pendente</span><p>Esta funcionalidade ainda não tem um percurso operacional verificado nesta versão. Não foram efetuadas alterações aos seus registos.</p><p>Referência: {screenId}</p></div><a className="live-button" href="https://afroloc.ao">Abrir a plataforma de origem</a></Page>;
}
export function RecoveryScreen() {
  return <Page title="Recuperar acesso"><div className="live-card"><p>A recuperação é feita pelo serviço de autenticação da AFROLOC.</p><a className="live-button primary" href="https://afroloc.ao/forgot-password">Receber instruções por email</a></div></Page>;
}

function useDivisions(country: string, level: number, parent?: string) {
  const [items, setItems] = useState<Division[]>([]), [error, setError] = useState("");
  useEffect(() => {
    let current = true; setItems([]); setError("");
    if (country && (level === 1 || parent)) canonical.divisions(country, level, parent).then(v => { if (current) setItems(v); }).catch(e => { if (current) setError(errorText(e)); });
    return () => { current = false; };
  }, [country, level, parent]);
  return { items, error };
}
export function LiveCreateScreen() {
  const navigate = useNavigate(); const { refresh } = useRecords();
  const [countries, setCountries] = useState<Country[]>([]), [country, setCountry] = useState("AO"), [province, setProvince] = useState(""), [municipality, setMunicipality] = useState(""), [commune, setCommune] = useState("");
  const provinces = useDivisions(country, 1), municipalities = useDivisions(country, 2, province), communes = useDivisions(country, 3, municipality);
  const [name, setName] = useState(""), [neighbourhood, setNeighbourhood] = useState(""), [street, setStreet] = useState(""), [number, setNumber] = useState(""), [unit, setUnit] = useState("");
  const [latitude, setLatitude] = useState(""), [longitude, setLongitude] = useState(""), [accuracy, setAccuracy] = useState<number | null>(null);
  const [type, setType] = useState<"formal" | "informal">("informal"), [propertyType, setPropertyType] = useState<"house" | "apartment">("house"), [occupancy, setOccupancy] = useState<"owner" | "tenant">("owner");
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [gpsBusy, setGpsBusy] = useState(false), [error, setError] = useState("");
  const submitting = useRef(false);
  useEffect(() => { let current = true; canonical.countries().then(v => { if (current) setCountries(v); }).catch(e => { if (current) setError(errorText(e)); }); return () => { current = false; }; }, []);
  function gps() {
    setError(""); if (!navigator.geolocation) { setError("Localização indisponível neste dispositivo. Pode indicar as coordenadas."); return; }
    setGpsBusy(true); navigator.geolocation.getCurrentPosition(p => { setLatitude(String(p.coords.latitude)); setLongitude(String(p.coords.longitude)); setAccuracy(p.coords.accuracy); setGpsBusy(false); }, () => { setError("Não foi possível obter a localização. Autorize o acesso ou indique as coordenadas."); setGpsBusy(false); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }
  async function create(e: FormEvent) {
    e.preventDefault(); if (submitting.current) return;
    setError(""); const p = provinces.items.find(d => d.code === province), m = municipalities.items.find(d => d.code === municipality), c = communes.items.find(d => d.code === commune);
    if (!consent || !p || !m || !latitude.trim() || !longitude.trim()) { setError("Preencha a localização e confirme a declaração."); return; }
    submitting.current = true; setBusy(true);
    try { const saved = await canonical.create({ country, province: p, municipality: m, commune: c, latitude: Number(latitude), longitude: Number(longitude), name, neighbourhood, street, number, unit, propertyType, type, occupancy }); await refresh(); navigate(detailUrl(saved), { replace: true }); }
    catch(e) { setError(errorText(e)); } finally { submitting.current = false; setBusy(false); }
  }
  function division(label: string, value: string, options: Division[], change: (s: string) => void, required = true) {
    return <label>{label}<select required={required} value={value} disabled={busy || !options.length} onChange={e => change(e.target.value)}><option value="">{options.length ? "Selecionar" : "Sem opções disponíveis"}</option>{options.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}</select></label>;
  }
  return <Page title="Criar a minha AFROLOC" active="addresses"><p>O código será atribuído pelo serviço oficial. A morada começa como rascunho e fica sujeita à validação.</p>
    <form onSubmit={create} className="live-card"><label>Nome da morada<input required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Casa" /></label>
      <label>País<select value={country} disabled={busy} onChange={e => { setCountry(e.target.value); setProvince(""); setMunicipality(""); setCommune(""); }}>{countries.map(c => <option key={c.country_code} value={c.country_code}>{c.country_name}</option>)}</select></label>
      {division("Província / região", province, provinces.items, v => { setProvince(v); setMunicipality(""); setCommune(""); })}
      {division("Município", municipality, municipalities.items, v => { setMunicipality(v); setCommune(""); })}
      {division("Comuna (opcional)", commune, communes.items, setCommune, false)}
      <label>Bairro<input value={neighbourhood} maxLength={120} onChange={e => setNeighbourhood(e.target.value)} /></label>
      <label>Tipo de endereço<select value={type} onChange={e => setType(e.target.value as typeof type)}><option value="informal">Digital / sem rua formal</option><option value="formal">Formal / com rua e número</option></select></label>
      {type === "formal" && <><label>Rua<input required value={street} maxLength={120} onChange={e => setStreet(e.target.value)} /></label><label>Número<input required value={number} maxLength={30} onChange={e => setNumber(e.target.value)} /></label></>}
      <label>Imóvel<select value={propertyType} onChange={e => setPropertyType(e.target.value as typeof propertyType)}><option value="house">Casa</option><option value="apartment">Apartamento</option></select></label>
      {propertyType === "apartment" && <label>Fração / apartamento<input required value={unit} maxLength={30} onChange={e => setUnit(e.target.value)} /></label>}
      <label>Ocupação<select value={occupancy} onChange={e => setOccupancy(e.target.value as typeof occupancy)}><option value="owner">Proprietário</option><option value="tenant">Arrendatário</option></select></label>
      <button type="button" className="live-button" disabled={gpsBusy || busy} onClick={gps}>{gpsBusy ? "A obter localização…" : "Usar a minha localização atual"}</button>
      <p>Use a localização atual apenas se estiver na morada a registar.</p><div className="live-grid"><label>Latitude<input required type="number" step="any" min={-90} max={90} value={latitude} onChange={e => { setLatitude(e.target.value); setAccuracy(null); }} /></label><label>Longitude<input required type="number" step="any" min={-180} max={180} value={longitude} onChange={e => { setLongitude(e.target.value); setAccuracy(null); }} /></label></div>
      {accuracy != null && <p>Precisão indicada pelo dispositivo: {Math.round(accuracy)} m.</p>}
      <label className="live-check"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} />Confirmo que esta é a minha morada e autorizo o registo destas coordenadas na AFROLOC para verificação.</label>
      {(error || provinces.error || municipalities.error || communes.error) && <div role="alert" className="live-error">{error || provinces.error || municipalities.error || communes.error}</div>}
      <button className="live-button primary" disabled={busy || gpsBusy || !consent || !countries.length}>{busy ? "A guardar na AFROLOC…" : "Criar morada"}</button>
    </form></Page>;
}
