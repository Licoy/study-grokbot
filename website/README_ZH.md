[English](README.md) | 简体中文

# Study GrokBot · 网站

零框架静态站：Markdown 转 HTML，运行时依赖只有 `marked` 和 `gray-matter`。英文是默认语言，放在站点根目录；简体中文放在 `/zh/` 下。每个语言版本只显示该语言的内容。

线上地址：**https://studygrokbot.com/**（`study-grokbot.com` 会 301 跳转到这里）。

## 常用命令

```bash
npm install
npm run dev          # 构建并本地预览 http://localhost:4173（改文件自动重建）
npm run build        # 输出到 dist/
npm run font         # 下载思源宋体 SC 到 ~/.cache/study-grokbot/fonts/（只用于分享图）
npm run og           # 渲染分享图（需要 Playwright Chromium：npx playwright install chromium）
npm run build:full   # build → font → og → build
npm run check        # 校验链接、锚点、JSON-LD、hreflang、canonical、sitemap、分享卡片 meta、图片大小，并确认没有 web 字体
npm run readme       # 更新 README.md / README_ZH.md 里的往期表格
npm run new -- "中文主题" "English topic" 2026-11-02   # 同时新建中英两份草稿（draft: true）
```

`site.config.mjs` 里配置站点地址（`SITE_URL`，默认 `https://studygrokbot.com/`）和基础路径（`BASE_PATH`，默认 `/`）。`public/` 下的文件（如 `CNAME`）会原样复制到 `dist/` 根目录。

## 语言、主题、字体

- **内容**：`issues/{en,zh}/*.md`、`guide/{en,zh}/*.md`，同名文件互为译文，自动生成 hreflang。
- **界面文案**：`lib/i18n.mjs`。每个页面只用自己的语言；语言切换按钮显示各语言的原名（English / 简体中文）。
- **首次访问**：浏览器首选中文时跳到对应的 `/zh/` 页面。选择保存在 `localStorage.sg-lang`，手动切换优先；爬虫不跳转。
- **主题**：自动 / 浅色 / 深色，保存在 `localStorage.sg-theme`，首屏绘制前生效。
- **字体**：只用系统里的宋体 / 衬线字体，网站页面不加载任何网络字体。

## 分享图（Open Graph / X 卡片）

- 每种语言一张站点图（`og/site-en.png`、`og/site-zh.png`），每期每种语言一张（`og/issue-DATE-en.png`、`og/issue-DATE-zh.png`）。都是 1200×630 PNG，目标小于 300 KB，图里只有该语言的文字。
- 分享图在构建时用**思源宋体 SC**（Source Han Serif SC，OFL 协议，来自 [Adobe 官方 Release](https://github.com/adobe-fonts/source-han-serif/releases)）渲染。字体不进仓库：本地缓存在 `~/.cache/study-grokbot/fonts/source-han-serif-<版本>/`（可用 `OG_FONT_DIR` 修改），CI 用 `actions/cache` 按 `SHS_VERSION` 缓存。
- `npm run og` 在缺少字体时会直接报错，并用 Chrome DevTools 协议（`CSS.getPlatformFontsForNode`）确认每段文字实际用的都是思源宋体。
- 所有内容都放在中央安全区内，因为 X 会按约 1.91:1 裁切，部分客户端按 2:1 裁切。
- meta：绝对地址的 `og:image`，以及 `og:image:type/width/height/alt`、`og:locale` 和 `og:locale:alternate`、`twitter:card=summary_large_image`、`twitter:image:alt`、`twitter:site`/`twitter:creator`（取自 `site.config.mjs` 的 `twitter`）。

## 每天发一期

1. 运行 `npm run new -- "中文主题" "English topic" YYYY-MM-DD`，会生成 `issues/zh/DATE.md` 和 `issues/en/DATE.md`：

   ```yaml
   ---
   title: 《2026-11-02期：……》
   date: 2026-11-02
   summary: 一句话简介（同时用作 meta description）
   tags: [标签1, 标签2]
   issue: 2
   lang: zh
   draft: true       # 草稿不会发布；用 DRAFTS=1 npm run dev 预览
   tldr:             # 正文顶部的“本期要点”
     - 要点一
   qa:               # 文末的“快问快答”
     - q: 问题？
       a: 回答。
   ---
   ```

2. 正文用普通 Markdown 编写。标题可以带固定锚点（`## 本期导读 {#intro}`），`{{root}}` 会替换成当前语言的根路径。
3. 改成 `draft: false`，运行 `npm run readme`，然后推送。

额外支持的容器（`::: 类型 参数` … `:::`）：

| 容器 | 用途 | 写法 |
| --- | --- | --- |
| `callout 标题` | 重点提示 | Markdown |
| `prompt [标签]` | 可复制的示例提示词 | 原样文本 |
| `proscons` | 适合 / 不适合 | 两组 `#### 标题` + 列表 |
| `props` | 键值说明 | `- 键: 值` |
| `steps` | 步骤 | `- 标题 \| 说明` |
| `quote @作者 \| 日期 \| 链接` | 社区引用 | 引文；如果原帖是其他语言，先写原文，再写 `---` 和译文，页面上只显示译文 |
| `links` | 链接卡片 | `- [标题](url) \| 站点 \| 日期` |
| `flow` | 简单流程图 | 节点写 `- 名称 \| 说明 \| person/terminal`，`---` 后写连线 |

## SEO / GEO 产物

| 产物 | 说明 |
| --- | --- |
| `<head>` | title、description、canonical、hreflang（en / zh-Hans / x-default）、Open Graph、X 卡片、JSON-LD |
| JSON-LD | WebSite、Organization、BlogPosting、TechArticle、CollectionPage、BreadcrumbList、FAQPage |
| `sitemap.xml` | 带 `xhtml:link` 语言互链 |
| `robots.txt` | 允许所有爬虫，包括 AI 爬虫 |
| `feed.xml`、`zh/feed.xml` | 各语言的 RSS |
| `llms.txt`、`llms-full.txt`、`zh/llms.txt`、`zh/llms-full.txt` | 给大模型看的摘要和全文，每种语言一套 |
| `issues/DATE.md`、`zh/issues/DATE.md` | 每期的 Markdown 原文 |
| `404.html`、`zh/404.html` | 各语言的 404 页面（`/zh/` 下找不到的地址会显示中文页面） |
| `og/*.png` | 分享图 |

## 目录结构

```
website/
├─ issues/{en,zh}/  每日期刊（Markdown）
├─ guide/{en,zh}/   指南页
├─ assets/          style.css、main.js、favicon.svg
├─ public/          复制到 dist 根目录（CNAME）
├─ lib/             markdown、templates、i18n、og（分享图模板）、og-font（字体版本与路径）
├─ scripts/         new-issue、og、fetch-font、readme-issues、validate
├─ site.config.mjs  站点配置
├─ build.mjs        构建脚本
└─ serve.mjs        本地预览服务器
```

---

本站为开源社区运营的非官方学习站点，与 SpaceXAI / xAI 及 Grok Bot 官方无任何关联。
