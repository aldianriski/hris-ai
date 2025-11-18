import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCaseStudies, createCaseStudy } from '@/lib/db/cms-queries';
import type { CreateCaseStudyInput } from '@/lib/db/cms-schema';

/**
 * GET /api/v1/cms/case-studies
 * List case studies (Public with optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      status: searchParams.get('status') as any,
      industry: searchParams.get('industry') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const result = await getCaseStudies(supabase, filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching case studies:', error);
    return NextResponse.json(
      { success: false, error: { code: 'CASE_STUDIES_FETCH_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/cms/case-studies
 * Create a new case study (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check auth (admin only)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body: CreateCaseStudyInput = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.company_name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title, slug, and company name are required'
          }
        },
        { status: 400 }
      );
    }

    // Validate slug format (URL-safe)
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Slug must contain only lowercase letters, numbers, and hyphens'
          }
        },
        { status: 400 }
      );
    }

    const caseStudy = await createCaseStudy(supabase, body);

    return NextResponse.json({
      success: true,
      data: caseStudy,
      message: 'Case study created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating case study:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: 'A case study with this slug already exists'
          }
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'CASE_STUDY_CREATE_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
