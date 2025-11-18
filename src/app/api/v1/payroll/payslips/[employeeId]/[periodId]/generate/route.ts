/**
 * POST /api/v1/payroll/payslips/:employeeId/:periodId/generate
 * Generate payslip for an employee in a specific period
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, checkEmployeeAccess } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { logPayrollAction } from '@/lib/utils/auditLog';

async function handler(
  request: NextRequest,
  { params }: { params: { employeeId: string; periodId: string } }
) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);
  const { employeeId, periodId } = params;

  // Check if user can access this employee's payslips
  // Employees can only generate their own, HR/Admin can generate for all
  if (!checkEmployeeAccess(userContext, employeeId)) {
    return errorResponse(
      'AUTH_1004',
      'You do not have permission to generate this employee\'s payslip',
      403
    );
  }

  const supabase = await createClient();

  // Verify employee belongs to company
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, full_name, employer_id, position, department')
    .eq('id', employeeId)
    .single();

  if (employeeError || !employee) {
    return notFoundResponse('Employee');
  }

  if (employee.employer_id !== userContext.companyId) {
    return errorResponse(
      'AUTH_1004',
      'Employee does not belong to your company',
      403
    );
  }

  // Get payroll period
  const { data: period, error: periodError } = await supabase
    .from('payroll_periods')
    .select('*')
    .eq('id', periodId)
    .eq('employer_id', userContext.companyId)
    .single();

  if (periodError || !period) {
    return notFoundResponse('Payroll period');
  }

  // Check if period is approved (can only generate payslips for approved periods)
  if (period.status !== 'approved' && period.status !== 'paid') {
    return errorResponse(
      'BIZ_4004',
      `Payslips can only be generated for approved or paid periods. Current status: ${period.status}`,
      400
    );
  }

  // Get payroll detail for this employee and period
  const { data: payrollDetail, error: detailError } = await supabase
    .from('payroll_details')
    .select('*')
    .eq('period_id', periodId)
    .eq('employee_id', employeeId)
    .single();

  if (detailError || !payrollDetail) {
    return errorResponse(
      'RES_3001',
      'Payroll detail not found for this employee and period',
      404
    );
  }

  // Check if payslip already exists
  const { data: existingPayslip } = await supabase
    .from('payslips')
    .select('*')
    .eq('payroll_detail_id', payrollDetail.id)
    .single();

  if (existingPayslip) {
    // Return existing payslip
    return successResponse({
      ...existingPayslip,
      employee,
      period,
      payroll_detail: payrollDetail,
    });
  }

  // Generate payslip
  const payslipData = {
    payroll_detail_id: payrollDetail.id,
    employee_id: employeeId,
    employer_id: employee.employer_id,
    period_id: periodId,
    employee_name: employee.full_name,
    employee_position: employee.position,
    employee_department: employee.department,
    period_start: period.period_start,
    period_end: period.period_end,
    month: period.month,
    year: period.year,
    base_salary: payrollDetail.base_salary,
    allowances: payrollDetail.allowances,
    overtime: payrollDetail.overtime,
    gross_salary: payrollDetail.gross_salary,
    bpjs_kesehatan: payrollDetail.bpjs_kesehatan,
    bpjs_jht: payrollDetail.bpjs_jht,
    bpjs_jp: payrollDetail.bpjs_jp,
    pph21: payrollDetail.pph21,
    total_deductions: payrollDetail.total_deductions,
    net_salary: payrollDetail.net_salary,
    status: 'generated',
    generated_by: userContext.id,
    generated_at: new Date().toISOString(),
  };

  const { data: payslip, error: createError } = await supabase
    .from('payslips')
    .insert(payslipData)
    .select()
    .single();

  if (createError) {
    return errorResponse(
      'SRV_9002',
      'Failed to generate payslip',
      500,
      { details: createError.message }
    );
  }

  // Log payslip generation
  await logPayrollAction(
    userContext,
    request,
    'payslip_generated',
    periodId,
    {
      employeeName: employee.full_name,
      employeeId,
      month: period.month,
      year: period.year,
      netSalary: payrollDetail.net_salary,
    }
  );

  // TODO: Generate PDF payslip document
  // TODO: Send email notification to employee with payslip

  return successResponse({
    ...payslip,
    employee,
    period,
    payroll_detail: payrollDetail,
  }, 201);
}

export const POST = withErrorHandler(handler);
