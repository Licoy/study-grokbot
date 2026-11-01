// 自制 Open Graph 图（SVG，1200×630）。scripts/og.mjs 会把它们转成 PNG。
// Self-made Open Graph images as SVG; scripts/og.mjs rasterizes them to PNG.
import { esc } from './markdown.mjs';

const SERIF = `'Iowan Old Style','Palatino Linotype',Georgia,'Times New Roman','Songti SC','STSong','Noto Serif CJK SC','Source Han Serif SC','SimSun',serif`;

// 粗略按字宽折行：CJK≈1em，拉丁≈0.55em
function wrap(text, maxEm, maxLines) {
  const lines = []; let cur = ''; let w = 0;
  const tokens = text.match(/[\u2e80-\u9fff\uff00-\uffef《》：，。]|[^\s\u2e80-\u9fff\uff00-\uffef《》：，。]+|\s+/g) || [];
  for (const tok of tokens) {
    const tw = /^[\u2e80-\u9fff\uff00-\uffef《》：，。]$/.test(tok) ? 1 : tok.length * 0.62;
    if (w + tw > maxEm && cur.trim()) { lines.push(cur.trim()); cur = ''; w = 0; if (/^\s+$/.test(tok)) continue; }
    cur += tok; w += tw;
  }
  if (cur.trim()) lines.push(cur.trim());
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.{1}$/, '') + '…'; }
  return lines;
}

export function ogSvg({ kicker, title, sub, footer }) {
  const titleLines = wrap(title, 15.5, 3);
  const size = titleLines.length > 2 ? 60 : 68;
  const startY = 285;
  const subLines = sub ? wrap(sub, 38, 2) : [];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <radialGradient id="g" cx="78%" cy="0%" r="70%"><stop offset="0" stop-color="#ff6a08" stop-opacity=".35"/><stop offset="1" stop-color="#ff6a08" stop-opacity="0"/></radialGradient>
  <linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#ffe2c8"/><stop offset="1" stop-color="#ff6a08"/></linearGradient>
</defs>
<rect width="1200" height="630" fill="#0a0a0a"/>
<rect width="1200" height="630" fill="url(#g)"/>
<rect x="40" y="40" width="1120" height="550" rx="36" fill="none" stroke="#ffffff" stroke-opacity=".08"/>
<g transform="translate(88 84)">
  <rect width="48" height="48" rx="14" fill="#fff"/>
  <path d="M12 15.3c4-1.5 8-1 12 1.6 4-2.6 8-3.1 12-1.6v17.4c-4-1.5-8-1-12 1.6-4-2.6-8-3.1-12-1.6Z" fill="none" stroke="#0a0a0a" stroke-width="3" stroke-linejoin="round"/><path d="M24 17v17.4" stroke="#0a0a0a" stroke-width="3"/>
  <text x="66" y="34" font-family="${SERIF}" font-size="30" font-weight="600" fill="#fff">Study GrokBot</text>
</g>
<text x="88" y="${startY - 95}" font-family="${SERIF}" font-size="26" fill="url(#t)" font-weight="600">${esc(kicker)}</text>
${titleLines.map((l, i) => `<text x="88" y="${startY + i * size * 1.18}" font-family="${SERIF}" font-size="${size}" font-weight="600" fill="#ffffff">${esc(l)}</text>`).join('\n')}
${subLines.map((l, i) => `<text x="88" y="${startY + titleLines.length * size * 1.18 + 28 + i * 38}" font-family="${SERIF}" font-size="27" fill="#a9b1bc">${esc(l)}</text>`).join('\n')}
<text x="88" y="552" font-family="${SERIF}" font-size="22" fill="#7f838b">${esc(footer)}</text>
</svg>`;
}
