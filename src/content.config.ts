import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const url = z.string().url().startsWith('https://', '必须使用 HTTPS');
const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{1,59}$/);

const software = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/software' }),
  schema: z.object({
    schema_version: z.literal(1),
    slug,
    name: z.string().min(1).max(60),
    tagline: z.string().min(4).max(60),
    description_md: z.string().min(10).max(200),
    version: z.string().max(30).optional(),
    developer: z.string().max(80).optional(),
    homepage_url: url,
    repo_url: url.optional(),
    download_url: url,
    // 开源条目必填；非开源条目不填写（规则见下方 superRefine）
    license_code: z.string().optional(),
    pricing: z.enum(['free', 'freemium', 'free_for_personal', 'commercial']),
    is_open_source: z.boolean(),
    platforms: z.array(z.string()).min(1),
    categories: z.array(z.string()).min(1).max(1),
    screenshots: z.array(z.string()).max(4).default([]),
    released_at: z.coerce.date().optional(),
    last_checked_at: z.coerce.date(),
    featured: z.boolean().default(false),
    weight: z.number().int().min(0).max(100).default(50),
    // 下载量静态快照：零后端方案下由维护者录入，可由外部统计导入覆盖
    downloads: z.number().int().min(0).default(0),
    risk_level: z.enum(['low', 'medium', 'high']),
    seo_title: z.string().max(60).optional(),
    seo_description: z.string().max(155).optional()
  }).superRefine((v, ctx) => {
    if (v.is_open_source) {
      if (!v.repo_url) ctx.addIssue({ code: 'custom', message: '开源软件必须提供 repo_url' });
      if (!v.license_code) ctx.addIssue({ code: 'custom', message: '开源软件必须提供 license_code' });
    } else {
      if (v.repo_url) ctx.addIssue({ code: 'custom', message: '非开源软件不应填写 repo_url' });
      if (v.license_code) ctx.addIssue({ code: 'custom', message: '非开源软件不应填写 license_code' });
    }
  })
});

export const collections = { software };
