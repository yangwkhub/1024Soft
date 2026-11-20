import type { Software } from '../data';

export interface SoftwareQuery {
  q?: string;
  platform?: string[];
  category?: string;
  license?: string;
  pricing?: string;
  sort?: 'recommend' | 'updated' | 'name';
  page?: number;
  size?: number;
}

export interface Facets {
  platforms: Map<string, number>;
  categories: Map<string, number>;
  licenses: Map<string, number>;
}

/** 页面只依赖此接口；切换 Git → Postgres/REST 时不改组件与 URL */
export interface SoftwareRepository {
  list(q: SoftwareQuery): Promise<{ items: Software[]; total: number }>;
  bySlug(slug: string): Promise<Software | null>;
  facets(): Promise<Facets>;
  stats(): Promise<{ total: number; open: number; openRatio: number; categories: number; platforms: number; featured: number; updated: string }>;
}

export type { Software };
