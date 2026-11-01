// Study GrokBot 静态站构建脚本 / static site builder
// 用法 / usage: node build.mjs   (SITE_URL / BASE_PATH env vars override site.config.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import site from './site.config.mjs';
import { createRenderer, toPlainMarkdown, esc, wrapTitle } from './lib/markdown.mjs';
import { layout, tagList, issueRow, icon, latestHref } from './lib/templates.mjs';
import { ri } from './lib/icons.mjs';
import { LANGS, DEFAULT_LANG, dict } from './lib/i18n.mjs';
import { ogTitle, specHash } from './lib/og.mjs';
import { avatarSvg, orbSvg, LINEUP } from './lib/avatar.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const b = site.base;
const langs = site.langs;

const write = (rel, data) => {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
};
const toDateStr = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));
// p = language-neutral path, e.g. '' | 'archive/' | 'issues/2026-11-01/'
const rel = (lang, p = '') => b + LANGS[lang].prefix + p;
const abs = (lang, p = '') => site.url + LANGS[lang].prefix + p;
const ogUrl = (name) => `${site.url}og/${name}.png`;
const no3 = (n) => String(n).padStart(3, '0');
const domain = new URL(site.url).host;
// 分享图文字 / share-card copy (alt text mirrors what the image shows)
const ogNote = { en: 'Unofficial community project', zh: '非官方社区项目' };
const siteAlt = (lang) => lang === 'zh'
  ? `Study GrokBot 分享图：“${dict.zh.siteTagline}”，每天一期 GrokBot 技巧与玩法 · ${domain} · 非官方社区项目`
  : `Study GrokBot share card: “${dict.en.siteTagline}” - daily GrokBot tips and tricks · ${domain} · unofficial community project`;
const issueAlt = (it) => it.lang === 'zh'
  ? `Study GrokBot 第 ${no3(it.no)} 期（${it.date}）分享图：${ogTitle('zh', it.title)} · ${domain}`
  : `Study GrokBot issue No.${no3(it.no)} (${it.date}) share card: ${ogTitle('en', it.title)} · ${domain}`;

// ---------- 页面元数据 / page meta ----------
function meta(lang, p, available = langs, extra = {}) {
  const alternates = {}, altPaths = {};
  for (const l of available) { alternates[l] = abs(l, p); altPaths[l] = rel(l, p); }
  return { path: p, alternates, altPaths, image: ogUrl(`site-${lang}`), imageAlt: siteAlt(lang), ...extra };
}
const ORG_ID = `${site.url}#org`, SITE_ID = `${site.url}#website`;
function baseGraph(lang) {
  const t = dict[lang];
  return [
    { '@type': 'Organization', '@id': ORG_ID, name: site.title, url: site.url, sameAs: [site.repo],
      logo: { '@type': 'ImageObject', url: `${site.url}assets/favicon.svg` },
      description: t.footer.notice },
    { '@type': 'WebSite', '@id': SITE_ID, url: site.url, name: site.title, description: t.description,
      inLanguage: langs.map((l) => LANGS[l].hreflang), publisher: { '@id': ORG_ID } },
  ];
}
const crumbs = (lang, items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [[dict[lang].breadcrumbHome, abs(lang)], ...items].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});
const graph = (lang, ...nodes) => ({ '@context': 'https://schema.org', '@graph': [...baseGraph(lang), ...nodes] });

// ---------- 读取内容 / load content ----------
function loadIssues(lang) {
  const dir = path.join(root, 'issues', lang);
  if (!fs.existsSync(dir)) return [];
  const t = dict[lang];
  const render = createRenderer(t);
  const files = fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
  return files.map((f, i) => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!data.title) throw new Error(`issues/${lang}/${f}: missing title`);
    const slug = f.replace(/\.md$/, '');
    const vars = { base: b, root: rel(lang) };
    const { html, toc } = render(content, vars);
    return {
      lang, slug, html, toc, content: toPlainMarkdown(content, t, vars).trim(),
      no: data.issue ?? i + 1, title: data.title, date: toDateStr(data.date ?? slug),
      summary: data.summary ?? '', tags: data.tags ?? [], tldr: data.tldr ?? [], qa: data.qa ?? [],
      draft: !!data.draft,
    };
  }).filter((x) => !x.draft || process.env.DRAFTS).sort((a, z) => z.date.localeCompare(a.date));
}
// 阅读时长：中文按每分钟约 400 字，英文按每分钟约 220 词 / reading time: ~400 CJK characters or ~220 English words per minute
const readMinutes = (text, lang) => Math.max(1, Math.round(lang === 'zh'
  ? (text.match(/[\u4e00-\u9fff]/g) || []).length / 400 + (text.match(/[A-Za-z]+/g) || []).length / 220
  : (text.match(/\S+/g) || []).length / 220));
