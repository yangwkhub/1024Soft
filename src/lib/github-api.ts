/**
 * v1.0 管理后台：浏览器直连 GitHub REST API。
 * PAT 只存 sessionStorage + 内存，绝不写入仓库、PUBLIC_ 变量、日志或 URL。
 * 所有写操作都落成 commit / PR，Git 历史即审计日志；不绕过 CI。
 */
import { Octokit } from 'octokit';

const OWNER = import.meta.env.PUBLIC_REPO_OWNER || 'OWNER';
const REPO = import.meta.env.PUBLIC_REPO_NAME || 'REPO';
const TOKEN_KEY = '1024soft_gh_pat';

let token: string | null = null;

export const repoTarget = { owner: OWNER, repo: REPO };
export const isPlaceholderRepo = OWNER === 'OWNER' || REPO === 'REPO';

export function signIn(pat: string) {
  token = pat.trim();
  sessionStorage.setItem(TOKEN_KEY, token); // 仅会话级，关闭标签即失效
}
export function restoreSession(): boolean {
  token = sessionStorage.getItem(TOKEN_KEY);
  return !!token;
}
export function signOut() {
  token = null;
  sessionStorage.removeItem(TOKEN_KEY);
}
export function isSignedIn() { return !!token; }

function api() {
  if (!token) throw new Error('请先在 #/login 用 GitHub PAT 登录');
  return new Octokit({
    auth: token,
    request: { headers: { 'X-GitHub-Api-Version': '2022-11-28' } }
  });
}

const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
};
const unb64 = (s: string) => {
  const binary = atob(s.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export interface PermissionCheck {
  login: string;
  avatar: string;
  canPush: boolean;
  scope: string;
  raw: Record<string, unknown>;
}

/** 登录自检：GET /user + GET /repos/{owner}/{repo} */
export async function checkPermission(): Promise<PermissionCheck> {
  const gh = api();
  const [{ data: user }, { data: repo }] = await Promise.all([
    gh.rest.users.getAuthenticated(),
    gh.rest.repos.get({ owner: OWNER, repo: REPO })
  ]);
  return {
    login: user.login,
    avatar: user.avatar_url,
    canPush: !!repo.permissions?.push || !!repo.permissions?.admin,
    scope: repo.full_name,
    raw: { permissions: repo.permissions, private: repo.private }
  };
}

export interface QueueItem {
  id: string;
  type: 'submission';
  priority: 'normal';
  title: string;
  state: string;
  created_at: string;
  url: string;
  number?: number;
  sla: string;
}

/** 投稿审核：只聚合带 submission 标签的开放 Issue */
export async function listQueue(): Promise<QueueItem[]> {
  const gh = api();
  const { data: issues } = await gh.rest.issues.listForRepo({
    owner: OWNER, repo: REPO, state: 'open', labels: 'submission', per_page: 100
  });
  return issues
    .filter((i) => !i.pull_request)
    .map((i) => ({
      id: `issue-${i.number}`, type: 'submission' as const, priority: 'normal' as const,
      title: i.title, state: 'open', created_at: i.created_at, url: i.html_url,
      number: i.number, sla: '48 h'
    }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function listCommits(perPage = 12) {
  const { data } = await api().rest.repos.listCommits({ owner: OWNER, repo: REPO, per_page: perPage });
  return data.map((c) => ({
    sha: c.sha.slice(0, 7), message: c.commit.message.split('\n')[0],
    author: c.commit.author?.name || 'unknown', date: c.commit.author?.date || '',
    url: c.html_url
  }));
}

export async function getRateLimit() {
  const { data } = await api().rest.rateLimit.get();
  return { remaining: data.resources.core.remaining, limit: data.resources.core.limit };
}

export async function readContent(path: string): Promise<{ content: string; sha: string }> {
  const { data } = await api().rest.repos.getContent({ owner: OWNER, repo: REPO, path, ref: 'main' });
  if (Array.isArray(data) || !('content' in data)) throw new Error('目标不是文件');
  return { content: unb64(data.content), sha: data.sha };
}

/** 写操作标准流程：临时分支 → PUT contents（改名时删除旧文件）→ 创建 PR → 触发 content-ci.yml */
export async function commitAsPR(opts: {
  path: string; content: string; message: string; action: string; slug: string; deletePath?: string;
}): Promise<{ branch: string; prUrl?: string; commitUrl?: string }> {
  const gh = api();
  const branch = `admin/${opts.action}-${opts.slug}-${Date.now().toString(36)}`;
  const { data: ref } = await gh.rest.git.getRef({ owner: OWNER, repo: REPO, ref: 'heads/main' });
  await gh.rest.git.createRef({ owner: OWNER, repo: REPO, ref: `refs/heads/${branch}`, sha: ref.object.sha });

  let sha: string | undefined;
  try {
    const { data } = await gh.rest.repos.getContent({ owner: OWNER, repo: REPO, path: opts.path, ref: branch });
    if (!Array.isArray(data) && 'sha' in data) sha = data.sha;
  } catch (e: any) { if (e.status !== 404) throw e; }

  const { data: put } = await gh.rest.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path: opts.path, branch, sha,
    message: opts.message, content: b64(opts.content)
  });
  // 标识符创建后可改：改名时在同一分支删除旧 slug 文件，避免 PR 中出现两份条目
  if (opts.deletePath && opts.deletePath !== opts.path) {
    let oldSha: string | undefined;
    try {
      const { data: old } = await gh.rest.repos.getContent({ owner: OWNER, repo: REPO, path: opts.deletePath, ref: branch });
      if (!Array.isArray(old) && 'sha' in old) oldSha = old.sha;
    } catch (e: any) { if (e.status !== 404) throw e; }
    if (oldSha) {
      await gh.rest.repos.deleteFile({ owner: OWNER, repo: REPO, path: opts.deletePath, branch, sha: oldSha, message: opts.message });
    }
  }
  try {
    const { data: pr } = await gh.rest.pulls.create({
      owner: OWNER, repo: REPO, head: branch, base: 'main',
      title: `chore(admin): ${opts.action} ${opts.slug}`,
      body: '由 1024Soft 管理后台生成，请等待 Content CI 校验通过后合并。'
    });
    try { await gh.rest.issues.addLabels({ owner: OWNER, repo: REPO, issue_number: pr.number, labels: ['admin-generated'] }); } catch { /* 标签不存在时忽略 */ }
    return { branch, prUrl: pr.html_url, commitUrl: put.commit.html_url };
  } catch {
    return { branch, commitUrl: put.commit.html_url };
  }
}

export async function closeIssue(number: number, state: 'closed' | 'open' = 'closed') {
  return api().rest.issues.update({ owner: OWNER, repo: REPO, issue_number: number, state });
}
export async function setIssueLabels(number: number, labels: string[]) {
  return api().rest.issues.setLabels({ owner: OWNER, repo: REPO, issue_number: number, labels });
}
