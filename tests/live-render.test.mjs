import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
const require = createRequire(import.meta.url);
const built = await build({
  stdin: { contents: 'export * from "./src/screens/live/LiveScreens.tsx";', resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', loader: { '.css': 'empty' },
  plugins: [{ name: 'isolated-ui-fixtures', setup(b) {
    b.onResolve({ filter: /\.css$/ }, () => ({ path: 'css', namespace: 'fixtures' }));
    b.onResolve({ filter: /state\/(auth|records)$/ }, a => ({ path: a.path.endsWith('auth') ? 'auth' : 'records', namespace: 'fixtures' }));
    b.onResolve({ filter: /lib\/supabase\/(canonical|client)$/ }, a => ({ path: a.path.endsWith('canonical') ? 'canonical' : 'client', namespace: 'fixtures' }));
    b.onResolve({ filter: /^react-leaflet$/ }, () => ({ path: 'map', namespace: 'fixtures' }));
    b.onLoad({ filter: /.*/, namespace: 'fixtures' }, a => ({ loader: 'js', contents: ({
      auth: 'export function useAuth(){return {profile:null,user:null}}',
      records: 'export function useRecords(){return globalThis.__recordFixture}',
      client: 'export const supabase={}',
      canonical: 'export const canonical={};export const placeLabel=a=>a.level2_name||"";export const statusLabel=s=>({draft:"Rascunho",rejected:"Recusado"}[s]||s);export const errorText=e=>e.message;',
      map: 'export const MapContainer=()=>null,TileLayer=()=>null,CircleMarker=()=>null,Popup=()=>null;',
      css: '',
    })[a.path] }));
  } }],
});
const m = { exports: {} }; new Function('require', 'module', 'exports', built.outputFiles[0].text)(require, m, m.exports);
const screens = m.exports;
function render(name, fixture) { globalThis.__recordFixture = { records: [], loading: false, error: '', refresh: async()=>{}, ...fixture }; return renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(screens[name]))); }
test('empty account has no seeded identity, ATS or verified address', () => {
  const html = render('LiveHomeScreen'); assert.match(html, /Ainda não tem moradas/); assert.doesNotMatch(html, /Ana Cardoso|86|AO-LUA-BEL|Verificado há/);
});
test('read error is visibly different from an empty account', () => {
  const html = render('LiveHomeScreen', { error: 'Ligação interrompida' }); assert.match(html, /role="alert"/); assert.match(html, /Ligação interrompida/); assert.doesNotMatch(html, /Ainda não tem moradas/);
});
test('loading address list does not declare zero records', () => {
  const html = render('LiveAddressesScreen', { loading: true }); assert.match(html, /A consultar/); assert.doesNotMatch(html, /0 morada/);
});
test('actual rejected state and absent ATS remain truthful', () => {
  const html = render('LiveAddressesScreen', { records: [{id:'test-only',code:'TEST-ONLY',status:'rejected',ats_score:null,property_name:'Test fixture',level2_name:'Fixture'}] }); assert.match(html, /Recusado/); assert.doesNotMatch(html, /ACTIVO|Confiança \(ATS\)|86/);
});
test('service catalogue separates local services, origin links and pending modules', () => {
  const html = render('ServicesScreen'); assert.match(html, /href="\/feira\/"/); assert.match(html, /Integração pendente nesta versão/); assert.match(html, /https:\/\/afroloc.ao\/validate-address/);
});
