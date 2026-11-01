---
title: Getting started
summary: Install the app, sign in, meet your first Bot, give it a job and a first task, then make the result stick. Follow along and you are done in about ten minutes.
order: 1
---

## Before you begin {#before}

::: props
- Plan: You need a plan that includes GrokBot, such as Premium, Super or Ultra on The X Subscription. Some SuperGrok and X Premium+ subscriptions can be linked too. Check the official plans and billing page for details.
- Account: GrokBot signs in with your Cursor account; there is no separate login. If your company uses SSO, sign in through that flow.
- Privacy: GrokBot needs cloud data storage. Accounts on Privacy Mode (Legacy) are asked to switch to Privacy Mode before starting.
:::

## Seven steps to a first task {#steps}

::: steps
- Install the desktop app | Download it from x.ai/bot or the link your admin gives you. It runs on macOS (Apple silicon and Intel), Windows (x64 and Arm64) and Linux (x64 and Arm64), and updates itself. On a phone, install it from the App Store or Google Play.
- Sign in | Click **Sign in** on the welcome screen and finish in your browser. To link SuperGrok or X Premium+ on desktop, go to **Settings → Usage & Billing** and click **Get Access with Grok**.
- Meet your first Bot | After a short intro, GrokBot creates a Bot named **Grok Bot** and opens a chat. To add more, click **+** in the sidebar and choose **Create a Bot**, or press `Cmd/Ctrl+N`.
- Give it a job | In the first message, give it **one primary job** and ask it to remember how to work. Focused Bots build more useful context than one general-purpose helper.
- Give it a first task | Type or dictate (`Cmd/Ctrl+D` on desktop). A strong request states the outcome you want, the sources that matter, constraints, the deliverable format, and where it should stop and check with you.
- Sign in to its tools | When it hits a login, the Bot uses a login saved in **Vault**, a connected password manager such as 1Password, or a **Secure Form** that asks you - it never sees the password. For SSO, passkeys and other steps a form can't handle, click **Open computer**, do that step yourself, then hand control back.
- Review it and make it stick | Ask for revisions and name lasting preferences explicitly ("use this report format from now on"). Once the process is stable, save it as a **skill** or a **Routine**.
:::

## Example: a job description for a Bot {#job}

The official docs give a "product performance" example. Here it is, roughly, ready to adapt:

::: prompt Example prompt · job description
Your job is [product performance].
Remember these rules and follow them every time:
1. Use [our observability tools] for data;
2. Keep every link and screenshot;
3. Keep evidence and hypotheses separate;
4. Lead with the highest-impact issue;
5. Never change production settings.
:::

## Example: a five-minute first task {#first-task}

::: prompt Example prompt · first task
Read the attached document and give me a five-bullet summary.
In a separate section, list every date, decision and open question in it, and cite the section each item comes from.
Leave the source file unchanged.
:::

::: callout Before a Bot changes external systems
Read the official "Approvals and Auto Review" docs first. They cover when approval prompts appear, how the review model decides, and why credentials should never be pasted into chat.
:::

## GrokBot on your phone {#mobile}

The mobile app needs iOS 18 or later, or Android 9 or later. Sign in with the same Cursor account and your plan carries over.

::: proscons
#### On mobile you can
- Message your Bots
- Watch and take over the cloud computer
- Approve actions
- Pause or resume Routines
#### Desktop only
- Teach a workflow by demonstration
- Test Routines
- Update the computer
:::

## If something doesn't work {#trouble}

**Fully quit and reopen the app** - that fixes most setup problems. If it doesn't, see the official Troubleshooting page or contact support.

## Official sources {#sources}

::: links
- [Get started](https://docs.x.ai/grok-bot/get-started) | docs.x.ai
- [Bots: creating, pictures, memory](https://docs.x.ai/grok-bot/bots) | docs.x.ai
- [The computer and apps](https://docs.x.ai/grok-bot/computer-and-apps) | docs.x.ai
- [Grok Bot for mobile](https://docs.x.ai/grok-bot/mobile) | docs.x.ai
:::
