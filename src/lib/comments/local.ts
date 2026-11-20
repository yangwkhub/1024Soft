import type { CommentItem, CommentRepository } from './types';

/**
 * 本地演示评论仓库（仅在未配置 Giscus ID 时启用）。
 * 数据只存当前浏览器 localStorage，绝不上传；配置 Giscus 后生产环境走 GitHub Discussions。
 */
const KEY = '1024soft_demo_comments_v1';
const SEED: CommentItem[] = [
  { id: 'demo-1', software_slug: '7zip', author_name: '阿岚', body_md: '用了很多年，压缩包里从来没夹带过推广组件。命令行版配合批处理脚本做每日归档很顺手。', status: 'published', like_count: 12, parent_id: null, created_at: '2026-10-28T09:20:00Z' },
  { id: 'demo-2', software_slug: 'vlc', author_name: 'Kite', body_md: '补充一点：播放不规则编码的本地文件时，可以在「工具 → 首选项 → 输入/编解码器」里调整缓存，卡顿会明显改善。', status: 'published', like_count: 8, parent_id: null, created_at: '2026-10-30T14:05:00Z' },
  { id: 'demo-3', software_slug: 'bitwarden', author_name: '林一', body_md: '免费版就够个人用了，浏览器扩展 + 手机端自动填充很稳定。高级功能属于可选付费项，标注写得很清楚。', status: 'published', like_count: 6, parent_id: null, created_at: '2026-11-01T03:40:00Z' },
  { id: 'demo-4', software_slug: 'syncthing', author_name: 'momo', body_md: '这个链接好像打不开了，麻烦维护者复核一下？', status: 'pending', like_count: 0, parent_id: null, created_at: '2026-11-03T11:00:00Z' },
  { id: 'demo-5', software_slug: 'libreoffice', author_name: '老周', body_md: '复杂排版的 docx 建议先小范围试转，我这边页眉页码会有一点偏移。', status: 'published', like_count: 4, parent_id: null, created_at: '2026-11-02T08:15:00Z' }
];

function read(): CommentItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as CommentItem[];
  } catch { /* 忽略 */ }
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return [...SEED];
}
function write(items: CommentItem[]) { localStorage.setItem(KEY, JSON.stringify(items)); }

export const localCommentRepository: CommentRepository = {
  async list(slug, sort = 'newest') {
    const items = read().filter((c) => c.software_slug === slug && c.status === 'published');
    return sort === 'hot'
      ? [...items].sort((a, b) => b.like_count - a.like_count || b.created_at.localeCompare(a.created_at))
      : [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async count(slug) { return read().filter((c) => c.software_slug === slug && c.status === 'published').length; },
  async create(slug, body, parentId = null) {
    const item: CommentItem = {
      id: `demo-${Date.now()}`, software_slug: slug, author_name: '本机访客',
      body_md: body, status: 'pending', like_count: 0, parent_id: parentId,
      created_at: new Date().toISOString()
    };
    write([item, ...read()]);
    return item;
  },
  async moderate(id, action) {
    const items = read().map((c) => c.id === id ? {
      ...c,
      status: action === 'approve' ? 'published' as const : action === 'hide' ? 'hidden' as const : 'deleted' as const
    } : c);
    write(items);
  }
};

/** 供后台演示模式读取全部评论（含待审） */
export function allLocalComments(): CommentItem[] {
  try { return read(); } catch { return []; }
}
export function moderateLocalComment(id: string, action: 'approve' | 'hide' | 'delete') {
  const items = read().map((c) => c.id === id ? {
    ...c,
    status: action === 'approve' ? 'published' as const : action === 'hide' ? 'hidden' as const : 'deleted' as const
  } : c);
  write(items);
}
export function likeLocalComment(id: string) {
  const items = read().map((c) => c.id === id ? { ...c, like_count: c.like_count + 1 } : c);
  write(items);
  return items.find((c) => c.id === id)?.like_count ?? 0;
}
export function pendingLocalComments(): CommentItem[] {
  return read().filter((c) => c.status === 'pending');
}
