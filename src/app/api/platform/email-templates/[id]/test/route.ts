import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { getEmailService } from '@/lib/email/email-service';
import { z } from 'zod';

const testEmailSchema = z.object({
  toEmail: z.string().email(),
  previewData: z.record(z.string()).optional(),
});

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/platform/email-templates/[id]/test
 * Send a test email using the template
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const { toEmail, previewData } = testEmailSchema.parse(body);

    const supabase = await createClient();

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Use provided preview data or template's default preview data
    const data = previewData || template.preview_data || {};

    // Replace variables in subject and content
    let subject = template.subject;
    let htmlContent = template.html_content;
    let textContent = template.plain_text_content || '';

    // Replace all variables
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replaceAll(placeholder, String(value));
      htmlContent = htmlContent.replaceAll(placeholder, String(value));
      textContent = textContent.replaceAll(placeholder, String(value));
    });

    // Get platform email settings
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('email_provider, email_api_key_encrypted, smtp_from_email, smtp_from_name')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    // Send email
    const emailService = await getEmailService({
      provider: settings?.email_provider || 'mock',
      apiKey: settings?.email_api_key_encrypted,
    });

    const result = await emailService.sendEmail({
      to: toEmail,
      subject: `[TEST] ${subject}`,
      html: `
        <div style="border: 3px dashed #f59e0b; padding: 20px; margin-bottom: 20px; background: #fef3c7;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ TEST EMAIL</p>
          <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
            This is a test email sent from template: <strong>${template.name}</strong>
          </p>
        </div>
        ${htmlContent}
      `,
      text: `***** TEST EMAIL *****\nThis is a test email sent from template: ${template.name}\n\n${textContent}`,
      from: {
        email: settings?.smtp_from_email || 'noreply@hris.com',
        name: settings?.smtp_from_name || 'HRIS Platform',
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send test email' },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'email_template.test_sent',
      resource_type: 'email_template',
      resource_id: id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: { toEmail, templateName: template.name },
    });

    return NextResponse.json({
      message: `Test email sent successfully to ${toEmail}`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Failed to send test email:', error);

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
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
