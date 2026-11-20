import { getGiscusConfig } from './giscus';
import { localCommentRepository } from './local';
import type { CommentRepository } from './types';

export const giscus = getGiscusConfig();

/** 未配置 Giscus 时自动降级为本地演示仓库；生产环境配置 ID 后即为 GitHub Discussions */
export const comments: CommentRepository | null = giscus.configured ? null : localCommentRepository;

export type { CommentItem, CommentRepository } from './types';
