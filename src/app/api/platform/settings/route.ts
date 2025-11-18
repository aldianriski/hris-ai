import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/platform/settings
 * Get platform settings (singleton)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions - only super_admin can view settings
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Fetch settings
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single();

    if (error) {
      console.error('Error fetching platform settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch platform settings' },
        { status: 500 }
      );
    }

    // Remove sensitive encrypted fields from response
    if (data) {
      const sanitized = { ...data };
      delete sanitized.smtp_password_encrypted;
      delete sanitized.email_api_key_encrypted;
      delete sanitized.ai_api_key_encrypted;
      delete sanitized.stripe_secret_key_encrypted;
      delete sanitized.stripe_webhook_secret_encrypted;
      delete sanitized.midtrans_server_key_encrypted;

      return NextResponse.json({ data: sanitized });
    }

    return NextResponse.json({ data: null });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/settings
 * Update platform settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions - only super_admin can update settings
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    const body = await request.json();

    // Build update object - prevent updating id or created_at
    const updates: Record<string, unknown> = {};

    // General Settings
    if (body.platform_name !== undefined) updates.platform_name = body.platform_name;
    if (body.platform_logo_url !== undefined) updates.platform_logo_url = body.platform_logo_url;
    if (body.support_email !== undefined) updates.support_email = body.support_email;
    if (body.support_phone !== undefined) updates.support_phone = body.support_phone;
    if (body.default_timezone !== undefined) updates.default_timezone = body.default_timezone;
    if (body.default_language !== undefined) updates.default_language = body.default_language;
    if (body.maintenance_mode !== undefined) updates.maintenance_mode = body.maintenance_mode;
    if (body.maintenance_message !== undefined) updates.maintenance_message = body.maintenance_message;

    // Security Settings
    if (body.password_min_length !== undefined) updates.password_min_length = body.password_min_length;
    if (body.password_require_uppercase !== undefined) updates.password_require_uppercase = body.password_require_uppercase;
    if (body.password_require_lowercase !== undefined) updates.password_require_lowercase = body.password_require_lowercase;
    if (body.password_require_numbers !== undefined) updates.password_require_numbers = body.password_require_numbers;
    if (body.password_require_special !== undefined) updates.password_require_special = body.password_require_special;
    if (body.password_expiry_days !== undefined) updates.password_expiry_days = body.password_expiry_days;
    if (body.session_timeout_minutes !== undefined) updates.session_timeout_minutes = body.session_timeout_minutes;
    if (body.max_login_attempts !== undefined) updates.max_login_attempts = body.max_login_attempts;
    if (body.lockout_duration_minutes !== undefined) updates.lockout_duration_minutes = body.lockout_duration_minutes;
    if (body.enforce_mfa !== undefined) updates.enforce_mfa = body.enforce_mfa;
    if (body.allowed_email_domains !== undefined) updates.allowed_email_domains = body.allowed_email_domains;

    // Email Configuration
    if (body.smtp_host !== undefined) updates.smtp_host = body.smtp_host;
    if (body.smtp_port !== undefined) updates.smtp_port = body.smtp_port;
    if (body.smtp_username !== undefined) updates.smtp_username = body.smtp_username;
    if (body.smtp_from_email !== undefined) updates.smtp_from_email = body.smtp_from_email;
    if (body.smtp_from_name !== undefined) updates.smtp_from_name = body.smtp_from_name;
    if (body.smtp_use_tls !== undefined) updates.smtp_use_tls = body.smtp_use_tls;
    if (body.email_provider !== undefined) updates.email_provider = body.email_provider;

    // AI Settings
    if (body.ai_enabled !== undefined) updates.ai_enabled = body.ai_enabled;
    if (body.ai_provider !== undefined) updates.ai_provider = body.ai_provider;
    if (body.ai_model !== undefined) updates.ai_model = body.ai_model;
    if (body.ai_max_tokens !== undefined) updates.ai_max_tokens = body.ai_max_tokens;
    if (body.ai_temperature !== undefined) updates.ai_temperature = body.ai_temperature;

    // Payment Gateway Settings
    if (body.payment_gateway !== undefined) updates.payment_gateway = body.payment_gateway;
    if (body.payment_gateway_mode !== undefined) updates.payment_gateway_mode = body.payment_gateway_mode;
    if (body.stripe_publishable_key !== undefined) updates.stripe_publishable_key = body.stripe_publishable_key;
    if (body.midtrans_client_key !== undefined) updates.midtrans_client_key = body.midtrans_client_key;

    // System Limits
    if (body.max_tenants !== undefined) updates.max_tenants = body.max_tenants;
    if (body.max_users_per_tenant !== undefined) updates.max_users_per_tenant = body.max_users_per_tenant;
    if (body.max_file_upload_mb !== undefined) updates.max_file_upload_mb = body.max_file_upload_mb;
    if (body.max_storage_gb_per_tenant !== undefined) updates.max_storage_gb_per_tenant = body.max_storage_gb_per_tenant;

    // Feature Toggles
    if (body.enable_new_tenant_registration !== undefined) updates.enable_new_tenant_registration = body.enable_new_tenant_registration;
    if (body.enable_sso !== undefined) updates.enable_sso = body.enable_sso;
    if (body.enable_api_access !== undefined) updates.enable_api_access = body.enable_api_access;
    if (body.enable_webhooks !== undefined) updates.enable_webhooks = body.enable_webhooks;
    if (body.enable_audit_logs !== undefined) updates.enable_audit_logs = body.enable_audit_logs;

    // Billing Settings
    if (body.tax_rate !== undefined) updates.tax_rate = body.tax_rate;
    if (body.tax_name !== undefined) updates.tax_name = body.tax_name;
    if (body.currency_code !== undefined) updates.currency_code = body.currency_code;
    if (body.billing_cycle_day !== undefined) updates.billing_cycle_day = body.billing_cycle_day;
    if (body.trial_period_days !== undefined) updates.trial_period_days = body.trial_period_days;
    if (body.grace_period_days !== undefined) updates.grace_period_days = body.grace_period_days;

    // Set updated_by
    updates.updated_by = user.id;

    // Note: In production, sensitive fields like API keys and passwords should be encrypted
    // For now, we'll handle them as plain text but mark them as encrypted in the schema
    if (body.smtp_password !== undefined) updates.smtp_password_encrypted = body.smtp_password;
    if (body.email_api_key !== undefined) updates.email_api_key_encrypted = body.email_api_key;
    if (body.ai_api_key !== undefined) updates.ai_api_key_encrypted = body.ai_api_key;
    if (body.stripe_secret_key !== undefined) updates.stripe_secret_key_encrypted = body.stripe_secret_key;
    if (body.stripe_webhook_secret !== undefined) updates.stripe_webhook_secret_encrypted = body.stripe_webhook_secret;
    if (body.midtrans_server_key !== undefined) updates.midtrans_server_key_encrypted = body.midtrans_server_key;

    // Update settings
    const { data, error } = await supabase
      .from('platform_settings')
      .update(updates)
      .eq('id', SETTINGS_ID)
      .select()
      .single();

    if (error) {
      console.error('Error updating platform settings:', error);
      return NextResponse.json(
        { error: 'Failed to update platform settings' },
        { status: 500 }
      );
    }

    // Remove sensitive fields from response
    const sanitized = { ...data };
    delete sanitized.smtp_password_encrypted;
    delete sanitized.email_api_key_encrypted;
    delete sanitized.ai_api_key_encrypted;
    delete sanitized.stripe_secret_key_encrypted;
    delete sanitized.stripe_webhook_secret_encrypted;
    delete sanitized.midtrans_server_key_encrypted;

    return NextResponse.json({ data: sanitized });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
