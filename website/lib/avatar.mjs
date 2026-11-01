// Bot 头像规范（全站统一）/ Bot avatar spec - the single source of truth for every bot depicted on the site.
//
// 风格参考 GrokBot 的头像，但全部由这里的代码绘制（不使用任何官方图片素材）：
// Style follows GrokBot's avatars, recreated from scratch in code (no official assets are used):
//   头像 = 调色板中的 1 种纯色 × 1 种圆润的形状 × 右上方两只镂空的胶囊眼睛
//   avatar = one flat palette colour × one soft, rounded body × two capsule eyes cut out toward the upper right
//   - 纯色、扁平：没有渐变、高光和阴影。/ Flat: no gradient, gloss or shadow.
//   - 眼睛是“洞”（fill-rule="evenodd"），透出背后的底色，所以在任何背景上都协调。
//     Eyes are holes (fill-rule="evenodd") that show whatever is behind the avatar.
//   - 两只眼睛等长；近处那只宽、远处那只窄且一头略细，像在往右上方看。
//     Both eyes have the same length; the near eye is wider, the far eye narrower and slightly tapered, looking up-right.
//
// 分配规则 / assignment:
//   - 同一个 Bot 的中英文名字映射到同一个 key（BOT_KEYS），所以两种语言里头像一致。
//     Both language names of a bot map to one key (BOT_KEYS) so the avatar matches across languages.
//   - key 的哈希（FNV-1a）决定颜色和形状：结果是“随机”的，但每次构建都一样。圆形（orb）出现的概率更高。
//     The FNV-1a hash of the key picks colour and shape: random-looking but stable across builds. Orbs are the most common shape.
//   - 同一组 Bot（lineup）内颜色不重复，并尽量各占一个色系（避免红/粉/橙扎堆）；除圆形外，形状也不重复。
//     冲突时按固定顺序往后找下一个空位。
//     Within a lineup no colour repeats and colours spread across families where possible (no red/pink/orange cluster);
//     no shape other than the orb repeats. Collisions probe forward deterministically.

// family：色系，同一组 Bot 尽量各占一个色系 / colour family - a lineup spreads across families where possible
export const PALETTE = [
  { id: 'black', hex: '#161616', family: 'neutral' },
  { id: 'gray', hex: '#7d828b', family: 'neutral' },
  { id: 'red', hex: '#e5534b', family: 'red' },
  { id: 'orange', hex: '#ed712e', family: 'red' },
  { id: 'amber', hex: '#f19d38', family: 'yellow' },
  { id: 'green', hex: '#4fb26a', family: 'green' },
  { id: 'teal', hex: '#54b9a6', family: 'green' },
  { id: 'blue', hex: '#3c82f6', family: 'blue' },
  { id: 'indigo', hex: '#6464ef', family: 'blue' },
  { id: 'violet', hex: '#885cf5', family: 'blue' },
  { id: 'pink', hex: '#e2609c', family: 'red' },
];

