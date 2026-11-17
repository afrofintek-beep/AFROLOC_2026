const supported=['pt','en','fr','ar','am','sw','ln','yo','sn','zu'] as const;
export type ExperienceLocale=typeof supported[number];
const loaders=import.meta.glob('./locales/*.json',{import:'default'}) as Record<string,()=>Promise<Record<string,string>>>;
let current:ExperienceLocale='pt';
let messages:Record<string,string>={};
export function locale(){return current;}
export function normalizeLocale(value:string|null):ExperienceLocale{
 const base=(value||'pt').toLowerCase().split('-')[0];
 return supported.find(code=>code===base)||'pt';
}
export async function loadExperienceLocale(value:string|null){
 const next=normalizeLocale(value);
 try{messages=await loaders[`./locales/${next}.json`]();current=next;}
 catch{messages={};current='pt';}
 document.documentElement.lang=current;
 document.documentElement.dir=current==='ar'?'rtl':'ltr';
}
/** Only fixed interface copy is translated. Names, codes and notes remain user data. */
export function t(source:string,values:Record<string,string|number>={}){
 return (messages[source]||source).replace(/\{\{(\w+)\}\}/g,(match,key)=>values[key]===undefined?match:String(values[key]));
}
