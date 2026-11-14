import {useEffect,useRef,useState} from 'react';
import {NJILA_ORIGIN,request} from './bridge';
/** An owner-only view: each position is fetched under the current Yamilook session. */
export function OwnerMap({id,onClose}:{id:string;onClose:()=>void}){
 const [expanded,setExpanded]=useState(false),[height,setHeight]=useState(950),[destination,setDestination]=useState('');
 const frame=useRef<HTMLIFrameElement>(null);const [message,setMessage]=useState('A verificar o seu endereço…');
 useEffect(()=>{
  let active=true,busy=false,audience:string|null=null;
  const clear=()=>frame.current?.contentWindow?.postMessage({type:'yamilook-owner-clear'},NJILA_ORIGIN);
  const refresh=async()=>{
   if(!active||busy||!audience)return;if(document.hidden||!navigator.onLine){clear();return}busy=true;
   try{const d=await request('position',{id});if(active&&!document.hidden){frame.current?.contentWindow?.postMessage({type:'yamilook-owner-position',audience,...d},NJILA_ORIGIN);setDestination([d.label,d.code].filter(Boolean).join(' · '));setMessage('O seu local · endereço experimental, sem certificação de residência.')}}
   catch(e){if(active){clear();setMessage((e as Error).message)}}finally{busy=false}
  };
  const receive=(e:MessageEvent)=>{if(e.origin===NJILA_ORIGIN&&e.source===frame.current?.contentWindow&&e.data?.type==='yamilook-owner-resize'&&Number.isFinite(e.data.height)){setHeight(Math.max(400,Math.min(12000,e.data.height)));return}if(e.origin!==NJILA_ORIGIN||e.source!==frame.current?.contentWindow||e.data?.type!=='yamilook-owner-ready'||typeof e.data.audience!=='string'||!/^[a-f0-9-]{36}$/.test(e.data.audience))return;audience=e.data.audience;void refresh()};
  const hidden=()=>{if(document.hidden)clear();else void refresh()};
  window.addEventListener('message',receive);window.addEventListener('offline',clear);document.addEventListener('visibilitychange',hidden);
  const timer=setInterval(()=>void refresh(),10000);
  return()=>{active=false;clear();clearInterval(timer);window.removeEventListener('message',receive);window.removeEventListener('offline',clear);document.removeEventListener('visibilitychange',hidden)};
 },[id]);
 return <section className="xp-card" style={expanded?{position:"fixed",inset:0,zIndex:1000,margin:0,padding:12,display:"flex",flexDirection:"column",background:"#f5f1e7"}:{}}><nav style={{position:"sticky",top:0,zIndex:10,background:"#f5f1e7",padding:8,display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={onClose}>Voltar aos endereços</button><button aria-pressed={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?"Reduzir mapa":"Ecrã inteiro"}</button></nav><h2 style={{fontSize:20,overflowWrap:"anywhere"}}>{destination}</h2><p role="status">{message}</p><iframe ref={frame} title="NJILA — o meu endereço" src={NJILA_ORIGIN+'/?from=afroloc-app&purpose=owner&embedded=1'} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin" allow={`geolocation ${NJILA_ORIGIN}; camera ${NJILA_ORIGIN}; accelerometer ${NJILA_ORIGIN}; gyroscope ${NJILA_ORIGIN}`} style={{width:"100%",height:expanded?undefined:height,flex:expanded?1:undefined,minHeight:expanded?0:400,border:0}}/></section>;
}
