/**
 * 1024Soft 本地 HTTPS 静态预览服务（零第三方依赖）
 *
 * 线上由 GitHub Pages 终止 TLS；本地用 OpenSSL 自签证书把 dist/ 也跑在 HTTPS 上，
 * 使开发预览与线上的协议、CSP、mixed-content 行为完全一致。
 *
 *   npm run serve        → https://127.0.0.1:4321/（主入口，默认）
 *   npm run serve:http   → http://127.0.0.1:4321/（应急回退，仍是明文）
 *
 * 同时监听一个 HTTP 端口（默认 4322），任何明文请求都 301 升级到 HTTPS。
 * 证书放在系统临时目录（纯 ASCII 路径，避开 Windows 中文路径问题），首次启动自动生成、复用。
 *
 * 可选环境变量：SERVE_PORT（HTTPS 端口）、SERVE_HTTP_PORT（重定向端口）、
 * SERVE_PREVIEW_PORT（内置预览面板兼容镜像，默认 0 关闭）、SERVE_HOST。
 */
import { createServer as createHttpsServer } from 'node:https';
import { createServer as createHttpServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, normalize, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const CERT_DIR = join(tmpdir(), '1024soft-localhost-https');
const KEY_PATH = join(CERT_DIR, 'localhost.key');
const CRT_PATH = join(CERT_DIR, 'localhost.crt');
const PORT = Number(process.env.SERVE_PORT || 4321);
const REDIRECT_PORT = Number(process.env.SERVE_HTTP_PORT || 4322);
// 只绑定回环地址：本地预览不暴露到局域网
const HOST = process.env.SERVE_HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip'
};

/** 生成带 SAN 的自签证书；已存在则复用，避免每次启动都触发浏览器信任提示 */
async function ensureCert() {
  if (existsSync(KEY_PATH) && existsSync(CRT_PATH)) return;
  await mkdir(CERT_DIR, { recursive: true });
  const args = [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
    '-keyout', KEY_PATH, '-out', CRT_PATH, '-days', '365',
    '-subj', '/C=CN/O=1024Soft Local/CN=localhost',
    '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1',
    '-addext', 'basicConstraints=critical,CA:TRUE',
    '-addext', 'keyUsage=critical,digitalSignature,keyEncipherment,keyCertSign',
    '-addext', 'extendedKeyUsage=serverAuth'
  ];
  try {
    execFileSync('openssl', args, { stdio: 'ignore' });
  } catch {
    throw new Error('生成自签证书失败：请确认已安装 OpenSSL（openssl version），或临时改用 npm run serve:http');
  }
  if (!existsSync(KEY_PATH) || !existsSync(CRT_PATH)) throw new Error('OpenSSL 未生成证书文件');
}

const SECURITY_HEADERS = {
  // 本地也发 HSTS，让浏览器把该来源始终升级到 HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-cache'
};

async function serve(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || '/', 'https://localhost').pathname);
  } catch {
    res.writeHead(400, SECURITY_HEADERS);
    res.end('Bad Request');
    return;
  }

  const relative = normalize(pathname).replace(/^([/\\])+/, '');
  let filePath = resolve(DIST, relative);
  // 目录穿越防护
  if (filePath !== DIST && !filePath.startsWith(DIST + sep)) {
    res.writeHead(403, SECURITY_HEADERS);
    res.end('Forbidden');
    return;
  }

  let info = null;
  try { info = await stat(filePath); } catch { /* 404 由下方处理 */ }

  if (info?.isDirectory() && !pathname.endsWith('/')) {
    const query = (req.url || '').includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    res.writeHead(301, { ...SECURITY_HEADERS, Location: `${pathname}/${query}` });
    res.end();
    return;
  }
  if (info?.isDirectory()) filePath = join(filePath, 'index.html');

  try {
    const body = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': type,
      'Content-Length': body.length
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    let notFound = Buffer.from('404 Not Found', 'utf8');
    try { notFound = await readFile(join(DIST, '404.html')); } catch { /* 保持纯文本 */ }
    res.writeHead(404, {
      ...SECURITY_HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': notFound.length
    });
    res.end(req.method === 'HEAD' ? undefined : notFound);
  }
}

await ensureCert();

const httpsServer = createHttpsServer(
  { key: await readFile(KEY_PATH), cert: await readFile(CRT_PATH) },
  serve
);

httpsServer.on('error', (err) => {
  console.error(`✗ HTTPS 服务启动失败（端口 ${PORT}）：${err.message}`);
  process.exit(1);
});

httpsServer.listen(PORT, HOST, () => {
  console.log('✓ 1024Soft 本地 HTTPS 预览已启动');
  console.log(`  主入口：https://127.0.0.1:${PORT}/  （或 https://localhost:${PORT}/）`);
  console.log(`  明文入口：http://127.0.0.1:${REDIRECT_PORT}/ → 自动 301 升级到 HTTPS`);
  console.log(`  自签证书：${CRT_PATH}`);
  console.log('  首次访问浏览器会提示「不安全」，点「高级 → 继续前往」即可；线上 GitHub Pages 使用 GitHub 签发的正式证书，无此提示。');
  console.log('  应急回退：npm run serve:http（明文 HTTP，仅本机排障用）');
});

// 所有明文 HTTP 请求一律 301 到 HTTPS，杜绝明文访问
const redirectServer = createHttpServer((req, res) => {
  const host = (req.headers.host || '').split(':')[0] || '127.0.0.1';
  res.writeHead(301, {
    Location: `https://${host}:${PORT}${req.url || '/'}`,
    'Cache-Control': 'no-store',
    ...SECURITY_HEADERS
  });
  res.end('301 → HTTPS\n');
});
redirectServer.on('error', (err) => {
  console.warn(`  （HTTP→HTTPS 重定向端口 ${REDIRECT_PORT} 不可用：${err.message}，不影响 HTTPS 主服务）`);
});
redirectServer.listen(REDIRECT_PORT, HOST);

/* 可选兼容通道：某些内置预览面板无法校验自签证书，可用同一 dist 的只读 HTTP 回环镜像展示。
   默认关闭（SERVE_PREVIEW_PORT=0），不是站点对外服务，线上 GitHub Pages 不存在此通道。 */
const PREVIEW_PORT = Number(process.env.SERVE_PREVIEW_PORT || 0);
if (PREVIEW_PORT) {
  const bridge = createHttpServer(serve);
  bridge.on('error', (err) => console.warn(`  （预览兼容端口 ${PREVIEW_PORT} 不可用：${err.message}）`));
  bridge.listen(PREVIEW_PORT, HOST, () => {
    console.log(`  预览面板兼容镜像：http://127.0.0.1:${PREVIEW_PORT}/（只读回环镜像，非站点服务）`);
  });
}
