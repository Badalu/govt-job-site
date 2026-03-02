'use client';
// src/components/admin/PostEditor.tsx
// Full-featured post editor with rich text, SEO, FAQ, image upload, tables

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { generateSlug, generateSEOTitle } from '@/lib/seo';

interface FAQItem { question: string; answer: string; }
interface DateItem { label: string; date_value: string; }
interface FeeItem { category: string; amount: string; }
interface VacancyItem { post_name: string; total_posts: string; gen: string; obc: string; sc: string; st: string; ews: string; }

const TABS = [
  { id: 'basic', label: '📝 Basic Info' },
  { id: 'content', label: '✍️ Content' },
  { id: 'jobdetails', label: '💼 Job Details' },
  { id: 'tables', label: '📊 Tables' },
  { id: 'faq', label: '❓ FAQs' },
  { id: 'seo', label: '🔍 SEO' },
  { id: 'media', label: '🖼️ Media' },
];

const defaultForm = {
  title: '', slug: '', excerpt: '', content: '', featured_image: '', featured_image_alt: '',
  seo_title: '', seo_description: '', og_image: '', canonical_url: '',
  organization: '', total_posts: '', application_start: '', application_end: '',
  exam_date: '', salary_text: '', salary_min: '', salary_max: '',
  qualification: '', age_min: '', age_max: '', official_website: '',
  apply_link: '', notification_link: '', admit_card_link: '', result_link: '',
  category_id: '', state_id: '',
  status: 'draft', post_type: 'job', is_featured: false, is_trending: false,
};

