/**
 * React Query hooks for CMS operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService, caseStudyService, leadService, demoRequestService, newsletterService } from '../api/services';
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
} from '@/lib/db/cms-schema';

// =============================================================================
// BLOG POSTS
// =============================================================================

export function useBlogPosts(filters?: BlogPostFilters) {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: () => blogService.list(filters),
  });
}

export function useBlogPost(id: string | null) {
  return useQuery({
    queryKey: ['blog-post', id],
    queryFn: () => blogService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogPostInput) => blogService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostInput }) =>
      blogService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', variables.id] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function usePublishBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
    },
  });
}

// =============================================================================
// CASE STUDIES
// =============================================================================

export function useCaseStudies(filters?: CaseStudyFilters) {
  return useQuery({
    queryKey: ['case-studies', filters],
    queryFn: () => caseStudyService.list(filters),
  });
}

export function useCaseStudy(id: string | null) {
  return useQuery({
    queryKey: ['case-study', id],
    queryFn: () => caseStudyService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateCaseStudy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaseStudyInput) => caseStudyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-studies'] });
    },
  });
}

export function useUpdateCaseStudy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCaseStudyInput }) =>
      caseStudyService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case-studies'] });
      queryClient.invalidateQueries({ queryKey: ['case-study', variables.id] });
    },
  });
}

export function useDeleteCaseStudy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => caseStudyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-studies'] });
    },
  });
}

// =============================================================================
// LEADS
// =============================================================================

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadService.list(filters),
  });
}

export function useLead(id: string | null) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadInput) => leadService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) =>
      leadService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// =============================================================================
// DEMO REQUESTS
// =============================================================================

export function useDemoRequests(filters?: DemoRequestFilters) {
  return useQuery({
    queryKey: ['demo-requests', filters],
    queryFn: () => demoRequestService.list(filters),
  });
}

export function useDemoRequest(id: string | null) {
  return useQuery({
    queryKey: ['demo-request', id],
    queryFn: () => demoRequestService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDemoRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDemoRequestInput) => demoRequestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-requests'] });
    },
  });
}

export function useUpdateDemoRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDemoRequestInput }) =>
      demoRequestService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demo-requests'] });
      queryClient.invalidateQueries({ queryKey: ['demo-request', variables.id] });
    },
  });
}

export function useDeleteDemoRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => demoRequestService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-requests'] });
    },
  });
}

export function useScheduleDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { scheduled_date: string; meeting_url?: string } }) =>
      demoRequestService.schedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demo-requests'] });
      queryClient.invalidateQueries({ queryKey: ['demo-request', variables.id] });
    },
  });
}

// =============================================================================
// NEWSLETTER SUBSCRIBERS
// =============================================================================

export function useNewsletterSubscribers(filters?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['newsletter-subscribers', filters],
    queryFn: () => newsletterService.list(filters),
  });
}

export function useNewsletterSubscriber(id: string | null) {
  return useQuery({
    queryKey: ['newsletter-subscriber', id],
    queryFn: () => newsletterService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateNewsletterSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNewsletterSubscriberInput) => newsletterService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
  });
}

export function useUpdateNewsletterSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNewsletterSubscriberInput }) =>
      newsletterService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscriber', variables.id] });
    },
  });
}

export function useDeleteNewsletterSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsletterService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
  });
}

export function useUnsubscribeNewsletter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsletterService.unsubscribe(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscriber', id] });
    },
  });
}
