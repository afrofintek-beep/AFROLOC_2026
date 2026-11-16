import {createRoot,Root} from 'react-dom/client';
import {act} from 'react';
import {Experience} from '../src/experience/Experience';
const divisions=[{level:1,code:'AO-LDA',name:'Luanda',parent_code:null},{level:2,code:'AO-LDA-TAL',name:'Talatona',parent_code:'AO-LDA'},{level:3,code:'AO-LDA-KTA',name:'Talatona',parent_code:'AO-LDA-TAL'}];
let root:Root,host:HTMLDivElement;
beforeEach(()=>{history.replaceState(null,'','/experiencia/');localStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.stubGlobal('fetch',vi.fn(async()=>Response.json({divisions,addresses:[],grants:[]})))});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.unstubAllGlobals()});
const click=async(label:string)=>{const button=[...host.querySelectorAll('button')].find(e=>e.textContent===label);expect(button).toBeTruthy();await act(async()=>button!.click())};
it('opens an account-free private session without navigating to central AFROLOC',async()=>{
 await act(async()=>root.render(<Experience/>));expect(host.textContent).toContain('Começar a experiência');await click('Criar o meu acesso');
 expect(host.textContent).toContain('Acesso do titular activo');expect(host.textContent).toContain('Criar o meu endereço AFROLOC');
 expect(localStorage.getItem('afroloc-experience-key')).toMatch(/^[a-f0-9]{64}$/);
 expect([...host.querySelectorAll('a')].some(a=>a.href.includes('://afroloc.ao'))).toBe(false);
 expect([...host.querySelectorAll('button[type="button"]')].some(b=>b.textContent==='Usar a minha localização')).toBe(true);
 await click('Autorizações');expect(host.textContent).toContain('A partilha ficará disponível');
 await click('Sair');expect(localStorage.getItem('afroloc-experience-key')).toBeNull();expect(host.textContent).toContain('Começar a experiência');
});
it('keeps coordinate fields and account credentials out of the participant form',async()=>{
 localStorage.setItem('afroloc-experience-key','a'.repeat(64));await act(async()=>root.render(<Experience/>));
 const labels=[...host.querySelectorAll('label')].map(l=>l.textContent).join(' ');expect(labels).not.toMatch(/Latitude|Longitude|Palavra-passe|Password|ChatGPT/);expect(host.textContent).not.toContain('Galeria');
});

it('opens a received authorization in the same tab and returns without a reload',async()=>{
 await act(async()=>root.render(<Experience/>));
 await act(async()=>{history.replaceState(null,'','/experiencia/#acesso='+'b'.repeat(64));window.dispatchEvent(new HashChangeEvent('hashchange'))});
 expect(host.textContent).toContain('Um endereço partilhado consigo.');
 expect(host.textContent).toContain('Ver endereço AFROLOC no mapa NJILA');
 expect(host.textContent).not.toContain('Criar o meu acesso');
 await act(async()=>{history.replaceState(null,'','/experiencia/');window.dispatchEvent(new HashChangeEvent('hashchange'))});
 expect(host.textContent).toContain('Criar o meu acesso');
 expect(host.textContent).not.toContain('Um endereço partilhado consigo.');
});

const field=(name:string)=>[...host.querySelectorAll('label')].find(l=>l.firstChild?.textContent===name)!.querySelector('input,select') as HTMLInputElement|HTMLSelectElement;
const fill=async(name:string,value:string)=>{const el=field(name);await act(async()=>{Object.getOwnPropertyDescriptor(el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value')!.set!.call(el,value);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}))})};
const fillAddress=async()=>{
 await fill('Nome completo','Pessoa de teste');await fill('Contacto','900000002');
 await fill('Província','AO-LDA');await fill('Município','AO-LDA-TAL');await fill('Comuna','AO-LDA-KTA');
 Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition:(done:any)=>done({coords:{latitude:-8.9,longitude:13.2}})}});
 await click('Usar a minha localização');await act(async()=>host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
};
it('shows catalogue failure beside the form and recovers without losing typed details',async()=>{
 localStorage.setItem('afroloc-experience-key','a'.repeat(64));
 vi.stubGlobal('fetch',vi.fn(async(_u,init)=>{if(JSON.parse(init.body).action==='catalog')throw new TypeError('Failed to fetch');return Response.json({addresses:[],grants:[]})}));
 await act(async()=>root.render(<Experience/>));await fill('Nome completo','Pessoa de teste');
 expect(host.textContent).toContain('Não foi possível carregar as províncias e municípios');expect(field('Província').disabled).toBe(true);
 await click('Criar endereço e pedir revisão');expect(host.textContent).toContain('Para continuar, falta:');
 expect(host.textContent).toContain('carregar a lista de províncias e municípios');
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({divisions,addresses:[],grants:[]})));
 await click('Voltar a carregar províncias e municípios');expect(field('Província').disabled).toBe(false);expect(field('Nome completo').value).toBe('Pessoa de teste');
 expect(host.textContent).not.toContain('Não foi possível carregar as províncias e municípios');
});
it('retries a failed creation with the same id and preserves the location and form',async()=>{
 localStorage.setItem('afroloc-experience-key','a'.repeat(64));const creates:any[]=[];
 vi.stubGlobal('fetch',vi.fn(async(_u,init)=>{const p=JSON.parse(init.body);if(p.action==='create'){creates.push(p);if(creates.length===1)throw new TypeError('network');return Response.json({ok:true,id:p.id})}return Response.json({divisions,addresses:[],grants:[]})}));
 await act(async()=>root.render(<Experience/>));await fillAddress();await click('Criar endereço e pedir revisão');
 expect(host.textContent).toContain('Os dados continuam nesta página');expect(field('Nome completo').value).toBe('Pessoa de teste');expect(host.textContent).toContain('✓ Localização registada.');
 await click('Criar endereço e pedir revisão');expect(creates.length).toBe(2);expect(creates[0].id).toBe(creates[1].id);expect(creates[1].details.level3_code).toBe('AO-LDA-KTA');
 expect(host.textContent).toContain('Endereço criado. O pedido foi recebido');
});
it('explains an existing record belongs to the current private key and clears details when signing out',async()=>{
 localStorage.setItem('afroloc-experience-key','a'.repeat(64));
 vi.stubGlobal('fetch',vi.fn(async(_u,init)=>JSON.parse(init.body).action==='create'?Response.json({ok:true,already_exists:true,id:'existing'}):Response.json({divisions,addresses:[],grants:[]})));
 await act(async()=>root.render(<Experience/>));await fillAddress();await click('Criar endereço e pedir revisão');
 expect(host.textContent).toContain('Este local já está associado a esta chave privada');expect(host.textContent).not.toContain('Endereço criado.');
 await click('Sair');await click('Criar o meu acesso');expect(field('Nome completo').value).toBe('');expect(field('Contacto').value).toBe('');expect(localStorage.getItem('afroloc-experience-key')).not.toBe('a'.repeat(64));
});
