import fs from 'node:fs';
import crypto from 'node:crypto';
// 静态资源按内容加版本号，发版后浏览器/CDN 不会拿到旧缓存 / content-hash cache-busting for static assets
const assetV = (f) => crypto.createHash('sha256').update(fs.readFileSync(new URL(`../assets/${f}`, import.meta.url))).digest('hex').slice(0, 10);
const ASSET_V = { css: assetV('style.css'), js: assetV('main.js') };
// HTML 模板 / HTML templates (plain template strings, no framework)
import { esc } from './markdown.mjs';
import { LANGS } from './i18n.mjs';

export const icon = {
  arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11 11 5M6.5 5H11v4.5"/></svg>',
  right: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  github: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 7H4V5h16v2Zm0 6H4v-2h16v2Zm0 6H4v-2h16v2Z"/></svg>',
  rss: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 2.5a.5.5 0 0 1 .5-.5A11.5 11.5 0 0 1 14 13.5a.5.5 0 0 1-1 0A10.5 10.5 0 0 0 2.5 3a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5A6.5 6.5 0 0 1 9 13.5a.5.5 0 0 1-1 0A5.5 5.5 0 0 0 2.5 8a.5.5 0 0 1-.5-.5ZM3.5 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>',
  auto: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="M8 2.5v11a5.5 5.5 0 0 0 0-11Z" fill="currentColor"/></svg>',
  sun: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="2.8"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"/></svg>',
  moon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1Z"/></svg>',
};
// fix a typo-safe github path (keeps the original icon geometry)

// 自有站点标识（打开的书），不使用任何官方标志 / Own mark: an open book. No official logos.
export const mark = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="9" fill="currentColor"/><path d="M8 10.2c2.7-1 5.3-.7 8 1.1 2.7-1.8 5.3-2.1 8-1.1v11.6c-2.7-1-5.3-.7-8 1.1-2.7-1.8-5.3-2.1-8-1.1Z" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linejoin="round"/><path d="M16 11.3v11.6" stroke="var(--bg)" stroke-width="2"/></svg>`;

const BOT_RE = 'bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|embedly|quora link preview|pinterest|vkshare|w3c_validator|whatsapp|telegram|discord|skype|slack|lighthouse|pagespeed|gptbot|chatgpt|oai-searchbot|claude|anthropic|perplexity|ccbot|bytespider|amazonbot|applebot|duckassist|cohere|google-extended|yandex|baidu|sogou|360spider';

// 渲染在 <head> 最前面：主题（防闪烁）+ 首次访问语言跳转
// Runs first in <head>: theme (no flash) + first-visit language redirect.
function headScript({ zhPath }) {
  return `<script>(function(){var d=document.documentElement;d.classList.add('js');var p='auto';try{p=localStorage.getItem('sg-theme')||'auto'}catch(e){}var dk=p==='dark'||(p!=='light'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);d.setAttribute('data-theme',dk?'dark':'light');d.setAttribute('data-theme-pref',p);${
    zhPath
      ? `try{var s=localStorage.getItem('sg-lang');if(!s){if(/${BOT_RE}/i.test(navigator.userAgent||''))return;var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';s=/^zh(-|$)/i.test(l)?'zh':'en';localStorage.setItem('sg-lang',s)}if(s==='zh')location.replace(${JSON.stringify(zhPath)}+location.search+location.hash)}catch(e){}`
      : ''
  }})();</script>`;
}

export function themeToggle(t) {
  return `<div class="theme-toggle" role="group" aria-label="${esc(t.theme.label)}">${['auto', 'light', 'dark']
    .map((k) => `<button type="button" data-theme-set="${k}" title="${esc(t.theme[k])}" aria-label="${esc(t.theme[k])}">${icon[k === 'auto' ? 'auto' : k === 'light' ? 'sun' : 'moon']}</button>`)
    .join('')}</div>`;
}

export function layout(ctx) {
  const { site, lang, t, page, body, active = '', bodyClass = '' } = ctx;
  const L = LANGS[lang];
  const b = site.base;
  const root = b + L.prefix;
  const other = lang === 'en' ? 'zh' : 'en';
  const fullTitle = page.title ? `${page.title} · ${site.title}` : `${site.title} · ${t.siteTagline}`;
  const desc = page.description || t.description;
  const canonical = page.alternates[lang];
  const nav = [['home', t.nav.home, root], ['archive', t.nav.archive, `${root}archive/`], ['guide', t.nav.guide, `${root}guide/`]];
  const zhPath = lang === 'en' && page.altPaths.zh ? page.altPaths.zh : '';
  const ogImg = page.image;
  const ogAlt = page.imageAlt || page.title || site.title;
  const head = [
    `<meta charset="utf-8">`,
    headScript({ zhPath }),
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    page.noindex ? `<meta name="robots" content="noindex">` : '',
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

  const switchHref = page.altPaths[other] || b + LANGS[other].prefix;
  const langSwitch = (cls = '') => `<a class="btn btn-soft btn-sm lang-switch ${cls}" href="${switchHref}" hreflang="${LANGS[other].hreflang}" lang="${LANGS[other].htmlLang}" data-set-lang="${other}" title="${esc(t.switchToLabel)}" aria-label="${esc(t.switchToLabel)}">${esc(t.switchTo)}</a>`;

  return `<!doctype html>
