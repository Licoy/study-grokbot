// 图标：全站统一使用 Remix Icon（https://remixicon.com/，Apache-2.0），构建时从 npm 包读取 SVG 并内联，不加载图标字体、不发任何外部请求。
// Icons: Remix Icon only (https://remixicon.com/, Apache-2.0). SVGs are read from the npm package at build time
// and inlined - no icon font, no external request.
//
// 用法 / usage:  ri('arrow-right-line')  →  <svg class="ri ri-arrow-right-line" ...>
// 名字就是 remixicon.com 上的图标名（不带 "ri-" 前缀）；写错名字会直接让构建失败。
// The name is the one shown on remixicon.com (without the "ri-" prefix); an unknown name fails the build.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const dir = path.join(path.dirname(createRequire(import.meta.url).resolve('remixicon/package.json')), 'icons');
const files = new Map();
for (const cat of fs.readdirSync(dir)) {
  const d = path.join(dir, cat);
  if (fs.statSync(d).isDirectory()) for (const f of fs.readdirSync(d)) if (f.endsWith('.svg')) files.set(f.slice(0, -4), path.join(d, f));
}

const cache = new Map();
export function ri(name) {
  if (!cache.has(name)) {
    const file = files.get(name);
    if (!file) throw new Error(`Remix Icon "${name}" not found - check the name on https://remixicon.com/`);
    const inner = fs.readFileSync(file, 'utf8').replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '');
    cache.set(name, `<svg class="ri ri-${name}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${inner}</svg>`);
  }
  return cache.get(name);
}
