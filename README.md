# 🏛️ Sarkari Naukri SEO Blog — Next.js 14 + Supabase

A production-ready Government Job Blog with advanced auto-SEO system, inspired by Sarkari Result style websites.

## 🚀 Features

### Auto-SEO
- **Auto Title**: `Post Title 2026 – Sarkari Naukri | Apply Online`
- **Auto Slug**: `/haryana-police-recruitment-2026`
- **Auto Meta Description**: Generated from post data
- **Auto Canonical**: Set per page
- **Auto OG/Twitter Tags**: Dynamic per page
- **Auto Breadcrumb Schema**: JSON-LD
- **Auto Article Schema**: For Google Discover
- **Auto JobPosting Schema**: For Google Jobs
- **Auto FAQ Schema**: From admin-added FAQs
- **Auto TOC**: From H2/H3 headings with IDs
- **Auto Sitemap**: `/sitemap.xml` — auto-updated hourly
- **Auto Robots.txt**: With sitemap reference

### Performance
- ISR (Incremental Static Regeneration) every hour
- Static params generation for all posts
- Server Components throughout
- Next.js Image optimization
- No heavy client-side JS
- Lazy loading images

### Admin Panel
- Add/Edit/Delete posts with rich text editor
- Image upload to Supabase Storage
- SEO title, meta description, slug control
- FAQ management (generates FAQ schema)
- Vacancy tables, fees, important dates
- Category, state, tag selection
- Live SEO score (0-100)
- Google preview

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project at supabase.com
2. Run `supabase-schema.sql` in the SQL editor
3. Create a storage bucket named `job-images` (set to public)

### 3. Environment Variables
```bash
cp .env.example .env.local
# Fill in your Supabase URL, anon key, service role key
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
vercel --prod
# Add environment variables in Vercel dashboard
```

## 📂 Project Structure
```
src/
├── app/
│   ├── page.tsx              # Homepage with ISR
│   ├── layout.tsx            # Root layout + global SEO
│   ├── sitemap.ts            # Auto sitemap
│   ├── robots.ts             # Auto robots.txt
│   ├── jobs/[slug]/          # Post pages (ISR)
│   ├── category/[slug]/      # Category pages
│   ├── state/[slug]/         # State pages
│   ├── tag/[slug]/           # Tag pages
│   └── admin/                # Admin panel
├── components/
│   ├── admin/PostEditor.tsx  # Full-featured post editor
│   ├── seo/Breadcrumb.tsx    # Auto breadcrumb
│   ├── seo/TableOfContents.tsx
│   ├── seo/RelatedPosts.tsx
│   ├── ui/Header.tsx
│   └── ui/Footer.tsx
└── lib/
    ├── seo.ts                # All schema generators
    └── supabase.ts           # DB queries
```

## 📊 SEO Checklist
- [x] Auto title with year + "Sarkari Naukri"
- [x] Auto meta description (160 chars)
- [x] Auto canonical URL
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Article JSON-LD schema
- [x] JobPosting JSON-LD schema
- [x] FAQ JSON-LD schema
- [x] Breadcrumb JSON-LD schema
- [x] Auto sitemap.xml
- [x] robots.txt with sitemap
- [x] Table of Contents from headings
- [x] Related posts (same category/state)
- [x] Internal linking in content
- [x] ISR with hourly revalidation
- [x] Mobile responsive
- [x] Core Web Vitals optimized
- [x] Google Discover ready (big images + article schema)

## 🔗 URL Structure
- `/` — Homepage
- `/jobs/[slug]` — Job post
- `/category/[slug]` — Category page
- `/state/[slug]` — State page
- `/tag/[slug]` — Tag page
- `/result` — Results listing
- `/admit-card` — Admit cards
- `/admin` — Admin dashboard (protect with auth in production)