function loadGuides(lang) {
  const t = dict[lang];
  const render = createRenderer(t);
  return site.guide.map((g) => {
    const file = path.join(root, 'guide', lang, g.file);
    if (!fs.existsSync(file)) return null;
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const vars = { base: b, root: rel(lang) };
    const plain = toPlainMarkdown(content, t, vars).trim();
    const { html, toc } = render(content, vars);
    return { ...g, lang, title: data.title, summary: data.summary ?? '', html, toc, content: plain, minutes: readMinutes(plain, lang) };
  }).filter(Boolean);
}

// ---------- 页面 / pages ----------
const tocHtml = (toc, t, label = t.toc) => toc.length
  ? `<nav class="toc" aria-label="${esc(label)}"><div class="toc-h">${esc(label)}</div><ul>${toc.map((x) => `<li class="d${x.depth}"><a href="#${x.id}">${esc(x.text)}</a></li>`).join('')}</ul></nav>`
  : '';



function issuePage(it, prev, next, pairs) {
  const { lang } = it; const t = dict[lang];
  const p = `issues/${it.slug}/`;
  const toc = [...it.toc];
  if (it.qa.length) toc.push({ depth: 2, id: 'qa', text: t.qa });
  const tldr = it.tldr.length ? `<aside class="tldr" aria-labelledby="tldr-h"><div class="tldr-head"><h2 id="tldr-h">${ri('flashlight-line')}${esc(t.tldr)}</h2><span>${esc(t.tldrNote(t.date(it.date)))}</span></div><ul>${it.tldr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></aside>` : '';
  const qa = it.qa.length ? `<section class="qa"><h2 id="qa"><a class="anchor" href="#qa" aria-hidden="true" tabindex="-1">#</a>${esc(t.qa)}</h2>${it.qa.map((x) => `<h3>${esc(x.q)}</h3><p>${esc(x.a)}</p>`).join('')}</section>` : '';
  const body = `
<section class="page-hero">
  <div class="container narrow center">
    <a class="pill reveal" href="${rel(lang, 'archive/')}"><span class="pill-strong">${esc(t.noLabel(it.no))}</span><span class="pill-sep">•</span><time datetime="${it.date}">${t.date(it.date)}</time><span class="pill-icon">${icon.arrow}</span></a>
    <h1 class="display reveal">${wrapTitle(it.title, lang)}</h1>
    <p class="lede reveal">${esc(it.summary)}</p>
    <div class="reveal">${tagList(it.tags)}</div>
  </div>
</section>
<div class="container doc-layout">
  <aside class="doc-aside">${tocHtml(toc, t)}</aside>
  <article class="prose">
    ${tldr}
    ${it.html}
    ${qa}
    <nav class="pager">
      ${next ? `<a class="pager-card" href="${rel(lang, `issues/${next.slug}/`)}"><span>${icon.left}${t.older}</span><strong>${esc(next.title)}</strong></a>` : '<span></span>'}
      ${prev ? `<a class="pager-card right" href="${rel(lang, `issues/${prev.slug}/`)}"><span>${t.newer}${icon.right}</span><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
    </nav>
  </article>
</div>`;
  const url = abs(lang, p);
  const jsonld = graph(lang,
    { '@type': 'BlogPosting', '@id': `${url}#article`, headline: it.title, description: it.summary, abstract: it.tldr.join(' '),
      datePublished: `${it.date}T08:00:00+09:00`, dateModified: `${it.date}T08:00:00+09:00`, inLanguage: LANGS[lang].hreflang,
      url, mainEntityOfPage: url, image: ogUrl(`issue-${it.slug}-${lang}`), keywords: it.tags.join(', '),
      author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID }, isPartOf: { '@id': SITE_ID }, isAccessibleForFree: true,
      position: it.no, encoding: { '@type': 'MediaObject', encodingFormat: 'text/markdown', contentUrl: `${abs(lang)}issues/${it.slug}.md` },
      ...(pairs.length > 1 ? { workTranslation: pairs.filter((l) => l !== lang).map((l) => ({ '@id': `${abs(l, p)}#article` })) } : {}) },
    crumbs(lang, [[t.archivePageTitle, abs(lang, 'archive/')], [it.title, url]]));
  return layout({ site, lang, t, active: 'archive', bodyClass: 'is-doc', body,
    page: meta(lang, p, pairs, { title: it.title, description: it.summary, type: 'article', published: it.date, tags: it.tags,
      image: ogUrl(`issue-${it.slug}-${lang}`), imageAlt: issueAlt(it), markdown: `${rel(lang)}issues/${it.slug}.md`, jsonld }) });
}

