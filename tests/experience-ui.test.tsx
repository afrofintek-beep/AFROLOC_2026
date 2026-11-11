import {createRoot,Root} from 'react-dom/client';
import {act} from 'react';
import {Experience} from '../src/experience/Experience';
let root:Root,host:HTMLDivElement;
beforeEach(()=>{localStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.stubGlobal('fetch',vi.fn(async()=>Response.json({divisions:[],addresses:[],grants:[]})))});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.unstubAllGlobals()});
const click=async(label:string)=>{const button=[...host.querySelectorAll('button')].find(e=>e.textContent===label);expect(button).toBeTruthy();await act(async()=>button!.click())};
it('opens an account-free private session without navigating to central AFROLOC',async()=>{
 await act(async()=>root.render(<Experience/>));expect(host.textContent).toContain('Começar a experiência');await click('Criar o meu acesso');
 expect(host.textContent).toContain('Acesso do titular activo');expect(host.textContent).toContain('Criar o meu endereço AFROLOC');
 expect(localStorage.getItem('afroloc-experience-key')).toMatch(/^[a-f0-9]{64}$/);
 expect([...host.querySelectorAll('a')].some(a=>a.href.includes('://afroloc.ao'))).toBe(false);
 expect(host.querySelector('button[type="button"]')?.textContent).toBe('Usar a minha localização');
 await click('Autorizações');expect(host.textContent).toContain('A partilha ficará disponível');
 await click('Sair');expect(localStorage.getItem('afroloc-experience-key')).toBeNull();expect(host.textContent).toContain('Começar a experiência');
});
it('keeps coordinate fields and account credentials out of the participant form',async()=>{
 localStorage.setItem('afroloc-experience-key','a'.repeat(64));await act(async()=>root.render(<Experience/>));
 const labels=[...host.querySelectorAll('label')].map(l=>l.textContent).join(' ');expect(labels).not.toMatch(/Latitude|Longitude|Palavra-passe|Password|ChatGPT/);expect(host.textContent).not.toContain('Galeria');
});
