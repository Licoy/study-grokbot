---
title: 常见问题
summary: 关于 GrokBot 的常见问题（答案整理自官方 FAQ，附来源），以及关于本站的几个问题。
order: 3
---

## 基础 {#basics}

### GrokBot 和普通 AI 助手有什么不同？ {#vs-assistant}

GrokBot 的 Bot 能用云端电脑、工具和文件把事情真正做完，可以在后台运行，还能和其他 Bot 协作。

### GrokBot 和 Grok App 是同一个东西吗？ {#vs-grok}

不是。它们是两个独立的 App，GrokBot 用 Cursor 账号登录。

### 可以在哪里和 Bot 对话？ {#where}

桌面端和手机端 App、X Chat、在 X 上 @bot，以及共享到 Slack 里的 Bot。

### 我合上电脑，它还会继续干活吗？ {#laptop}

会。工作在云端电脑上运行，包括后台任务和 Routine。

### Bot 会用我自己的电脑吗？ {#local}

只有你在 **Settings → Computer** 里允许后才会，默认每次都会先问你。

### 我的几个 Bot 共用一台电脑吗？ {#shared}

是的。云端电脑按用户分配，不按 Bot 分配，所有 Bot 共享文件、浏览器登录状态和登录凭据。所以不要把“分成不同的 Bot”当作安全隔离手段。

### 可以同时让好几个 Bot 干活吗？ {#parallel}

可以。每个 Bot 有自己的屏幕，但一个 Bot 同一时间只跑一个操作电脑的任务。

### Bot 会记住什么？ {#memory}

稳定的偏好、角色背景和工作摘要；一些关于你的基本事实（如名字、时区）在所有 Bot 之间共享。可以直接问它“你记得关于我的哪些事”，重要的决定请让它去核对最新来源。详见[核心概念 · 记忆]({{root}}guide/concepts/#memory)。

### 任何网站它都能用吗？ {#websites}

很多网站都能用，但有的网站会拦截自动化操作、要验证码或要求登录，这些步骤 Bot 应该交回给你来完成。

### 哪些操作需要我批准？ {#approval}

取决于用到的工具、风险高低和你的自动审核规则。无人值守时产生的审批请求大约 30 分钟后会过期。

### 我可以自己选模型吗？ {#model}

不可以。GrokBot 会为每个任务自动选择模型，也不显示具体用的是哪个。

## 方案与计费 {#billing}

### 需要单独订阅 GrokBot 吗？ {#subscription}

不需要。它包含在多种 Grok 和 Cursor 方案里，部分 SuperGrok、X Premium+ 账号也可以关联使用。

### 怎么收费？ {#cost}

取决于你的方案。用量从**每周的额度池**里扣，每周重置；超出部分可以按量计费。不想额外付费，可以关掉按需用量或设一个花费上限（上限不会中断已经在跑的任务）。

### 有免费试用吗？ {#trial}

部分账号可以开启一个用量额度的试用，试用不能直接转成付费方案。额度按 Bot 实际干的活来消耗，而不是按消息条数。

## 功能 {#features}

### 技能和 Routine 有什么区别？ {#skill-vs-routine}

技能描述“这件事怎么做”；Routine 把一个流程指派给某个 Bot，并决定它什么时候运行。详见[核心概念 · 技能与 Routines]({{root}}guide/concepts/#skills-routines)。

### 可以演示一遍让 Bot 学会吗？ {#teach}

在支持的地区可以：录一遍浏览器里的操作（最长 10 分钟），会生成一份待你审阅的技能草稿。

### 可以把我的 Bot 分享给别人吗？ {#share}

可以，以模板链接的形式。对方拿到的是一个副本，**拿不到**你的电脑、登录状态和聊天记录。分享前请删掉里面的密钥、内部链接和客户数据。

### 删除一个 Bot 会怎样？ {#delete}

它的资料、对话、记忆和 Routine 都会被删除，且无法恢复；但共享电脑上的文件和登录状态可能还在，需要另外清理。以后可能还用得上的话，改用“从侧边栏隐藏”。

### 支持哪些平台？ {#platforms}

macOS、Windows、Linux 桌面端，iPhone 和 iPad（iOS 18+），以及 Android 9+。

### 桌面端有哪些常用快捷键？ {#shortcuts}

::: props
- 新建 Bot: `Cmd/Ctrl+N`
- 新建群聊: `Cmd/Ctrl+Shift+N`
- 语音输入: `Cmd/Ctrl+D`
- 搜索: `Cmd/Ctrl+K`
- 打开设置: `Cmd/Ctrl+,`
- 查看全部快捷键: `Cmd/Ctrl+/`
:::

## 关于本站 {#about}

### 这是官方网站吗？ {#official}

不是。Study GrokBot 是开源社区运营的非官方学习站点，与 SpaceXAI / xAI 及 Grok Bot 官方无任何关联。本页答案整理自官方文档，如有出入，以官方为准。

### 内容多久更新一次？ {#cadence}

计划每天更新一期，期刊文件位于仓库的 `website/issues/zh/`（中文）和 `website/issues/en/`（英文）目录。

### 我可以投稿吗？ {#contribute}

欢迎！到 [GitHub 仓库](https://github.com/Licoy/study-grokbot) 提交 Issue 或 PR，或在 X 上带 #StudyGrokBot 分享你的玩法。

## 官方资料 {#sources}

::: links
- [官方常见问题](https://docs.x.ai/grok-bot/faq) | docs.x.ai
- [Grok Bot 概览](https://docs.x.ai/grok-bot/overview) | docs.x.ai
- [聊天与协作](https://docs.x.ai/grok-bot/chat-and-collaboration) | docs.x.ai
:::
