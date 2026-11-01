// 分享图（Open Graph / X 卡片，1200×630）：build.mjs 生成每张图的描述（spec），scripts/og.mjs 用 Chromium + 思源黑体渲染成 PNG。
// 版式跟网站一致：白底、暖橙色光晕、黑色标题，右侧是戴博士帽的圆球 Bot（站点 Logo），底部是示例 Bot 头像。
// Share cards (Open Graph / X, 1200×630). build.mjs emits a spec per image; scripts/og.mjs renders it to PNG with headless
// Chromium and Source Han Sans SC (build time only - the website itself loads no web fonts). The look follows the site:
// white background, warm orange glow, black title, the capped orb bot (the site logo) on the right, example Bot avatars at the bottom.
import crypto from 'node:crypto';
import { esc, wrapTitle } from './markdown.mjs';
import { orbSvg, avatarSvg, LINEUP } from './avatar.mjs';

export const OG_W = 1200;
export const OG_H = 630;
export const OG_FAMILY = 'OG Sans'; // @font-face alias that points at the Source Han Sans SC files
const OG_DESIGN = 3; // 改版式时加一，让缓存的 PNG 失效 / bump when the template changes so cached PNGs re-render

// 去掉标题里和角标重复的期号前缀 / drop the "Issue DATE:" / 《DATE期：…》 prefix that the badge already shows
export function ogTitle(lang, title) {
  let s = String(title).trim();
  if (lang === 'zh') s = s.replace(/^《(.*)》$/, '$1').replace(/^\d{4}-\d{2}-\d{2}\s*期\s*[：:]\s*/, '');
  else s = s.replace(/^Issue\s+\d{4}-\d{2}-\d{2}\s*[:：]\s*/i, '');
  return s;
}

export const specHash = (spec) => crypto.createHash('sha1').update(JSON.stringify({ design: OG_DESIGN, spec })).digest('hex').slice(0, 12);

// 中文按词断行（和网站标题一样）；第一次出现的 accent 文字用橙色渐变（和首页标题一样）
// Chinese wraps by word (like the site's headings); the first occurrence of spec.accent gets the hero's orange gradient
const titleHtml = (spec) => {
  const t = wrapTitle(spec.title, spec.lang), a = spec.accent && esc(spec.accent);
  return a && t.includes(a) ? t.replace(a, `<em>${a}</em>`) : t;
};

/**
 * spec: { lang, kind: 'site'|'issue', badge, kicker, title, accent, sub, domain, note }
 * fontUrls: { 400: url, 500: url, 700: url }
 */
