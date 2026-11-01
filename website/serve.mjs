// 本地预览：构建 + 静态服务器 + 监听源文件变化自动重建（零依赖）
// 用法：node serve.mjs [--no-watch]   端口：PORT=4173
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const port = +(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

const build = () => spawnSync(process.execPath, ['build.mjs'], { cwd: root, stdio: 'inherit', env: { ...process.env, BASE_PATH: '/', SITE_URL: `http://localhost:${port}/` } });
build();

if (!process.argv.includes('--no-watch')) {
  let timer;
  for (const dir of ['issues', 'guide', 'assets', 'lib']) {
    fs.watch(path.join(root, dir), { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(build, 150); });
  }
  for (const f of ['build.mjs', 'site.config.mjs', 'community.config.mjs']) fs.watch(path.join(root, f), () => { clearTimeout(timer); timer = setTimeout(build, 150); });
}

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(dist, p);
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404, { 'content-type': types['.html'] }); fs.createReadStream(path.join(dist, '404.html')).pipe(res); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`→ http://localhost:${port}/`));
