// 构建产物校验 / validate dist/: internal links + anchors, JSON-LD, hreflang reciprocity,
// canonical, sitemap, OG images, and no Google Fonts hosts.
// Usage: npm run build && npm run check   (use the same SITE_URL / BASE_PATH as the build)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../site.config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [], warns = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist);
const htmls = files.filter((f) => f.endsWith('.html'));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

// URL path (under base) → dist file
function resolvePath(p) {
  if (!p.startsWith(site.base)) return null;
  let rel = decodeURIComponent(p.slice(site.base.length));
  let f = path.join(dist, rel);
  if (rel === '' || rel.endsWith('/')) f = path.join(f, 'index.html');
  return fs.existsSync(f) ? f : null;
}
const absToPath = (u) => (u.startsWith(site.url) ? site.base + u.slice(site.url.length) : null);
const ids = new Map();
const getIds = (f) => {
  if (!ids.has(f)) ids.set(f, new Set([...fs.readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(f);
};

const pages = new Map();
let linkCount = 0, ldCount = 0;
for (const f of htmls) {
  const html = fs.readFileSync(f, 'utf8');
  const relf = path.relative(dist, f);
  // links
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const raw = decode(m[1]);
    if (/^(https?:|mailto:|data:)/.test(raw)) {
      if (raw.startsWith(site.url) && !/<link rel="(canonical|alternate)"|og:|twitter:/.test(html.slice(Math.max(0, m.index - 60), m.index))) {
        // absolute link to own site inside body: check too
      }
      continue;
    }
    linkCount++;
    const [pq, hash] = raw.split('#'); const p = pq.split('?')[0];
    let target = f;
    if (p) {
      if (!p.startsWith('/')) { errors.push(`${relf}: relative link ${raw}`); continue; }
      target = resolvePath(p);
      if (!target) { errors.push(`${relf}: broken link ${raw}`); continue; }
    }
    if (hash && target.endsWith('.html') && !getIds(target).has(decodeURIComponent(hash))) errors.push(`${relf}: missing anchor #${hash} in ${path.relative(dist, target)}`);
  }
  // JSON-LD
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    ldCount++;
    try { const j = JSON.parse(m[1]); if (!j['@context']) errors.push(`${relf}: JSON-LD without @context`); }
    catch (e) { errors.push(`${relf}: JSON-LD parse error ${e.message}`); }
  }
  const isRedirect = /http-equiv="refresh"/.test(html);
  const noindex = /<meta name="robots" content="noindex">/.test(html);
  const alts = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => [m[1], m[2]]));
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  const lang = html.match(/<html lang="([^"]+)"/)?.[1];
  const og = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
  pages.set(f, { relf, alts, canonical, lang, isRedirect, noindex, og });
  // 分享卡片 meta（Open Graph + X）/ share-card meta
  if (!isRedirect && !noindex) {
    const mv = (attr, k) => html.match(new RegExp(`<meta ${attr}="${k.replace(/[:.]/g, '\\$&')}" content="([^"]*)">`))?.[1];
    const need = { 'og:site_name': ['property'], 'og:title': ['property'], 'og:description': ['property'], 'og:url': ['property'], 'og:locale': ['property'],
      'og:image': ['property'], 'og:image:width': ['property', '1200'], 'og:image:height': ['property', '630'], 'og:image:type': ['property', 'image/png'], 'og:image:alt': ['property'],
      'twitter:card': ['name', 'summary_large_image'], 'twitter:title': ['name'], 'twitter:description': ['name'], 'twitter:image': ['name'], 'twitter:image:alt': ['name'] };
    if (site.twitter) Object.assign(need, { 'twitter:site': ['name', site.twitter], 'twitter:creator': ['name', site.twitter] });
    for (const [k, [attr, want]] of Object.entries(need)) {
      const v = mv(attr, k);
      if (!v) errors.push(`${relf}: missing <meta ${attr}="${k}">`);
      else if (want && v !== want) errors.push(`${relf}: ${k}="${v}" (expected ${want})`);
    }
    for (const k of ['og:image', 'twitter:image']) { const v = mv(k.startsWith('og') ? 'property' : 'name', k); if (v && !/^https:\/\//.test(v) && site.url.startsWith('https:')) errors.push(`${relf}: ${k} not absolute https`); }
    if (mv('property', 'og:image') !== mv('name', 'twitter:image')) errors.push(`${relf}: og:image != twitter:image`);
  }
}

// hreflang + canonical
let hreflangPages = 0;
for (const [f, p] of pages) {
  if (p.isRedirect || p.noindex) continue;
  hreflangPages++;
  if (!p.canonical) { errors.push(`${p.relf}: no canonical`); continue; }
  if (resolvePath(absToPath(p.canonical) || '') !== f) errors.push(`${p.relf}: canonical ${p.canonical} is not self`);
  if (!p.alts[p.lang]) errors.push(`${p.relf}: no self hreflang for ${p.lang}`);
  else if (p.alts[p.lang] !== p.canonical) errors.push(`${p.relf}: self hreflang != canonical`);
  if (!p.alts['x-default']) errors.push(`${p.relf}: no x-default`);
  if (Object.keys(p.alts).length < 3) warns.push(`${p.relf}: only ${Object.keys(p.alts).join(', ')} (single-language page)`);
  for (const [hl, u] of Object.entries(p.alts)) {
    const tf = resolvePath(absToPath(u) || '');
    if (!tf) { errors.push(`${p.relf}: hreflang ${hl} → missing ${u}`); continue; }
    const tp = pages.get(tf);
    if (JSON.stringify(Object.entries(tp.alts).sort()) !== JSON.stringify(Object.entries(p.alts).sort())) errors.push(`${p.relf}: hreflang set differs from ${tp.relf}`);
  }
  if (p.og) { const op = absToPath(p.og); if (!op || !fs.existsSync(path.join(dist, op.slice(site.base.length)))) warns.push(`${p.relf}: og:image not rendered yet (${p.og}) - run npm run og`); }
}

// sitemap
const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const u of locs) if (!resolvePath(absToPath(u) || '')) errors.push(`sitemap: missing ${u}`);
for (const u of [...sm.matchAll(/hreflang="[^"]+" href="([^"]+)"/g)].map((m) => m[1])) if (!resolvePath(absToPath(u) || '')) errors.push(`sitemap alternate: missing ${u}`);

// 分享图 PNG：1200×630，远小于 X 的 5MB 上限（目标 < 300KB）/ OG PNGs: 1200×630, well under X's 5MB limit
const ogDir = path.join(dist, 'og');
let ogCount = 0, ogMax = 0;
if (fs.existsSync(ogDir)) for (const f of fs.readdirSync(ogDir).filter((x) => x.endsWith('.png'))) {
  const buf = fs.readFileSync(path.join(ogDir, f)); ogCount++; ogMax = Math.max(ogMax, buf.length);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  if (w !== 1200 || h !== 630) errors.push(`og/${f}: ${w}×${h}, expected 1200×630`);
  if (buf.length > 5 * 1024 * 1024) errors.push(`og/${f}: ${buf.length} bytes exceeds 5MB`);
  else if (buf.length > 300 * 1024) warns.push(`og/${f}: ${(buf.length / 1024).toFixed(0)} KB (target < 300 KB)`);
}

// 站点页面不加载任何 web 字体 / site pages load no web fonts
for (const f of walk(dist).filter((x) => /\.(html|css)$/.test(x))) {
  const txt = fs.readFileSync(f, 'utf8');
  if (/@font-face|\.(woff2?|otf|ttf)\b/i.test(txt)) errors.push(`${path.relative(dist, f)}: web font reference found (site pages must not load web fonts)`);
}

// required files
for (const r of ['robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'zh/llms.txt', 'zh/llms-full.txt', 'zh/404.html', 'feed.xml', 'zh/feed.xml', '404.html', '.nojekyll', 'CNAME']) if (!fs.existsSync(path.join(dist, r))) errors.push(`missing ${r}`);

// Google Fonts grep (dist + source). Pattern is assembled so this file does not match itself.
const GF = new RegExp(['google' + 'apis', 'g' + 'static'].join('|'));
const src = walk(root).filter((f) => !/node_modules|\/dist\/|\.og-cache/.test(f) && /\.(mjs|js|css|html|md|json|yml|txt|svg)$/.test(f));
const gf = [...files, ...src].filter((f) => /\.(html|css|js|mjs|md|txt|xml|svg|json)$/.test(f) && GF.test(fs.readFileSync(f, 'utf8')));
if (gf.length) errors.push(`Google Fonts hosts found in: ${gf.join(', ')}`);

console.log(`pages: ${htmls.length} html (${hreflangPages} indexable) · internal links checked: ${linkCount} · JSON-LD blocks: ${ldCount} · sitemap urls: ${locs.length} · Google-Fonts-host hits: ${gf.length} · OG PNGs: ${ogCount} (max ${(ogMax / 1024).toFixed(0)} KB)`);
warns.forEach((w) => console.log('  warn:', w));
if (errors.length) { errors.forEach((e) => console.log('  ERROR:', e)); process.exit(1); }
console.log('✓ all checks passed');
