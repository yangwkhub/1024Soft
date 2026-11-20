/**
 * 构建期 HTTPS 守卫（全站 HTTPS）
 *
 * 静态站不能靠服务器配置强制 HTTPS —— GitHub Pages 由 GitHub 终止 TLS，
 * 所以必须在「产物」层面保证：任何会发起网络请求或对外暴露的 URL 都是 https://。
 *
 * 检查项：
 *  1. 站点相关环境变量 / astro.config.mjs 默认值必须是 https://
 *  2. dist 中所有页面与资源文件里出现 http:// 一律拒绝；
 *     XML/SVG 命名空间 URI 与 Octokit 内部 URL 解析基地址是「标识符」，不会发起请求，列入白名单
 *  3. 正向断言：canonical / og:url / sitemap <loc> / RSS <link> 必须是绝对 https:// URL
 *
 * 运行顺序：astro build → csp-hashes.mjs → check-https.mjs → pagefind
 * 由 npm run build 与 GitHub Actions 共同调用；失败即阻断发布，
 * 不改动 upload-pages-artifact / deploy-pages，因此不影响 GitHub Pages 部署方式。
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/* 这些 http:// 只是命名空间 / 库内部标识符，永不产生明文网络请求 */
const IDENTIFIER_PREFIXES = [
  'http://www.w3.org/',            // SVG / XHTML / MathML 命名空间
  'http://www.sitemaps.org/',      // sitemap 命名空间
  'http://www.google.com/schemas/',// sitemap 扩展命名空间
  'http://github.test'             // Octokit 内部解析相对 URL 用的 base，不发起请求
];
const SCAN_EXT = new Set([
  '.html', '.htm', '.xml', '.txt', '.json', '.css', '.js', '.mjs', '.svg', '.map', '.webmanifest'
]);
/* Pagefind 索引在本脚本之后由 search:index 重建，内容源自已校验的 HTML */
const SKIP_DIRS = new Set(['_pagefind']);

async function walk(dir, out = []) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(p, out);
    } else if (entry.isFile()) out.push(p);
  }
  return out;
}

const rel = (f) => relative(DIST, f).split(sep).join('/');
const failures = [];
let scanned = 0;
let identifiers = 0;
let canonicalCount = 0;
let ogCount = 0;
let locCount = 0;

/* ---------- 1. 站点 URL 配置 ---------- */
const envChecked = [];
for (const key of ['PUBLIC_SITE_URL', 'PUBLIC_REPO_URL', 'PUBLIC_API_BASE']) {
  const value = process.env[key];
  if (!value) continue;
  envChecked.push(`${key}=${value}`);
  if (!/^https:\/\//i.test(value)) failures.push(`环境变量 ${key} 不是 https://：${value}`);
}
const configText = await readFile(join(ROOT, 'astro.config.mjs'), 'utf8');
const defaultSite = configText.match(/process\.env\.PUBLIC_SITE_URL\s*\|\|\s*['"]([^'"]+)['"]/)?.[1];
if (!defaultSite) failures.push('未能从 astro.config.mjs 解析默认站点 URL');
else if (!/^https:\/\//i.test(defaultSite)) failures.push(`astro.config.mjs 默认站点 URL 不是 https://：${defaultSite}`);

/* ---------- 2. 产物中不得残留明文 HTTP ---------- */
const files = await walk(DIST);
const cache = new Map();
for (const file of files) {
  if (!SCAN_EXT.has(extname(file).toLowerCase())) continue;
  let text;
  try { text = await readFile(file, 'utf8'); } catch { continue; }
  cache.set(file, text);
  scanned++;
  for (const m of text.matchAll(/http:\/\/[^\s"'<>)]*/g)) {
    const url = m[0];
    if (IDENTIFIER_PREFIXES.some((p) => url.startsWith(p))) { identifiers++; continue; }
    const ctx = text.slice(Math.max(0, m.index - 60), m.index + 80).replace(/\s+/g, ' ');
    failures.push(`明文 HTTP → ${rel(file)}：${url.slice(0, 100)} ｜ 上下文 …${ctx}…`);
  }
}

/* ---------- 3. 对外 URL 必须是绝对 https ---------- */
for (const [file, text] of cache) {
  const name = rel(file);
  if (/\.html?$/i.test(name)) {
    for (const m of text.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)) {
      const href = m[0].match(/href=["']([^"']+)["']/i)?.[1];
      canonicalCount++;
      if (!href || !/^https:\/\//i.test(href)) failures.push(`canonical 不是绝对 https URL：${name} → ${href}`);
    }
    for (const m of text.matchAll(/<meta\b[^>]*property=["']og:url["'][^>]*>/gi)) {
      const value = m[0].match(/content=["']([^"']+)["']/i)?.[1];
      ogCount++;
      if (!value || !/^https:\/\//i.test(value)) failures.push(`og:url 不是绝对 https URL：${name} → ${value}`);
    }
  }
  if (/\.xml$/i.test(name)) {
    for (const m of text.matchAll(/<(loc|link)>([^<]+)<\/\1>/gi)) {
      locCount++;
      if (!/^https:\/\//i.test(m[2].trim())) failures.push(`<${m[1]}> 不是绝对 https URL：${name} → ${m[2].trim()}`);
    }
  }
}

/* ---------- 结果 ---------- */
if (failures.length) {
  console.error(`✗ HTTPS 守卫失败：共 ${failures.length} 项，发布已阻断`);
  for (const f of failures.slice(0, 30)) console.error(`  - ${f}`);
  if (failures.length > 30) console.error(`  … 另有 ${failures.length - 30} 项`);
  process.exit(1);
}

console.log(`✓ HTTPS 守卫通过：扫描 ${scanned} 个产物文件，明文 HTTP 传输 0 处`);
console.log(`  canonical ${canonicalCount} / og:url ${ogCount} / sitemap+RSS <loc|link> ${locCount} 全部为绝对 https URL`);
console.log(`  放行 ${identifiers} 处 XML/SVG 命名空间与库内部标识符（不会发起网络请求）`);
console.log(`  站点 URL：${envChecked.find((x) => x.startsWith('PUBLIC_SITE_URL=')) || `配置默认值 ${defaultSite}`}`);
if (!envChecked.length) console.log('  提示：未注入 PUBLIC_SITE_URL，使用 astro.config.mjs 的 https 默认值；CI 中由 Repository Variables 覆盖');
