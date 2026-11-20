import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getSoftware, SITE_URL, href, canonical } from '../lib/data';
import { ui } from '../i18n/ui';

export const prerender = true;

export const GET: APIRoute = async () => {
  const all = await getSoftware();
  const items = [...all]
    .sort((a, b) => (b.released_at || b.last_checked_at).localeCompare(a.released_at || a.last_checked_at))
    .slice(0, 50)
    .map((s) => ({
      title: `${s.name}：${s.tagline}`,
      description: s.description,
      link: canonical(`software/${s.slug}/`),
      pubDate: new Date(`${s.released_at || s.last_checked_at}T00:00:00Z`),
      categories: s.categories,
      customData: `<guid isPermaLink="true">${canonical(`software/${s.slug}/`)}</guid>`
    }));

  return rss({
    title: `${ui.siteName} · 软件更新`,
    description: ui.siteDescription,
    site: SITE_URL,
    items,
    customData: `<language>zh-CN</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    trailingSlash: false
  });
};
