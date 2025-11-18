import { z } from 'zod';

/**
 * Document DTOs
 */
export const UploadDocumentSchema = z.object({
  employeeId: z.string().uuid(),
  employerId: z.string().uuid(),
  documentType: z.enum([
    'ktp',
    'npwp',
    'bpjs_kesehatan',
    'bpjs_ketenagakerjaan',
    'kk',
    'passport',
    'contract',
    'offer_letter',
    'resignation',
    'certificate',
    'medical',
    'other',
  ]),
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  fileUrl: z.string().url(),
  fileName: z.string().min(1),
  fileSize: z.number().int().min(0),
  mimeType: z.string(),
  issuedDate: z.string().datetime().or(z.date()).nullable().optional(),
  expiryDate: z.string().datetime().or(z.date()).nullable().optional(),
  documentNumber: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  uploadedBy: z.string().uuid(),
  uploadedByName: z.string(),
  notes: z.string().nullable().optional(),
  extractWithAI: z.boolean().default(true),
});

export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  issuedDate: z.string().datetime().or(z.date()).nullable().optional(),
  expiryDate: z.string().datetime().or(z.date()).nullable().optional(),
  documentNumber: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;

export const FilterDocumentsSchema = z.object({
  employerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  documentType: z
    .enum([
      'ktp',
      'npwp',
      'bpjs_kesehatan',
      'bpjs_ketenagakerjaan',
      'kk',
      'passport',
      'contract',
      'offer_letter',
      'resignation',
      'certificate',
      'medical',
      'other',
    ])
    .optional(),
  isVerified: z.boolean().optional(),
  isExpired: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type FilterDocumentsInput = z.infer<typeof FilterDocumentsSchema>;

export const ExtractDocumentSchema = z.object({
  documentId: z.string().uuid(),
  forceReExtract: z.boolean().default(false),
});

export type ExtractDocumentInput = z.infer<typeof ExtractDocumentSchema>;
