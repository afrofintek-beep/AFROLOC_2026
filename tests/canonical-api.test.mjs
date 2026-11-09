import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = (await readFile(new URL('../src/lib/supabase/canonical.ts', import.meta.url), 'utf8')).replace('import { supabase } from "./client";', 'const supabase = {} as any;');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { canonicalApi, shortCode, statusLabel } = await import('data:text/javascript;base64,' + Buffer.from(output).toString('base64'));
const province = { code: 'AO-LDA', name: 'Luanda', country_code: 'AO', level: 1, parent_code: null };
const municipality = { code: 'AO-LDA-TALATONA', name: 'Talatona', country_code: 'AO', level: 2, parent_code: province.code };
const input = { country: 'AO', province, municipality, latitude: -8.91, longitude: 13.19, name: 'My address', neighbourhood: '', street: '', number: '', unit: '', propertyType: 'house', type: 'informal', occupancy: 'owner' };
function setup(overrides = {}) {
  const calls = [];
  const client = {
    auth: { getUser: async () => overrides.noUser ? { data: { user: null } } : { data: { user: { id: 'owner' } } } },
    functions: { invoke: async (name, payload) => { calls.push({ kind: 'function', name, payload }); return overrides.encode || { data: { afroloc: 'OFFICIAL-RETURNED-CODE' }, error: null }; } },
    rpc: async (name, payload) => { calls.push({ kind: 'rpc', name, payload }); return overrides.lookup || { data: [], error: null }; },
    from(table) {
      const call = { table, filters: [], method: 'select' }; calls.push(call);
      const result = () => {
        if (overrides.dbError) return { data: null, error: new Error('database unavailable') };
        if (table === 'profiles') return { data: { approval_status: overrides.approval || 'approved' }, error: null };
        if (table === 'administrative_divisions') {
          const level = call.filters.find(([key]) => key === 'level')?.[1];
          return { data: level === 1 ? [province] : level === 2 ? [municipality] : [], error: null };
        }
        return { data: call.method === 'insert' || call.method === 'update' ? { id: 'saved', ...call.body } : (overrides.records || []), error: null };
      };
      const query = {
        select(columns) { call.columns = columns; return query; },
        eq(key, value) { call.filters.push([key, value]); return query; },
        order() { return query; },
        insert(body) { call.method = 'insert'; call.body = body; return query; },
        update(body) { call.method = 'update'; call.body = body; return query; },
        single() { return Promise.resolve(result()); },
        then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); },
      };
      return query;
    },
  };
  return { api: canonicalApi(client), calls };
}
test('lists canonical records scoped to authenticated owner and preserves actual status', async () => {
  const expected = [{ id: 'r1', status: 'rejected', ats_score: null }];
  const { api, calls } = setup({ records: expected }); assert.deepEqual(await api.list(), expected);
  assert.equal(calls[0].table, 'afroloc_records'); assert.deepEqual(calls[0].filters, [['user_id', 'owner']]);
  assert.equal(statusLabel('approved'), 'Aprovado'); assert.equal(statusLabel('rejected'), 'Recusado');
});
test('unauthenticated access fails before any database request', async () => {
  const { api, calls } = setup({ noUser: true }); await assert.rejects(api.list(), /sessão/); assert.equal(calls.length, 0);
});
test('a read failure is not an empty successful account', async () => {
  const { api } = setup({ dbError: true }); await assert.rejects(api.list(), /database unavailable/);
});
test('syntactically plausible but absent code cannot become verified', async () => {
  const { api, calls } = setup(); assert.equal(await api.lookup(' ao-lda-tal-kta-dig-g10-x123-y123 '), null);
  assert.equal(calls[0].name, 'afroloc_public_lookup'); assert.equal(calls[0].payload.p_code, 'AO-LDA-TAL-KTA-DIG-G10-X123-Y123');
});
test('public lookup propagates service error without a fake result', async () => {
  const { api } = setup({ lookup: { error: new Error('RPC unavailable') } }); await assert.rejects(api.lookup('CODE'), /RPC unavailable/);
});
test('creation saves only the centrally issued code and draft status, no invented ATS or EXIF', async () => {
  const { api, calls } = setup(); const saved = await api.create(input);
  const encode = calls.find(c => c.kind === 'function'); assert.equal(encode.name, 'qg-engine');
  assert.equal(encode.payload.body.provinceCode, 'LDA'); assert.equal(encode.payload.body.municipalityCode, 'TAL'); assert.equal(encode.payload.body.neighborhoodCode, 'DIG');
  const insert = calls.find(c => c.method === 'insert'); assert.equal(saved.code, 'OFFICIAL-RETURNED-CODE');
  assert.equal(insert.body.status, 'draft'); assert.equal(insert.body.user_id, 'owner');
  for (const field of ['ats_score', 'last_verified_at', 'approved_by_user_id', 'photo_exif_gps_lat']) assert.equal(field in insert.body, false);
});
test('codec failure or fallback code cannot write a record', async () => {
  for (const encode of [{ error: new Error('offline') }, { data: {} }, { data: { afroloc: 'AO-LDA-G10-LOCAL-LOCAL' } }]) {
    const { api, calls } = setup({ encode }); await assert.rejects(api.create(input), /código oficial/); assert.equal(calls.some(c => c.method === 'insert'), false);
  }
});
test('foreign administrative selection cannot silently create a record', async () => {
  const { api, calls } = setup(); await assert.rejects(api.create({ ...input, municipality: { ...municipality, code: 'NOT-IN-PROVINCE' } }), /administrativas/); assert.equal(calls.some(c => c.kind === 'function'), false);
});
test('pending account, invalid coordinates and missing apartment unit are refused', async () => {
  const { api } = setup({ approval: 'pending' }); await assert.rejects(api.create(input), /aprovação/);
  for (const patch of [{ latitude: NaN }, { longitude: 200 }, { latitude: 20 }, { propertyType: 'apartment', unit: '' }]) {
    const { api, calls } = setup(); await assert.rejects(api.create({ ...input, ...patch })); assert.equal(calls.some(c => c.method === 'insert'), false);
  }
});
test('rename only changes the label on an owned record', async () => {
  const { api, calls } = setup(); await api.rename('record-id', ' New name ');
  assert.deepEqual(calls[0].body, { property_name: 'New name' }); assert.deepEqual(calls[0].filters, [['id', 'record-id'], ['user_id', 'owner']]);
});
test('administrative short codes follow the canonical last-segment rule', () => {
  assert.equal(shortCode('AO-LDA-KTALATONA'), 'KTA'); assert.equal(shortCode('AO-LDA'), 'LDA');
});
