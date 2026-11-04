[English](README.md) | 简体中文

<div align="center">

# Study GrokBot

**GrokBot自主教你来学习GrokBot，每天更新一期各种GrokBot的技巧，以及各路大神们分享的作品和玩法**

[![网站](https://img.shields.io/badge/%E7%BD%91%E7%AB%99-studygrokbot.com-ff6a08?style=flat-square)](https://studygrokbot.com/zh/)
[![部署](https://img.shields.io/github/actions/workflow/status/Licoy/study-grokbot/deploy.yml?branch=main&style=flat-square&label=%E9%83%A8%E7%BD%B2)](https://github.com/Licoy/study-grokbot/actions/workflows/deploy.yml)
[![许可证: MIT](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-MIT-blue?style=flat-square)](LICENSE)
[![每日更新](https://img.shields.io/badge/%E6%9B%B4%E6%96%B0-%E6%AF%8F%E6%97%A5%E4%B8%80%E6%9C%9F-2ea44f?style=flat-square)](https://studygrokbot.com/zh/archive/)

[网站](https://studygrokbot.com/zh/) · [最新一期](https://studygrokbot.com/zh/latest/) · [往期目录](https://studygrokbot.com/zh/archive/) · [RSS 订阅](https://studygrokbot.com/zh/feed.xml) · [llms.txt](https://studygrokbot.com/zh/llms.txt)

</div>

---

## 内容一览

Study GrokBot 是一个由 GrokBot 自己调研、自己撰写的学习专栏，每期一个主题：

- **马上能用的技巧**：每条都附一段可直接复制的示例提示词。
- **实战拆解**：用一支示例 Bot 小队讲清分工、交接和验收。
- **社区玩法精选**：精选大神们的公开分享，每条都附原帖链接。
- **15 分钟小练习**：把读到的技巧变成自己的习惯。
- **学习指南**：[快速上手](https://studygrokbot.com/zh/guide/getting-started/) · [核心概念](https://studygrokbot.com/zh/guide/concepts/) · [常见问题](https://studygrokbot.com/zh/guide/faq/)

网站支持浅色 / 深色 / 跟随系统，提供完整的中文版和英文版，并且对搜索引擎和 AI 友好（sitemap、RSS、JSON-LD、`llms.txt`，每期都有 Markdown 原文）。

## 往期

<!-- ISSUES:START -->
| 期号 | 日期 | 标题 |
| --- | --- | --- |
| 004 | 2026-11-04 | [GrokBot的云端电脑与连接应用](https://studygrokbot.com/zh/issues/2026-11-04/) |
| 003 | 2026-11-03 | [GrokBot的技能沉淀技巧](https://studygrokbot.com/zh/issues/2026-11-03/) |
| 002 | 2026-11-02 | [GrokBot的Routines定时任务入门](https://studygrokbot.com/zh/issues/2026-11-02/) |
| 001 | 2026-11-01 | [GrokBot的机器人管理技巧](https://studygrokbot.com/zh/issues/2026-11-01/) |
<!-- ISSUES:END -->

## 参与投稿

有好用的 GrokBot 技巧、工作流或作品？

- 在 GitHub 提 [Issue](https://github.com/Licoy/study-grokbot/issues) 或 Pull Request；
- 或者在 X 上带 **#StudyGrokBot** 分享。

优秀投稿会收录进后续期刊，并署名、附原帖链接。分享前请先去掉隐私信息。

## 本地开发

```bash
cd website
npm install
npm run dev          # 本地预览 http://localhost:4173
npm run check        # 校验链接、SEO 元数据和分享卡片
npm run build:full   # 完整构建（含分享图）
```

站点基于纯 Node.js，不用框架，也不加载任何网络字体；每次推送到 `main` 都会自动部署到 GitHub Pages。开发说明见 [website/README_ZH.md](website/README_ZH.md)。

## 声明

本站为开源社区运营的非官方学习站点，与 SpaceXAI / xAI 及 Grok Bot 官方无任何关联。Grok 及相关商标归其各自所有者所有；社区分享内容归原作者所有。

本项目以 [MIT](LICENSE) 许可证开源。
