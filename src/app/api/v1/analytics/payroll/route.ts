/**
 * GET /api/v1/analytics/payroll
 * Get payroll analytics (costs, trends, distribution, etc.)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireHR } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const payrollAnalyticsSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  department: z.string().optional(),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  // Only HR and above can access payroll analytics
  const userContext = await requireHR(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = payrollAnalyticsSchema.parse(params);

  const supabase = await createClient();

  try {
    const year = validatedParams.year || new Date().getFullYear();

    // Get payroll periods for the year
    const { data: payrollPeriods, error } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('employer_id', userContext.companyId)
      .eq('year', year)
      .order('month', { ascending: true });

    if (error) {
      throw error;
    }

    // Calculate total payroll costs
    const totalGrossSalary = payrollPeriods?.reduce((sum, p) => sum + (p.total_gross_salary || 0), 0) || 0;
    const totalDeductions = payrollPeriods?.reduce((sum, p) => sum + (p.total_deductions || 0), 0) || 0;
    const totalNetSalary = payrollPeriods?.reduce((sum, p) => sum + (p.total_net_salary || 0), 0) || 0;

    // Monthly trend
    const monthlyTrend: Record<number, {
      grossSalary: number;
      deductions: number;
      netSalary: number;
      employeeCount: number;
      status: string;
    }> = {};

    for (let m = 1; m <= 12; m++) {
      monthlyTrend[m] = {
        grossSalary: 0,
        deductions: 0,
        netSalary: 0,
        employeeCount: 0,
        status: 'draft',
      };
    }

    payrollPeriods?.forEach(period => {
      monthlyTrend[period.month] = {
        grossSalary: period.total_gross_salary || 0,
        deductions: period.total_deductions || 0,
        netSalary: period.total_net_salary || 0,
        employeeCount: period.total_employees || 0,
        status: period.status,
      };
    });

    // Get payroll details for department breakdown
    const periodIds = payrollPeriods?.map(p => p.id) || [];
    const { data: payrollDetails } = periodIds.length > 0
      ? await supabase
          .from('payroll_details')
          .select('*')
          .in('period_id', periodIds)
      : { data: null };

    // Department breakdown (simplified - would need to join with employees for actual department)
    const employeePayroll: Record<string, {
      grossSalary: number;
      netSalary: number;
      count: number;
    }> = {};

    payrollDetails?.forEach(detail => {
      const employeeId = detail.employee_id;
      if (!employeePayroll[employeeId]) {
        employeePayroll[employeeId] = {
          grossSalary: 0,
          netSalary: 0,
          count: 0,
        };
      }
      employeePayroll[employeeId].grossSalary += detail.gross_salary || 0;
      employeePayroll[employeeId].netSalary += detail.net_salary || 0;
      employeePayroll[employeeId].count++;
    });

    // Calculate average salaries
    const employeeCount = Object.keys(employeePayroll).length;
    const averageGrossSalary = employeeCount > 0
      ? Math.round(totalGrossSalary / employeeCount)
      : 0;
    const averageNetSalary = employeeCount > 0
      ? Math.round(totalNetSalary / employeeCount)
      : 0;

    // Deduction breakdown (simplified)
    const totalBPJSKesehatan = payrollDetails?.reduce((sum, d) => sum + (d.bpjs_kesehatan || 0), 0) || 0;
    const totalBPJSJHT = payrollDetails?.reduce((sum, d) => sum + (d.bpjs_jht || 0), 0) || 0;
    const totalBPJSJP = payrollDetails?.reduce((sum, d) => sum + (d.bpjs_jp || 0), 0) || 0;
    const totalPPh21 = payrollDetails?.reduce((sum, d) => sum + (d.pph21 || 0), 0) || 0;

    const analytics = {
      year,
      summary: {
        totalGrossSalary,
        totalDeductions,
        totalNetSalary,
        averageGrossSalary,
        averageNetSalary,
        employeeCount,
      },
      deductions: {
        bpjsKesehatan: totalBPJSKesehatan,
        bpjsJHT: totalBPJSJHT,
        bpjsJP: totalBPJSJP,
        pph21: totalPPh21,
        total: totalDeductions,
      },
      trends: {
        monthly: monthlyTrend,
      },
      periods: {
        total: payrollPeriods?.length || 0,
        draft: payrollPeriods?.filter(p => p.status === 'draft').length || 0,
        processing: payrollPeriods?.filter(p => p.status === 'processing').length || 0,
        approved: payrollPeriods?.filter(p => p.status === 'approved').length || 0,
        paid: payrollPeriods?.filter(p => p.status === 'paid').length || 0,
      },
      lastUpdated: new Date().toISOString(),
    };

    return successResponse(analytics);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch payroll analytics',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