export default function PostEditor({ mode = 'new', initialData = null }: {
  mode?: 'new' | 'edit';
  initialData?: any;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<any>(defaultForm);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([{ question: '', answer: '' }]);
  const [importantDates, setImportantDates] = useState<DateItem[]>([{ label: '', date_value: '' }]);
  const [fees, setFees] = useState<FeeItem[]>([{ category: 'General', amount: '' }]);
  const [vacancies, setVacancies] = useState<VacancyItem[]>([{ post_name: '', total_posts: '', gen: '', obc: '', sc: '', st: '', ews: '' }]);
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const [seoTitleManual, setSeoTitleManual] = useState(false);
  const [preview, setPreview] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const [catsRes, statesRes, tagsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('states').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
      ]);
      setCategories(catsRes.data || []);
      setStates(statesRes.data || []);
      setTags(tagsRes.data || []);
    }
    loadData();
  }, []);

  // Populate form for edit mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setForm({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        featured_image: initialData.featured_image || '',
        featured_image_alt: initialData.featured_image_alt || '',
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || '',
        og_image: initialData.og_image || '',
        canonical_url: initialData.canonical_url || '',
        organization: initialData.organization || '',
        total_posts: initialData.total_posts?.toString() || '',
        application_start: initialData.application_start || '',
        application_end: initialData.application_end || '',
        exam_date: initialData.exam_date || '',
        salary_text: initialData.salary_text || '',
        salary_min: initialData.salary_min?.toString() || '',
        salary_max: initialData.salary_max?.toString() || '',
        qualification: initialData.qualification || '',
        age_min: initialData.age_min?.toString() || '',
        age_max: initialData.age_max?.toString() || '',
        official_website: initialData.official_website || '',
        apply_link: initialData.apply_link || '',
        notification_link: initialData.notification_link || '',
        admit_card_link: initialData.admit_card_link || '',
        result_link: initialData.result_link || '',
        category_id: initialData.category_id || '',
        state_id: initialData.state_id || '',
        status: initialData.status || 'draft',
        post_type: initialData.post_type || 'job',
        is_featured: initialData.is_featured || false,
        is_trending: initialData.is_trending || false,
      });
      setSlugManual(true);
      setSeoTitleManual(!!initialData.seo_title);
      if (initialData.tag_ids) setSelectedTags(initialData.tag_ids);
      if (initialData.faqs?.length) setFaqs(initialData.faqs.map((f: any) => ({ question: f.question, answer: f.answer })));
      if (initialData.important_dates?.length) setImportantDates(initialData.important_dates.map((d: any) => ({ label: d.label, date_value: d.date_value })));
      if (initialData.application_fees?.length) setFees(initialData.application_fees.map((f: any) => ({ category: f.category, amount: f.amount })));
      if (initialData.vacancy_details?.length) setVacancies(initialData.vacancy_details.map((v: any) => ({ post_name: v.post_name, total_posts: v.total_posts?.toString() || '', gen: v.gen?.toString() || '', obc: v.obc?.toString() || '', sc: v.sc?.toString() || '', st: v.st?.toString() || '', ews: v.ews?.toString() || '' })));
    }
  }, [initialData, mode]);

  // Calculate word count and SEO score
  useEffect(() => {
    const words = form.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    
    let score = 0;
    if (form.title) score += 15;
    if (form.slug) score += 10;
    if (form.seo_title) score += 15;
    if (form.seo_description && form.seo_description.length >= 120) score += 15;
    if (form.excerpt) score += 10;
    if (words >= 300) score += 10;
    if (words >= 1000) score += 10;
    if (form.featured_image) score += 10;
    if (form.featured_image_alt) score += 5;
    setSeoScore(score);
  }, [form]);

  const handleChange = useCallback((field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setForm((prev: any) => ({
      ...prev,
      title,
      slug: slugManual ? prev.slug : generateSlug(title),
      seo_title: seoTitleManual ? prev.seo_title : generateSEOTitle(title, prev.post_type),
    }));
  }, [slugManual, seoTitleManual]);

  // ===== IMAGE UPLOAD =====
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 5MB' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from('job-images')
        .upload(`featured/${filename}`, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('job-images').getPublicUrl(`featured/${filename}`);
      handleChange('featured_image', urlData.publicUrl);
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: `Upload failed: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  // ===== RICH TEXT HELPERS =====
  const insertText = (before: string, after = '') => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.substring(start, end);
    const newContent = form.content.substring(0, start) + before + selected + after + form.content.substring(end);
    handleChange('content', newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertText('<strong>', '</strong>') },
    { label: 'I', title: 'Italic', action: () => insertText('<em>', '</em>') },
    { label: 'H2', title: 'Heading 2', action: () => insertText('\n<h2>', '</h2>\n') },
    { label: 'H3', title: 'Heading 3', action: () => insertText('\n<h3>', '</h3>\n') },
    { label: 'UL', title: 'Unordered List', action: () => insertText('\n<ul>\n  <li>', '</li>\n  <li></li>\n</ul>\n') },
    { label: 'OL', title: 'Ordered List', action: () => insertText('\n<ol>\n  <li>', '</li>\n  <li></li>\n</ol>\n') },
    { label: 'Table', title: 'Insert Table', action: () => insertText('\n<table>\n<thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>\n<tbody><tr><td>', '</td><td></td></tr></tbody>\n</table>\n') },
    { label: 'Link', title: 'Insert Link', action: () => insertText('<a href="URL">', '</a>') },
    { label: 'Box', title: 'Notice Box', action: () => insertText('\n<div class="notice-box">\n<strong>📢 Important:</strong> ', '\n</div>\n') },
    { label: 'BR', title: 'Line Break', action: () => insertText('\n<br/>\n') },
  ];

  // ===== SAVE POST =====
  const handleSave = async (publishNow = false) => {
    if (!form.title || !form.content) {
      setMessage({ type: 'error', text: 'Title and Content are required!' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload: any = {
        ...form,
        total_posts: form.total_posts ? parseInt(form.total_posts) : null,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        age_min: form.age_min ? parseInt(form.age_min) : null,
        age_max: form.age_max ? parseInt(form.age_max) : null,
        category_id: form.category_id || null,
        state_id: form.state_id || null,
        status: publishNow ? 'published' : form.status,
        published_at: publishNow ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      };

      let postId = initialData?.id;

      if (mode === 'edit' && postId) {
        const { error } = await supabase.from('posts').update(payload).eq('id', postId);
        if (error) throw error;
      } else {
        payload.created_at = new Date().toISOString();
        if (payload.status === 'published') payload.published_at = new Date().toISOString();
        const { data, error } = await supabase.from('posts').insert(payload).select('id').single();
        if (error) throw error;
        postId = data.id;
      }

      // Save tags
      await supabase.from('post_tags').delete().eq('post_id', postId);
      if (selectedTags.length) {
        await supabase.from('post_tags').insert(selectedTags.map(tid => ({ post_id: postId, tag_id: tid })));
      }

      // Save FAQs
      await supabase.from('faqs').delete().eq('post_id', postId);
      const validFaqs = faqs.filter(f => f.question && f.answer);
      if (validFaqs.length) {
        await supabase.from('faqs').insert(validFaqs.map(f => ({ ...f, post_id: postId })));
      }

      // Save Important Dates
      await supabase.from('important_dates').delete().eq('post_id', postId);
      const validDates = importantDates.filter(d => d.label && d.date_value);
      if (validDates.length) {
        await supabase.from('important_dates').insert(validDates.map(d => ({ ...d, post_id: postId })));
      }

      // Save Application Fees
      await supabase.from('application_fees').delete().eq('post_id', postId);
      const validFees = fees.filter(f => f.category && f.amount);
      if (validFees.length) {
        await supabase.from('application_fees').insert(validFees.map(f => ({ ...f, post_id: postId })));
      }

      // Save Vacancy Details
      await supabase.from('vacancy_details').delete().eq('post_id', postId);
      const validVacancies = vacancies.filter(v => v.post_name);
      if (validVacancies.length) {
        await supabase.from('vacancy_details').insert(validVacancies.map(v => ({
          post_id: postId, post_name: v.post_name,
          total_posts: v.total_posts ? parseInt(v.total_posts) : null,
          gen: v.gen ? parseInt(v.gen) : null, obc: v.obc ? parseInt(v.obc) : null,
          sc: v.sc ? parseInt(v.sc) : null, st: v.st ? parseInt(v.st) : null,
          ews: v.ews ? parseInt(v.ews) : null,
        })));
      }

      setMessage({ type: 'success', text: publishNow ? '✅ Post published successfully!' : '✅ Post saved as draft!' });
      setTimeout(() => router.push('/admin/posts'), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const seoScoreColor = seoScore >= 70 ? 'text-green-600' : seoScore >= 40 ? 'text-yellow-600' : 'text-red-600';
  const seoScoreBg = seoScore >= 70 ? 'bg-green-50 border-green-200' : seoScore >= 40 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? '✏️ Edit Post' : '➕ Add New Post'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {form.title ? `"${form.title.slice(0, 60)}${form.title.length > 60 ? '...' : ''}"` : 'Create a new government job post'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-sm px-3 py-1.5 rounded-lg border font-medium ${seoScoreBg} ${seoScoreColor}`}>
            SEO Score: {seoScore}/100
          </div>
          <span className="text-xs text-gray-500">{wordCount} words</span>
          <button onClick={() => router.push('/admin/posts')}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            ← Back
          </button>
          <button onClick={() => handleSave(false)} disabled={saving}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium disabled:opacity-50 transition">
            {saving ? '⏳ Saving...' : '💾 Save Draft'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50 transition">
            {saving ? '⏳ Publishing...' : '🚀 Publish'}
          </button>
        </div>
      </div>

      {/* ===== MESSAGE ===== */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* ===== TABS ===== */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 overflow-x-auto scrollbar-thin">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'bg-white border border-b-white border-gray-200 text-orange-600 -mb-px'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">

        {/* ===== BASIC INFO TAB ===== */}
        {activeTab === 'basic' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-800 border-b pb-2">Basic Information</h2>

            {/* Post Type & Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post Type *</label>
                <select value={form.post_type} onChange={e => handleChange('post_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="job">Job / Recruitment</option>
                  <option value="result">Result</option>
                  <option value="admit-card">Admit Card</option>
                  <option value="answer-key">Answer Key</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="news">News</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category_id} onChange={e => handleChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500">
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select value={form.state_id} onChange={e => handleChange('state_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500">
                  <option value="">-- Select State --</option>
                  {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post Title * <span className="text-gray-400 text-xs">({form.title.length}/300)</span>
              </label>
              <input type="text" value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. SSC CGL 2026 Recruitment – 17000 Vacancies"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                maxLength={300}
              />
              <p className="text-xs text-gray-400 mt-1">Use keywords like "Recruitment 2026", "Apply Online" for better SEO</p>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug (Auto Generated)
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-xs text-gray-500">/jobs/</span>
                <input type="text" value={form.slug}
                  onChange={e => { setSlugManual(true); handleChange('slug', generateSlug(e.target.value)); }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
                <button onClick={() => { setSlugManual(false); handleChange('slug', generateSlug(form.title)); }}
                  className="px-3 py-2 text-xs text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50">
                  Reset
                </button>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt / Short Description <span className="text-gray-400 text-xs">({form.excerpt.length}/300)</span>
              </label>
              <textarea value={form.excerpt} rows={3}
                onChange={e => handleChange('excerpt', e.target.value)}
                placeholder="Brief description of the job post (used in cards and SEO)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 resize-none"
                maxLength={300}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[44px]">
                {tags.map(tag => (
                  <button key={tag.id} type="button"
                    onClick={() => setSelectedTags(prev =>
                      prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
                    )}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      selectedTags.includes(tag.id)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                    }`}>
                    {tag.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{selectedTags.length} tags selected</p>
            </div>

            {/* Flags */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured}
                  onChange={e => handleChange('is_featured', e.target.checked)}
                  className="w-4 h-4 accent-orange-600"
                />
                <span className="text-sm font-medium text-gray-700">⭐ Featured Post</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_trending}
                  onChange={e => handleChange('is_trending', e.target.checked)}
                  className="w-4 h-4 accent-orange-600"
                />
                <span className="text-sm font-medium text-gray-700">🔥 Trending</span>
              </label>
            </div>
          </div>
        )}

        {/* ===== CONTENT TAB ===== */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Post Content</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{wordCount} words</span>
                <button onClick={() => setPreview(!preview)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                  {preview ? '✏️ Edit' : '👁️ Preview'}
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-lg">
              {toolbarButtons.map(btn => (
                <button key={btn.label} type="button" title={btn.title} onClick={btn.action}
                  className="px-2.5 py-1.5 text-xs font-mono bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 text-gray-700 transition">
                  {btn.label}
                </button>
              ))}
            </div>

            {preview ? (
              <div className="prose-sarkari border border-gray-200 rounded-lg p-4 min-h-[400px] bg-white overflow-auto"
                dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-gray-400">Nothing to preview...</p>' }} />
            ) : (
              <textarea ref={contentRef} value={form.content} rows={20}
                onChange={e => handleChange('content', e.target.value)}
                placeholder="Write your post content here using HTML. Use H2/H3 headings for structure (they'll auto-generate Table of Contents)..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 resize-y"
              />
            )}
            <p className="text-xs text-gray-400">
              Tip: Use &lt;h2&gt; and &lt;h3&gt; tags to create headings — they'll automatically appear in the Table of Contents.
              Target 1000+ words for better Google ranking.
            </p>
          </div>
        )}

        {/* ===== JOB DETAILS TAB ===== */}
        {activeTab === 'jobdetails' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-800 border-b pb-2">Job / Recruitment Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization / Department</label>
                <input type="text" value={form.organization}
                  onChange={e => handleChange('organization', e.target.value)}
                  placeholder="e.g. Staff Selection Commission (SSC)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Vacancies / Posts</label>
                <input type="number" value={form.total_posts}
                  onChange={e => handleChange('total_posts', e.target.value)}
                  placeholder="e.g. 17000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Start Date</label>
                <input type="date" value={form.application_start}
                  onChange={e => handleChange('application_start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Last Date</label>
                <input type="date" value={form.application_end}
                  onChange={e => handleChange('application_end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                <input type="date" value={form.exam_date}
                  onChange={e => handleChange('exam_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Text</label>
                <input type="text" value={form.salary_text}
                  onChange={e => handleChange('salary_text', e.target.value)}
                  placeholder="e.g. Pay Level 4 (₹25,500 – ₹81,100)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input type="text" value={form.qualification}
                  onChange={e => handleChange('qualification', e.target.value)}
                  placeholder="e.g. Graduate in any discipline"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                  <input type="number" value={form.age_min} onChange={e => handleChange('age_min', e.target.value)}
                    placeholder="18" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
                  <input type="number" value={form.age_max} onChange={e => handleChange('age_max', e.target.value)}
                    placeholder="32" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 border-b pb-1 mt-4">Important Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: 'apply_link', label: '🔗 Apply Online Link' },
                { field: 'notification_link', label: '📄 Official Notification PDF' },
                { field: 'admit_card_link', label: '🎫 Admit Card Link' },
                { field: 'result_link', label: '📊 Result Link' },
                { field: 'official_website', label: '🌐 Official Website' },
              ].map(item => (
                <div key={item.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                  <input type="url" value={form[item.field]}
                    onChange={e => handleChange(item.field, e.target.value)}
                    placeholder="https://"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TABLES TAB ===== */}
        {activeTab === 'tables' && (
          <div className="space-y-8">
            <h2 className="text-base font-bold text-gray-800 border-b pb-2">Structured Tables</h2>

            {/* Important Dates */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">📅 Important Dates</h3>
                <button onClick={() => setImportantDates(d => [...d, { label: '', date_value: '' }])}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">
                  + Add Row
                </button>
              </div>
              <div className="space-y-2">
                {importantDates.map((d, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={d.label}
                      onChange={e => { const nd = [...importantDates]; nd[i].label = e.target.value; setImportantDates(nd); }}
                      placeholder="e.g. Application Start"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                    />
                    <input type="text" value={d.date_value}
                      onChange={e => { const nd = [...importantDates]; nd[i].date_value = e.target.value; setImportantDates(nd); }}
                      placeholder="e.g. 01 Jan 2026"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                    />
                    <button onClick={() => setImportantDates(d => d.filter((_, idx) => idx !== i))}
                      className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Fees */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">💰 Application Fee</h3>
                <button onClick={() => setFees(f => [...f, { category: '', amount: '' }])}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">
                  + Add Row
                </button>
              </div>
              <div className="space-y-2">
                {fees.map((fee, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={fee.category}
                      onChange={e => { const nf = [...fees]; nf[i].category = e.target.value; setFees(nf); }}
                      placeholder="e.g. General/OBC"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                    />
                    <input type="text" value={fee.amount}
                      onChange={e => { const nf = [...fees]; nf[i].amount = e.target.value; setFees(nf); }}
                      placeholder="e.g. ₹100"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                    />
                    <button onClick={() => setFees(f => f.filter((_, idx) => idx !== i))}
                      className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Vacancy Details */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">📋 Vacancy Details (Category-wise)</h3>
                <button onClick={() => setVacancies(v => [...v, { post_name: '', total_posts: '', gen: '', obc: '', sc: '', st: '', ews: '' }])}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">
                  + Add Row
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-orange-50">
                      {['Post Name', 'Total', 'Gen', 'OBC', 'SC', 'ST', 'EWS', ''].map(h => (
                        <th key={h} className="px-2 py-2 text-left border border-gray-200 font-semibold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vacancies.map((v, i) => (
                      <tr key={i}>
                        {(['post_name', 'total_posts', 'gen', 'obc', 'sc', 'st', 'ews'] as const).map(field => (
                          <td key={field} className="border border-gray-200 p-1">
                            <input type="text" value={v[field]}
                              onChange={e => { const nv = [...vacancies]; (nv[i] as any)[field] = e.target.value; setVacancies(nv); }}
                              className="w-full px-1.5 py-1 text-xs border-0 focus:ring-1 focus:ring-orange-400 rounded"
                              placeholder={field === 'post_name' ? 'Post Name' : '0'}
                            />
                          </td>
                        ))}
                        <td className="border border-gray-200 p-1">
                          <button onClick={() => setVacancies(v => v.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-700 text-xs px-1">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== FAQ TAB ===== */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800">FAQ Section</h2>
                <p className="text-xs text-gray-500 mt-0.5">FAQs generate JSON-LD FAQ Schema for Google Rich Results</p>
              </div>
              <button onClick={() => setFaqs(f => [...f, { question: '', answer: '' }])}
                className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                + Add FAQ
              </button>
            </div>
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">FAQ #{i + 1}</span>
                  {faqs.length > 1 && (
                    <button onClick={() => setFaqs(f => f.filter((_, idx) => idx !== i))}
                      className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200">
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input type="text" value={faq.question}
                    onChange={e => { const nf = [...faqs]; nf[i].question = e.target.value; setFaqs(nf); }}
                    placeholder="Question (e.g. What is the last date to apply?)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                  />
                  <textarea value={faq.answer} rows={3}
                    onChange={e => { const nf = [...faqs]; nf[i].answer = e.target.value; setFaqs(nf); }}
                    placeholder="Answer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== SEO TAB ===== */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">SEO Settings</h2>
              <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${seoScoreBg} ${seoScoreColor}`}>
                SEO Score: {seoScore}/100
              </div>
            </div>

            {/* SEO Checklist */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3">SEO Checklist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { check: !!form.title, label: 'Title added' },
                  { check: !!form.slug, label: 'SEO slug set' },
                  { check: !!form.seo_title && form.seo_title.length <= 70, label: 'SEO title (≤70 chars)' },
                  { check: !!form.seo_description && form.seo_description.length >= 120, label: 'Meta description (120-160 chars)' },
                  { check: wordCount >= 300, label: '300+ words in content' },
                  { check: wordCount >= 1000, label: '1000+ words (recommended)' },
                  { check: !!form.featured_image, label: 'Featured image added' },
                  { check: !!form.featured_image_alt, label: 'Image alt text added' },
                  { check: !!form.excerpt, label: 'Excerpt written' },
                  { check: selectedTags.length > 0, label: 'Tags selected' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm ${item.check ? 'text-green-700' : 'text-gray-500'}`}>
                    <span>{item.check ? '✅' : '⬜'}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title (Google Title) <span className={`text-xs ${form.seo_title.length > 70 ? 'text-red-500' : 'text-gray-400'}`}>({form.seo_title.length}/70)</span>
              </label>
              <input type="text" value={form.seo_title}
                onChange={e => { setSeoTitleManual(true); handleChange('seo_title', e.target.value); }}
                placeholder="Auto-generated: Title 2026 – Sarkari Naukri | Apply Online"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 ${form.seo_title.length > 70 ? 'border-red-400' : 'border-gray-300'}`}
                maxLength={80}
              />
              <button onClick={() => { setSeoTitleManual(false); handleChange('seo_title', generateSEOTitle(form.title, form.post_type)); }}
                className="mt-1 text-xs text-orange-600 hover:underline">Auto-generate from title</button>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description <span className={`text-xs ${form.seo_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>({form.seo_description.length}/160)</span>
              </label>
              <textarea value={form.seo_description} rows={3}
                onChange={e => handleChange('seo_description', e.target.value)}
                placeholder="e.g. SSC CGL 2026 Recruitment: Apply online for 17,000 posts. Check eligibility, last date, salary, exam dates. Free Sarkari Naukri alerts..."
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 resize-none ${form.seo_description.length > 160 ? 'border-red-400' : 'border-gray-300'}`}
                maxLength={160}
              />
              <p className="text-xs text-gray-400 mt-1">Aim for 120-160 characters. Include target keyword naturally.</p>
            </div>

            {/* Canonical */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL (Leave blank for auto)</label>
              <input type="url" value={form.canonical_url}
                onChange={e => handleChange('canonical_url', e.target.value)}
                placeholder="https://sarkarinaukri.com/jobs/post-slug"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph Image URL (Optional)</label>
              <input type="url" value={form.og_image}
                onChange={e => handleChange('og_image', e.target.value)}
                placeholder="https://... (defaults to featured image)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-400 mt-1">Recommended: 1200×630px for best social sharing appearance</p>
            </div>

            {/* Preview */}
            {(form.seo_title || form.title) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Google Preview</p>
                <div className="font-medium text-blue-700 text-base leading-tight hover:underline cursor-pointer">
                  {(form.seo_title || form.title).slice(0, 70)}
                </div>
                <div className="text-green-700 text-xs mt-0.5">
                  {process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkarinaukri.com'}/jobs/{form.slug}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {(form.seo_description || form.excerpt || '').slice(0, 160) || 'Add a meta description to see it here...'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== MEDIA TAB ===== */}
        {activeTab === 'media' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-800">Featured Image</h2>

            {/* Current Image */}
            {form.featured_image && (
              <div className="relative">
                <img src={form.featured_image} alt={form.featured_image_alt || form.title}
                  className="w-full max-h-72 object-cover rounded-lg border border-gray-200" />
                <button onClick={() => handleChange('featured_image', '')}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-700">
                  ✕
                </button>
              </div>
            )}

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center cursor-pointer hover:bg-orange-50 transition">
              <div className="text-4xl mb-3">{uploading ? '⏳' : '🖼️'}</div>
              <p className="text-sm font-medium text-gray-700">
                {uploading ? 'Uploading image...' : 'Click to upload featured image'}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB. Recommended: 1200×630px</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
            </div>

            {/* Or URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Or enter image URL directly</label>
              <input type="url" value={form.featured_image}
                onChange={e => handleChange('featured_image', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt Text * <span className="text-xs text-gray-400">(Important for SEO)</span>
              </label>
              <input type="text" value={form.featured_image_alt}
                onChange={e => handleChange('featured_image_alt', e.target.value)}
                placeholder="e.g. SSC CGL 2026 Recruitment Notification"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-400 mt-1">Describe the image with keywords for Google Image Search</p>
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTTOM SAVE BAR ===== */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          {form.status === 'published'
            ? '🟢 This post is live'
            : `📝 Status: ${form.status}`
          }
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={saving}
            className="px-5 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium disabled:opacity-50">
            💾 Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="px-5 py-2.5 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50">
            🚀 {saving ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
