import { gitRepository } from './git';
import type { SoftwareRepository } from './types';

/**
 * 数据访问入口：v1.0 方案 A 固定为 git。
 * 切到方案 B 时只需在此注册 postgresRepository（走 /api/v1）并改环境变量，
 * 页面组件、字段与 URL 结构完全不变。
 */
const source = import.meta.env.DATA_SOURCE || 'git';

export const repo: SoftwareRepository = source === 'api'
  ? gitRepository // 方案 B 占位：替换为 postgresRepository 即可
  : gitRepository;

export type { SoftwareRepository, SoftwareQuery, Facets } from './types';
