import { test as base, expect } from '@playwright/test';

// Fresh context per test (Playwright default). Only the fixture origin is reachable; WebGL is unavailable.
const test = base.extend({
  context: async ({ context, baseURL }, runFixture) => {
    const origin = new URL(baseURL).origin;
    await context.route('**/*', (r) => (new URL(r.request().url()).origin === origin ? r.continue() : r.abort('blockedbyclient')));
    await context.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...a) { return /webgl/i.test(String(type)) ? (new URL(location.href).searchParams.has('enhanced') ? {getExtension:()=>({loseContext(){}})} : null) : orig.call(this, type, ...a); };
    });
    await runFixture(context);
  },
  pageErrors: [async ({ page }, runFixture) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await runFixture(errors);
    expect(errors, 'uncaught page errors during journey').toEqual([]);
  }, { auto: true }],
});

const logo = (page) => page.getByRole('link', { name: /by ?collection/i });
const cartLink = (page) => page.getByRole('banner').getByRole('link', { name: /^Sepet/ });
const cartQty = (page) => page.evaluate(() => window.fixture.store.getState().items.reduce((s, i) => s + Number(i.quantity), 0));
const routerCalls = (page) => page.evaluate(() => window.__routerCalls ?? []);
const flush = (page) => page.evaluate(() => new Promise((r) => setTimeout(r, 0)));
const storageKey = (page) => page.evaluate(() => window.fixture.store.persist.getOptions().name);

function pdp(page) {
  const section = page.locator('section', { has: page.getByRole('heading', { level: 1, name: 'Sentetik Test Yüzüğü' }) });
  return {
    section,
    price: section.locator('[aria-live=polite][aria-atomic=true]'),
    large: section.getByRole('button', { name: /^Sentetik Büyük/ }),
    small: section.getByRole('button', { name: /^Sentetik Küçük/ }),
    add: section.getByRole('button', { name: /^Sepete Ekle/ }),
    status: section.getByRole('status'),
  };
}

async function waitHydrated(page) {
  await expect.poll(() => page.evaluate(() => window.fixture?.store.getState().hasHydrated)).toBe(true);
}

// ---------------- Home / header (both viewports: layout differs) ----------------
test.describe('home first load @mobile', () => {
  test('single h1, CTA usable immediately, brand, no overflow', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'Koleksiyonu Keşfet' });
    await expect(cta).toBeVisible({ timeout: 2000 });
    await expect(cta).toBeInViewport();
    // trial click checks the CTA is the actual hit target: no splash/overlay blocks it.
    await cta.click({ trial: true, timeout: 2000 });
    await expect(page.locator('h1:visible')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Işığı Keşfet');
    await expect(logo(page)).toBeVisible();
    expect(await page.locator('body').innerText()).not.toMatch(/lumi.re/i);
    expect(await page.title()).not.toMatch(/lumi.re/i);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await cta.click();
    await expect(page).toHaveURL(/[/]urunler$/);
  });

  test('header account/cart targets, opaque cream bar, keyboard focus', async ({ page }, ti) => {
    await page.goto('/');
    for (const link of [page.getByRole('link', { name: 'Hesabım' }), cartLink(page)]) {
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expect(cartLink(page)).toHaveAccessibleName('Sepet');
    const bg = await page.getByRole('banner').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(bg).not.toBe('transparent');
    const alpha = bg.includes('/') ? parseFloat(bg.split('/').pop()) : bg.startsWith('rgba') ? parseFloat(bg.split(',')[3]) : 1;
    expect(alpha).toBeGreaterThanOrEqual(0.9);

    await page.keyboard.press('Tab');
    const first = ti.project.name === 'mobile' ? logo(page) : page.getByRole('link', { name: 'Tüm Ürünler' });
    await expect(first).toBeFocused();
    expect(await first.evaluate((e) => e.matches(':focus-visible'))).toBe(true);
  });
});

