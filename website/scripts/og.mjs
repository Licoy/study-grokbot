// 把 dist/og/*.svg 渲染成 1200×630 PNG（Open Graph / Twitter 卡片用），并缓存到 .og-cache/。
// Rasterize dist/og/*.svg to PNG with headless Chromium. Run after `npm run build`.
// CI: npx playwright install --with-deps chromium && sudo apt-get install -y fonts-noto-cjk
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'dist', 'og');
const cache = path.join(root, '.og-cache');
fs.mkdirSync(cache, { recursive: true });
const svgs = fs.readdirSync(dir).filter((f) => f.endsWith('.svg'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const f of svgs) {
  const svg = fs.readFileSync(path.join(dir, f), 'utf8');
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#0a0a0a">${svg}</body></html>`);
  const out = path.join(dir, f.replace(/\.svg$/, '.png'));
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  fs.copyFileSync(out, path.join(cache, path.basename(out)));
  console.log('✓', path.relative(root, out));
}
await browser.close();
