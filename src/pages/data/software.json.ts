import type { APIRoute } from 'astro';
import { getSoftware, getStats, dict, SITE_URL, canonical } from '../../lib/data';

export const prerender = true;

/** P0 的「只读开放 API」：静态 JSON，任何人都可镜像 / 二次开发（PRD 8.1） */
export const GET: APIRoute = async () => {
  const all = await getSoftware();
  const stats = await getStats();
  const payload = {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    site: SITE_URL,
    license: 'CC BY-SA 4.0',
    stats,
    dictionaries: {
      categories: dict.categories,
      platforms: dict.platforms,
      licenses: dict.licenses
    },
    items: all.map((s) => ({
      slug: s.slug,
      name: s.name,
      tagline: s.tagline,
      description: s.description,
      body_md: s.body,
      screenshots: s.screenshots,
      version: s.version || null,
      developer: s.developer || null,
      homepage_url: s.homepage_url,
      repo_url: s.repo_url || null,
      download_url: s.download_url,
      license_code: s.license_code || null,
      pricing: s.pricing,
      is_open_source: s.is_open_source,
      platforms: s.platforms,
      categories: s.categories,
      released_at: s.released_at || null,
      last_checked_at: s.last_checked_at,
      featured: s.featured,
      weight: s.weight,
      downloads: s.downloads,
      risk_level: s.risk_level,
      page_url: canonical(`software/${s.slug}/`),
      goto_url: canonical(`go/${s.slug}/`)
    }))
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
