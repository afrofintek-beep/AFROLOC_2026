import {t,locale} from './i18n';
import {useEffect,useState} from 'react';
import {MapContainer,TileLayer,LayersControl,CircleMarker,Tooltip,ZoomControl} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {NJILA_ORIGIN,request} from './bridge';
type Position={point:{lat:number;lon:number};expiresAt:string;label?:string;code?:string};
/** Owner-only coordinates remain in memory for the server-issued lease. */
export function OwnerMap({id,onClose}:{id:string;onClose:()=>void}){
 const [expanded,setExpanded]=useState(false),[position,setPosition]=useState<Position|null>(null);
 const [opening,setOpening]=useState(false);
 const [message,setMessage]=useState('A verificar o seu endereço…');
 useEffect(()=>{
  let active=true,busy=false,epoch=0,expiry:ReturnType<typeof setTimeout>|undefined;
  const clear=()=>{epoch++;if(expiry)clearTimeout(expiry);setPosition(null)};
  const refresh=async()=>{
   if(!active||busy||document.hidden||!navigator.onLine)return;
   busy=true;const current=epoch;
   try{
    const d=await request<Position>('position',{id}),until=Date.parse(d.expiresAt);
    if(!active||current!==epoch||document.hidden||!navigator.onLine)return;
    if(!d.point||!Number.isFinite(d.point.lat)||!Number.isFinite(d.point.lon)||Math.abs(d.point.lat)>90||Math.abs(d.point.lon)>180||!Number.isFinite(until)||until<=Date.now()||until>Date.now()+35000)throw new Error('A autorização do mapa expirou. Volte aos endereços e tente novamente.');
    if(expiry)clearTimeout(expiry);setPosition(d);setMessage('Localização do endereço guardado.');
    expiry=setTimeout(()=>{clear();setMessage('A autorização do mapa expirou. A verificar novamente…');void refresh()},until-Date.now());
   }catch(e){if(active&&current===epoch){clear();setMessage((e as Error).message)}}finally{busy=false}
  };
  const hidden=()=>{clear();if(!document.hidden)void refresh()};
  const offline=()=>{clear();setMessage('Sem ligação à Internet. O mapa foi ocultado.')};
  const pagehide=()=>clear();
  window.addEventListener('offline',offline);window.addEventListener('online',refresh);window.addEventListener('pagehide',pagehide);document.addEventListener('visibilitychange',hidden);
  void refresh();const timer=setInterval(()=>void refresh(),10000);
  return()=>{active=false;epoch++;if(expiry)clearTimeout(expiry);clearInterval(timer);window.removeEventListener('offline',offline);window.removeEventListener('online',refresh);window.removeEventListener('pagehide',pagehide);document.removeEventListener('visibilitychange',hidden)};
 },[id]);
 const openCard=async()=>{
  if(opening||!position||Date.parse(position.expiresAt)<=Date.now()||document.hidden||!navigator.onLine)return;
  setOpening(true);
  try{await request('open-card',{id})}catch(e){setMessage((e as Error).message)}finally{setOpening(false)}
 };
 return <section className="xp-card xp-owner-map" style={expanded?{position:'fixed',inset:0,zIndex:1000,margin:0,padding:12,overflowY:'auto',background:'#f5f1e7'}:{}}>
  <nav style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}><button onClick={onClose}>{t("Voltar aos endereços")}</button><button aria-pressed={expanded} onClick={()=>setExpanded(!expanded)}>{t(expanded?'Reduzir mapa':'Ecrã inteiro')}</button></nav>
  <h2>{t("Localização AFROLOC")}</h2>
  <p>{t("Consulta gratuita da localização. Percursos, radar e realidade aumentada estão disponíveis na versão paga da NJILA.")}</p>
  <p role="status">{t(message)}</p>
  {position&&<div style={{borderRadius:14,overflow:'hidden',isolation:'isolate',border:'1px solid #777'}}>
   <MapContainer key={`${id}:${expanded}:${position.point.lat}:${position.point.lon}`} center={[position.point.lat,position.point.lon]} zoom={18} zoomControl={false} maxZoom={19} scrollWheelZoom={false} style={{height:expanded?'65dvh':360,width:'100%'}} aria-label={t("Localização do endereço AFROLOC")}>
    <ZoomControl zoomInTitle={t('Aproximar')} zoomOutTitle={t('Afastar')}/><LayersControl position="topright" collapsed={false}>
     <LayersControl.BaseLayer checked name={t('Mapa')}><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'/></LayersControl.BaseLayer>
     <LayersControl.BaseLayer name={t('Satélite')}><TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={19} attribution="Tiles &copy; Esri — Esri, Maxar, Earthstar Geographics, GIS User Community"/></LayersControl.BaseLayer>
    </LayersControl>
    <CircleMarker center={[position.point.lat,position.point.lon]} radius={12} eventHandlers={{click:()=>void openCard()}} pathOptions={{color:'#fff',weight:3,fillColor:'#d2aa2e',fillOpacity:1}}><Tooltip interactive><button type="button" disabled={opening} onClick={()=>void openCard()}>{t("Ver cartão AFROLOC")}</button></Tooltip></CircleMarker>
   </MapContainer>
  </div>}
  {position&&<button type="button" disabled={opening} onClick={()=>void openCard()}>{t(opening?'A abrir o cartão…':'Ver cartão deste endereço')}</button>}
  {position&&<details><summary>{t("Detalhes do endereço")}</summary><p style={{overflowWrap:'anywhere'}}>{[position.label,position.code].filter(Boolean).join(' · ')}</p></details>}
  <p><a href={NJILA_ORIGIN+'/?from=afroloc-app&lang='+locale()} target="_blank" rel="noopener noreferrer">{t("Abrir a versão paga da NJILA")}</a></p>
 </section>;
}