// 首页 Bot 小队演示（数据在 i18n 的 showcase.chats）：左侧是 Bot 和群聊，点哪个右侧就切到哪段对话（assets/main.js）
// Home Bot-team demo (data: showcase.chats in i18n): Bots and a group chat on the left; each opens its own conversation (assets/main.js).
const SC_ICON = { file: 'file-text-line', handoff: 'arrow-right-up-line', routine: 'repeat-line', mic: 'mic-line', send: 'arrow-up-line', add: 'add-line' };
function showcase(lang) {
  const s = dict[lang].showcase;
  const av = (n, size) => avatarSvg(n, { size, title: '' });
  const mention = (html) => html.replace(/\{@([^}]+)\}/g, (m, n) => `<span class="mention">${av(n, 15)}@${esc(n)}</span>`);
  const stack = (members, size) => `<span class="sc-stack">${members.map((n) => av(n, size)).join('')}</span>`;
  const msg = (c, m, prev) => {
    const [kind, from] = m;
    if (kind === 'me') return `<div class="m m-me" data-k="me"><div class="m-bubble">${mention(esc(from))}</div></div>`;
    let body;
    if (kind === 'bot') body = `<p>${mention(esc(m[2]))}</p>`;
    else if (kind === 'tool') body = `<span class="m-tool">${ri(m[2])}${esc(m[3])}</span>`;
    else if (kind === 'file') body = `<span class="m-card m-file"><span class="m-ic">${ri(SC_ICON.file)}</span><span><b>${esc(m[2])}</b><i>${esc(m[3])}</i></span></span>`;
    else if (kind === 'routine') body = `<span class="m-card m-routine"><span class="m-ic">${ri(SC_ICON.routine)}</span><span><b>${esc(m[2])}</b><i>${esc(m[3])}</i></span><span class="m-switch" title="${esc(s.routineOn)}"></span></span>`;
    else if (kind === 'handoff') {
      const incoming = c.bot && c.bot === m[2]; // 在接收方的会话里显示“来自 …” / in the receiver's chat it reads "from …"
      body = `<span class="m-card m-handoff"><span class="m-h">${ri(SC_ICON.handoff)}${esc(incoming ? s.handoffFrom : s.handoffTo)} <span class="mention">${av(incoming ? from : m[2], 15)}@${esc(incoming ? from : m[2])}</span></span><span class="m-kv">${m[3].map(([k, v]) => `<span><i>${esc(k)}</i>${esc(v)}</span>`).join('')}</span></span>`;
    } else if (kind === 'approve') body = `<span class="m-card m-approve"><span class="m-tag">${ri('shield-check-line')}${esc(s.approveTag)}</span><b>${esc(m[2])}</b><i>${esc(m[3])}</i><span class="m-acts"><span class="m-btn solid">${esc(m[4][0])}</span><span class="m-btn">${esc(m[4][1])}</span></span></span>`;
    else if (kind === 'typing') body = `<span class="m-typing"><span></span><span></span><span></span></span>`;
    const cont = prev && prev[0] !== 'me' && prev[1] === from; // 同一个 Bot 连续发言时不再重复头像和名字 / no repeated avatar/name for consecutive messages
    return `<div class="m m-bot${cont ? ' cont' : ''}" data-k="${kind}">${cont ? '<span class="m-av"></span>' : `<span class="m-av">${av(from, 28)}</span>`}<div class="m-body">${cont ? '' : `<div class="m-name">${esc(from)}</div>`}${body}</div></div>`;
  };
  const tab = (c) => {
    const id = `sc-${lang}-${c.id}`, on = c.id === s.active;
    const pic = c.group ? stack(c.members, 22) : av(c.bot, 30);
    return `<button class="sc-bot${c.group ? ' is-group' : ''}" type="button" role="tab" id="${id}-tab" aria-controls="${id}" aria-selected="${on}" tabindex="${on ? 0 : -1}">${pic}<span><b>${esc(c.group || c.bot)}</b><i>${esc(c.group ? s.members(c.members.length) : c.role)}</i></span><span class="sc-dot st-${c.status}"></span></button>`;
  };
  const panel = (c) => {
    const id = `sc-${lang}-${c.id}`, on = c.id === s.active, name = c.group || c.bot;
    return `<div class="sc-panel${on ? ' on' : ''}" role="tabpanel" id="${id}" aria-labelledby="${id}-tab"${on ? '' : ' inert'}>
          <div class="sc-top">${c.group ? stack(c.members, 26) : av(c.bot, 28)}<span class="sc-who"><b>${esc(name)}</b><i>${esc(c.group ? c.members.join(' · ') : c.role)}</i></span><span class="sc-status st-${c.status}"><span class="dot"></span>${esc(s.status[c.status])}</span></div>
          <div class="sc-msgs">${c.msgs.map((m, i) => msg(c, m, c.msgs[i - 1])).join('')}</div>
          <div class="sc-input"><span class="sc-add">${ri(SC_ICON.add)}</span><span class="sc-ph">${esc(s.input(name))}</span><span class="sc-mic">${ri(SC_ICON.mic)}</span><span class="sc-send">${ri(SC_ICON.send)}</span></div>
        </div>`;
  };
  const bots = s.chats.filter((c) => !c.group), groups = s.chats.filter((c) => c.group);
  return `<div class="showcase reveal" data-showcase aria-label="${esc(s.label)}">
      <div class="sc-side" role="tablist" aria-orientation="vertical" aria-label="${esc(s.label)}">
        <div class="sc-side-h" role="presentation">${esc(s.team)}</div>
        ${bots.map(tab).join('')}
        <div class="sc-side-h sc-side-h2" role="presentation">${esc(s.groups)}</div>
        ${groups.map(tab).join('')}
      </div>
      <div class="sc-main">
        ${s.chats.map(panel).join('\n        ')}
      </div>
    </div>`;
}

