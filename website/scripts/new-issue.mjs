// 新建一期（同时生成中英两份）/ Create a new issue in both languages.
// 用法 / usage: npm run new -- "GrokBot的Routines入门" "Getting started with Routines" [2026-11-02]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [topicZh = '本期主题', topicEn = 'Topic of this issue', dateArg] = process.argv.slice(2);
const date = dateArg || new Intl.DateTimeFormat('sv-SE', { timeZone: process.env.ISSUE_TZ || 'Etc/GMT-9' } /* UTC+9 */).format(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error(`Bad date: ${date}`); process.exit(1); }
const dirs = { zh: path.join(root, 'issues', 'zh'), en: path.join(root, 'issues', 'en') };
const files = { zh: path.join(dirs.zh, `${date}.md`), en: path.join(dirs.en, `${date}.md`) };
for (const f of Object.values(files)) if (fs.existsSync(f)) { console.error(`已存在 / exists: ${f}`); process.exit(1); }
const count = new Set(Object.values(dirs).flatMap((d) => (fs.existsSync(d) ? fs.readdirSync(d) : []).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)))).size;
const no = count + 1;
const tpl = {
  zh: `---
title: 《${date}期：${topicZh}》
date: ${date}
summary: 一句话介绍本期内容。
tags: []
issue: ${no}
lang: zh
draft: true
tldr:
  - 本期要点一（带上日期和来源）。
qa:
  - q: 这一期回答的核心问题是什么？
    a: 一两句话的直接回答。
---

## 本期导读 {#intro}

正文……

::: prompt
示例提示词
:::
`,
  en: `---
title: "Issue ${date}: ${topicEn}"
date: ${date}
summary: One sentence about this issue.
tags: []
issue: ${no}
lang: en
draft: true
tldr:
  - Key takeaway one (cite dates and sources).
qa:
  - q: What core question does this issue answer?
    a: A direct one- or two-sentence answer.
---

## What this issue covers {#intro}

Body text...

::: prompt Example prompt · copy and send to your Bot
Example prompt
:::
`,
};
for (const l of ['zh', 'en']) {
  fs.mkdirSync(dirs[l], { recursive: true });
  fs.writeFileSync(files[l], tpl[l]);
  console.log(`✓ ${path.relative(root, files[l])}`);
}
console.log('draft: true - remove that line in both files to publish.');
