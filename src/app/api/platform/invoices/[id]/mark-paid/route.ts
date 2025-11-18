import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/platform/invoices/[id]/mark-paid
 * Mark invoice as paid
 */
export async function POST(
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
    const {
      payment_method,
      payment_reference,
      payment_notes,
      paid_at,
    } = body;

    // Get invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, invoice_number')
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Validate invoice can be marked as paid
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already marked as paid' },
        { status: 400 }
      );
    }

    if (invoice.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot mark cancelled invoice as paid' },
        { status: 400 }
      );
    }

    // Update invoice
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: paid_at || new Date().toISOString(),
        payment_method,
        payment_reference,
        payment_notes,
        last_modified_by: user.id,
      })
      .eq('id', id)
      .select(`
        *,
        tenant:tenants(id, company_name, slug)
      `)
      .single();

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      return NextResponse.json(
        { error: 'Failed to mark invoice as paid' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedInvoice,
      message: 'Invoice marked as paid successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
