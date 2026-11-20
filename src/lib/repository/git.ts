import { filterSoftware, getBySlug, getFacets, getSoftware, getStats } from '../data';
import type { Facets, SoftwareRepository, SoftwareQuery } from './types';

/** v0.1 / v1.0-A：构建期读取 Astro content collection（Git 即数据库） */
export const gitRepository: SoftwareRepository = {
  async list(q: SoftwareQuery) {
    const all = await getSoftware();
    const filtered = filterSoftware(all, q);
    const page = Math.max(1, q.page || 1);
    const size = q.size || 24;
    return { items: filtered.slice((page - 1) * size, page * size), total: filtered.length };
  },
  async bySlug(slug: string) {
    return (await getBySlug(slug)) || null;
  },
  async facets(): Promise<Facets> {
    return getFacets();
  },
  async stats() {
    return getStats();
  }
};
