// src/app/jobs/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getLatestPosts, getAllCategories } from '@/lib/supabase';
import { formatDate } from '@/lib/seo';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Sarkari Naukri 2026 - All Latest Government Jobs | Apply Online',
  description: 'Browse all latest Sarkari Naukri 2026. Government Jobs for SSC, Railway, Banking, Police, UPSC, State PSC. Filter by category, state, qualification. Apply Online.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/jobs` },
  robots: { index: true, follow: true },
};

export default async function JobsPage({ searchParams }: { searchParams: { type?: string; page?: string } }) {
  const type = searchParams.type;
  const [posts, categories] = await Promise.all([
    getLatestPosts(40, type),
    getAllCategories(),
  ]);

  const typeFilters = [
    { value: '', label: '🔵 All Jobs' },
    { value: 'job', label: '💼 Recruitments' },
    { value: 'result', label: '📊 Results' },
    { value: 'admit-card', label: '🎫 Admit Cards' },
    { value: 'answer-key', label: '📝 Answer Keys' },
    { value: 'syllabus', label: '📚 Syllabus' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Latest Sarkari Naukri 2026</h1>
        <p className="text-gray-500 text-sm">All Government Job notifications — updated daily</p>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {typeFilters.map(f => (
          <Link key={f.value} href={f.value ? `/jobs?type=${f.value}` : '/jobs'}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              (type || '') === f.value ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50'
            }`}>
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        {/* Posts Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-orange-600 px-4 py-3">
            <h2 className="text-white font-bold">📋 All Sarkari Naukri 2026 — {posts.length} Posts</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-orange-50 border-b border-orange-100">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-orange-700">Post Name</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-orange-700 hidden sm:table-cell">Vacancies</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-orange-700 hidden md:table-cell">Category</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-orange-700">Last Date</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any, i: number) => {
                const isExpired = post.application_end && new Date(post.application_end) < new Date();
                const daysLeft = post.application_end
                  ? Math.ceil((new Date(post.application_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;
                return (
                  <tr key={post.id} className={`border-b border-gray-100 hover:bg-orange-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2">
                        {(post.is_trending || post.is_featured) && (
                          <span className="shrink-0 mt-0.5 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                            {post.is_trending ? 'HOT' : 'NEW'}
                          </span>
                        )}
                        <div>
                          <Link href={`/jobs/${post.slug}`} className="text-sm font-medium text-gray-800 hover:text-orange-600 line-clamp-2">
                            {post.title}
                          </Link>
                          {post.state && (
                            <Link href={`/state/${post.state.slug}`} className="text-[11px] text-blue-600 hover:underline">
                              📍 {post.state.name}
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-sm font-medium text-gray-700">
                      {post.total_posts ? post.total_posts.toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {post.category && (
                        <Link href={`/category/${post.category.slug}`}
                          className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full hover:bg-orange-200">
                          {post.category.icon} {post.category.name}
                        </Link>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {post.application_end ? (
                        <div>
                          <span className={`text-xs font-medium ${isExpired ? 'text-red-600' : daysLeft && daysLeft <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                            {formatDate(post.application_end)}
                          </span>
                          {!isExpired && daysLeft !== null && daysLeft <= 7 && (
                            <span className="block text-[10px] text-orange-600">{daysLeft}d left</span>
                          )}
                        </div>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
              {posts.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-gray-400">No jobs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-sm text-gray-700 mb-3">📂 Browse by Category</h3>
            <div className="space-y-1">
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-orange-50 transition group">
                  <span className="text-sm text-gray-700 group-hover:text-orange-600">{cat.icon} {cat.name}</span>
                  <span className="text-xs text-gray-400">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <h3 className="font-bold text-sm text-orange-800 mb-2">🔔 Free Job Alerts</h3>
            <p className="text-xs text-orange-700 mb-3">Get latest Sarkari Naukri notifications directly on Telegram!</p>
            <a href="#" className="block w-full text-center bg-orange-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-orange-700 transition">
              Join Telegram Channel
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
