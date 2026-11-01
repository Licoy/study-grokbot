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
  // 社群页（/community/）的渠道：按顺序列出，文案在 i18n 的 community.channels[id]。
  // qr：assets/ 下的二维码图片路径（如 'assets/community/wechat.png'），留空时显示临时占位二维码。
  // logo：是否在二维码中间叠加站点 Logo（真实二维码需用高容错级别 H 生成；自带 Logo 的码设为 false）。
  // Channels on the community page (/community/), in order; copy lives in i18n community.channels[id].
  // qr: path of the QR image under assets/ (e.g. 'assets/community/wechat.png'); empty shows a temporary placeholder.
  // logo: overlay the site logo in the centre (generate real codes with error correction level H; set false if the code has its own logo).
  community: [
    { id: 'wechat', icon: 'wechat-fill', qr: '', logo: true },
  ],
  // 首页 / 指南页顺序
  guide: [
    { slug: '', file: 'index.md' },
    { slug: 'getting-started', file: 'getting-started.md' },
    { slug: 'concepts', file: 'concepts.md' },
    { slug: 'faq', file: 'faq.md' },
  ],
};
