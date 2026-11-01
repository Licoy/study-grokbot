// 分享图字体：思源宋体 SC（Adobe 官方 GitHub Release，SIL OFL 1.1）。只在构建时渲染 PNG 用。
// OG image font: Source Han Serif SC from Adobe's official release (OFL). Build-time rendering only.
import os from 'node:os';
import path from 'node:path';

const version = process.env.SHS_VERSION || '2.003R';
export const FONT = {
  family: 'Source Han Serif SC',
  postScriptPrefix: 'SourceHanSerifSC-',
  version,
  asset: '09_SourceHanSerifSC.zip',
  url: `https://github.com/adobe-fonts/source-han-serif/releases/download/${version}/09_SourceHanSerifSC.zip`,
  zipDir: 'OTF/SimplifiedChinese/',
  // weight → file
  weights: { 400: 'SourceHanSerifSC-Regular.otf', 500: 'SourceHanSerifSC-Medium.otf', 600: 'SourceHanSerifSC-SemiBold.otf' },
  get files() { return Object.values(this.weights); },
};

export const fontDir = () => process.env.OG_FONT_DIR || path.join(os.homedir(), '.cache', 'study-grokbot', 'fonts', `source-han-serif-${version}`);