// ---------------- Mobile disclosure ----------------
test.describe('mobile menu @mobile-only', () => {
  const toggle = (page) => page.getByRole('button', { name: /^Menüyü (aç|kapat)$/ });
  const menu = (page) => page.locator('#mobile-nav-menu');
  const open = async (page) => {
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  };
  const expectClosed = async (page) => {
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menu(page)).toBeHidden();
  };
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('aria disclosure, Escape returns focus, closed links not focusable', async ({ page }) => {
    await expect(toggle(page)).toHaveAccessibleName('Menüyü aç');
    await expect(toggle(page)).toHaveAttribute('aria-controls', 'mobile-nav-menu');
    await expectClosed(page);
    await expect(menu(page).getByRole('link')).toHaveCount(0);
    await open(page);
    await expect(toggle(page)).toHaveAccessibleName('Menüyü kapat');
    await expect(menu(page).getByRole('link', { name: 'Koleksiyon' })).toBeVisible();
    await menu(page).getByRole('link', { name: 'Blog' }).focus();
    await page.keyboard.press('Escape');
    await expectClosed(page);
    await expect(toggle(page)).toBeFocused();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.getElementById('mobile-nav-menu')?.contains(document.activeElement))).toBe(false);
    }
  });

  test('Koleksiyon click routes and closes', async ({ page }) => {
    await open(page);
    await menu(page).getByRole('link', { name: 'Koleksiyon' }).click();
    await expect(page).toHaveURL(/[/]urunler$/);
    await expectClosed(page);
  });

  test('outside pointer closes', async ({ page }) => {
    await open(page);
    await page.mouse.click(195, 600);
    await expectClosed(page);
  });

  test('resize to desktop with focus in menu moves focus to logo', async ({ page }) => {
    for (let cycle=0;cycle<8;cycle++) {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page);
      await menu(page).getByRole('link', { name: 'Hakkımızda' }).focus();
      await page.setViewportSize({ width: 1440, height: 1000 });
      await expect(logo(page)).toBeFocused();
      await expect(page.getByRole('button', { name: /^Menüyü (aç|kapat)$/, includeHidden: true })).toHaveAttribute('aria-expanded', 'false');
    }
    await page.setViewportSize({ width:390,height:844 });
    await open(page);
    const outside=page.getByRole('link',{name:'Koleksiyonu Keşfet',exact:true});
    await outside.focus();
    await page.setViewportSize({width:1440,height:1000});
    await expect(outside).toBeFocused();
  });

  test('external route change closes', async ({ page }) => {
    await open(page);
    await page.evaluate(() => { history.pushState({}, '', '/blog'); window.dispatchEvent(new PopStateEvent('popstate')); });
    await expectClosed(page);
  });

  test('modified click keeps menu open and does not route', async ({ page }) => {
    await open(page);
    await menu(page).getByRole('link', { name: 'Koleksiyon' }).evaluate((a) => {
      // Block the browser new-tab default after React handled the event; no real tab is opened.
      document.addEventListener('click', (e) => e.preventDefault(), { once: true });
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true }));
    });
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(page).toHaveURL(/127.0.0.1:[0-9]+[/]$/);
  });
});

// ---------------- Product variant / add to cart ----------------
test.describe('variant + add to cart', () => {

  test('aria-pressed, 1300 price on large, exactly one add, header count', async ({ page }) => {
    await page.goto('/urunler');
    const p = pdp(page);
    await expect(p.price).toContainText(/1.?200/);
    await expect(p.large).toHaveAttribute('aria-pressed', 'false');
    await p.large.click();
    await expect(p.large).toHaveAttribute('aria-pressed', 'true');
    await expect(p.small).toHaveAttribute('aria-pressed', 'false');
    await expect(p.price).toContainText(/1.?300/);
    await expect(p.add).toBeEnabled();
    await p.add.evaluate((b) => { b.click(); b.click(); b.click(); });
    await expect(p.add).toHaveAccessibleName('Sepete Eklendi');
    await p.add.evaluate((b) => b.click());
    expect(await cartQty(page)).toBe(1);
    const items = await page.evaluate(() => window.fixture.store.getState().items);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ variantId: 'fixture-large', price: 1300 });
    await expect(p.status).toHaveText('Sentetik Test Yüzüğü (Sentetik Büyük) sepete eklendi.');
    await expect(cartLink(page)).toHaveAccessibleName('Sepet, 1 ürün');
  });

  test('variant switch allows immediate add; old timer does not erase new confirmation', async ({ page }) => {
    await page.clock.install();
    await page.goto('/urunler');
    const p = pdp(page);
    await p.small.click();
    await expect(p.add).toBeEnabled();
    await p.add.click();
    await expect(p.add).toHaveAccessibleName('Sepete Eklendi');
    await page.clock.runFor(800);
    await p.large.click();
    await expect(p.add).toHaveAccessibleName('Sepete Ekle');
    await p.add.click();
    await expect(p.add).toHaveAccessibleName('Sepete Eklendi');
    await page.clock.runFor(600);
    await expect(p.add).toHaveAccessibleName('Sepete Eklendi');
    await expect(p.status).toContainText('Sentetik Büyük');
    await page.clock.runFor(800);
    await expect(p.add).toHaveAccessibleName('Sepete Ekle');
    expect(await cartQty(page)).toBe(2);
    await expect(cartLink(page)).toHaveAccessibleName('Sepet, 2 ürün');
  });

  test('unmount during confirmation, remount starts clean', async ({ page }) => {
    await page.clock.install();
    await page.goto('/urunler');
    const p = pdp(page);
    await expect(p.add).toBeEnabled();
    await p.add.click();
    await expect(p.add).toHaveAccessibleName('Sepete Eklendi');
    await cartLink(page).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Sepetim' })).toBeVisible();
    await page.clock.runFor(2000);
    await page.goBack();
    await expect(p.add).toHaveAccessibleName('Sepete Ekle');
    await expect(p.add).toBeEnabled();
    await expect(p.status).toHaveText('');
    await page.clock.runFor(2000);
    await expect(p.add).toHaveAccessibleName('Sepete Ekle');
    expect(await cartQty(page)).toBe(1);
  });
});

