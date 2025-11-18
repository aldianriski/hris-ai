import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const createDocumentSchema = z.object({
  employeeId: z.string().uuid(),
  employerId: z.string().uuid(),
  documentType: z.enum(['ktp', 'npwp', 'kk', 'bpjs_kesehatan', 'bpjs_ketenagakerjaan', 'passport', 'ijazah', 'contract', 'other']),
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileName: z.string().min(1),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  issuedDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  documentNumber: z.string().optional(),
  uploadedBy: z.string().uuid(),
  uploadedByName: z.string().min(1),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

/**
 * GET /api/v1/documents
 * Get employee documents
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const employerId = searchParams.get('employerId');

    const repository = await container.getDocumentRepository();

    if (employeeId) {
      const options = {
        documentType: searchParams.get('documentType') || undefined,
        isVerified: searchParams.get('isVerified') === 'true' ? true : searchParams.get('isVerified') === 'false' ? false : undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      };
      const result = await repository.findDocumentsByEmployeeId(employeeId, options);
      return NextResponse.json(result, { status: 200 });
    }

    if (employerId) {
      const options = {
        documentType: searchParams.get('documentType') || undefined,
        isVerified: searchParams.get('isVerified') === 'true' ? true : searchParams.get('isVerified') === 'false' ? false : undefined,
        isExpired: searchParams.get('isExpired') === 'true',
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      };
      const result = await repository.findDocumentsByEmployerId(employerId, options);
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({ error: 'Either employeeId or employerId is required' }, { status: 400 });
  } catch (error) {
    console.error('Failed to get documents:', error);
    return NextResponse.json(
      { error: 'Failed to get documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/documents
 * Create a new document
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);

    const documentData = {
      ...validatedData,
      issuedDate: validatedData.issuedDate ? new Date(validatedData.issuedDate) : null,
      expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
      isVerified: false,
      extractedData: null,
      aiExtractedAt: null,
      aiConfidence: null,
      verifiedBy: null,
      verifiedAt: null,
    };

    const repository = await container.getDocumentRepository();
    const document = await repository.createDocument(documentData as any);

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Failed to create document:', error);
    return NextResponse.json(
      { error: 'Failed to create document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
