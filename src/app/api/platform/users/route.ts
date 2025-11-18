import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * Validation schema for creating a platform user
 */
const createPlatformUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['super_admin', 'platform_admin', 'support_admin', 'billing_admin']),
  sendInviteEmail: z.boolean().default(true),
});

/**
 * GET /api/platform/users
 * List all platform users with filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const isActive = searchParams.get('isActive');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('platform_users')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to list platform users:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to list platform users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/users
 * Create and invite a new platform user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    // Only super_admin and platform_admin can create users
    const supabase = await createClient();
    const { data: adminUser } = await supabase
      .from('platform_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (!adminUser || !['super_admin', 'platform_admin'].includes(adminUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins and platform admins can create users' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createPlatformUserSchema.parse(body);

    // Super admin role can only be created by another super admin
    if (validatedData.role === 'super_admin' && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins can create other super admins' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create user in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: tempPassword,
      email_confirm: !validatedData.sendInviteEmail, // Auto-confirm if not sending invite
      user_metadata: {
        full_name: validatedData.fullName,
      },
    });

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    // Create platform user record
    const { data: platformUser, error: platformUserError } = await supabase
      .from('platform_users')
      .insert({
        user_id: authUser.user.id,
        email: validatedData.email,
        full_name: validatedData.fullName,
        role: validatedData.role,
        is_active: true,
      })
      .select()
      .single();

    if (platformUserError) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create platform user: ${platformUserError.message}`);
    }

    // Send invite email if requested
    if (validatedData.sendInviteEmail) {
      // TODO: Implement email sending
      console.log('Send invite email to:', validatedData.email, 'with password:', tempPassword);
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: 'platform_user.created',
      resource_type: 'platform_user',
      resource_id: platformUser.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        email: validatedData.email,
        role: validatedData.role,
      },
    });

    return NextResponse.json(
      {
        user: platformUser,
        tempPassword: tempPassword, // In production, don't return this
        message: 'Platform user created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create platform user:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to create platform user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a temporary password for new users
 */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
