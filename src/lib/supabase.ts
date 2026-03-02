// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { persistSession: false }
});

// ============================================
// POST QUERIES
// ============================================

export async function getLatestPosts(limit = 20, type?: string) {
  let query = supabaseAdmin
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image, organization,
      application_end, total_posts, post_type, is_featured, is_trending,
      published_at, updated_at,
      category:categories(id, name, slug, icon, color),
      state:states(id, name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (type) query = query.eq('post_type', type);
  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getFeaturedPosts(limit = 6) {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image, organization,
      application_end, total_posts, post_type, published_at, updated_at,
      category:categories(id, name, slug, icon, color),
      state:states(id, name, slug)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select(`
      *,
      category:categories(*),
      state:states(*),
      faqs(*),
      important_dates(*),
      application_fees(*),
      vacancy_details(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) { console.error(error); return null; }

  // Fetch tags separately
  if (data) {
    const { data: tagsData } = await supabaseAdmin
      .from('post_tags')
      .select('tag:tags(*)')
      .eq('post_id', data.id);
    data.tags = tagsData?.map((t: any) => t.tag) || [];
  }

  return data;
}

export async function getRelatedPosts(post: any, limit = 5) {
  const tagIds = post.tags?.map((t: any) => t.id) || [];

  const { data } = await supabaseAdmin
    .from('posts')
    .select(`
      id, title, slug, featured_image, organization, application_end,
      published_at, post_type,
      category:categories(id, name, slug, icon, color)
    `)
    .eq('status', 'published')
    .neq('id', post.id)
    .eq('category_id', post.category_id)
    .order('published_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getSameStatePosts(stateId: string, excludeId: string, limit = 5) {
  const { data } = await supabaseAdmin
    .from('posts')
    .select(`
      id, title, slug, featured_image, organization, application_end,
      published_at, post_type,
      category:categories(id, name, slug, icon, color)
    `)
    .eq('status', 'published')
    .eq('state_id', stateId)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getPostsByCategory(slug: string, page = 1, limit = 20) {
  const { data: cat } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!cat) return { category: null, posts: [], total: 0 };

  const from = (page - 1) * limit;
  const { data, count } = await supabaseAdmin
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image, organization,
      application_end, total_posts, post_type, published_at, updated_at,
      state:states(id, name, slug)
    `, { count: 'exact' })
    .eq('status', 'published')
    .eq('category_id', cat.id)
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1);

  return { category: cat, posts: data || [], total: count || 0 };
}

export async function getPostsByState(slug: string, page = 1, limit = 20) {
  const { data: state } = await supabaseAdmin
    .from('states')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!state) return { state: null, posts: [], total: 0 };

  const from = (page - 1) * limit;
  const { data, count } = await supabaseAdmin
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image, organization,
      application_end, total_posts, post_type, published_at, updated_at,
      category:categories(id, name, slug, icon, color)
    `, { count: 'exact' })
    .eq('status', 'published')
    .eq('state_id', state.id)
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1);

  return { state, posts: data || [], total: count || 0 };
}

export async function getPostsByTag(slug: string, page = 1, limit = 20) {
  const { data: tag } = await supabaseAdmin
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!tag) return { tag: null, posts: [], total: 0 };

  const { data: postTagData } = await supabaseAdmin
    .from('post_tags')
    .select('post_id')
    .eq('tag_id', tag.id);

  const postIds = postTagData?.map((pt: any) => pt.post_id) || [];
  if (!postIds.length) return { tag, posts: [], total: 0 };

  const from = (page - 1) * limit;
  const { data, count } = await supabaseAdmin
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image, organization,
      application_end, total_posts, post_type, published_at, updated_at,
      category:categories(id, name, slug, icon, color),
      state:states(id, name, slug)
    `, { count: 'exact' })
    .eq('status', 'published')
    .in('id', postIds)
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1);

  return { tag, posts: data || [], total: count || 0 };
}

export async function getAllCategories() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name');
  return data || [];
}

export async function getAllStates() {
  const { data } = await supabaseAdmin
    .from('states')
    .select('*')
    .order('name');
  return data || [];
}

export async function getAllTags() {
  const { data } = await supabaseAdmin
    .from('tags')
    .select('*')
    .order('name');
  return data || [];
}

export async function getAllPublishedSlugs() {
  const { data } = await supabaseAdmin
    .from('posts')
    .select('slug, updated_at, post_type')
    .eq('status', 'published');
  return data || [];
}

export async function incrementViewCount(slug: string) {
  await supabaseAdmin.rpc('increment_view_count', { post_slug: slug });
}
