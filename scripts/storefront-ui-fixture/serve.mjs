// Loopback-only static server for the generated synthetic UI fixture.
// Serves ONLY index.html, app.js and styles.css from the generated bundle (read into memory once).
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const HOST = '127.0.0.1';
const ASSETS = {
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
};
// SPA routes: plain ASCII segments, no dots (so no traversal, no file lookups).
const ROUTE = /^[/](?:[A-Za-z0-9_-]+[/]?)*$/;
const BASE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export function loadBundle(dir) {
  const abs = path.resolve(dir);
  const files = {};
  for (const name of ['index.html', 'app.js', 'styles.css']) {
    const p = path.join(abs, name);
    const st = fs.lstatSync(p);
    if (!st.isFile()) throw new Error(`Bundle file is not a regular file: ${name}`);
    files[name] = fs.readFileSync(p);
  }
  return files;
}

export function buildBundle() {
  const out = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'lumiere-ui-fixture-'));
  const r = spawnSync(process.execPath, [path.join(here, 'build.mjs'), '--source', repoRoot, '--out', out], { stdio: 'inherit' });
  if (r.status !== 0) {
    fs.rmSync(out, { recursive: true, force: true });
    throw new Error('Synthetic fixture build failed');
  }
  return out;
}

export function startFixtureServer({ bundle, port = 0 }) {
  const files = loadBundle(bundle);
  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...BASE_HEADERS, Allow: 'GET, HEAD' });
      return res.end();
    }
    let pathname;
    try {
      pathname = new URL(req.url, `http://${HOST}`).pathname;
    } catch {
      res.writeHead(400, BASE_HEADERS);
      return res.end();
    }
    let body;
    let type;
    if (Object.hasOwn(ASSETS, pathname)) {
      [body, type] = [files[ASSETS[pathname][0]], ASSETS[pathname][1]];
    } else if (ROUTE.test(pathname)) {
      [body, type] = [files['index.html'], 'text/html; charset=utf-8'];
    } else {
      res.writeHead(404, { ...BASE_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(200, { ...BASE_HEADERS, 'Content-Type': type, 'Content-Length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, HOST, () => {
      const actual = server.address().port;
      resolve({
        server,
        url: `http://${HOST}:${actual}`,
        close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(() => r()); }),
      });
    });
  });
}

const isMain = !!process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  const i = process.argv.indexOf('--bundle');
  const given = i >= 0 ? process.argv[i + 1] : null;
  const port = Number(process.env.LUMIERE_UI_PORT || 65447);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid LUMIERE_UI_PORT');
  const owned = !given;
  const bundle = given ? path.resolve(given) : buildBundle();
  const cleanupDir = () => { if (owned) { try { fs.rmSync(bundle, { recursive: true, force: true }); } catch {} } };
  let srv;
  try {
    srv = await startFixtureServer({ bundle, port });
  } catch (e) {
    cleanupDir();
    throw e;
  }
  console.log(`Synthetic UI fixture on ${srv.url}`);
  let done = false;
  const shutdown = async () => {
    if (done) return;
    done = true;
    await srv.close();
    cleanupDir();
    process.exit(0);
  };
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, shutdown);
  process.on('exit', () => { if (!done) cleanupDir(); });
}