// 首页卡片 / 指南卡片的图标（Remix Icon 名）/ Remix Icon names for the home page cards
const CARD_ICONS = ['lightbulb-flash-line', 'team-line', 'chat-quote-line', 'timer-line'];
const GUIDE_ICONS = { 'getting-started': 'rocket-2-line', concepts: 'book-2-line', faq: 'question-answer-line' };

function homePage(lang, issues) {
  const t = dict[lang]; const s = t.showcase; const latest = issues[0];
  const body = `
<section class="hero">
  <div class="container center">
    <div class="orb-bot" data-orb aria-hidden="true" style="width:88px;height:88px;margin:0 auto 20px">${orbSvg(88)}</div>
    ${latest ? `<a class="pill reveal" href="${rel(lang, `issues/${latest.slug}/`)}"><span class="pill-strong">${esc(t.hero.pill(latest.no))}</span><span class="pill-sep hide-xs">•</span><span class="hide-xs">${esc(latest.title.replace(/[《》]/g, ''))}</span><span class="pill-icon">${icon.arrow}</span></a>` : ''}
    <h1 class="display hero-title" data-split>${t.hero.title}</h1>
    <p class="lede reveal">${esc(t.hero.lede)}</p>
    <div class="cta-row reveal">
      <a class="btn btn-solid" href="${latestHref(site, lang)}">${ri('book-open-line')}${esc(t.hero.primary)}</a>
      <a class="btn btn-soft" href="${rel(lang, 'archive/')}">${ri('archive-line')}${esc(t.hero.secondary)}</a>
    </div>
  </div>
  <div class="container">
    ${showcase(lang)}
  </div>
</section>
${latest ? `<section class="section">
  <div class="container">
    <div class="section-head reveal"><h2 class="h2">${esc(t.latestHead)}</h2><p class="sub">${esc(t.latestSub)}</p></div>
    <a class="feature-card reveal" href="${rel(lang, `issues/${latest.slug}/`)}">
      <div class="fc-left">
        <div class="fc-meta"><span class="badge">${esc(t.noLabel(latest.no))}</span><time datetime="${latest.date}">${t.date(latest.date)}</time></div>
        <h3 class="fc-title">${esc(latest.title)}</h3>
        <p class="fc-sum">${esc(latest.summary)}</p>
        ${tagList(latest.tags)}
        <span class="btn btn-solid fc-btn">${esc(t.readFull)} ${icon.right}</span>
      </div>
      <div class="fc-right">
        <div class="fc-toc-h">${esc(t.inThisIssue)}</div>
        <ol>${latest.toc.filter((x) => x.depth === 2).map((x) => `<li>${esc(x.text)}</li>`).join('')}</ol>
      </div>
    </a>
  </div>
</section>` : ''}
<section class="section">
  <div class="container">
    <div class="section-head center reveal"><h2 class="h2">${esc(t.whatHead)}</h2><p class="sub">${esc(t.whatSub)}</p></div>
    <div class="grid-2">
      ${t.cards.map(([k, h, d], i) => {
        const a = t.cardArt;
        const art = [
          `<div class="card-art art-prompt"><code>${a.prompt}</code></div>`,
          `<div class="card-art art-chips">${a.chips.map((c, i) => `<span>${LINEUP[i] ? avatarSvg(LINEUP[i], { size: 20, title: '' }) : ''}${esc(c)}</span>`).join('')}</div>`,
          `<div class="card-art art-quote">${esc(a.quote)}<span>${esc(a.quoteBy)}</span></div>`,
          `<div class="card-art art-steps">${a.steps.map((c, j) => `<span${j < 2 ? ' class="on"' : ''}>${esc(c)}</span>`).join('')}</div>`,
        ][i];
        return `<div class="card reveal"><div class="card-k">${ri(CARD_ICONS[i])}${esc(k)}</div><h3>${esc(h)}</h3><p>${esc(d)}</p>${art}</div>`;
      }).join('\n      ')}
    </div>
  </div>
</section>
<section class="section">
  <div class="container narrow">
    <div class="section-head reveal row"><div><h2 class="h2">${esc(t.archiveHead)}</h2><p class="sub">${esc(t.archiveSub(issues.length))}</p></div><a class="btn btn-soft btn-sm" href="${rel(lang, 'archive/')}">${esc(t.allIssues)} ${icon.right}</a></div>
    <div class="issue-cards">${issues.slice(0, 7).map((it, i) => issueRow(rel(lang, `issues/${it.slug}/`), it, t, { latest: i === 0 })).join('')}</div>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head center reveal"><h2 class="h2">${esc(t.guideHead)}</h2><p class="sub">${esc(t.guideSub)}</p></div>
    <div class="grid-3">
      ${t.guideCards.map(([sl, h, d]) => `<a class="mini-card reveal" href="${rel(lang, `guide/${sl}/`)}"><span class="mc-icon">${ri(GUIDE_ICONS[sl])}</span><h3>${esc(h)}</h3><p>${esc(d)}</p><span class="mc-go">${icon.right}</span></a>`).join('')}
    </div>
  </div>
</section>
<section class="section" id="faq">
  <div class="container faq-wrap">
    <div class="faq-intro reveal">
      <h2 class="h2">${esc(t.faqHead)}</h2>
      <p class="sub">${esc(t.faqSub)}</p>
      <div class="faq-links">
        <a class="btn btn-soft btn-sm" href="${rel(lang, 'guide/faq/')}">${ri('question-line')}${esc(t.faqMore)}</a>
        <a class="btn btn-soft btn-sm" href="${site.repo}/issues" target="_blank" rel="noopener">${icon.github}${esc(t.faqAsk)}</a>
      </div>
    </div>
    <div class="faq">
      ${t.faq.map(([q, a], i) => `<details class="reveal"${i === 0 ? ' open' : ''}><summary><span>${esc(q)}</span><span class="faq-icon">${ri('add-line')}</span></summary><p>${esc(a)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="section cta-band">
  <div class="container center">
    <h2 class="h2 reveal">${esc(t.ctaHead)}</h2>
    <p class="sub reveal">${esc(t.ctaSub)}</p>
    <div class="cta-row reveal"><a class="btn btn-solid" href="${site.repo}" target="_blank" rel="noopener">${icon.github} ${esc(t.ctaGithub)}</a><a class="btn btn-soft" href="${rel(lang, 'feed.xml')}">${icon.rss} ${esc(t.rss)}</a></div>
  </div>
</section>`;
  const jsonld = graph(lang,
    { '@type': 'FAQPage', '@id': `${abs(lang)}#faq`, inLanguage: LANGS[lang].hreflang,
      mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    crumbs(lang, []));
  return layout({ site, lang, t, active: 'home', bodyClass: 'is-home', body, page: meta(lang, '', langs, { description: t.description, jsonld }) });
}

