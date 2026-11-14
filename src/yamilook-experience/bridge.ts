export const YAMILOOK_ORIGIN='https://www.yamilook.com';
export const NJILA_ORIGIN='https://www.njilamaps.com';
export function request<T=any>(action:string,data:Record<string,unknown>={}):Promise<T>{
 return new Promise((resolve,reject)=>{
  if(window.parent===window){reject(new Error('Abra esta experiência na sua conta Yamilook.'));return}
  const id=crypto.randomUUID();
  const finish=()=>{clearTimeout(timer);window.removeEventListener('message',receive)};
  const receive=(event:MessageEvent)=>{
   if(event.origin!==YAMILOOK_ORIGIN||event.source!==window.parent||event.data?.type!=='yamilook-afroloc-response'||event.data.id!==id)return;
   finish();if(event.data.error)reject(new Error(event.data.error));else resolve(event.data.data);
  };
  const timer=setTimeout(()=>{finish();reject(new Error('A sessão não respondeu. Volte à Yamilook e tente novamente.'))},25000);
  window.addEventListener('message',receive);
  window.parent.postMessage({type:'yamilook-afroloc-request',id,action,data},YAMILOOK_ORIGIN);
 });
}
