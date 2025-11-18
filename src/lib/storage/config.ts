/**
 * Supabase Storage Configuration
 * Defines storage buckets and policies
 */

export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  PAYSLIPS: 'payslips',
  AVATARS: 'avatars',
  TEMP: 'temp',
} as const;

export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024, // 20MB
} as const;

export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  ALL: [] as string[], // Will be computed
} as const;

ALLOWED_FILE_TYPES.ALL = [
  ...ALLOWED_FILE_TYPES.IMAGES,
  ...ALLOWED_FILE_TYPES.DOCUMENTS,
];

export const FILE_EXTENSIONS = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'],
} as const;

/**
 * Get bucket name for a specific file type
 */
export function getBucketForFileType(fileType: 'document' | 'payslip' | 'avatar'): string {
  switch (fileType) {
    case 'document':
      return STORAGE_BUCKETS.DOCUMENTS;
    case 'payslip':
      return STORAGE_BUCKETS.PAYSLIPS;
    case 'avatar':
      return STORAGE_BUCKETS.AVATARS;
    default:
      return STORAGE_BUCKETS.TEMP;
  }
}

/**
 * Get signed URL expiry time (in seconds)
 */
export const SIGNED_URL_EXPIRY = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 60, // 1 hour
  LONG: 60 * 60 * 24, // 24 hours
} as const;
