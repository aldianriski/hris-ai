import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

const updateAlertSchema = z.object({
  status: z.enum(['open', 'acknowledged', 'resolved', 'dismissed']).optional(),
  resolutionNotes: z.string().optional(),
});

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/platform/compliance-alerts/[id]
 * Update a compliance alert (acknowledge, resolve, dismiss)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = updateAlertSchema.parse(body);

    const supabase = await createClient();

    // Build update object
    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;

      if (validatedData.status === 'acknowledged') {
        updateData.acknowledged_at = new Date().toISOString();
        updateData.acknowledged_by = user.id;
      } else if (validatedData.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user.id;
      }
    }

    if (validatedData.resolutionNotes) {
      updateData.resolution_notes = validatedData.resolutionNotes;
    }

    const { data: alert, error } = await supabase
      .from('compliance_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
      }
      throw error;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: `compliance_alert.${validatedData.status || 'updated'}`,
      resource_type: 'compliance_alert',
      resource_id: id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: validatedData,
    });

    return NextResponse.json({
      alert,
      message: 'Compliance alert updated successfully',
    });
  } catch (error) {
    console.error('Failed to update compliance alert:', error);

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
        error: 'Failed to update compliance alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/compliance-alerts/[id]
 * Delete a compliance alert
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requirePlatformAdmin();

    const supabase = await createClient();

    const { data: alert, error } = await supabase
      .from('compliance_alerts')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
      }
      throw error;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'compliance_alert.deleted',
      resource_type: 'compliance_alert',
      resource_id: id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: { alertTitle: alert.title },
    });

    return NextResponse.json({
      message: 'Compliance alert deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete compliance alert:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Failed to delete compliance alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
