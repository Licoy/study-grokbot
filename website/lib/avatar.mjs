// Bot 头像规范（全站统一）/ Bot avatar spec - the single source of truth for every bot depicted on the site.
//
// 风格参考 GrokBot 的头像选择器，但全部由这里的 SVG 代码绘制（不使用任何官方图片素材）：
// Style follows GrokBot's avatar picker, recreated from scratch as SVG (no official assets are used):
//   头像 = 调色板中的 1 种纯色 × 1 种“团子”形状 × 右上方两只白色竖椭圆眼睛 + 柔和高光
//   avatar = one palette color × one blob shape × two white vertical-oval eyes (upper right) + soft gloss
//
// 分配规则 / assignment:
//   - 同一个 Bot 的中英文名字映射到同一个 key（BOT_KEYS），所以两种语言里头像一致。
//     Both language names of a bot map to one key (BOT_KEYS) so the avatar matches across languages.
//   - key 的哈希（FNV-1a）决定颜色和形状：结果是“随机”的，但每次构建都一样。
//     The FNV-1a hash of the key picks color and shape: random-looking but stable across builds.
//   - 同一组 Bot（lineup）内颜色、形状都不重复：冲突时按固定顺序往后找下一个空位。
//     Within a lineup no color or shape repeats: collisions probe forward deterministically.

export const PALETTE = [
  { id: 'black', hex: '#141414' },
  { id: 'brown', hex: '#8f5f37' },
  { id: 'red', hex: '#ff2d46' },
  { id: 'orange-red', hex: '#ff6414' },
  { id: 'orange', hex: '#ff9f0a' },
  { id: 'green', hex: '#08c46e' },
  { id: 'teal', hex: '#00b8a3' },
  { id: 'blue', hex: '#0a84ff' },
  { id: 'purple', hex: '#9b5cff' },
  { id: 'pink', hex: '#ff3aa3' },
  { id: 'gray', hex: '#767676' },
];

