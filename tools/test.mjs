// Behaviour tests: first-visit language redirect, manual override, crawler bypass, theme toggle, external requests.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const base = process.env.URL || 'http://localhost:4173';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const b = await chromium.launch();
let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) fails++; };
const ctxFor = (o = {}) => b.newContext({ userAgent: UA, ...o });
const landed = async (ctx, url) => { const p = await ctx.newPage(); await p.goto(base + url, { waitUntil: 'networkidle' }); const r = new URL(p.url()).pathname; return [p, r]; };

let c, p, r;
c = await ctxFor({ locale: 'zh-CN' }); [p, r] = await landed(c, '/'); ok(r === '/zh/', `zh-CN first visit / → ${r}`);
ok(await p.evaluate(() => localStorage.getItem('sg-lang')) === 'zh', 'zh preference saved');
[, r] = await landed(c, '/issues/2026-11-01/'); ok(r === '/zh/issues/2026-11-01/', `zh-CN deep link → ${r}`);
// manual switch to English sticks
await p.click('.nav-cta [data-set-lang="en"]'); await p.waitForLoadState('networkidle');
ok(new URL(p.url()).pathname === '/', `click EN switch → ${new URL(p.url()).pathname}`);
await p.reload({ waitUntil: 'networkidle' }); ok(new URL(p.url()).pathname === '/', 'reload after manual EN stays on /');
[, r] = await landed(c, '/archive/'); ok(r === '/archive/', `later visit /archive/ stays English → ${r}`);
await c.close();

for (const loc of ['zh-TW', 'zh-HK', 'zh-SG']) { c = await ctxFor({ locale: loc }); [, r] = await landed(c, '/'); ok(r === '/zh/', `${loc} first visit → ${r}`); await c.close(); }
c = await ctxFor({ locale: 'en-US' }); [p, r] = await landed(c, '/'); ok(r === '/', `en-US first visit stays → ${r}`);
ok(await p.evaluate(() => localStorage.getItem('sg-lang')) === 'en', 'en preference saved');
[, r] = await landed(c, '/zh/'); ok(r === '/zh/', 'en-US can open /zh/ directly (no reverse redirect)');
await c.close();
c = await ctxFor({ locale: 'ja-JP' }); [, r] = await landed(c, '/'); ok(r === '/', `ja-JP stays on English default → ${r}`); await c.close();
c = await ctxFor({ locale: 'en-US' }); await c.addInitScript(() => { if (!localStorage.getItem('sg-lang')) localStorage.setItem('sg-lang', 'zh'); });
[, r] = await landed(c, '/guide/faq/'); ok(r === '/zh/guide/faq/', `saved zh preference on en-US browser → ${r}`); await c.close();
for (const ua of ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)', 'Mozilla/5.0 (compatible; Baiduspider/2.0)']) {
  c = await b.newContext({ locale: 'zh-CN', userAgent: ua }); [, r] = await landed(c, '/'); ok(r === '/', `crawler not redirected (${ua.match(/(Googlebot|GPTBot|Baiduspider)/)[1]}) → ${r}`); await c.close();
}

// theme
c = await ctxFor({ locale: 'en-US', colorScheme: 'light' }); [p] = await landed(c, '/');
ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'light', 'auto + OS light → light');
await p.click('.nav-cta [data-theme-set="dark"]');
ok(await p.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('sg-theme'), [...document.querySelectorAll('meta[name=theme-color]')].map((m) => m.content).join()].join('|')) === 'dark|dark|#0a0a0a,#0a0a0a', 'manual Dark applied, saved, theme-color updated');
await p.reload(); ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'dark persists after reload (applied by head script)');
await p.emulateMedia({ colorScheme: 'dark' }); await p.click('.nav-cta [data-theme-set="auto"]');
ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'Auto follows OS dark');
await p.emulateMedia({ colorScheme: 'light' }); await p.waitForTimeout(100);
ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'light', 'Auto reacts live to OS switch to light');
const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor); ok(bg === 'rgb(255, 255, 255)', `light background ${bg}`);
await c.close();

// external requests on every page
const dist = new URL('../website/dist/', import.meta.url).pathname;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const pages = walk(dist).filter((f) => f.endsWith('index.html') && !f.includes('/latest/')).map((f) => '/' + path.relative(dist, f).replace(/index\.html$/, ''));
let ext = [];
for (const scheme of ['light', 'dark']) {
  c = await ctxFor({ locale: 'en-US', colorScheme: scheme });
  await c.addInitScript(() => localStorage.setItem('sg-lang', 'en'));
  for (const u of pages) { const pg = await c.newPage(); pg.on('request', (q) => { if (!q.url().startsWith(base)) ext.push(q.url()); }); await pg.goto(base + u, { waitUntil: 'networkidle' }); await pg.close(); }
  await c.close();
}
ok(ext.length === 0, `external requests across ${pages.length} pages × 2 themes: ${ext.length}${ext.length ? ' ' + ext.slice(0, 5).join(' ') : ''}`);
await b.close();
console.log(fails ? `${fails} failed` : 'all passed');
process.exit(fails ? 1 : 0);
