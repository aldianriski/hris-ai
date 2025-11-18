import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLeads, createLead } from '@/lib/db/cms-queries';
import type { CreateLeadInput } from '@/lib/db/cms-schema';

/**
 * GET /api/v1/cms/leads
 * List leads (Admin only)
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
      source: searchParams.get('source') as any,
      search: searchParams.get('search') || undefined,
    };

    const result = await getLeads(supabase, filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: { code: 'LEADS_FETCH_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/cms/leads
 * Create a new lead (Public endpoint - from website forms)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body: CreateLeadInput = await request.json();

    // Validate email
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email address' } },
        { status: 400 }
      );
    }

    // Extract UTM params and referrer from headers if not provided
    const referer = request.headers.get('referer') || '';
    if (!body.utm_source && referer) {
      // Parse UTM params from referer if available
      const url = new URL(referer);
      body.utm_source = url.searchParams.get('utm_source') || undefined;
      body.utm_medium = url.searchParams.get('utm_medium') || undefined;
      body.utm_campaign = url.searchParams.get('utm_campaign') || undefined;
    }
    body.referrer = referer || undefined;

    const lead = await createLead(supabase, body);

    // TODO: Send notification email to sales team
    // TODO: Add to email marketing list

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Thank you! We will contact you soon.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: { code: 'LEAD_CREATE_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
