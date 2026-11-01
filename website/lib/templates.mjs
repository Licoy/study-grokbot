import fs from 'node:fs';
import crypto from 'node:crypto';
// 静态资源按内容加版本号，发版后浏览器/CDN 不会拿到旧缓存 / content-hash cache-busting for static assets
const assetV = (f) => crypto.createHash('sha256').update(fs.readFileSync(new URL(`../assets/${f}`, import.meta.url))).digest('hex').slice(0, 10);
const ASSET_V = { css: assetV('style.css'), js: assetV('main.js') };
// HTML 模板 / HTML templates (plain template strings, no framework)
import { esc } from './markdown.mjs';
import { LANGS } from './i18n.mjs';
import { ri } from './icons.mjs';
import { orbSvg } from './avatar.mjs';

// 常用图标的别名（全部来自 Remix Icon，见 lib/icons.mjs）/ named shortcuts, all Remix Icon (see lib/icons.mjs)
export const icon = {
  arrow: ri('arrow-right-up-line'),
  right: ri('arrow-right-line'),
  left: ri('arrow-left-line'),
  github: ri('github-fill'),
  x: ri('twitter-x-fill'),
  menu: ri('menu-line'),
  rss: ri('rss-line'),
  auto: ri('contrast-2-line'),
  sun: ri('sun-line'),
  moon: ri('moon-line'),
  lang: ri('translate-2'),
  check: ri('check-line'),
};

// 站点标识：和首页一样的圆球 Bot（lib/avatar.mjs 自绘），眼睛跟随指针，悬停时眯眼笑（assets/main.js + CSS）
// Site mark: the same orb bot as the hero (drawn in lib/avatar.mjs); eyes follow the pointer, squint-smile on hover.
const mark = () => `<span class="mark" data-orb>${orbSvg(30)}</span>`;

const BOT_RE = 'bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|embedly|quora link preview|pinterest|vkshare|w3c_validator|whatsapp|telegram|discord|skype|slack|lighthouse|pagespeed|gptbot|chatgpt|oai-searchbot|claude|anthropic|perplexity|ccbot|bytespider|amazonbot|applebot|duckassist|cohere|google-extended|yandex|baidu|sogou|360spider';