<html lang="${L.htmlLang}">
<head>
${head}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-header">
  <nav class="nav container" aria-label="Main">
    <a class="brand" href="${root}" aria-label="${esc(site.title)}">${mark}<span>${esc(site.title)}</span></a>
    <div class="nav-links">
      ${nav.map(([k, x, h]) => `<a href="${h}"${k === active ? ' aria-current="page"' : ''}>${x}</a>`).join('')}
      <a href="${site.repo}" target="_blank" rel="noopener">${t.nav.github}</a>
    </div>
    <div class="nav-cta">
      ${langSwitch()}
      <span class="hide-sm">${themeToggle(t)}</span>
      <a class="btn btn-solid btn-sm hide-xs" href="${root}latest/">${esc(t.latest)}</a>
      <button class="btn btn-soft btn-icon nav-toggle" type="button" aria-label="${esc(t.menu)}" aria-expanded="false">${icon.menu}</button>
    </div>
  </nav>
  <div class="mobile-menu" hidden>
    ${nav.map(([, x, h]) => `<a href="${h}">${x}</a>`).join('')}
    <a href="${root}latest/">${esc(t.latest)}</a>
    <a href="${site.repo}" target="_blank" rel="noopener">GitHub ↗</a>
    <div class="mm-row"><span>${esc(t.theme.label)}</span>${themeToggle(t)}</div>
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

export function footer(site, lang, t) {
  const root = site.base + LANGS[lang].prefix;
  const f = t.footer;
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="brand" href="${root}">${mark}<span>${esc(site.title)}</span></a>
        <p>${esc(t.description)}</p>
      </div>
      <div class="footer-cols">
        <div><h2>${f.content}</h2><a href="${root}latest/">${f.latest}</a><a href="${root}archive/">${f.archive}</a><a href="${root}feed.xml">${f.rss}</a></div>
        <div><h2>${f.guide}</h2><a href="${root}guide/getting-started/">${f.gs}</a><a href="${root}guide/concepts/">${f.concepts}</a><a href="${root}guide/faq/">${f.faq}</a></div>
        <div><h2>${f.community}</h2><a href="${site.repo}" target="_blank" rel="noopener">${f.repo}</a><a href="${site.repo}/issues" target="_blank" rel="noopener">${f.submit}</a></div>
      </div>
    </div>
    <div class="disclaimer" role="note">
      <p><strong>${f.noticeLabel}</strong> ${esc(f.notice)}</p>
      <p class="repo-line">${icon.github}<a href="${site.repo}" target="_blank" rel="noopener">${site.repo.replace('https://', '')}</a><span>${esc(f.repoNote)}</span></p>
    </div>
  </div>
</footer>`;
}

export const tagList = (tags = []) =>
  tags.length ? `<ul class="tags">${tags.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';

export function issueRow(href, it, t) {
  return `<a class="issue-row reveal" href="${href}">
  <span class="ir-no">${esc(t.noLabel(it.no))}</span>
  <span class="ir-main"><span class="ir-title">${esc(it.title)}</span><span class="ir-sum">${esc(it.summary)}</span></span>
  <time class="ir-date" datetime="${it.date}">${it.date}</time>
  <span class="ir-go" aria-hidden="true">${icon.right}</span>
</a>`;
}
