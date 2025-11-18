import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/platform/invoices/[id]/send
 * Send invoice via email to customer
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

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    const body = await request.json();
    const { send_to, message } = body;

    // Get invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        tenant:tenants(id, company_name, slug)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Validate invoice can be sent
    if (invoice.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot send cancelled invoice' },
        { status: 400 }
      );
    }

    const emailTo = send_to || invoice.billing_email;

    // TODO: Implement actual email sending
    // For now, we'll just update the invoice status
    // In production, integrate with SendGrid, Resend, or AWS SES

    // Update invoice status
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: invoice.status === 'draft' ? 'sent' : invoice.status,
        sent_at: new Date().toISOString(),
        sent_to: emailTo,
        last_modified_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      return NextResponse.json(
        { error: 'Failed to send invoice' },
        { status: 500 }
      );
    }

    // TODO: In production, send email here
    // await sendInvoiceEmail({
    //   to: emailTo,
    //   invoice: updatedInvoice,
    //   message: message,
    // });

    return NextResponse.json({
      data: updatedInvoice,
      message: `Invoice sent to ${emailTo}`,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
