import {useEffect,useRef,useState} from 'react';
import {request} from './api';
const NJILA='https://www.njilamaps.com';
/** NJILA runs its own renderer; the address holder stays in app.afroloc.ao. */
export function AuthorizedMap({token,onClose}:{token:string;onClose:()=>void}){
 const frame=useRef<HTMLIFrameElement>(null);const [error,setError]=useState('');
 useEffect(()=>{let active=true,busy=false,issued=false;
 const receive=async(e:MessageEvent)=>{
  if(e.origin!==NJILA||e.source!==frame.current?.contentWindow)return;
  if(e.data?.type==='afroloc-visit-ended'){setError('Este acesso terminou ou deixou de estar autorizado.');return}
  if(e.data?.type!=='afroloc-visit-ready'||issued||busy||!/^[a-f0-9]{64}$/.test(e.data.audienceId||''))return;
  busy=true;
  try{const d=await request('locaccess_issue',{token,audienceId:e.data.audienceId,consent:true});if(!active)return;if(d.status!=='issued')throw new Error('A ligação expirou, foi cancelada ou aguarda autorização.');issued=true;frame.current?.contentWindow?.postMessage({type:'afroloc-visit',payload:d},NJILA)}catch(e){if(active)setError((e as Error).message)}finally{busy=false}
 };
 window.addEventListener('message',receive);const timer=setTimeout(()=>{if(!issued&&active)setError('O mapa não respondeu. Feche e tente novamente.')},25000);
 return ()=>{active=false;clearTimeout(timer);window.removeEventListener('message',receive);frame.current?.contentWindow?.postMessage({type:'afroloc-visit-ended'},NJILA)};
 },[token]);
 return <section className="xp-map" aria-label="Mapa NJILA"><div className="xp-row"><h2>Endereço AFROLOC no mapa NJILA</h2><button type="button" onClick={onClose}>Fechar mapa</button></div>{error?<p role="alert">{error}</p>:<iframe ref={frame} title="NJILA — consulta autorizada" src={NJILA+'/?from=afroloc-app&purpose=visit&embedded=1'} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin"/>}</section>;
}
