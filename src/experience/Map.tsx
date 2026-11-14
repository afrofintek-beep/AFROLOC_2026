import {useEffect,useRef,useState} from 'react';
import {MapContainer,TileLayer,Circle,CircleMarker} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {request} from './api';
const NJILA='https://www.njilamaps.com';
type Fix={lat:number;lon:number;accuracy:number;timestamp:number};
type Area={lat:number;lon:number;radiusMetres:number};
export function needsExternalBrowser(){
 const ua=navigator.userAgent,ios=/iPad|iPhone|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 return ios&&(window.self!==window.top||!/Safari\/|CriOS\/|FxiOS\/|EdgiOS\/|OPiOS\//i.test(ua)||/ChatGPT/i.test(ua));
}
/** The parent obtains GPS only on request; NJILA receives an exact lease only inside the radius. */
export function AuthorizedMap({token,onClose}:{token:string;onClose:()=>void}){
 const frame=useRef<HTMLIFrameElement>(null),pauseReason=useRef(''),[tracking,setTracking]=useState(false),[visible,setVisible]=useState(false);
 const [notice,setNotice]=useState('A verificar a autorização…'),[area,setArea]=useState<Area|null>(null),[radius,setRadius]=useState(500),[position,setPosition]=useState<Fix|null>(null);
 const blocked=needsExternalBrowser();
 useEffect(()=>{
  let active=true,epoch=0,busy=false,issuing=false,fix:Fix|null=null,visit:any=null,ready=false,validUntil=0,watch:number|undefined;
  const endVisit=()=>{epoch++;const old=visit;visit=null;ready=false;validUntil=0;setVisible(false);frame.current?.contentWindow?.postMessage({type:'afroloc-visit-ended'},NJILA);if(old)void request('locaccess_end',old).catch(()=>{});};
  const pause=(message:string)=>{pauseReason.current=message;epoch++;endVisit();fix=null;setPosition(null);setNotice(message);if(watch!==undefined)navigator.geolocation.clearWatch(watch);watch=undefined;setTracking(false)};
  const apply=(d:any)=>{
   if(d.status==='denied'){pause('A autorização expirou, foi cancelada ou deixou de estar disponível.');return}
   if(d.area)setArea(d.area);if(d.reveal_radius)setRadius(d.reveal_radius);
   if(d.status==='ready'&&tracking&&fix&&Date.now()-fix.timestamp<20000){ready=true;validUntil=d.valid_until;setVisible(true);setNotice('Está dentro da distância autorizada. A revelar o destino no mapa NJILA…')}
   else{endVisit();setNotice(d.reason==='accuracy'?'O GPS ainda não tem precisão suficiente. Aguarde num local com melhor sinal.':tracking?'O destino exacto está protegido. Aproxime-se da área indicada; a revelação é automática ao entrar no raio autorizado.':(pauseReason.current||'Veja a área aproximada e active a localização para verificar a distância.'));}
  };
  const refresh=async()=>{
   if(!active||busy||document.hidden)return;busy=true;const current=epoch;
   try{const d=await request(visit?'locaccess_position':'locaccess_check',visit?{...visit,position:fix}:{token,position:fix});if(active&&current===epoch)apply(d)}
   catch(e){if(active&&current===epoch){endVisit();setNotice((e as Error).message)}}finally{busy=false}
  };
  const receive=async(e:MessageEvent)=>{
   if(e.origin!==NJILA||e.source!==frame.current?.contentWindow)return;
   if(e.data?.type==='afroloc-visit-connected'&&visit&&ready){setNotice('Destino revelado. O acesso mantém-se enquanto estiver dentro do raio autorizado.');return}
   if(e.data?.type==='afroloc-visit-ended'){pause('A consulta terminou. Volte a verificar a proximidade para abrir o mapa.');return}
   if(e.data?.type!=='afroloc-visit-ready'||visit||issuing||!ready||!fix||Date.now()>=validUntil||!/^[a-f0-9]{64}$/.test(e.data.audienceId||''))return;
   issuing=true;const current=epoch;
   try{const d=await request('locaccess_issue',{token,audienceId:e.data.audienceId,consent:true,position:fix});
    if(!active||current!==epoch){if(d.status==='issued')void request('locaccess_end',d).catch(()=>{});return}
    if(d.status!=='issued'){apply(d);return}visit=d;frame.current?.contentWindow?.postMessage({type:'afroloc-visit',payload:d},NJILA);
   }catch(e){if(active){endVisit();setNotice((e as Error).message)}}finally{issuing=false}
  };
  void refresh();
  if(tracking&&!blocked){
   if(!navigator.geolocation)pause('Este navegador não disponibiliza localização. Abra a ligação num navegador com GPS.');
   else watch=navigator.geolocation.watchPosition(p=>{fix={lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy,timestamp:p.timestamp};setPosition(fix);void refresh()},()=>pause('Não foi possível obter a localização. Permita o GPS e volte a tentar.'),{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  }
  const check=setInterval(()=>{
   if(tracking&&fix&&Date.now()-fix.timestamp>=20000){endVisit();setNotice('A localização deixou de estar actual. O destino permanece oculto até receber um novo sinal GPS.');}
   if(ready&&Date.now()>=validUntil)endVisit();
  },1000),poll=setInterval(()=>void refresh(),5000);
  const hidden=()=>{if(document.hidden)pause('A consulta foi pausada. Active novamente a localização para continuar.')},offline=()=>pause('Sem ligação à Internet. O destino foi ocultado.');
  window.addEventListener('message',receive);window.addEventListener('offline',offline);window.addEventListener('pagehide',offline);document.addEventListener('visibilitychange',hidden);
  return()=>{active=false;epoch++;if(watch!==undefined)navigator.geolocation.clearWatch(watch);clearInterval(check);clearInterval(poll);endVisit();window.removeEventListener('message',receive);window.removeEventListener('offline',offline);window.removeEventListener('pagehide',offline);document.removeEventListener('visibilitychange',hidden)};
 },[token,tracking,blocked]);
 return <section className="xp-map" aria-label="Mapa NJILA"><div className="xp-row"><h2>Endereço AFROLOC no mapa NJILA</h2><button type="button" onClick={onClose}>Fechar mapa</button></div>
 <p role="status">{notice}</p><p className="xp-badge">Revelação a {radius} metros · GPS actual e preciso</p>
 {visible?<iframe ref={frame} title="NJILA — consulta autorizada" src={NJILA+'/?from=afroloc-app&purpose=visit&embedded=1'} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin" allow="geolocation https://www.njilamaps.com; camera https://www.njilamaps.com; accelerometer https://www.njilamaps.com; gyroscope https://www.njilamaps.com; magnetometer https://www.njilamaps.com"/>:<>
 {area&&<><div className="xp-approach"><MapContainer key={area.lat+':'+area.lon} center={[area.lat,area.lon]} zoom={15} style={{height:320,width:'100%'}}><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors'/><Circle center={[area.lat,area.lon]} radius={area.radiusMetres} pathOptions={{color:'#886126',fillOpacity:.15}}/>{position&&<CircleMarker center={[position.lat,position.lon]} radius={7} pathOptions={{color:'#2870a5',fillOpacity:1}}/>}</MapContainer></div><p className="xp-hint">O círculo representa uma área aproximada. O centro não identifica a casa nem a entrada.</p></>}
 {blocked?<><p>Para utilizar o GPS sem sair desta página, abra esta ligação directamente no Safari ou Chrome.</p><button onClick={()=>void navigator.clipboard?.writeText(location.href).then(()=>setNotice('Ligação copiada. Abra-a no Safari ou Chrome.')).catch(()=>setNotice('Copie a ligação abaixo e abra-a no Safari ou Chrome.'))}>Copiar ligação para o navegador</button><input aria-label="Ligação para abrir no navegador" readOnly value={location.href}/></>:<button type="button" className="xp-primary" disabled={tracking} onClick={()=>{pauseReason.current="";setTracking(true)}}>{tracking?'A acompanhar a proximidade…':'Activar localização e verificar proximidade'}</button>}
 </>}
 <p className="xp-hint">A localização do seu dispositivo serve para verificar a proximidade e não fica guardada como percurso. A precisão depende do GPS.</p></section>;
}
