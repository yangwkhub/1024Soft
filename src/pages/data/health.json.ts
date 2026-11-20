import type { APIRoute } from 'astro';
import { getSoftware } from '../../lib/data';

export const prerender = true;

/** 链接 / 新鲜度健康报告，供每周巡检与后台看板读取 */
export const GET: APIRoute = async () => {
  const all = await getSoftware();
  const now = Date.now();
  const age = (iso: string) => (now - new Date(`${iso}T00:00:00Z`).getTime()) / 86400000;
  const stale = all.filter((s) => s.freshness === 'stale');
  const highRisk = all.filter((s) => s.risk_level === 'high');
  return new Response(JSON.stringify({
    generated_at: new Date().toISOString(),
    total: all.length,
    checked_within_180d: all.filter((s) => s.freshness === 'fresh').length,
    stale: stale.map((s) => ({ slug: s.slug, last_checked_at: s.last_checked_at, days: Math.round(age(s.last_checked_at)) })),
    high_risk: highRisk.map((s) => s.slug),
    status: stale.length > all.length * 0.2 ? 'needs-attention' : 'healthy'
  }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
