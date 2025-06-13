
export type UserRole = 'NORMAL_USER' | 'WRITER_USER' | 'ADMIN_USER';

export interface BaseModel {
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// ==================== User ====================

export interface User extends BaseModel {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  username?: string;
  bio?: string;
  role: UserRole;
  new_user?: boolean;

  posts?: Post[];
  comments?: Comment[];
  ai_usage_logs?: AIUsageLog[];
  notifications?: Notification[];
}

// ==================== Post ====================

export interface Post extends BaseModel {
  id: string;
  slug: string;
  short_slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  example?: string;
  content: string;
  published: boolean;
  published_at?: string | null;
  keywords?: string[];
  key?: string;
  likes: number;
  views: number;
  read_time: number;

  author_id: string;
  author?: User;
  tags?: Tag[];
  categories?: Category[];
  comments?: Comment[];
  embeddings?: Embedding[];
}

// ==================== Comment ====================

export interface Comment extends BaseModel {
  id: number;
  content: string;

  post_id: string;
  author_id: string;
  post?: Post;
  author?: User;
}

// ==================== Tag ====================

export interface Tag extends BaseModel {
  id: number;
  name: string;

  posts?: Post[];
}

// ==================== Category ====================

export interface Category extends BaseModel {
  id: number;
  name: string;

  posts?: Post[];
}

// ==================== Embedding ====================

export interface Embedding extends BaseModel {
  id: string;
  post_id: string;
  content: string;
  vector: number[];

  post?: Post;
}

// ==================== Notification ====================

export interface Notification extends BaseModel {
  id: number;
  title: string;
  content: string;
  link: string;
  seen: boolean;
  seen_at?: string;

  user_id: string;
  user?: User;
}

// ==================== AIUsageLog ====================

export interface AIUsageLog extends BaseModel {
  id: number;
  user_id: string;
  used_at: string;
  action: string;
  token_used: number;
  success: boolean;
  message?: string;

  user?: User;
}

// ==================== AIResponse ====================

export interface AIResponse extends BaseModel {
  id: number;
  user_id: string;
  post_id: string;
  embedding_id: string;
  used_at: string;
  prompt: string;
  response: string;
  token_used: number;
  success: boolean;
  message?: string;

  user?: User;
  post?: Post;
  embedding?: Embedding;
}


export interface Meta {
  total: number;
  hasNextPage: boolean;
  page: number;
  limit: number;
  totalPage: number;
}