function archivePage(lang, issues) {
  const t = dict[lang];
  const byMonth = {};
  for (const it of issues) (byMonth[it.date.slice(0, 7)] ??= []).push(it);
  // 按月分组的时间线：左侧月份（滚动时吸顶），右侧当月的期刊卡片 / monthly timeline: sticky month on the left, issue cards on the right
  const body = `
<section class="page-hero">
  <div class="container narrow center">
    <h1 class="display reveal">${esc(t.archivePageTitle)}</h1>
    <p class="lede reveal">${esc(t.archivePageLede(issues.length))}</p>
    <div class="cta-row reveal">
      ${issues[0] ? `<a class="btn btn-solid" href="${latestHref(site, lang)}">${ri('sparkling-line')}${esc(t.latest)}</a>` : ''}
      <a class="btn btn-soft" href="${rel(lang, 'feed.xml')}">${icon.rss}${esc(t.rss)}</a>
    </div>
  </div>
</section>
<div class="container archive">
  ${Object.entries(byMonth).map(([m, list]) => `<section class="arc-month">
    <h2 class="arc-m reveal"><span class="arc-m-name">${esc(t.month(m))}</span><span class="arc-m-count">${esc(t.monthCount(list.length))}</span></h2>
    <div class="issue-cards">${list.map((it) => issueRow(rel(lang, `issues/${it.slug}/`), it, t, { latest: it === issues[0] })).join('')}</div>
  </section>`).join('\n  ')}
</div>`;
  const jsonld = graph(lang,
    { '@type': 'CollectionPage', '@id': `${abs(lang, 'archive/')}#page`, name: t.archivePageTitle, url: abs(lang, 'archive/'), inLanguage: LANGS[lang].hreflang, isPartOf: { '@id': SITE_ID },
      hasPart: issues.map((it) => ({ '@id': `${abs(lang, `issues/${it.slug}/`)}#article` })) },
    crumbs(lang, [[t.archivePageTitle, abs(lang, 'archive/')]]));
  return layout({ site, lang, t, active: 'archive', body, page: meta(lang, 'archive/', langs, { title: t.archivePageTitle, description: t.archivePageLede(issues.length), jsonld }) });
}

