// 社群页二维码：构建时由文字内容生成内联 SVG（npm 包 qrcode，MIT），不放图片、运行时不发请求。
// 内容来自 community.config.mjs 的 qr；用最高容错级别 H 生成，所以中间叠站点 Logo 后仍能扫出来。
// Community-page QR codes, generated at build time from text (npm package qrcode, MIT) as inline SVG: no image file, no runtime request.
// The text comes from community.config.mjs (qr). Error correction level H keeps the code scannable under the centre logo.
import QRCode from 'qrcode';

// 四周留白（模块数，规范要求 4）/ quiet zone in modules (the spec asks for 4)
const MARGIN = 4;
// Logo 方块占整张码宽度的比例：要和 assets/style.css 里 .qr-logo（50px）/ .qr（220px）保持一致
// Logo box as a fraction of the full code width; keep in step with .qr-logo (50px) / .qr (220px) in assets/style.css
export const QR_LOGO = 50 / 220;

/**
 * @param {string} text  二维码内容 / the text to encode
 * @param {object} [o]   { logo = true } - 为中间的 Logo 清出一块空白 / clear the centre for the logo
 */
export function qrSvg(text, { logo = true } = {}) {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const n = modules.size, full = n + MARGIN * 2, c = full / 2;
  // 和 Logo 方块（外扩半个模块）相交的模块不画，Logo 边缘就不会切出半个黑格 / skip modules touching the logo box (plus half a module) so its edges stay clean
  const half = logo ? (QR_LOGO * full) / 2 + 0.5 : 0;
  const hidden = (x, y) => logo && x + MARGIN + 1 > c - half && x + MARGIN < c + half && y + MARGIN + 1 > c - half && y + MARGIN < c + half;
  const dark = (x, y) => modules.get(y, x) && !hidden(x, y);
  let cleared = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (hidden(x, y)) cleared++;
  // H 级最多能纠正约 30% 的码字，清掉的模块超过 15% 就不保险了 / level H recovers ~30% of codewords; clearing more than 15% of modules is unsafe
  if (cleared / (n * n) > 0.15) throw new Error(`QR logo covers ${(100 * cleared / (n * n)).toFixed(1)}% of "${text}" - make the logo smaller`);
  // 同一行连续的黑格合并成一段，路径更短 / merge horizontal runs into one rect each for a shorter path
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!dark(x, y)) continue;
    let w = 1;
    while (x + w < n && dark(x + w, y)) w++;
    d += `M${x + MARGIN} ${y + MARGIN}h${w}v1h-${w}z`;
    x += w - 1;
  }
  return `<svg class="qr-code" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/></svg>`;
}
