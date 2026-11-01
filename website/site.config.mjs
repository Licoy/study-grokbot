// 站点配置 / Site configuration.
// 主域名 https://studygrokbot.com/（study-grokbot.com 在 DNS/注册商处 301 到主域名）。
// Primary domain https://studygrokbot.com/ (study-grokbot.com 301-redirects to it at the registrar).
// 可用环境变量 SITE_URL / BASE_PATH 覆盖（本地预览用）。Override with SITE_URL / BASE_PATH (local preview).
const url = (process.env.SITE_URL || 'https://studygrokbot.com/').replace(/\/?$/, '/');
const base = (process.env.BASE_PATH || new URL(url).pathname || '/').replace(/\/?$/, '/');

export default {
  title: 'Study GrokBot',
  url,            // absolute, ends with "/"
  base,           // path prefix, ends with "/"
  repo: 'https://github.com/Licoy/study-grokbot',
  twitter: '@licoycn', // twitter:site / twitter:creator
  x: 'https://x.com/licoycn',
  langs: ['en', 'zh'],          // first = default language at site root
  author: 'Study GrokBot community',
  // 首页 / 指南页顺序
  guide: [
    { slug: '', file: 'index.md' },
    { slug: 'getting-started', file: 'getting-started.md' },
    { slug: 'concepts', file: 'concepts.md' },
    { slug: 'faq', file: 'faq.md' },
  ],
};
