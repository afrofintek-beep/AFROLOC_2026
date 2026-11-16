import {createRoot,Root} from 'react-dom/client';
import {act} from 'react';
import {OwnerMap} from '../src/yamilook-experience/OwnerMap';
import {request} from '../src/yamilook-experience/bridge';
vi.mock('../src/yamilook-experience/bridge',()=>({NJILA_ORIGIN:'https://www.njilamaps.com',request:vi.fn()}));
vi.mock('react-leaflet',()=>{
 const Wrapper=({children}:any)=><div>{children}</div>;
 return {MapContainer:({children,center}:any)=><div data-map={JSON.stringify(center)}>{children}</div>,TileLayer:()=>null,CircleMarker:({children,eventHandlers}:any)=><div><button data-marker onClick={eventHandlers?.click}>Ponto</button>{children}</div>,Tooltip:Wrapper,LayersControl:Object.assign(Wrapper,{BaseLayer:({name,children}:any)=><div>{name}{children}</div>})};
});
let root:Root,host:HTMLDivElement;
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);host=document.createElement('div');document.body.append(host);root=createRoot(host);vi.mocked(request).mockReset()});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.useRealTimers();vi.unstubAllGlobals()});
const lease=()=>({point:{lat:-8.9,lon:13.2},expiresAt:new Date(Date.now()+30000).toISOString()});
it('shows the saved address with streets and satellite without a location picker',async()=>{
 vi.mocked(request).mockResolvedValue(lease());
 await act(async()=>root.render(<OwnerMap id="address" onClose={()=>{}}/>));
 expect(request).toHaveBeenCalledWith('position',{id:'address'});
 expect(host.querySelector('[data-map]')?.getAttribute('data-map')).toBe('[-8.9,13.2]');
 expect(host.textContent).toContain('Mapa');expect(host.textContent).toContain('Satélite');
 expect(host.textContent).not.toContain('Marcar a casa');expect(host.querySelector('iframe')).toBeNull();
 act(()=>window.dispatchEvent(new Event('offline')));
 expect(host.querySelector('[data-map]')).toBeNull();
});
it('removes a position when the lease expires while renewal is pending',async()=>{
 vi.mocked(request).mockResolvedValueOnce(lease()).mockImplementation(()=>new Promise(()=>{}));
 await act(async()=>root.render(<OwnerMap id="address" onClose={()=>{}}/>));
 await act(async()=>vi.advanceTimersByTime(31000));
 expect(host.querySelector('[data-map]')).toBeNull();
});
it('rejects expired positions',async()=>{
 vi.mocked(request).mockResolvedValue({...lease(),expiresAt:new Date(Date.now()-1).toISOString()});
 await act(async()=>root.render(<OwnerMap id="address" onClose={()=>{}}/>));
 expect(host.querySelector('[data-map]')).toBeNull();
});

it('opens the existing card from the point with only the address identifier',async()=>{
 vi.mocked(request).mockResolvedValue(lease());
 await act(async()=>root.render(<OwnerMap id="saved-address" onClose={()=>{}}/>));
 await act(async()=>(host.querySelector('[data-marker]') as HTMLButtonElement).click());
 expect(request).toHaveBeenLastCalledWith('open-card',{id:'saved-address'});
});
it('opens the same card from the accessible button',async()=>{
 vi.mocked(request).mockResolvedValue(lease());
 await act(async()=>root.render(<OwnerMap id="saved-address" onClose={()=>{}}/>));
 const button=Array.from(host.querySelectorAll('button')).find(b=>b.textContent==='Ver cartão deste endereço')!;
 await act(async()=>button.click());expect(request).toHaveBeenLastCalledWith('open-card',{id:'saved-address'});
});