// ---------- 几何工具 / geometry helpers (viewBox 0 0 100 100) ----------
const f = (n) => +n.toFixed(2);
const rot = ([x, y], deg, [cx, cy] = [50, 50]) => {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};
// 经过各点的平滑闭合曲线（Catmull-Rom → 三次贝塞尔）/ smooth closed curve through the points
function smooth(pts) {
  const n = pts.length, P = (i) => pts[(i + n) % n];
  let d = `M${f(P(0)[0])} ${f(P(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
// 圆润多边形：把多边形向外“膨胀” rho（角变成圆弧），再往圆形方向鼓 puff，沿 N 个方向取样后用平滑曲线连起来。
// Soft polygon: inflate the polygon by rho (corners become arcs), puff it towards a circle, sample N directions, smooth.
function softPoly(corners, { rho = 12, puff = 0.12, N = 40, deg = 0 } = {}) {
  const n = corners.length;
  const c = [corners.reduce((a, p) => a + p[0], 0) / n, corners.reduce((a, p) => a + p[1], 0) / n];
  const segDist = ([px, py], [ax, ay], [bx, by]) => {
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  };
  const side = (p, i) => { const a = corners[i], b = corners[(i + 1) % n]; return Math.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])); };
  const inside = (p) => { const s = corners.map((_, i) => side(p, i)); return s.every((x) => x >= 0) || s.every((x) => x <= 0); };
  const dist = (p) => (inside(p) ? 0 : Math.min(...corners.map((a, i) => segDist(p, a, corners[(i + 1) % n]))));
  const radii = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * 2 * Math.PI, u = [Math.cos(a), Math.sin(a)];
    let lo = 0, hi = 200;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; dist([c[0] + u[0] * m, c[1] + u[1] * m]) < rho ? (lo = m) : (hi = m); }
    return [a, lo];
  });
  const mean = radii.reduce((a, [, r]) => a + r, 0) / N;
  return smooth(radii.map(([a, r]) => rot([c[0] + Math.cos(a) * (r * (1 - puff) + mean * puff), c[1] + Math.sin(a) * (r * (1 - puff) + mean * puff)], deg, c)));
}
// 胶囊（两端半径可以不同）：中心 c、总长 len、底端半径 r1、顶端半径 r2、倾斜 deg（0 = 竖直，负数 = 顶端向左）
// Capsule with possibly different end radii: centre c, total length len, bottom radius r1, top radius r2, tilt deg (0 = upright, negative = top leans left)
export function capsule([cx, cy], len, r1, r2 = r1, deg = 0) {
  const d = len - r1 - r2, y0 = (r2 - r1) / 2; // 两个圆心的距离；整体居中 / distance between centres; keep the capsule centred
  const phi = Math.asin(Math.max(-1, Math.min(1, (r2 - r1) / d)));
  const c1 = [0, d / 2 + y0], c2 = [0, -d / 2 + y0], co = Math.cos(phi), si = Math.sin(phi);
  const P = ([x, y]) => rot([cx + x, cy + y], deg, [cx, cy]).map(f).join(' ');
  const b1 = [c1[0] + r1 * co, c1[1] + r1 * si], b2 = [c1[0] - r1 * co, c1[1] + r1 * si];
  const t2 = [c2[0] - r2 * co, c2[1] + r2 * si], t1 = [c2[0] + r2 * co, c2[1] + r2 * si];
  return `M${P(t1)}L${P(b1)}A${f(r1)} ${f(r1)} 0 ${r1 >= r2 ? 1 : 0} 1 ${P(b2)}L${P(t2)}A${f(r2)} ${f(r2)} 0 ${r2 > r1 ? 1 : 0} 1 ${P(t1)}Z`;
}
const ellipse = ([cx, cy], rx, ry, deg = 0) => {
  const a = rot([cx - rx, cy], deg, [cx, cy]).map(f).join(' '), b = rot([cx + rx, cy], deg, [cx, cy]).map(f).join(' ');
  return `M${a}A${rx} ${ry} ${deg} 1 1 ${b}A${rx} ${ry} ${deg} 1 1 ${a}Z`;
};

// ---------- 形状 / shapes ----------
// body: 身体路径，约占满 100×100 的 92%。eyes: [近眼中心, 远眼中心, 倾斜角, 眼睛尺度 R]
// body: path filling ~92% of the 100×100 box. eyes: [near-eye centre, far-eye centre, tilt°, eye scale R]
// 眼睛尺寸都按 R 推算 / eye sizes derive from R: length 0.55R, near width 0.255R, far width 0.17R.
export const SHAPES = [
  { id: 'orb', weight: 3, body: ellipse([50, 50], 46, 46), eyes: [[54.7, 34.8], [75.8, 25.2], -35, 46] },
  { id: 'soft-triangle', body: softPoly([[36, 20], [84, 54], [26, 82]], { rho: 15, puff: 0.1 }), eyes: [[51, 32], [68, 39.5], 56, 40] },
  { id: 'soft-square', body: softPoly([[27, 27], [73, 27], [73, 73], [27, 73]], { rho: 15, puff: 0.22, deg: -16 }), eyes: [[55, 31], [72, 27.5], -22, 40] },
  { id: 'egg', body: ellipse([50, 51], 39, 46, -16), eyes: [[54, 30], [70.5, 25.5], -30, 40] },
  { id: 'bean', body: ellipse([50, 52], 46, 36, -18), eyes: [[54, 37], [70, 32], -22, 38] },
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

// 按权重展开的形状表（圆形多几份）/ shape indexes expanded by weight (more orbs)
const SHAPE_POOL = SHAPES.flatMap((s, i) => Array(s.weight || 1).fill(i));
// 单个 key 的“原始”选择 / raw pick for one key
export function rawPick(key) {
  const h = fnv1a(key);
  return { color: h % PALETTE.length, shape: SHAPE_POOL[(Math.floor(h / PALETTE.length) >>> 0) % SHAPE_POOL.length] };
}

// 一组 key 依次分配：颜色不重复且尽量分散在不同色系，非圆形的形状不重复 / assign a lineup: distinct colours across families; no repeated non-orb shape
export function assignLineup(keys) {
  const usedC = new Set(), usedF = new Set(), usedS = new Set(), out = {};
  for (const k of keys) {
    let { color, shape } = rawPick(k);
    const order = Array.from({ length: PALETTE.length }, (_, i) => (color + i) % PALETTE.length);
    color = order.find((c) => !usedC.has(c) && !usedF.has(PALETTE[c].family)) ?? order.find((c) => !usedC.has(c));
    while (shape !== 0 && usedS.has(shape)) shape = (shape + 1) % SHAPES.length;
    usedC.add(color); usedF.add(PALETTE[color].family); usedS.add(shape); out[k] = { color, shape };
  }
  return out;
}
const LINEUP_PICKS = assignLineup(LINEUP);
export const pick = (name) => { const k = botKey(name); return LINEUP_PICKS[k] || rawPick(k); };

// 一对眼睛的路径 / the eye pair as path data
function eyesPath([near, far, tilt, R]) {
  const len = 0.55 * R, wn = 0.255 * R, wf = 0.17 * R;
  return capsule(near, len, wn / 2, wn / 2 * 0.92, tilt) + capsule(far, len, wf / 2, wf / 2 * 0.72, tilt);
}

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
  const title = o.title ?? name;
  return `<svg class="bot-av" data-bot="${botKey(name)}" data-color="${color.id}" data-shape="${shape.id}" width="${size}" height="${size}" viewBox="0 0 100 100" ${title ? `role="img" aria-label="${title.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"'} focusable="false">`
    + `<path fill="${color.hex}" fill-rule="evenodd" d="${shape.body}${eyesPath(shape.eyes)}"/></svg>`;
}

// 首页 Hero 的圆球 Bot（眼睛跟随指针，见 assets/main.js）/ the hero orb bot (eyes follow the pointer, see assets/main.js)
// 一个纯色圆（前景色）+ 两只对称的竖直胶囊眼睛（背景色），无外环、无高光、无阴影；深色模式自动黑白反转。
// One solid circle in the foreground colour + two symmetric upright capsule eyes in the background colour; no ring, gloss or shadow.
// 静止时双眼对称、位于圆心高度，看向指针时整体移动、靠近视线一侧的眼睛略变窄（main.js）。
// At rest the eyes sit level with the centre; when tracking, they shift and the eye on the gaze side narrows (main.js).
// 显式 width/height：即使 CSS 没加载也不会被撑大 / explicit width/height so it never blows up without CSS.
export const ORB = {
  r: 114, c: 114,
  // [cx, cy, width, length] - 间距 ±0.306r，宽 0.25r，长 0.56r / spacing ±0.306r, width 0.25r, length 0.56r
  eyes: [[79.1, 114, 28.5, 64], [148.9, 114, 28.5, 64]],
};
// 悬停时换成一对眯起来的笑眼 “> <”（CSS 切换，见 .orb-happy）/ on hover the eyes turn into a squinting smile "> <" (CSS, .orb-happy)
const HAPPY = 'M68 97L94 114L68 131M160 97L134 114L160 131';
// 博士帽（学习站的标志）：歪戴在右上角，放在 .orb-ball 里随头一起动；描一圈背景色的边，和头部分开。帽穗用强调色。
// Mortarboard (it's a study site): tilted on the top-right, inside .orb-ball so it moves with the head;
// a background-coloured outline separates it from the head. The tassel uses the accent colour.
export const CAP = {
  at: 'translate(162 6) rotate(16) scale(1.3)',
  base: 'M-36 4L-34 38Q0 52 34 38L36 4Z',
  board: 'M-70 0L0-24L70 0L0 24Z',
  cord: 'M0 0L54 6L54 40',
  tassel: { x: 47, y: 36, w: 14, h: 26 },
};
export const capSvg = () => `<g class="orb-cap" transform="${CAP.at}">`
  + `<path class="orb-cap-fill orb-cap-base" d="${CAP.base}" fill="#0a0a0a"/>`
  + `<path class="orb-cap-fill" d="${CAP.board}" fill="#0a0a0a" stroke="#fff" stroke-width="8" paint-order="stroke" stroke-linejoin="round"/>`
  + `<path class="orb-cord" d="${CAP.cord}" fill="none" stroke="#ff6a08" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`
  + `<rect class="orb-tassel" x="${CAP.tassel.x}" y="${CAP.tassel.y}" width="${CAP.tassel.w}" height="${CAP.tassel.h}" rx="${CAP.tassel.w / 2}" fill="#ff6a08"/></g>`;

let orbN = 0;
export function orbSvg(size = 88) {
  const id = `orbClip${orbN++}`; // 一页里可能有多个圆球（页头、页脚、Hero），clipPath 的 id 不能重复 / several orbs per page need unique ids
  const eye = ([cx, cy, w, l]) => `<g class="orb-eye-g"><rect class="orb-eye" x="${cx - w / 2}" y="${cy - l / 2}" width="${w}" height="${l}" rx="${w / 2}" fill="#fff"/></g>`;
  return `<svg class="orb-svg" width="${size}" height="${size}" viewBox="-10 -10 248 248" overflow="visible" aria-hidden="true" focusable="false" style="max-width:${size}px;max-height:${size}px">`
    + `<defs><clipPath id="${id}"><circle cx="${ORB.c}" cy="${ORB.c}" r="${ORB.r - 3}"/></clipPath></defs>`
    + `<g class="orb-ball"><circle class="orb-head" cx="${ORB.c}" cy="${ORB.c}" r="${ORB.r}" fill="#0a0a0a"/>${capSvg()}`
    + `<g clip-path="url(#${id})"><g class="orb-eyes">${ORB.eyes.map(eye).join('')}<path class="orb-happy" d="${HAPPY}" fill="none" stroke="#fff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/></g></g>`
    + `</g></svg>`;
}
