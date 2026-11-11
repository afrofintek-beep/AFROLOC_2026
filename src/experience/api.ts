export const API='https://natal.yamilook.com/api/experiencia-app';
export async function request<T=any>(action:string,data:Record<string,unknown>={},key?:string):Promise<T>{
 const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',...(key?{'x-registration-key':key}:{})},body:JSON.stringify({...data,action}),cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(20000)});
 const d=await r.json();if(!r.ok||d.error)throw new Error(d.error||'Não foi possível concluir o pedido.');return d;
}
export const randomKey=()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('');
export const validKey=(v:string)=>/^[a-f0-9]{64}$/.test(v);
export function savedKey(){try{return localStorage.getItem('afroloc-experience-key')||''}catch{return ''}}
export function storeKey(key:string){try{localStorage.setItem('afroloc-experience-key',key);return true}catch{return false}}
export const date=(v:string)=>new Date(v).toLocaleString('pt-PT',{timeZone:'Africa/Luanda',dateStyle:'medium',timeStyle:'short'});
