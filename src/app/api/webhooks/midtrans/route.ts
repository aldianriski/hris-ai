import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

/**
 * POST /api/webhooks/midtrans
 * Handle Midtrans webhook notifications for payment processing
 *
 * Midtrans transaction statuses:
 * - capture - Card transaction successful
 * - settlement - Payment settled
 * - pending - Payment pending
 * - deny - Payment denied
 * - cancel - Payment cancelled
 * - expire - Payment expired
 * - refund - Payment refunded
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(`📦 Midtrans webhook received: ${body.transaction_status}`);

    // Verify signature (in production)
    // const serverKey = process.env.MIDTRANS_SERVER_KEY;
    // const signatureKey = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
    // const hash = crypto.createHash('sha512').update(signatureKey).digest('hex');
    //
    // if (hash !== body.signature_key) {
    //   console.error('Invalid Midtrans signature');
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const supabase = await createClient();

    // Extract invoice ID from order_id
    // Format: INV-2024-01-0001 or custom format with invoice ID
    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    // Find invoice by invoice_number or order_id
    const { data: invoice, error: findError } = await supabase
      .from('invoices')
      .select('id, status, amount_total')
      .or(`invoice_number.eq.${orderId},payment_order_id.eq.${orderId}`)
      .single();

    if (findError || !invoice) {
      console.error(`Invoice not found for order ${orderId}`);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoiceId = invoice.id;

    // Handle different transaction statuses
    switch (transactionStatus) {
      case 'capture':
        // For card transactions
        if (fraudStatus === 'accept') {
          await updateInvoiceStatus(supabase, invoiceId, 'paid', {
            payment_method: 'midtrans',
            payment_transaction_id: body.transaction_id,
            paid_at: new Date().toISOString(),
            payment_type: body.payment_type,
          });
        } else if (fraudStatus === 'challenge') {
          console.log(`Payment challenge for invoice ${invoiceId}`);
          // Keep as pending, await manual review
        }
        break;

      case 'settlement':
        // Payment successfully settled
        await updateInvoiceStatus(supabase, invoiceId, 'paid', {
          payment_method: 'midtrans',
          payment_transaction_id: body.transaction_id,
          paid_at: new Date(body.settlement_time || body.transaction_time).toISOString(),
          payment_type: body.payment_type,
        });
        break;

      case 'pending':
        console.log(`Payment pending for invoice ${invoiceId}`);
        // Update metadata but keep status
        await supabase
          .from('invoices')
          .update({
            payment_transaction_id: body.transaction_id,
            payment_type: body.payment_type,
          })
          .eq('id', invoiceId);
        break;

      case 'deny':
        console.log(`❌ Payment denied for invoice ${invoiceId}`);
        // Payment was denied, invoice remains unpaid
        break;

      case 'cancel':
      case 'expire':
        console.log(`Payment ${transactionStatus} for invoice ${invoiceId}`);
        // Check if invoice is now overdue
        await checkAndMarkOverdue(supabase, invoiceId);
        break;

      case 'refund':
      case 'partial_refund':
        await updateInvoiceStatus(supabase, invoiceId, 'refunded', {
          refund_transaction_id: body.transaction_id,
          refunded_at: new Date().toISOString(),
          refund_amount: body.refund_amount,
        });
        break;

      default:
        console.log(`Unhandled Midtrans status: ${transactionStatus}`);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Update invoice status and payment details
 */
async function updateInvoiceStatus(
  supabase: any,
  invoiceId: string,
  status: string,
  paymentDetails: any
) {
  const { data, error } = await supabase
    .from('invoices')
    .update({
      status,
      ...paymentDetails,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error(`Failed to update invoice ${invoiceId}:`, error);
    throw error;
  }

  console.log(`✅ Invoice ${invoiceId} updated to status: ${status}`);

  // TODO: Send payment confirmation email to customer
  // await sendPaymentConfirmationEmail(data);

  return data;
}

/**
 * Check if invoice is overdue and mark it
 */
async function checkAndMarkOverdue(supabase: any, invoiceId: string) {
  const { data: invoice } = await supabase
    .from('invoices')
    .select('due_date, status')
    .eq('id', invoiceId)
    .single();

  if (invoice && invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()) {
    await updateInvoiceStatus(supabase, invoiceId, 'overdue', {});
  }
}
