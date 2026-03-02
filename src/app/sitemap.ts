// src/app/sitemap.ts - Auto-generated sitemap
import { MetadataRoute } from 'next';
import { getAllPublishedSlugs } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkarinaukri.com';

export const revalidate = 3600; // Rebuild sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/result`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/admit-card`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/answer-key`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/syllabus`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Post pages
  const slugs = await getAllPublishedSlugs();
  const postPages: MetadataRoute.Sitemap = slugs.map(s => ({
    url: `${SITE_URL}/jobs/${s.slug}`,
    lastModified: new Date(s.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Category pages
  const { data: categories } = await supabaseAdmin.from('categories').select('slug, updated_at');
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(c => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(c.updated_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // State pages
  const { data: states } = await supabaseAdmin.from('states').select('slug, updated_at');
  const statePages: MetadataRoute.Sitemap = (states || []).map(s => ({
    url: `${SITE_URL}/state/${s.slug}`,
    lastModified: new Date(s.updated_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // Tag pages
  const { data: tags } = await supabaseAdmin.from('tags').select('slug, created_at');
  const tagPages: MetadataRoute.Sitemap = (tags || []).map(t => ({
    url: `${SITE_URL}/tag/${t.slug}`,
    lastModified: new Date(t.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...postPages, ...categoryPages, ...statePages, ...tagPages];
}
