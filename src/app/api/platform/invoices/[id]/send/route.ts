import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';
import { getEmailService } from '@/lib/email/email-service';
import { generateInvoiceEmail } from '@/lib/email/templates/invoice-email';
import { getInvoicePDFBlob } from '@/lib/pdf/invoice-generator';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/platform/invoices/[id]/send
 * Send invoice via email to customer with PDF attachment
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

    // Get invoice with full details
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        tenant:tenants(id, company_name, slug, name)
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

    if (!emailTo) {
      return NextResponse.json(
        { error: 'No email address provided' },
        { status: 400 }
      );
    }

    // Get platform settings for email configuration
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('email_provider, email_api_key_encrypted, smtp_from_email, smtp_from_name')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    // Generate PDF attachment
    let pdfAttachment: any = null;
    try {
      const pdfBlob = getInvoicePDFBlob({
        ...invoice,
        tenant: invoice.tenant,
      });

      // Convert blob to buffer
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      pdfAttachment = {
        filename: `invoice-${invoice.invoice_number}.pdf`,
        content: buffer.toString('base64'),
        contentType: 'application/pdf',
      };
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // Continue without attachment if PDF generation fails
    }

    // Format currency helper
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: invoice.currency || 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    // Generate email content
    const emailContent = generateInvoiceEmail({
      invoiceNumber: invoice.invoice_number,
      tenantName: invoice.tenant?.name || invoice.billing_name,
      amount: formatCurrency(invoice.amount_total),
      dueDate: new Date(invoice.due_date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      lineItems: invoice.line_items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: formatCurrency(item.unit_price),
        amount: formatCurrency(item.amount),
      })),
      invoiceUrl: invoice.id ? `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}` : undefined,
    });

    // Send email
    try {
      const emailService = await getEmailService({
        provider: settings?.email_provider || 'mock',
        apiKey: settings?.email_api_key_encrypted,
      });

      const result = await emailService.sendEmail({
        to: emailTo,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        from: {
          email: settings?.smtp_from_email || 'noreply@hris.com',
          name: settings?.smtp_from_name || 'HRIS Platform',
        },
        attachments: pdfAttachment ? [pdfAttachment] : [],
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      console.log(`✅ Invoice email sent to ${emailTo}, messageId: ${result.messageId}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again or contact support.' },
        { status: 500 }
      );
    }

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
      // Email was sent, but status update failed - log this but don't fail the request
      console.warn('Invoice email sent but status update failed');
    }

    return NextResponse.json({
      data: updatedInvoice || invoice,
      message: `Invoice sent successfully to ${emailTo}`,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