// 渲染在 <head> 最前面：主题（防闪烁）+ 期刊页阅读字号 + 首次访问语言跳转
// Runs first in <head>: theme (no flash) + issue-page text size + first-visit language redirect.
function headScript({ zhPath }) {
  return `<script>(function(){var d=document.documentElement;d.classList.add('js');var p='auto';try{p=localStorage.getItem('sg-theme')||'auto'}catch(e){}var dk=p==='dark'||(p!=='light'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);d.setAttribute('data-theme',dk?'dark':'light');d.setAttribute('data-theme-pref',p);try{var f=localStorage.getItem('sg-fs');if(f)d.setAttribute('data-fs',f)}catch(e){}${
    zhPath
      ? `try{var s=localStorage.getItem('sg-lang');if(!s){if(/${BOT_RE}/i.test(navigator.userAgent||''))return;var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';s=/^zh(-|$)/i.test(l)?'zh':'en';localStorage.setItem('sg-lang',s)}if(s==='zh'){d.setAttribute('data-nav','');location.replace(${JSON.stringify(zhPath)}+location.search+location.hash)}}catch(e){}`
      : ''
  }})();</script>`;
}

// 下拉菜单：按钮只显示图标（文字在 aria-label / title 里），菜单项显示完整文字；开合与键盘操作见 assets/main.js
// Dropdowns: icon-only trigger (label in aria-label / title), full labels in the menu; open/close and keyboard handling in assets/main.js.
const dropdown = (cls, label, trigger, items) =>
  `<div class="dd ${cls}"><button class="btn btn-soft btn-icon dd-btn" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="${esc(label)}" title="${esc(label)}">${trigger}</button><div class="dd-menu" role="menu" aria-label="${esc(label)}" hidden>${items}</div></div>`;
const THEME_ICON = { auto: 'auto', light: 'sun', dark: 'moon' };
// 按钮上同时放三种状态，由 <html data-theme-pref> 决定显示哪个，首屏就正确、不闪 / all three states in the button; <html data-theme-pref> picks one, so first paint is right
function themeMenu(t) {
  const keys = ['auto', 'light', 'dark'];
  return dropdown('dd-theme', t.theme.label,
    keys.map((k) => `<span class="dd-val" data-for="${k}">${icon[THEME_ICON[k]]}</span>`).join(''),
    keys.map((k) => `<button type="button" role="menuitemradio" aria-checked="false" data-theme-set="${k}">${icon[THEME_ICON[k]]}<span>${esc(t.theme[k])}</span><span class="dd-check">${icon.check}</span></button>`).join(''));
}
function langMenu(lang, langs, page, b, t) {
  return dropdown('dd-lang', t.langLabel,
    icon.lang,
    langs.map((l) => `<a role="menuitemradio" aria-checked="${l === lang}" href="${page.altPaths[l] || b + LANGS[l].prefix}" hreflang="${LANGS[l].hreflang}" lang="${LANGS[l].htmlLang}" data-set-lang="${l}"><span>${esc(LANGS[l].label)}</span><span class="dd-check">${icon.check}</span></a>`).join(''));
}

export function layout(ctx) {
  const { site, lang, t, page, body, active = '', bodyClass = '' } = ctx;
  const L = LANGS[lang];
  const b = site.base;
  const root = b + L.prefix;
  const latest = latestHref(site, lang);
  const other = lang === 'en' ? 'zh' : 'en';
  const fullTitle = page.title ? `${page.title} · ${site.title}` : `${site.title} · ${t.siteTagline}`;
  const desc = page.description || t.description;
  const canonical = page.alternates[lang];
  const nav = [['home', t.nav.home, root, 'home-5-line'], ['archive', t.nav.archive, `${root}archive/`, 'archive-line'], ['guide', t.nav.guide, `${root}guide/`, 'book-2-line'], ['community', t.nav.community, `${root}community/`, 'community-line']];
  const zhPath = lang === 'en' && page.altPaths.zh ? page.altPaths.zh : '';
  const ogImg = page.image;
  const ogAlt = page.imageAlt || page.title || site.title;
  const head = [
    `<meta charset="utf-8">`,
    headScript({ zhPath }),
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    page.noindex ? `<meta name="robots" content="noindex">` : '',
    // 跳转页（/latest/）：有 JS 时立即跳（语言自动跳转优先），没有 JS 时用 meta refresh / redirect pages (/latest/): jump at once with JS
    // (unless the language redirect above already started), meta refresh without JS
    page.redirect ? `<script>document.documentElement.hasAttribute('data-nav')||location.replace(${JSON.stringify(page.redirect)}+location.hash)</script><noscript><meta http-equiv="refresh" content="0; url=${esc(page.redirect)}"></noscript>` : '',
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${canonical}">`,
    ...Object.entries(page.alternates).map(([k, u]) => `<link rel="alternate" hreflang="${LANGS[k].hreflang}" href="${u}">`),
    page.alternates.en ? `<link rel="alternate" hreflang="x-default" href="${page.alternates.en}">` : '',
    `<meta name="color-scheme" content="light dark">`,
    `<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)">`,
    `<meta property="og:site_name" content="${esc(site.title)}">`,
    `<meta property="og:type" content="${page.type === 'article' ? 'article' : 'website'}">`,
    `<meta property="og:title" content="${esc(page.title || fullTitle)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:locale" content="${L.ogLocale}">`,
    page.alternates[other] ? `<meta property="og:locale:alternate" content="${LANGS[other].ogLocale}">` : '',
    `<meta property="og:image" content="${ogImg}">`,
    `<meta property="og:image:secure_url" content="${ogImg}">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(ogAlt)}">`,
    page.published ? `<meta property="article:published_time" content="${page.published}T08:00:00+09:00">` : '',
    ...(page.tags || []).map((x) => `<meta property="article:tag" content="${esc(x)}">`),
    `<meta name="twitter:card" content="summary_large_image">`,
    site.twitter ? `<meta name="twitter:site" content="${esc(site.twitter)}"><meta name="twitter:creator" content="${esc(site.twitter)}">` : '',
    `<meta name="twitter:title" content="${esc(page.title || fullTitle)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${ogImg}">`,
    `<meta name="twitter:image:alt" content="${esc(ogAlt)}">`,
    `<link rel="icon" href="${b}assets/favicon.svg" type="image/svg+xml">`,
    `<link rel="alternate" type="application/rss+xml" title="${esc(site.title)} (${L.label})" href="${root}feed.xml">`,
    page.markdown ? `<link rel="alternate" type="text/markdown" title="Markdown" href="${page.markdown}">` : '',
    `<link rel="stylesheet" href="${b}assets/style.css?v=${ASSET_V.css}">`,
    page.jsonld ? `<script type="application/ld+json">${JSON.stringify(page.jsonld).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n');


  return `<!doctype html>
