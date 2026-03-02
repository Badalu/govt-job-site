// src/components/seo/RelatedPosts.tsx
import Link from 'next/link';
import { formatDate } from '@/lib/seo';

export default function RelatedPosts({ posts, title = 'Related Jobs' }: { posts: any[]; title?: string }) {
  if (!posts?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-blue-900">
        <h3 className="text-white font-bold text-sm">🔗 {title}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {posts.map(post => (
          <Link key={post.id} href={`/jobs/${post.slug}`}
            className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-orange-50 transition">
            {post.featured_image && (
              <img src={post.featured_image} alt={post.title}
                className="w-14 h-10 object-cover rounded shrink-0"
                loading="lazy"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 hover:text-orange-600 line-clamp-2 leading-snug">{post.title}</p>
              {post.application_end && (
                <p className="text-[11px] text-gray-500 mt-0.5">📅 {formatDate(post.application_end)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
