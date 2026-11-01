English | [简体中文](README_ZH.md)

<div align="center">

# Study GrokBot

**GrokBot teaches you how to use GrokBot, updating daily with various GrokBot tips and tricks, as well as creations and gameplay shared by experts.**

[![Website](https://img.shields.io/badge/website-studygrokbot.com-ff6a08?style=flat-square)](https://studygrokbot.com/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/Licoy/study-grokbot/deploy.yml?branch=main&style=flat-square&label=deploy)](https://github.com/Licoy/study-grokbot/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Updated daily](https://img.shields.io/badge/updates-daily-2ea44f?style=flat-square)](https://studygrokbot.com/archive/)

[Website](https://studygrokbot.com/) · [Latest issue](https://studygrokbot.com/latest/) · [Archive](https://studygrokbot.com/archive/) · [RSS](https://studygrokbot.com/feed.xml) · [llms.txt](https://studygrokbot.com/llms.txt)

</div>

---

## What's inside

Study GrokBot is a learning column researched and written by GrokBot itself, one topic per issue:

- **Tips you can use today**: each tip comes with a copy-ready example prompt.
- **Worked examples**: an example Bot lineup showing roles, handoffs and reviews.
- **Community picks**: public posts from power users, always linked to the original.
- **A 15-minute exercise**: turn what you read into a habit.
- **Guide**: [Getting started](https://studygrokbot.com/guide/getting-started/) · [Core concepts](https://studygrokbot.com/guide/concepts/) · [FAQ](https://studygrokbot.com/guide/faq/)

Light, dark and auto themes, full English and Simplified Chinese versions, and search- and AI-friendly output (sitemap, RSS, JSON-LD, `llms.txt`, and a Markdown copy of every issue).

## Issues

<!-- ISSUES:START -->
| # | Date | Title |
| --- | --- | --- |
| 001 | 2026-11-01 | [Managing Your Bots in GrokBot](https://studygrokbot.com/issues/2026-11-01/) |
<!-- ISSUES:END -->

## Contributing

Have a GrokBot tip, workflow or creation to share?

- Open an [issue](https://github.com/Licoy/study-grokbot/issues) or a pull request, or
- post it on X with **#StudyGrokBot**.

The best submissions are featured in future issues, credited and linked to the original. Please remove anything private before sharing.

## Local development

```bash
cd website
npm install
npm run dev          # local preview at http://localhost:4173
npm run check        # validate links, SEO metadata and share cards
npm run build:full   # full build including share images
```

The site is plain Node.js with no framework and no web fonts, and it deploys to GitHub Pages on every push to `main`. See [website/README.md](website/README.md) for the developer guide.

## Disclaimer

This is an unofficial, open-source community project and is not affiliated with SpaceXAI / xAI or the official Grok Bot. Grok and related marks belong to their respective owners. Community posts belong to their original authors.

Licensed under [MIT](LICENSE).
