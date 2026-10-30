import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import Iyzipay from 'iyzipay';
import iyzicoModule from '../lib/iyzico.ts';
const { createCheckoutFormRequest } = iyzicoModule;

const API_KEY = 'fixture-key';
const SECRET = 'fixture-secret';
const PORT = Number(process.env.LUMIERE_SDK_FIXTURE_PORT || 0);
const TOKEN = 'fixture-token-0001';
const summary = { sdk: {}, baseline: 'not-provided', deps: {}, errors: [] };

const addr = (n) => ({ contactName: 'Fixture ' + n, city: 'Istanbul', country: 'Turkey', address: 'Fixture Street ' + n });
const params = {
  conversationId: 'fixture-conv-0001',
  price: '150.0',
  paidPrice: '150.0',
  basketItems: [
    { id: 'fixture-prod-1', name: 'Fixture Ring', category1: 'fixture-category', itemType: 'VIRTUAL', price: '100.0' },
    { id: 'fixture-prod-2', name: 'Fixture Chain', category1: 'fixture-category', itemType: 'VIRTUAL', price: '50.0' },
  ],
  buyer: {
    id: 'fixture-buyer-1', name: 'Test', surname: 'Buyer', email: 'buyer@example.invalid',
    identityNumber: '11111111111', registrationAddress: 'Fixture Street 1', ip: '127.0.0.1', city: 'Istanbul', country: 'Turkey',
  },
  shippingAddress: addr('Ship'),
  billingAddress: addr('Bill'),
  callbackUrl: 'http://127.0.0.1/fixture/callback',
};

function verifyAuth(rec, header, errors, label) {
  const prefix = 'IYZWSv2 ';
  if (typeof header !== 'string' || !header.startsWith(prefix)) { errors.push(label + ': missing IYZWSv2 header'); return false; }
  const decoded = Buffer.from(header.slice(prefix.length), 'base64').toString('utf8');
  const fields = {};
  for (const part of decoded.split('&')) {
    const i = part.indexOf(':');
    if (i > 0) fields[part.slice(0, i)] = part.slice(i + 1);
  }
  const expected = crypto.createHmac('sha256', SECRET).update(String(rec.rnd) + rec.path + rec.raw).digest('hex');
  let ok = true;
  if (fields.apiKey !== API_KEY) { ok = false; errors.push(label + ': apiKey mismatch'); }
  if (!rec.rnd || fields.randomKey !== rec.rnd) { ok = false; errors.push(label + ': randomKey mismatch'); }
  const a = Buffer.from(String(fields.signature || ''), 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) { ok = false; errors.push(label + ': signature mismatch for ' + rec.path); }
  return ok;
}

function reply(rec) {
  if (rec.path.includes('initialize')) {
    return { status: 'success', locale: 'tr', conversationId: rec.body?.conversationId, token: TOKEN, tokenExpireTime: 1800, checkoutFormContent: '<div id=fixture></div>', paymentPageUrl: 'http://127.0.0.1/fixture/page' };
  }
  return { status: 'success', locale: 'tr', conversationId: rec.body?.conversationId, token: rec.body?.token, paymentStatus: 'SUCCESS', paymentId: 'fixture-payment-1', price: 150, paidPrice: 150, currency: 'TRY', basketId: 'fixture-basket-1' };
}

async function startServer(label) {
  const records = [];
  const errors = [];
  const sockets = new Set();
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('error', (e) => errors.push(label + ': request error ' + e.message));
    req.on('end', () => {
      let out;
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        const raw = Buffer.concat(chunks).toString('utf8');
        const rec = { method: req.method, path: url.pathname, search: url.search, raw, rnd: req.headers['x-iyzi-rnd'], client: req.headers['x-iyzi-client-version'], body: null, hmacOk: false };
        rec.body = raw ? JSON.parse(raw) : null;
        rec.hmacOk = verifyAuth(rec, req.headers.authorization, errors, label);
        records.push(rec);
        out = reply(rec);
      } catch (e) {
        errors.push(label + ': handler error ' + (e && e.message));
        out = { status: 'failure', errorMessage: 'fixture handler error' };
      }
      try {
        const s = JSON.stringify(out);
        res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(s) });
        res.end(s);
      } catch (e) {
        errors.push(label + ': response error ' + (e && e.message));
      }
    });
  });
  server.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', () => { server.off('error', reject); resolve(); });
  });
  const { port } = server.address();
  return {
    uri: 'http://127.0.0.1:' + port,
    records,
    errors,
    async close() {
      for (const s of sockets) s.destroy();
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((r) => server.close(() => r()));
    },
  };
}

