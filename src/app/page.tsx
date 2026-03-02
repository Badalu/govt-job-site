// src/app/page.tsx - Enhanced SEO Homepage
import Link from 'next/link';
import { Metadata } from 'next';
import { getLatestPosts, getFeaturedPosts, getAllCategories, getAllStates } from '@/lib/supabase';
import { formatDate, generateWebsiteSchema } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Sarkari Naukri 2026 - Latest Govt Jobs | Sarkari Result | Apply Online',
  description: 'Get latest Sarkari Naukri 2026 notifications. Check Government Jobs for SSC, Railway, Bank, Police, UPSC, Defence. Free Sarkari Result, Admit Card, Answer Key. Apply Online at SarkariNaukri.com.',
  keywords: 'sarkari naukri 2026, govt jobs 2026, government jobs, sarkari result, admit card, ssc jobs, railway recruitment, bank jobs, police jobs, upsc jobs, apply online',
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkarinaukri.com' },
  openGraph: {
    type: 'website',
    title: 'Sarkari Naukri 2026 - Latest Govt Jobs | Apply Online',
    description: 'Latest Government Jobs 2026. SSC, Railway, Bank, Police, UPSC recruitment notifications. Free alerts. Apply Online.',
  },
};

const typeBadge: Record<string, { cls: string; label: string }> = {
  job: { cls: 'bg-green-100 text-green-700', label: 'Job' },
  result: { cls: 'bg-blue-100 text-blue-700', label: 'Result' },
  'admit-card': { cls: 'bg-purple-100 text-purple-700', label: 'Admit Card' },
  'answer-key': { cls: 'bg-yellow-100 text-yellow-700', label: 'Answer Key' },
  syllabus: { cls: 'bg-indigo-100 text-indigo-700', label: 'Syllabus' },
  news: { cls: 'bg-gray-100 text-gray-700', label: 'News' },
};

const CATEGORIES = [
  { href: '/category/ssc', icon: '📋', name: 'SSC', label: 'SSC Jobs 2026' },
  { href: '/category/railway', icon: '🚂', name: 'Railway', label: 'Railway Jobs 2026' },
  { href: '/category/banking', icon: '🏦', name: 'Banking', label: 'Bank Jobs 2026' },
  { href: '/category/police', icon: '👮', name: 'Police', label: 'Police Jobs 2026' },
  { href: '/category/defense', icon: '🎖️', name: 'Defence', label: 'Defence Jobs 2026' },
  { href: '/category/upsc', icon: '🏛️', name: 'UPSC', label: 'UPSC 2026' },
  { href: '/category/teaching', icon: '📚', name: 'Teaching', label: 'Teacher Jobs 2026' },
  { href: '/category/state-psc', icon: '🏢', name: 'State PSC', label: 'State PSC 2026' },
  { href: '/category/health', icon: '🏥', name: 'Health', label: 'Health Jobs 2026' },
  { href: '/category/engineering', icon: '⚙️', name: 'Engineering', label: 'Engineer Jobs 2026' },
  { href: '/admit-card', icon: '🎫', name: 'Admit Card', label: 'Admit Cards 2026' },
  { href: '/result', icon: '📊', name: 'Result', label: 'Results 2026' },
];

function DeadlineStatus({ endDate }: { endDate?: string }) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return <span className="text-[10px] text-red-600 font-semibold">Closed</span>;
  if (diff <= 3) return <span className="text-[10px] text-red-600 font-semibold animate-pulse">⚠️ {diff}d left</span>;
  if (diff <= 7) return <span className="text-[10px] text-orange-600 font-semibold">🔴 {diff}d left</span>;
  return <span className="text-[10px] text-green-600 font-semibold">Active</span>;
}

