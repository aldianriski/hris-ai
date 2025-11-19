import OpenAI from 'openai';
import type { BPJSCalculationResult } from './BPJSCalculator';
import type { PPh21CalculationResult } from './PPh21Calculator';

export interface PayrollErrorDetectionResult {
  hasErrors: boolean;
  errors: Array<{
    type:
      | 'calculation_error'
      | 'missing_data'
      | 'unusual_amount'
      | 'compliance_issue'
      | 'data_mismatch';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    field?: string;
    suggestedFix?: string;
  }>;
  confidence: number;
  aiReview: string;
  recommendations: string[];
}

export interface PayrollValidationContext {
  employee: {
    id: string;
    name: string;
    employeeNumber: string;
    baseSalary: number;
    position: string;
    employmentType: string;
    maritalStatus: string;
    dependents: number;
  };
  period: {
    month: number;
    year: number;
    workingDays: number;
  };
  attendance: {
    presentDays: number;
    absentDays: number;
    lateDays: number;
    overtimeHours: number;
  };
  earnings: {
    baseSalary: number;
    allowances: number;
    overtimePay: number;
    bonuses: number;
    total: number;
  };
  deductions: {
    bpjsEmployee: number;
    pph21: number;
    loans: number;
    other: number;
    total: number;
  };
  netPay: number;
  bpjsCalculation?: BPJSCalculationResult;
  pph21Calculation?: PPh21CalculationResult;
  historicalData?: {
    averageNetPay: number;
    averageGrossPay: number;
    lastMonthNetPay: number;
    totalPayrollsProcessed: number;
  };
}

export class AIPayrollErrorDetector {
  private openai: OpenAI;
  private readonly UNUSUAL_VARIANCE_THRESHOLD = 0.3; // 30% variance

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Detect errors and anomalies in payroll calculation
   */
  async detectErrors(
    context: PayrollValidationContext
  ): Promise<PayrollErrorDetectionResult> {
    // Rule-based validation first
    const ruleBasedErrors = this.ruleBasedValidation(context);

    // If critical errors found, return immediately
    const hasCriticalErrors = ruleBasedErrors.some((e) => e.severity === 'critical');
    if (hasCriticalErrors) {
      return {
        hasErrors: true,
        errors: ruleBasedErrors,
        confidence: 1.0,
        aiReview: 'Critical errors detected in rule-based validation',
        recommendations: this.getRecommendations(ruleBasedErrors),
      };
    }

    // Use AI for deeper validation
    try {
      const aiResult = await this.aiValidation(context, ruleBasedErrors);

      return {
        hasErrors: ruleBasedErrors.length > 0 || aiResult.hasErrors,
        errors: [...ruleBasedErrors, ...aiResult.errors],
        confidence: aiResult.confidence,
        aiReview: aiResult.review,
        recommendations: [
          ...this.getRecommendations(ruleBasedErrors),
          ...aiResult.recommendations,
        ],
      };
    } catch (error) {
      console.error('AI payroll validation failed:', error);

      // Fallback to rule-based only
      return {
        hasErrors: ruleBasedErrors.length > 0,
        errors: ruleBasedErrors,
        confidence: 0.7,
        aiReview: 'Rule-based validation only (AI unavailable)',
        recommendations: this.getRecommendations(ruleBasedErrors),
      };
    }
  }

