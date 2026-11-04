[English](README.md) | 简体中文

# Study GrokBot · 网站

零框架静态站：Markdown 转 HTML，运行时依赖只有 `marked`、`gray-matter` 和 `remixicon`（构建时内联图标 SVG）。英文是默认语言，放在站点根目录；简体中文放在 `/zh/` 下。每个语言版本只显示该语言的内容。

线上地址：**https://studygrokbot.com/**（`study-grokbot.com` 会 301 跳转到这里）。

## 常用命令

```bash
npm install
npm run dev          # 构建并本地预览 http://localhost:4173（改文件自动重建）
npm run build        # 输出到 dist/
npm run font         # 下载思源黑体 SC 到 ~/.cache/study-grokbot/fonts/（只用于分享图）
npm run og           # 渲染分享图（用 Playwright Chromium：npx playwright install chromium；没装时用本机 Google Chrome）
npm run build:full   # build → font → og → build
npm run check        # 校验链接、锚点、JSON-LD、hreflang、canonical、sitemap、分享卡片 meta、图片大小，并确认没有 web 字体
npm run readme       # 更新 README.md / README_ZH.md 里的往期表格
npm run new -- "中文主题" "English topic" 2026-11-02   # 同时新建中英两份草稿（draft: true）
```

`site.config.mjs` 里配置站点地址（`SITE_URL`，默认 `https://studygrokbot.com/`）和基础路径（`BASE_PATH`，默认 `/`）。`public/` 下的文件（如 `CNAME`）会原样复制到 `dist/` 根目录。

**Google Analytics**：把 GA 后台给的完整代码（`<script async src="https://www.googletagmanager.com/gtag/js?id=G-…">` 加上 `gtag('config', …)` 那段）存成仓库变量 `GOOGLE_ANALYTICS`（Settings → Secrets and variables → Actions → Variables → New repository variable；要建在仓库级别，不要放在 `github-pages` 环境里，构建任务读不到）。CI 构建时把它原样插进每个页面的 `<head>` 末尾；只填测量 ID（`G-…`）会让构建失败。本地没设这个变量就不加统计。改了变量不会自动重新部署，需要在 Actions 里手动运行一次 “Deploy website to GitHub Pages”。

## 语言、主题、字体

