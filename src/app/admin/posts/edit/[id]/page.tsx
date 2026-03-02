'use client';
// src/app/admin/posts/edit/[id]/page.tsx
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PostEditor from '@/components/admin/PostEditor';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, faqs(*), important_dates(*), application_fees(*), vacancy_details(*)`)
        .eq('id', params.id)
        .single();

      if (error || !data) {
        router.push('/admin/posts');
        return;
      }

      // Load tags
      const { data: tagsData } = await supabase
        .from('post_tags')
        .select('tag_id')
        .eq('post_id', data.id);
      data.tag_ids = tagsData?.map((t: any) => t.tag_id) || [];

      setPost(data);
      setLoading(false);
    }
    loadPost();
  }, [params.id, router]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Loading post...</p>
      </div>
    </div>
  );

  return <PostEditor mode="edit" initialData={post} />;
}
