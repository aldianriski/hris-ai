import { apiClient } from '../client';
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
  NewsletterSubscriber,
  CreateNewsletterSubscriberInput,
  UpdateNewsletterSubscriberInput,
  PaginatedResponse,
} from '@/lib/db/cms-schema';

// =============================================================================
// BLOG POSTS
// =============================================================================

export const blogService = {
  /**
   * Get all blog posts with optional filters
   */
  list: async (filters?: BlogPostFilters) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.category) params.category = filters.category;
    if (filters?.language) params.language = filters.language;
    if (filters?.author_id) params.author_id = filters.author_id;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();

    return apiClient.get<PaginatedResponse<BlogPost>>('/cms/blog', params);
  },

  /**
   * Get single blog post by ID
   */
  getById: async (id: string) => {
    return apiClient.get<BlogPost>(`/cms/blog/${id}`);
  },

  /**
   * Create new blog post
   */
  create: async (data: CreateBlogPostInput) => {
    return apiClient.post<BlogPost>('/cms/blog', data);
  },

  /**
   * Update blog post
   */
  update: async (id: string, data: UpdateBlogPostInput) => {
    return apiClient.patch<BlogPost>(`/cms/blog/${id}`, data);
  },

  /**
   * Delete blog post
   */
  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/cms/blog/${id}`);
  },

  /**
   * Publish blog post
   */
  publish: async (id: string) => {
    return apiClient.post<BlogPost>(`/cms/blog/${id}/publish`, {});
  },
};

// =============================================================================
// CASE STUDIES
// =============================================================================

export const caseStudyService = {
  /**
   * Get all case studies with optional filters
   */
  list: async (filters?: CaseStudyFilters) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.industry) params.industry = filters.industry;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();

    return apiClient.get<PaginatedResponse<CaseStudy>>('/cms/case-studies', params);
  },

  /**
   * Get single case study by ID
   */
  getById: async (id: string) => {
    return apiClient.get<CaseStudy>(`/cms/case-studies/${id}`);
  },

  /**
   * Create new case study
   */
  create: async (data: CreateCaseStudyInput) => {
    return apiClient.post<CaseStudy>('/cms/case-studies', data);
  },

  /**
   * Update case study
   */
  update: async (id: string, data: UpdateCaseStudyInput) => {
    return apiClient.patch<CaseStudy>(`/cms/case-studies/${id}`, data);
  },

  /**
   * Delete case study
   */
  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/cms/case-studies/${id}`);
  },

  /**
   * Publish case study
   */
  publish: async (id: string) => {
    return apiClient.post<CaseStudy>(`/cms/case-studies/${id}/publish`, {});
  },
};

// =============================================================================
// LEADS
// =============================================================================

export const leadService = {
  /**
   * Get all leads with optional filters
   */
  list: async (filters?: LeadFilters) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.source) params.source = filters.source;
    if (filters?.assigned_to) params.assigned_to = filters.assigned_to;
    if (filters?.from_date) params.from_date = filters.from_date;
    if (filters?.to_date) params.to_date = filters.to_date;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();

    return apiClient.get<PaginatedResponse<Lead>>('/cms/leads', params);
  },

  /**
   * Get single lead by ID
   */
  getById: async (id: string) => {
    return apiClient.get<Lead>(`/cms/leads/${id}`);
  },

  /**
   * Create new lead
   */
  create: async (data: CreateLeadInput) => {
    return apiClient.post<Lead>('/cms/leads', data);
  },

  /**
   * Update lead
   */
  update: async (id: string, data: UpdateLeadInput) => {
    return apiClient.patch<Lead>(`/cms/leads/${id}`, data);
  },

  /**
   * Delete lead
   */
  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/cms/leads/${id}`);
  },
};

// =============================================================================
// DEMO REQUESTS
// =============================================================================

export const demoRequestService = {
  /**
   * Get all demo requests with optional filters
   */
  list: async (filters?: DemoRequestFilters) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.assigned_to) params.assigned_to = filters.assigned_to;
    if (filters?.from_date) params.from_date = filters.from_date;
    if (filters?.to_date) params.to_date = filters.to_date;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();

    return apiClient.get<PaginatedResponse<DemoRequest>>('/cms/demo-requests', params);
  },

  /**
   * Get single demo request by ID
   */
  getById: async (id: string) => {
    return apiClient.get<DemoRequest>(`/cms/demo-requests/${id}`);
  },

  /**
   * Create new demo request
   */
  create: async (data: CreateDemoRequestInput) => {
    return apiClient.post<DemoRequest>('/cms/demo-requests', data);
  },

  /**
   * Update demo request
   */
  update: async (id: string, data: UpdateDemoRequestInput) => {
    return apiClient.patch<DemoRequest>(`/cms/demo-requests/${id}`, data);
  },

  /**
   * Delete demo request
   */
  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/cms/demo-requests/${id}`);
  },

  /**
   * Schedule demo
   */
  schedule: async (id: string, data: { scheduled_date: string; meeting_url?: string }) => {
    return apiClient.post<DemoRequest>(`/cms/demo-requests/${id}/schedule`, data);
  },
};

// =============================================================================
// NEWSLETTER SUBSCRIBERS
// =============================================================================

export const newsletterService = {
  /**
   * Get all newsletter subscribers
   */
  list: async (filters?: { status?: string; page?: number; limit?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();

    return apiClient.get<PaginatedResponse<NewsletterSubscriber>>('/cms/newsletter', params);
  },

  /**
   * Get single subscriber by ID
   */
  getById: async (id: string) => {
    return apiClient.get<NewsletterSubscriber>(`/cms/newsletter/${id}`);
  },

  /**
   * Create new subscriber
   */
  create: async (data: CreateNewsletterSubscriberInput) => {
    return apiClient.post<NewsletterSubscriber>('/cms/newsletter', data);
  },

  /**
   * Update subscriber
   */
  update: async (id: string, data: UpdateNewsletterSubscriberInput) => {
    return apiClient.patch<NewsletterSubscriber>(`/cms/newsletter/${id}`, data);
  },

  /**
   * Delete subscriber
   */
  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/cms/newsletter/${id}`);
  },

  /**
   * Unsubscribe
   */
  unsubscribe: async (id: string) => {
    return apiClient.post<NewsletterSubscriber>(`/cms/newsletter/${id}/unsubscribe`, {});
  },
};

// Export all services
export const cmsService = {
  blog: blogService,
  caseStudies: caseStudyService,
  leads: leadService,
  demoRequests: demoRequestService,
  newsletter: newsletterService,
};
