export interface User {
  id: number;
  username: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'editor';
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    articles: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ArticleTag {
  tagId: number;
  tag: Tag;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  coverImage?: string;
  status?: 'published' | 'draft';
  author?: User;
  tags?: ArticleTag[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  title: string;
  description: string;
  siteTitle?: string;
  siteDescription?: string;
  siteAuthor?: string;
  logo?: string;
  favicon?: string;
  aboutContent?: string;
  socialLinks?: string;
  postsPerPage?: number;
  layoutStyle?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MediaFile {
  id: number;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}
