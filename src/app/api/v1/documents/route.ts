/**
 * Document Management Endpoints
 * GET /api/v1/documents - List documents
 * POST /api/v1/documents - Upload document
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { PaginationSchema } from '@/lib/api/types';
import { logDocumentAction } from '@/lib/utils/auditLog';

// ============================================
// GET /api/v1/documents - List documents
// ============================================

const listDocumentsSchema = z.object({
  ...PaginationSchema.shape,
  employeeId: z.string().uuid().optional(),
  documentType: z.enum(['contract', 'id_card', 'certificate', 'policy', 'payslip', 'tax_form', 'other']).optional(),
  isVerified: z.coerce.boolean().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

async function listHandler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listDocumentsSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.employeeId) {
    query = query.eq('employee_id', validatedParams.employeeId);
  }

  if (validatedParams.documentType) {
    query = query.eq('document_type', validatedParams.documentType);
  }

  if (validatedParams.isVerified !== undefined) {
    query = query.eq('is_verified', validatedParams.isVerified);
  }

  if (validatedParams.year) {
    const startDate = `${validatedParams.year}-01-01`;
    const endDate = `${validatedParams.year}-12-31`;
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  }

  // Apply sorting
  if (validatedParams.sortBy) {
    query = query.order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const from = (validatedParams.page - 1) * validatedParams.limit;
  const to = from + validatedParams.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch documents',
      500,
      { details: error.message }
    );
  }

  return paginatedResponse(
    data || [],
    count || 0,
    validatedParams.page,
    validatedParams.limit
  );
}

// ============================================
// POST /api/v1/documents - Upload document
// ============================================

const uploadDocumentSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  documentType: z.enum(['contract', 'id_card', 'certificate', 'policy', 'payslip', 'tax_form', 'other']),
  documentName: z.string().min(1, 'Document name is required'),
  documentUrl: z.string().url('Invalid document URL'),
  fileSize: z.number().int().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  description: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
});

async function uploadHandler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = uploadDocumentSchema.parse(body);

  const supabase = await createClient();

  // Verify employee belongs to company
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, full_name, employer_id')
    .eq('id', validatedData.employeeId)
    .single();

  if (employeeError || !employee) {
    return errorResponse(
      'RES_3001',
      'Employee not found',
      404
    );
  }

  if (employee.employer_id !== userContext.companyId) {
    return errorResponse(
      'AUTH_1004',
      'Employee does not belong to your company',
      403
    );
  }

  // Create document record
  const documentData = {
    employee_id: validatedData.employeeId,
    employer_id: employee.employer_id,
    employee_name: employee.full_name,
    document_type: validatedData.documentType,
    document_name: validatedData.documentName,
    document_url: validatedData.documentUrl,
    file_size: validatedData.fileSize,
    mime_type: validatedData.mimeType,
    description: validatedData.description,
    expiry_date: validatedData.expiryDate ? validatedData.expiryDate.split('T')[0] : null,
    is_verified: false,
    uploaded_by: userContext.id,
    uploaded_by_email: userContext.email,
  };

  const { data: document, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to upload document',
      500,
      { details: error.message }
    );
  }

  // Log document upload
  await logDocumentAction(
    userContext,
    request,
    'uploaded',
    document.id,
    document.document_name,
    {
      employeeName: employee.full_name,
      documentType: validatedData.documentType,
      fileSize: validatedData.fileSize,
    }
  );

  // TODO: Trigger document.uploaded webhook
  // TODO: Send notification to HR/Admin for verification

  return successResponse(document, 201);
}

export const GET = withErrorHandler(listHandler);
export const POST = withErrorHandler(uploadHandler);
