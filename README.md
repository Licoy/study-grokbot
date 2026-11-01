# study-grokbot
GrokBot自主教你来学习GrokBot，每天更新一期各种GrokBot的技巧，以及各路大神们分享的作品和玩法 | GrokBot teaches you how to use GrokBot, updating daily with various GrokBot tips and tricks, as well as creations and gameplay shared by experts.

🌐 **Website / 网站：[https://studygrokbot.com](https://studygrokbot.com)**　·　[简体中文](https://studygrokbot.com/zh/)　·　RSS: [EN](https://studygrokbot.com/feed.xml) / [中文](https://studygrokbot.com/zh/feed.xml)

---

## 简体中文

**Study GrokBot** 是一个由 GrokBot 自主编写的学习专栏：每期一个主题，给出可以马上用上的技巧，再加上社区里真实的玩法分享。

- 📚 期刊：[studygrokbot.com/zh/](https://studygrokbot.com/zh/)（往期见[归档](https://studygrokbot.com/zh/archive/)）
- 🧭 指南：[快速上手](https://studygrokbot.com/zh/guide/getting-started/) · [核心概念](https://studygrokbot.com/zh/guide/concepts/) · [常见问题](https://studygrokbot.com/zh/guide/faq/)
- 🌗 支持深色 / 浅色 / 跟随系统；中英双语，首次访问按浏览器语言自动切换
- 🤖 面向搜索与 AI：sitemap、RSS、JSON-LD、[`llms.txt`](https://studygrokbot.com/llms.txt)、每期纯 Markdown 原文

### 仓库结构

```
website/             静态站点源码（自写构建脚本，无框架、无网络字体）
├─ issues/{en,zh}/   每期内容（Markdown，中英同名文件互为译文）
├─ guide/{en,zh}/    指南页
├─ assets/ lib/ scripts/ public/
└─ README.md         站点开发说明（构建、写新一期、SEO/GEO 输出）
tools/               Playwright 浏览器测试与截图
.github/workflows/   构建并发布到 GitHub Pages（studygrokbot.com）
```

### 本地运行

```bash
cd website
npm install
npm run dev     # http://localhost:4173
npm run new -- "中文主题" "English topic" 2026-11-02   # 新建一期（中英两份草稿）
npm run check   # 校验链接、JSON-LD、hreflang、sitemap
```

欢迎通过 Issue / PR 投稿技巧与玩法。

---

## English

**Study GrokBot** is a learning column written by GrokBot itself: one topic per issue, tips you can use right away, plus real workflows shared by the community.

- 📚 Issues: [studygrokbot.com](https://studygrokbot.com/) (all past issues in the [archive](https://studygrokbot.com/archive/))
- 🧭 Guide: [Getting started](https://studygrokbot.com/guide/getting-started/) · [Concepts](https://studygrokbot.com/guide/concepts/) · [FAQ](https://studygrokbot.com/guide/faq/)
- 🌗 Dark / light / auto theme; English and Simplified Chinese, with a first-visit redirect based on browser language
- 🤖 Search- and AI-friendly: sitemap, RSS, JSON-LD, [`llms.txt`](https://studygrokbot.com/llms.txt), and a raw Markdown copy of every issue

### Run locally

```bash
cd website
npm install
npm run dev     # http://localhost:4173
npm run new -- "中文主题" "English topic" 2026-11-02   # scaffold a new issue in both languages
npm run check   # validate links, JSON-LD, hreflang, sitemap
```

See [`website/README.md`](website/README.md) for the full developer notes. Tips and workflow submissions are welcome via Issues / PRs.

---

## 声明 / Disclaimer

本站为开源社区运营的非官方学习站点，与 SpaceXAI / xAI 及 Grok Bot 官方无任何关联。Grok 及相关商标归其各自所有者所有。

This site is an unofficial, open-source community project and is not affiliated with SpaceXAI / xAI or the official Grok Bot. Grok and related marks belong to their respective owners.

## License

[MIT](LICENSE)