function JobRow({ post }: { post: any }) {
  const badge = typeBadge[post.post_type] || typeBadge.job;
  return (
    <tr className="border-b border-gray-100 hover:bg-orange-50/60 transition-colors">
      <td className="py-2.5 px-3">
        <div className="flex items-start gap-1.5">
          {(post.is_trending || post.is_featured) && (
            <span className={`shrink-0 mt-0.5 text-[9px] font-bold px-1 py-0.5 rounded ${post.is_trending ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>
              {post.is_trending ? 'HOT' : 'NEW'}
            </span>
          )}
          <div className="min-w-0">
            <Link href={`/jobs/${post.slug}`}
              className="text-[13px] font-medium text-gray-800 hover:text-orange-600 line-clamp-2 leading-snug">
              {post.title}
            </Link>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {post.category && (
                <Link href={`/category/${post.category.slug}`} className="text-[11px] text-orange-600 hover:underline">
                  {post.category.icon} {post.category.name}
                </Link>
              )}
              {post.state && (
                <Link href={`/state/${post.state.slug}`} className="text-[11px] text-blue-600 hover:underline">
                  {post.state.name}
                </Link>
              )}
              {post.total_posts && <span className="text-[11px] text-gray-500">{post.total_posts} posts</span>}
              <DeadlineStatus endDate={post.application_end} />
            </div>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-3 hidden sm:table-cell">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
      </td>
      <td className="py-2.5 px-3 text-[11px] text-gray-500 whitespace-nowrap hidden md:table-cell">
        {post.application_end ? formatDate(post.application_end) : '—'}
      </td>
    </tr>
  );
}

function JobsTable({ posts, title, href, icon, colorClass = 'from-orange-600 to-red-600' }: {
  posts: any[]; title: string; href: string; icon: string; colorClass?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className={`flex items-center justify-between px-4 py-2.5 bg-gradient-to-r ${colorClass}`}>
        <h2 className="text-white font-bold text-[15px] flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        <Link href={href} className="text-xs text-white/80 hover:text-white font-medium underline underline-offset-2">
          View All →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-orange-50 border-b border-orange-100">
              <th className="text-left py-1.5 px-3 text-[11px] font-semibold text-orange-700">Post / Organization</th>
              <th className="text-left py-1.5 px-3 text-[11px] font-semibold text-orange-700 hidden sm:table-cell">Type</th>
              <th className="text-left py-1.5 px-3 text-[11px] font-semibold text-orange-700 hidden md:table-cell">Last Date</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => <JobRow key={post.id} post={post} />)}
            {posts.length === 0 && (
              <tr><td colSpan={3} className="py-8 text-center text-gray-400 text-sm">No posts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [latestJobs, results, admitCards, featured, categories, states] = await Promise.all([
    getLatestPosts(20, 'job'),
    getLatestPosts(10, 'result'),
    getLatestPosts(10, 'admit-card'),
    getFeaturedPosts(4),
    getAllCategories(),
    getAllStates(),
  ]);

  const websiteSchema = generateWebsiteSchema();
  const homeFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is Sarkari Naukri?', acceptedAnswer: { '@type': 'Answer', text: 'Sarkari Naukri means Government Job in Hindi. It refers to employment in central/state government departments, PSUs, banks, railways, defense forces in India.' } },
      { '@type': 'Question', name: 'How to find latest Sarkari Naukri 2026?', acceptedAnswer: { '@type': 'Answer', text: 'Visit SarkariNaukri.com daily for latest government job notifications. Filter by category (SSC, Railway, Bank), state, or qualification. Get free alerts.' } },
      { '@type': 'Question', name: 'What is Sarkari Result?', acceptedAnswer: { '@type': 'Answer', text: 'Sarkari Result refers to results declared by government organizations after recruitment exams including merit lists and selection lists.' } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />

      {/* ===== LIVE TICKER ===== */}
      <div className="bg-red-600 text-white py-1.5 overflow-hidden">
        <div className="flex items-center gap-4 max-w-7xl mx-auto px-4">
          <span className="shrink-0 bg-white text-red-600 font-bold text-[11px] px-2 py-0.5 rounded uppercase">🔴 Live</span>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee whitespace-nowrap text-[13px]">
              {[...latestJobs.slice(0, 8), ...results.slice(0, 3)].map(p => (
                <Link key={p.id} href={`/jobs/${p.slug}`} className="mr-10 hover:underline opacity-90 hover:opacity-100">
                  ◆ {p.title}
                </Link>
              ))}
              {/* Duplicate for seamless loop */}
              {[...latestJobs.slice(0, 8), ...results.slice(0, 3)].map(p => (
                <Link key={`dup-${p.id}`} href={`/jobs/${p.slug}`} className="mr-10 hover:underline opacity-90 hover:opacity-100">
                  ◆ {p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== HERO BANNER ===== */}
      <section className="bg-gradient-to-r from-red-700 via-orange-600 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Sarkari Naukri 2026
              </h1>
              <p className="text-orange-100 mt-1 text-sm sm:text-base">
                Latest Government Jobs • Sarkari Result • Admit Card • Apply Online
              </p>
            </div>
            <div className="flex gap-3 text-center">
              <div className="bg-white/20 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                <div className="text-2xl font-bold">{latestJobs.length}+</div>
                <div className="text-[11px] text-orange-100 font-medium">Active Jobs</div>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                <div className="text-2xl font-bold">{results.length}+</div>
                <div className="text-[11px] text-orange-100 font-medium">Results</div>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                <div className="text-2xl font-bold">{admitCards.length}+</div>
                <div className="text-[11px] text-orange-100 font-medium">Admit Cards</div>
              </div>
            </div>
          </div>

          {/* Quick Category Links in Hero */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.slice(0, 8).map(cat => (
              <Link key={cat.href} href={cat.href}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm transition">
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY QUICK LINKS ===== */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1">
            {CATEGORIES.map(cat => (
              <Link key={cat.href} href={cat.href}
                className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-orange-50 text-center group transition">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[11px] font-medium text-gray-700 group-hover:text-orange-600 leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ===== FEATURED POSTS ===== */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
                ⭐ Featured Sarkari Naukri 2026
              </h2>
              <Link href="/jobs" className="text-xs text-orange-600 hover:underline font-medium">All Jobs →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featured.map((post: any) => (
                <Link key={post.id} href={`/jobs/${post.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all group">
                  {post.featured_image && (
                    <div className="aspect-[16/7] overflow-hidden bg-orange-50">
                      <img src={post.featured_image} alt={post.featured_image_alt || post.title}
                        loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {post.category && (
                        <span className="text-[11px] text-orange-600 font-medium">{post.category.icon} {post.category.name}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-orange-600">
                      {post.title}
                    </h3>
                    {post.application_end && (
                      <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                        📅 Last: {formatDate(post.application_end)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== TWO-COLUMN JOBS TABLE ===== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-600 rounded-full inline-block" />
              🔥 Latest Sarkari Naukri 2026
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <JobsTable posts={latestJobs.slice(0, 10)} title="Latest Govt Jobs 2026" href="/jobs" icon="💼" />
            <JobsTable posts={latestJobs.slice(10, 20)} title="New Vacancy 2026" href="/jobs" icon="📢" colorClass="from-blue-700 to-blue-900" />
          </div>
        </section>

        {/* ===== RESULTS & ADMIT CARDS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <JobsTable posts={results} title="Sarkari Result 2026" href="/result" icon="📊" colorClass="from-blue-600 to-indigo-700" />
          <JobsTable posts={admitCards} title="Admit Card 2026" href="/admit-card" icon="🎫" colorClass="from-purple-600 to-purple-800" />
        </div>

        {/* ===== HIGH-QUALITY SEO CONTENT ===== */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🏛️</span> Sarkari Naukri 2026 — Complete Guide to Government Jobs in India
          </h2>
          <div className="prose max-w-none text-sm text-gray-700 space-y-4">
            <p>
              <strong>Sarkari Naukri</strong> (सरकारी नौकरी) literally means <em>Government Job</em> in Hindi — 
              and it remains the most sought-after career choice for millions of Indians.
              In 2026, the demand for <Link href="/jobs" className="text-orange-600 hover:underline font-medium">Govt Jobs 2026</Link> 
              {' '}has reached new heights with lakhs of vacancies across central and state government departments.
              Whether you are searching for{' '}
              <Link href="/category/ssc" className="text-orange-600 hover:underline">SSC Jobs 2026</Link>,{' '}
              <Link href="/category/railway" className="text-orange-600 hover:underline">Railway Recruitment 2026</Link>,{' '}
              <Link href="/category/banking" className="text-orange-600 hover:underline">Bank Jobs 2026</Link>, or{' '}
              <Link href="/category/upsc" className="text-orange-600 hover:underline">UPSC Notification 2026</Link>,
              SarkariNaukri.com covers every major <strong>sarkari naukri</strong> in real-time.
            </p>

            <p>
              Our platform updates <strong>government job notifications</strong> daily from official sources like 
              SSC, UPSC, RRB, IBPS, SBI, State PSCs, and central ministries. Each{' '}
              <Link href="/jobs" className="text-orange-600 hover:underline">sarkari naukri notification</Link>{' '}
              includes complete details: eligibility criteria, application process, important dates, 
              salary details, vacancy breakdown, and direct{' '}
              <strong>Apply Online</strong> links. We also provide{' '}
              <Link href="/result" className="text-orange-600 hover:underline">Sarkari Result 2026</Link> and{' '}
              <Link href="/admit-card" className="text-orange-600 hover:underline">Admit Card download</Link> links instantly.
            </p>

            {/* Category Grid with LSI Keywords */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Major Sarkari Naukri Categories 2026</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 not-prose">
                {[
                  { href: '/category/ssc', label: 'SSC Recruitment 2026', desc: 'CGL, CHSL, MTS, GD' },
                  { href: '/category/railway', label: 'Railway Vacancy 2026', desc: 'RRB, NTPC, Group D' },
                  { href: '/category/banking', label: 'Bank Jobs 2026', desc: 'IBPS, SBI, RBI, PO/Clerk' },
                  { href: '/category/police', label: 'Police Bharti 2026', desc: 'SI, Constable, ASI' },
                  { href: '/category/defense', label: 'Defence Jobs 2026', desc: 'Army, Navy, Air Force' },
                  { href: '/category/upsc', label: 'UPSC IAS 2026', desc: 'Civil Services, CDS, NDA' },
                  { href: '/category/teaching', label: 'Teacher Vacancy 2026', desc: 'TGT, PGT, NVS, KVS' },
                  { href: '/category/state-psc', label: 'State PSC 2026', desc: 'BPSC, MPPSC, UPPSC' },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="block bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-2.5 transition">
                    <div className="text-sm font-semibold text-orange-800 hover:text-orange-900">{item.label}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{item.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

            <p>
              In 2026, the <strong>10th Pass Government Jobs</strong> ({' '}
              <Link href="/tag/10th-pass" className="text-blue-600 hover:underline">check here</Link>) and{' '}
              <strong>12th Pass Sarkari Naukri</strong> ({' '}
              <Link href="/tag/12th-pass" className="text-blue-600 hover:underline">check here</Link>) are extremely popular 
              among candidates without a degree. Meanwhile,{' '}
              <Link href="/tag/graduate" className="text-blue-600 hover:underline">Graduate Level Jobs</Link> with competitive salaries 
              are available in every department. The{' '}
              <strong>7th Pay Commission</strong> salary structure makes sarkari naukri even more attractive with{' '}
              Pay Level 1 (₹18,000/month) to Pay Level 18 (₹2,50,000/month) across different posts.
            </p>

            <p>
              Looking for <strong>state government jobs</strong>? We cover all 28 states — from{' '}
              {states.slice(0, 8).map((state: any, i: number) => (
                <span key={state.id}>
                  <Link href={`/state/${state.slug}`} className="text-blue-600 hover:underline">{state.name} Govt Jobs</Link>
                  {i < 7 ? ', ' : ''}
                </span>
              ))}
              {' '}and more. Use our <strong>state-wise filter</strong> to find jobs near you.
            </p>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
              <h3 className="text-base font-bold text-orange-800 mb-2">📋 How to Apply for Sarkari Naukri Online — Step by Step</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-orange-900">
                <li>Find the <Link href="/jobs" className="text-orange-700 hover:underline font-medium">latest sarkari naukri notification</Link> on our website</li>
                <li>Read eligibility criteria carefully (age, qualification, state domicile)</li>
                <li>Click the <strong>Apply Online</strong> button — it opens the official government portal</li>
                <li>Register with your email/mobile and fill the application form accurately</li>
                <li>Upload required documents (photo, signature, certificates) as per specification</li>
                <li>Pay the application fee online (UPI, Net Banking, Debit Card)</li>
                <li>Submit and download the application form for your records</li>
                <li>Download your <Link href="/admit-card" className="text-orange-700 hover:underline">Admit Card</Link> from our site when released</li>
                <li>Check <Link href="/result" className="text-orange-700 hover:underline">Sarkari Result</Link> after the exam</li>
              </ol>
            </div>

            <p>
              <strong>LSI Keywords</strong>: sarkari naukri, govt job 2026, government vacancy 2026, 
              sarkari job notification, free job alert, central government jobs, state government jobs, 
              PSU jobs, public sector jobs, naukri 2026, rojgar samachar, employment news, 
              sarkari exam 2026, admit card 2026, sarkari result 2026, answer key 2026, 
              selection list, merit list, exam schedule, online form 2026.
            </p>
          </div>
        </section>

        {/* ===== BROWSE BY STATE ===== */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
            🗺️ Sarkari Naukri by State 2026
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
            {states.map((state: any) => (
              <Link key={state.id} href={`/state/${state.slug}`}
                className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-center text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition">
                {state.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ===== QUICK LINKS ===== */}
        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">🔗 Quick Links — Sarkari Naukri Portal 2026</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
            {[
              { href: '/jobs', label: '📋 All Govt Jobs 2026' },
              { href: '/result', label: '📊 Sarkari Result 2026' },
              { href: '/admit-card', label: '🎫 Admit Card 2026' },
              { href: '/answer-key', label: '🔑 Answer Key 2026' },
              { href: '/syllabus', label: '📚 Exam Syllabus 2026' },
              { href: '/category/ssc', label: '📋 SSC Jobs 2026' },
              { href: '/category/railway', label: '🚂 Railway Recruitment' },
              { href: '/category/banking', label: '🏦 Bank PO/Clerk 2026' },
              { href: '/category/police', label: '👮 Police Bharti 2026' },
              { href: '/category/upsc', label: '🏛️ UPSC 2026' },
              { href: '/category/teaching', label: '📚 Teacher Jobs 2026' },
              { href: '/category/defense', label: '🎖️ Army/Navy Jobs' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-xs text-blue-700 hover:text-orange-600 py-1.5 px-2 rounded hover:bg-orange-50 flex items-center gap-1 transition">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ===== FAQ SECTION ===== */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">❓ Frequently Asked Questions — Sarkari Naukri 2026</h2>
          <div className="space-y-2.5">
            {[
              {
                q: 'What is Sarkari Naukri?',
                a: 'Sarkari Naukri means Government Job in Hindi. It covers employment in central/state government departments, PSUs (Public Sector Undertakings), banks, railways, defence forces, and other government organizations across India. Government jobs offer job security, good salary, pension, and other perks.'
              },
              {
                q: 'How to find latest Sarkari Naukri 2026?',
                a: 'Visit SarkariNaukri.com daily for latest government job notifications. Filter by category (SSC, Railway, Banking, Police), state, qualification (10th pass, 12th pass, graduate), or post type. All notifications are verified from official sources.'
              },
              {
                q: 'What is Sarkari Result 2026?',
                a: 'Sarkari Result refers to exam results declared by government recruitment boards. This includes written exam results, skill test results, merit lists, and final selection lists. Check our Result section for latest Sarkari Result 2026.'
              },
              {
                q: 'How to download Admit Card for Government Exam?',
                a: 'Visit our Admit Card section, find your exam, and click the Download Admit Card link. You will be redirected to the official website where you can enter your registration number/date of birth to download your hall ticket.'
              },
              {
                q: 'Which is the best Sarkari Naukri in India 2026?',
                a: 'Top government jobs in 2026 include UPSC IAS/IPS, RBI Grade B, SBI PO, SSC CGL, ISRO Scientist, DRDO Scientist, and Indian Army/Navy/Air Force officer posts. These offer excellent salary, respect, and career growth.'
              },
              {
                q: 'What qualifications are needed for Sarkari Naukri?',
                a: 'Government jobs require different qualifications: 10th Pass for Peon/MTS, 12th Pass for Constable/Group C posts, Graduate for SSC CGL/Banking/Railway, Post-Graduate for IAS/Lecturer posts, and Professional degrees (B.Tech, MBBS) for technical/medical posts.'
              },
            ].map((faq, i) => (
              <details key={i} className="group border border-gray-200 rounded-lg">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-medium text-sm text-gray-800 hover:bg-orange-50 rounded-lg list-none">
                  <span className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold text-base group-open:rotate-90 transition-transform">›</span>
                    {faq.q}
                  </span>
                </summary>
                <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-2.5 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
