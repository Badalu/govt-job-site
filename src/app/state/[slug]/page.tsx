// src/app/state/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsByState, getAllStates } from '@/lib/supabase';
import { generateStateMetadata, generateBreadcrumbSchema, formatDate } from '@/lib/seo';
import Breadcrumb from '@/components/seo/Breadcrumb';

export const revalidate = 3600;

export async function generateStaticParams() {
  const states = await getAllStates();
  return states.map((s: any) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { state } = await getPostsByState(params.slug);
  if (!state) return { title: 'State Not Found' };
  return generateStateMetadata(state);
}

export default async function StatePage({ params, searchParams }: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { state, posts, total } = await getPostsByState(params.slug, page, 20);

  if (!state) notFound();

  const totalPages = Math.ceil(total / 20);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'State Jobs', href: '/jobs' },
    { label: `${state.name} Jobs`, href: `/state/${state.slug}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* State Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 mb-6 text-white">
          <h1 className="text-2xl font-extrabold mb-1">
            🗺️ {state.name} Govt Jobs 2026 — Sarkari Naukri
          </h1>
          <p className="text-blue-100 text-sm mb-1">
            Capital: {state.capital} | {total} Active Recruitment Notifications
          </p>
          {(state.seo_description || state.description) && (
            <p className="text-blue-100 text-sm mt-2 max-w-3xl">{state.seo_description || state.description}</p>
          )}
        </div>

        {/* SEO Content */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-2">{state.name} Government Jobs 2026</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Looking for <strong>{state.name} Govt Jobs 2026</strong>? You are at the right place.
            SarkariNaukri.com provides all latest <strong>Sarkari Naukri in {state.name}</strong> including
            State PSC, Police, Teaching, Revenue Department, Health Department and various other government department jobs.
            All recruitment notifications are verified from official sources. Capital of {state.name} is {state.capital}.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { href: '/category/police', label: `${state.name} Police Jobs` },
              { href: '/category/teaching', label: `${state.name} Teacher Jobs` },
              { href: '/category/state-psc', label: `${state.name} PSC Jobs` },
              { href: '/result', label: `${state.name} Sarkari Result` },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-700 px-4 py-3 flex items-center justify-between">
            <h2 className="text-white font-bold">Latest {state.name} Sarkari Naukri 2026</h2>
            <span className="text-blue-100 text-xs">{total} Jobs</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50 border-b border-blue-100">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-blue-700">Post Name</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-blue-700 hidden sm:table-cell">Category</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-blue-700 hidden md:table-cell">Posts</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-blue-700">Last Date</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any, i: number) => {
                const isExpired = post.application_end && new Date(post.application_end) < new Date();
                return (
                  <tr key={post.id} className={`border-b border-gray-100 hover:bg-blue-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="py-3 px-4">
                      <Link href={`/jobs/${post.slug}`} className="text-sm font-medium text-gray-800 hover:text-blue-700 line-clamp-2">
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      {post.category && (
                        <Link href={`/category/${post.category.slug}`} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          {post.category.icon} {post.category.name}
                        </Link>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-sm text-gray-700">
                      {post.total_posts?.toLocaleString() || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {post.application_end ? (
                        <span className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                          {formatDate(post.application_end)}
                        </span>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
              {posts.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-gray-400">No jobs found for {state.name}.</td></tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/state/${params.slug}?page=${page - 1}`}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-blue-100">← Prev</Link>
                )}
                {page < totalPages && (
                  <Link href={`/state/${params.slug}?page=${page + 1}`}
                    className="px-3 py-1.5 text-xs bg-blue-700 text-white rounded hover:bg-blue-800">Next →</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
