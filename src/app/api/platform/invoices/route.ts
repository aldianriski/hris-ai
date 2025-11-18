import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

/**
 * GET /api/platform/invoices
 * List all invoices with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
      'billing_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenant_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('invoices')
      .select(`
        *,
        tenant:tenants(id, company_name, slug),
        created_by_user:created_by(id, email, full_name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,billing_name.ilike.%${search}%,billing_email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      data,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
      'billing_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    const body = await request.json();
    const {
      tenant_id,
      billing_name,
      billing_email,
      billing_address,
      billing_tax_id,
      billing_phone,
      line_items,
      amount_subtotal,
      amount_tax,
      amount_discount = 0,
      amount_total,
      currency = 'IDR',
      tax_rate = 11.00,
      tax_description = 'PPN 11%',
      billing_period_start,
      billing_period_end,
      due_date,
      notes,
      internal_notes,
      discount_code,
      discount_description,
    } = body;

    // Validate required fields
    if (!tenant_id || !billing_name || !billing_email || !line_items || !amount_total || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, company_name')
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Generate invoice number
    const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
      .rpc('generate_invoice_number');

    if (invoiceNumberError) {
      console.error('Error generating invoice number:', invoiceNumberError);
      return NextResponse.json(
        { error: 'Failed to generate invoice number' },
        { status: 500 }
      );
    }

    // Create invoice
    const { data: invoice, error: createError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumberData,
        tenant_id,
        billing_name,
        billing_email,
        billing_address,
        billing_tax_id,
        billing_phone,
        line_items,
        amount_subtotal,
        amount_tax,
        amount_discount,
        amount_total,
        currency,
        tax_rate,
        tax_description,
        billing_period_start,
        billing_period_end,
        due_date,
        notes,
        internal_notes,
        discount_code,
        discount_description,
        status: 'draft',
        created_by: user.id,
        last_modified_by: user.id,
      })
      .select(`
        *,
        tenant:tenants(id, company_name, slug)
      `)
      .single();

    if (createError) {
      console.error('Error creating invoice:', createError);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
