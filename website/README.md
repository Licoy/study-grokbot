English | [简体中文](README_ZH.md)

# Study GrokBot · Website

A static site with no framework: Markdown in, HTML out. The only runtime dependencies are `marked`, `gray-matter` and `remixicon` (icon SVGs inlined at build time). English is the default language at the site root; Simplified Chinese lives under `/zh/`. Each language version shows only that language.

Live site: **https://studygrokbot.com/**. `study-grokbot.com` 301-redirects to it.

## Commands

```bash
npm install
npm run dev          # build + local preview at http://localhost:4173 (rebuilds on change)
npm run build        # output to dist/
npm run font         # download Source Han Sans SC to ~/.cache/study-grokbot/fonts/ (share images only)
npm run og           # render the share images (needs Playwright Chromium: npx playwright install chromium)
npm run build:full   # build → font → og → build
npm run check        # links, anchors, JSON-LD, hreflang, canonical, sitemap, share-card meta, image sizes, no web fonts
npm run readme       # refresh the issue tables in README.md / README_ZH.md
npm run new -- "<Chinese topic>" "English topic" 2026-11-02   # scaffold a new issue in both languages (draft: true)
```

`site.config.mjs` holds the site URL (`SITE_URL`, default `https://studygrokbot.com/`) and base path (`BASE_PATH`, default `/`). Files in `public/` (such as `CNAME`) are copied to the root of `dist/`.

## Languages, theme and fonts

