// 分享图字体：思源黑体 SC（Adobe 官方 GitHub Release，SIL OFL 1.1）。只在构建时渲染 PNG 用。
// OG image font: Source Han Sans SC from Adobe's official release (OFL). Build-time rendering only.
import os from 'node:os';
import path from 'node:path';

const version = process.env.SHS_VERSION || '2.005R';
export const FONT = {
  family: 'Source Han Sans SC',
  postScriptPrefix: 'SourceHanSansSC-',
  version,
  asset: '09_SourceHanSansSC.zip',
  url: `https://github.com/adobe-fonts/source-han-sans/releases/download/${version}/09_SourceHanSansSC.zip`,
  zipDir: 'OTF/SimplifiedChinese/',
  // weight → file（思源黑体没有 SemiBold，标题用 Bold）/ Source Han Sans has no SemiBold; titles use Bold
  weights: { 400: 'SourceHanSansSC-Regular.otf', 500: 'SourceHanSansSC-Medium.otf', 700: 'SourceHanSansSC-Bold.otf' },
  get files() { return Object.values(this.weights); },
};

export const fontDir = () => process.env.OG_FONT_DIR || path.join(os.homedir(), '.cache', 'study-grokbot', 'fonts', `source-han-sans-${version}`);
