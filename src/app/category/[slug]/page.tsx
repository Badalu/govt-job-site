// src/app/category/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsByCategory, getAllCategories } from '@/lib/supabase';
import { generateCategoryMetadata, generateBreadcrumbSchema, formatDate, timeAgo } from '@/lib/seo';
import Breadcrumb from '@/components/seo/Breadcrumb';

export const revalidate = 3600;

export async function generateStaticParams() {
  const cats = await getAllCategories();
  return cats.map((c: any) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { category } = await getPostsByCategory(params.slug);
  if (!category) return { title: 'Category Not Found' };
  return generateCategoryMetadata(category);
}

export default async function CategoryPage({ params, searchParams }: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { category, posts, total } = await getPostsByCategory(params.slug, page, 20);

  if (!category) notFound();

  const totalPages = Math.ceil(total / 20);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Jobs', href: '/jobs' },
    { label: category.name, href: `/category/${category.slug}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const categoryDescriptions: Record<string, string> = {
    ssc: `Staff Selection Commission (SSC) conducts various recruitment exams like SSC CGL, CHSL, MTS, CPO, JHT, and Stenographer for central government departments. SSC jobs are one of the most sought-after Sarkari Naukri in India with lakhs of candidates applying every year. Get latest SSC Recruitment 2026 notifications, eligibility, syllabus, admit card, and results on SarkariNaukri.com.`,
    railway: `Indian Railways is one of the largest employers in India. Railway Recruitment Board (RRB) and Railway Recruitment Cells (RRC) conduct recruitment for Group A, B, C, and D posts including NTPC, JE, ALP, Technician, and Group D vacancies. Find all Railway Jobs 2026 with application links, eligibility criteria, and exam dates.`,
    banking: `Banking sector offers stable and prestigious government jobs including Bank PO, Bank Clerk, Specialist Officer (SO), and various other posts in IBPS, SBI, RBI, NABARD, and other public sector banks. Check latest Bank Jobs 2026 with complete notification details.`,
    police: `Police department recruitment includes posts like Constable, Sub-Inspector (SI), Inspector, and various support staff. State Police and Central Armed Police Forces (CAPF) regularly release recruitment notifications. Find all Police Bharti 2026 notifications with eligibility and application details.`,
  };

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Category Header */}
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl font-extrabold">{category.name} 2026</h1>
              <p className="text-orange-100 text-sm">{total} Recruitment Notifications Available</p>
            </div>
          </div>
          {(category.seo_description || category.description) && (
            <p className="text-orange-100 text-sm mt-2 max-w-3xl">
              {category.seo_description || category.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            {/* SEO Content */}
            {categoryDescriptions[params.slug] && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
                <h2 className="text-base font-bold text-gray-800 mb-2">{category.name} Jobs 2026 — Complete Information</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{categoryDescriptions[params.slug]}</p>
              </div>
            )}

            {/* Posts Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-orange-600 px-4 py-3 flex items-center justify-between">
                <h2 className="text-white font-bold">
                  {category.icon} Latest {category.name} Recruitment 2026
                </h2>
                <span className="text-orange-100 text-xs">{total} Jobs</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-orange-50 border-b border-orange-100">
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-orange-700">Post Name & Organization</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-orange-700 hidden sm:table-cell">Posts</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-orange-700 hidden md:table-cell">Last Date</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-orange-700">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post: any, i: number) => {
                    const isExpired = post.application_end && new Date(post.application_end) < new Date();
                    return (
                      <tr key={post.id} className={`border-b border-gray-100 hover:bg-orange-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-3 px-4">
                          <Link href={`/jobs/${post.slug}`} className="text-sm font-medium text-gray-800 hover:text-orange-600 line-clamp-2">
                            {post.title}
                          </Link>
                          {post.state && (
                            <Link href={`/state/${post.state.slug}`} className="text-[11px] text-blue-600 hover:underline mt-0.5 block">
                              📍 {post.state.name}
                            </Link>
                          )}
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-sm text-gray-700 font-medium">
                          {post.total_posts ? `${post.total_posts.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {post.application_end ? (
                            <span className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                              {isExpired ? '❌ ' : '✅ '}{formatDate(post.application_end)}
                            </span>
                          ) : <span className="text-gray-400 text-xs">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium capitalize">
                            {post.post_type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {posts.length === 0 && (
                    <tr><td colSpan={4} className="py-10 text-center text-gray-400">No posts found in this category.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link href={`/category/${params.slug}?page=${page - 1}`}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-orange-100 hover:text-orange-700">
                        ← Prev
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link href={`/category/${params.slug}?page=${page + 1}`}
                        className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700">
                        Next →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3">📂 All Categories</h3>
              <div className="space-y-1">
                {[
                  { href: '/category/ssc', label: '📋 SSC Jobs 2026' },
                  { href: '/category/railway', label: '🚂 Railway Jobs 2026' },
                  { href: '/category/banking', label: '🏦 Bank Jobs 2026' },
                  { href: '/category/police', label: '👮 Police Jobs 2026' },
                  { href: '/category/upsc', label: '🏛️ UPSC Jobs 2026' },
                  { href: '/category/defense', label: '🎖️ Defence Jobs 2026' },
                  { href: '/category/teaching', label: '📚 Teaching Jobs 2026' },
                  { href: '/category/state-psc', label: '🏢 State PSC 2026' },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className={`block text-xs py-1.5 px-2 rounded transition ${params.slug === l.href.split('/').pop() ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
