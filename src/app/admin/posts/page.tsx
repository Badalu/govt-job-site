'use client';
// src/app/admin/posts/page.tsx
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/seo';

const TYPE_BADGE: Record<string, string> = {
  job: 'bg-green-100 text-green-700',
  result: 'bg-blue-100 text-blue-700',
  'admit-card': 'bg-purple-100 text-purple-700',
  'answer-key': 'bg-yellow-100 text-yellow-700',
  syllabus: 'bg-indigo-100 text-indigo-700',
  news: 'bg-gray-100 text-gray-700',
};

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', status: '', category: '' });
  const [categories, setCategories] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('posts')
      .select('id, title, slug, status, post_type, is_featured, is_trending, published_at, updated_at, view_count, category:categories(name, icon)', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    if (search) q = q.ilike('title', `%${search}%`);
    if (filter.type) q = q.eq('post_type', filter.type);
    if (filter.status) q = q.eq('status', filter.status);

    const { data, count } = await q;
    setPosts(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [search, filter, page]);

  useEffect(() => {
    loadPosts();
    supabase.from('categories').select('*').order('name').then(r => setCategories(r.data || []));
  }, [loadPosts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title.slice(0, 50)}"? This cannot be undone.`)) return;
    setDeleting(id);
    await supabase.from('post_tags').delete().eq('post_id', id);
    await supabase.from('faqs').delete().eq('post_id', id);
    await supabase.from('important_dates').delete().eq('post_id', id);
    await supabase.from('application_fees').delete().eq('post_id', id);
    await supabase.from('vacancy_details').delete().eq('post_id', id);
    await supabase.from('posts').delete().eq('id', id);
    setDeleting(null);
    loadPosts();
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 All Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total posts</p>
        </div>
        <Link href="/admin/posts/new"
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition">
          ➕ Add New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="🔍 Search posts..."
          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
        />
        <select value={filter.type} onChange={e => { setFilter(f => ({ ...f, type: e.target.value })); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500">
          <option value="">All Types</option>
          <option value="job">Job</option>
          <option value="result">Result</option>
          <option value="admit-card">Admit Card</option>
          <option value="answer-key">Answer Key</option>
          <option value="syllabus">Syllabus</option>
          <option value="news">News</option>
        </select>
        <select value={filter.status} onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={loadPosts} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          🔄 Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No posts found</p>
            <Link href="/admin/posts/new" className="text-orange-600 hover:underline text-sm mt-2 inline-block">
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 hidden sm:table-cell">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 hidden md:table-cell">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 hidden lg:table-cell">Views</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 hidden lg:table-cell">Updated</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {post.is_trending && <span className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded">HOT</span>}
                            {post.is_featured && <span className="text-[10px] bg-yellow-500 text-white font-bold px-1.5 py-0.5 rounded">⭐</span>}
                            <span className="text-sm font-medium text-gray-800">{post.title.slice(0, 70)}{post.title.length > 70 ? '...' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {post.category && <span className="text-[11px] text-gray-500">{post.category.icon} {post.category.name}</span>}
                            <span className="text-[11px] text-gray-400">/jobs/{post.slug.slice(0, 30)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[post.post_type] || 'bg-gray-100 text-gray-700'}`}>
                        {post.post_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' :
                        post.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-500">{post.view_count || 0}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-500">{formatDate(post.updated_at)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/jobs/${post.slug}`} target="_blank"
                          className="px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200">
                          View
                        </Link>
                        <Link href={`/admin/posts/edit/${post.id}`}
                          className="px-2 py-1.5 text-xs text-orange-600 hover:bg-orange-50 rounded border border-orange-200">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(post.id, post.title)} disabled={deleting === post.id}
                          className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200 disabled:opacity-50">
                          {deleting === post.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              ← Prev
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
