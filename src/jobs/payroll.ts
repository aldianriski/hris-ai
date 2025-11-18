/**
 * Payroll Processing Job
 * Handles batch payroll calculations in background
 */

import { inngest } from '@/lib/queue/client';
import { createClient } from '@/lib/supabase/server';
import { sendEvent, INNGEST_EVENTS } from '@/lib/queue/client';

/**
 * Process payroll for a specific period
 */
export const processPayrollJob = inngest.createFunction(
  {
    id: 'process-payroll',
    name: 'Process Payroll',
    retries: 3,
    // Cancel if job runs longer than 10 minutes
    cancelOn: [
      {
        event: 'payroll/process.cancelled',
        timeout: '10m',
      },
    ],
  },
  { event: 'payroll/process' },
  async ({ event, step }) => {
    const { payrollPeriodId, companyId, initiatedBy } = event.data;

    // Step 1: Validate payroll period
    const period = await step.run('validate-period', async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('payroll_periods')
        .select('*')
        .eq('id', payrollPeriodId)
        .eq('employer_id', companyId)
        .single();

      if (error || !data) {
        throw new Error('Payroll period not found');
      }

      if (data.status !== 'draft') {
        throw new Error('Payroll period is not in draft status');
      }

      return data;
    });

    // Step 2: Get all active employees
    const employees = await step.run('fetch-employees', async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employer_id', companyId)
        .eq('status', 'active');

      if (error) {
        throw new Error(`Failed to fetch employees: ${error.message}`);
      }

      return data || [];
    });

    // Step 3: Calculate payroll for each employee (batch processing)
    const results = await step.run('calculate-payroll', async () => {
      const supabase = await createClient();
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < employees.length; i += batchSize) {
        batches.push(employees.slice(i, i + batchSize));
      }

      const allResults = [];

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(async (employee) => {
            try {
              // Get employee compensation details
              const { data: compensation } = await supabase
                .from('employee_compensation')
                .select('*')
                .eq('employee_id', employee.id)
                .single();

              if (!compensation) {
                return {
                  employeeId: employee.id,
                  success: false,
                  error: 'No compensation data found',
                };
              }

              // Calculate earnings
              const baseSalary = compensation.base_salary || 0;
              const allowances = compensation.allowances || 0;

              // Get overtime for the period
              const { data: overtime } = await supabase
                .from('attendance')
                .select('overtime_hours')
                .eq('employee_id', employee.id)
                .gte('date', period.period_start)
                .lte('date', period.period_end);

              const totalOvertimeHours = overtime?.reduce(
                (sum, record) => sum + (record.overtime_hours || 0),
                0
              ) || 0;

              const overtimePay = totalOvertimeHours * (compensation.hourly_rate || 0);

              const grossSalary = baseSalary + allowances + overtimePay;

              // Calculate deductions (Indonesian tax and social security)
              const bpjsKesehatan = grossSalary * 0.01; // 1% health insurance
              const bpjsJHT = grossSalary * 0.02; // 2% old age insurance
              const bpjsJP = grossSalary * 0.01; // 1% pension

              // Simplified PPh21 calculation (progressive tax)
              let pph21 = 0;
              const annualGross = grossSalary * 12;
              if (annualGross > 60000000) {
                pph21 = (annualGross - 60000000) * 0.05 / 12; // 5% for income above 60M
              }

              const totalDeductions = bpjsKesehatan + bpjsJHT + bpjsJP + pph21;
              const netSalary = grossSalary - totalDeductions;

              // Insert payroll detail
              const { data: payrollDetail, error: insertError } = await supabase
                .from('payroll_details')
                .insert({
                  payroll_period_id: payrollPeriodId,
                  employee_id: employee.id,
                  base_salary: baseSalary,
                  allowances,
                  overtime: overtimePay,
                  gross_salary: grossSalary,
                  bpjs_kesehatan: bpjsKesehatan,
                  bpjs_jht: bpjsJHT,
                  bpjs_jp: bpjsJP,
                  pph21,
                  total_deductions: totalDeductions,
                  net_salary: netSalary,
                  status: 'calculated',
                })
                .select()
                .single();

              if (insertError) {
                return {
                  employeeId: employee.id,
                  success: false,
                  error: insertError.message,
                };
              }

              return {
                employeeId: employee.id,
                success: true,
                netSalary,
              };
            } catch (error) {
              return {
                employeeId: employee.id,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          })
        );

        allResults.push(...batchResults);
      }

      return allResults;
    });

    // Step 4: Update payroll period status
    await step.run('update-period-status', async () => {
      const supabase = await createClient();

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      await supabase
        .from('payroll_periods')
        .update({
          status: failedCount === 0 ? 'calculated' : 'partial',
          processed_at: new Date().toISOString(),
          processed_by: initiatedBy,
          employee_count: employees.length,
          success_count: successCount,
          failed_count: failedCount,
        })
        .eq('id', payrollPeriodId);
    });

    // Step 5: Send completion notification
    await step.run('send-notification', async () => {
      const successCount = results.filter((r) => r.success).length;

      await sendEvent(INNGEST_EVENTS.EMAIL_SEND, {
        type: 'payroll-processed',
        to: initiatedBy,
        subject: 'Payroll Processing Complete',
        data: {
          periodId: payrollPeriodId,
          totalEmployees: employees.length,
          successCount,
          failedCount: results.length - successCount,
          period: `${period.month}/${period.year}`,
        },
      });
    });

    return {
      success: true,
      periodId: payrollPeriodId,
      totalEmployees: employees.length,
      successCount: results.filter((r) => r.success).length,
      failedCount: results.filter((r) => !r.success).length,
      results,
    };
  }
);
