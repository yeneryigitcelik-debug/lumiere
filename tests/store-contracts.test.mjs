import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { transformSync } from 'esbuild';
const require = createRequire(import.meta.url);
const cartCode = transformSync(readFileSync(new URL('../stores/cart.ts', import.meta.url), 'utf8'), { loader: 'ts', format: 'cjs', target: 'node22' }).code;

const KEY = 'bycollection-cart';

class FakeStorage {
  constructor(seed = {}, opts = {}) {
    this.map = new Map(Object.entries(seed));
    this.throwGet = Boolean(opts.throwGet);
    this.throwSet = Boolean(opts.throwSet);
    this.writes = [];
  }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(k) {
    if (this.throwGet) throw new Error('fixture: blocked getItem');
    return this.map.has(k) ? this.map.get(k) : null;
  }
  setItem(k, v) {
    if (this.throwSet) throw new Error('fixture: blocked setItem');
    this.writes.push(String(v));
    this.map.set(k, String(v));
  }
  removeItem(k) { this.map.delete(k); }
  clear() { this.map.clear(); }
  peek(k) { return this.map.has(k) ? this.map.get(k) : null; }
}

function withTimeout(promise, ms, label) {
  let timer;
  const t = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(label + ' timed out')), ms);
  });
  return Promise.race([promise, t]).finally(() => clearTimeout(timer));
}

async function withCart(name, storage, fn) {
  const had = Object.prototype.hasOwnProperty.call(globalThis, 'window');
  const prev = globalThis.window;
  if (storage) globalThis.window = { localStorage: storage };
  else delete globalThis.window;
  try {
    // tsx maps this CommonJS project's cache-busted imports to one module.
    // Evaluate the unchanged, type-erased production source in a fresh module
    // for each case so closure-local memory and failure flags cannot leak.
    const isolated = { exports: {} };
    new Function('require', 'module', 'exports', cartCode)(require, isolated, isolated.exports);
    const mod = isolated.exports;
    return await fn(mod);
  } finally {
    if (had) globalThis.window = prev;
    else delete globalThis.window;
  }
}

async function hydrate(mod) {
  await withTimeout(Promise.resolve(mod.useCartStore.persist.rehydrate()), 2000, 'rehydrate');
  assert.equal(mod.useCartStore.getState().hasHydrated, true, 'hydration must complete');
}

function item(productId, extra = {}) {
  return { productId, name: 'Fixture ' + productId, price: 10, quantity: 1, slug: 'fixture-' + productId, ...extra };
}

function storedIds(storage) {
  const raw = storage.peek(KEY);
  if (raw === null) return [];
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed.state) ? parsed.state : parsed.state?.items;
  return Array.isArray(items) ? items.map((i) => i.productId).sort() : [];
}

const ids = (items) => items.map((i) => i.productId).sort();

describe('cart normalization (pure)', { concurrency: false }, () => {
  test('valid price 0 and null optional fields normalize to exact fields', async () => {
    await withCart('pure-valid', null, async (m) => {
      const out = m.normalizeCartItem({
        productId: 'p1', name: 'Ring', price: 0, quantity: 2, slug: 'ring',
        variantId: null, image: null, variantName: undefined, categorySlug: '', extra: 'drop-me',
      });
      assert.deepEqual(out, { productId: 'p1', name: 'Ring', price: 0, quantity: 2, slug: 'ring' });
      assert.equal(Object.prototype.hasOwnProperty.call(out, 'variantId'), false);
      const full = { productId: 'p2', variantId: 'v1', name: 'Neck', image: '/img/x.webp', price: 12.5, variantName: 'Gold', quantity: 3, slug: 'neck', categorySlug: 'kolye' };
      assert.deepEqual(m.normalizeCartItem({ ...full, unknown: 1 }), full);
    });
  });

  test('safe integer quantity above 99 is allowed', async () => {
    await withCart('pure-big', null, async (m) => {
      assert.equal(m.normalizeCartItem(item('p', { quantity: 100 }))?.quantity, 100);
      assert.equal(m.normalizeCartItem(item('p', { quantity: 5000 }))?.quantity, 5000);
    });
  });

  test('invalid shapes, quantities, prices and product overflow are rejected', async () => {
    await withCart('pure-invalid', null, async (m) => {
      const bad = [
        null, undefined, 'x', 1, [], [item('p')],
        { ...item('p'), productId: '' }, { ...item('p'), productId: 5 },
        { ...item('p'), slug: '' }, { ...item('p'), name: 1 },
        item('p', { quantity: 0 }), item('p', { quantity: -1 }), item('p', { quantity: 1.5 }),
        item('p', { quantity: Infinity }), item('p', { quantity: NaN }), item('p', { quantity: '2' }),
        item('p', { quantity: Number.MAX_SAFE_INTEGER + 1 }),
        item('p', { price: -1 }), item('p', { price: Infinity }), item('p', { price: NaN }), item('p', { price: '10' }),
        item('p', { price: 1e300, quantity: 1e10 }),
        item('p', { variantId: 7 }), item('p', { image: {} }), item('p', { categorySlug: 1 }),
      ];
      for (const b of bad) assert.equal(m.normalizeCartItem(b), null, 'rejects ' + JSON.stringify(b));
    });
  });

  test('normalizeCartItems merges lines and omits aggregate overflow', async () => {
    await withCart('pure-list', null, async (m) => {
      assert.deepEqual(m.normalizeCartItems(undefined), { items: [], omitted: 0 });
      assert.deepEqual(m.normalizeCartItems({ items: [] }), { items: [], omitted: 1 });
      const merged = m.normalizeCartItems([item('a', { quantity: 2 }), item('a', { quantity: 3 }), item('a', { variantId: 'v' }), 'junk']);
      assert.equal(merged.omitted, 1);
      assert.equal(merged.items.length, 2);
      assert.equal(merged.items.find((i) => !i.variantId).quantity, 5);
      const cost = m.normalizeCartItems([item('x', { price: 1e308 }), item('y', { price: 1e308 })]);
      assert.equal(cost.items.length, 1);
      assert.equal(cost.omitted, 1);
      const qty = m.normalizeCartItems([item('q', { quantity: Number.MAX_SAFE_INTEGER, price: 0 }), item('q', { quantity: Number.MAX_SAFE_INTEGER, price: 0 })]);
      assert.equal(qty.items.length, 1);
      assert.equal(qty.items[0].quantity, Number.MAX_SAFE_INTEGER);
      assert.equal(qty.omitted, 1);
    });
  });
});

