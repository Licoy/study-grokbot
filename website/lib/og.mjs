// 分享图（Open Graph / X 卡片，1200×630）：build.mjs 生成每张图的描述（spec），scripts/og.mjs 用 Chromium + 思源宋体渲染成 PNG。
// Share cards (Open Graph / X, 1200×630). build.mjs emits a spec per image; scripts/og.mjs renders it to PNG
// with headless Chromium and Source Han Serif SC (build time only - the website itself loads no web fonts).
import crypto from 'node:crypto';
import { esc } from './markdown.mjs';

export const OG_W = 1200;
export const OG_H = 630;
export const OG_FAMILY = 'OG Serif'; // @font-face alias that points at the Source Han Serif SC files

// 去掉标题里和角标重复的期号前缀 / drop the "Issue DATE:" / 《DATE期：…》 prefix that the badge already shows
export function ogTitle(lang, title) {
  let s = String(title).trim();
  if (lang === 'zh') s = s.replace(/^《(.*)》$/, '$1').replace(/^\d{4}-\d{2}-\d{2}\s*期\s*[：:]\s*/, '');
  else s = s.replace(/^Issue\s+\d{4}-\d{2}-\d{2}\s*[:：]\s*/i, '');
  return s;
}

export const specHash = (spec) => crypto.createHash('sha1').update(JSON.stringify(spec)).digest('hex').slice(0, 12);

const MARK = `<svg width="52" height="52" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#fff"/><path d="M12 15.3c4-1.5 8-1 12 1.6 4-2.6 8-3.1 12-1.6v17.4c-4-1.5-8-1-12 1.6-4-2.6-8-3.1-12-1.6Z" fill="none" stroke="#0a0a0a" stroke-width="3" stroke-linejoin="round"/><path d="M24 17v17.4" stroke="#0a0a0a" stroke-width="3"/></svg>`;

/**
 * spec: { lang, kind: 'site'|'issue', badge, kicker, title, sub, domain, note }
 * fontUrls: { 400: url, 500: url, 600: url }
 */
export function ogHtml(spec, fontUrls) {
  const faces = Object.entries(fontUrls).map(([w, u]) => `@font-face{font-family:"${OG_FAMILY}";src:url("${u}") format("opentype");font-weight:${w};font-style:normal;font-display:block}`).join('\n');
  const htmlLang = spec.lang === 'zh' ? 'zh-Hans' : 'en';
  return `<!doctype html><html lang="${htmlLang}"><head><meta charset="utf-8"><style>
${faces}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${OG_W}px;height:${OG_H}px;background:#0a0a0a;overflow:hidden}
body{font-family:"${OG_FAMILY}";color:#fff;-webkit-font-smoothing:antialiased;font-kerning:normal;font-synthesis:none}
.card{position:relative;width:${OG_W}px;height:${OG_H}px;overflow:hidden;
  background:
    radial-gradient(640px 420px at 88% -6%, rgba(255,106,8,.38), rgba(255,106,8,0) 70%),
    radial-gradient(520px 360px at 8% 112%, rgba(255,170,90,.10), rgba(255,170,90,0) 70%),
    linear-gradient(180deg,#0d0d0e 0%,#0a0a0a 100%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:60px 60px;
  -webkit-mask-image:radial-gradient(900px 500px at 70% 10%,#000 0%,transparent 75%)}
.frame{position:absolute;inset:28px;border:1px solid rgba(255,255,255,.09);border-radius:34px}
/* 安全区 / safe area: 2:1 裁切只去掉上下各 15px，内容留在 x 88–1112、y 64–566 */
.safe{position:absolute;left:88px;right:88px;top:64px;bottom:64px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;gap:16px;font-size:31px;font-weight:600;letter-spacing:-.01em}
.badge{font-size:23px;font-weight:500;color:#ffe2c8;padding:9px 20px;border-radius:999px;border:1px solid rgba(255,138,61,.45);background:rgba(255,106,8,.12);white-space:nowrap}
.main{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;padding:0}
.kicker{font-size:26px;font-weight:500;letter-spacing:.01em;margin-bottom:18px;background:linear-gradient(90deg,#ffe2c8,#ff7a1f);-webkit-background-clip:text;background-clip:text;color:transparent;align-self:flex-start}
.title{font-weight:600;line-height:1.16;letter-spacing:-.012em;text-wrap:balance;line-break:strict;overflow-wrap:break-word;max-width:1000px}
.zh .title{letter-spacing:.01em;line-height:1.22}
.sub{margin-top:22px;font-size:27px;line-height:1.45;color:#aeb4bd;max-width:980px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;line-break:strict}
.bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;font-size:22px;color:#8a8f97}
.domain{display:flex;align-items:center;gap:12px;color:#e8e8ea;font-weight:500;font-size:24px}
.dot{width:10px;height:10px;border-radius:50%;background:#ff6a08;box-shadow:0 0 14px rgba(255,106,8,.8)}
</style></head><body class="${spec.lang}"><div class="card"><div class="grid"></div><div class="frame"></div>
<div class="safe">
  <div class="top"><div class="brand">${MARK}<span data-t>Study GrokBot</span></div>${spec.badge ? `<div class="badge" data-t>${esc(spec.badge)}</div>` : ''}</div>
  <div class="main">
    ${spec.kicker ? `<div class="kicker" data-t>${esc(spec.kicker)}</div>` : ''}
    <h1 class="title" data-t data-fit>${esc(spec.title)}</h1>
    ${spec.sub ? `<p class="sub" data-t>${esc(spec.sub)}</p>` : ''}
  </div>
  <div class="bottom"><div class="domain"><span class="dot"></span><span data-t>${esc(spec.domain)}</span></div><div data-t>${esc(spec.note)}</div></div>
</div></div>
<script>
// 标题自适应字号：最多 3 行且不挤出主区域 / fit the title: ≤3 lines and inside the main area
window.fitTitle = () => {
  const t = document.querySelector('[data-fit]'), main = document.querySelector('.main');
  const sub = document.querySelector('.sub');
  let size = document.body.classList.contains('zh') ? 80 : 84;
  const room = 28; // 主区域上下至少留白 / keep breathing room inside the main area
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