  /**
   * Rule-based validation (hard constraints)
   */
  private ruleBasedValidation(
    context: PayrollValidationContext
  ): Array<{
    type:
      | 'calculation_error'
      | 'missing_data'
      | 'unusual_amount'
      | 'compliance_issue'
      | 'data_mismatch';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    field?: string;
    suggestedFix?: string;
  }> {
    const errors: Array<{
      type:
        | 'calculation_error'
        | 'missing_data'
        | 'unusual_amount'
        | 'compliance_issue'
        | 'data_mismatch';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      field?: string;
      suggestedFix?: string;
    }> = [];

    // 1. Net pay cannot exceed gross pay
    if (context.netPay > context.earnings.total) {
      errors.push({
        type: 'calculation_error',
        severity: 'critical',
        description: `Net pay (${context.netPay}) exceeds gross pay (${context.earnings.total})`,
        field: 'netPay',
        suggestedFix: 'Verify deduction calculations',
      });
    }

    // 2. Net pay should equal gross - deductions
    const expectedNetPay = context.earnings.total - context.deductions.total;
    if (Math.abs(context.netPay - expectedNetPay) > 1) {
      // Allow 1 rupiah difference for rounding
      errors.push({
        type: 'calculation_error',
        severity: 'high',
        description: `Net pay mismatch: Expected ${expectedNetPay}, got ${context.netPay}`,
        field: 'netPay',
        suggestedFix: 'Recalculate net pay = gross pay - total deductions',
      });
    }

    // 3. Negative amounts
    if (context.netPay < 0) {
      errors.push({
        type: 'calculation_error',
        severity: 'critical',
        description: 'Net pay is negative',
        field: 'netPay',
        suggestedFix: 'Verify deductions are not exceeding gross pay',
      });
    }

    if (context.earnings.total < 0) {
      errors.push({
        type: 'calculation_error',
        severity: 'critical',
        description: 'Total earnings is negative',
        field: 'earnings.total',
      });
    }

    // 4. Base salary validation
    if (context.earnings.baseSalary !== context.employee.baseSalary) {
      // Check if prorated
      const expectedProrated =
        (context.employee.baseSalary / context.period.workingDays) *
        context.attendance.presentDays;

      if (Math.abs(context.earnings.baseSalary - expectedProrated) > 100) {
        errors.push({
          type: 'data_mismatch',
          severity: 'high',
          description: `Base salary mismatch: Employee master shows ${context.employee.baseSalary}, payroll shows ${context.earnings.baseSalary}`,
          field: 'earnings.baseSalary',
          suggestedFix: 'Verify if salary should be prorated based on attendance',
        });
      }
    }

    // 5. BPJS validation
    if (context.bpjsCalculation) {
      const bpjsVariance = Math.abs(
        context.deductions.bpjsEmployee - context.bpjsCalculation.totalEmployee
      );

      if (bpjsVariance > 100) {
        // Allow 100 rupiah variance
        errors.push({
          type: 'calculation_error',
          severity: 'high',
          description: `BPJS calculation mismatch: Expected ${context.bpjsCalculation.totalEmployee}, got ${context.deductions.bpjsEmployee}`,
          field: 'deductions.bpjsEmployee',
          suggestedFix: 'Recalculate BPJS using standard rates',
        });
      }
    }

    // 6. PPh21 validation
    if (context.pph21Calculation) {
      const pph21Variance = Math.abs(
        context.deductions.pph21 - context.pph21Calculation.monthlyTax
      );

      if (pph21Variance > 100) {
        // Allow 100 rupiah variance
        errors.push({
          type: 'calculation_error',
          severity: 'high',
          description: `PPh21 calculation mismatch: Expected ${context.pph21Calculation.monthlyTax}, got ${context.deductions.pph21}`,
          field: 'deductions.pph21',
          suggestedFix: 'Recalculate PPh21 using correct PTKP and tax brackets',
        });
      }
    }

    // 7. Missing data checks
    if (!context.employee.employmentType) {
      errors.push({
        type: 'missing_data',
        severity: 'medium',
        description: 'Employee employment type is missing',
        field: 'employee.employmentType',
      });
    }

    // 8. Attendance validation
    if (context.attendance.presentDays > context.period.workingDays) {
      errors.push({
        type: 'data_mismatch',
        severity: 'high',
        description: `Present days (${context.attendance.presentDays}) exceeds working days (${context.period.workingDays})`,
        field: 'attendance.presentDays',
      });
    }

    // 9. Historical variance check
    if (context.historicalData && context.historicalData.totalPayrollsProcessed >= 3) {
      const netPayVariance =
        Math.abs(context.netPay - context.historicalData.averageNetPay) /
        context.historicalData.averageNetPay;

      if (netPayVariance > this.UNUSUAL_VARIANCE_THRESHOLD) {
        errors.push({
          type: 'unusual_amount',
          severity: 'medium',
          description: `Net pay variance of ${(netPayVariance * 100).toFixed(1)}% from historical average (${context.historicalData.averageNetPay})`,
          field: 'netPay',
          suggestedFix: 'Review for unusual bonuses, deductions, or attendance issues',
        });
      }
    }

    // 10. Indonesian minimum wage check (UMR)
    // For full month attendance, net pay should not be below UMR
    if (
      context.attendance.presentDays >= context.period.workingDays - 2 &&
      context.netPay < 4500000
    ) {
      // Approximate Jakarta UMR 2025
      errors.push({
        type: 'compliance_issue',
        severity: 'high',
        description: `Net pay (${context.netPay}) may be below minimum wage (UMR) for full month attendance`,
        field: 'netPay',
        suggestedFix: 'Verify against regional minimum wage (UMR/UMP)',
      });
    }

    return errors;
  }