- **内容**：`issues/{en,zh}/*.md`、`guide/{en,zh}/*.md`，同名文件互为译文，自动生成 hreflang。
- **界面文案**：`lib/i18n.mjs`。每个页面只用自己的语言；语言菜单显示各语言的原名（English / 简体中文）。
- **最新一期**：站内的“最新一期”链接直接指向当期文章（`build.mjs` 写入 `site.latest`，`lib/templates.mjs` 的 `latestHref()`）。`/latest/`、`/zh/latest/` 只留给站外链接：用站点样式渲染、`noindex`，有 JS 时立即跳到当期（没有 JS 时用 meta refresh），canonical 指向当期。
- **顶栏菜单**：语言和主题都是“图标 + 下拉菜单”（`lib/templates.mjs` 的 `dropdown()`，键盘操作在 `assets/main.js`）。按钮只显示图标（文字放在 `aria-label` / `title`），菜单项显示完整文字。GitHub 和 X（`site.x`）作为图标按钮放在它们旁边，760px 及以下收进移动端菜单。
- **社群页**：导航里的“社群”指向独立页面 `/community/`（`build.mjs` 的 `communityPage()`）：每个渠道一张卡片，左边是说明和加入步骤，右边是二维码，中间叠站点 Logo；下面是社群公约和其它参与方式（GitHub 投稿、X、RSS）。渠道在单独的配置文件 `community.config.mjs` 里（目前只有微信），文案在 `lib/i18n.mjs` 的 `community`。二维码不放图片：`qr` 填二维码的文字内容（用扫码工具识别群码得到的那串文字，通常是链接），构建时由 `lib/qr.mjs` 用 `qrcode` 包按容错级别 H 生成内联 SVG，中间叠 Logo 也能扫出来。`qr` 留空表示还没上线，页面显示模糊的示意码和“即将上线”提示。微信群二维码 7 天后失效，到期要换新内容。
- **期刊阅读**：正文居中，右侧是本期目录，左侧是一列圆形图标按钮组成的阅读工具条，固定在屏幕竖直居中处、页脚出现时淡出（`build.mjs` 的 `readTools()`，交互在 `assets/main.js`）：沉浸式阅读（Esc 退出）、放大 / 缩小字号（存在 `localStorage` 的 `sg-fs`，由 `<head>` 脚本在首屏前恢复）、复制链接、Markdown 原文、回到顶部 / 跳到底部；960px 及以下隐藏。底部有上一期 / 下一期卡片，没有时显示灰色的“已经是第一期 / 最新一期了”。
- **首次访问**：浏览器首选中文时跳到对应的 `/zh/` 页面。选择保存在 `localStorage.sg-lang`，手动切换优先；爬虫不跳转。
- **主题**：自动 / 浅色 / 深色，保存在 `localStorage.sg-theme`，首屏绘制前生效。
- **字体**：用各系统最适合阅读的界面无衬线字体（中文：苹方 / 微软雅黑 / Noto Sans CJK；英文：San Francisco / Segoe UI / Roboto），定义在 `assets/style.css` 的 `--font-zh` / `--font-en`。网站页面不加载任何网络字体。
- **图标**：只用 [Remix Icon](https://remixicon.com/)，通过 `lib/icons.mjs` 的 `ri('图标名')` 在构建时内联 SVG（不用图标字体、不发外部请求；名字写错会让构建失败）。规则见仓库根目录的 `AGENTS.md`。

## 分享图（Open Graph / X 卡片）

- 每种语言一张站点图（`og/site-en.png`、`og/site-zh.png`），每期每种语言一张（`og/issue-DATE-en.png`、`og/issue-DATE-zh.png`）。都是 1200×630 PNG，目标小于 300 KB，图里只有该语言的文字。
- 分享图在构建时用**思源黑体 SC**（Source Han Sans SC，OFL 协议，来自 [Adobe 官方 Release](https://github.com/adobe-fonts/source-han-sans/releases)）渲染。字体不进仓库：本地缓存在 `~/.cache/study-grokbot/fonts/source-han-sans-<版本>/`（可用 `OG_FONT_DIR` 修改），CI 用 `actions/cache` 按 `SHS_VERSION` 缓存。
- `npm run og` 在缺少字体时会直接报错，并用 Chrome DevTools 协议（`CSS.getPlatformFontsForNode`）确认每段文字实际用的都是思源黑体。
- 版式和网站一致（`lib/og.mjs`）：白底、暖橙色光晕、黑色标题（站点分享图直接用首页标题，第一个“GrokBot”是橙色渐变），右侧是戴博士帽的圆球 Bot（站点 Logo）看向标题，底部是示例 Bot 头像。改模板时把 `OG_DESIGN` 加一，缓存的 PNG 才会重新渲染。
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

## Bot 头像规范

站内所有出现 Bot 的地方（首页对话示意、卡片标签、期刊表格、流程图）都用同一个生成器：`lib/avatar.mjs`。风格参考 GrokBot 的头像选择器，全部用 SVG 自己绘制，不使用任何官方素材。

- **外观**：调色板 11 种纯色之一（黑、灰、红、橙、粉、琥珀、绿、青、蓝、靛、紫，按色系分组）× 5 种圆润形状之一（圆球、圆三角、圆方块、蛋形、豆形；圆球出现得最多）+ 身体上镂空的两只胶囊眼睛（`fill-rule="evenodd"`），倾斜着望向右上方：两只等长，近处的宽、远处的窄。没有渐变、高光和阴影，与 GrokBot 官方的扁平头像一致。
- **分配**：用 Bot key 的 FNV-1a 哈希决定颜色和形状，看起来随机，但每次构建结果一样。`BOT_KEYS` 把同一个 Bot 的中英文名字映射到同一个 key，所以两种语言里头像一致。哈希分到的形状不合适时，可以在 `PINNED_SHAPES` 里给这个 Bot 固定形状（构建师就固定为圆球），不影响其它 Bot。
- **阵容**：示例 Bot（`LINEUP`）之间颜色不重复、尽量各占一个色系，除圆球外形状也不重复；冲突时按固定顺序顺延到下一个空位。
- **用法**：`avatarSvg(name, { size, title, color, shape })` 返回内联 SVG；传 `color`/`shape` 的 id 可以覆盖哈希结果。Markdown 里表格单元格或 `::: flow` 节点的文字正好是已知 Bot 名时，会自动带上头像。新增 Bot 时，把它的名字加进 `BOT_KEYS`。
- **深色模式**：黑色头像改用浅色绘制，和首页圆球一样（`assets/style.css` 里的 `.bot-av[data-color=black]`）。
- **首页圆球与 Logo**：`orbSvg()` 同时画出首页标题上方的圆球和页头、页脚的站点 Logo（`lib/templates.mjs` 的 `mark()`；带 `data-orb` 的元素都会获得交互）。右上角歪戴一顶博士帽（`lib/avatar.mjs` 的 `CAP`，帽穗用强调色），随头一起动。鼠标悬停时变成眯眼微笑（`> <`）。网站图标 `assets/favicon.svg` 是同一个戴帽 Bot 的白色静态版，用同一套 `ORB`/`CAP` 几何数据画出。
- **圆球细节**：静止时两只竖直的胶囊眼睛左右对称、居中；眼睛跟随鼠标或触摸位置（`assets/main.js`，看向哪边、那一侧的眼睛会略微变窄），空闲时会眨眼、慢慢游移；开启“减少动态效果”时保持静止。头部用 `--fg`、眼睛用 `--bg`，随主题反色。

## 首页对话示意

首页标题下方的对话示意来自 `lib/i18n.mjs` 的 `showcase.chats`（每个 Bot 一项，群聊带 `group` 和 `members`），由 `build.mjs` 的 `showcase()` 渲染，点左侧标签切换会话。进入视口后（`assets/main.js`）消息逐条载入：你的消息先在输入框里打出来再发送，Bot 先显示“正在输入”，工具调用直接弹出。一段对话播完会自动切到下一个会话；鼠标悬停、不在视口内或页面隐藏时暂停，用户点过标签后不再自动切换。高度按完整对话锁定，播放时页面不跳动。开启“减少动态效果”时直接显示全部消息、不自动切换。消息格式：

| 元组 | 显示为 |
| --- | --- |
| `['me', text]` | 你发的消息气泡 |
| `['bot', from, text]` | Bot 回复；`{@名字}` 渲染成带头像的 @ |
| `['tool', from, icon, text]` | 工具调用行（`icon` 为 Remix Icon 名） |
| `['file', from, name, meta]` | 文件卡片 |
| `['routine', from, title, when]` | Routine 卡片 |
| `['handoff', from, to, [[键, 值], …]]` | 交接卡片 |
| `['approve', from, title, desc, [同意, 拒绝]]` | 审批卡片 |
| `['typing', from]` | 正在输入 |

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
├─ lib/             markdown、templates、i18n、icons（Remix Icon）、avatar（Bot 头像与首页圆球）、qr（社群页二维码，构建时生成）、og（分享图模板）、og-font（字体版本与路径）
├─ scripts/         new-issue、og、fetch-font、readme-issues、validate
├─ site.config.mjs  站点配置
├─ community.config.mjs  社群渠道和二维码内容
├─ build.mjs        构建脚本
└─ serve.mjs        本地预览服务器
```

---

本站为开源社区运营的非官方学习站点，与 SpaceXAI / xAI 及 Grok Bot 官方无任何关联。
