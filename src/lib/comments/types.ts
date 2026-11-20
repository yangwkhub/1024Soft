export interface CommentItem {
  id: string;
  software_slug: string;
  author_name: string;
  author_avatar?: string;
  body_md: string;
  status: 'pending' | 'published' | 'hidden' | 'deleted';
  like_count: number;
  parent_id: string | null;
  created_at: string;
  source_url?: string;
}

/** 评论区同样做数据源抽象：Giscus（方案 A）↔ 自建 comment 表（方案 B） */
export interface CommentRepository {
  list(slug: string, sort?: 'newest' | 'hot'): Promise<CommentItem[]>;
  count(slug: string): Promise<number>;
  create(slug: string, body: string, parentId?: string | null): Promise<CommentItem>;
  moderate(id: string, action: 'approve' | 'hide' | 'delete'): Promise<void>;
}
