import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/push/subscribe
 * Save push notification subscription for current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    // TODO: Create push_subscriptions table in database
    // For now, just log it
    console.log('Push subscription received:', {
      userId: user.id,
      endpoint: subscription.endpoint,
    });

    // TODO: Save subscription to database
    // const { error } = await supabase.from('push_subscriptions').upsert({
    //   user_id: user.id,
    //   subscription: subscription,
    //   endpoint: subscription.endpoint,
    //   created_at: new Date().toISOString(),
    // });

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
    });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