// ---------- 形状 / shapes (viewBox 0 0 100 100) ----------
const f = (n) => +n.toFixed(2);
// 圆角多边形：在每个顶点用二次曲线倒角 / rounded polygon: a quadratic curve at every vertex
function roundedPoly(pts, r) {
  const n = pts.length; let d = '';
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[(i - 1 + n) % n], [cx, cy] = pts[i], [nx, ny] = pts[(i + 1) % n];
    const l1 = Math.hypot(px - cx, py - cy), l2 = Math.hypot(nx - cx, ny - cy);
    const r1 = Math.min(r, l1 / 2), r2 = Math.min(r, l2 / 2);
    const a = [cx + (px - cx) * r1 / l1, cy + (py - cy) * r1 / l1], b = [cx + (nx - cx) * r2 / l2, cy + (ny - cy) * r2 / l2];
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(cx)} ${f(cy)} ${f(b[0])} ${f(b[1])}`;
  }
  return d + 'Z';
}
const star = (k, ro, ri, rot = -90, cx = 50, cy = 50) => Array.from({ length: k * 2 }, (_, i) => {
  const a = (rot + i * 180 / k) * Math.PI / 180, r = i % 2 ? ri : ro;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
const ngon = (k, r, rot = -90, cx = 50, cy = 50) => Array.from({ length: k }, (_, i) => {
  const a = (rot + i * 360 / k) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
const circles = (list) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
const path = (d, t = '') => `<path d="${d}"${t ? ` transform="${t}"` : ''}/>`;

// eyes: [cx, cy] of the eye pair center, tilt in degrees; s = eye scale
export const SHAPES = [
  { id: 'orb', body: '<circle cx="50" cy="50" r="41"/>', eyes: [58, 40, 12] },
  { id: 'cloud', body: circles([[33, 56, 20], [50, 40, 22], [68, 52, 20], [50, 62, 20]]), eyes: [58, 47, 8] },
  { id: 'tilted-square', body: path(roundedPoly([[17, 22], [80, 13], [87, 78], [22, 87]], 16)), eyes: [56, 48, -6] },
  { id: 'star4', body: path(roundedPoly(star(4, 46, 23, -90), 12), 'rotate(8 50 50)'), eyes: [55, 47, 10] },
  { id: 'puffy', body: circles([[36, 38, 18], [62, 36, 18], [66, 60, 18], [40, 64, 18], [50, 50, 20]]), eyes: [58, 46, 8] },
  { id: 'heart', body: path('M50 84C30 74 12 60 13 42 14 28 24 18 37 18 44 18 48 22 50 26 52 22 58 17 66 17 80 17 89 30 87 45 85 62 68 76 50 84Z', 'rotate(-12 50 50)'), eyes: [56, 44, 0] },
  { id: 'flower', body: circles([...ngon(6, 24, -90).map(([x, y]) => [f(x), f(y), 15]), [50, 50, 24]]), eyes: [57, 46, 6] },
  { id: 'drop', body: path('M50 12C58 26 82 44 82 62 82 79 68 90 50 90 32 90 18 79 18 62 18 44 42 26 50 12Z', 'rotate(-18 50 52)'), eyes: [57, 56, -8] },
  { id: 'pill', body: '<rect x="12" y="30" width="76" height="42" rx="21" transform="rotate(-8 50 51)"/>', eyes: [60, 48, -4] },
  { id: 'triangle', body: path(roundedPoly([[28, 12], [93, 72], [9, 88]], 15)), eyes: [47, 60, 8] },
  { id: 'rounded-square', body: path(roundedPoly([[20, 20], [80, 20], [80, 80], [20, 80]], 18), 'rotate(10 50 50)'), eyes: [56, 46, 8] },
  { id: 'star6', body: path(roundedPoly(star(6, 45, 30, -90), 9)), eyes: [56, 46, 6] },
  { id: 'hexagon', body: path(roundedPoly(ngon(6, 43, 0), 7), 'rotate(-10 50 50)'), eyes: [56, 46, -6] },
  { id: 'apple', body: path('M50 30C58 22 74 22 82 34 90 46 86 66 76 78 70 86 62 88 56 86 52 85 48 85 44 86 38 88 30 86 24 78 14 66 10 46 18 34 26 22 42 22 50 30Z'),
    extra: '<path d="M50 30C49 22 51 14 58 9" fill="none" stroke="#2b2b2b" stroke-width="4.5" stroke-linecap="round"/>', eyes: [58, 52, 8] },
];

// 中英文名字 → 同一个 key / both language names → one stable key
export const BOT_KEYS = {
  'Research Bot': 'research', 资料研究员: 'research',
  'Writer Bot': 'writer', 撰稿人: 'writer',
  'Reviewer Bot': 'reviewer', 审稿人: 'reviewer',
  'Planner Bot': 'planner', 规划师: 'planner',
  'Builder Bot': 'builder', 构建师: 'builder',
};
// 示例阵容（这几个 Bot 经常一起出现，保证彼此不重复）/ the example lineup - kept collision-free
export const LINEUP = ['research', 'writer', 'reviewer', 'planner', 'builder'];

export const botKey = (name) => BOT_KEYS[String(name).trim()] || String(name).trim().toLowerCase();
export const isKnownBot = (name) => Object.hasOwn(BOT_KEYS, String(name).trim());

function fnv1a(s) {
  let h = 0x811c9dc5;
  for (const ch of new TextEncoder().encode(s)) { h ^= ch; h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

// 单个 key 的“原始”选择 / raw pick for one key
export function rawPick(key) {
  const h = fnv1a(key);
  return { color: h % PALETTE.length, shape: (Math.floor(h / PALETTE.length) >>> 0) % SHAPES.length };
}

// 一组 key 依次分配，颜色和形状都不重复 / assign a lineup in order with no repeated color or shape
export function assignLineup(keys) {
  const usedC = new Set(), usedS = new Set(), out = {};
  for (const k of keys) {
    let { color, shape } = rawPick(k);
    while (usedC.has(color)) color = (color + 1) % PALETTE.length;
    while (usedS.has(shape)) shape = (shape + 1) % SHAPES.length;
    usedC.add(color); usedS.add(shape); out[k] = { color, shape };
  }
  return out;
}
const LINEUP_PICKS = assignLineup(LINEUP);
export const pick = (name) => { const k = botKey(name); return LINEUP_PICKS[k] || rawPick(k); };

let seq = 0;
/**
 * 生成头像 SVG / render an avatar as inline SVG
 * @param {string} name  bot name in any language (or a key)
 * @param {object} [o]   { size = 32, title = name, color, shape } - color/shape ids override the hash
 */
export function avatarSvg(name, o = {}) {
  const p = pick(name);
  const color = o.color ? PALETTE.find((c) => c.id === o.color) : PALETTE[p.color];
  const shape = o.shape ? SHAPES.find((s) => s.id === o.shape) : SHAPES[p.shape];
  const size = o.size ?? 32;
  const id = `bav${++seq}`;
  const [ex, ey, tilt] = shape.eyes;
  const title = o.title ?? name;
  // 眼睛：两只白色竖椭圆，略带倾斜 / eyes: two white vertical ovals, slightly tilted
  const eyes = `<g transform="rotate(${tilt} ${ex} ${ey})" fill="#fff"><ellipse cx="${ex - 7}" cy="${ey}" rx="4.4" ry="7.6"/><ellipse cx="${ex + 7}" cy="${ey}" rx="4.4" ry="7.6"/></g>`;
  return `<svg class="bot-av" data-bot="${botKey(name)}" data-color="${color.id}" data-shape="${shape.id}" width="${size}" height="${size}" viewBox="0 0 100 100" ${title ? `role="img" aria-label="${title.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"'} focusable="false">`
    + `<defs><clipPath id="${id}c">${shape.body}</clipPath>`
    + `<radialGradient id="${id}g" cx="32%" cy="24%" r="78%"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".42" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient></defs>`
    + `<g class="bot-av-body" fill="${color.hex}">${shape.body}</g>`
    + `<g clip-path="url(#${id}c)"><rect width="100" height="100" fill="url(#${id}g)"/><ellipse cx="34" cy="22" rx="16" ry="7" fill="#fff" opacity=".22" transform="rotate(-24 34 22)"/></g>`
    + (shape.extra || '') + eyes + `</svg>`;
}

