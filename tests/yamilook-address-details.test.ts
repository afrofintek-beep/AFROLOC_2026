import {describe,it,expect} from 'vitest';
import {resolveDivisions} from '../src/yamilook-experience/AddressDetails';
const divisions=[{level:1,code:'AO-LDA',name:'Luanda',parent_code:null},{level:2,code:'AO-LDA-ING',name:'Ingombota',parent_code:'AO-LDA'}];
describe('administrative details',()=>{
 it('resolves only an unambiguous complete hierarchy',()=>{
  expect(resolveDivisions('AO-LDA-ING-000-DIG-G10-35Q1-N23WC',divisions)?.municipality.name).toBe('Ingombota');
  expect(resolveDivisions('AO-LDA-ING-000-DIG-G10-35Q1-N23WC',[...divisions,{...divisions[1],code:'AO-LDA-ING2'}])).toBeNull();
 });
 it('does not invent labels for legacy or unknown codes',()=>{
  expect(resolveDivisions('AO-ZU-G10-X6B64-Y48G7',divisions)).toBeNull();
  expect(resolveDivisions('AO-LDA-ING-000-DIG-G10-35Q1-N23WC',[])).toBeNull();
 });
});