function callSdk(fn, label, ms = 5000) {
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; reject(new Error(label + ' timed out')); } }, ms);
    try {
      fn((err, result) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (err) reject(err); else resolve(result);
      });
    } catch (e) {
      if (!done) { done = true; clearTimeout(timer); reject(e); }
    }
  });
}

async function runSequence(Ctor, label) {
  const server = await startServer(label);
  try {
    assert.ok(server.uri.startsWith('http://127.0.0.1:'));
    const sdk = new Ctor({ apiKey: API_KEY, secretKey: SECRET, uri: server.uri });
    const request = createCheckoutFormRequest(params);
    const init = await callSdk((cb) => sdk.checkoutFormInitialize.create(request, cb), label + ' init');
    const retrieve = await callSdk((cb) => sdk.checkoutForm.retrieve({ locale: 'tr', conversationId: params.conversationId, token: init && init.token }, cb), label + ' retrieve');
    return { init, retrieve, records: [...server.records], errors: [...server.errors] };
  } finally {
    await server.close();
  }
}

function findPkg(resolved, name) {
  let dir = path.dirname(resolved);
  for (let i = 0; i < 8; i++) {
    const p = path.join(dir, 'package.json');
    if (fs.existsSync(p)) {
      const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (pkg.name === name) return pkg;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function gte(v, min) {
  const a = String(v).split('.').map((x) => parseInt(x, 10) || 0);
  const b = min.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] > b[i]; }
  return true;
}

const clip = (v) => JSON.parse(JSON.stringify(v, (k, x) => (typeof x === 'string' && x.length > 200 ? x.slice(0, 200) : x)));

test.after(async () => {
  const target = process.env.LUMIERE_TEST_PROOF_PATH;
  if (!target) return;
  const s = JSON.stringify(clip(summary), null, 2);
  await writeFile(target, s.length > 20000 ? s.slice(0, 20000) : s, 'utf8');
});

test('createCheckoutFormRequest is a pure mapping', () => {
  const r = createCheckoutFormRequest(params);
  assert.equal(r.currency, 'TRY');
  assert.equal(r.locale, 'tr');
  assert.equal(r.paymentGroup, Iyzipay.PAYMENT_GROUP.PRODUCT);
  assert.equal(r.paymentGroup, 'PRODUCT');
  assert.ok(r.basketItems.every((b) => b.itemType === Iyzipay.BASKET_ITEM_TYPE.PHYSICAL && b.itemType === 'PHYSICAL'));
  assert.deepEqual(r.basketItems.map((b) => b.id), ['fixture-prod-1', 'fixture-prod-2']);
  assert.deepEqual(r.shippingAddress, params.shippingAddress);
  assert.deepEqual(r.billingAddress, params.billingAddress);
  assert.equal(r.callbackUrl, params.callbackUrl);
  assert.equal(r.conversationId, params.conversationId);
  assert.equal(r.buyer.email, 'buyer@example.invalid');
  assert.equal(params.basketItems[0].itemType, 'VIRTUAL', 'input must not be mutated');
});

test('actual SDK form init -> retrieve against owned loopback with verified HMAC', async () => {
  const run = await runSequence(Iyzipay, 'current');
  const errors = [...run.errors];
  summary.sdk = { client: run.records[0]?.client, requests: run.records.map((r) => ({ method: r.method, path: r.path, hmacOk: r.hmacOk })) };
  summary.errors.push(...errors);
  assert.deepEqual(errors, []);
  assert.equal(run.records.length, 2);
  const [init, retr] = run.records;
  for (const r of run.records) {
    assert.equal(r.method, 'POST');
    assert.equal(r.hmacOk, true);
    assert.equal(r.search, '');
  }
  assert.ok(init.path.includes('checkoutform') && init.path.includes('initialize'), init.path);
  assert.ok(retr.path.includes('checkoutform') && !retr.path.includes('initialize'), retr.path);
  const b = init.body;
  assert.equal(b.currency, 'TRY');
  assert.equal(b.paymentGroup, 'PRODUCT');
  assert.equal(b.conversationId, params.conversationId);
  assert.equal(b.callbackUrl, params.callbackUrl);
  assert.equal(Number(b.price), 150);
  assert.equal(Number(b.paidPrice), 150);
  assert.deepEqual(b.enabledInstallments, [1, 2, 3, 6, 9]);
  assert.equal(b.basketItems.length, 2);
  assert.ok(b.basketItems.every((i) => i.itemType === 'PHYSICAL'));
  assert.deepEqual(b.basketItems.map((i) => [i.id, Number(i.price)]), [['fixture-prod-1', 100], ['fixture-prod-2', 50]]);
  for (const k of ['contactName', 'city', 'country', 'address']) {
    assert.equal(b.shippingAddress[k], params.shippingAddress[k]);
    assert.equal(b.billingAddress[k], params.billingAddress[k]);
  }
  assert.equal(b.buyer.email, 'buyer@example.invalid');
  assert.equal(retr.body.token, TOKEN);
  assert.equal(retr.body.conversationId, params.conversationId);
  assert.equal(run.init.status, 'success');
  assert.equal(run.init.token, TOKEN);
  assert.equal(run.retrieve.status, 'success');
  assert.equal(run.retrieve.paymentStatus, 'SUCCESS');
  assert.equal(run.retrieve.token, run.init.token);

  const baselinePath = process.env.LUMIERE_TEST_BASELINE_SDK;
  if (baselinePath) {
    const req = createRequire(import.meta.url);
    const Baseline = req(path.resolve(baselinePath));
    const base = await runSequence(Baseline, 'baseline');
    summary.baseline = { client: base.records[0]?.client, requests: base.records.length, errors: base.errors };
    assert.deepEqual(base.errors, []);
    const shape = (rs) => rs.map((r) => ({ method: r.method, path: r.path, body: r.body }));
    assert.deepEqual(shape(run.records), shape(base.records));
    assert.ok(base.records.every((r) => r.hmacOk));
  }
});

test('postman-request resolved uuid/qs are callable and patched', () => {
  const req = createRequire(import.meta.url);
  const iyzReq = createRequire(req.resolve('iyzipay'));
  const prPath = iyzReq.resolve('postman-request');
  const prReq = createRequire(prPath);
  const uuidPath = prReq.resolve('uuid');
  const uuid = prReq('uuid');
  assert.equal(typeof uuid.v4, 'function');
  assert.match(uuid.v4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const qsPath = prReq.resolve('qs');
  const qs = prReq('qs');
  assert.doesNotThrow(() => qs.stringify({ a: [1, null, 2], b: null }, { arrayFormat: 'comma' }));
  assert.doesNotThrow(() => qs.stringify({ a: [null] }, { arrayFormat: 'comma', commaRoundTrip: true }));
  assert.doesNotThrow(() => qs.parse('a=,&b=1,,2', { comma: true }));
  const qsPkg = findPkg(qsPath, 'qs');
  const uuidPkg = findPkg(uuidPath, 'uuid');
  summary.deps = { qs: qsPkg?.version, uuid: uuidPkg?.version };
  assert.ok(qsPkg && gte(qsPkg.version, '6.16.1'), 'qs ' + qsPkg?.version);
  assert.ok(uuidPkg && gte(uuidPkg.version, '11.1.1'), 'uuid ' + uuidPkg?.version);
});
