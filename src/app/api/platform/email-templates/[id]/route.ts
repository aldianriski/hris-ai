import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * Validation schema for updating email templates
 */
const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(['transactional', 'marketing', 'billing']).optional(),
  subject: z.string().min(1).optional(),
  htmlContent: z.string().min(1).optional(),
  plainTextContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
  previewData: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/platform/email-templates/[id]
 * Get a single email template
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await requirePlatformAdmin();

    const supabase = await createClient();

    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Failed to get email template:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Failed to get email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/email-templates/[id]
 * Update an email template
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = updateTemplateSchema.parse(body);

    const supabase = await createClient();

    // Build update object
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.category) updateData.category = validatedData.category;
    if (validatedData.subject) updateData.subject = validatedData.subject;
    if (validatedData.htmlContent) updateData.html_content = validatedData.htmlContent;
    if (validatedData.plainTextContent !== undefined) updateData.plain_text_content = validatedData.plainTextContent;
    if (validatedData.variables) updateData.variables = validatedData.variables;
    if (validatedData.previewData) updateData.preview_data = validatedData.previewData;
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive;
    updateData.last_modified_by = user.id;
    updateData.version = supabase.rpc('increment', { row_id: id });

    const { data: template, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'email_template.updated',
      resource_type: 'email_template',
      resource_id: id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: validatedData,
    });

    return NextResponse.json({
      template,
      message: 'Email template updated successfully',
    });
  } catch (error) {
    console.error('Failed to update email template:', error);

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
        error: 'Failed to update email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/email-templates/[id]
 * Delete an email template (only non-system templates)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requirePlatformAdmin();

    const supabase = await createClient();

    // Check if it's a system template
    const { data: template } = await supabase
      .from('email_templates')
      .select('is_system_template, name')
      .eq('id', id)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (template.is_system_template) {
      return NextResponse.json(
        { error: 'System templates cannot be deleted' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'email_template.deleted',
      resource_type: 'email_template',
      resource_id: id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: { templateName: template.name },
    });

    return NextResponse.json({
      message: 'Email template deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete email template:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Failed to delete email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
