import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for payment processing
 *
 * Stripe events handled:
 * - payment_intent.succeeded - Payment completed
 * - payment_intent.payment_failed - Payment failed
 * - invoice.paid - Stripe invoice paid
 * - invoice.payment_failed - Stripe invoice payment failed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // TODO: In production, verify the webhook signature using Stripe webhook secret
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // For now, parse the JSON body directly
    const event = JSON.parse(body);

    console.log(`📦 Stripe webhook received: ${event.type}`);

    const supabase = await createClient();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

        // Look up invoice by payment intent ID or metadata
        const invoiceId = paymentIntent.metadata?.invoice_id;

        if (invoiceId) {
          await updateInvoiceStatus(supabase, invoiceId, 'paid', {
            payment_method: 'stripe',
            payment_transaction_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);

        const invoiceId = paymentIntent.metadata?.invoice_id;
        if (invoiceId) {
          console.log(`Payment failed for invoice ${invoiceId}`);
          // Optionally send notification to customer
        }
        break;
      }

      case 'invoice.paid': {
        const stripeInvoice = event.data.object;
        console.log(`✅ Stripe invoice paid: ${stripeInvoice.id}`);

        // Handle Stripe's own invoice system if you're using Stripe Billing
        const invoiceId = stripeInvoice.metadata?.hris_invoice_id;
        if (invoiceId) {
          await updateInvoiceStatus(supabase, invoiceId, 'paid', {
            payment_method: 'stripe',
            payment_transaction_id: stripeInvoice.payment_intent,
            paid_at: new Date(stripeInvoice.status_transitions.paid_at * 1000).toISOString(),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const stripeInvoice = event.data.object;
        console.log(`❌ Stripe invoice payment failed: ${stripeInvoice.id}`);

        const invoiceId = stripeInvoice.metadata?.hris_invoice_id;
        if (invoiceId) {
          console.log(`Payment failed for HRIS invoice ${invoiceId}`);
          // Update invoice status to overdue if past due date
          await checkAndMarkOverdue(supabase, invoiceId);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log(`💰 Refund processed: ${charge.id}`);

        // Find invoice by charge ID and mark as refunded
        const invoiceId = charge.metadata?.invoice_id;
        if (invoiceId) {
          await updateInvoiceStatus(supabase, invoiceId, 'refunded', {
            refund_transaction_id: charge.id,
            refunded_at: new Date().toISOString(),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
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
