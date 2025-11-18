/**
 * File Download Utilities
 * Handles file downloads with signed URLs from Supabase Storage
 */

import { createClient } from '@/lib/supabase/server';
import { SIGNED_URL_EXPIRY } from './config';

export interface DownloadOptions {
  expiresIn?: number; // seconds
  download?: boolean; // force download vs inline display
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

export interface SignedUrlResult {
  success: boolean;
  signedUrl?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Generate signed URL for file download
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  options: DownloadOptions = {}
): Promise<SignedUrlResult> {
  try {
    const expiresIn = options.expiresIn || SIGNED_URL_EXPIRY.MEDIUM;

    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn, {
        download: options.download,
        transform: options.transform,
      });

    if (error) {
      return {
        success: false,
        error: `Failed to generate signed URL: ${error.message}`,
      };
    }

    if (!data.signedUrl) {
      return {
        success: false,
        error: 'No signed URL returned',
      };
    }

    // Calculate expiry timestamp
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    return {
      success: true,
      signedUrl: data.signedUrl,
      expiresAt,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate multiple signed URLs
 */
export async function getMultipleSignedUrls(
  bucket: string,
  paths: string[],
  options: DownloadOptions = {}
): Promise<SignedUrlResult[]> {
  const urlPromises = paths.map(path => getSignedUrl(bucket, path, options));
  return Promise.all(urlPromises);
}

/**
 * Get public URL for file (if bucket is public)
 */
export async function getPublicUrl(
  bucket: string,
  path: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    if (!data.publicUrl) {
      return {
        success: false,
        error: 'Failed to get public URL',
      };
    }

    return {
      success: true,
      publicUrl: data.publicUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Download file as blob
 */
export async function downloadFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      return {
        success: false,
        error: `Download failed: ${error.message}`,
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'No data returned',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if file exists
 */
export async function fileExists(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        limit: 1,
        search: path.split('/').pop(),
      });

    if (error) {
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(
  bucket: string,
  path: string
): Promise<{
  success: boolean;
  metadata?: {
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
    mimetype?: string;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const folder = path.split('/').slice(0, -1).join('/');
    const filename = path.split('/').pop();

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        search: filename,
      });

    if (error) {
      return {
        success: false,
        error: `Failed to get metadata: ${error.message}`,
      };
    }

    const file = data?.find(f => f.name === filename);

    if (!file) {
      return {
        success: false,
        error: 'File not found',
      };
    }

    return {
      success: true,
      metadata: {
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at,
        mimetype: file.metadata?.mimetype,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
