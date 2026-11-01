# AGENTS.md

给在本仓库工作的 AI 编码助手（以及人类贡献者）的约定。站点代码在 `website/`，详细说明见 `website/README_ZH.md` / `website/README.md`。
Conventions for AI coding agents (and humans) working in this repo. The site lives in `website/`; see its README for details.

## 图标 / Icons

- **唯一图标源：[Remix Icon](https://remixicon.com/)**（npm 包 `remixicon`，Apache-2.0）。
  **Remix Icon is the only icon source.**
- 一律通过 `website/lib/icons.mjs` 的 `ri('图标名')` 在构建时内联 SVG，图标名就是 remixicon.com 上显示的名字，不带 `ri-` 前缀，例如 `ri('arrow-right-line')`、`ri('github-fill')`。名字写错会让构建直接失败。
  Always use `ri('name')` from `website/lib/icons.mjs`, which inlines the SVG at build time. Use the name shown on remixicon.com without the `ri-` prefix. An unknown name fails the build.
- 不要使用图标字体、CDN、其它图标库、手绘 SVG，也不要用 emoji 或 `→ ✓ ×` 之类的文字符号充当图标。
  No icon fonts, CDNs, other icon sets, hand-drawn SVGs, or emoji / text glyphs (`→ ✓ ×`) as icons.
- 该配图标的地方就配：导航、按钮、卡片标题、提示框、列表标记、分页等。同一组并列项要么都有图标，要么都没有，避免文字对不齐。
  Add icons where they help (nav, buttons, card labels, callouts, list markers, pagination). Within a group of sibling items, give all of them icons or none, so the text stays aligned.
- 线性（`-line`）风格为默认，品牌图标用 `-fill`（如 `github-fill`）。尺寸和颜色交给 CSS：`.ri` 默认 `1em`，颜色继承 `currentColor`。
  Prefer `-line` variants; use `-fill` for brand marks. Size and colour come from CSS (`.ri` is `1em`, `currentColor`).
- 图标是装饰性的（`aria-hidden`），按钮或链接里必须同时有可读文字或 `aria-label`。
  Icons are decorative (`aria-hidden`); the button or link must still carry readable text or an `aria-label`.

## 字体 / Fonts

- 页面只用各系统自带的 UI 无衬线字体（`--font-zh` / `--font-en`，见 `website/assets/style.css`），不加载任何 Web 字体，不写 `@font-face`（`npm run check` 会校验）。
  Pages use system UI sans-serif stacks only; no web fonts and no `@font-face` (enforced by `npm run check`).
- 分享图（OG）是例外：构建时用思源黑体渲染，见 README。
  Share images (OG) are the exception: they are rendered with Source Han Sans at build time.

## Bot 头像 / Bot avatars

- 所有 Bot 头像只由 `website/lib/avatar.mjs` 生成（纯色 + 镂空胶囊眼睛），不要另画、不要使用官方图片素材。
  Every bot avatar comes from `website/lib/avatar.mjs` (flat colour + cut-out capsule eyes). Do not draw others or use official assets.
- 站点 Logo 就是首页那个戴博士帽的圆球 Bot（`orbSvg()`，帽子是 `CAP`；加 `data-orb` 即可跟随鼠标），网站图标 `website/assets/favicon.svg` 是它的白色静态版，分享图也用它；改造型时这几处一起改。
  The site logo is the homepage orb bot wearing a mortarboard (`orbSvg()`, cap in `CAP`; add `data-orb` for mouse tracking). `website/assets/favicon.svg` is its static white version and the share images use it too. Change them together.

## 其它 / Other

- 站点运行时零外部请求。
  Zero external requests at runtime.
- 修改后运行 `cd website && npm run build && npm run check`。
  After changes, run `cd website && npm run build && npm run check`.
