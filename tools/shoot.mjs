// Screenshots: theme follows emulated prefers-color-scheme (Auto mode), language via locale.
import { chromium } from 'playwright';
const base = process.env.URL || 'http://localhost:4173';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
const out = process.env.OUT || fileURLToPath(new URL('../screenshots/', import.meta.url));
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
async function shot(path, file, { width = 1440, height = 900, mobile = false, scheme, locale }) {
  const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, colorScheme: scheme, locale });
  const p = await ctx.newPage();
  const external = [];
  p.on('request', (r) => { if (!r.url().startsWith(base)) external.push(r.url()); });
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 400) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(60); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/${file}`, fullPage: true });
  const info = await p.evaluate(() => ({ url: location.pathname, lang: document.documentElement.lang, theme: document.documentElement.dataset.theme, pref: document.documentElement.dataset.themePref, scrollW: document.documentElement.scrollWidth, font: getComputedStyle(document.querySelector('h1')).fontFamily.slice(0, 40) }));
  console.log(file, JSON.stringify(info), 'external:', external.length);
  await ctx.close();
}
await shot('/', 'home-en-dark-1440.png', { scheme: 'dark', locale: 'en-US' });
await shot('/', 'home-en-light-1440.png', { scheme: 'light', locale: 'en-US' });
await shot('/zh/', 'home-zh-dark-1440.png', { scheme: 'dark', locale: 'zh-CN' });
await shot('/issues/2026-11-01/', 'issue-en-light-1440.png', { scheme: 'light', locale: 'en-US' });
await shot('/zh/issues/2026-11-01/', 'issue-zh-dark-1440.png', { scheme: 'dark', locale: 'zh-CN' });
await shot('/zh/', 'home-zh-light-mobile-390.png', { width: 390, height: 844, mobile: true, scheme: 'light', locale: 'zh-CN' });
await b.close();
