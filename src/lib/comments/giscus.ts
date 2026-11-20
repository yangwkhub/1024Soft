/** Giscus 配置全部来自 PUBLIC_ 公开变量（repoId / categoryId 不是密钥） */
export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  lang: string;
  configured: boolean;
}

/** 构建期求值一次，供 Astro 组件直接读取 */
export const giscus: GiscusConfig = getGiscusConfig();

export function getGiscusConfig(): GiscusConfig {
  const repoId = import.meta.env.PUBLIC_GISCUS_REPO_ID || '';
  const categoryId = import.meta.env.PUBLIC_GISCUS_CATEGORY_ID || '';
  const repo = import.meta.env.PUBLIC_GISCUS_REPO || '';
  return {
    repo,
    repoId,
    category: import.meta.env.PUBLIC_GISCUS_CATEGORY || 'Comments',
    categoryId,
    mapping: import.meta.env.PUBLIC_GISCUS_MAPPING || 'pathname',
    lang: import.meta.env.PUBLIC_GISCUS_LANG || 'zh-CN',
    // 只有拿到真实 ID 且不是占位符时才加载第三方 iframe
    configured: /^(R_|MDEwOlJlcG9zaXRvcnk)/.test(repoId) && /^DIC_/.test(categoryId) && repo.includes('/') && !repo.includes('OWNER')
  };
}
