/**
 * POST /api/v1/payroll/periods/:id/process
 * Process payroll for a period (calculate all employee payrolls)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireHR } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logPayrollAction } from '@/lib/utils/auditLog';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  const userContext = await requireHR(request);
  const { id } = params;

  const supabase = await createClient();

  // Get the payroll period
  const { data: period, error: fetchError } = await supabase
    .from('payroll_periods')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !period) {
    return notFoundResponse('Payroll period');
  }

  if (period.status !== 'draft') {
    return errorResponse(
      'BIZ_4004',
      `Payroll period is already ${period.status}`,
      400
    );
  }

  // Get all active employees
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('employer_id', userContext.companyId)
    .eq('employment_status', 'active');

  if (empError) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch employees',
      500,
      { details: empError.message }
    );
  }

  // Calculate payroll for each employee
  const payrollDetails = [];
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  for (const emp of employees || []) {
    const baseSalary = emp.salary || 0;

    // Simple calculation (can be enhanced with more complex logic)
    const allowances = baseSalary * 0.1; // 10% allowances
    const overtime = 0; // TODO: Calculate from attendance
    const grossSalary = baseSalary + allowances + overtime;

    // Deductions (Indonesian tax/BPJS simplified)
    const bpjsKesehatan = grossSalary * 0.01; // 1%
    const bpjsJHT = grossSalary * 0.02; // 2%
    const bpjsJP = grossSalary * 0.01; // 1%
    const pph21 = grossSalary * 0.05; // 5% simplified
    const deductions = bpjsKesehatan + bpjsJHT + bpjsJP + pph21;

    const netSalary = grossSalary - deductions;

    payrollDetails.push({
      period_id: period.id,
      employee_id: emp.id,
      employee_name: emp.full_name,
      employee_number: emp.employee_number,
      base_salary: baseSalary,
      allowances,
      overtime,
      gross_salary: grossSalary,
      bpjs_kesehatan: bpjsKesehatan,
      bpjs_jht: bpjsJHT,
      bpjs_jp: bpjsJP,
      pph21,
      other_deductions: 0,
      total_deductions: deductions,
      net_salary: netSalary,
      status: 'draft',
    });

    totalGross += grossSalary;
    totalDeductions += deductions;
    totalNet += netSalary;
  }

  // Insert payroll details
  const { error: insertError } = await supabase
    .from('payroll_details')
    .insert(payrollDetails);

  if (insertError) {
    return errorResponse(
      'SRV_9002',
      'Failed to process payroll',
      500,
      { details: insertError.message }
    );
  }

  // Update period totals and status
  const { data: updatedPeriod, error: updateError } = await supabase
    .from('payroll_periods')
    .update({
      status: 'processing',
      total_employees: employees?.length || 0,
      total_gross_salary: Math.round(totalGross * 100) / 100,
      total_deductions: Math.round(totalDeductions * 100) / 100,
      total_net_salary: Math.round(totalNet * 100) / 100,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return errorResponse(
      'SRV_9002',
      'Failed to update payroll period',
      500,
      { details: updateError.message }
    );
  }

  // Log payroll processing
  await logPayrollAction(
    userContext,
    request,
    'processed',
    updatedPeriod.id,
    {
      totalEmployees: employees?.length,
      totalGross,
      totalNet,
    }
  );

  return successResponse({
    period: updatedPeriod,
    processedEmployees: employees?.length,
    totalGrossSalary: totalGross,
    totalNetSalary: totalNet,
  });
}

export const POST = withErrorHandler(handler);