<html lang="${L.htmlLang}">
<head>
${head}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-header">
  <nav class="nav container" aria-label="Main">
    <a class="brand" href="${root}" aria-label="${esc(site.title)}">${mark()}<span>${esc(site.title)}</span></a>
    <div class="nav-links">
      ${nav.map(([k, x, h, ic]) => `<a href="${h}"${k === active ? ' aria-current="page"' : ''}>${ri(ic)}<span>${x}</span></a>`).join('')}
    </div>
    <div class="nav-cta">
      ${langMenu(lang, site.langs, page, b, t)}
      ${themeMenu(t)}
      <a class="btn btn-soft btn-icon hide-sm" href="${site.repo}" target="_blank" rel="noopener" aria-label="${t.nav.github}" title="${t.nav.github}">${icon.github}</a>
      <a class="btn btn-soft btn-icon hide-sm" href="${site.x}" target="_blank" rel="noopener" aria-label="${t.nav.x}" title="${t.nav.x}">${icon.x}</a>
      <button class="btn btn-soft btn-icon nav-toggle" type="button" aria-label="${esc(t.menu)}" aria-expanded="false">${icon.menu}</button>
    </div>
  </nav>
  <div class="mobile-menu" hidden>
    ${nav.map(([, x, h, ic]) => `<a href="${h}">${ri(ic)}<span>${x}</span></a>`).join('')}
    <a href="${latest}">${ri('sparkling-line')}<span>${esc(t.latest)}</span></a>
    <a href="${site.repo}" target="_blank" rel="noopener">${icon.github}<span>${t.nav.github}</span>${icon.arrow}</a>
    <a href="${site.x}" target="_blank" rel="noopener">${icon.x}<span>${t.nav.x}</span>${icon.arrow}</a>
  </div>
</header>
<main id="main">
${body}
</main>
${footer(site, lang, t)}
<script src="${b}assets/main.js?v=${ASSET_V.js}" defer></script>
</body>
</html>`;
}

// 站内“最新一期”直接链到当期文章（build.mjs 写入 site.latest），不经过 /latest/ 跳转页
// Internal "Latest issue" links go straight to the issue (site.latest is set by build.mjs), skipping the /latest/ redirect page.
export const latestHref = (site, lang) => site.latest?.[lang] || `${site.base}${LANGS[lang].prefix}latest/`;

export function footer(site, lang, t) {
  const root = site.base + LANGS[lang].prefix;
  const f = t.footer;
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="brand" href="${root}">${mark()}<span>${esc(site.title)}</span></a>
        <p>${esc(t.description)}</p>
      </div>
      <div class="footer-cols">
        <div><h2>${f.content}</h2><a href="${latestHref(site, lang)}">${f.latest}</a><a href="${root}archive/">${f.archive}</a><a href="${root}feed.xml">${f.rss}</a></div>
        <div><h2>${f.guide}</h2><a href="${root}guide/getting-started/">${f.gs}</a><a href="${root}guide/concepts/">${f.concepts}</a><a href="${root}guide/faq/">${f.faq}</a></div>
        <div><h2>${f.community}</h2><a href="${root}community/">${f.join}</a><a href="${site.repo}" target="_blank" rel="noopener">${f.repo}</a><a href="${site.repo}/issues" target="_blank" rel="noopener">${f.submit}</a></div>
      </div>
    </div>
  </div>
  <div class="footer-bottom"><p class="container">© ${new Date().getFullYear()} ${esc(site.title)} · ${esc(f.legal)}</p></div>
</footer>`;
}

export const tagList = (tags = []) =>
  tags.length ? `<ul class="tags">${tags.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';

// 期刊卡片（往期目录、首页列表共用）：左侧大号日期，右侧期号、标题、摘要、标签
// Issue card (archive + home list): a big date on the left; number, title, summary and tags on the right.
export function issueRow(href, it, t, { latest = false } = {}) {
  const [, , d] = it.date.split('-');
  return `<a class="issue-card reveal" href="${href}">
  <time class="ic-date" datetime="${it.date}"><span class="ic-day">${d}</span><span class="ic-mon">${esc(t.dayMeta(it.date))}</span></time>
  <span class="ic-body">
    <span class="ic-meta"><span class="ic-no">${esc(t.noLabel(it.no))}</span>${latest ? `<span class="ic-new">${esc(t.newest)}</span>` : ''}</span>
    <span class="ic-title">${esc(it.title)}</span>
    <span class="ic-sum">${esc(it.summary)}</span>
    ${it.tags.length ? `<span class="ic-tags">${it.tags.slice(0, 4).map((x) => `<span>${esc(x)}</span>`).join('')}</span>` : ''}
  </span>
  <span class="ic-go" aria-hidden="true">${icon.right}</span>
</a>`;
}