// ---------------- Cart page ----------------
test.describe('cart page', () => {

  async function seed(page, items) {
    await page.goto('/');
    await waitHydrated(page);
    for (const it of items) expect(await page.evaluate((i) => window.fixture.store.getState().addItem(i), it)).not.toBe(false);
    await cartLink(page).click();
    await expect(page).toHaveURL(/[/]sepet$/);
  }
  const ring = { productId: 'synthetic-ring', name: 'Sentetik Test Yüzüğü', price: 200, slug: 'sentetik-test-yuzugu', categorySlug: 'yuzukler', quantity: 1 };
  const legacy = { productId: 'synthetic-legacy', name: 'Sentetik Eski Kolye', price: 150, slug: 'sentetik-eski-kolye', quantity: 1 };

  test('quantity labels, links, shipping threshold, removal focus', async ({ page }) => {
    await seed(page, [ring, legacy]);
    await expect(page.getByRole('link', { name: 'Sentetik Test Yüzüğü' })).toHaveAttribute('href', '/urunler/yuzukler/sentetik-test-yuzugu');
    const legacyLink = page.getByRole('link', { name: /Sentetik Eski Kolye/ });
    await expect(legacyLink).toHaveAttribute('href', '/urunler');
    await expect(legacyLink).toHaveAccessibleName(/koleksiyon sayfası/);

    const checkout = page.getByRole('link', { name: 'Ödemeye Geç' });
    await expect(checkout).toHaveCount(1);
    await expect(checkout).toHaveAttribute('href', '/odeme');
    await expect(checkout.locator('button')).toHaveCount(0);

    // 350 < 500 -> 29,90 shipping
    await expect(page.getByText('500 TL üzeri alışverişlerde ücretsiz kargo')).toBeVisible();
    await expect(page.getByText(/29.90/)).toBeVisible();

    await page.getByRole('button', { name: 'Sentetik Test Yüzüğü adedini artır' }).click();
    await expect(page.getByText('Sentetik Test Yüzüğü adedi 2 olarak güncellendi.')).toBeAttached();
    await expect(page.locator('[aria-label="Adet: 2"]')).toHaveText('2');
    // 550 >= 500 -> free
    await expect(page.getByText('Ücretsiz')).toBeVisible();
    await expect(page.getByText('500 TL üzeri alışverişlerde ücretsiz kargo')).toHaveCount(0);
    await expect(cartLink(page)).toHaveAccessibleName('Sepet, 3 ürün');

    await page.getByRole('button', { name: 'Sentetik Test Yüzüğü adedini azalt' }).click();
    await expect(page.getByText('Sentetik Test Yüzüğü adedi 1 olarak güncellendi.')).toBeAttached();
    await expect(page.getByRole('button', { name: 'Sentetik Test Yüzüğü ürününü sepetten çıkar' })).toHaveCount(2);

    await page.getByRole('button', { name: 'Sentetik Eski Kolye ürününü sepetten çıkar' }).last().click();
    await expect(page.getByText('Sentetik Eski Kolye sepetten çıkarıldı.')).toBeAttached();
    await expect(page.locator('#cart-remove-0')).toBeFocused();
    await page.locator('#cart-remove-0').click();
    const empty = page.getByRole('heading', { level: 1, name: 'Sepetiniz Boş' });
    await expect(empty).toBeFocused();
    await expect(cartLink(page)).toHaveAccessibleName('Sepet');
  });

  test('corrupt persisted payloads do not crash the cart', async ({ page }) => {
    await page.goto('/');
    await waitHydrated(page);
    const key = await storageKey(page);
    for (const raw of ['{"state":', JSON.stringify({ state: { items: [{ productId: 42, quantity: 'lots' }, null] }, version: 0 })]) {
      await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, raw]);
      await page.goto('/sepet');
      await expect(page.getByRole('heading', { level: 1, name: /^Sepet(im|iniz Boş)$/ })).toBeVisible();
    }
    await page.goto('/urunler');
    const p = pdp(page);
    await expect(p.add).toBeEnabled();
    await p.add.click();
    await expect(cartLink(page)).toHaveAccessibleName(/^Sepet, [0-9]+ ürün$/);
  });

  test('blocked storage stays usable with a visible warning', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });
    });
    await page.goto('/urunler');
    const p = pdp(page);
    await expect(p.add).toBeEnabled();
    await p.add.click();
    await expect(cartLink(page)).toHaveAccessibleName('Sepet, 1 ürün');
    await cartLink(page).click();
    await expect(page.getByRole('link', { name: 'Sentetik Test Yüzüğü' })).toBeVisible();
    const warning = page.getByRole('main').locator('p[role=status]:not(.sr-only)');
    await expect(warning.first()).toBeVisible();
    await expect(warning.first()).not.toHaveText('');
  });

  test('cross-tab storage event syncs header count', async ({ page }) => {
    await page.goto('/urunler');
    const p = pdp(page);
    await expect(p.add).toBeEnabled();
    await p.add.click();
    await expect(cartLink(page)).toHaveAccessibleName('Sepet, 1 ürün');
    const key = await storageKey(page);
    await page.evaluate((k) => {
      const data = JSON.parse(localStorage.getItem(k));
      data.state.items[0].quantity = 3;
      data.state.items.push({ productId: 42, quantity: 'bad' });
      data.state.items[0].unexpected = { nested: true };
      const v = JSON.stringify(data);
      localStorage.setItem(k, v);
      window.dispatchEvent(new StorageEvent('storage', { key: k, newValue: v, storageArea: localStorage }));
    }, key);
    await expect(cartLink(page)).toHaveAccessibleName('Sepet, 3 ürün');
  });
});

