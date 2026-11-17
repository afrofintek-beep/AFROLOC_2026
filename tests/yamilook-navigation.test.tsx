import {createRoot,Root} from 'react-dom/client';
import {act} from 'react';
import {YamilookExperience} from '../src/yamilook-experience/Experience';
import {request,YAMILOOK_ORIGIN} from '../src/yamilook-experience/bridge';
vi.mock('../src/yamilook-experience/bridge',()=>({NJILA_ORIGIN:'https://www.njilamaps.com',YAMILOOK_ORIGIN:'https://www.yamilook.com',request:vi.fn(async(action:string)=>action==='catalog'?{divisions:[]}:action==='list'?{canReview:true,addresses:[{id:'saved',label:'Casa',code:'AO-TEST',neighborhood:'Bairro',status:'pending',expires_at:'2099-01-01'}]}:action==='position'?{label:'Casa',code:'AO-TEST',point:{lat:-8,lon:13},expiresAt:new Date(Date.now()+30000).toISOString()}:{addresses:[]})}));
vi.mock('react-leaflet',()=>{
 const Wrapper=({children}:any)=><div>{children}</div>;
 return {MapContainer:({children,center}:any)=><div data-map={JSON.stringify(center)}>{children}</div>,TileLayer:()=>null,ZoomControl:()=>null,CircleMarker:Wrapper,Tooltip:Wrapper,LayersControl:Object.assign(Wrapper,{BaseLayer:({name,children}:any)=><div>{name}{children}</div>})};
});
let root:Root,host:HTMLDivElement,parentFrame:HTMLIFrameElement;
beforeEach(()=>{vi.clearAllMocks();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);parentFrame=document.createElement('iframe');document.body.append(parentFrame);vi.stubGlobal('parent',parentFrame.contentWindow);host=document.createElement('div');document.body.append(host);root=createRoot(host)});
afterEach(()=>{act(()=>root.unmount());host.remove();parentFrame.remove();vi.unstubAllGlobals()});
async function click(label:string){const b=Array.from(host.querySelectorAll('button')).find(b=>b.textContent===label)!;expect(b).toBeTruthy();await act(async()=>b.click())}
it('keeps saved addresses when returning from the map and isolates review',async()=>{
 await act(async()=>root.render(<YamilookExperience/>));
 expect(host.querySelector('h2')?.textContent).toBe('Casa');
 expect(host.textContent).toContain('Endereço temporário · Finalidade não indicada');
 expect(host.textContent).toContain('Este endereço temporário expira em');
 expect(host.textContent).not.toContain('Válido até');
 expect(host.textContent).toContain('Por confirmar');
 await click('Ver o meu endereço no mapa NJILA');
 expect(host.textContent).not.toContain('Consultar pedidos pendentes');
 expect(host.querySelector('[data-map]')).not.toBeNull();
 await click('Ecrã inteiro');expect(host.querySelector('.xp-owner-map')?.getAttribute('style')).toContain('fixed');
 await act(async()=>window.dispatchEvent(new MessageEvent('message',{origin:YAMILOOK_ORIGIN,source:window.parent,data:{type:'yamilook-afroloc-navigation',action:'addresses'}})));
 expect(host.querySelector('iframe')).toBeNull();expect(host.textContent).toContain('AO-TEST');
 expect(vi.mocked(request).mock.calls.some(([action])=>action==='close')).toBe(false);
 await click('Área administrativa · Revisão de endereços');expect(host.textContent).toContain('Consultar pedidos pendentes');expect(host.textContent).not.toContain('Criar endereço temporário');
});

it('links to NJILA without forwarding the private owner position',async()=>{
 await act(async()=>root.render(<YamilookExperience/>));await click('Ver o meu endereço no mapa NJILA');
 const link=Array.from(host.querySelectorAll('a')).find(a=>a.textContent?.includes('versão paga'))!;
 expect(link.href).toBe('https://www.njilamaps.com/?from=afroloc-app&lang=pt');
 expect(link.href).not.toContain('AO-TEST');expect(host.querySelector('iframe')).toBeNull();
});

it('opens a saved map from the trusted parent and keeps administration collapsed',async()=>{
 await act(async()=>root.render(<YamilookExperience/>));
 const admin=Array.from(host.querySelectorAll('summary')).find(s=>s.textContent==='Área administrativa')!.parentElement as HTMLDetailsElement;
 expect(admin.open).toBe(false);expect(host.textContent).not.toContain('Use «Ver o meu cartão AFROLOC» no topo');
 const data={type:'yamilook-afroloc-navigation',action:'map',id:'saved'};
 await act(async()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://invalid.example',source:window.parent,data})));
 expect(host.querySelector('[data-map]')).toBeNull();
 await act(async()=>window.dispatchEvent(new MessageEvent('message',{origin:YAMILOOK_ORIGIN,source:window.parent,data})));
 expect(host.querySelector('[data-map]')).not.toBeNull();expect(request).toHaveBeenCalledWith('position',{id:'saved'});
});
