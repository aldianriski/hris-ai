import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/cms/newsletter/subscribe
 * Subscribe to newsletter (Public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, source } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email address' } },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json(
          { success: false, error: { code: 'ALREADY_SUBSCRIBED', message: 'Email already subscribed' } },
          { status: 409 }
        );
      }

      // Reactivate if previously unsubscribed
      const { data: updated, error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'active',
          subscribed_at: new Date().toISOString(),
          source: source || 'website',
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Successfully resubscribed to newsletter',
      });
    }

    // Create new subscription
    const { data: subscriber, error: createError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        status: 'active',
        source: source || 'website',
        subscribed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;

    // TODO: Send welcome email
    // TODO: Add to email marketing platform (e.g., Mailchimp, SendGrid)

    return NextResponse.json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to newsletter',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { success: false, error: { code: 'NEWSLETTER_SUBSCRIBE_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/cms/newsletter/unsubscribe
 * Unsubscribe from newsletter (Public endpoint with token or email)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } },
        { status: 400 }
      );
    }

    // Update status to unsubscribed
    const { data: updated, error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Email not found in newsletter list' } },
          { status: 404 }
        );
      }
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error: any) {
    console.error('Error unsubscribing from newsletter:', error);
    return NextResponse.json(
      { success: false, error: { code: 'NEWSLETTER_UNSUBSCRIBE_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
