import { createClient } from '@/lib/supabase/server';
import {
  SupabaseEmployeeRepository,
  SupabaseAttendanceRepository,
  SupabaseLeaveRepository,
  SupabasePayrollRepository,
  SupabasePerformanceRepository,
  SupabaseDocumentRepository,
  SupabaseOrganizationRepository,
  SupabaseComplianceRepository,
} from '@/modules/hr/infrastructure/repositories';

// AI Services
import { AIAnomalyDetector } from '@/modules/hr/infrastructure/services/AIAnomalyDetector';
import { AILeaveApprovalEngine } from '@/modules/hr/infrastructure/services/AILeaveApprovalEngine';
import { BPJSCalculator } from '@/modules/hr/infrastructure/services/BPJSCalculator';
import { PPh21Calculator } from '@/modules/hr/infrastructure/services/PPh21Calculator';
import { AIPayrollErrorDetector } from '@/modules/hr/infrastructure/services/AIPayrollErrorDetector';
import { AISentimentAnalyzer } from '@/modules/hr/infrastructure/services/AISentimentAnalyzer';
import { AIDocumentExtractor } from '@/modules/hr/infrastructure/services/AIDocumentExtractor';

// Use Cases - Employee
import { CreateEmployeeUseCase } from '@/modules/hr/application/use-cases/CreateEmployee';
import { UpdateEmployeeUseCase } from '@/modules/hr/application/use-cases/UpdateEmployee';
import { ListEmployeesUseCase } from '@/modules/hr/application/use-cases/ListEmployees';

// Use Cases - Attendance
import { ClockInUseCase } from '@/modules/hr/application/use-cases/ClockIn';
import { ClockOutUseCase } from '@/modules/hr/application/use-cases/ClockOut';

// Use Cases - Leave
import { CreateLeaveRequestUseCase } from '@/modules/hr/application/use-cases/CreateLeaveRequest';

/**
 * Dependency Injection Container
 * Creates and manages all application dependencies
 */
export class DIContainer {
  private static instance: DIContainer;

  // Repositories
  private employeeRepository?: SupabaseEmployeeRepository;
  private attendanceRepository?: SupabaseAttendanceRepository;
  private leaveRepository?: SupabaseLeaveRepository;
  private payrollRepository?: SupabasePayrollRepository;
  private performanceRepository?: SupabasePerformanceRepository;
  private documentRepository?: SupabaseDocumentRepository;
  private organizationRepository?: SupabaseOrganizationRepository;
  private complianceRepository?: SupabaseComplianceRepository;

  // AI Services
  private aiAnomalyDetector?: AIAnomalyDetector;
  private aiLeaveApprovalEngine?: AILeaveApprovalEngine;
  private bpjsCalculator?: BPJSCalculator;
  private pph21Calculator?: PPh21Calculator;
  private aiPayrollErrorDetector?: AIPayrollErrorDetector;
  private aiSentimentAnalyzer?: AISentimentAnalyzer;
  private aiDocumentExtractor?: AIDocumentExtractor;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Repository Factories
  async getEmployeeRepository(): Promise<SupabaseEmployeeRepository> {
    if (!this.employeeRepository) {
      const supabase = await createClient();
      this.employeeRepository = new SupabaseEmployeeRepository(supabase);
    }
    return this.employeeRepository;
  }

  async getAttendanceRepository(): Promise<SupabaseAttendanceRepository> {
    if (!this.attendanceRepository) {
      const supabase = await createClient();
      this.attendanceRepository = new SupabaseAttendanceRepository(supabase);
    }
    return this.attendanceRepository;
  }

  async getLeaveRepository(): Promise<SupabaseLeaveRepository> {
    if (!this.leaveRepository) {
      const supabase = await createClient();
      this.leaveRepository = new SupabaseLeaveRepository(supabase);
    }
    return this.leaveRepository;
  }

  async getPayrollRepository(): Promise<SupabasePayrollRepository> {
    if (!this.payrollRepository) {
      const supabase = await createClient();
      this.payrollRepository = new SupabasePayrollRepository(supabase);
    }
    return this.payrollRepository;
  }

