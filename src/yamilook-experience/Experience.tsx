import {useEffect,useRef,useState,type FormEvent} from 'react';
import {request,YAMILOOK_ORIGIN} from './bridge';
import {OwnerMap} from './OwnerMap';
import {AddressDetails} from './AddressDetails';
type Address={id:string;label:string;code:string;neighborhood:string;status:string;expires_at:string;review_note?:string;is_own?:boolean};
type Division={level:number;code:string;name:string;parent_code:string|null};
const statuses:Record<string,string>={pending:'A aguardar revisão local da Yamilook',approved:'Revisto pela Yamilook',rejected:'Revisão local não aprovada',closed:'Encerrado'};
export function YamilookExperience(){
 const [addresses,setAddresses]=useState<Address[]>([]),[queue,setQueue]=useState<Address[]>([]),[divisions,setDivisions]=useState<Division[]>([]),[canReview,setCanReview]=useState(false);
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[map,setMap]=useState(''),[consent,setConsent]=useState(false),[point,setPoint]=useState<{latitude:number;longitude:number}|null>(null);
 const [view,setView]=useState<'addresses'|'review'>('addresses');
 useEffect(()=>{const receive=(e:MessageEvent)=>{
  if(e.origin!==YAMILOOK_ORIGIN||e.source!==window.parent||e.data?.type!=='yamilook-afroloc-navigation')return;
  if(e.data.action==='addresses'){setMap('');setView('addresses')}
  if(e.data.action==='map'&&typeof e.data.id==='string'&&/^[a-zA-Z0-9-]{1,64}$/.test(e.data.id)){setMap(e.data.id);setView('addresses')}
 };window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive)},[]);
 const [form,setForm]=useState({label:'Casa',province:'',municipality:'',commune:'',neighborhood:''});
 const attempt=useRef<{id:string;payload:string}|null>(null),alive=useRef(true);
 const load=async()=>{const d=await request('list');if(alive.current){setAddresses(d.addresses);setCanReview(d.canReview)}};
 const run=async(fn:()=>Promise<void>)=>{if(busy)return;setBusy(true);setMessage('');try{await fn()}catch(e){setMessage((e as Error).message)}finally{if(alive.current)setBusy(false)}};
 useEffect(()=>{alive.current=true;void run(async()=>{const d=await request('catalog');if(alive.current)setDivisions(d.divisions);await load()});return()=>{alive.current=false}},[]);
 const change=(field:string,value:string)=>setForm(f=>({...f,[field]:value,...(field==='province'?{municipality:'',commune:''}:field==='municipality'?{commune:''}:{})}));
 const communeOptions=divisions.filter(d=>d.level===3&&d.parent_code===form.municipality);
 const create=(e:FormEvent)=>{e.preventDefault();void run(async()=>{
  if(!point||!consent)throw new Error('Registe a localização e confirme a autorização.');
  const data={...form,...point,consent};const payload=JSON.stringify(data);if(attempt.current?.payload!==payload)attempt.current={id:crypto.randomUUID(),payload};
  await request('create',{...data,id:attempt.current.id});attempt.current=null;setPoint(null);setConsent(false);await load();setMessage('Endereço guardado na sua conta. A revisão não constitui certificação de residência.');
 })};
 if(window.parent===window)return <main className="xp"><section className="xp-card"><h1>O meu endereço AFROLOC</h1><p>Entre com a sua conta Yamilook para criar e recuperar os seus endereços.</p><a href={YAMILOOK_ORIGIN+'/afroloc'}>Entrar pela Yamilook</a></section></main>;
 return <div className="xp xp-address-manager"><header className="xp-header"><strong>AFROLOC</strong><span>Gestão de endereços</span></header><main>
 <div className="xp-address-tools"><h1>{view==='review'?'Revisão de endereços':'Os meus endereços'}</h1><button disabled={busy} onClick={()=>void run(load)}>Actualizar a lista</button></div>
 {message&&<p role="status">{message}</p>}
 {view==='review'&&<button onClick={()=>{setMap('');setView('addresses')}}>Voltar aos meus endereços</button>}
 {map?<OwnerMap id={map} onClose={()=>setMap('')}/>:view==='addresses'&&addresses.map(a=><article className="xp-card" key={a.id}><p className="xp-badge">Endereço temporário · Finalidade não indicada</p><h2>{a.label}</h2><p className="xp-code">{a.code}</p><AddressDetails code={a.code} neighborhood={a.neighborhood} divisions={divisions}/><p>Revisão local: {statuses[a.status]||'Estado não confirmado'}</p><p>{Number.isFinite(Date.parse(a.expires_at))?`${Date.parse(a.expires_at)<=Date.now()?'Este endereço temporário expirou em':'Este endereço temporário expira em'} ${new Date(a.expires_at).toLocaleString('pt-PT',{timeZone:'Africa/Luanda'})} (hora de Angola).`:'Validade do endereço temporário não confirmada.'}</p><p>Este prazo refere-se ao endereço temporário. As autorizações de acesso têm prazos próprios.</p>{a.review_note&&<p>Nota da revisão local: {a.review_note}</p>}{a.status!=='closed'&&Date.parse(a.expires_at)>Date.now()&&<><button onClick={()=>setMap(a.id)}>Ver o meu endereço no mapa NJILA</button><details><summary>Gerir endereço</summary><button disabled={busy} onClick={()=>void run(async()=>{await request('close',{id:a.id});await load()})}>Encerrar endereço</button></details></>}<p>A criação e a revisão local não certificam residência.</p></article>)}
 {!map&&view==='addresses'&&<details className="xp-card"><summary>Adicionar endereço temporário</summary><form onSubmit={create}><label>Nome do local<input required maxLength={120} value={form.label} onChange={e=>change('label',e.target.value)}/></label>
 {([['province','Província',1,null],['municipality','Município',2,form.province],['commune','Comuna',3,form.municipality]] as const).map(([key,label,level,parent])=><label key={key}>{label}<select required={key!=='commune'||communeOptions.length>0} disabled={!divisions.length||(level>1&&!parent)||(key==='commune'&&!communeOptions.length)} value={form[key]} onChange={e=>change(key,e.target.value)}><option value="">{key==='commune'&&form.municipality&&!communeOptions.length?'Sem comunas':'Seleccione'}</option>{divisions.filter(d=>d.level===level&&(level===1||d.parent_code===parent)).map(d=><option key={d.code} value={d.code}>{d.name}</option>)}</select></label>)}
 <label>Bairro / zona<input required maxLength={120} value={form.neighborhood} onChange={e=>change('neighborhood',e.target.value)}/></label><button type="button" disabled={busy} onClick={()=>{if(!navigator.geolocation){setMessage('Localização indisponível.');return}setBusy(true);navigator.geolocation.getCurrentPosition(p=>{setPoint({latitude:p.coords.latitude,longitude:p.coords.longitude});setBusy(false)},()=>{setMessage('Permita a localização e tente novamente.');setBusy(false)},{enableHighAccuracy:true,maximumAge:0,timeout:20000})}}>{point?'Actualizar localização':'Usar a minha localização'}</button><p>{point?'Localização registada.':'Faça o registo quando estiver no local.'}</p><label className="xp-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Autorizo guardar este endereço temporário na minha conta e a revisão pelos responsáveis autorizados da Yamilook.</label><button disabled={busy||!point||!consent}>Criar endereço</button></form><p>Até três endereços activos, com validade de 30 dias. Não substituem a certificação oficial de residência.</p></details>}
 {!map&&view==='addresses'&&<details className="xp-card"><summary>Sobre estes endereços</summary><p>Um endereço temporário não altera a sua residência principal. A criação e a revisão local não certificam residência.</p></details>}
 {!map&&view==='addresses'&&canReview&&<details className="xp-card"><summary>Área administrativa</summary><p>Acesso reservado à revisão de pedidos.</p><button onClick={()=>setView('review')}>Área administrativa · Revisão de endereços</button></details>}
 {!map&&view==='review'&&canReview&&<section className="xp-card"><h2>Revisão de endereços</h2><button disabled={busy} onClick={()=>void run(async()=>setQueue((await request('queue')).addresses))}>Consultar pedidos pendentes</button>{queue.map(a=><Review key={a.id} address={a} busy={busy} onReview={(decision,note)=>void run(async()=>{await request('review',{id:a.id,decision,note,confirmed:true});setQueue((await request('queue')).addresses);await load()})}/>)}</section>}
 </main><footer>AFROLOC · Yamilook · NJILA</footer></div>;
}
function Review({address:a,busy,onReview}:{address:Address;busy:boolean;onReview:(decision:string,note:string)=>void}){
 const [note,setNote]=useState(''),[confirmed,setConfirmed]=useState(false);
 return <article><h3>{a.label}</h3><p>{a.code} · {a.neighborhood}</p>{a.is_own?<p>Outro responsável terá de rever o seu pedido.</p>:<><label>Fundamentação<textarea minLength={3} maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></label><label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Confirmei a ligação do titular ao local. Esta revisão não emite um certificado de residência.</label>{[['approved','Aprovar revisão'],['rejected','Rejeitar']].map(([decision,label])=><button key={decision} disabled={busy||!confirmed||note.trim().length<3} onClick={()=>onReview(decision,note)}>{label}</button>)}</>}</article>;
}
