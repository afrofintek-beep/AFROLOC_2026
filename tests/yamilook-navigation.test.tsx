import {createRoot,Root} from 'react-dom/client';
import {act} from 'react';
import {YamilookExperience} from '../src/yamilook-experience/Experience';
import {request,NJILA_ORIGIN,YAMILOOK_ORIGIN} from '../src/yamilook-experience/bridge';
vi.mock('../src/yamilook-experience/bridge',()=>({NJILA_ORIGIN:'https://www.njilamaps.com',YAMILOOK_ORIGIN:'https://www.yamilook.com',request:vi.fn(async(action:string)=>action==='catalog'?{divisions:[]}:action==='list'?{canReview:true,addresses:[{id:'saved',label:'Casa',code:'AO-TEST',neighborhood:'Bairro',status:'pending',expires_at:'2099-01-01'}]}:action==='position'?{label:'Casa',code:'AO-TEST',point:{lat:-8,lon:13},expiresAt:new Date(Date.now()+30000).toISOString()}:{addresses:[]})}));
let root:Root,host:HTMLDivElement,parentFrame:HTMLIFrameElement;
beforeEach(()=>{vi.clearAllMocks();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);parentFrame=document.createElement('iframe');document.body.append(parentFrame);vi.stubGlobal('parent',parentFrame.contentWindow);host=document.createElement('div');document.body.append(host);root=createRoot(host)});
afterEach(()=>{act(()=>root.unmount());host.remove();parentFrame.remove();vi.unstubAllGlobals()});
async function click(label:string){const b=Array.from(host.querySelectorAll('button')).find(b=>b.textContent===label)!;expect(b).toBeTruthy();await act(async()=>b.click())}
it('keeps saved addresses when returning from the map and isolates review',async()=>{
 await act(async()=>root.render(<YamilookExperience/>));
 expect(host.querySelector('h2')?.textContent).toBe('Casa');
 await click('Ver o meu endereço no mapa NJILA');
 expect(host.textContent).not.toContain('Consultar pedidos pendentes');
 const frame=host.querySelector('iframe')!;
 expect(frame.getAttribute('allow')).toContain('geolocation '+NJILA_ORIGIN);
 await act(async()=>window.dispatchEvent(new MessageEvent('message',{origin:NJILA_ORIGIN,source:frame.contentWindow,data:{type:'yamilook-owner-resize',height:1800}})));
 expect(frame.style.height).toBe('1800px');
 await act(async()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://invalid.example',source:frame.contentWindow,data:{type:'yamilook-owner-resize',height:9000}})));
 expect(frame.style.height).toBe('1800px');
 await click('Ecrã inteiro');expect(frame.closest('section')?.style.position).toBe('fixed');
 await act(async()=>window.dispatchEvent(new MessageEvent('message',{origin:YAMILOOK_ORIGIN,source:window.parent,data:{type:'yamilook-afroloc-navigation',action:'addresses'}})));
 expect(host.querySelector('iframe')).toBeNull();expect(host.textContent).toContain('AO-TEST');
 expect(vi.mocked(request).mock.calls.some(([action])=>action==='close')).toBe(false);
 await click('Revisão de endereços');expect(host.textContent).toContain('Consultar pedidos pendentes');expect(host.textContent).not.toContain('Criar endereço temporário');
});
