import { getCollection } from 'astro:content';
import categories from '../../data/categories.json';
import platforms from '../../data/platforms.json';
import licenses from '../../data/licenses.json';

/* ---------- 站点常量（全部使用 BASE_URL，兼容 GitHub Pages 子路径） ---------- */
const RAW_BASE = import.meta.env.BASE_URL || '/';
export const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;
/** 全站 HTTPS：明文站点/仓库 URL 一律升级，避免 canonical / OG / JSON-LD 出现 http:// */
const httpsOnly = (raw: string) => raw.replace(/^http:\/\//i, 'https://');
export const SITE_URL = httpsOnly(import.meta.env.PUBLIC_SITE_URL || 'https://OWNER.github.io');
export const REPO_URL = httpsOnly(import.meta.env.PUBLIC_REPO_URL || 'https://github.com/OWNER/REPO');
export const REPO_OWNER = import.meta.env.PUBLIC_REPO_OWNER || 'OWNER';
export const REPO_NAME = import.meta.env.PUBLIC_REPO_NAME || 'REPO';

/** 站内链接统一入口：禁止在页面里硬编码 / 开头的路径 */
export const href = (path = '') => `${BASE}${path.replace(/^\//, '')}`;
export const canonical = (path = '') => new URL(href(path), SITE_URL).toString();

/* ---------- 字典 ---------- */
export const dict = {
  categories, platforms, licenses,
  categoryMap: new Map<string, string>(categories.map((c) => [c.slug, c.name] as [string, string])),
  platformMap: new Map(platforms.map((p) => [p.slug, p.name])),
  licenseMap: new Map(licenses.map((l) => [l.slug, l.name]))
};
export const categoryName = (slug: string) => dict.categoryMap.get(slug) || slug;
export const platformName = (slug: string) => dict.platformMap.get(slug) || slug;
/** 非开源条目没有许可证代码，返回空字符串，调用方据此不渲染徽章 / 信息表行 */
export const licenseName = (code?: string) => (code ? dict.licenseMap.get(code) || code : '');

export const PRICING: Record<string, { label: string; tone: string }> = {
  free: { label: '完全免费', tone: 'blue' },
  freemium: { label: '免费增值', tone: 'amber' },
  free_for_personal: { label: '个人免费', tone: 'violet' },
  commercial: { label: '商业付费', tone: 'amber' }
};
export const RISK: Record<string, string> = {
  low: '官方来源，无已知捆绑',
  medium: '使用时请注意安装选项与授权范围',
  high: '存在较高风险，请仔细阅读官方说明'
};

/* ---------- 类型与工具 ---------- */
export interface Software {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  version?: string;
  developer?: string;
  homepage_url: string;
  repo_url?: string;
  download_url: string;
  license_code?: string;
  pricing: string;
  is_open_source: boolean;
  platforms: string[];
  categories: string[];
  screenshots: string[];
  released_at?: string;
  last_checked_at: string;
  featured: boolean;
  weight: number;
  downloads: number;
  risk_level: string;
  seo_title?: string;
  seo_description?: string;
  body: string;
  pageUrl: string;
  gotoUrl: string;
  freshness: 'fresh' | 'stale' | 'unknown';
  score: number;
  searchDocument: string;
  editUrl: string;
}

const iso = (d: unknown): string => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(String(d));
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};
export const flat = (s = '') => s.replace(/\s+/g, ' ').trim();
export const today = () => new Date().toISOString().slice(0, 10);

function normalize(entry: any): Software {
  const d = entry.data;
  const checked = iso(d.last_checked_at);
  const ageDays = checked ? (Date.now() - new Date(`${checked}T00:00:00Z`).getTime()) / 86400000 : NaN;
  const freshness: Software['freshness'] = !checked || Number.isNaN(ageDays) ? 'unknown' : ageDays > 180 ? 'stale' : 'fresh';
  const description = flat(d.description_md);
  const body = String(entry.body || '');
  const recency = freshness === 'fresh' ? 12 : freshness === 'stale' ? -8 : 0;
  return {
    ...d,
    description,
    body,
    last_checked_at: checked,
    released_at: iso(d.released_at),
    downloads: Number(d.downloads || 0),
    pageUrl: href(`software/${d.slug}/`),
    gotoUrl: href(`go/${d.slug}/`),
    freshness,
    score: Number(d.weight || 50) + (d.featured ? 8 : 0) + recency,
    searchDocument: [d.name, d.tagline, d.developer, description, body].join(' ').toLowerCase(),
    editUrl: `${REPO_URL}/edit/main/content/software/${d.slug}.md`
  };
}

