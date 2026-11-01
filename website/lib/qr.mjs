// 临时占位二维码（社群页用）：外观像一个 29×29 的二维码（三个定位角、定时线、对齐块），数据格由种子的哈希决定，每次构建都一样。
// 它扫不出内容，只是在拿到真实群码之前占位；中间留出一块空白给站点 Logo（见 build.mjs 的 communityPage）。
// 换成真实二维码：把图片放进 assets/，在 site.config.mjs 的 community[].qr 里填路径即可。
// Temporary placeholder QR for the community page: it looks like a 29×29 QR code (finder corners, timing lines, alignment block)
// with data modules seeded by a hash, stable across builds. It does not scan; it only holds the spot until the real group code exists.
// The centre is left blank for the site logo (communityPage in build.mjs). To use a real code, put the image in assets/ and set
// its path as community[].qr in site.config.mjs.
const N = 29, LOGO = 4; // 模块数；中间留空的半径（9×9 模块）/ modules per side; blank radius in the centre (9×9 modules)

function rng(seed) {
  let h = 0x811c9dc5;
  for (const ch of new TextEncoder().encode(seed)) { h ^= ch; h = Math.imul(h, 0x01000193) >>> 0; }
  return () => { h = (h + 0x6d2b79f5) >>> 0; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function placeholderQr(seed) {
  const rand = rng(seed), c = (N - 1) / 2;
  const cheb = (x, y, ax, ay) => Math.max(Math.abs(x - ax), Math.abs(y - ay));
  const finders = [[3, 3], [N - 4, 3], [3, N - 4]];
  const cell = (x, y) => {
    for (const [fx, fy] of finders) {
      const d = cheb(x, y, fx, fy);
      if (d <= 4) return d === 3 || d <= 1; // 定位角 + 一圈留白 / finder + separator
    }
    const a = cheb(x, y, N - 7, N - 7);
    if (a <= 2) return a !== 1; // 对齐块 / alignment block
    if (cheb(x, y, c, c) <= LOGO) return false; // Logo 区 / logo area
    if (y === 6 || x === 6) return (x + y) % 2 === 0; // 定时线 / timing lines
    return rand() < 0.48;
  };
  const grid = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => cell(x, y)));
  // 同一行连续的黑格合并成一段，路径更短 / merge horizontal runs into one rect each for a shorter path
  let d = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!grid[y][x]) continue;
    let w = 1;
    while (x + w < N && grid[y][x + w]) w++;
    d += `M${x} ${y}h${w}v1h-${w}z`;
    x += w - 1;
  }
  return `<svg class="qr-code" viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/></svg>`;
}
