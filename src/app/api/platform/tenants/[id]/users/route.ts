import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Validation schema for creating a tenant user
 */
const createTenantUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().nullable().optional(),
  role: z.enum(['company_admin', 'hr_admin', 'payroll_admin', 'manager', 'employee']),
  sendWelcomeEmail: z.boolean().default(true),
});

/**
 * GET /api/platform/tenants/[id]/users
 * List all users for a tenant
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    await requirePlatformAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const isActive = searchParams.get('isActive');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('tenant_users')
      .select('*')
      .eq('tenant_id', params.id)
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
    console.error('Failed to list tenant users:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to list tenant users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/tenants/[id]/users
 * Create a new user for a tenant
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = createTenantUserSchema.parse(body);

    const supabase = await createClient();

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create user in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: validatedData.fullName,
        phone: validatedData.phone,
      },
    });

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    // Create tenant user record
    const { data: tenantUser, error: tenantUserError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: params.id,
        user_id: authUser.user.id,
        email: validatedData.email,
        full_name: validatedData.fullName,
        phone: validatedData.phone,
        role: validatedData.role,
        is_active: true,
      })
      .select()
      .single();

    if (tenantUserError) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create tenant user: ${tenantUserError.message}`);
    }

    // Send welcome email if requested
    if (validatedData.sendWelcomeEmail) {
      // TODO: Implement email sending
      console.log('Send welcome email to:', validatedData.email, 'with password:', tempPassword);
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'tenant_user.created',
      resource_type: 'tenant_user',
      resource_id: tenantUser.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        tenantId: params.id,
        email: validatedData.email,
        role: validatedData.role,
      },
    });

    return NextResponse.json(
      {
        user: tenantUser,
        tempPassword: tempPassword, // In production, don't return this
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create tenant user:', error);

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
        error: 'Failed to create tenant user',
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
