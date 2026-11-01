---
title: Core concepts
summary: Bots, the primary Bot, memory, the cloud computer, apps and sign-ins, skills, Routines, group chats and handoffs, approvals - the basic GrokBot vocabulary on one page, and how the pieces fit together.
order: 2
---

## Glossary {#glossary}

::: props
- Bot: An AI teammate with its own name, picture, job and memory. Works best when it owns one repeatable job.
- Primary Bot: Your main contact. It checks in on its own and coordinates your other Bots.
- Memory: Preferences, rules, facts about you and a work log that a Bot decides to keep.
- Cloud computer: One persistent computer shared by all Bots on your account, with a browser, filesystem and terminal.
- Apps: Services such as Gmail, Google Calendar, Slack and Notion, connected through **Connect apps**.
- Skill: Reusable instructions for how to do a task.
- Routine: Tells a Bot when to run a workflow - on a schedule or in response to an event.
- Group chat: You and two to six Bots working in one conversation.
- Handoff: One Bot sends another an asynchronous message to pass work along.
- Template: A shareable copy of a Bot's setup, without your computer, sign-ins or chat history.
:::

## Bots: one job per Bot {#bot}

To create a Bot, click **+** in the sidebar (or press `Cmd/Ctrl+N`), enter a name in **Create New Bot**, pick a **shape and colour** for its picture and click **Create**. You can also generate a picture from a description or upload your own (up to 25 MB).

When is a new Bot worth it? The official rule of thumb: when the work has **its own goal, tools and sources, working style, approval boundary or recurring schedule**. Roles like Talent Scout, Expense Manager or Bug Reproduction give a Bot direction and reusable context; a General Helper gives it neither.

Personal Bots have no description field. To change what a Bot does, tell it in chat.

### The primary Bot {#primary}

The primary Bot is your main contact: it checks in on its own and coordinates your other Bots. If you don't have one you'll see **Introducing your primary Bot** - create one or pick an existing Bot. A shared Bot can't be your primary Bot.

## Memory: what a Bot keeps {#memory}

::: proscons
#### It remembers
- Stable preferences and rules you set
- Facts about you (such as your name and time zone, shared by all your Bots)
- A dated log of its work
#### Keep out of memory
- Logins and passwords
- Payment cards
- Contact details (these belong in **Vault**)
:::

A Bot decides on its own what to keep and doesn't ask first; to make sure something sticks, say "remember…". There is no memory screen for personal Bots - everything happens in chat:

::: prompt Example prompt · view and edit memory
What do you remember about me?
(To correct:) That's out of date - I moved to [new city].
(To remove:) Forget that I'm on the launch team.
:::

| What you do | What happens to memory |
| --- | --- |
| Reset a conversation | Memory is kept |
| Delete a Bot | That Bot's memory is deleted |
| Delete your account | All your Bots' memory is deleted |

::: callout Memory is not a source of truth
Keep changing facts in their source system, and for important decisions ask the Bot to reopen current data rather than rely on memory. Enforce safety boundaries with approvals and Auto Review rules, not memory.
:::

## The cloud computer {#computer}

Each user gets a **persistent cloud computer** with a browser, command line and filesystem, and it keeps working when your laptop is closed. It belongs to your account, not to any one Bot:

- All your Bots **share** browser sessions, files and command-line credentials, so one Bot can pick up work another saved. That also means **separate Bots are not a security boundary**.
- Each Bot gets its own screen, so several Bots can use the browser at once - but one Bot runs only one computer-use task at a time.
- Isolation between users is strict: each user's computer is dedicated and hardware-isolated.
- Keep durable files in `/workspace`, in project folders.
- When something breaks, **Settings → Computer** offers **Update**, **Recover** and **Reset**, in increasing order of impact.

Bots do **not** use your own computer by default. They run local commands only if you enable it and approve, and the default policy is "Ask every time".

## Apps and sign-ins {#apps}

- **Connecting apps**: open **Connect apps** in the sidebar or follow a **Connect** card in chat. Type `@` in chat to attach an app to a task. An app can only do what your own account can already do.
- **Website logins**: the Bot tries a login saved in **Vault**, then a connected 1Password, then a **Secure Form** that asks you; it never sees the values. CAPTCHAs, passkeys, QR codes and similar steps come back to you.
- **Secrets**: use the masked secure secret card for API keys - never paste them into chat.
- **The Bot's email**: you can claim a permanent `mail.grokbot.com` address, and new mail can trigger a Routine.

## Skills and Routines {#skills-routines}

| | Skill | Routine |
| --- | --- | --- |
| Answers | **How** to do the task | **When** it runs and which Bot owns it |
| Created by | Asking a Bot to save a process by name, or demonstrating it (up to 10 minutes of recording) | Asking the owning Bot, with schedule, inputs, output and what to do when a source is missing |
| Scope | One skill library shared by all your Bots | Belongs to one Bot |

The recommended order: **do the task reliably once → save it as a skill → automate it as a Routine**.

A Routine can run on a schedule ("every weekday at 8:00 AM", "every 2 hours") or start from an event: Slack messages, GitHub, Linear, Sentry or PagerDuty events, email to the Bot's own address, or a webhook call. A new Routine waits for its next scheduled time; use **Test** to run it now (tests do real work).

::: props
- Per Bot: up to 50 Routines
- Run history: the 20 most recent runs per Routine
- Spacing: scheduled runs at least 5 minutes apart
- Hourly caps: 300 runs across all Routines, 200 per Routine
:::

::: prompt Example prompt · create a Routine
Create a Routine: every weekday at 8:00 AM (my time zone),
collect yesterday's new feedback from [a Slack channel] and [the feedback sheet],
sort it into problems / ideas / praise with a source link for each, and post it here.
If a source can't be opened, don't guess - tell me which one failed.
:::

## Group chats and handoffs {#group}

- **Start one**: **New chat** or `Cmd/Ctrl+Shift+N`, then add two to six Bots in **To:**.
- **Who replies**: with a normal message the Bots decide who responds; `@` a Bot to give it ownership; **Reply** to a message to direct your answer to the Bot that sent it.
- **Go easy on @everyone**: mention several Bots only when each truly needs to act, and name one owner per stage in your kickoff message.
- **Not in groups**: approval requests, sign-in and secret requests, and email or Slack drafts never appear in group chats.
- **Usage**: every Bot reply counts, including Bot-to-Bot messages - fewer Bots in a group means fewer replies.
- **Handoffs**: a Bot can send another Bot an asynchronous message; the other Bot wakes up, handles it and replies later, and the handoff is visible in the conversation. Good for source-to-deliverable work, specialist review and long jobs.

## Approvals and drafts {#approvals}

Outgoing email and Slack messages start as a draft marked **Needs approval**; you choose **Send** or **Discard**. Which actions need your approval depends on the tool, the risk and your Auto Review rules, and approvals raised during unattended work expire after about 30 minutes.

The official advice is simple: let Bots draft and recommend first, and require approval for **sending, purchasing, deleting, publishing and production changes**.

## Official sources {#sources}

::: links
- [Bots: creating, pictures, memory](https://docs.x.ai/grok-bot/bots) | docs.x.ai
- [The computer and apps](https://docs.x.ai/grok-bot/computer-and-apps) | docs.x.ai
- [Skills, routines and automations](https://docs.x.ai/grok-bot/skills-routines-and-automations) | docs.x.ai
- [Chat and collaboration](https://docs.x.ai/grok-bot/chat-and-collaboration) | docs.x.ai
:::
