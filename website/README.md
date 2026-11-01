# Study GrokBot · 网站 / website

> 非官方社区项目，与 SpaceXAI / xAI 及 Grok Bot 官方无任何关联。
> Unofficial community project, not affiliated with SpaceXAI / xAI.

零框架静态站：Markdown → HTML，运行时依赖只有 `marked` + `gray-matter`。英文为默认语言（站点根目录），简体中文在 `/zh/`。
No-framework static site. English is the default language at the root; Simplified Chinese lives under `/zh/`.

## 常用命令 / commands

```bash
npm install
npm run dev        # 构建 + 本地预览 http://localhost:4173（改文件自动重建）
npm run build      # 输出到 dist/
npm run og         # 把 dist/og/*.svg 渲染成 PNG（需要 Playwright Chromium：npx playwright install chromium）
npm run check      # 校验：内部链接/锚点、JSON-LD、hreflang、canonical、sitemap、无 Google Fonts 引用
npm run new -- "GrokBot的Routines入门" "Getting started with Routines" 2026-11-02   # 同时新建中英两份（draft: true）
```

线上地址 / Live site: **https://studygrokbot.com/**（`site.config.mjs` 默认值，`base` = `/`；`study-grokbot.com` 在注册商处 301 到主域名）。
`public/` 下的文件（如 `CNAME`）会原样复制到 `dist/` 根目录。本地预览时 `serve.mjs` 会临时改用 `SITE_URL=http://localhost:4173/`。

## 语言、主题、字体 / i18n, theme, fonts

- 内容：`issues/en/*.md`、`issues/zh/*.md`、`guide/en/*.md`、`guide/zh/*.md`，同名文件互为译文（自动生成 hreflang）。
- 界面文案：`lib/i18n.mjs`。
- 首次访问：浏览器首选语言为 zh / zh-CN / zh-TW / zh-HK / zh-SG 时跳到 `/zh/` 对应页面；英文等其他语言留在英文页。
  选择保存在 `localStorage.sg-lang`，手动点语言切换按钮后以手动选择为准；爬虫 UA 不跳转。
- 主题：自动 / 浅色 / 深色，默认自动（跟随系统），保存在 `localStorage.sg-theme`，`<head>` 内联脚本在首屏绘制前应用。
- 字体：只用设备上已安装的字体，不加载任何网络字体。中文优先宋体（Songti SC、STSong、Noto Serif CJK SC、Source Han Serif、SimSun…），英文优先 Iowan Old Style / Palatino / Georgia，再回落到中文宋体。

## 每天发一期 / publishing an issue

1. `npm run new -- "中文主题" "English topic" YYYY-MM-DD`，会生成 `issues/zh/DATE.md` 和 `issues/en/DATE.md`：

   ```yaml
   ---
   title: 《2026-11-02期：……》
   date: 2026-11-02
   summary: 一句话简介（同时用作 meta description）
   tags: [标签1, 标签2]
   issue: 2
   lang: zh
   draft: true       # 草稿不会发布；DRAFTS=1 npm run dev 可预览
   tldr:             # 「本期要点」框，显示在正文顶部（GEO：便于 AI 摘要引用）
     - 要点一
   qa:               # 「快问快答」，显示在文末（h3 问题 + 回答）
     - q: 问题？
       a: 回答。
   ---
   ```

2. 正文是普通 Markdown，标题可写固定锚点：`## 本期导读 {#intro}`；`{{root}}` 会替换成当前语言的站点根路径。
3. 额外支持的容器（`::: 类型 参数` … `:::`）：

| 容器 | 用途 | 写法 |
| --- | --- | --- |
| `callout 标题` | 重点提示 | 正文 Markdown |
| `prompt [标签]` | 可复制的示例提示词 | 原样文本 |
| `proscons` | 适合/不适合 | `#### 标题` + 列表，两组 |
| `props` | 键值说明 | `- 键: 值` |
| `steps` | 步骤 | `- 标题 \| 说明` |
| `quote @作者 \| 日期 \| 链接` | 社区引用 | 引文；英文版可在 `---` 后写译文 |
| `links` | 链接卡片 | `- [标题](url) \| 站点 \| 日期` |
| `flow` | 简单流程图 | 节点 `- 名称 \| 说明 \| person/terminal`，`---` 后写连线说明 |

## SEO / GEO 产物

| 文件 | 说明 |
| --- | --- |
| 每页 `<head>` | title、description、canonical、hreflang（en / zh-Hans / x-default）、Open Graph、Twitter 卡片、JSON-LD |
| JSON-LD | WebSite、Organization（社区项目）、BlogPosting（期刊）、TechArticle（指南）、CollectionPage（往期）、BreadcrumbList、FAQPage（首页 FAQ） |
| `sitemap.xml` | 带 `xhtml:link` 语言互链 |
| `robots.txt` | 允许所有爬虫（含常见 AI 爬虫），指向 sitemap |
| `feed.xml`、`zh/feed.xml` | 各语言 RSS |
| `llms.txt`、`llms-full.txt` | 给大模型的站点摘要 / 全文（双语） |
| `issues/DATE.md`、`zh/issues/DATE.md` | 每期纯 Markdown 原文（页面用 `<link rel="alternate" type="text/markdown">` 指向） |
| `og/*.png` | 自制分享图（`npm run og` 由 SVG 渲染） |

> 站点部署在域名根目录（studygrokbot.com），所以 `robots.txt`、`llms.txt`、`sitemap.xml` 都会被爬虫直接识别；
> 也可以在 Google Search Console / Bing Webmaster 手动提交 sitemap：https://studygrokbot.com/sitemap.xml

## 目录 / layout

```
website/
├─ issues/{en,zh}/  每日期刊（Markdown）
├─ guide/{en,zh}/   指南页（快速上手 / 核心概念 / 常见问题）
├─ assets/          style.css、main.js、favicon.svg（原样复制到 dist）
├─ public/          原样复制到 dist 根目录（CNAME 等）
├─ lib/             markdown.mjs（渲染 + 容器 + 纯 Markdown 导出）、templates.mjs（页面模板 + SEO head）、i18n.mjs（文案）、og.mjs（分享图 SVG）
├─ scripts/         new-issue.mjs、og.mjs、validate.mjs
├─ site.config.mjs  站点配置（url / base / 语言）
├─ build.mjs        构建脚本
└─ serve.mjs        本地预览服务器
```
