import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

// CI 中由 Repository Variables 注入；本地走 .env
// 本地预览使用 '/'，部署到 OWNER.github.io/REPO/ 时改成 '/REPO'
// 全站 HTTPS：GitHub Pages 由 GitHub 终止 TLS，产物里不能出现明文站点 URL。
// 变量误配成 http:// 时一律升级，避免 sitemap / canonical / RSS 生成 http:// 链接；
// CI 的 check-https.mjs 会再做一次硬性拦截。
const RAW_SITE = process.env.PUBLIC_SITE_URL || 'https://OWNER.github.io';
const SITE = RAW_SITE.replace(/^http:\/\//i, 'https://');
if (SITE !== RAW_SITE) console.warn('[1024Soft] PUBLIC_SITE_URL 不是 HTTPS，已自动升级为', SITE);
const BASE = process.env.PUBLIC_BASE_PATH || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/go/') && !page.includes('/admin/') }),
    preact()
  ]
});