describe('cart store state cases', { concurrency: false }, () => {
  test('rehydrates legacy version 0 array-state cart', async () => {
    const storage = new FakeStorage({ [KEY]: JSON.stringify({ state: [item('legacy'), { bad: true }], version: 0 }) });
    await withCart('legacy-v0', storage, async (m) => {
      await hydrate(m);
      const s = m.useCartStore.getState();
      assert.deepEqual(ids(s.items), ['legacy']);
      assert.equal(s.storageWarning, m.CART_WARNING_OMITTED);
    });
  });

  test('rehydrates legacy versionless object-state cart', async () => {
    const storage = new FakeStorage({ [KEY]: JSON.stringify({ state: { items: [item('old', { quantity: 4 })] } }) });
    await withCart('legacy-nover', storage, async (m) => {
      await hydrate(m);
      assert.deepEqual(m.useCartStore.getState().items, [item('old', { quantity: 4 })]);
      assert.equal(m.useCartStore.getState().storageWarning, null);
    });
  });

  test('corrupt storage is ignored with warning and cart stays usable', async () => {
    for (const raw of ['{not json', '[]', '42']) {
      const storage = new FakeStorage({ [KEY]: raw });
      await withCart('corrupt', storage, async (m) => {
        await hydrate(m);
        const s = m.useCartStore.getState();
        assert.deepEqual(s.items, []);
        assert.equal(s.storageWarning, m.CART_WARNING_CORRUPT);
        assert.equal(s.addItem(item('n')), true);
        assert.equal(s.totalItems ? m.useCartStore.getState().totalItems() : 0, 1);
      });
    }
  });

  test('blocked read never overwrites an unread saved cart', async () => {
    const raw = JSON.stringify({ state: { items: [item('unread')] }, version: 1 });
    const storage = new FakeStorage({ [KEY]: raw }, { throwGet: true });
    await withCart('blocked-preserve', storage, async (m) => {
      await hydrate(m);
      assert.equal(m.useCartStore.getState().addItem(item('memory-only')), true);
      assert.deepEqual(ids(m.useCartStore.getState().items), ['memory-only']);
      assert.equal(storage.peek(KEY), raw, 'a failed read must not erase unread saved data');
    });
  });

  test('blocked getItem falls back to memory cart', async () => {
    const storage = new FakeStorage({}, { throwGet: true });
    await withCart('blocked-get', storage, async (m) => {
      await hydrate(m);
      assert.equal(m.useCartStore.getState().storageWarning, m.CART_WARNING_UNAVAILABLE);
      assert.equal(m.useCartStore.getState().addItem(item('mem', { quantity: 2 })), true);
      assert.equal(m.useCartStore.getState().totalItems(), 2);
    });
  });

  test('blocked setItem warns, keeps memory cart and rehydrates from memory', async () => {
    const storage = new FakeStorage({}, { throwSet: true });
    await withCart('blocked-set', storage, async (m) => {
      await hydrate(m);
      assert.equal(m.useCartStore.getState().addItem(item('w')), true);
      assert.equal(m.useCartStore.getState().storageWarning, m.CART_WARNING_WRITE);
      assert.deepEqual(ids(m.useCartStore.getState().items), ['w']);
      await hydrate(m);
      assert.deepEqual(ids(m.useCartStore.getState().items), ['w']);
      assert.equal(m.useCartStore.getState().storageWarning, m.CART_WARNING_WRITE);
      assert.equal(storage.peek(KEY), null);
    });
  });

  test('add/remove/update are keyed by product and variant', async () => {
    const storage = new FakeStorage();
    await withCart('keyed', storage, async (m) => {
      await hydrate(m);
      const st = () => m.useCartStore.getState();
      assert.equal(st().addItem(item('p')), true);
      assert.equal(st().addItem(item('p', { variantId: 'v1' })), true);
      assert.equal(st().addItem(item('p', { variantId: 'v2' })), true);
      assert.equal(st().addItem(item('p', { variantId: 'v1', quantity: 2 })), true);
      assert.equal(st().items.length, 3);
      assert.equal(st().items.find((i) => i.variantId === 'v1').quantity, 3);
      st().updateQuantity('p', 150, 'v2');
      assert.equal(st().items.find((i) => i.variantId === 'v2').quantity, 150);
      assert.equal(st().items.find((i) => i.variantId === undefined).quantity, 1);
      st().removeItem('p', 'v1');
      assert.deepEqual(st().items.map((i) => i.variantId ?? null).sort(), [null, 'v2'].sort());
      st().updateQuantity('p', -Infinity);
      st().updateQuantity('p', NaN);
      st().updateQuantity('p', 2.5);
      assert.equal(st().items.find((i) => i.variantId === undefined)?.quantity, 1, 'non-finite/fractional qty must not delete or change');
      st().updateQuantity('p', 0);
      assert.deepEqual(st().items.map((i) => i.variantId), ['v2']);
      assert.deepEqual(storedIds(storage), ['p']);
      st().clearCart();
      assert.deepEqual(st().items, []);
    });
  });

  test('addItem returns boolean and totals stay finite', async () => {
    const storage = new FakeStorage();
    await withCart('limits', storage, async (m) => {
      await hydrate(m);
      const st = () => m.useCartStore.getState();
      assert.equal(st().addItem({ productId: 'bad' }), false);
      assert.equal(st().storageWarning, m.CART_WARNING_INVALID_ITEM);
      assert.equal(st().addItem(item('big', { price: 1e308 })), true);
      assert.equal(st().addItem(item('big2', { price: 1e308 })), false);
      assert.equal(st().storageWarning, m.CART_WARNING_LIMIT);
      st().updateQuantity('big', 10);
      assert.equal(st().items[0].quantity, 1);
      assert.equal(st().addItem(item('free', { price: 0, quantity: Number.MAX_SAFE_INTEGER - 1 })), true);
      assert.equal(st().addItem(item('more', { price: 0 })), false);
      assert.ok(Number.isFinite(st().totalPrice()));
      assert.ok(Number.isSafeInteger(st().totalItems()));
      assert.equal(st().items.length, 2);
    });
  });

  test('REPRO: addItem before hydration must never overwrite stored legacy cart', async () => {
    const storage = new FakeStorage({ [KEY]: JSON.stringify({ state: [item('A', { quantity: 2 })], version: 0 }) });
    await withCart('prehydrate', storage, async (m) => {
      let added;
      let storedAfterAdd;
      let unchangedBeforeHydrate;
      try {
        added = m.useCartStore.getState().addItem(item('B'));
        storedAfterAdd = storedIds(storage);
        unchangedBeforeHydrate = m.useCartStore.getState().items.length === 0;
      } finally {
        await hydrate(m);
      }
      assert.equal(typeof added, 'boolean');
      assert.ok(storedAfterAdd.includes('A'), 'stored legacy A overwritten before hydration: ' + JSON.stringify(storedAfterAdd));
      const finalIds = ids(m.useCartStore.getState().items);
      if (added) {
        assert.deepEqual(finalIds, ['A', 'B']);
      } else {
        assert.equal(unchangedBeforeHydrate, true);
        assert.deepEqual(finalIds, ['A']);
      }
      assert.ok(storedIds(storage).includes('A'), 'stored A lost after hydration');
      assert.equal(m.useCartStore.getState().items.find((i) => i.productId === 'A')?.quantity, 2);
    });
  });
});

test('external storage clear rehydration removes the stale in-memory cart', async()=>{
  const storage=new FakeStorage();
  await withCart('external-clear',storage,async m=>{
    await hydrate(m);
    assert.equal(m.useCartStore.getState().addItem(item('cleared-elsewhere')),true);
    storage.clear();
    await hydrate(m);
    assert.deepEqual(m.useCartStore.getState().items,[]);
    assert.equal(m.useCartStore.getState().totalItems(),0);
  });
});

test('legacy migration write failure retains the write warning and saved raw bytes',async()=>{
  const raw=JSON.stringify({state:{items:[item('old-write-blocked')]},version:0});
  const storage=new FakeStorage({[KEY]:raw},{throwSet:true});
  await withCart('migration-write',storage,async m=>{
    await hydrate(m);
    assert.equal(m.useCartStore.getState().storageWarning,m.CART_WARNING_WRITE);
    assert.deepEqual(ids(m.useCartStore.getState().items),['old-write-blocked']);
    assert.equal(storage.peek(KEY),raw);
  });
});
