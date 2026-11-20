import type { APIRoute } from 'astro';
import { getSoftware, PRICING } from '../../lib/data';

export const prerender = true;

/** 客户端搜索的构建期索引；Pagefind 不可用时的降级数据源（PRD F3） */
export const GET: APIRoute = async () => {
  const all = await getSoftware();
  const items = all.map((s) => ({
    name: s.name,
    tagline: s.tagline,
    description: s.description,
    platforms: s.platforms,
    categories: s.categories,
    body: s.body.slice(0, 1200),
    weight: s.score,
    pricingLabel: PRICING[s.pricing]?.label || s.pricing,
    url: s.pageUrl
  }));
  return new Response(JSON.stringify({ generated_at: new Date().toISOString(), count: items.length, items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
};
