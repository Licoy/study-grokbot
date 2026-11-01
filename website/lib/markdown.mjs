// Markdown 渲染：marked + 自定义容器（::: type 参数 ... :::）
// Markdown rendering with marked plus a few custom containers.
import { avatarSvg, isKnownBot } from './avatar.mjs';
import { Marked } from 'marked';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const unesc = (s = '') =>
  String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const listItems = (body) =>
  body.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim());

const CONTAINER_RE = /^:::\s*(\w+)[ \t]*(.*)\n([\s\S]*?)\n:::[ \t]*$/gm;
const splitTranslation = (body) => {
  const [orig, ...rest] = body.split(/^---$/m);
  return [orig.trim(), rest.join('---').trim()];
};

export function createRenderer(t) {
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      heading({ tokens, depth }) {
        let html = this.parser.parseInline(tokens);
        let id = '';
        const m = html.match(/\s*\{#([\w-]+)\}\s*$/);
        if (m) { id = m[1]; html = html.slice(0, m.index); }
        if (!id) id = html.replace(/<[^>]+>/g, '').trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${html}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const ext = /^https?:\/\//.test(href);
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
      },
      table(token) {
        const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('');
        const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });
  const inline = (s) => md.parseInline(s);

  const containers = {
    callout: (arg, body) =>
      `<aside class="callout"><div class="callout-lead">${esc(arg || t.calloutDefault)}</div><div class="callout-body">${md.parse(body)}</div></aside>`,
    prompt: (arg, body) =>
      `<div class="prompt"><div class="prompt-head"><span>${esc(arg || t.promptLabel)}</span><button class="copy-btn" type="button" data-copy data-copied="${esc(t.copied)}" data-fail="${esc(t.copyFail)}">${esc(t.copy)}</button></div><pre><code>${esc(body)}</code></pre></div>`,
    proscons: (arg, body) => {
      const parts = body.split(/^####\s+/m).filter((p) => p.trim());
      return `<div class="proscons">${parts.map((p, i) => {
        const [h, ...rest] = p.split('\n');
        const items = listItems(rest.join('\n')).map((x) => `<li>${inline(x)}</li>`).join('');
        return `<div class="pc ${i === 0 ? 'pc-pro' : 'pc-con'}"><div class="pc-h">${esc(h.trim())}</div><ul>${items}</ul></div>`;
      }).join('')}</div>`;
    },
    props: (arg, body) =>
      `<dl class="props">${listItems(body).map((l) => {
        const i = l.indexOf(':');
        return `<div class="prop"><dt>${inline(l.slice(0, i).trim())}</dt><dd>${inline(l.slice(i + 1).trim())}</dd></div>`;
      }).join('')}</dl>`,
    steps: (arg, body) =>
      `<ol class="steps">${listItems(body).map((l) => {
        const [h, ...d] = l.split('|');
        return `<li><div class="step-t">${inline(h.trim())}</div><div class="step-d">${inline(d.join('|').trim())}</div></li>`;
      }).join('')}</ol>`,
    quote: (arg, body) => {
      const [who = '', date = '', url = ''] = (arg || '').split('|').map((s) => s.trim());
      const [orig, tr] = splitTranslation(body);
      const link = url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(url.replace(/^https?:\/\//, ''))}</a>` : '';
      // 只显示当前语言：有译文时只放译文，原文请看原帖链接 / show only the page language: the translation replaces the original
      return `<figure class="quote"><blockquote>${md.parse(tr || orig)}</blockquote><figcaption><span class="q-who">${esc(who)}</span>${date ? `<span class="q-dot">·</span><time datetime="${esc(date)}">${esc(date)}</time>` : ''}${tr ? `<span class="q-dot">·</span><span class="q-tr-note">${esc(t.translated)}</span>` : ''}${link ? `<span class="q-dot">·</span>${link}` : ''}</figcaption></figure>`;
    },
    links: (arg, body) =>
      `<div class="link-cards">${listItems(body).map((l) => {
        const [a, site = '', date = ''] = l.split('|').map((s) => s.trim());
        const m = a.match(/^\[(.+)\]\((.+)\)$/);
        if (!m) return '';
        return `<a class="link-card" href="${esc(m[2])}" target="_blank" rel="noopener"><span class="lc-title">${esc(m[1])}</span><span class="lc-meta">${esc(site)}${date ? ` · ${esc(date)}` : ''}</span><span class="lc-arrow" aria-hidden="true">↗</span></a>`;
      }).join('')}</div>`,
    flow: (arg, body) => {
      const [nodesPart, edgesPart = ''] = body.split(/^---$/m);
      const nodes = listItems(nodesPart).map((l) => {
        const [label, detail = '', kind = ''] = l.split('|').map((s) => s.trim());
        const av = isKnownBot(label) ? avatarSvg(label, { size: 24, title: '' }) : '';
        return `<div class="flow-node ${kind ? 'is-' + kind : ''}${av ? ' is-bot' : ''}"><div class="fn-label">${av}${esc(label)}</div>${detail ? `<div class="fn-detail">${esc(detail)}</div>` : ''}</div>`;
      });
      const edges = listItems(edgesPart).map((l) => `<li class="${l.includes('⇢') ? 'dashed' : ''}">${esc(l)}</li>`);
      return `<div class="flow"><div class="flow-nodes">${nodes.join('<span class="flow-arrow" aria-hidden="true">→</span>')}</div>${edges.length ? `<ul class="flow-edges">${edges.join('')}</ul>` : ''}</div>`;
    },
  };

  return function render(src, vars = {}) {
    src = fillVars(src, vars);
    const blocks = [];
    src = src.replace(CONTAINER_RE, (all, type, arg, body) => {
      const fn = containers[type];
      if (!fn) return all;
      blocks.push(fn(arg.trim(), body));
      return `\n<!--BLOCK${blocks.length - 1}-->\n`;
    });
    let html = md.parse(src).replace(/<!--BLOCK(\d+)-->/g, (_, i) => blocks[+i]);
    // 表格里出现的 Bot 名字统一加上头像 / bot names in table cells get their avatar
    html = html.replace(/<td([^>]*)>([^<]+)<\/td>/g, (all, attrs, txt) =>
      isKnownBot(unesc(txt)) ? `<td${attrs}><span class="bot-name">${avatarSvg(unesc(txt), { size: 26, title: '' })}${txt}</span></td>` : all);
    const toc = [...html.matchAll(/<h([23]) id="([^"]+)"><a[^>]*>#<\/a>(.*?)<\/h\1>/g)].map((m) => ({
      depth: +m[1], id: m[2], text: unesc(m[3].replace(/<[^>]+>/g, '')),
    }));
    return { html, toc };
  };
}

export const fillVars = (src, vars) => {
  for (const [k, v] of Object.entries(vars)) src = src.split(`{{${k}}}`).join(v);
  return src;
};

// 把自定义容器转换成普通 Markdown（用于 .md 原文、llms-full.txt）
// Convert custom containers to plain, portable Markdown (raw .md copies and llms-full.txt).
export function toPlainMarkdown(src, t, vars = {}) {
  src = fillVars(src, vars).replace(/^(#{1,6} .*?)\s*\{#[\w-]+\}\s*$/gm, '$1');
  return src.replace(CONTAINER_RE, (all, type, arg, body) => {
    arg = arg.trim();
    switch (type) {
      case 'callout': return `> **${arg || t.calloutDefault}:** ${body.trim().replace(/\n/g, '\n> ')}`;
      case 'prompt': return `**${arg || t.promptLabel}**\n\n\`\`\`text\n${body}\n\`\`\``;
      case 'proscons': return body.replace(/^####\s+(.*)$/gm, '**$1**');
      case 'props': return listItems(body).map((l) => { const i = l.indexOf(':'); return `- **${l.slice(0, i).trim()}:** ${l.slice(i + 1).trim()}`; }).join('\n');
      case 'steps': return listItems(body).map((l, i) => { const [h, ...d] = l.split('|'); return `${i + 1}. **${h.trim()}** - ${d.join('|').trim()}`; }).join('\n');
      case 'quote': {
        const [who = '', date = '', url = ''] = arg.split('|').map((s) => s.trim());
        const [orig, tr] = splitTranslation(body);
        return `> ${(tr || orig).replace(/\n/g, '\n> ')}\n>\n> ${t.source}: ${who}${date ? `, ${date}` : ''}${tr ? ` (${t.translated})` : ''}${url ? `, <${url}>` : ''}`;
      }
      case 'links': return listItems(body).map((l) => { const [a, site = '', date = ''] = l.split('|').map((s) => s.trim()); return `- ${a}${site ? ` - ${site}` : ''}${date ? `, ${date}` : ''}`; }).join('\n');
      case 'flow': {
        const [nodesPart, edgesPart = ''] = body.split(/^---$/m);
        const nodes = listItems(nodesPart).map((l) => { const [n, d] = l.split('|').map((s) => s.trim()); return `- **${n}**${d ? `: ${d}` : ''}`; });
        return `${nodes.join('\n')}\n\n${listItems(edgesPart).map((e) => `- ${e}`).join('\n')}`;
      }
      default: return all;
    }
  });
}
