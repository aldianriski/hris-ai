import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDemoRequests, createDemoRequest } from '@/lib/db/cms-queries';
import type { CreateDemoRequestInput } from '@/lib/db/cms-schema';

/**
 * GET /api/v1/cms/demo-requests
 * List demo requests (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      status: searchParams.get('status') as any,
      search: searchParams.get('search') || undefined,
    };

    const result = await getDemoRequests(supabase, filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching demo requests:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DEMO_REQUESTS_FETCH_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/cms/demo-requests
 * Create a new demo request (Public endpoint - from website forms)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body: CreateDemoRequestInput = await request.json();

    // Validate required fields
    if (!body.company_name || !body.contact_name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Company name, contact name, and email are required'
          }
        },
        { status: 400 }
      );
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email address' } },
        { status: 400 }
      );
    }

    // Validate employee count
    if (body.employee_count && (body.employee_count < 1 || body.employee_count > 10000)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Employee count must be between 1 and 10,000'
          }
        },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (body.phone && !/^\+?[0-9\s\-()]+$/.test(body.phone)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid phone number format'
          }
        },
        { status: 400 }
      );
    }

    // Extract UTM params and referrer from headers if not provided
    const referer = request.headers.get('referer') || '';
    if (!body.utm_source && referer) {
      const url = new URL(referer);
      body.utm_source = url.searchParams.get('utm_source') || undefined;
      body.utm_medium = url.searchParams.get('utm_medium') || undefined;
      body.utm_campaign = url.searchParams.get('utm_campaign') || undefined;
    }
    body.referrer = referer || undefined;

    const demoRequest = await createDemoRequest(supabase, body);

    // TODO: Send confirmation email to customer
    // TODO: Send notification to sales team
    // TODO: Create calendar invite if preferred_date is provided

    return NextResponse.json({
      success: true,
      data: demoRequest,
      message: 'Demo request submitted successfully. Our team will contact you soon!',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating demo request:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DEMO_REQUEST_CREATE_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
