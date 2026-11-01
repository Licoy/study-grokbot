---
title: 快速上手
summary: 安装 App、登录、认识第一个 Bot、给它一个岗位和第一个任务，再把做好的流程固定下来。照着做，十分钟跑通一遍。
order: 1
---

## 开始之前 {#before}

::: props
- 订阅: 需要支持 GrokBot 的方案，例如 X 订阅（The X Subscription）的 Premium、Super 或 Ultra；部分 SuperGrok、X Premium+ 订阅也可以关联使用。具体以官方“方案与计费”页面为准。
- 账号: GrokBot 使用 Cursor 账号登录，没有单独的一套账号。公司用 SSO 的，按公司的登录流程走。
- 隐私设置: GrokBot 需要云端数据存储，还在用旧版隐私模式（Privacy Mode (Legacy)）的账号，开始前会被提示切换到新版隐私模式。
:::

## 七步跑通第一个任务 {#steps}

::: steps
- 安装桌面端 | 从 x.ai/bot 或管理员给的链接下载。支持 macOS（Apple 芯片和 Intel）、Windows（x64 和 Arm64）、Linux（x64 和 Arm64），之后会自动更新。手机上到 App Store 或 Google Play 安装。
- 登录 | 在欢迎页点 **Sign in**，在浏览器里完成登录。要关联 SuperGrok 或 X Premium+ 的，桌面端到 **Settings → Usage & Billing** 点 **Get Access with Grok**。
- 认识第一个 Bot | 看完简短的引导后，GrokBot 会自动创建一个叫 **Grok Bot** 的 Bot 并打开对话。想再加 Bot，点侧边栏的 **+** 选 **Create a Bot**，或按 `Cmd/Ctrl+N`。
- 给它一个岗位 | 在第一条消息里只交代**一项主要工作**，并让它记住该怎么做。专注的 Bot 积累的上下文更有用，一个“万能助手”反而什么都积累不下来。
- 交代第一个任务 | 可以打字，也可以语音输入（桌面端 `Cmd/Ctrl+D`）。好的请求要说清：想要的结果、重要的来源、限制条件、交付格式，以及做到哪一步要先停下来问你。
- 登录它要用的工具 | 遇到需要登录的网站，Bot 会用 **Vault** 里存的账号、已连接的密码管理器（如 1Password），或弹出 **Secure Form** 让你填，它自己看不到密码。SSO、通行密钥这类表单搞不定的步骤，点 **Open computer** 自己完成，再把控制权交还给它。
- 复盘并固定下来 | 让它按你的意见修改，把长期偏好明确说出来（比如“以后周报都用这个格式”）。流程稳定后，存成**技能**或 **Routine**。
:::

## 示例：给 Bot 写一份岗位说明 {#job}

官方文档给过一个“产品性能”岗位的例子，大意如下，可以照着改成你自己的：

::: prompt 示例提示词 · 岗位说明
你的工作是[产品性能]。
请记住以下规矩，以后每次都照做：
1. 用[可观测性工具]查数据；
2. 保留所有链接和截图；
3. 把“证据”和“猜测”分开写；
4. 先说影响最大的问题；
5. 永远不要改动线上环境的设置。
:::

## 示例：五分钟的第一个任务 {#first-task}

::: prompt 示例提示词 · 第一个任务
请读一下我附上的文档，给我一份 5 条要点的摘要。
另起一节，列出文档里出现的每个日期、每个决定和每个待解决的问题，每一条都注明出自哪一节。
不要修改原文件。
:::

::: callout 在让 Bot 改动外部系统之前
先读一读官方的“审批与自动审核（Approvals and Auto Review）”文档：它讲了什么时候会弹审批、审核模型怎么判断，以及为什么不要把密码和密钥贴进聊天里。
:::

## 在手机上用 GrokBot {#mobile}

手机端要求 iOS 18 或以上、Android 9 或以上，用同一个 Cursor 账号登录即可，订阅权益会自动带过去。

::: proscons
#### 手机上可以做
- 给 Bot 发消息
- 观看并接管云端电脑
- 批准 Bot 的操作
- 暂停或恢复 Routine
#### 只能在桌面端做
- 演示一遍流程来教 Bot 新技能
- 测试 Routine
- 更新云端电脑
:::

## 遇到问题怎么办 {#trouble}

大多数安装和启动问题，**完全退出 App 再重新打开**就能解决。还不行的话，看官方的故障排查（Troubleshooting）页面，或联系官方支持。

## 官方资料 {#sources}

::: links
- [快速开始](https://docs.x.ai/grok-bot/get-started) | docs.x.ai
- [Bot：创建、头像、记忆](https://docs.x.ai/grok-bot/bots) | docs.x.ai
- [电脑与应用](https://docs.x.ai/grok-bot/computer-and-apps) | docs.x.ai
- [手机端](https://docs.x.ai/grok-bot/mobile) | docs.x.ai
:::
