// src/app/tag/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsByTag, getAllTags } from '@/lib/supabase';
import { generateTagMetadata, generateBreadcrumbSchema, formatDate } from '@/lib/seo';
import Breadcrumb from '@/components/seo/Breadcrumb';

export const revalidate = 3600;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t: any) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { tag } = await getPostsByTag(params.slug);
  if (!tag) return { title: 'Tag Not Found' };
  return generateTagMetadata(tag);
}

export default async function TagPage({ params, searchParams }: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { tag, posts, total } = await getPostsByTag(params.slug, page, 20);

  if (!tag) notFound();

  const totalPages = Math.ceil(total / 20);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tags', href: '/jobs' },
    { label: tag.name, href: `/tag/${tag.slug}` },
  ];

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbItems)) }} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 mb-6 text-white">
          <h1 className="text-2xl font-extrabold mb-1">
            🏷️ #{tag.name} — Jobs 2026
          </h1>
          <p className="text-indigo-100 text-sm">{total} Recruitment Notifications</p>
          {(tag.seo_description || tag.description) && (
            <p className="text-indigo-100 text-sm mt-2">{tag.seo_description || tag.description}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-indigo-600 px-4 py-3">
            <h2 className="text-white font-bold">All #{tag.name} Sarkari Naukri 2026</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {posts.map((post: any) => {
              const isExpired = post.application_end && new Date(post.application_end) < new Date();
              return (
                <div key={post.id} className="flex items-start gap-3 p-4 hover:bg-indigo-50 transition">
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/jobs/${post.slug}`} className="text-sm font-semibold text-gray-800 hover:text-indigo-700 line-clamp-2">
                      {post.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {post.category && (
                        <Link href={`/category/${post.category.slug}`} className="text-[11px] text-orange-600 hover:underline">
                          {post.category.icon} {post.category.name}
                        </Link>
                      )}
                      {post.state && (
                        <Link href={`/state/${post.state.slug}`} className="text-[11px] text-blue-600 hover:underline">
                          📍 {post.state.name}
                        </Link>
                      )}
                      {post.total_posts && (
                        <span className="text-[11px] text-gray-500">{post.total_posts} Posts</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {post.application_end && (
                      <span className={`text-[11px] font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                        {formatDate(post.application_end)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {posts.length === 0 && (
              <div className="py-10 text-center text-gray-400">No posts found for #{tag.name}.</div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between">
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                {page > 1 && <Link href={`/tag/${params.slug}?page=${page - 1}`} className="text-xs px-3 py-1.5 bg-gray-100 rounded hover:bg-indigo-100">← Prev</Link>}
                {page < totalPages && <Link href={`/tag/${params.slug}?page=${page + 1}`} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Next →</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
