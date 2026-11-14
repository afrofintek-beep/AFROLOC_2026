import {useEffect,useRef,useState} from 'react';
import {NJILA_ORIGIN,request} from './bridge';
/** An owner-only view: each position is fetched under the current Yamilook session. */
export function OwnerMap({id,onClose}:{id:string;onClose:()=>void}){
 const frame=useRef<HTMLIFrameElement>(null);const [message,setMessage]=useState('A verificar o seu endereço…');
 useEffect(()=>{
  let active=true,busy=false,audience:string|null=null;
  const clear=()=>frame.current?.contentWindow?.postMessage({type:'yamilook-owner-clear'},NJILA_ORIGIN);
  const refresh=async()=>{
   if(!active||busy||!audience||document.hidden||!navigator.onLine){clear();return}busy=true;
   try{const d=await request('position',{id});if(active&&!document.hidden){frame.current?.contentWindow?.postMessage({type:'yamilook-owner-position',audience,...d},NJILA_ORIGIN);setMessage('O seu local · endereço experimental, sem certificação de residência.')}}
   catch(e){if(active){clear();setMessage((e as Error).message)}}finally{busy=false}
  };
  const receive=(e:MessageEvent)=>{if(e.origin!==NJILA_ORIGIN||e.source!==frame.current?.contentWindow||e.data?.type!=='yamilook-owner-ready'||typeof e.data.audience!=='string'||!/^[a-f0-9-]{36}$/.test(e.data.audience))return;audience=e.data.audience;void refresh()};
  const hidden=()=>{if(document.hidden)clear();else void refresh()};
  window.addEventListener('message',receive);window.addEventListener('offline',clear);document.addEventListener('visibilitychange',hidden);
  const timer=setInterval(()=>void refresh(),10000);
  return()=>{active=false;clear();clearInterval(timer);window.removeEventListener('message',receive);window.removeEventListener('offline',clear);document.removeEventListener('visibilitychange',hidden)};
 },[id]);
 return <section className="xp-card"><button onClick={onClose}>Fechar mapa</button><p role="status">{message}</p><iframe ref={frame} title="NJILA — o meu endereço" src={NJILA_ORIGIN+'/?from=afroloc-app&purpose=owner&embedded=1'} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin" style={{width:'100%',height:550,border:0}}/></section>;
}
