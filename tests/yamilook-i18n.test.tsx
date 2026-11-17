import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {afterEach,expect,it,vi} from 'vitest';
import {loadExperienceLocale,locale,t} from '../src/yamilook-experience/i18n';
import {YamilookExperience} from '../src/yamilook-experience/Experience';
const languages=['pt','en','fr','ar','am','sw','ln','yo','sn','zu'];
const dictionaries=import.meta.glob('../src/yamilook-experience/locales/*.json',{eager:true,import:'default'}) as Record<string,Record<string,string>>;
afterEach(async()=>{await loadExperienceLocale('pt');vi.unstubAllGlobals()});
it('loads all authored messages, substitutions and directions without translating unknown data',async()=>{
 const base=dictionaries['../src/yamilook-experience/locales/pt.json'];
 for(const lang of languages){
  await loadExperienceLocale(lang);
  const copy=dictionaries[`../src/yamilook-experience/locales/${lang}.json`];
  expect(Object.keys(copy)).toEqual(Object.keys(base));expect(locale()).toBe(lang);
  for(const [source,value]of Object.entries(copy)){
   expect(value.trim()).not.toBe('');expect(t(source)).toBe(value);
   expect(value.match(/\{\{\w+\}\}/g)||[]).toEqual(source.match(/\{\{\w+\}\}/g)||[]);
  }
  expect(t('Este endereço temporário expira em {{date}} (hora de Angola).',{date:'DATE'})).toContain('DATE');
  expect(t('Casa da Ana · AO-LDA-TEST')).toBe('Casa da Ana · AO-LDA-TEST');
  expect(document.documentElement.lang).toBe(lang);expect(document.documentElement.dir).toBe(lang==='ar'?'rtl':'ltr');
 }
});
it('carries only language back to Yamilook in every translated entry',async()=>{
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 for(const lang of languages){
  await loadExperienceLocale(lang);await act(async()=>root.render(<YamilookExperience/>));
  const link=host.querySelector('a')!;
  expect(link.textContent).toBe(t('Entrar pela Yamilook'));
  const url=new URL(link.href);expect([...url.searchParams.keys()]).toEqual(['lang']);expect(url.searchParams.get('lang')).toBe(lang);
 }
 await act(async()=>root.unmount());host.remove();
});
it('normalizes Portuguese variants and safely falls back for unknown languages',async()=>{
 for(const lang of ['pt-AO','pt-banda','xx']){await loadExperienceLocale(lang);expect(locale()).toBe('pt');}
});