let cache: Software[] | null = null;
/** 构建期读取 Git 内容集合 */
export async function getSoftware(): Promise<Software[]> {
  if (cache) return cache;
  const entries = await getCollection('software');
  cache = entries.map(normalize).sort((a, b) => b.score - a.score || b.last_checked_at.localeCompare(a.last_checked_at) || a.name.localeCompare(b.name));
  return cache;
}

export async function getBySlug(slug: string): Promise<Software | undefined> {
  return (await getSoftware()).find((s) => s.slug === slug);
}

/** 榜单每页条数；[page].astro 与 index.astro 共用，避免两处写死导致页数不一致 */
export const RANKING_PER_PAGE = 20;

/** 热门榜单按下载量降序；下载量相同再按推荐权重、名称稳定排序 */
export async function getRanking(): Promise<Software[]> {
  const all = await getSoftware();
  return [...all].sort((a, b) =>
    b.downloads - a.downloads || b.weight - a.weight || a.name.localeCompare(b.name, 'zh-CN'));
}

/** 下载量展示格式：过万转成「万」，保留一位小数 */
export const formatDownloads = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)} 万` : n.toLocaleString('zh-CN');

export async function getStats() {
  const all = await getSoftware();
  const open = all.filter((s) => s.is_open_source).length;
  return {
    total: all.length,
    open,
    openRatio: all.length ? Math.round((open / all.length) * 100) : 0,
    categories: dict.categoryMap.size,
    platforms: dict.platformMap.size,
    featured: all.filter((s) => s.featured).length,
    updated: today()
  };
}

export async function getFacets() {
  const all = await getSoftware();
  const count = (key: 'platforms' | 'categories' | 'license_code') => {
    const m = new Map<string, number>();
    for (const s of all) {
      const v = s[key];
      // 非开源条目的 license_code 为空，不计入许可证分面
      (Array.isArray(v) ? v : [v]).filter(Boolean).forEach((x) => m.set(String(x), (m.get(String(x)) || 0) + 1));
    }
    return m;
  };
  return { platforms: count('platforms'), categories: count('categories'), licenses: count('license_code') };
}

export const filterSoftware = (all: Software[], q: { platform?: string[]; category?: string; license?: string; pricing?: string; q?: string; sort?: string } = {}) => {
  let list = all.filter((s) => {
    if (q.platform?.length && !q.platform.some((p) => s.platforms.includes(p))) return false;
    if (q.category && !s.categories.includes(q.category)) return false;
    if (q.license && s.license_code !== q.license) return false;
    if (q.pricing && s.pricing !== q.pricing) return false;
    if (q.q && !s.searchDocument.includes(q.q.toLowerCase())) return false;
    return true;
  });
  if (q.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  else if (q.sort === 'updated') list = [...list].sort((a, b) => b.last_checked_at.localeCompare(a.last_checked_at));
  else list = [...list].sort((a, b) => b.score - a.score);
  return list;
};

/** 简易 Markdown → HTML（正文仅使用标题 / 列表 / 段落 / 加粗 / 行内代码，零运行时依赖） */
export function markdownToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s: string) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const out: string[] = [];
  let inList = false;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { if (inList) { out.push('</ul>'); inList = false; } continue; }
    if (/^#{2,3}\s/.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      const level = line.startsWith('###') ? 3 : 2;
      out.push(`<h${level}>${inline(line.replace(/^#{2,3}\s+/, ''))}</h${level}>`);
    } else if (/^[-*]\s/.test(line)) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
    } else out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}
