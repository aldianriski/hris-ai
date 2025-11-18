/**
 * GET /api/v1/documents/:id/download
 * Download document with signed URL
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { getSignedUrl } from '@/lib/storage/download';
import { STORAGE_BUCKETS } from '@/lib/storage/config';
import { logDocumentAction } from '@/lib/utils/auditLog';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);
  const { id } = params;

  const supabase = await createClient();

  try {
    // Get the document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('employer_id', userContext.companyId)
      .single();

    if (error || !document) {
      return notFoundResponse('Document');
    }

    // Extract storage path from document_url
    // Assuming document_url contains the storage path or full URL
    let storagePath = document.document_url;

    // If it's a full URL, extract the path
    if (storagePath.includes('/storage/v1/object/')) {
      const urlParts = storagePath.split('/storage/v1/object/public/');
      if (urlParts.length > 1) {
        const pathParts = urlParts[1].split('/');
        pathParts.shift(); // Remove bucket name
        storagePath = pathParts.join('/');
      }
    }

    // Generate signed URL
    const signedUrlResult = await getSignedUrl(
      STORAGE_BUCKETS.DOCUMENTS,
      storagePath,
      {
        download: true, // Force download
        expiresIn: 300, // 5 minutes
      }
    );

    if (!signedUrlResult.success) {
      return errorResponse(
        'SRV_9002',
        signedUrlResult.error || 'Failed to generate download URL',
        500
      );
    }

    // Log document download
    await logDocumentAction(
      userContext,
      request,
      'downloaded',
      document.id,
      document.document_name,
      {
        downloadedBy: userContext.email,
      }
    );

    return successResponse({
      id: document.id,
      name: document.document_name,
      downloadUrl: signedUrlResult.signedUrl,
      expiresAt: signedUrlResult.expiresAt,
      fileSize: document.file_size,
      mimeType: document.mime_type,
    });
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to generate download URL',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
