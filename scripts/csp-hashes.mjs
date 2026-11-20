/**
 * 构建期 CSP 哈希注入（保持严格 script-src，不放开 'unsafe-inline'）。
 *
 * Astro 会把体积较小的 <script> 直接内联进 HTML（筛选、跳转倒计时、搜索快捷键等），
 * 严格 CSP 的 `script-src 'self'` 会拦掉它们。本脚本扫描 dist 下所有 HTML 页面，
 * 为每个内联可执行脚本计算 SHA-256，并写回对应页面 CSP meta 的 script-src 指令。
 * JSON-LD（type=application/ld+json）与外部 src 脚本不参与哈希。
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) await walk(p, out);
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = await walk(dist);
let patched = 0;
let totalHashes = 0;

for (const file of files) {
  let html = await readFile(file, 'utf8');
  const hashes = new Set();
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    const body = m[2];
    if (/\bsrc=/.test(attrs)) continue;                       // 外链脚本由 'self' / 白名单放行
    if (/type=["']application\/(ld\+)?json["']/.test(attrs)) continue; // JSON-LD 不执行
    if (!body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  if (!hashes.size) continue;

  const next = html.replace(/<meta\b[^>]*>/g, (tag) => {
    if (!/Content-Security-Policy/i.test(tag)) return tag;
    if (!/script-src/.test(tag)) return tag;
    // 注意：CSP 值里有大量单引号（'self' 等），这里只按双引号边界匹配，避免提前截断
    return tag.replace(/(content=")([^"]*)(")/, (whole, a, policy, c) => {
      const parts = policy.split(';').map((p) => {
        if (!p.trim().startsWith('script-src')) return p;
        const existing = p.match(/'sha256-[^']+'/g) || [];
        const added = [...hashes].filter((h) => !existing.includes(h));
        return `${p} ${added.join(' ')}`.trim();
      });
      return `${a}${parts.join(';')}${c}`;
    });
  });

  if (next !== html) { await writeFile(file, next, 'utf8'); patched++; totalHashes += hashes.size; }
}

console.log(`✓ CSP 哈希注入：${patched}/${files.length} 个页面，共 ${totalHashes} 个内联脚本哈希`);