// ---------------- Login ----------------
test.describe('login', () => {
  const email = (page) => page.getByLabel('E-posta');
  const password = (page) => page.getByLabel('Şifre');
  const submit = (page) => page.getByRole('button', { name: /^Giriş (Yap|yapılıyor...)$/ });
  const google = (page) => page.getByRole('button', { name: /^Google (ile Giriş Yap|açılıyor...)$/ });
  const setMode = (page, m) => page.evaluate((mode) => { window.__auth.mode = mode; }, m);
  const fill = async (page) => { await email(page).fill('synthetic@example.invalid'); await password(page).fill('synthetic-only'); };
  const resolveOk = (page) => page.evaluate(() => window.__auth.pending.splice(0).forEach((r) => r({ ok: true, status: 200, error: null, url: null })));
  test.beforeEach(async ({ page }) => {
    if (!test.info().title.includes('[clock]')) await page.goto('/giris');
  });

  test('labels, autocomplete, invalid credentials alert focused', async ({ page }) => {
    await expect(email(page)).toHaveAttribute('autocomplete', 'email');
    await expect(password(page)).toHaveAttribute('autocomplete', 'current-password');
    await fill(page);
    await submit(page).click();
    const alert = page.getByRole('alert');
    await expect(alert).toHaveText('E-posta veya şifre hatalı');
    await expect(alert).toBeFocused();
    await expect(email(page)).toHaveAttribute('aria-invalid', 'true');
    expect(await page.evaluate(() => window.__auth.calls)).toEqual([{ provider: 'credentials', options: { email: 'synthetic@example.invalid', password: 'synthetic-only', redirect: false } }]);
    expect(await routerCalls(page)).toEqual([]);
  });

  test('network rejection unlocks, no router calls', async ({ page }) => {
    await setMode(page, 'reject');
    await fill(page);
    await submit(page).click();
    await expect(page.getByRole('alert')).toContainText('Bağlantı sorunu');
    await expect(email(page)).not.toHaveAttribute('aria-invalid','true');
    await expect(password(page)).not.toHaveAttribute('aria-invalid','true');
    await expect(submit(page)).toBeEnabled();
    await expect(email(page)).not.toHaveAttribute('readonly', /.*/);
    expect(await routerCalls(page)).toEqual([]);
  });

  test('undefined response is not success', async ({ page }) => {
    await setMode(page, 'undefined');
    await fill(page);
    await submit(page).click();
    await expect(page.getByRole('alert')).toHaveText('Giriş şu anda tamamlanamadı. Lütfen biraz sonra tekrar deneyin.');
    expect(await routerCalls(page)).toEqual([]);
    await expect(page).toHaveURL(/[/]giris$/);
  });

  test('pending credentials blocks double submit and Google; inputs readonly; settle unlocks', async ({ page }) => {
    await setMode(page, 'pending');
    await fill(page);
    await submit(page).click();
    await expect(submit(page)).toHaveText('Giriş yapılıyor...');
    await expect(submit(page)).toBeDisabled();
    await expect(google(page)).toBeDisabled();
    await expect(email(page)).toHaveAttribute('readonly', '');
    await expect(password(page)).toHaveAttribute('readonly', '');
    await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true');
    await page.locator('form').evaluate((f) => { f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); f.requestSubmit(); });
    await google(page).click({ force: true });
    await flush(page);
    expect(await page.evaluate(() => window.__auth.calls.length)).toBe(1);
    expect(await page.evaluate(() => window.__auth.calls[0].provider)).toBe('credentials');
    expect(await page.evaluate(() => window.__auth.pending.length)).toBe(1);
    await page.evaluate(() => window.__auth.pending.splice(0).forEach((r) => r({ ok: false, status: 401, error: 'CredentialsSignin', url: null })));
    await expect(page.getByRole('alert')).toHaveText('E-posta veya şifre hatalı');
    await expect(submit(page)).toBeEnabled();
    await expect(google(page)).toBeEnabled();
    await expect(email(page)).not.toHaveAttribute('readonly', /.*/);
    await expect(password(page)).not.toHaveAttribute('readonly', /.*/);
    expect(await routerCalls(page)).toEqual([]);
  });

  test('[clock] slow notice after 20s stays truthful and locked, no retry before settle', async ({ page }) => {
    await page.clock.install();
    await page.goto('/giris');
    await setMode(page, 'pending');
    await fill(page);
    await submit(page).click();
    const status = page.locator('form').getByRole('status');
    await expect(status).toHaveText('Giriş yapılıyor, lütfen bekleyin.');
    await page.clock.fastForward(21000);
    await expect(status).toContainText('Giriş yapılıyor, lütfen bekleyin.');
    await expect(status).toContainText('İşlem beklenenden uzun sürüyor. Bağlantınız yavaş olabilir; dilerseniz');
    await expect(status.getByRole('link', { name: 'sayfayı yenileyin' })).toHaveAttribute('href', '/giris');
    await expect(submit(page)).toBeDisabled();
    await expect(google(page)).toBeDisabled();
    await expect(email(page)).toHaveAttribute('readonly', '');
    await page.locator('form').evaluate((f) => f.requestSubmit());
    await google(page).click({ force: true });
    await flush(page);
    expect(await page.evaluate(() => window.__auth.calls.length)).toBe(1);
    expect(await page.evaluate(() => window.__auth.pending.length)).toBe(1);
    expect(await routerCalls(page)).toEqual([]);
    await resolveOk(page);
    await expect.poll(() => routerCalls(page)).toEqual([{ method: 'push', url: '/' }, { method: 'refresh' }]);
    expect(await page.evaluate(() => window.__auth.calls.length)).toBe(1);
  });

  test('ok result while mounted pushes / and refreshes exactly once', async ({ page }) => {
    await setMode(page, 'pending');
    await fill(page);
    await submit(page).click();
    await expect(submit(page)).toBeDisabled();
    await resolveOk(page);
    await expect.poll(() => routerCalls(page)).toEqual([{ method: 'push', url: '/' }, { method: 'refresh' }]);
    await expect(page).toHaveURL(/127.0.0.1:[0-9]+[/]$/);
    await flush(page);
    expect(await routerCalls(page)).toEqual([{ method: 'push', url: '/' }, { method: 'refresh' }]);
    expect(await page.evaluate(() => window.__auth.calls.length)).toBe(1);
  });

  test('leaving to /kayit while pending: late ok never navigates', async ({ page }) => {
    await setMode(page, 'pending');
    await fill(page);
    await submit(page).click();
    await expect(submit(page)).toBeDisabled();
    await page.getByRole('link', { name: 'Kayıt Ol' }).click();
    await expect(page).toHaveURL(/[/]kayit$/);
    await expect(submit(page)).toHaveCount(0);
    await resolveOk(page);
    await flush(page);
    await flush(page);
    expect(await page.evaluate(() => window.__auth.pending.length)).toBe(0);
    expect(await routerCalls(page)).toEqual([]);
    await expect(page).toHaveURL(/[/]kayit$/);
  });

  test('Google undefined result keeps pending redirect state, no credential routing', async ({ page }) => {
    await setMode(page, 'undefined');
    await google(page).click();
    await expect(google(page)).toHaveText('Google açılıyor...');
    await expect(google(page)).toBeDisabled();
    await expect(submit(page)).toBeDisabled();
    await expect(submit(page)).toHaveText('Giriş Yap');
    await expect(page.locator('form').getByRole('status')).toHaveText('Google girişine yönlendiriliyorsunuz.');
    await flush(page);
    await expect(google(page)).toBeDisabled();
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(await page.evaluate(() => window.__auth.calls)).toEqual([{ provider: 'google', options: { callbackUrl: '/' } }]);
    expect(await routerCalls(page)).toEqual([]);
    await expect(page).toHaveURL(/[/]giris$/);
  });
});