export function ogHtml(spec, fontUrls) {
  const faces = Object.entries(fontUrls).map(([w, u]) => `@font-face{font-family:"${OG_FAMILY}";src:url("${u}") format("opentype");font-weight:${w};font-style:normal;font-display:block}`).join('\n');
  const htmlLang = spec.lang === 'zh' ? 'zh-Hans' : 'en';
  return `<!doctype html><html lang="${htmlLang}"><head><meta charset="utf-8"><style>
${faces}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${OG_W}px;height:${OG_H}px;background:#fff;overflow:hidden}
body{font-family:"${OG_FAMILY}";color:#0a0a0a;-webkit-font-smoothing:antialiased;font-kerning:normal;font-synthesis:none}
.card{position:relative;width:${OG_W}px;height:${OG_H}px;overflow:hidden;
  background:
    radial-gradient(520px 420px at 86% 56%, rgba(255,106,8,.16), rgba(255,106,8,0) 70%),
    radial-gradient(700px 300px at 20% 118%, rgba(255,150,70,.10), rgba(255,150,70,0) 70%),
    linear-gradient(180deg,#ffffff 0%,#fbfaf8 100%)}
/* 安全区 / safe area: 2:1 裁切只去掉上下各 15px，内容留在 x 88–1112、y 64–566 */
.safe{position:absolute;left:88px;right:88px;top:64px;bottom:64px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;gap:14px;font-size:30px;font-weight:700;letter-spacing:-.01em}
.brand .orb-svg{display:block;overflow:visible}
.badge{font-size:22px;font-weight:500;color:#0a0a0a;padding:9px 20px;border-radius:999px;background:#efeee9;white-space:nowrap}
.main{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;max-width:700px}
.kicker{font-size:25px;font-weight:500;color:#b23c08;margin-bottom:16px}
.title{font-weight:700;line-height:1.18;letter-spacing:-.015em;text-wrap:balance;line-break:strict;overflow-wrap:break-word}
.zh .title{letter-spacing:0;line-height:1.24;word-break:keep-all;overflow-wrap:anywhere}
.title em{font-style:normal;background:linear-gradient(90deg,#ff8a3d,#e04f00);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{margin-top:20px;font-size:25px;line-height:1.5;color:#4b5058;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;line-break:strict}
.bottom{display:flex;align-items:center;justify-content:space-between;gap:24px}
.domain{display:flex;align-items:center;gap:12px;font-weight:500;font-size:24px}
.dot{width:10px;height:10px;border-radius:50%;background:#ff6a08}
.crew{display:flex;align-items:center;gap:14px;font-size:20px;color:#686c73}
/* 头像并排、不叠压：形状各不相同，叠起来会互相啃掉轮廓 / side by side, no overlap - the shapes differ, so stacking would bite into each other */
.crew .avs{display:flex;gap:8px}
.crew .bot-av{display:block;width:34px;height:34px}
.hero{position:absolute;right:96px;top:50%;width:270px;height:270px;margin-top:-118px}
.hero .orb-svg{width:270px;height:270px;overflow:visible}
/* 静态圆球：不显示悬停笑眼，眼睛看向左边的标题 / static orb: no hover smile, eyes look left toward the title */
.orb-happy{display:none}
.hero .orb-eyes{transform:translate(-26px,8px)}
</style></head><body class="${spec.lang}"><div class="card">
<div class="hero">${orbSvg(270)}</div>
<div class="safe">
  <div class="top"><div class="brand">${orbSvg(50)}<span data-t>Study GrokBot</span></div>${spec.badge ? `<div class="badge" data-t>${esc(spec.badge)}</div>` : ''}</div>
  <div class="main">
    ${spec.kicker ? `<div class="kicker" data-t>${esc(spec.kicker)}</div>` : ''}
    <h1 class="title" data-t data-fit>${titleHtml(spec)}</h1>
    ${spec.sub ? `<p class="sub" data-t>${esc(spec.sub)}</p>` : ''}
  </div>
  <div class="bottom"><div class="domain"><span class="dot"></span><span data-t>${esc(spec.domain)}</span></div><div class="crew"><span class="avs">${LINEUP.map((k) => avatarSvg(k, { size: 34, title: '' })).join('')}</span><span data-t>${esc(spec.note)}</span></div></div>
</div></div>
<script>
// 标题自适应字号：最多 3 行且不挤出主区域 / fit the title: ≤3 lines and inside the main area
window.fitTitle = () => {
  const t = document.querySelector('[data-fit]'), main = document.querySelector('.main');
  const sub = document.querySelector('.sub');
  let size = document.body.classList.contains('zh') ? 76 : 78;
  const room = 24; // 主区域上下至少留白 / keep breathing room inside the main area
  const lines = () => Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight));
  const content = () => { const k = [...main.children]; return k[k.length - 1].getBoundingClientRect().bottom - k[0].getBoundingClientRect().top; };
  for (; size >= 44; size -= 2) {
    t.style.fontSize = size + 'px';
    if (sub) sub.style.webkitLineClamp = lines() >= 3 ? '1' : '2';
    if (lines() <= 3 && content() <= main.clientHeight - room) break;
  }
  return { size, lines: lines(), overflow: content() > main.clientHeight - 2 };
};
</script></body></html>`;
}
