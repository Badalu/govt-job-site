// src/app/admin/page.tsx
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0;

async function getStats() {
  const [posts, cats, states, tags] = await Promise.all([
    supabaseAdmin.from('posts').select('id, status, post_type', { count: 'exact' }),
    supabaseAdmin.from('categories').select('id', { count: 'exact' }),
    supabaseAdmin.from('states').select('id', { count: 'exact' }),
    supabaseAdmin.from('tags').select('id', { count: 'exact' }),
  ]);

  const allPosts = posts.data || [];
  return {
    total: posts.count || 0,
    published: allPosts.filter(p => p.status === 'published').length,
    drafts: allPosts.filter(p => p.status === 'draft').length,
    categories: cats.count || 0,
    states: states.count || 0,
    tags: tags.count || 0,
  };
}

async function getRecentPosts() {
  const { data } = await supabaseAdmin
    .from('posts')
    .select('id, title, slug, status, post_type, published_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10);
  return data || [];
}

export default async function AdminPage() {
  const [stats, recentPosts] = await Promise.all([getStats(), getRecentPosts()]);

  const statCards = [
    { label: 'Total Posts', value: stats.total, icon: '📝', color: 'bg-blue-500', href: '/admin/posts' },
    { label: 'Published', value: stats.published, icon: '✅', color: 'bg-green-500', href: '/admin/posts?status=published' },
    { label: 'Drafts', value: stats.drafts, icon: '📋', color: 'bg-yellow-500', href: '/admin/posts?status=draft' },
    { label: 'Categories', value: stats.categories, icon: '📂', color: 'bg-purple-500', href: '#' },
    { label: 'States', value: stats.states, icon: '🗺️', color: 'bg-indigo-500', href: '#' },
    { label: 'Tags', value: stats.tags, icon: '🏷️', color: 'bg-pink-500', href: '#' },
  ];

  const quickActions = [
    { href: '/admin/posts/new', label: '➕ New Job Post', color: 'bg-green-600 hover:bg-green-700' },
    { href: '/admin/posts', label: '📋 All Posts', color: 'bg-blue-600 hover:bg-blue-700' },
    { href: '/sitemap.xml', label: '🗺️ View Sitemap', color: 'bg-gray-600 hover:bg-gray-700', target: '_blank' },
    { href: '/', label: '🌐 View Site', color: 'bg-orange-600 hover:bg-orange-700', target: '_blank' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-bold text-sm">SN</div>
          <div>
            <div className="font-bold">SarkariNaukri Admin</div>
            <div className="text-xs text-gray-400">Content Management System</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-white">View Site →</Link>
          <button className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded">Logout</button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-60px)] p-4">
          <nav className="space-y-1">
            {[
              { href: '/admin', label: '🏠 Dashboard', active: true },
              { href: '/admin/posts/new', label: '➕ New Post' },
              { href: '/admin/posts', label: '📝 All Posts' },
              { href: '#', label: '📂 Categories' },
              { href: '#', label: '🗺️ States' },
              { href: '#', label: '🏷️ Tags' },
              { href: '#', label: '⚙️ Settings' },
              { href: '#', label: '🔍 SEO Settings' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm transition ${item.active ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">📊 Dashboard</h1>
            <Link href="/admin/posts/new"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
              ➕ New Post
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {statCards.map(card => (
              <Link key={card.label} href={card.href}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center text-white text-sm mb-2`}>
                  {card.icon}
                </div>
                <div className="text-2xl font-extrabold text-gray-800">{card.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            {quickActions.map(action => (
              <Link key={action.href} href={action.href} target={(action as any).target}
                className={`${action.color} text-white font-medium px-4 py-2 rounded-lg text-sm transition`}>
                {action.label}
              </Link>
            ))}
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Recently Updated Posts</h2>
              <Link href="/admin/posts" className="text-xs text-orange-600 hover:underline">View All →</Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-500">Title</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 hidden md:table-cell">Type</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 hidden sm:table-cell">Updated</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post: any) => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-5">
                      <span className="text-sm font-medium text-gray-800 line-clamp-1">{post.title}</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">{post.post_type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' :
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{post.status}</span>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-xs text-gray-500">
                      {new Date(post.updated_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/posts/${post.id}/edit`}
                          className="text-xs text-blue-600 hover:underline">Edit</Link>
                        <Link href={`/jobs/${post.slug}`} target="_blank"
                          className="text-xs text-gray-500 hover:text-orange-600">View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