  /**
   * AI-powered validation
   */
  private async aiValidation(
    context: PayrollValidationContext,
    existingErrors: Array<{
      type: string;
      severity: string;
      description: string;
    }>
  ): Promise<{
    hasErrors: boolean;
    errors: Array<{
      type:
        | 'calculation_error'
        | 'missing_data'
        | 'unusual_amount'
        | 'compliance_issue'
        | 'data_mismatch';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      field?: string;
      suggestedFix?: string;
    }>;
    confidence: number;
    review: string;
    recommendations: string[];
  }> {
    const systemPrompt = `You are an AI payroll validation expert for Indonesian HRIS system.
Your role is to review payroll calculations and identify potential errors, anomalies, or compliance issues.

Consider Indonesian labor law and payroll regulations:
- BPJS rates (Kesehatan, Ketenagakerjaan)
- PPh21 progressive tax brackets
- PTKP (non-taxable income) based on marital status
- Regional minimum wage (UMR/UMP)
- Maximum overtime hours and rates
- Proration rules for partial months

Analyze the payroll data and respond in JSON format:
{
  "hasErrors": boolean,
  "errors": [
    {
      "type": "calculation_error|missing_data|unusual_amount|compliance_issue|data_mismatch",
      "severity": "low|medium|high|critical",
      "description": "detailed description",
      "field": "field name (optional)",
      "suggestedFix": "suggestion (optional)"
    }
  ],
  "confidence": number (0-1),
  "review": "overall assessment",
  "recommendations": ["recommendation1", "recommendation2"]
}`;

    const userPrompt = `
Employee Information:
- Name: ${context.employee.name} (${context.employee.employeeNumber})
- Position: ${context.employee.position}
- Employment Type: ${context.employee.employmentType}
- Master Base Salary: Rp ${context.employee.baseSalary.toLocaleString('id-ID')}
- Marital Status: ${context.employee.maritalStatus}
- Dependents: ${context.employee.dependents}

Payroll Period:
- Month/Year: ${context.period.month}/${context.period.year}
- Working Days: ${context.period.workingDays}

Attendance:
- Present: ${context.attendance.presentDays} days
- Absent: ${context.attendance.absentDays} days
- Late: ${context.attendance.lateDays} days
- Overtime: ${context.attendance.overtimeHours} hours

Earnings:
- Base Salary: Rp ${context.earnings.baseSalary.toLocaleString('id-ID')}
- Allowances: Rp ${context.earnings.allowances.toLocaleString('id-ID')}
- Overtime Pay: Rp ${context.earnings.overtimePay.toLocaleString('id-ID')}
- Bonuses: Rp ${context.earnings.bonuses.toLocaleString('id-ID')}
- Total: Rp ${context.earnings.total.toLocaleString('id-ID')}

Deductions:
- BPJS Employee: Rp ${context.deductions.bpjsEmployee.toLocaleString('id-ID')}
- PPh21: Rp ${context.deductions.pph21.toLocaleString('id-ID')}
- Loans: Rp ${context.deductions.loans.toLocaleString('id-ID')}
- Other: Rp ${context.deductions.other.toLocaleString('id-ID')}
- Total: Rp ${context.deductions.total.toLocaleString('id-ID')}

Net Pay: Rp ${context.netPay.toLocaleString('id-ID')}

${context.historicalData ? `Historical Data:
- Average Net Pay: Rp ${context.historicalData.averageNetPay.toLocaleString('id-ID')}
- Last Month Net Pay: Rp ${context.historicalData.lastMonthNetPay.toLocaleString('id-ID')}
- Payrolls Processed: ${context.historicalData.totalPayrollsProcessed}` : ''}

${existingErrors.length > 0 ? `Existing Errors Detected:
${existingErrors.map((e) => `- [${e.severity}] ${e.description}`).join('\n')}` : ''}

Please validate this payroll calculation and identify any additional errors or concerns.`;

    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    let result: any;
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }
      result = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse AI payroll error detection response:', error);
      // Return safe default values if parsing fails
      return {
        hasErrors: false,
        errors: [],
        confidence: 0,
        review: 'AI validation failed - manual review required',
        recommendations: ['Manual review required due to AI parsing error'],
      };
    }

    return {
      hasErrors: result.hasErrors ?? false,
      errors: result.errors ?? [],
      confidence: result.confidence ?? 0.8,
      review: result.review ?? 'AI validation completed',
      recommendations: result.recommendations ?? [],
    };
  }

  /**
   * Get recommendations based on errors
   */
  private getRecommendations(
    errors: Array<{ type: string; severity: string }>
  ): string[] {
    const recommendations: string[] = [];

    const hasCritical = errors.some((e) => e.severity === 'critical');
    const hasCalculationError = errors.some((e) => e.type === 'calculation_error');
    const hasComplianceIssue = errors.some((e) => e.type === 'compliance_issue');
    const hasUnusualAmount = errors.some((e) => e.type === 'unusual_amount');

    if (hasCritical) {
      recommendations.push('Do not approve this payroll until critical errors are resolved');
    }

    if (hasCalculationError) {
      recommendations.push('Recalculate BPJS and PPh21 using standard formulas');
      recommendations.push('Verify attendance data and proration calculations');
    }

    if (hasComplianceIssue) {
      recommendations.push('Review compliance with Indonesian labor law');
      recommendations.push('Verify minimum wage (UMR/UMP) compliance');
    }

    if (hasUnusualAmount) {
      recommendations.push('Contact employee to verify unusual amounts');
      recommendations.push('Review for data entry errors');
    }

    if (recommendations.length === 0) {
      recommendations.push('Payroll calculation appears correct');
    }

    return recommendations;
  }
}
