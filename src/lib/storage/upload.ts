/**
 * File Upload Utilities
 * Handles file uploads to Supabase Storage
 */

import { createClient } from '@/lib/supabase/server';
import {
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
  ALLOWED_FILE_TYPES,
  getBucketForFileType
} from './config';

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  fileType?: 'document' | 'payslip' | 'avatar';
  maxSize?: number;
  allowedTypes?: string[];
  makePublic?: boolean;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: UploadOptions = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || STORAGE_LIMITS.MAX_FILE_SIZE;
  const allowedTypes = options.allowedTypes || ALLOWED_FILE_TYPES.ALL;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .substring(0, 50);

  return `${sanitizedName}-${timestamp}-${random}.${extension}`;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Determine bucket
    const bucket = options.bucket ||
      (options.fileType ? getBucketForFileType(options.fileType) : STORAGE_BUCKETS.TEMP);

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const folder = options.folder || '';
    const path = folder ? `${folder}/${filename}` : filename;

    // Upload to Supabase Storage
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }

    // Get public URL if requested
    let url: string | undefined;
    if (options.makePublic) {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      url = urlData.publicUrl;
    }

    return {
      success: true,
      path: data.path,
      url,
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadFile(file, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(
  bucket: string,
  paths: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Move file to different location
 */
export async function moveFile(
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) {
      return {
        success: false,
        error: `Move failed: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