const guidePath = (g) => `guide/${g.slug ? g.slug + '/' : ''}`;
function guidePage(g, guides, pairs) {
  const { lang } = g; const t = dict[lang];
  const nav = `<nav class="toc guide-nav" aria-label="${esc(t.guideLabel)}"><div class="toc-h">${esc(t.guideHead)}</div><ul>${guides
    .map((x) => `<li class="d2"><a href="${rel(lang, guidePath(x))}"${x === g ? ' aria-current="page"' : ''}>${esc(x.title)}</a></li>`).join('')}</ul></nav>`;
  const body = `
<section class="page-hero">
  <div class="container narrow center">
    <a class="pill reveal" href="${rel(lang, 'guide/')}"><span class="pill-strong">${esc(t.guideLabel)}</span><span class="pill-sep">•</span><span>${esc(t.readTime(g.minutes))}</span><span class="pill-icon">${icon.arrow}</span></a>
    <h1 class="display reveal">${wrapTitle(g.title, lang)}</h1>
    <p class="lede reveal">${esc(g.summary)}</p>
  </div>
</section>
<div class="container doc-layout">
  <aside class="doc-aside">${nav}${tocHtml(g.toc.filter((x) => x.depth === 2), t, t.pageToc)}</aside>
  <article class="prose">${g.html}</article>
</div>`;
  const p = guidePath(g);
  const items = [[t.guideHead, abs(lang, 'guide/')]];
  if (g.slug) items.push([g.title, abs(lang, p)]);
  const jsonld = graph(lang,
    { '@type': 'TechArticle', '@id': `${abs(lang, p)}#article`, headline: g.title, description: g.summary, inLanguage: LANGS[lang].hreflang,
      url: abs(lang, p), author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID }, isPartOf: { '@id': SITE_ID } },
    crumbs(lang, items));
  return layout({ site, lang, t, active: 'guide', bodyClass: 'is-doc', body, page: meta(lang, p, pairs, { title: g.title, description: g.summary, jsonld }) });
}

