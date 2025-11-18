/**
 * Talixa HRIS - CMS Database Queries
 *
 * Helper functions for querying CMS tables.
 * Uses Supabase client for database operations.
 *
 * @see src/lib/db/cms-schema.ts
 * @see supabase/migrations/20251118000010_create_cms_tables.sql
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogPostFilters,
  CaseStudy,
  CreateCaseStudyInput,
  UpdateCaseStudyInput,
  CaseStudyFilters,
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  LeadFilters,
  DemoRequest,
  CreateDemoRequestInput,
  UpdateDemoRequestInput,
  DemoRequestFilters,
  WebAnalyticsEvent,
  CreateAnalyticsEventInput,
  AnalyticsFilters,
  NewsletterSubscriber,
  CreateNewsletterSubscriberInput,
  UpdateNewsletterSubscriberInput,
  PaginatedResponse,
  CMSStats,
} from './cms-schema';

type SupabaseClientType = SupabaseClient<Database>;

// =============================================================================
// BLOG POSTS
// =============================================================================

/**
 * Get all blog posts with filters
 */
export async function getBlogPosts(
  supabase: SupabaseClientType,
  filters: BlogPostFilters = {}
): Promise<PaginatedResponse<BlogPost>> {
  const {
    page = 1,
    limit = 10,
    status,
    category,
    tags,
    language,
    author_id,
    search,
  } = filters;

  const offset = (page - 1) * limit;

  let query = supabase
    .from('cms_blog_posts')
    .select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  if (language) {
    query = query.eq('language', language);
  }

  if (author_id) {
    query = query.eq('author_id', author_id);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(
  supabase: SupabaseClientType,
  slug: string
): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Create a new blog post
 */
export async function createBlogPost(
  supabase: SupabaseClientType,
  input: CreateBlogPostInput
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a blog post
 */
export async function updateBlogPost(
  supabase: SupabaseClientType,
  id: string,
  input: UpdateBlogPostInput
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .update(input as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(
  supabase: SupabaseClientType,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('cms_blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Increment blog post view count
 */
export async function incrementBlogPostViews(
  supabase: SupabaseClientType,
  id: string
): Promise<void> {
  const { error } = await supabase.rpc('increment_blog_post_views' as any, {
    post_id: id,
  });

  if (error) {
    // Fallback if RPC doesn't exist
    const { data } = await supabase
      .from('cms_blog_posts')
      .select('view_count')
      .eq('id', id)
      .single();

    if (data && 'view_count' in data) {
      const typedData = data as { view_count: number };
      await supabase
        .from('cms_blog_posts')
        .update({ view_count: typedData.view_count + 1 })
        .eq('id', id);
    }
  }
}

// =============================================================================
// CASE STUDIES
// =============================================================================

/**
 * Get all case studies with filters
 */
export async function getCaseStudies(
  supabase: SupabaseClientType,
  filters: CaseStudyFilters = {}
): Promise<PaginatedResponse<CaseStudy>> {
  const { page = 1, limit = 10, status, industry, search } = filters;

  const offset = (page - 1) * limit;

  let query = supabase
    .from('cms_case_studies')
    .select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (industry) {
    query = query.eq('industry', industry);
  }

  if (search) {
    query = query.or(`company_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

/**
 * Get a single case study by slug
 */
export async function getCaseStudyBySlug(
  supabase: SupabaseClientType,
  slug: string
): Promise<CaseStudy | null> {
  const { data, error } = await supabase
    .from('cms_case_studies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

/**
 * Create a new case study
 */
export async function createCaseStudy(
  supabase: SupabaseClientType,
  input: CreateCaseStudyInput
): Promise<CaseStudy> {
  const { data, error } = await supabase
    .from('cms_case_studies')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a case study
 */
export async function updateCaseStudy(
  supabase: SupabaseClientType,
  id: string,
  input: UpdateCaseStudyInput
): Promise<CaseStudy> {
  const { data, error } = await supabase
    .from('cms_case_studies')
    .update(input as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a case study
 */
export async function deleteCaseStudy(
  supabase: SupabaseClientType,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('cms_case_studies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================================================
// LEADS
// =============================================================================

/**
 * Get all leads with filters
 */
export async function getLeads(
  supabase: SupabaseClientType,
  filters: LeadFilters = {}
): Promise<PaginatedResponse<Lead>> {
  const {
    page = 1,
    limit = 10,
    status,
    source,
    assigned_to,
    from_date,
    to_date,
    search,
  } = filters;

  const offset = (page - 1) * limit;

  let query = supabase.from('leads').select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (source) {
    query = query.eq('source', source);
  }

  if (assigned_to) {
    query = query.eq('assigned_to', assigned_to);
  }

  if (from_date) {
    query = query.gte('created_at', from_date);
  }

  if (to_date) {
    query = query.lte('created_at', to_date);
  }

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,full_name.ilike.%${search}%,company_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(
  supabase: SupabaseClientType,
  id: string
): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

/**
 * Create a new lead
 */
export async function createLead(
  supabase: SupabaseClientType,
  input: CreateLeadInput
): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a lead
 */
export async function updateLead(
  supabase: SupabaseClientType,
  id: string,
  input: UpdateLeadInput
): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update(input as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// DEMO REQUESTS
// =============================================================================

/**
 * Get all demo requests with filters
 */
export async function getDemoRequests(
  supabase: SupabaseClientType,
  filters: DemoRequestFilters = {}
): Promise<PaginatedResponse<DemoRequest>> {
  const {
    page = 1,
    limit = 10,
    status,
    assigned_to,
    from_date,
    to_date,
    search,
  } = filters;

  const offset = (page - 1) * limit;

  let query = supabase.from('demo_requests').select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (assigned_to) {
    query = query.eq('assigned_to', assigned_to);
  }

  if (from_date) {
    query = query.gte('created_at', from_date);
  }

  if (to_date) {
    query = query.lte('created_at', to_date);
  }

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,name.ilike.%${search}%,company_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

/**
 * Create a new demo request
 */
export async function createDemoRequest(
  supabase: SupabaseClientType,
  input: CreateDemoRequestInput
): Promise<DemoRequest> {
  const { data, error } = await supabase
    .from('demo_requests')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a demo request
 */
export async function updateDemoRequest(
  supabase: SupabaseClientType,
  id: string,
  input: UpdateDemoRequestInput
): Promise<DemoRequest> {
  const { data, error } = await supabase
    .from('demo_requests')
    .update(input as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// WEB ANALYTICS
// =============================================================================

/**
 * Track an analytics event
 */
export async function trackAnalyticsEvent(
  supabase: SupabaseClientType,
  input: CreateAnalyticsEventInput
): Promise<void> {
  const { error } = await supabase.from('web_analytics').insert(input);

  if (error) {
    // Log error but don't throw - analytics shouldn't break the app
    console.error('Failed to track analytics event:', error);
  }
}

/**
 * Get analytics events with filters
 */
export async function getAnalyticsEvents(
  supabase: SupabaseClientType,
  filters: AnalyticsFilters = {}
): Promise<PaginatedResponse<WebAnalyticsEvent>> {
  const {
    page = 1,
    limit = 100,
    event_type,
    page_path,
    session_id,
    from_date,
    to_date,
  } = filters;

  const offset = (page - 1) * limit;

  let query = supabase.from('web_analytics').select('*', { count: 'exact' });

  if (event_type) {
    query = query.eq('event_type', event_type);
  }

  if (page_path) {
    query = query.eq('page_path', page_path);
  }

  if (session_id) {
    query = query.eq('session_id', session_id);
  }

  if (from_date) {
    query = query.gte('created_at', from_date);
  }

  if (to_date) {
    query = query.lte('created_at', to_date);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

// =============================================================================
// NEWSLETTER
// =============================================================================

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(
  supabase: SupabaseClientType,
  input: CreateNewsletterSubscriberInput
): Promise<NewsletterSubscriber> {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update newsletter subscription
 */
export async function updateNewsletterSubscription(
  supabase: SupabaseClientType,
  email: string,
  input: UpdateNewsletterSubscriberInput
): Promise<NewsletterSubscriber> {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update(input as any)
    .eq('email', email)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(
  supabase: SupabaseClientType,
  email: string
): Promise<void> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('email', email);

  if (error) throw error;
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Get CMS statistics
 */
export async function getCMSStats(
  supabase: SupabaseClientType
): Promise<CMSStats> {
  // Blog posts stats
  const { data: blogStats } = await supabase
    .from('cms_blog_posts')
    .select('status');

  const blog_posts = {
    total: blogStats?.length || 0,
    published: blogStats?.filter((p: any) => p.status === 'published').length || 0,
    draft: blogStats?.filter((p: any) => p.status === 'draft').length || 0,
  };

  // Case studies stats
  const { data: caseStudyStats } = await supabase
    .from('cms_case_studies')
    .select('status');

  const case_studies = {
    total: caseStudyStats?.length || 0,
    published:
      caseStudyStats?.filter((cs: any) => cs.status === 'published').length || 0,
  };

  // Leads stats
  const { data: leadStats } = await supabase.from('leads').select('status');

  const totalLeads = leadStats?.length || 0;
  const convertedLeads =
    leadStats?.filter((l: any) => l.status === 'converted').length || 0;

  const leads = {
    total: totalLeads,
    new: leadStats?.filter((l: any) => l.status === 'new').length || 0,
    qualified: leadStats?.filter((l: any) => l.status === 'qualified').length || 0,
    converted: convertedLeads,
    conversion_rate:
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
  };

  // Demo requests stats
  const { data: demoStats } = await supabase
    .from('demo_requests')
    .select('status');

  const demo_requests = {
    total: demoStats?.length || 0,
    pending: demoStats?.filter((d: any) => d.status === 'pending').length || 0,
    scheduled: demoStats?.filter((d: any) => d.status === 'scheduled').length || 0,
    completed: demoStats?.filter((d: any) => d.status === 'completed').length || 0,
  };

  // Newsletter stats
  const { data: newsletterStats } = await supabase
    .from('newsletter_subscribers')
    .select('status');

  const newsletter = {
    total_subscribers: newsletterStats?.length || 0,
    active_subscribers:
      newsletterStats?.filter((n: any) => n.status === 'subscribed').length || 0,
  };

  return {
    blog_posts,
    case_studies,
    leads,
    demo_requests,
    newsletter,
  };
}