// 首页 Hero 的圆球 Bot（眼睛跟随指针，见 assets/main.js）/ the hero orb bot (eyes follow the pointer, see assets/main.js)
// 一个纯色圆（前景色）+ 两只倾斜的胶囊形眼睛（背景色），无外环、无高光、无阴影；深色模式自动黑白反转。
// One solid circle in the foreground colour + two tilted capsule eyes in the background colour; no ring, gloss or shadow.
// Colours flip with the theme. Geometry is our own (rounded rects), in a 228-unit head space.
// 显式 width/height：即使 CSS 没加载也不会被撑大 / explicit width/height so it never blows up without CSS.
export const ORB = {
  r: 114, c: 114,
  // [cx, cy, width, length, tilt°] - 眼睛“顶端向左”倾斜 / eyes tilt with the top leaning left
  eyes: [[126, 77, 29.5, 62, -27], [178.5, 52, 17.5, 62, -34]],
};
export function orbSvg(size = 88) {
  const eye = ([cx, cy, w, l, a]) => `<g transform="rotate(${a} ${cx} ${cy})"><rect class="orb-eye" x="${cx - w / 2}" y="${cy - l / 2}" width="${w}" height="${l}" rx="${w / 2}" fill="#fff"/></g>`;
  return `<svg class="orb-svg" width="${size}" height="${size}" viewBox="-10 -10 248 248" overflow="visible" aria-hidden="true" focusable="false" style="max-width:${size}px;max-height:${size}px">`
    + `<defs><clipPath id="orbClip"><circle cx="${ORB.c}" cy="${ORB.c}" r="${ORB.r - 3}"/></clipPath></defs>`
    + `<g class="orb-ball"><circle class="orb-head" cx="${ORB.c}" cy="${ORB.c}" r="${ORB.r}" fill="#0a0a0a"/>`
    + `<g clip-path="url(#orbClip)"><g class="orb-eyes">${ORB.eyes.map(eye).join('')}</g></g>`
    + `</g></svg>`;
}
