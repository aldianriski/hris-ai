/**
 * Generic File Upload Endpoint
 * POST /api/v1/upload
 * Handles file uploads to Supabase Storage
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { uploadFile, validateFile } from '@/lib/storage/upload';
import { STORAGE_LIMITS, ALLOWED_FILE_TYPES } from '@/lib/storage/config';

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as 'document' | 'payslip' | 'avatar' | null;
    const folder = formData.get('folder') as string | null;
    const makePublic = formData.get('makePublic') === 'true';

    if (!file) {
      return errorResponse(
        'VAL_2001',
        'No file provided',
        400
      );
    }

    // Validate file type parameter
    if (fileType && !['document', 'payslip', 'avatar'].includes(fileType)) {
      return errorResponse(
        'VAL_2001',
        'Invalid file type. Must be: document, payslip, or avatar',
        400
      );
    }

    // Set validation options based on file type
    let maxSize = STORAGE_LIMITS.MAX_FILE_SIZE;
    let allowedTypes = ALLOWED_FILE_TYPES.ALL;

    if (fileType === 'avatar') {
      maxSize = STORAGE_LIMITS.MAX_IMAGE_SIZE;
      allowedTypes = ALLOWED_FILE_TYPES.IMAGES;
    } else if (fileType === 'document' || fileType === 'payslip') {
      maxSize = STORAGE_LIMITS.MAX_DOCUMENT_SIZE;
      allowedTypes = ALLOWED_FILE_TYPES.DOCUMENTS;
    }

    // Validate file
    const validation = validateFile(file, { maxSize, allowedTypes });
    if (!validation.valid) {
      return errorResponse(
        'VAL_2002',
        validation.error || 'File validation failed',
        400
      );
    }

    // Create folder path with company isolation
    const companyFolder = `${userContext.companyId}/${folder || 'general'}`;

    // Upload file
    const result = await uploadFile(file, {
      fileType: fileType || undefined,
      folder: companyFolder,
      maxSize,
      allowedTypes,
      makePublic,
    });

    if (!result.success) {
      return errorResponse(
        'SRV_9002',
        result.error || 'Upload failed',
        500
      );
    }

    // Return upload result
    return successResponse({
      path: result.path,
      url: result.url,
      fileName: file.name,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userContext.id,
    }, 201);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to upload file',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const POST = withErrorHandler(handler);
