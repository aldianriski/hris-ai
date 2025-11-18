import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/platform/invoices/[id]
 * Get a single invoice by ID or invoice number
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
      'billing_admin',
    ]);

    if (permError || !user) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    // Try to fetch by ID first, then by invoice number
    let query = supabase
      .from('invoices')
      .select(`
        *,
        tenant:tenants(id, company_name, slug, support_email),
        created_by_user:created_by(id, email, full_name),
        last_modified_by_user:last_modified_by(id, email, full_name)
      `);

    // Check if id is a UUID or invoice number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('invoice_number', id);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching invoice:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/invoices/[id]
 * Update an invoice
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
      'billing_admin',
    ]);

    if (permError || !user) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // Build update object
    const updates: Record<string, unknown> = {
      last_modified_by: user.id,
      ...body,
    };

    // Don't allow updating certain fields
    delete updates.invoice_number;
    delete updates.tenant_id;
    delete updates.created_by;
    delete updates.created_at;

    // Update invoice
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        tenant:tenants(id, company_name, slug)
      `)
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/invoices/[id]
 * Delete an invoice (only drafts can be deleted)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'billing_admin',
    ]);

    if (permError || !user) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    // Check invoice status - only drafts can be deleted
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, invoice_number')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching invoice:', fetchError);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.status !== 'draft') {
      return NextResponse.json(
        {
          error: 'Only draft invoices can be deleted. Cancel this invoice instead.',
          status: invoice.status,
        },
        { status: 400 }
      );
    }

    // Delete invoice
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting invoice:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
