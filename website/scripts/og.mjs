// 用思源黑体（Source Han Sans SC）把分享图 spec 渲染成 1200×630 PNG，写入 dist/og/ 并缓存到 .og-cache/。
// Render the share-card specs written by build.mjs into 1200×630 PNGs with Source Han Sans SC.
// Build-time only: the website itself never loads a web font. Run after `npm run build` (and `npm run font`).
// Fails loudly if the font files are missing or if any text falls back to another font.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { FONT, fontDir } from '../lib/og-font.mjs';
import { ogHtml, specHash, OG_W, OG_H, OG_FAMILY } from '../lib/og.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.og-cache');
const outDir = path.join(root, 'dist', 'og');
const die = (msg) => { console.error(`✗ og: ${msg}`); process.exit(1); };

const specsFile = path.join(cache, 'specs.json');
if (!fs.existsSync(specsFile)) die('missing .og-cache/specs.json - run `npm run build` first');
const specs = JSON.parse(fs.readFileSync(specsFile, 'utf8'));

// 1) 字体必须就位 / the font must be present
const dir = fontDir();
const fonts = {};
for (const [w, file] of Object.entries(FONT.weights)) {
  const p = path.join(dir, file);
  if (!fs.existsSync(p) || fs.statSync(p).size < 1e6) die(`${FONT.family} ${file} not found in ${dir}\n  run \`npm run font\` (downloads ${FONT.url}) or set OG_FONT_DIR`);
  fonts[w] = p;
}

// 2) 通过假 https 源提供字体文件，避免 file:// 限制 / serve the font files from a fake https origin
const ORIGIN = 'https://og.local/';
const fontUrls = Object.fromEntries(Object.entries(fonts).map(([w, p]) => [w, `${ORIGIN}fonts/${path.basename(p)}`]));
const byUrl = Object.fromEntries(Object.entries(fonts).map(([w, p]) => [`${ORIGIN}fonts/${path.basename(p)}`, p]));

fs.mkdirSync(outDir, { recursive: true });
// 优先用 Playwright 自带的 Chromium；没装（npx playwright install chromium）时退回本机的 Google Chrome
// Prefer Playwright's bundled Chromium; fall back to the installed Google Chrome when it isn't downloaded
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const page = await browser.newPage({ viewport: { width: OG_W, height: OG_H }, deviceScaleFactor: 1 });
let current = '';
await page.route(`${ORIGIN}**`, (route) => {
  const u = route.request().url().split('?')[0];
  if (u === ORIGIN || u === `${ORIGIN}index.html`) return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: current });
  if (byUrl[u]) return route.fulfill({ status: 200, contentType: 'font/otf', body: fs.readFileSync(byUrl[u]) });
  return route.fulfill({ status: 404, body: '' });
});
const cdp = await page.context().newCDPSession(page);
await cdp.send('DOM.enable'); await cdp.send('CSS.enable');

let failed = 0;
for (const [name, spec] of Object.entries(specs)) {
  current = ogHtml(spec, fontUrls);
  await page.goto(ORIGIN, { waitUntil: 'load' });
  // 等字体真正加载 / wait for every weight to actually load
  const loaded = await page.evaluate(async ([weights, family]) => {
    await Promise.all(weights.map((w) => document.fonts.load(`${w} 40px "${family}"`, '学GrokBot')));
    await document.fonts.ready;
    return [...document.fonts].map((f) => `${f.weight}:${f.status}`);
  }, [Object.keys(fontUrls), OG_FAMILY]);
  if (loaded.some((s) => !s.endsWith(':loaded'))) die(`${name}: font faces not loaded (${loaded.join(', ')})`);
  const fit = await page.evaluate(() => window.fitTitle());
  if (fit.overflow) die(`${name}: title does not fit (size ${fit.size}px)`);

  // 3) 用 CDP 校验每个文字节点实际使用的字体 / verify the platform fonts actually used per text node
  const { root: doc } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: doc.nodeId, selector: '[data-t]' });
  const used = new Map();
  for (const id of nodeIds) {
    const { fonts: pf } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: id });
    for (const f of pf) {
      const key = `${f.familyName}|${f.postScriptName || ''}`;
      used.set(key, (used.get(key) || 0) + f.glyphCount);
      const ok = (f.postScriptName || '').startsWith(FONT.postScriptPrefix) && f.familyName.startsWith(FONT.family) && f.isCustomFont !== false;
      if (!ok) { console.error(`✗ og: ${name}: fallback font "${f.familyName}" (${f.postScriptName}) used for ${f.glyphCount} glyphs`); failed++; }
    }
  }
  if (!used.size) die(`${name}: no text nodes checked`);

  const out = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: OG_W, height: OG_H } });
  fs.copyFileSync(out, path.join(cache, `${name}.png`));
  fs.writeFileSync(path.join(cache, `${name}.hash`), specHash(spec));
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`✓ ${path.relative(root, out)}  ${kb} KB  title ${fit.size}px/${fit.lines} lines  fonts: ${[...used].map(([k, n]) => `${k.split('|')[1] || k.split('|')[0]}×${n}`).join(', ')}`);
}
await browser.close();
if (failed) die(`${failed} text run(s) did not use ${FONT.family}`);
