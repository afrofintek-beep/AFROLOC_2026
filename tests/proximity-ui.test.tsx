import {createRoot,Root} from 'react-dom/client';
import {act} from 'react';
import {AuthorizedMap} from '../src/experience/Map';
vi.mock('react-leaflet',()=>({MapContainer:({children}:any)=><div>{children}</div>,TileLayer:()=>null,Circle:()=>null,CircleMarker:()=>null}));
let root:Root,host:HTMLDivElement,fix:(p:any)=>void,error:()=>void,calls:any[];
const position=(lat=-8.9)=>({coords:{latitude:lat,longitude:13.2,accuracy:5},timestamp:Date.now()});
beforeEach(()=>{
 vi.useFakeTimers();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);host=document.createElement('div');document.body.append(host);root=createRoot(host);calls=[];
 Object.defineProperty(navigator,'geolocation',{configurable:true,value:{watchPosition:(done:any,fail:any)=>{fix=done;error=fail;return 42},clearWatch:vi.fn()}});
 vi.stubGlobal('fetch',vi.fn(async(_u,init)=>{const p=JSON.parse(init.body);calls.push(p);const ready=p.position?.lat===-8.9&&Date.now()-p.position.timestamp<20000;
 if(p.action==='locaccess_issue')return Response.json({status:'issued',reference:'NATAL-test',grant:{token:'natal_'+'b'.repeat(64),audienceId:p.audienceId},purpose:'visit',requestedPrecision:'exact',expiresAt:new Date(Date.now()+900000).toISOString()});
 return Response.json({status:ready?'ready':'approaching',reason:ready?'inside':'outside',area:{lat:-8.898,lon:13.201,radiusMetres:75},reveal_radius:100,valid_until:Date.now()+20000});
 }));
});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.useRealTimers();vi.unstubAllGlobals()});
const tick=async(ms:number)=>{await act(async()=>{vi.advanceTimersByTime(ms)})};
const start=async()=>{await act(async()=>root.render(<AuthorizedMap token={'a'.repeat(64)} onClose={()=>{}}/>));await act(async()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Activar localização e verificar proximidade')!.click())};
it('does not open the exact map before fresh proximity confirmation, then removes it when outside',async()=>{
 await start();expect(host.querySelector('iframe')).toBeNull();
 await act(async()=>fix(position(-8.91)));await tick(5000);expect(host.querySelector('iframe')).toBeNull();
 await act(async()=>fix(position()));await tick(5000);expect(host.querySelector('iframe')).not.toBeNull();
 const frame=host.querySelector('iframe')!;
 await act(async()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://evil.example',source:frame.contentWindow,data:{type:'afroloc-visit-ready',audienceId:'c'.repeat(64)}})));
 expect(calls.some(p=>p.action==='locaccess_issue')).toBe(false);
 await act(async()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://www.njilamaps.com',source:frame.contentWindow,data:{type:'afroloc-visit-ready',audienceId:'c'.repeat(64)}})));
 expect(calls.some(p=>p.action==='locaccess_issue'&&p.position.lat===-8.9)).toBe(true);
 await act(async()=>fix(position(-8.91)));await tick(5000);expect(host.querySelector('iframe')).toBeNull();expect(calls.some(p=>p.action==='locaccess_end')).toBe(true);
});
it('clears the map on GPS errors, stale positions and loss of network',async()=>{
 await start();await act(async()=>fix(position()));await tick(5000);expect(host.querySelector('iframe')).not.toBeNull();
 await tick(21000);expect(host.querySelector('iframe')).toBeNull();
 await act(async()=>fix(position()));await tick(5000);expect(host.querySelector('iframe')).not.toBeNull();
 await act(async()=>window.dispatchEvent(new Event('offline')));expect(host.querySelector('iframe')).toBeNull();expect(host.textContent).toContain('Sem ligação à Internet');
});
it('keeps permission denial on the same page with a retry action',async()=>{
 await start();await act(async()=>error());expect(host.querySelector('iframe')).toBeNull();expect(host.textContent).toContain('Permita o GPS e volte a tentar');
 expect([...host.querySelectorAll('button')].find(b=>b.textContent==='Activar localização e verificar proximidade')?.disabled).toBe(false);
});
