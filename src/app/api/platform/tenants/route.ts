import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * Validation schema for creating a tenant
 */
const createTenantSchema = z.object({
  // Step 1: Company Info
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(1, 'Currency is required'),

  // Step 2: Admin User
  adminFirstName: z.string().min(1, 'Admin first name is required'),
  adminLastName: z.string().min(1, 'Admin last name is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminPhone: z.string().nullable().optional(),
  sendWelcomeEmail: z.boolean().default(true),

  // Step 3: Subscription
  subscriptionPlan: z.enum(['trial', 'starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']),
  maxEmployees: z.number().int().positive(),
  trialDays: z.number().int().min(0).optional(),

  // Step 4: Initial Setup
  enabledModules: z.array(z.string()),
  loadSampleData: z.boolean().default(false),
  customDomain: z.string().nullable().optional(),
  primaryColor: z.string().nullable().optional(),
});

/**
 * GET /api/platform/tenants
 * List all tenants with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify platform admin access
    await requirePlatformAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const plan = searchParams.get('plan') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('tenants')
      .select('*, subscriptions(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,company_email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (plan) {
      query = query.eq('subscriptions.plan_id', plan);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data,
      count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to list tenants:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to list tenants',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/tenants
 * Create a new tenant with admin user and subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Verify platform admin access
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = createTenantSchema.parse(body);

    const supabase = await createClient();

    // Step 1: Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        company_name: validatedData.companyName,
        company_email: validatedData.adminEmail,
        industry: validatedData.industry,
        company_size: validatedData.companySize,
        country: validatedData.country,
        timezone: validatedData.timezone,
        currency: validatedData.currency,
        status: 'active',
        settings: {
          customDomain: validatedData.customDomain,
          primaryColor: validatedData.primaryColor,
          enabledModules: validatedData.enabledModules,
        },
        current_employee_count: 0,
        max_employees: validatedData.maxEmployees,
      })
      .select()
      .single();

    if (tenantError) {
      throw new Error(`Failed to create tenant: ${tenantError.message}`);
    }

    // Step 2: Create admin user in auth
    const tempPassword = generateTempPassword();
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.adminEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `${validatedData.adminFirstName} ${validatedData.adminLastName}`,
        phone: validatedData.adminPhone,
      },
    });

    if (authError) {
      // Rollback: delete tenant
      await supabase.from('tenants').delete().eq('id', tenant.id);
      throw new Error(`Failed to create admin user: ${authError.message}`);
    }

    // Step 3: Create tenant user record
    const { error: tenantUserError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        user_id: authUser.user.id,
        email: validatedData.adminEmail,
        full_name: `${validatedData.adminFirstName} ${validatedData.adminLastName}`,
        phone: validatedData.adminPhone,
        role: 'company_admin',
        is_active: true,
      });

    if (tenantUserError) {
      // Rollback: delete tenant and auth user
      await supabase.from('tenants').delete().eq('id', tenant.id);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create tenant user: ${tenantUserError.message}`);
    }

    // Step 4: Create subscription
    const trialEndDate = validatedData.trialDays
      ? new Date(Date.now() + validatedData.trialDays * 24 * 60 * 60 * 1000)
      : null;

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        tenant_id: tenant.id,
        plan_id: validatedData.subscriptionPlan,
        billing_cycle: validatedData.billingCycle,
        status: validatedData.subscriptionPlan === 'trial' ? 'trialing' : 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndDate?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial_end: trialEndDate?.toISOString(),
      });

    if (subscriptionError) {
      // Rollback: delete tenant, auth user, and tenant user
      await supabase.from('tenants').delete().eq('id', tenant.id);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
    }

    // Step 5: Send welcome email if requested
    if (validatedData.sendWelcomeEmail) {
      // TODO: Implement email sending
      console.log('Send welcome email to:', validatedData.adminEmail, 'with password:', tempPassword);
    }

    // Step 6: Load sample data if requested
    if (validatedData.loadSampleData) {
      // TODO: Implement sample data loading
      console.log('Load sample data for tenant:', tenant.id);
    }

    // Step 7: Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'tenant.created',
      resource_type: 'tenant',
      resource_id: tenant.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        companyName: validatedData.companyName,
        plan: validatedData.subscriptionPlan,
      },
    });

    return NextResponse.json(
      {
        tenant,
        adminEmail: validatedData.adminEmail,
        tempPassword: tempPassword, // In production, don't return this - send via email
        message: 'Tenant created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create tenant:', error);

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
        error: 'Failed to create tenant',
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
