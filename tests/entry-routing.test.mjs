import assert from 'node:assert/strict';
import {applicationRoute} from '../src/lib/applicationRoute.ts';
assert.equal(applicationRoute('/', ''), 'original');
assert.equal(applicationRoute('/', '?utm_source=feira'), 'original');
assert.equal(applicationRoute('/feira', ''), 'fair');
assert.equal(applicationRoute('/feira/', '?witness=test'), 'fair');
assert.equal(applicationRoute('/', '?witness=test'), 'fair');
assert.equal(applicationRoute('/feirantes', ''), 'original');
console.log('PASS: original application is the default; fair and previously issued witness links stay isolated.');
