// src/types/index.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  icon?: string;
  color?: string;
  post_count?: number;
  created_at: string;
  updated_at: string;
}

export interface State {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  capital?: string;
  post_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  post_count?: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  post_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface ImportantDate {
  id: string;
  post_id: string;
  label: string;
  date_value: string;
  sort_order: number;
}

export interface ApplicationFee {
  id: string;
  post_id: string;
  category: string;
  amount: string;
  sort_order: number;
}

export interface VacancyDetail {
  id: string;
  post_id: string;
  post_name: string;
  total_posts?: number;
  gen?: number;
  obc?: number;
  sc?: number;
  st?: number;
  ews?: number;
  qualification?: string;
  sort_order: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;

  // SEO
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  og_image?: string;

  // Job Details
  organization?: string;
  total_posts?: number;
  application_start?: string;
  application_end?: string;
  exam_date?: string;
  salary_min?: number;
  salary_max?: number;
  salary_text?: string;
  qualification?: string;
  age_min?: number;
  age_max?: number;
  official_website?: string;
  apply_link?: string;
  notification_link?: string;
  admit_card_link?: string;
  result_link?: string;

  // Relations
  category_id?: string;
  state_id?: string;
  category?: Category;
  state?: State;
  tags?: Tag[];
  faqs?: FAQ[];
  important_dates?: ImportantDate[];
  application_fees?: ApplicationFee[];
  vacancy_details?: VacancyDetail[];

  // Status
  status: 'draft' | 'published' | 'archived';
  post_type: 'job' | 'result' | 'admit-card' | 'answer-key' | 'syllabus' | 'news';
  is_featured: boolean;
  is_trending: boolean;
  view_count: number;

  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_url: string;
  site_description: string;
  site_keywords: string;
  contact_email: string;
  facebook_url?: string;
  twitter_url?: string;
  telegram_url?: string;
  youtube_url?: string;
  adsense_id?: string;
  google_analytics_id?: string;
}
