/**
 * GET /api/v1/integrations
 * List available integrations in the marketplace
 */

import { NextRequest } from 'next/server';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { z } from 'zod';
import { PaginationSchema } from '@/lib/api/types';

const listIntegrationsSchema = z.object({
  ...PaginationSchema.shape,
  category: z.enum(['payroll', 'attendance', 'recruitment', 'communication', 'productivity', 'hr_tools']).optional(),
  featured: z.coerce.boolean().optional(),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listIntegrationsSchema.parse(params);

  try {
    // Available integrations in marketplace (static data - could be from database)
    const allIntegrations = [
      {
        id: 'slack',
        name: 'Slack',
        description: 'Send notifications and updates to Slack channels',
        category: 'communication',
        icon: 'https://cdn.example.com/slack-icon.png',
        featured: true,
        capabilities: ['notifications', 'webhooks'],
        configFields: [
          { name: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true },
          { name: 'defaultChannel', label: 'Default Channel', type: 'text', required: false },
        ],
      },
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Sync leave requests and events with Google Calendar',
        category: 'productivity',
        icon: 'https://cdn.example.com/google-calendar-icon.png',
        featured: true,
        capabilities: ['calendar_sync', 'event_creation'],
        configFields: [
          { name: 'apiKey', label: 'API Key', type: 'text', required: true },
          { name: 'calendarId', label: 'Calendar ID', type: 'text', required: true },
        ],
      },
      {
        id: 'bamboohr',
        name: 'BambooHR',
        description: 'Sync employee data with BambooHR',
        category: 'hr_tools',
        icon: 'https://cdn.example.com/bamboohr-icon.png',
        featured: false,
        capabilities: ['employee_sync', 'data_import'],
        configFields: [
          { name: 'subdomain', label: 'BambooHR Subdomain', type: 'text', required: true },
          { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        ],
      },
      {
        id: 'zoom',
        name: 'Zoom',
        description: 'Schedule and manage video meetings for interviews and reviews',
        category: 'communication',
        icon: 'https://cdn.example.com/zoom-icon.png',
        featured: true,
        capabilities: ['meeting_scheduling', 'video_conferencing'],
        configFields: [
          { name: 'apiKey', label: 'API Key', type: 'text', required: true },
          { name: 'apiSecret', label: 'API Secret', type: 'password', required: true },
        ],
      },
      {
        id: 'workday',
        name: 'Workday',
        description: 'Integrate with Workday HCM for enterprise HR management',
        category: 'hr_tools',
        icon: 'https://cdn.example.com/workday-icon.png',
        featured: false,
        capabilities: ['employee_sync', 'payroll_sync', 'benefits_sync'],
        configFields: [
          { name: 'tenant', label: 'Tenant Name', type: 'text', required: true },
          { name: 'username', label: 'Username', type: 'text', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
        ],
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        description: 'Send email notifications and payslips via SendGrid',
        category: 'communication',
        icon: 'https://cdn.example.com/sendgrid-icon.png',
        featured: true,
        capabilities: ['email_sending', 'templates'],
        configFields: [
          { name: 'apiKey', label: 'API Key', type: 'password', required: true },
          { name: 'fromEmail', label: 'From Email', type: 'email', required: true },
        ],
      },
    ];

    // Apply filters
    let filteredIntegrations = allIntegrations;

    if (validatedParams.category) {
      filteredIntegrations = filteredIntegrations.filter(i => i.category === validatedParams.category);
    }

    if (validatedParams.featured !== undefined) {
      filteredIntegrations = filteredIntegrations.filter(i => i.featured === validatedParams.featured);
    }

    // Apply pagination
    const from = (validatedParams.page - 1) * validatedParams.limit;
    const to = from + validatedParams.limit;
    const paginatedData = filteredIntegrations.slice(from, to);

    return paginatedResponse(
      paginatedData,
      filteredIntegrations.length,
      validatedParams.page,
      validatedParams.limit
    );
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch integrations',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
