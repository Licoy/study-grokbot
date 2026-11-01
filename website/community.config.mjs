// 社群渠道配置（社群页 /community/）。改完运行 npm run build 即可，二维码在构建时自动生成。
// Community channels for the /community/ page. Run npm run build after editing; QR codes are generated at build time.
//
// 每个渠道 / per channel:
//   id    对应 lib/i18n.mjs 里 community.channels[id] 的名称、说明和加入步骤
//         matches community.channels[id] in lib/i18n.mjs (name, blurb, steps)
//   icon  Remix Icon 图标名（品牌图标用 -fill）/ Remix Icon name (-fill for brand marks)
//   qr    二维码的文字内容：用任意扫码工具识别群二维码，把得到的文字（通常是一个链接）原样贴进来。
//         留空 = 还没上线：页面显示模糊的示意码和“即将上线”提示。
//         注意：微信群二维码 7 天后失效，到期要换新内容；个人号或企业微信的二维码长期有效。
//         The text inside the QR code: scan the group code with any scanner and paste the result (usually a URL) as is.
//         Empty = not live yet: the page shows a blurred sample code with a "coming soon" note.
//         Note: WeChat group codes expire after 7 days; personal / WeCom codes do not.
//   logo  中间叠站点 Logo（按最高容错级别 H 生成，盖住中间也能扫）；设为 false 则不叠
//         overlay the site logo in the centre (codes use error correction level H, so they still scan); false to skip
export default [
  { id: 'wechat', icon: 'wechat-fill', qr: '', logo: true },
];
