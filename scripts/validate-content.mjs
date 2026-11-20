/**
 * 跨文件校验（Zod 无法覆盖的部分）：
 * 1. 文件名 == slug   2. 字典引用完整性
 * 3. download_url 与官网同域或命中白名单  4. 字段长度 / 复核时效
 * 任何一项失败 → 非零退出 → CI 失败 → PR 无法合并
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content/software');
const DATA = join(ROOT, 'data');
const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);

const readJSON = (name) => JSON.parse(readFileSync(join(DATA, name), 'utf8'));
const categories = readJSON('categories.json');
const platforms = readJSON('platforms.json');
const licenses = readJSON('licenses.json');
const allowedHosts = readJSON('allowed-download-hosts.json');

const catSlugs = new Set(categories.flatMap((c) => [c.slug, ...(c.children || []).map((x) => x.slug)]));
const platSlugs = new Set(platforms.map((x) => x.slug));
const licenseCodes = new Set(licenses.map((x) => x.slug));
const hostSet = new Set(allowedHosts);

const files = readdirSync(CONTENT).filter((f) => f.endsWith('.md'));
if (files.length === 0) err('content/software/', '目录为空，至少需要一条软件数据');

for (const file of files) {
  const path = join(CONTENT, file);
  const raw = readFileSync(path, 'utf8');
  let parsed;
  try { parsed = matter(raw); } catch (e) { err(file, `YAML 解析失败：${e.message}`); continue; }
  const d = parsed.data;
  const f = `content/software/${file}`;

  if (file !== `${d.slug}.md`) err(f, `文件名与 slug 不一致（应为 ${d.slug}.md）`);
  if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(d.slug || '')) err(f, 'slug 不符合正则');
  if (d.schema_version !== 1) err(f, 'schema_version 必须为 1');
  for (const [k, max] of [['tagline', 60], ['description_md', 200], ['seo_title', 60], ['seo_description', 155], ['name', 60]]) {
    if (d[k] && String(d[k]).length > max) err(f, `${k} 超过 ${max} 字符`);
  }
  if (!d.description_md || d.description_md.length < 10) err(f, 'description_md 至少 10 字符');
  if (!parsed.content || parsed.content.trim().length < 30) err(f, 'Markdown 正文至少 30 字符');
  // 开源：仓库与许可证都必填；非开源：两者都必须留空
  if (d.is_open_source) {
    if (!d.repo_url) err(f, '开源软件必须提供 repo_url');
    if (!d.license_code) err(f, '开源软件必须提供 license_code');
  } else {
    if (d.repo_url) err(f, '非开源软件不应填写 repo_url');
    if (d.license_code) err(f, '非开源软件不应填写 license_code');
  }
  if (!['low', 'medium', 'high'].includes(d.risk_level)) err(f, 'risk_level 非法');
  if (!['free', 'freemium', 'free_for_personal', 'commercial'].includes(d.pricing)) err(f, 'pricing 非法');
  if (d.downloads !== undefined && (!Number.isInteger(d.downloads) || d.downloads < 0)) err(f, 'downloads 必须是非负整数');

  const checkDict = (key, set, label) => {
    if (!Array.isArray(d[key])) { err(f, `${key} 必须是数组`); return; }
    for (const v of d[key]) if (!set.has(v)) err(f, `${label} 「${v}」不在字典中，请先更新 data/*.json`);
  };
  checkDict('categories', catSlugs, '分类');
  checkDict('platforms', platSlugs, '平台');
  // 非开源条目不填写 license_code；填写了就必须在当前字典内
  if (d.license_code && !licenseCodes.has(d.license_code)) err(f, `许可证「${d.license_code}」不在字典中`);

  const urls = ['homepage_url', 'repo_url', 'download_url'].filter((k) => d[k]);
  for (const k of urls) {
    if (!String(d[k]).startsWith('https://')) { err(f, `${k} 必须使用 HTTPS`); continue; }
    try { new URL(d[k]); } catch { err(f, `${k} 不是合法 URL`); }
  }
  if (d.homepage_url && d.download_url) {
    try {
      const home = new URL(d.homepage_url).hostname.replace(/^www\./, '');
      const down = new URL(d.download_url).hostname.replace(/^www\./, '');
      if (down !== home && !hostSet.has(new URL(d.download_url).hostname)) {
        err(f, `download_url 域名 ${down} 既不与官网同域，也不在 allowed-download-hosts.json 白名单中`);
      }
    } catch { /* 上面已报错 */ }
  }
  if (d.last_checked_at) {
    const days = (Date.now() - new Date(d.last_checked_at).getTime()) / 86400000;
    if (days > 180) warnings.push(`${f}: last_checked_at 超过 180 天未复核`);
    if (days < -1) err(f, 'last_checked_at 是未来时间');
  }
  if ((d.categories || []).length > 1) err(f, 'categories 至多 1 个');
  if ((d.categories || []).length < 1) err(f, 'categories 至少 1 个');
  if ((d.platforms || []).length < 1) err(f, 'platforms 至少 1 个');
  if ((d.screenshots || []).length > 4) err(f, 'screenshots 最多 4 张');
}

for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  console.error(`\n✗ 内容校验失败（${errors.length} 项）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ 内容校验通过：${files.length} 条条目，${catSlugs.size} 个分类，${platSlugs.size} 个平台，0 个错误，${warnings.length} 个提醒`);