test.describe('profile draft and category read cleanup', () => {
  const session = (page, name) => page.evaluate(value => {
    window.__session = { data: { user: { name:value, email:'synthetic@example.invalid' } }, status:'authenticated' };
    window.dispatchEvent(new Event('fixture:session'));
  }, name);

  test('late session initializes edit draft; session refresh preserves unsaved edits', async ({page}) => {
    await page.goto('/hesabim');
    await expect(page.getByRole('heading',{name:'Profil',exact:true})).toHaveCount(0);
    await session(page,'Sentetik İlk Ad');
    await expect(page.getByRole('heading',{name:'Profil',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Düzenle',exact:true}).click();
    await expect(page.getByLabel('Ad',{exact:true})).toHaveValue('Sentetik İlk Ad');
    await page.getByLabel('Ad',{exact:true}).fill('Kaydedilmemiş Taslak');
    await session(page,'Sentetik Yenilenen Ad');
    await expect(page.getByLabel('Ad',{exact:true})).toHaveValue('Kaydedilmemiş Taslak');
    await page.getByRole('button',{name:'İptal',exact:true}).click();
    await expect(page.getByText('Sentetik Yenilenen Ad',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Düzenle',exact:true}).click();
    await expect(page.getByLabel('Ad',{exact:true})).toHaveValue('Sentetik Yenilenen Ad');
    await expect(page.getByLabel('Telefon',{exact:true})).toHaveAttribute('autocomplete','tel');
  });

  test('profile save retains exact name/phone payload with mocked PUT only', async ({page}) => {
    const requests=[];
    await page.route('**/api/profile',route=>{
      requests.push({method:route.request().method(),body:route.request().postDataJSON()});
      return route.fulfill({status:200,contentType:'application/json',body:'{}'});
    });
    await page.goto('/hesabim');
    await session(page,'Sentetik Profil');
    await page.getByRole('button',{name:'Düzenle',exact:true}).click();
    await page.getByLabel('Ad',{exact:true}).fill('Sentetik Yeni Ad');
    await page.getByLabel('Telefon',{exact:true}).fill('05000000000');
    await page.getByRole('button',{name:'Kaydet',exact:true}).click();
    await expect(page.getByRole('button',{name:'Düzenle',exact:true})).toBeVisible();
    expect(requests).toEqual([{method:'PUT',body:{name:'Sentetik Yeni Ad',phone:'05000000000'}}]);
    expect(await page.evaluate(()=>window.__sessionUpdates)).toEqual([{name:'Sentetik Yeni Ad'}]);
    await expect(page.getByRole('link',{name:/Siparişlerim/})).toHaveAttribute('href','/hesabim/siparislerim');
    await expect(page.getByRole('link',{name:/Adreslerim/})).toHaveAttribute('href','/hesabim/adreslerim');
  });

  test('category list reads existing protected GET contract through a synthetic response',async({page})=>{
    const methods=[];
    await page.route('**/api/admin/products?categoriesOnly=true',route=>{
      methods.push(route.request().method());
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({categories:[{id:'fixture-category',name:'Sentetik Kategori',slug:'fixture',isActive:true,sortOrder:0}]})});
    });
    await page.goto('/admin/kategoriler');
    await expect(page.getByText('Sentetik Kategori',{exact:true})).toBeVisible();
    expect(methods).toEqual(['GET']);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('category read failures are visible and do not reject unhandled',async({page})=>{
    await page.route('**/api/admin/products?categoriesOnly=true',route=>route.abort('connectionreset'));
    await page.goto('/admin/kategoriler');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/yüklenemedi|alınamadı/);
  });

  test('late category read after unmount leaves chosen product route intact',async({page})=>{
    let finish;
    const waiting=new Promise(r=>finish=r);
    await page.route('**/api/admin/products?categoriesOnly=true',async route=>{
      await waiting;
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({categories:[{id:'late',name:'Sentetik Geç Kategori',slug:'late',isActive:true,sortOrder:0}]})});
    });
    await page.goto('/admin/kategoriler');
    await expect(page.getByRole('heading',{name:'Kategoriler',exact:true})).toBeVisible();
    await page.evaluate(()=>{history.pushState({},'','/urunler');window.dispatchEvent(new PopStateEvent('popstate'))});
    finish();
    await expect(page.getByRole('heading',{level:1,name:'Sentetik Test Yüzüğü',exact:true})).toBeVisible();
    await expect(page).toHaveURL(/[/]urunler$/);
    await expect(page.getByText('Sentetik Geç Kategori',{exact:true})).toHaveCount(0);
  });
});

test.describe('independent review lifecycle regressions',()=>{
  const google=page=>page.getByRole('button',{name:/Google (ile Giriş Yap|açılıyor)/});
  const submit=page=>page.getByRole('button',{name:/^(Giriş Yap|Giriş yapılıyor)/});
  const restore=page=>page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));

  test('bfcache restores Google form only after persisted pageshow',async({page})=>{
    await page.goto('/giris');
    await page.evaluate(()=>window.__auth.mode='undefined');
    await google(page).click();
    await expect(google(page)).toBeDisabled();
    await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:false})));
    await expect(google(page)).toBeDisabled();
    await restore(page);
    await expect(google(page)).toBeEnabled();
    await expect(submit(page)).toBeEnabled();
    await expect(page.getByLabel('E-posta')).not.toHaveAttribute('readonly',/.*/);
  });

  test('late pre-restoration OAuth rejection cannot unlock a new credentials attempt',async({page})=>{
    await page.goto('/giris');
    await page.evaluate(()=>window.__auth.mode='pending');
    await google(page).click();
    await expect(google(page)).toBeDisabled();
    await restore(page);
    await expect(submit(page)).toBeEnabled();
    await page.getByLabel('E-posta').fill('synthetic@example.invalid');
    await page.getByLabel('Şifre').fill('fixture-only');
    await submit(page).click();
    await expect(submit(page)).toBeDisabled();
    await page.evaluate(()=>window.__auth.rejections[0](new Error('synthetic old OAuth rejection')));
    await page.evaluate(()=>new Promise(r=>setTimeout(r,0)));
    await expect(submit(page)).toBeDisabled();
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(await page.evaluate(()=>window.__auth.calls.map(c=>c.provider))).toEqual(['google','credentials']);
    await page.evaluate(()=>window.__auth.pending[1]({ok:true,status:200,error:null,url:null}));
    await expect.poll(()=>routerCalls(page)).toEqual([{method:'push',url:'/'},{method:'refresh'}]);
  });

  test('persisted pageshow never unlocks a pending credentials request',async({page})=>{
    await page.goto('/giris');
    await page.evaluate(()=>window.__auth.mode='pending');
    await page.getByLabel('E-posta').fill('synthetic@example.invalid');
    await page.getByLabel('Şifre').fill('fixture-only');
    await submit(page).click();
    await restore(page);
    await expect(submit(page)).toBeDisabled();
    expect(await page.evaluate(()=>window.__auth.calls.length)).toBe(1);
  });

  test('cart hydrates its own saved state without a Navbar boundary',async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('bycollection-cart',JSON.stringify({state:{items:[{productId:'standalone',name:'Sentetik Bağımsız Sepet',price:10,quantity:1,slug:'standalone'}]},version:0})));
    await page.goto('/sepet?no-nav=1');
    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('heading',{name:'Sepetim',exact:true})).toBeVisible();
    await expect(page.getByRole('link',{name:/Sentetik Bağımsız Sepet/})).toBeVisible();
  });

  test('other-tab localStorage.clear clears the header count and cart lines',async({page})=>{
    await page.goto('/urunler');
    await expect(pdp(page).add).toBeEnabled();
    await pdp(page).add.click();
    await expect(cartLink(page)).toHaveAccessibleName('Sepet, 1 ürün');
    await page.evaluate(()=>{localStorage.clear();window.dispatchEvent(new StorageEvent('storage',{key:null,storageArea:localStorage}))});
    await expect(cartLink(page)).toHaveAccessibleName('Sepet');
    expect(await cartQty(page)).toBe(0);
  });

  test('representability failure shows the exact store reason instead of a false success',async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('bycollection-cart',JSON.stringify({state:{items:[{productId:'large',name:'Sentetik Sınır',price:0,quantity:Number.MAX_SAFE_INTEGER,slug:'large'}]},version:1})));
    await page.goto('/urunler');
    await expect(pdp(page).add).toBeEnabled();
    await pdp(page).add.click();
    await expect(page.getByRole('alert')).toContainText('Sepet adedi veya tutarı');
    await expect(pdp(page).add).toHaveAccessibleName('Sepete Ekle');
  });
});

