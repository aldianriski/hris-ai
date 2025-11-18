import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * GET /api/platform/compliance-alerts
 * Get all compliance alerts with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const supabase = await createClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const tenantId = searchParams.get('tenantId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = supabase
      .from('compliance_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data: alerts, error } = await query;

    if (error) {
      throw error;
    }

    // Get summary statistics
    const { data: summaryData } = await supabase
      .from('compliance_alerts')
      .select('severity, status');

    const summary = {
      total: summaryData?.length || 0,
      open: summaryData?.filter(a => a.status === 'open').length || 0,
      critical: summaryData?.filter(a => a.severity === 'critical').length || 0,
      warning: summaryData?.filter(a => a.severity === 'warning').length || 0,
      info: summaryData?.filter(a => a.severity === 'info').length || 0,
      bySeverity: {
        critical: summaryData?.filter(a => a.severity === 'critical' && a.status === 'open').length || 0,
        warning: summaryData?.filter(a => a.severity === 'warning' && a.status === 'open').length || 0,
        info: summaryData?.filter(a => a.severity === 'info' && a.status === 'open').length || 0,
      },
    };

    return NextResponse.json({
      alerts: alerts || [],
      summary,
    });
  } catch (error) {
    console.error('Failed to get compliance alerts:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to get compliance alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/compliance-alerts
 * Create a new compliance alert (typically used by automated systems)
 */
const createAlertSchema = z.object({
  alertType: z.string().min(1),
  severity: z.enum(['info', 'warning', 'critical']),
  title: z.string().min(1),
  description: z.string().optional(),
  tenantId: z.string().uuid(),
  affectedResourceType: z.string().optional(),
  affectedResourceId: z.string().uuid().optional(),
  affectedCount: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
  dueDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = createAlertSchema.parse(body);

    const supabase = await createClient();

    // Get tenant name
    const { data: tenant } = await supabase
      .from('tenants')
      .select('company_name')
      .eq('id', validatedData.tenantId)
      .single();

    // Create alert
    const { data: alert, error } = await supabase
      .from('compliance_alerts')
      .insert({
        alert_type: validatedData.alertType,
        severity: validatedData.severity,
        title: validatedData.title,
        description: validatedData.description,
        tenant_id: validatedData.tenantId,
        tenant_name: tenant?.company_name,
        affected_resource_type: validatedData.affectedResourceType,
        affected_resource_id: validatedData.affectedResourceId,
        affected_count: validatedData.affectedCount || 1,
        metadata: validatedData.metadata || {},
        due_date: validatedData.dueDate,
        auto_detected: false, // Manual creation
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'compliance_alert.created',
      resource_type: 'compliance_alert',
      resource_id: alert.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: { alertTitle: alert.title, tenantName: tenant?.company_name },
    });

    return NextResponse.json({
      alert,
      message: 'Compliance alert created successfully',
    });
  } catch (error) {
    console.error('Failed to create compliance alert:', error);

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

    return NextResponse.json(
      {
        error: 'Failed to create compliance alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