- **Content**: `issues/{en,zh}/*.md` and `guide/{en,zh}/*.md`. Files with the same name are translations of each other and get hreflang links automatically.
- **UI strings**: `lib/i18n.mjs`. Every page uses only its own language; the language menu shows native names (English / 简体中文).
- **Latest issue**: internal "Latest issue" links point straight at the newest issue (`site.latest`, set in `build.mjs`; `latestHref()` in `lib/templates.mjs`). `/latest/` and `/zh/latest/` stay for outside links: a site-styled, `noindex` page that jumps to the issue at once with JS (meta refresh without JS), with its canonical on the issue.
- **Header menus**: language and theme are icon + dropdown menus (`dropdown()` in `lib/templates.mjs`, keyboard support in `assets/main.js`). The buttons are icon-only (label in `aria-label` / `title`); the menu items show full labels. GitHub and X (`site.x`) sit next to them as icon buttons; at 760px and below they move into the mobile menu.
- **Issue reading**: the prose is centred with the TOC on the right and a column of round icon buttons on the left fixed to the vertical centre of the screen and faded out when the footer shows (`readTools()` in `build.mjs`, behaviour in `assets/main.js`): immersive mode (Esc exits), larger / smaller text (saved as `sg-fs` in `localStorage` and restored by the `<head>` script before first paint), copy link, Markdown source, back to top / jump to bottom; hidden at 960px and below. Previous / next issue cards sit at the bottom; when there is none, a greyed-out card says this is the first / latest issue.
- **First visit**: browsers that prefer Chinese are sent to the matching `/zh/` page. The choice is saved in `localStorage.sg-lang`, a manual switch always wins, and crawlers are never redirected.
- **Theme**: auto / light / dark, saved in `localStorage.sg-theme` and applied before first paint.
- **Fonts**: each OS's own UI sans-serif for reading (PingFang SC / Microsoft YaHei / Noto Sans CJK for Chinese; San Francisco / Segoe UI / Roboto for English), set as `--font-zh` / `--font-en` in `assets/style.css`. Site pages load no web fonts.
- **Icons**: [Remix Icon](https://remixicon.com/) only, via `ri('name')` from `lib/icons.mjs`, which inlines the SVG at build time (no icon font, no external request; an unknown name fails the build). See `AGENTS.md` at the repo root.

## Share images (Open Graph / X cards)

- One site image per language (`og/site-en.png`, `og/site-zh.png`) and one per issue per language (`og/issue-DATE-en.png`, `og/issue-DATE-zh.png`). Each is a 1200×630 PNG, aiming for under 300 KB, with text in that language only.
- They are rendered at build time with **Source Han Sans SC** (OFL) from [Adobe's official release](https://github.com/adobe-fonts/source-han-sans/releases). The font is never committed: locally it is cached in `~/.cache/study-grokbot/fonts/source-han-sans-<version>/` (override with `OG_FONT_DIR`), and CI caches it with `actions/cache`, keyed on `SHS_VERSION`.
- `npm run og` fails if the font is missing, and checks with the Chrome DevTools Protocol (`CSS.getPlatformFontsForNode`) that every piece of text actually used Source Han Sans.
- The design follows the site (`lib/og.mjs`): white background with a warm orange glow, black title (the site card uses the homepage title with the orange-gradient "GrokBot"), the capped orb bot (the site logo) on the right looking at the title, and the example Bot avatars at the bottom. Bump `OG_DESIGN` when you change the template so cached PNGs re-render.
- `npm run og` uses Playwright's Chromium (`npx playwright install chromium`) and falls back to the installed Google Chrome.
- All content sits inside a central safe area, because X crops to about 1.91:1 and some clients to 2:1.
- Meta tags: absolute `og:image`, `og:image:type/width/height/alt`, `og:locale` and `og:locale:alternate`, `twitter:card=summary_large_image`, `twitter:image:alt` and `twitter:site`/`twitter:creator` (from `twitter` in `site.config.mjs`).

## Publishing an issue

1. Run `npm run new -- "<Chinese topic>" "English topic" YYYY-MM-DD`. It creates `issues/zh/DATE.md` and `issues/en/DATE.md`:

   ```yaml
   ---
   title: "Issue 2026-11-02: ..."
   date: 2026-11-02
   summary: One-line summary (also the meta description)
   tags: [tag-one, tag-two]
   issue: 2
   lang: en
   draft: true       # drafts are not published; preview with DRAFTS=1 npm run dev
   tldr:             # "Key takeaways" box at the top
     - First takeaway
   qa:               # "Quick answers" at the end
     - q: A question?
       a: The answer.
   ---
   ```

2. Write the body in Markdown. Headings can carry fixed anchors (`## Intro {#intro}`), and `{{root}}` expands to the current language's root path.
3. Set `draft: false`, run `npm run readme`, and push.

Extra containers (`::: type args` … `:::`):

| Container | Use | Body |
| --- | --- | --- |
| `callout Title` | highlighted note | Markdown |
| `prompt [label]` | copyable example prompt | plain text |
| `proscons` | good fit / not a fit | two `#### Heading` + list groups |
| `props` | key/value list | `- key: value` |
| `steps` | numbered steps | `- Title \| description` |
| `quote @author \| date \| url` | community quote | the quote; for a post in another language, write the original, then `---`, then the translation. Only the translation is shown. |
| `links` | link cards | `- [Title](url) \| site \| date` |
| `flow` | simple flow diagram | nodes `- Name \| note \| person/terminal`, edges after `---` |

## Bot avatar spec

Every bot shown on the site (homepage mock, card chips, issue tables, flow diagrams) uses one generator: `lib/avatar.mjs`. The style follows GrokBot's avatar picker and is drawn from scratch as SVG; no official assets are used.

- **Look:** one flat colour from an 11-colour palette (black, grey, red, orange, pink, amber, green, teal, blue, indigo, violet; grouped into colour families) × one of 5 soft shapes (orb, soft triangle, soft square, egg, bean; the orb is the most common) + two capsule eyes cut out of the body (`fill-rule="evenodd"`), tilted and looking up-right: same length, the near eye wider, the far eye narrower. No gradient, gloss or shadow, matching GrokBot's flat marks.
- **Assignment:** the FNV-1a hash of the bot's key picks the colour and shape, so it looks random but stays the same on every build. `BOT_KEYS` maps the English and Chinese names to one key, so a bot looks the same in both languages. When a hashed shape doesn't suit a bot, pin its shape in `PINNED_SHAPES` (the builder is pinned to an orb); other bots are unaffected.
- **Lineup:** the example bots (`LINEUP`) never share a colour, spread across colour families where possible, and never share a shape other than the orb. On a collision the generator moves forward to the next free slot.
- **Usage:** `avatarSvg(name, { size, title, color, shape })` returns inline SVG. `color`/`shape` ids override the hash. In Markdown, a table cell or `::: flow` node whose text is exactly a known bot name gets its avatar automatically. To add a bot, add its names to `BOT_KEYS`.
- **Dark mode:** the black avatar is drawn light instead, like the hero orb (CSS in `assets/style.css`, `.bot-av[data-color=black]`).
- **Hero orb and logo:** `orbSvg()` draws the round bot above the homepage title and the site logo in the header and footer (`mark()` in `lib/templates.mjs`; any element with `data-orb` gets the interaction). It wears a mortarboard (`CAP` in `lib/avatar.mjs`, accent-coloured tassel) tilted on the top-right, which moves with the head. Hovering shows squinting smile eyes (`> <`). The favicon (`assets/favicon.svg`) is a static white version of the same capped bot, drawn from the same `ORB`/`CAP` geometry.
- **Hero orb details:** At rest its two upright capsule eyes sit symmetrically at the centre; they follow the mouse or touch point (`assets/main.js`, the eye on the gaze side narrows slightly), blink and drift when idle, and stay still under `prefers-reduced-motion`. The head uses `--fg` and the eyes `--bg`, so it inverts with the theme.

## Homepage showcase

The chat mock under the homepage title is built from `showcase.chats` in `lib/i18n.mjs` (one entry per Bot plus group chats with `group` and `members`), rendered by `showcase()` in `build.mjs`. Tabs switch between conversations. Once the mock is on screen (`assets/main.js`), messages load one by one: your message is typed into the input and sent, Bots show a typing indicator first, tool lines pop in. After a conversation finishes it moves on to the next one; this auto-advance pauses on hover, off screen or in a hidden tab, and stops for good once the user picks a tab. Its height is locked to the full conversation so nothing shifts. With `prefers-reduced-motion` everything is shown at once and nothing advances. Message tuples:

| Tuple | Renders as |
| --- | --- |
| `['me', text]` | your message bubble |
| `['bot', from, text]` | a Bot reply; `{@Name}` becomes a mention with avatar |
| `['tool', from, icon, text]` | a tool-call line (`icon` is a Remix Icon name) |
| `['file', from, name, meta]` | a file card |
| `['routine', from, title, when]` | a Routine card |
| `['handoff', from, to, [[key, value], …]]` | a handoff card |
| `['approve', from, title, desc, [yes, no]]` | an approval card |
| `['typing', from]` | typing indicator |

## SEO / GEO output

| Output | Notes |
| --- | --- |
| `<head>` | title, description, canonical, hreflang (en / zh-Hans / x-default), Open Graph, X card, JSON-LD |
| JSON-LD | WebSite, Organization, BlogPosting, TechArticle, CollectionPage, BreadcrumbList, FAQPage |
| `sitemap.xml` | with `xhtml:link` language alternates |
| `robots.txt` | allows all crawlers, including AI crawlers |
| `feed.xml`, `zh/feed.xml` | RSS per language |
| `llms.txt`, `llms-full.txt`, `zh/llms.txt`, `zh/llms-full.txt` | LLM-friendly summary and full text, one set per language |
| `issues/DATE.md`, `zh/issues/DATE.md` | raw Markdown of each issue |
| `404.html`, `zh/404.html` | per-language 404 (missing `/zh/` URLs show the Chinese page) |
| `og/*.png` | share images |

## Layout

```
website/
├─ issues/{en,zh}/  daily issues (Markdown)
├─ guide/{en,zh}/   guide pages
├─ assets/          style.css, main.js, favicon.svg
├─ public/          copied to the dist root (CNAME)
├─ lib/             markdown, templates, i18n, icons (Remix Icon), avatar (bot avatars + hero orb), og (share-card template), og-font (font version and paths)
├─ scripts/         new-issue, og, fetch-font, readme-issues, validate
├─ site.config.mjs  site settings
├─ build.mjs        build script
└─ serve.mjs        local preview server
```

---

Unofficial community project, not affiliated with SpaceXAI / xAI or the official Grok Bot.
