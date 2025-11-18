/**
 * Talixa HRIS - CMS Database Schema Types
 *
 * TypeScript types and interfaces for CMS tables.
 * Mirrors the database schema from migration 20251118000010_create_cms_tables.sql
 *
 * @see supabase/migrations/20251118000010_create_cms_tables.sql
 * @see docs/BRANDING_PRD.md
 */

// =============================================================================
// BLOG POSTS
// =============================================================================

export type BlogPostStatus = 'draft' | 'published' | 'archived';
export type Language = 'id' | 'en';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: Record<string, any>; // Rich text content (JSON)
  author_id: string | null;
  category: string | null;
  tags: string[];
  featured_image_url: string | null;
  published_at: string | null; // ISO 8601 timestamp
  status: BlogPostStatus;
  language: Language;

  // SEO fields
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;

  // Analytics
  view_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostInput {
  slug: string;
  title: string;
  excerpt?: string;
  content: Record<string, any>;
  author_id?: string;
  category?: string;
  tags?: string[];
  featured_image_url?: string;
  status?: BlogPostStatus;
  language?: Language;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  og_image_url?: string;
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  published_at?: string | null;
}

// =============================================================================
// CASE STUDIES
// =============================================================================

export type CaseStudyStatus = 'draft' | 'published' | 'archived';

export interface CaseStudy {
  id: string;
  slug: string;
  company_name: string;
  industry: string | null;
  employee_count: number | null;

  // Content sections
  challenge: Record<string, any> | null;
  solution: Record<string, any> | null;
  results: Record<string, any> | null;

  // Testimonial
  testimonial: string | null;
  testimonial_author: string | null;
  testimonial_role: string | null;

  // Media
  logo_url: string | null;
  featured_image_url: string | null;

  // Publishing
  status: CaseStudyStatus;
  published_at: string | null;

  // SEO
  seo_title: string | null;
  seo_description: string | null;

  // Analytics
  view_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateCaseStudyInput {
  slug: string;
  company_name: string;
  industry?: string;
  employee_count?: number;
  challenge?: Record<string, any>;
  solution?: Record<string, any>;
  results?: Record<string, any>;
  testimonial?: string;
  testimonial_author?: string;
  testimonial_role?: string;
  logo_url?: string;
  featured_image_url?: string;
  status?: CaseStudyStatus;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdateCaseStudyInput extends Partial<CreateCaseStudyInput> {
  published_at?: string | null;
}

// =============================================================================
// LANDING PAGES
// =============================================================================

export type LandingPageStatus = 'draft' | 'published' | 'archived';

export interface LandingPageSection {
  type: string; // hero, features, pricing, testimonials, cta, etc.
  content: Record<string, any>;
  order: number;
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  sections: LandingPageSection[];

  // Publishing
  status: LandingPageStatus;
  published_at: string | null;

  // SEO
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;

  // Analytics
  view_count: number;
  conversion_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateLandingPageInput {
  slug: string;
  title: string;
  sections?: LandingPageSection[];
  status?: LandingPageStatus;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
}

export interface UpdateLandingPageInput extends Partial<CreateLandingPageInput> {
  published_at?: string | null;
}

// =============================================================================
// LEADS
// =============================================================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'spam';
export type LeadSource = 'homepage' | 'pricing' | 'demo' | 'blog' | 'case-study' | 'referral' | 'other';

export interface Lead {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  employee_count: number | null;

  // Source tracking
  source: LeadSource | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;

  // Lead management
  status: LeadStatus;
  assigned_to: string | null;
  notes: string | null;

  // Additional data
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
  contacted_at: string | null;
  converted_at: string | null;
}

export interface CreateLeadInput {
  email: string;
  full_name?: string;
  company_name?: string;
  phone?: string;
  employee_count?: number;
  source?: LeadSource;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  status?: LeadStatus;
  assigned_to?: string;
  notes?: string;
}

// =============================================================================
// DEMO REQUESTS
// =============================================================================

export type DemoRequestStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface DemoRequest {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  employee_count: number | null;
  preferred_date: string | null;
  message: string | null;

  // Demo management
  status: DemoRequestStatus;
  assigned_to: string | null;
  scheduled_date: string | null;
  meeting_url: string | null;
  notes: string | null;

  // Source tracking
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;

  // Additional data
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateDemoRequestInput {
  name: string;
  email: string;
  company_name?: string;
  phone?: string;
  employee_count?: number;
  preferred_date?: string;
  message?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata?: Record<string, any>;
}

export interface UpdateDemoRequestInput extends Partial<CreateDemoRequestInput> {
  status?: DemoRequestStatus;
  assigned_to?: string;
  scheduled_date?: string;
  meeting_url?: string;
  notes?: string;
}

// =============================================================================
// WEB ANALYTICS
// =============================================================================

export type AnalyticsEventType =
  | 'page_view'
  | 'cta_click'
  | 'form_submit'
  | 'download'
  | 'video_play'
  | 'scroll_depth'
  | 'exit';

export interface WebAnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  page_path: string | null;

  // User tracking
  user_id: string | null;
  session_id: string | null;

  // Source tracking
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;

  // Device/browser info
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;

  // Additional data
  metadata: Record<string, any>;

  // Timestamp
  created_at: string;
}

export interface CreateAnalyticsEventInput {
  event_type: AnalyticsEventType;
  page_path?: string;
  user_id?: string;
  session_id?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// NEWSLETTER SUBSCRIBERS
// =============================================================================

export type NewsletterStatus = 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  full_name: string | null;

  // Subscription status
  status: NewsletterStatus;
  subscribed_at: string;
  unsubscribed_at: string | null;

  // Preferences
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    topics: string[];
  };

  // Source tracking
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateNewsletterSubscriberInput {
  email: string;
  full_name?: string;
  preferences?: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    topics?: string[];
  };
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface UpdateNewsletterSubscriberInput {
  status?: NewsletterStatus;
  preferences?: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    topics?: string[];
  };
}

// =============================================================================
// QUERY FILTERS
// =============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface BlogPostFilters extends PaginationParams {
  status?: BlogPostStatus;
  category?: string;
  tags?: string[];
  language?: Language;
  author_id?: string;
  search?: string;
}

export interface CaseStudyFilters extends PaginationParams {
  status?: CaseStudyStatus;
  industry?: string;
  search?: string;
}

export interface LeadFilters extends PaginationParams {
  status?: LeadStatus;
  source?: LeadSource;
  assigned_to?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface DemoRequestFilters extends PaginationParams {
  status?: DemoRequestStatus;
  assigned_to?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface AnalyticsFilters extends PaginationParams {
  event_type?: AnalyticsEventType;
  page_path?: string;
  session_id?: string;
  from_date?: string;
  to_date?: string;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CMSStats {
  blog_posts: {
    total: number;
    published: number;
    draft: number;
  };
  case_studies: {
    total: number;
    published: number;
  };
  leads: {
    total: number;
    new: number;
    qualified: number;
    converted: number;
    conversion_rate: number;
  };
  demo_requests: {
    total: number;
    pending: number;
    scheduled: number;
    completed: number;
  };
  newsletter: {
    total_subscribers: number;
    active_subscribers: number;
  };
}
