---
title: FAQ
summary: Common questions about GrokBot (answers compiled from the official FAQ, with sources), plus a few about this site.
order: 3
---

## Basics {#basics}

### How is GrokBot different from an AI assistant? {#vs-assistant}

GrokBot's Bots can use a cloud computer, tools and files to actually finish work, run in the background, and coordinate with other Bots.

### Is GrokBot the same as the Grok app? {#vs-grok}

No. They are separate apps, and GrokBot signs in with your Cursor account.

### Where can I talk to my Bots? {#where}

In the desktop and mobile apps, in X Chat, by tagging @bot on X, and through a shared Bot in Slack.

### Does it keep working when my laptop is closed? {#laptop}

Yes. Work runs on the cloud computer, including background turns and Routines.

### Does a Bot use my own computer? {#local}

Only if you allow it in **Settings → Computer**, and by default it asks every time.

### Do my Bots share one computer? {#shared}

Yes. The computer is assigned per user, not per Bot, so all your Bots share its files, browser sessions and logins. Don't use separate Bots as a security boundary.

### Can several Bots work at the same time? {#parallel}

Yes. Each Bot gets its own screen, and one Bot runs one computer-use task at a time.

### What does a Bot remember? {#memory}

Stable preferences, role context and work summaries; a few basic facts about you (such as your name and time zone) are shared across your Bots. Ask it what it remembers, and have it check the current source for important decisions. See [Core concepts · Memory]({{root}}guide/concepts/#memory).

### Can it use any website? {#websites}

Many sites work, but some block automation or require CAPTCHAs or logins. The Bot should hand those steps back to you.

### Which actions need my approval? {#approval}

It depends on the tool, the risk and your Auto Review rules. Approvals raised during unattended work expire after about 30 minutes.

### Can I pick the model? {#model}

No. GrokBot chooses the model for each task, and the underlying model isn't shown.

## Plans and billing {#billing}

### Do I need a separate GrokBot subscription? {#subscription}

No. It's included with several Grok and Cursor plans, and some SuperGrok and X Premium+ accounts can be linked.

### How much does it cost? {#cost}

It depends on your plan. Usage draws from a **weekly pool** that resets every week, and extra usage can be billed. To avoid extra charges, turn off on-demand usage or set a spending cap (a cap doesn't stop a run already in progress).

### Is there a free trial? {#trial}

Some accounts can start a usage-credit trial, which can't be converted into a paid plan. Credit is consumed by the work Bots do, not by the number of messages.

## Features {#features}

### What is the difference between a skill and a Routine? {#skill-vs-routine}

A skill describes how to do a task. A Routine assigns a workflow to a Bot and sets when it runs. See [Core concepts · Skills and Routines]({{root}}guide/concepts/#skills-routines).

### Can I show a Bot how I do a task? {#teach}

Where available, yes: record one browser workflow (up to 10 minutes) and it becomes a draft skill for you to review.

### Can I share a Bot with someone else? {#share}

Yes, as a template link. Recipients get a copy **without** your computer, logins or history. Remove keys, internal URLs and customer data before sharing.

### What happens if I delete a Bot? {#delete}

Its profile, conversations, memory and Routines are deleted and can't be restored, but files and logins on the shared computer may remain and need separate clean-up. If you might need it later, hide it from the sidebar instead.

### Which platforms are supported? {#platforms}

macOS, Windows and Linux on desktop, iPhone and iPad (iOS 18+), and Android 9+.

### Which desktop shortcuts are worth knowing? {#shortcuts}

::: props
- New Bot: `Cmd/Ctrl+N`
- New group chat: `Cmd/Ctrl+Shift+N`
- Dictate: `Cmd/Ctrl+D`
- Search: `Cmd/Ctrl+K`
- Settings: `Cmd/Ctrl+,`
- All shortcuts: `Cmd/Ctrl+/`
:::

## About this site {#about}

### Is this the official website? {#official}

No. Study GrokBot is an unofficial, open-source community learning site and is not affiliated with SpaceXAI / xAI or the official Grok Bot. The answers on this page are compiled from the official docs; where they differ, the official docs win.

### How often is it updated? {#cadence}

One issue per day is the plan. Issue files live in the repository under `website/issues/en/` (English) and `website/issues/zh/` (Chinese).

### Can I contribute? {#contribute}

Yes! Open an issue or pull request on the [GitHub repository](https://github.com/Licoy/study-grokbot), or share your workflow on X with #StudyGrokBot.

## Official sources {#sources}

::: links
- [Official FAQ](https://docs.x.ai/grok-bot/faq) | docs.x.ai
- [Grok Bot overview](https://docs.x.ai/grok-bot/overview) | docs.x.ai
- [Chat and collaboration](https://docs.x.ai/grok-bot/chat-and-collaboration) | docs.x.ai
:::