  async getPerformanceRepository(): Promise<SupabasePerformanceRepository> {
    if (!this.performanceRepository) {
      const supabase = await createClient();
      this.performanceRepository = new SupabasePerformanceRepository(supabase);
    }
    return this.performanceRepository;
  }

  async getDocumentRepository(): Promise<SupabaseDocumentRepository> {
    if (!this.documentRepository) {
      const supabase = await createClient();
      this.documentRepository = new SupabaseDocumentRepository(supabase);
    }
    return this.documentRepository;
  }

  async getOrganizationRepository(): Promise<SupabaseOrganizationRepository> {
    if (!this.organizationRepository) {
      const supabase = await createClient();
      this.organizationRepository = new SupabaseOrganizationRepository(supabase);
    }
    return this.organizationRepository;
  }

  async getComplianceRepository(): Promise<SupabaseComplianceRepository> {
    if (!this.complianceRepository) {
      const supabase = await createClient();
      this.complianceRepository = new SupabaseComplianceRepository(supabase);
    }
    return this.complianceRepository;
  }

  // AI Service Factories
  getAIAnomalyDetector(): AIAnomalyDetector {
    if (!this.aiAnomalyDetector) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY is required');
      this.aiAnomalyDetector = new AIAnomalyDetector(apiKey);
    }
    return this.aiAnomalyDetector;
  }

  getAILeaveApprovalEngine(): AILeaveApprovalEngine {
    if (!this.aiLeaveApprovalEngine) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY is required');
      this.aiLeaveApprovalEngine = new AILeaveApprovalEngine(apiKey);
    }
    return this.aiLeaveApprovalEngine;
  }

  getBPJSCalculator(): BPJSCalculator {
    if (!this.bpjsCalculator) {
      this.bpjsCalculator = new BPJSCalculator();
    }
    return this.bpjsCalculator;
  }

  getPPh21Calculator(): PPh21Calculator {
    if (!this.pph21Calculator) {
      this.pph21Calculator = new PPh21Calculator();
    }
    return this.pph21Calculator;
  }

  getAIPayrollErrorDetector(): AIPayrollErrorDetector {
    if (!this.aiPayrollErrorDetector) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY is required');
      this.aiPayrollErrorDetector = new AIPayrollErrorDetector(apiKey);
    }
    return this.aiPayrollErrorDetector;
  }

  getAISentimentAnalyzer(): AISentimentAnalyzer {
    if (!this.aiSentimentAnalyzer) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY is required');
      this.aiSentimentAnalyzer = new AISentimentAnalyzer(apiKey);
    }
    return this.aiSentimentAnalyzer;
  }

  getAIDocumentExtractor(): AIDocumentExtractor {
    if (!this.aiDocumentExtractor) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY is required');
      this.aiDocumentExtractor = new AIDocumentExtractor(apiKey);
    }
    return this.aiDocumentExtractor;
  }

  // Use Case Factories - Employee
  async getCreateEmployeeUseCase(): Promise<CreateEmployeeUseCase> {
    return new CreateEmployeeUseCase(await this.getEmployeeRepository());
  }

  async getUpdateEmployeeUseCase(): Promise<UpdateEmployeeUseCase> {
    return new UpdateEmployeeUseCase(await this.getEmployeeRepository());
  }

  async getListEmployeesUseCase(): Promise<ListEmployeesUseCase> {
    return new ListEmployeesUseCase(await this.getEmployeeRepository());
  }

  // Use Case Factories - Attendance
  async getClockInUseCase(): Promise<ClockInUseCase> {
    return new ClockInUseCase(await this.getAttendanceRepository());
  }

  async getClockOutUseCase(): Promise<ClockOutUseCase> {
    return new ClockOutUseCase(await this.getAttendanceRepository());
  }

  // Use Case Factories - Leave
  async getCreateLeaveRequestUseCase(): Promise<CreateLeaveRequestUseCase> {
    return new CreateLeaveRequestUseCase(await this.getLeaveRepository());
  }
}

// Export singleton instance
export const container = DIContainer.getInstance();
