import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * Validation schema for creating/updating email templates
 */
const emailTemplateSchema = z.object({
  key: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['transactional', 'marketing', 'billing']),
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  plainTextContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
  previewData: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/platform/email-templates
 * Get all email templates
 */
export async function GET(request: NextRequest) {
  try {
    // Verify platform admin access
    await requirePlatformAdmin();

    const supabase = await createClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    // Build query
    let query = supabase
      .from('email_templates')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: templates, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      templates: templates || [],
    });
  } catch (error) {
    console.error('Failed to get email templates:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to get email templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/email-templates
 * Create a new email template
 */
export async function POST(request: NextRequest) {
  try {
    // Verify platform admin access
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = emailTemplateSchema.parse(body);

    const supabase = await createClient();

    // Create template
    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        key: validatedData.key,
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        subject: validatedData.subject,
        html_content: validatedData.htmlContent,
        plain_text_content: validatedData.plainTextContent,
        variables: validatedData.variables || [],
        preview_data: validatedData.previewData || {},
        is_active: validatedData.isActive ?? true,
        is_system_template: false,
        last_modified_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Template key already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'email_template.created',
      resource_type: 'email_template',
      resource_id: template.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: { templateName: template.name },
    });

    return NextResponse.json({
      template,
      message: 'Email template created successfully',
    });
  } catch (error) {
    console.error('Failed to create email template:', error);

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
        error: 'Failed to create email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