test.describe('enhanced hero DOM with a capability stub, no GPU claim',()=>{
  test('enhanced first phase matches the static first viewport geometry',async({page},ti)=>{
    await page.goto('/');
    const title=page.getByRole('heading',{level:1,name:'Işığı Keşfet'});
    const cta=page.getByRole('link',{name:'Koleksiyonu Keşfet',exact:true});
    const before={title:await title.boundingBox(),cta:await cta.boundingBox()};
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto('/?enhanced=1');
    await expect(page.locator('.hero-public')).toHaveAttribute('style',/height: 260vh/);
    await expect(title).toBeVisible();
    await expect(cta).toBeInViewport();
    const after={title:await title.boundingBox(),cta:await cta.boundingBox()};
    for(const element of ['title','cta'])for(const dimension of ['x','y','width','height'])expect(Math.abs(before[element][dimension]-after[element][dimension]),element+' '+dimension).toBeLessThanOrEqual(2);
    await expect(page.getByRole('link',{name:'Hikâyemiz',exact:true})).toBeVisible();
    await expect(page.locator('h1:visible')).toHaveCount(1);
    await page.screenshot({path:ti.outputPath('enhanced-first-phase.png')});
  });

  test('inactive enhanced phase links are inert and reduced motion returns static hero',async({page},ti)=>{
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto('/?enhanced=1');
    const hero=page.locator('.hero-public');
    await expect(hero).toHaveAttribute('style',/height: 260vh/);
    const initial=hero.locator('a').filter({hasText:'Koleksiyonu Keşfet'});
    await page.evaluate(()=>{const el=document.querySelector('.hero-public');window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.8,behavior:'instant'})});
    await expect(hero.getByRole('link',{name:'Alışverişe Başla',exact:true})).toBeVisible();
    await expect(initial).toHaveCount(1);
    expect(await initial.evaluate(el=>Boolean(el.closest('[inert]')))).toBe(true);
    await initial.evaluate(el=>el.focus());
    expect(await initial.evaluate(el=>el===document.activeElement)).toBe(false);
    await page.screenshot({path:ti.outputPath('enhanced-last-phase.png')});
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(hero).not.toHaveAttribute('style',/height: 260vh/);
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await expect(page.getByRole('link',{name:'Koleksiyonu Keşfet',exact:true})).toBeInViewport();
    await expect(page.locator('h1:visible')).toHaveCount(1);
  });
});
