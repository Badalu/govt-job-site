// src/app/jobs/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPostBySlug, getRelatedPosts, getSameStatePosts, getLatestPosts, getAllPublishedSlugs } from '@/lib/supabase';
import {
  generatePostMetadata, generateArticleSchema, generateJobPostingSchema,
  generateFAQSchema, generateBreadcrumbSchema, addHeadingIds, generateTOC,
  formatDate, timeAgo, getReadingTime
} from '@/lib/seo';
import Breadcrumb from '@/components/seo/Breadcrumb';
import TableOfContents from '@/components/seo/TableOfContents';
import RelatedPosts from '@/components/seo/RelatedPosts';
import { Post } from '@/types';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Not Found' };
  return generatePostMetadata(post as Post);
}

export default async function JobPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const processedContent = addHeadingIds(post.content || '');
  const toc = generateTOC(processedContent);

  const [relatedPosts, statePosts, latestPosts] = await Promise.all([
    getRelatedPosts(post, 5),
    post.state_id ? getSameStatePosts(post.state_id, post.id, 5) : Promise.resolve([]),
    getLatestPosts(6, 'job'),
  ]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Jobs', href: '/jobs' },
    ...(post.state ? [{ label: post.state.name, href: `/state/${post.state.slug}` }] : []),
    ...(post.category ? [{ label: post.category.name, href: `/category/${post.category.slug}` }] : []),
    { label: post.title.slice(0, 50), href: `/jobs/${post.slug}` },
  ];

  const articleSchema = generateArticleSchema(post as Post);
  const jobSchema = generateJobPostingSchema(post as Post);
  const faqSchema = post.faqs?.length ? generateFAQSchema(post.faqs) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const readingTime = getReadingTime(post.content || '');

  const isDeadlinePassed = post.application_end && new Date(post.application_end) < new Date();
  const daysLeft = post.application_end
    ? Math.ceil((new Date(post.application_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {jobSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }} />}
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* ===== MAIN CONTENT ===== */}
          <div className="min-w-0">
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <header className="mb-5">
              <div className="flex flex-wrap gap-2 mb-2">
                {post.category && (
                  <Link href={`/category/${post.category.slug}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: post.category.color || '#f97316' }}>
                    {post.category.icon} {post.category.name}
                  </Link>
                )}
                {post.state && (
                  <Link href={`/state/${post.state.slug}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                    📍 {post.state.name}
                  </Link>
                )}
                {post.tags?.map(tag => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700">
                    #{tag.name}
                  </Link>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                {post.title} 2026
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                <span>📅 Published: <time dateTime={post.published_at || post.created_at}>
                  {formatDate(post.published_at || post.created_at)}
                </time></span>
                <span>🔄 Updated: <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time></span>
                <span>⏱️ {readingTime} min read</span>
                <span>👁️ {post.view_count || 0} views</span>
              </div>

              {/* Deadline Alert */}
              {daysLeft !== null && (
                <div className={`rounded-lg p-3 mb-4 text-sm font-medium flex items-center gap-2 ${
                  isDeadlinePassed ? 'bg-red-50 text-red-700 border border-red-200' :
                  daysLeft <= 7 ? 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse' :
                  'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {isDeadlinePassed ? '🔴 Application deadline has passed.' :
                   daysLeft <= 7 ? `⚠️ Only ${daysLeft} days left to apply!` :
                   `✅ Application active. Last date: ${formatDate(post.application_end!)}`}
                </div>
              )}
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative w-full aspect-video mb-5 rounded-xl overflow-hidden bg-gray-100">
                <Image src={post.featured_image} alt={post.featured_image_alt || post.title}
                  fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 800px" />
              </div>
            )}

            {/* TOC */}
            {toc.length > 3 && <TableOfContents items={toc} />}

            {/* Job Details Summary Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
              <h2 className="text-base font-bold text-orange-800 mb-3">📋 {post.title} — Quick Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'Organization', value: post.organization },
                  { label: 'Total Posts', value: post.total_posts ? `${post.total_posts} Vacancies` : null },
                  { label: 'Application Start', value: post.application_start ? formatDate(post.application_start) : null },
                  { label: 'Last Date to Apply', value: post.application_end ? formatDate(post.application_end) : null },
                  { label: 'Exam Date', value: post.exam_date ? formatDate(post.exam_date) : null },
                  { label: 'Salary', value: post.salary_text || (post.salary_min ? `₹${post.salary_min.toLocaleString()} - ₹${post.salary_max?.toLocaleString()}` : null) },
                  { label: 'Qualification', value: post.qualification },
                  { label: 'Age Limit', value: post.age_min && post.age_max ? `${post.age_min} - ${post.age_max} Years` : null },
                ].filter(item => item.value).map(item => (
                  <div key={item.label} className="flex gap-2 text-sm">
                    <span className="font-semibold text-orange-700 shrink-0 min-w-[120px]">{item.label}:</span>
                    <span className="text-gray-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Dates Table */}
            {post.important_dates?.length > 0 && (
              <div className="mb-5">
                <h2 id="important-dates" className="text-lg font-bold text-gray-800 mb-2">📅 Important Dates</h2>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-orange-600 text-white">
                      <tr><th className="text-left py-2.5 px-4">Event</th><th className="text-left py-2.5 px-4">Date</th></tr>
                    </thead>
                    <tbody>
                      {post.important_dates.sort((a: any, b: any) => a.sort_order - b.sort_order).map((d: any, i: number) => (
                        <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                          <td className="py-2 px-4 font-medium text-gray-700">{d.label}</td>
                          <td className="py-2 px-4 text-gray-800 font-semibold">{d.date_value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Application Fee Table */}
            {post.application_fees?.length > 0 && (
              <div className="mb-5">
                <h2 id="application-fee" className="text-lg font-bold text-gray-800 mb-2">💰 Application Fee</h2>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-600 text-white">
                      <tr><th className="text-left py-2.5 px-4">Category</th><th className="text-left py-2.5 px-4">Fee</th></tr>
                    </thead>
                    <tbody>
                      {post.application_fees.sort((a: any, b: any) => a.sort_order - b.sort_order).map((f: any, i: number) => (
                        <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="py-2 px-4 font-medium text-gray-700">{f.category}</td>
                          <td className="py-2 px-4 text-gray-800 font-semibold">{f.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Vacancy Details */}
            {post.vacancy_details?.length > 0 && (
              <div className="mb-5">
                <h2 id="vacancy-details" className="text-lg font-bold text-gray-800 mb-2">📊 Vacancy Details</h2>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-green-600 text-white">
                      <tr>
                        <th className="text-left py-2.5 px-3">Post Name</th>
                        <th className="text-center py-2.5 px-3">Total</th>
                        <th className="text-center py-2.5 px-3">Gen</th>
                        <th className="text-center py-2.5 px-3">OBC</th>
                        <th className="text-center py-2.5 px-3">SC</th>
                        <th className="text-center py-2.5 px-3">ST</th>
                        <th className="text-center py-2.5 px-3">EWS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {post.vacancy_details.sort((a: any, b: any) => a.sort_order - b.sort_order).map((v: any, i: number) => (
                        <tr key={v.id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                          <td className="py-2 px-3 font-medium text-gray-700">{v.post_name}</td>
                          <td className="py-2 px-3 text-center font-semibold text-green-700">{v.total_posts || '—'}</td>
                          <td className="py-2 px-3 text-center">{v.gen || '—'}</td>
                          <td className="py-2 px-3 text-center">{v.obc || '—'}</td>
                          <td className="py-2 px-3 text-center">{v.sc || '—'}</td>
                          <td className="py-2 px-3 text-center">{v.st || '—'}</td>
                          <td className="py-2 px-3 text-center">{v.ews || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-sm max-w-none mb-6 prose-headings:text-gray-800 prose-a:text-orange-600 prose-table:border prose-td:border prose-th:border prose-th:bg-orange-50 prose-th:p-2 prose-td:p-2"
              dangerouslySetInnerHTML={{ __html: processedContent }} />

            {/* Apply Links */}
            {(post.apply_link || post.notification_link || post.result_link || post.admit_card_link) && (
              <div className="bg-white border-2 border-orange-200 rounded-xl p-5 mb-5">
                <h2 id="apply-links" className="text-base font-bold text-orange-800 mb-3">🔗 Important Links</h2>
                <div className="flex flex-wrap gap-3">
                  {post.apply_link && (
                    <a href={post.apply_link} target="_blank" rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-2">
                      ✅ Apply Online
                    </a>
                  )}
                  {post.notification_link && (
                    <a href={post.notification_link} target="_blank" rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-2">
                      📄 Official Notification
                    </a>
                  )}
                  {post.admit_card_link && (
                    <a href={post.admit_card_link} target="_blank" rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-2">
                      🎫 Download Admit Card
                    </a>
                  )}
                  {post.result_link && (
                    <a href={post.result_link} target="_blank" rel="noopener noreferrer"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-2">
                      📊 Check Result
                    </a>
                  )}
                  {post.official_website && (
                    <a href={post.official_website} target="_blank" rel="noopener noreferrer"
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-2">
                      🌐 Official Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="mb-5">
                <h2 id="faq" className="text-lg font-bold text-gray-800 mb-3">❓ Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {post.faqs.sort((a: any, b: any) => a.sort_order - b.sort_order).map((faq: any) => (
                    <details key={faq.id} className="group border border-gray-200 rounded-lg">
                      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-medium text-sm text-gray-800 hover:bg-orange-50">
                        {faq.question}
                        <span className="text-orange-600 group-open:rotate-180 transition-transform ml-2 shrink-0">▼</span>
                      </summary>
                      <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-2">{faq.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Links - Related Posts */}
            {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} title={`Related ${post.category?.name || ''} Jobs 2026`} />}
            {statePosts.length > 0 && post.state && (
              <RelatedPosts posts={statePosts} title={`More ${post.state.name} Govt Jobs 2026`} />
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <aside className="space-y-5">
            {/* Sticky Apply Box */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-4 text-white sticky top-20">
              <h3 className="font-bold text-base mb-2">Apply for This Job</h3>
              <p className="text-sm text-orange-100 mb-3">{post.title}</p>
              {post.application_end && (
                <p className="text-xs text-orange-100 mb-3">
                  Last Date: <strong>{formatDate(post.application_end)}</strong>
                </p>
              )}
              {post.apply_link ? (
                <a href={post.apply_link} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center bg-white text-orange-600 font-bold py-2 rounded-lg hover:bg-orange-50 transition text-sm">
                  ✅ Apply Online Now
                </a>
              ) : (
                <span className="block w-full text-center bg-white/20 text-white py-2 rounded-lg text-sm">
                  Link Coming Soon
                </span>
              )}
            </div>

            {/* Latest Jobs Widget */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-orange-600 px-4 py-2.5">
                <h3 className="text-white font-bold text-sm">🔴 Latest Sarkari Naukri 2026</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {latestPosts.map((p: any) => (
                  <Link key={p.id} href={`/jobs/${p.slug}`} className="block px-4 py-2.5 hover:bg-orange-50 transition">
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 hover:text-orange-600">{p.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(p.published_at || p.created_at)}</p>
                  </Link>
                ))}
              </div>
              <div className="px-4 py-2 bg-orange-50 border-t border-gray-100">
                <Link href="/jobs" className="text-xs text-orange-600 font-medium hover:underline">View All Jobs →</Link>
              </div>
            </div>

            {/* Post Meta */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3">📋 Post Details</h3>
              <div className="space-y-2 text-xs text-gray-600">
                {post.category && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Category:</span>
                    <Link href={`/category/${post.category.slug}`} className="text-orange-600 hover:underline">
                      {post.category.name}
                    </Link>
                  </div>
                )}
                {post.state && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">State:</span>
                    <Link href={`/state/${post.state.slug}`} className="text-blue-600 hover:underline">
                      {post.state.name}
                    </Link>
                  </div>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.tags.map((tag: any) => (
                        <Link key={tag.id} href={`/tag/${tag.slug}`}
                          className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full hover:bg-orange-100 hover:text-orange-700">
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <p>Published: {formatDate(post.published_at || post.created_at)}</p>
                  <p>Updated: {formatDate(post.updated_at)}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
