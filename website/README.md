English | [简体中文](README_ZH.md)

# Study GrokBot · Website

A static site with no framework: Markdown in, HTML out. The only runtime dependencies are `marked` and `gray-matter`. English is the default language at the site root; Simplified Chinese lives under `/zh/`. Each language version shows only that language.

Live site: **https://studygrokbot.com/**. `study-grokbot.com` 301-redirects to it.

## Commands

```bash
npm install
npm run dev          # build + local preview at http://localhost:4173 (rebuilds on change)
npm run build        # output to dist/
npm run font         # download Source Han Serif SC to ~/.cache/study-grokbot/fonts/ (share images only)
npm run og           # render the share images (needs Playwright Chromium: npx playwright install chromium)
npm run build:full   # build → font → og → build
npm run check        # links, anchors, JSON-LD, hreflang, canonical, sitemap, share-card meta, image sizes, no web fonts
npm run readme       # refresh the issue tables in README.md / README_ZH.md
npm run new -- "<Chinese topic>" "English topic" 2026-11-02   # scaffold a new issue in both languages (draft: true)
```

`site.config.mjs` holds the site URL (`SITE_URL`, default `https://studygrokbot.com/`) and base path (`BASE_PATH`, default `/`). Files in `public/` (such as `CNAME`) are copied to the root of `dist/`.

## Languages, theme and fonts

- **Content**: `issues/{en,zh}/*.md` and `guide/{en,zh}/*.md`. Files with the same name are translations of each other and get hreflang links automatically.
- **UI strings**: `lib/i18n.mjs`. Every page uses only its own language; the language switcher shows native names (English / 简体中文).
- **First visit**: browsers that prefer Chinese are sent to the matching `/zh/` page. The choice is saved in `localStorage.sg-lang`, a manual switch always wins, and crawlers are never redirected.
- **Theme**: auto / light / dark, saved in `localStorage.sg-theme` and applied before first paint.
- **Fonts**: system serif fonts only. Site pages load no web fonts.

## Share images (Open Graph / X cards)

- One site image per language (`og/site-en.png`, `og/site-zh.png`) and one per issue per language (`og/issue-DATE-en.png`, `og/issue-DATE-zh.png`). Each is a 1200×630 PNG, aiming for under 300 KB, with text in that language only.
- They are rendered at build time with **Source Han Serif SC** (OFL) from [Adobe's official release](https://github.com/adobe-fonts/source-han-serif/releases). The font is never committed: locally it is cached in `~/.cache/study-grokbot/fonts/source-han-serif-<version>/` (override with `OG_FONT_DIR`), and CI caches it with `actions/cache`, keyed on `SHS_VERSION`.
- `npm run og` fails if the font is missing, and checks with the Chrome DevTools Protocol (`CSS.getPlatformFontsForNode`) that every piece of text actually used Source Han Serif.
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

- **Look:** one of 11 palette colours (black, brown, red, orange-red, orange, green, teal, blue, purple, pink, grey) × one of 14 shapes (orb, cloud, tilted square, 4-point star, puffy, heart, flower, drop, pill, triangle, rounded square, 6-point star, hexagon, apple) + two white vertical-oval eyes toward the upper right + a soft gloss.
- **Assignment:** the FNV-1a hash of the bot's key picks the colour and shape, so it looks random but stays the same on every build. `BOT_KEYS` maps the English and Chinese names to one key, so a bot looks the same in both languages.
- **Lineup:** the example bots (`LINEUP`) never share a colour or shape. On a collision the generator moves forward to the next free slot.
- **Usage:** `avatarSvg(name, { size, title, color, shape })` returns inline SVG. `color`/`shape` ids override the hash. In Markdown, a table cell or `::: flow` node whose text is exactly a known bot name gets its avatar automatically. To add a bot, add its names to `BOT_KEYS`.
- **Dark mode:** black, grey and brown avatars get a faint light outline (CSS in `assets/style.css`, `.bot-av`).
- **Hero orb:** `orbSvg()` draws the round bot above the homepage title. Its eyes follow the mouse or touch point (`assets/main.js`), blink and drift when idle, and stay still under `prefers-reduced-motion`. Its colours come from the `--orb-*` CSS variables for light and dark mode.

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
├─ lib/             markdown, templates, i18n, avatar (bot avatars + hero orb), og (share-card template), og-font (font version and paths)
├─ scripts/         new-issue, og, fetch-font, readme-issues, validate
├─ site.config.mjs  site settings
├─ build.mjs        build script
└─ serve.mjs        local preview server
```

---

Unofficial community project, not affiliated with SpaceXAI / xAI or the official Grok Bot.
