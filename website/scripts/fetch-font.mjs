// 下载思源宋体（Source Han Serif SC，SIL OFL 1.1）到本地缓存目录，只用于渲染分享图（不会发布到网站）。
// Download Source Han Serif SC (OFL) from Adobe's official GitHub release into a cache dir.
// Used only to rasterize OG / X card images at build time - the website itself loads no web fonts.
//   node scripts/fetch-font.mjs          # idempotent; skips files that already exist
//   OG_FONT_DIR=/some/dir node scripts/fetch-font.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { FONT, fontDir } from '../lib/og-font.mjs';

const dir = fontDir();
const missing = FONT.files.filter((f) => !fs.existsSync(path.join(dir, f)));
if (!missing.length) { console.log(`✓ ${FONT.family} ${FONT.version} already in ${dir}`); process.exit(0); }

fs.mkdirSync(dir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shs-'));
const zip = path.join(tmp, FONT.asset);
console.log(`↓ ${FONT.url}`);
const res = await fetch(FONT.url);
if (!res.ok) throw new Error(`download failed: HTTP ${res.status} ${FONT.url}`);
fs.writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
// zip 内路径 / paths inside the release zip: OTF/SimplifiedChinese/SourceHanSerifSC-*.otf, LICENSE.txt
execFileSync('unzip', ['-o', '-j', '-q', zip, ...FONT.files.map((f) => `${FONT.zipDir}${f}`), 'LICENSE.txt', '-d', dir], { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
for (const f of FONT.files) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p) || fs.statSync(p).size < 1e6) throw new Error(`font file missing or truncated after extract: ${p}`);
}
console.log(`✓ ${FONT.family} ${FONT.version} → ${dir} (${FONT.files.join(', ')})`);
