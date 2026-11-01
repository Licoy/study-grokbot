// 用 issues/ 的 front matter 重新生成 README.md / README_ZH.md 里的期刊表（<!-- ISSUES:START --> … <!-- ISSUES:END -->）。
// Regenerate the issue tables in README.md / README_ZH.md from issue front matter.
//   node scripts/readme-issues.mjs          # rewrite the tables
//   node scripts/readme-issues.mjs --check  # exit 1 if a table is out of date
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import site from '../site.config.mjs';
import { ogTitle } from '../lib/og.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(root, '..');
const check = process.argv.includes('--check');
const load = (lang) => {
  const dir = path.join(root, 'issues', lang);
  return fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).map((f) => {
    const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
    const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
    return { ...data, date, slug: f.replace(/\.md$/, ''), lang };
  }).filter((x) => !x.draft).sort((a, b) => b.date.localeCompare(a.date));
};
const prefix = { en: '', zh: 'zh/' };
const head = { en: '| # | Date | Title |', zh: '| 期号 | 日期 | 标题 |' };
const table = (lang) => [head[lang], '| --- | --- | --- |',
  ...load(lang).map((it) => `| ${String(it.issue).padStart(3, '0')} | ${it.date} | [${ogTitle(lang, it.title)}](${site.url}${prefix[lang]}issues/${it.slug}/) |`)].join('\n');

let stale = 0;
for (const [file, lang] of [['README.md', 'en'], ['README_ZH.md', 'zh']]) {
  const p = path.join(repo, file);
  const src = fs.readFileSync(p, 'utf8');
  const out = src.replace(/(<!-- ISSUES:START -->\n)[\s\S]*?(\n<!-- ISSUES:END -->)/, `$1${table(lang)}$2`);
  if (out === src) { console.log(`✓ ${file} up to date`); continue; }
  if (check) { console.log(`✗ ${file}: issue table is out of date - run npm run readme`); stale++; }
  else { fs.writeFileSync(p, out); console.log(`✓ ${file} updated`); }
}
if (stale) process.exit(1);
