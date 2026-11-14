import {createRoot,Root} from 'react-dom/client';
import {act} from 'react';
import {YamilookExperience} from '../src/yamilook-experience/Experience';
import {request} from '../src/yamilook-experience/bridge';
let root:Root,host:HTMLDivElement;
beforeEach(()=>{host=document.createElement('div');document.body.append(host);root=createRoot(host);vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true)});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.unstubAllGlobals()});
it('direct opening returns to Yamilook without credentials or event references',async()=>{
 await act(async()=>root.render(<YamilookExperience/>));
 expect(host.textContent).toContain('Entre com a sua conta Yamilook');
 expect(host.textContent).not.toMatch(/feira|natal|chave privada/i);
 expect(host.querySelector('a')?.href).toBe('https://www.yamilook.com/afroloc');
 expect(host.querySelector('input[type=password]')).toBeNull();
});
it('refuses credentialless standalone calls',async()=>{
 await expect(request('list')).rejects.toThrow('Abra esta experiência');
});
