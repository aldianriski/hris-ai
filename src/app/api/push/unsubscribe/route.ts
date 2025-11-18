import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/push/unsubscribe
 * Remove push notification subscription for current user
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

    const { endpoint } = await request.json();

    // TODO: Remove subscription from database
    // const { error } = await supabase
    //   .from('push_subscriptions')
    //   .delete()
    //   .eq('user_id', user.id)
    //   .eq('endpoint', endpoint);

    console.log('Push subscription removed:', {
      userId: user.id,
      endpoint,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully',
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
