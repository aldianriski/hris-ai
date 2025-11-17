import OpenAI from 'openai';
import type { LeaveRequest } from '../../domain/entities/LeaveRequest';
import type { LeaveBalance } from '../../domain/entities/LeaveBalance';

export interface ApprovalEvaluationResult {
  shouldAutoApprove: boolean;
  confidence: number;
  reasoning: string;
  risks: string[];
  suggestions: string[];
}

export interface LeaveApprovalContext {
  request: LeaveRequest;
  balance: LeaveBalance;
  teamConflicts: Array<{
    employeeId: string;
    employeeName: string;
    startDate: Date;
    endDate: Date;
  }>;
  historicalApprovals: {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageDays: number;
  };
  employeeHistory: {
    totalLeavesTaken: number;
    lastLeaveDate: Date | null;
    attendanceScore: number; // 0-100
  };
}

export class AILeaveApprovalEngine {
  private openai: OpenAI;
  private readonly CONFIDENCE_THRESHOLD = 0.85; // 85% confidence for auto-approval

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Evaluate if leave request should be auto-approved
   */
  async evaluateLeaveRequest(
    context: LeaveApprovalContext
  ): Promise<ApprovalEvaluationResult> {
    // Rule-based checks first
    const ruleBasedResult = this.ruleBasedEvaluation(context);

    // If rule-based checks fail, don't auto-approve
    if (!ruleBasedResult.shouldAutoApprove) {
      return ruleBasedResult;
    }

    // Use AI for final evaluation
    try {
      const aiResult = await this.aiEvaluation(context);

      // Combine rule-based and AI results
      return {
        shouldAutoApprove:
          aiResult.shouldAutoApprove && aiResult.confidence >= this.CONFIDENCE_THRESHOLD,
        confidence: Math.min(ruleBasedResult.confidence, aiResult.confidence),
        reasoning: aiResult.reasoning,
        risks: [...ruleBasedResult.risks, ...aiResult.risks],
        suggestions: [...ruleBasedResult.suggestions, ...aiResult.suggestions],
      };
    } catch (error) {
      console.error('AI leave approval evaluation failed:', error);

      // Fallback to rule-based decision
      return ruleBasedResult;
    }
  }

  /**
   * Rule-based evaluation (hard constraints)
   */
  private ruleBasedEvaluation(
    context: LeaveApprovalContext
  ): ApprovalEvaluationResult {
    const risks: string[] = [];
    const suggestions: string[] = [];
    let confidence = 1.0;

    // Check 1: Sufficient balance
    if (context.request.leaveType === 'annual') {
      if (!context.balance.hasSufficientAnnualLeave(context.request.totalDays)) {
        return {
          shouldAutoApprove: false,
          confidence: 0,
          reasoning: 'Insufficient leave balance',
          risks: ['Employee has insufficient leave balance'],
          suggestions: ['Employee should apply for unpaid leave instead'],
        };
      }
    }

    // Check 2: Team conflicts
    if (context.teamConflicts.length > 0) {
      risks.push(
        `${context.teamConflicts.length} team member(s) on leave during this period`
      );
      confidence -= 0.2;

      if (context.teamConflicts.length >= 3) {
        return {
          shouldAutoApprove: false,
          confidence: confidence,
          reasoning: 'Too many team members on leave',
          risks,
          suggestions: ['Consider alternative dates with less team impact'],
        };
      }
    }

    // Check 3: Historical patterns
    const approvalRate =
      context.historicalApprovals.totalRequests > 0
        ? context.historicalApprovals.approvedRequests /
          context.historicalApprovals.totalRequests
        : 1;

    if (approvalRate < 0.5) {
      confidence -= 0.15;
      risks.push('Employee has low historical approval rate');
    }

    // Check 4: Leave duration
    if (context.request.totalDays > 10) {
      confidence -= 0.1;
      risks.push('Leave duration exceeds 10 days');
      suggestions.push('Consider splitting into shorter periods');
    }

    // Check 5: Short notice (less than 7 days)
    const daysUntilLeave = Math.ceil(
      (context.request.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilLeave < 7) {
      confidence -= 0.15;
      risks.push('Short notice (less than 7 days)');
    }

    // Check 6: Attendance score
    if (context.employeeHistory.attendanceScore < 70) {
      confidence -= 0.1;
      risks.push('Low attendance score');
    }

    return {
      shouldAutoApprove: confidence >= this.CONFIDENCE_THRESHOLD && risks.length < 3,
      confidence: Math.max(0, confidence),
      reasoning:
        confidence >= this.CONFIDENCE_THRESHOLD
          ? 'All rule-based checks passed'
          : 'Some concerns identified in rule-based evaluation',
      risks,
      suggestions,
    };
  }

  /**
   * AI-powered evaluation using GPT-4o-mini
   */
  private async aiEvaluation(
    context: LeaveApprovalContext
  ): Promise<ApprovalEvaluationResult> {
    const systemPrompt = `You are an AI leave approval assistant for an Indonesian HRIS system.
Your role is to evaluate leave requests and determine if they should be auto-approved.

Consider:
- Indonesian work culture and labor law
- Team availability and business continuity
- Employee history and patterns
- Balance between employee wellbeing and business needs

Respond in JSON format:
{
  "shouldAutoApprove": boolean,
  "confidence": number (0-1),
  "reasoning": "detailed explanation",
  "risks": ["risk1", "risk2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const userPrompt = `
Leave Request:
- Type: ${context.request.leaveType}
- Dates: ${context.request.startDate.toISOString().split('T')[0]} to ${context.request.endDate.toISOString().split('T')[0]}
- Duration: ${context.request.totalDays} days
- Reason: ${context.request.reason}

Leave Balance:
- Annual quota: ${context.balance.annualQuota} days
- Used: ${context.balance.annualUsed} days
- Remaining: ${context.balance.annualRemaining} days
- Carry forward: ${context.balance.annualCarryForward} days

Team Impact:
- Team members on leave: ${context.teamConflicts.length}
${context.teamConflicts.map((c) => `  - ${c.employeeName}: ${c.startDate.toISOString().split('T')[0]} to ${c.endDate.toISOString().split('T')[0]}`).join('\n')}

Employee History:
- Total leaves taken: ${context.employeeHistory.totalLeavesTaken}
- Attendance score: ${context.employeeHistory.attendanceScore}/100
- Last leave: ${context.employeeHistory.lastLeaveDate?.toISOString().split('T')[0] ?? 'Never'}

Historical Approval Rate:
- Total requests: ${context.historicalApprovals.totalRequests}
- Approved: ${context.historicalApprovals.approvedRequests}
- Rejected: ${context.historicalApprovals.rejectedRequests}
- Approval rate: ${context.historicalApprovals.totalRequests > 0 ? Math.round((context.historicalApprovals.approvedRequests / context.historicalApprovals.totalRequests) * 100) : 'N/A'}%

Should this leave request be auto-approved?`;

    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

    return {
      shouldAutoApprove: result.shouldAutoApprove ?? false,
      confidence: result.confidence ?? 0.5,
      reasoning: result.reasoning ?? 'AI evaluation completed',
      risks: result.risks ?? [],
      suggestions: result.suggestions ?? [],
    };
  }

  /**
   * Get confidence threshold
   */
  getConfidenceThreshold(): number {
    return this.CONFIDENCE_THRESHOLD;
  }
}
