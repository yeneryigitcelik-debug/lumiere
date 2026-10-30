// Usage: node capture.mjs --bundle <generated-dir> --out <screenshot-dir> [--prefix name- | name-]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { startFixtureServer } from './serve.mjs';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf('--' + n); return i < 0 ? null : argv[i + 1]; };
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const bundle = flag('bundle');
const out = flag('out');
const prefix = flag('prefix') ?? positional[0] ?? '';
if (!bundle || !out) throw new Error('--bundle and --out are required');
if (!/^[A-Za-z0-9._-]*$/.test(prefix)) throw new Error('Prefix may only contain letters, digits, dot, dash, underscore');
fs.mkdirSync(path.resolve(out), { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
];

const srv = await startFixtureServer({ bundle: path.resolve(bundle), port: 0 });
const origin = new URL(srv.url).origin;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: vp.viewport, reducedMotion: 'reduce', serviceWorkers: 'block', locale: 'tr-TR' });
    await context.route('**/*', (r) => (new URL(r.request().url()).origin === origin ? r.continue() : r.abort('blockedbyclient')));
    await context.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...a) { return /webgl/i.test(String(type)) ? null : orig.call(this, type, ...a); };
    });
    const page = await context.newPage();
    const shot = (n) => page.screenshot({ path: path.join(path.resolve(out), `${prefix}${n}-${vp.name}.png`) });
    const settle = () => page.waitForTimeout(400); // visual settle only

    await page.goto(srv.url + '/', { waitUntil: 'commit' });
    await page.waitForTimeout(200);
    await shot('first200ms');
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    await settle();
    await shot('home');
    if (vp.name === 'mobile') {
      await page.getByRole('button', { name: 'Menüyü aç' }).click();
      await settle();
      await shot('menu');
      await page.keyboard.press('Escape');
    }
    await page.goto(srv.url + '/urunler');
    await page.getByRole('heading', { level: 1, name: 'Sentetik Test Yüzüğü' }).waitFor();
    await settle();
    await shot('product');
    await page.waitForFunction(() => window.fixture?.store.getState().hasHydrated);
    await page.evaluate(() => window.fixture.store.getState().addItem({ productId: 'synthetic-ring', name: 'Sentetik Test Yüzüğü', price: 1200, slug: 'sentetik-test-yuzugu', categorySlug: 'yuzukler', quantity: 1 }));
    await page.goto(srv.url + '/sepet');
    await page.getByRole('heading', { level: 1, name: 'Sepetim' }).waitFor();
    await settle();
    await shot('cart');
    await page.goto(srv.url + '/giris');
    await page.getByRole('heading', { level: 1, name: 'Giriş Yap' }).waitFor();
    await settle();
    await shot('login');
    await context.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
console.log('Synthetic UI screenshots written to', path.resolve(out));
