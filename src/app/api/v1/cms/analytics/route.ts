import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/cms/analytics/track
 * Track analytics event (Public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const {
      event_type,
      event_data,
      user_id,
      session_id,
    } = body;

    // Validate required fields
    if (!event_type) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'event_type is required' } },
        { status: 400 }
      );
    }

    // Validate event_type is one of the allowed values
    const allowedEventTypes = [
      'page_view',
      'button_click',
      'form_submit',
      'video_play',
      'download',
      'pricing_view',
      'demo_request',
      'lead_capture',
      'newsletter_signup',
    ];

    if (!allowedEventTypes.includes(event_type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `event_type must be one of: ${allowedEventTypes.join(', ')}`
          }
        },
        { status: 400 }
      );
    }

    // Extract additional data from request
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const user_agent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    // Parse UTM params from referer if available
    let utm_source, utm_medium, utm_campaign, utm_content, utm_term;
    if (referer) {
      try {
        const url = new URL(referer);
        utm_source = url.searchParams.get('utm_source') || undefined;
        utm_medium = url.searchParams.get('utm_medium') || undefined;
        utm_campaign = url.searchParams.get('utm_campaign') || undefined;
        utm_content = url.searchParams.get('utm_content') || undefined;
        utm_term = url.searchParams.get('utm_term') || undefined;
      } catch (e) {
        // Invalid URL, ignore
      }
    }

    // Create analytics event
    const { data: event, error: createError } = await supabase
      .from('web_analytics')
      .insert({
        event_type,
        event_data: event_data || {},
        user_id: user_id || null,
        session_id: session_id || null,
        ip_address,
        user_agent,
        referer: referer || null,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      data: event,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { success: false, error: { code: 'ANALYTICS_TRACK_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/cms/analytics
 * Get analytics data (Admin only)
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
    const event_type = searchParams.get('event_type');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('web_analytics')
      .select('*', { count: 'exact' });

    // Apply filters
    if (event_type) {
      query = query.eq('event_type', event_type);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: { code: 'ANALYTICS_FETCH_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