// ---------- feeds / sitemap / GEO ----------
function feed(lang, issues) {
  const t = dict[lang];
  const items = issues.slice(0, 30).map((it) => {
    const u = abs(lang, `issues/${it.slug}/`);
    return `<item><title>${esc(it.title)}</title><link>${u}</link><guid isPermaLink="true">${u}</guid><pubDate>${new Date(it.date + 'T08:00:00+09:00').toUTCString()}</pubDate><description>${esc(it.summary)}</description>${it.tags.map((x) => `<category>${esc(x)}</category>`).join('')}</item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${esc(site.title)}${lang === 'en' ? '' : ' · ' + esc(t.siteTagline)}</title><link>${abs(lang)}</link><description>${esc(t.description)}</description><language>${lang === 'en' ? 'en' : 'zh-cn'}</language>
<atom:link href="${abs(lang, 'feed.xml')}" rel="self" type="application/rss+xml"/>
${items}
</channel></rss>\n`;
}

function sitemap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(({ alternates, lastmod }) => Object.entries(alternates).map(([l, u]) => `<url><loc>${u}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${Object.entries(alternates).map(([l2, u2]) => `<xhtml:link rel="alternate" hreflang="${LANGS[l2].hreflang}" href="${u2}"/>`).join('')}${alternates.en ? `<xhtml:link rel="alternate" hreflang="x-default" href="${alternates.en}"/>` : ''}</url>`).join('\n')).join('\n')}
</urlset>\n`;
}

const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'CCBot', 'Amazonbot', 'meta-externalagent', 'DuckAssistBot', 'cohere-ai', 'YouBot', 'MistralAI-User', 'Bytespider'];
const robots = () => `# Study GrokBot - unofficial community learning site. All crawlers, including AI crawlers, are welcome.
User-agent: *
Allow: /

${AI_BOTS.map((x) => `User-agent: ${x}\nAllow: /`).join('\n\n')}

Sitemap: ${site.url}sitemap.xml
# LLM-friendly summaries: ${site.url}llms.txt  ${site.url}llms-full.txt
`;


function issueMarkdown(it) {
  const t = dict[it.lang]; const other = langs.filter((l) => l !== it.lang);
  const u = abs(it.lang, `issues/${it.slug}/`);
  return `# ${it.title}

> ${it.summary}

- ${it.lang === 'en' ? 'Issue' : '期号'}: ${t.noLabel(it.no)}
- ${it.lang === 'en' ? 'Published' : '发布日期'}: ${it.date}
- ${it.lang === 'en' ? 'Tags' : '标签'}: ${it.tags.join(', ')}
- URL: ${u}
${other.map((l) => `- ${LANGS[l].label}: ${abs(l, `issues/${it.slug}/`)}`).join('\n')}
- ${it.lang === 'en' ? 'Source' : '来源'}: ${site.title} (${site.url}) - ${t.footer.notice}

${it.tldr.length ? `## ${t.tldr}\n\n${it.tldr.map((x) => `- ${x}`).join('\n')}\n\n` : ''}${it.content}
${it.qa.length ? `\n## ${t.qa}\n\n${it.qa.map((x) => `### ${x.q}\n\n${x.a}`).join('\n\n')}\n` : ''}`;
}

// llms.txt / llms-full.txt：每种语言一份（英文在根目录，中文在 /zh/）/ one file per language
const LLMS = {
  en: { issues: 'Issues', guide: 'Guide', site: 'Website', rss: 'RSS', repo: 'Source repository',
    md: (u) => `Every issue is also available as plain Markdown (append \`.md\` to the issue path, e.g. ${u}).`,
    extra: 'Each issue has a dated "Key takeaways" list and "Quick answers" Q&A; community picks link to original posts and their authors.',
    optional: 'Optional', full: 'full text of every issue and guide page.', other: '简体中文', fullTitle: 'full text', repoLabel: 'Repository' },
  zh: { issues: '期刊', guide: '学习指南', site: '网站', rss: 'RSS 订阅', repo: '源码仓库',
    md: (u) => `每一期都有纯 Markdown 版本（在期刊路径后加 \`.md\`，例如 ${u}）。`,
    extra: '每期都有带日期的“本期要点”和“快问快答”；社区玩法均附原帖链接和作者。',
    optional: '可选', full: '全部期刊与指南的全文。', other: 'English', fullTitle: '全文', repoLabel: '仓库' },
};
function llmsTxt(lang, all, guides) {
  const t = dict[lang], L = LLMS[lang], o = langs.find((l) => l !== lang);
  return `# ${site.title}

> ${t.description}

${t.footer.notice}

- ${L.site}: ${abs(lang)}
- ${L.rss}: ${abs(lang, 'feed.xml')}
- ${L.repo}: ${site.repo}
- ${L.md(`${abs(lang)}issues/${all[lang][0]?.slug}.md`)}
- ${L.extra}

## ${L.issues}

${all[lang].map((it) => `- [${it.title}](${abs(lang, `issues/${it.slug}/`)}): ${it.date}. ${it.summary} Markdown: ${abs(lang)}issues/${it.slug}.md`).join('\n')}

## ${L.guide}

${guides[lang].map((g) => `- [${g.title}](${abs(lang, guidePath(g))}): ${g.summary}`).join('\n')}

## ${L.optional}

- [llms-full.txt](${abs(lang)}llms-full.txt): ${L.full}
${o ? `- [${L.other}](${abs(o)}llms.txt)\n` : ''}`;
}

function llmsFull(lang, all, guides) {
  const t = dict[lang], L = LLMS[lang];
  const parts = [`# ${site.title} - ${L.fullTitle}\n\n> ${t.description}\n\n${t.footer.notice}\n\n${L.site}: ${abs(lang)} · ${L.repoLabel}: ${site.repo}`];
  for (const it of all[lang]) parts.push(issueMarkdown(it));
  for (const g of guides[lang]) parts.push(`# ${g.title}\n\n> ${g.summary}\n\n- URL: ${abs(lang, guidePath(g))}\n\n${g.content}`);
  return parts.join('\n\n---\n\n') + '\n';
}

// ---------- 主流程 / main ----------
const t0 = Date.now();
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
// public/ → dist 根目录（CNAME 等）/ copied verbatim to the dist root
if (fs.existsSync(path.join(root, 'public'))) fs.cpSync(path.join(root, 'public'), dist, { recursive: true });

const all = {}, guides = {};
for (const l of langs) { all[l] = loadIssues(l); guides[l] = loadGuides(l); }
// 站内“最新一期”链接直接指向当期文章（templates.mjs 的 latestHref）/ internal "Latest issue" links point straight at the issue
site.latest = Object.fromEntries(langs.filter((l) => all[l][0]).map((l) => [l, rel(l, `issues/${all[l][0].slug}/`)]));
const sm = [{ alternates: Object.fromEntries(langs.map((l) => [l, abs(l)])), lastmod: all.en[0]?.date },
  { alternates: Object.fromEntries(langs.map((l) => [l, abs(l, 'archive/')])), lastmod: all.en[0]?.date }];
const og = {};

for (const lang of langs) {
  const t = dict[lang]; const issues = all[lang];
  const pfx = LANGS[lang].prefix;
  issues.forEach((it, i) => {
    const pairs = langs.filter((l) => all[l].some((x) => x.slug === it.slug));
    write(`${pfx}issues/${it.slug}/index.html`, issuePage(it, issues[i - 1], issues[i + 1], pairs));
    write(`${pfx}issues/${it.slug}.md`, issueMarkdown(it));
    og[`issue-${it.slug}-${lang}`] = { lang, kind: 'issue', badge: lang === 'zh' ? `第 ${no3(it.no)} 期` : `Issue ${no3(it.no)}`,
      kicker: t.date(it.date), title: ogTitle(lang, it.title), sub: it.summary, domain, note: ogNote[lang] };
    if (lang === DEFAULT_LANG || !pairs.includes(DEFAULT_LANG)) sm.push({ alternates: Object.fromEntries(pairs.map((l) => [l, abs(l, `issues/${it.slug}/`)])), lastmod: it.date });
  });
  write(`${pfx}index.html`, homePage(lang, issues));
  write(`${pfx}archive/index.html`, archivePage(lang, issues));
  if (issues[0]) {
    // /latest/ 只给站外链接用（站内链接已直接指向当期）：用站点样式渲染，立即跳到当期，canonical 指向当期
    // /latest/ is for outside links only (internal links already point at the issue): site-styled, jumps at once, canonical = the issue
    const it = issues[0], to = rel(lang, `issues/${it.slug}/`);
    const pairs = langs.filter((l) => all[l].some((x) => x.slug === it.slug));
    write(`${pfx}latest/index.html`, layout({ site, lang, t, page: { ...meta(lang, `issues/${it.slug}/`, pairs), title: t.latest, noindex: true, redirect: to },
      body: `<section class="page-hero latest-go"><div class="container narrow center">
  <div class="orb-bot" data-orb aria-hidden="true">${orbSvg(88)}</div>
  <p class="lede">${esc(t.latestGo)}</p>
  <div class="issue-cards">${issueRow(to, it, t, { latest: true })}</div>
</div></section>` }));
  }
  for (const g of guides[lang]) {
    const pairs = langs.filter((l) => guides[l].some((x) => x.slug === g.slug));
    write(`${pfx}${guidePath(g)}index.html`, guidePage(g, guides[lang], pairs));
    if (lang === DEFAULT_LANG || !pairs.includes(DEFAULT_LANG)) sm.push({ alternates: Object.fromEntries(pairs.map((l) => [l, abs(l, guidePath(g))])) });
  }
  write(`${pfx}feed.xml`, feed(lang, issues));
  // 站点分享图的标题就是首页标题，第一个 GrokBot 用橙色渐变 / the site card uses the hero title, first "GrokBot" in the orange gradient
  og[`site-${lang}`] = { lang, kind: 'site', badge: lang === 'zh' ? '每日更新' : 'Updated daily',
    kicker: lang === 'en' ? 'Daily GrokBot tips, written by GrokBot' : '每天一期 GrokBot 技巧与玩法', title: t.siteTagline, accent: 'GrokBot',
    sub: lang === 'en' ? 'Tips you can use today, worked examples, and picks from the community.' : '马上能用的技巧、示例拆解，以及社区玩家的精选分享。', domain, note: ogNote[lang] };
}

// 404：每种语言一份。GitHub Pages 只用根目录的 404.html，所以 /zh/ 下的缺失地址由一小段脚本换成中文版（不跳转，地址不变）。
// 404 per language. Pages only serves the root 404.html, so for missing /zh/ URLs a tiny script swaps in zh/404.html in place.
for (const lang of langs) {
  const t = dict[lang];
  const swap = lang === DEFAULT_LANG ? `<script>(function(){var b=${JSON.stringify(b)},p=location.pathname;${langs.filter((l) => l !== lang).map((l) => `if(p.indexOf(b+${JSON.stringify(LANGS[l].prefix)})===0){fetch(b+${JSON.stringify(LANGS[l].prefix + '404.html')}).then(function(r){return r.ok?r.text():null}).then(function(h){if(h){document.open();document.write(h);document.close();}});return;}`).join('')}})();</script>` : '';
  write(`${LANGS[lang].prefix}404.html`, layout({ site, lang, t, page: { ...meta(lang, '404.html', [lang]), title: t.notFoundTitle, noindex: true },
    body: `${swap}<section class="page-hero"><div class="container narrow center"><h1 class="display">404</h1><p class="lede">${t.notFound}</p><div class="cta-row"><a class="btn btn-solid" href="${rel(lang)}">${ri('home-5-line')}${t.backHome}</a><a class="btn btn-soft" href="${rel(lang, 'archive/')}">${t.nav.archive}</a></div></div></section>` }));
}

write('sitemap.xml', sitemap(sm));
write('robots.txt', robots());
for (const lang of langs) { write(`${LANGS[lang].prefix}llms.txt`, llmsTxt(lang, all, guides)); write(`${LANGS[lang].prefix}llms-full.txt`, llmsFull(lang, all, guides)); }
// 分享图：写出 spec（scripts/og.mjs 渲染），并复用 spec 未变的已渲染 PNG
// OG cards: write specs for scripts/og.mjs and reuse cached PNGs whose spec hash still matches
const ogCache = path.join(root, '.og-cache');
fs.mkdirSync(ogCache, { recursive: true });
fs.writeFileSync(path.join(ogCache, 'specs.json'), JSON.stringify(og, null, 2));
fs.mkdirSync(path.join(dist, 'og'), { recursive: true });
for (const [name, spec] of Object.entries(og)) {
  const png = path.join(ogCache, `${name}.png`), h = path.join(ogCache, `${name}.hash`);
  if (fs.existsSync(png) && fs.existsSync(h) && fs.readFileSync(h, 'utf8').trim() === specHash(spec)) fs.copyFileSync(png, path.join(dist, 'og', `${name}.png`));
}
write('.nojekyll', '');

console.log(`✓ built ${langs.map((l) => `${l}: ${all[l].length} issues/${guides[l].length} guide`).join(', ')} → dist/ (url=${site.url}, base=${b}, ${Date.now() - t0}ms)`);
