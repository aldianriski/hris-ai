/**
 * File Upload Utility
 * Handles file uploads to storage (Supabase Storage or cloud provider)
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to storage
 * Currently returns a mock URL for local development
 * In production, integrate with Supabase Storage or S3
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path?: string
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'File must be an image (JPEG, PNG, SVG, or WebP)' };
    }

    // TODO: In production, upload to Supabase Storage or S3
    // For now, we'll convert to base64 data URL for local development
    const dataUrl = await fileToDataURL(file);

    // In production, this would be the actual storage URL
    // Example: https://your-bucket.supabase.co/storage/v1/object/public/logos/tenant-id/logo.png
    return {
      success: true,
      url: dataUrl,
    };

    /* Production implementation example:
    const supabase = createClient();
    const fileName = `${path || Date.now()}-${file.name}`;
    const filePath = `${bucket}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
    */
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Convert File to Data URL (base64)
 */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Delete a file from storage
 */
export async function deleteFile(url: string): Promise<boolean> {
  try {
    // TODO: In production, delete from Supabase Storage or S3
    // For now, just return success
    return true;

    /* Production implementation example:
    const supabase = createClient();
    const filePath = extractFilePathFromUrl(url);

    const { error } = await supabase.storage
      .from('bucket-name')
      .remove([filePath]);

    return !error;
    */
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
  }
): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const { maxWidth, maxHeight, minWidth, minHeight } = options;

      if (maxWidth && width > maxWidth) {
        resolve({ valid: false, error: `Image width must be less than ${maxWidth}px` });
        return;
      }

      if (maxHeight && height > maxHeight) {
        resolve({ valid: false, error: `Image height must be less than ${maxHeight}px` });
        return;
      }

      if (minWidth && width < minWidth) {
        resolve({ valid: false, error: `Image width must be at least ${minWidth}px` });
        return;
      }

      if (minHeight && height < minHeight) {
        resolve({ valid: false, error: `Image height must be at least ${minHeight}px` });
        return;
      }

      resolve({ valid: true, width, height });
    };

    img.onerror = () => {
      resolve({ valid: false, error: 'Failed to load image' });
    };

    img.src = URL.createObjectURL(file);
  });
}
