// src/lib/seo.ts
import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkarinaukri.com';
const SITE_NAME = 'SarkariNaukri.com';
const DEFAULT_OG = `${SITE_URL}/og-default.jpg`;

// ============================================
// SLUG GENERATOR
// ============================================
export function generateSlug(title: string): string {
  return title
    .toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// SEO TITLE
// ============================================
export function generateSEOTitle(title: string, type = 'job'): string {
  const year = new Date().getFullYear();
  const base = title.includes(year.toString()) ? title : `${title} ${year}`;
  const suffixMap: Record<string, string> = {
    job: 'Sarkari Naukri | Apply Online',
    result: 'Sarkari Result | Check Now',
    'admit-card': 'Admit Card | Download Now',
    'answer-key': 'Answer Key | Download PDF',
    syllabus: 'Syllabus PDF | Download',
    news: 'Sarkari Naukri News',
  };
  return `${base} - ${suffixMap[type] || 'Sarkari Naukri | Apply Online'}`;
}

// ============================================
// META DESCRIPTION
// ============================================
export function generateMetaDescription(post: any): string {
  if (post.seo_description) return post.seo_description.slice(0, 160);
  if (post.excerpt) return post.excerpt.slice(0, 160);
  const parts = [];
  if (post.organization) parts.push(post.organization);
  if (post.total_posts) parts.push(`${post.total_posts} Posts`);
  if (post.application_end) parts.push(`Last Date: ${formatDate(post.application_end)}`);
  if (post.qualification) parts.push(post.qualification.slice(0, 50));
  return `${post.title} 2026 Recruitment. ${parts.join(', ')}. Apply Online at ${SITE_NAME}.`.slice(0, 160);
}

// ============================================
// POST METADATA (Next.js Metadata API)
// ============================================
export function generatePostMetadata(post: any): Metadata {
  const title = post.seo_title || generateSEOTitle(post.title, post.post_type);
  const description = generateMetaDescription(post);
  const canonical = post.canonical_url || `${SITE_URL}/jobs/${post.slug}`;
  const image = post.og_image || post.featured_image || DEFAULT_OG;

  return {
    title,
    description,
    keywords: `${post.title}, sarkari naukri 2026, government jobs, ${post.category?.name || ''}, ${post.state?.name || ''}, apply online`,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: [{ url: image, width: 1200, height: 630, alt: post.featured_image_alt || post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@sarkarinaukri',
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

// ============================================
// CATEGORY PAGE METADATA
// ============================================
export function generateCategoryMetadata(category: any): Metadata {
  const title = category.seo_title || `${category.name} Jobs 2026 - Latest ${category.name} Sarkari Naukri`;
  const description = category.seo_description || `Get latest ${category.name} Jobs 2026 notifications. Check ${category.name} Government Jobs eligibility, salary, last date. Apply Online at ${SITE_NAME}.`;
  const canonical = `${SITE_URL}/category/${category.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: SITE_NAME, locale: 'en_IN', type: 'website' },
    twitter: { card: 'summary_large_image', title, description, site: '@sarkarinaukri' },
  };
}

// ============================================
// STATE PAGE METADATA
// ============================================
export function generateStateMetadata(state: any): Metadata {
  const title = state.seo_title || `${state.name} Sarkari Naukri 2026 - Latest ${state.name} Govt Jobs`;
  const description = state.seo_description || `Get latest ${state.name} Government Jobs 2026 notifications. Check ${state.name} Sarkari Naukri eligibility, salary, apply online at ${SITE_NAME}.`;
  const canonical = `${SITE_URL}/state/${state.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: SITE_NAME, locale: 'en_IN', type: 'website' },
  };
}

// ============================================
// TAG PAGE METADATA
// ============================================
export function generateTagMetadata(tag: any): Metadata {
  const title = tag.seo_title || `${tag.name} Jobs 2026 - Sarkari Naukri ${tag.name}`;
  const description = tag.seo_description || `Latest ${tag.name} Government Jobs 2026. Find all ${tag.name} Sarkari Naukri notifications at ${SITE_NAME}.`;
  const canonical = `${SITE_URL}/tag/${tag.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: SITE_NAME, locale: 'en_IN', type: 'website' },
  };
}

// ============================================
// ARTICLE SCHEMA
// ============================================
export function generateArticleSchema(post: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.seo_title || post.title,
    description: generateMetaDescription(post),
    image: post.featured_image ? [post.featured_image] : [DEFAULT_OG],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png`, width: 200, height: 60 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/jobs/${post.slug}` },
    keywords: `sarkari naukri 2026, ${post.title}, ${post.category?.name || ''}, government jobs`,
    articleSection: post.category?.name || 'Government Jobs',
    inLanguage: 'en-IN',
  };
}

// ============================================
// JOB POSTING SCHEMA
// ============================================
export function generateJobPostingSchema(post: any) {
  if (post.post_type !== 'job') return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: post.title,
    description: generateMetaDescription(post),
    identifier: { '@type': 'PropertyValue', name: SITE_NAME, value: post.id },
    datePosted: post.published_at || post.created_at,
    validThrough: post.application_end ? new Date(post.application_end).toISOString() : undefined,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: post.organization || 'Government of India',
      sameAs: post.official_website || SITE_URL,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: post.state?.name || 'India',
        addressCountry: 'IN',
      },
    },
    baseSalary: post.salary_min ? {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: post.salary_min,
        maxValue: post.salary_max || post.salary_min,
        unitText: 'MONTH',
      },
    } : undefined,
    educationRequirements: post.qualification || undefined,
    url: `${SITE_URL}/jobs/${post.slug}`,
    applicationContact: {
      '@type': 'ContactPoint',
      contactType: 'Apply Online',
      url: post.apply_link || `${SITE_URL}/jobs/${post.slug}`,
    },
  };
}

// ============================================
// FAQ SCHEMA
// ============================================
export function generateFAQSchema(faqs: any[]) {
  if (!faqs?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

// ============================================
// BREADCRUMB SCHEMA
// ============================================
export function generateBreadcrumbSchema(items: { label: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}

// ============================================
// WEBSITE SCHEMA
// ============================================
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Latest Sarkari Naukri 2026 - Government Jobs, Sarkari Result, Admit Card',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/jobs?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://twitter.com/sarkarinaukri',
      'https://www.facebook.com/sarkarinaukri',
    ],
  };
}

// ============================================
// COLLECTION PAGE SCHEMA
// ============================================
export function generateCollectionPageSchema(title: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

// ============================================
// TOC GENERATOR
// ============================================
export function generateTOC(content: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, '').trim(),
    });
  }
  return headings;
}

// ============================================
// ADD IDS TO HEADINGS
// ============================================
export function addHeadingIds(content: string): string {
  const counts: Record<string, number> = {};
  return content.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (_, level, attrs, text) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    const id = generateSlug(cleanText);
    counts[id] = (counts[id] || 0) + 1;
    const finalId = counts[id] > 1 ? `${id}-${counts[id]}` : id;
    if (attrs.includes('id=')) return `<h${level}${attrs}>${text}</h${level}>`;
    return `<h${level}${attrs} id="${finalId}">${text}</h${level}>`;
  });
}

// ============================================
// DATE FORMATTERS
// ============================================
export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(date: string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function getReadingTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.ceil(words / 200);
}
