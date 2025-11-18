/**
 * Document Detail Endpoints
 * GET /api/v1/documents/:id - Get document details
 * PUT /api/v1/documents/:id - Update document
 * DELETE /api/v1/documents/:id - Delete document
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, requireHR } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logDocumentAction } from '@/lib/utils/auditLog';

// ============================================
// GET /api/v1/documents/:id - Get document details
// ============================================

async function getHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const { id } = params;

  const supabase = await createClient();

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

  // Log document access
  await logDocumentAction(
    userContext,
    request,
    'downloaded',
    document.id,
    document.document_name,
    {
      accessedBy: userContext.email,
    }
  );

  return successResponse(document);
}

// ============================================
// PUT /api/v1/documents/:id - Update document
// ============================================

const updateDocumentSchema = z.object({
  documentName: z.string().min(1).optional(),
  documentType: z.enum(['contract', 'id_card', 'certificate', 'policy', 'payslip', 'tax_form', 'other']).optional(),
  description: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
  isVerified: z.boolean().optional(),
});

async function updateHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const { id } = params;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = updateDocumentSchema.parse(body);

  const supabase = await createClient();

  // Get existing document
  const { data: existingDocument, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !existingDocument) {
    return notFoundResponse('Document');
  }

  // Prepare update data
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validatedData.documentName) updateData.document_name = validatedData.documentName;
  if (validatedData.documentType) updateData.document_type = validatedData.documentType;
  if (validatedData.description !== undefined) updateData.description = validatedData.description;
  if (validatedData.expiryDate) updateData.expiry_date = validatedData.expiryDate.split('T')[0];

  // Only HR and above can verify documents
  if (validatedData.isVerified !== undefined) {
    // Check if user has HR role or higher
    if (userContext.role !== 'hr' && userContext.role !== 'admin' && userContext.role !== 'platform_admin') {
      return errorResponse(
        'AUTH_1003',
        'Only HR or Admin can verify documents',
        403
      );
    }
    updateData.is_verified = validatedData.isVerified;
    if (validatedData.isVerified) {
      updateData.verified_by = userContext.id;
      updateData.verified_at = new Date().toISOString();
    }
  }

  // Update document
  const { data: updatedDocument, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to update document',
      500,
      { details: error.message }
    );
  }

  // Log document update/verification
  const action = validatedData.isVerified ? 'verified' : 'uploaded';
  await logDocumentAction(
    userContext,
    request,
    action,
    updatedDocument.id,
    updatedDocument.document_name,
    {
      updatedBy: userContext.email,
      updatedFields: Object.keys(updateData).filter(k => k !== 'updated_at'),
    }
  );

  return successResponse(updatedDocument);
}

// ============================================
// DELETE /api/v1/documents/:id - Delete document
// ============================================

async function deleteHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only HR and above can delete documents
  const userContext = await requireHR(request);
  const { id } = params;

  const supabase = await createClient();

  // Get the document first to log details
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !document) {
    return notFoundResponse('Document');
  }

  // Delete document
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to delete document',
      500,
      { details: error.message }
    );
  }

  // Log document deletion
  await logDocumentAction(
    userContext,
    request,
    'deleted',
    document.id,
    document.document_name,
    {
      deletedBy: userContext.email,
      documentType: document.document_type,
      employeeName: document.employee_name,
    }
  );

  // TODO: Delete actual file from storage (Supabase Storage)
  // TODO: Trigger document.deleted webhook

  return successResponse({ message: 'Document deleted successfully' });
}

export const GET = withErrorHandler(getHandler);
export const PUT = withErrorHandler(updateHandler);
export const DELETE = withErrorHandler(deleteHandler);
