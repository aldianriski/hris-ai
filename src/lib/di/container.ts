import { createServerClient } from '@/lib/supabase/server';
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
import { CreateEmployee } from '@/modules/hr/application/use-cases/CreateEmployee';
import { UpdateEmployee } from '@/modules/hr/application/use-cases/UpdateEmployee';
import { ListEmployees } from '@/modules/hr/application/use-cases/ListEmployees';

// Use Cases - Attendance
import { ClockIn } from '@/modules/hr/application/use-cases/ClockIn';
import { ClockOut } from '@/modules/hr/application/use-cases/ClockOut';

// Use Cases - Leave
import { CreateLeaveRequest } from '@/modules/hr/application/use-cases/CreateLeaveRequest';

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
  getEmployeeRepository(): SupabaseEmployeeRepository {
    if (!this.employeeRepository) {
      const supabase = createServerClient();
      this.employeeRepository = new SupabaseEmployeeRepository(supabase);
    }
    return this.employeeRepository;
  }

  getAttendanceRepository(): SupabaseAttendanceRepository {
    if (!this.attendanceRepository) {
      const supabase = createServerClient();
      this.attendanceRepository = new SupabaseAttendanceRepository(supabase);
    }
    return this.attendanceRepository;
  }

  getLeaveRepository(): SupabaseLeaveRepository {
    if (!this.leaveRepository) {
      const supabase = createServerClient();
      this.leaveRepository = new SupabaseLeaveRepository(supabase);
    }
    return this.leaveRepository;
  }

  getPayrollRepository(): SupabasePayrollRepository {
    if (!this.payrollRepository) {
      const supabase = createServerClient();
      this.payrollRepository = new SupabasePayrollRepository(supabase);
    }
    return this.payrollRepository;
  }

  getPerformanceRepository(): SupabasePerformanceRepository {
    if (!this.performanceRepository) {
      const supabase = createServerClient();
      this.performanceRepository = new SupabasePerformanceRepository(supabase);
    }
    return this.performanceRepository;
  }

  getDocumentRepository(): SupabaseDocumentRepository {
    if (!this.documentRepository) {
      const supabase = createServerClient();
      this.documentRepository = new SupabaseDocumentRepository(supabase);
    }
    return this.documentRepository;
  }

  getOrganizationRepository(): SupabaseOrganizationRepository {
    if (!this.organizationRepository) {
      const supabase = createServerClient();
      this.organizationRepository = new SupabaseOrganizationRepository(supabase);
    }
    return this.organizationRepository;
  }

  getComplianceRepository(): SupabaseComplianceRepository {
    if (!this.complianceRepository) {
      const supabase = createServerClient();
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
  getCreateEmployeeUseCase(): CreateEmployee {
    return new CreateEmployee(this.getEmployeeRepository());
  }

  getUpdateEmployeeUseCase(): UpdateEmployee {
    return new UpdateEmployee(this.getEmployeeRepository());
  }

  getListEmployeesUseCase(): ListEmployees {
    return new ListEmployees(this.getEmployeeRepository());
  }

  // Use Case Factories - Attendance
  getClockInUseCase(): ClockIn {
    return new ClockIn(
      this.getAttendanceRepository(),
      this.getEmployeeRepository(),
      this.getAIAnomalyDetector()
    );
  }

  getClockOutUseCase(): ClockOut {
    return new ClockOut(
      this.getAttendanceRepository(),
      this.getAIAnomalyDetector()
    );
  }

  // Use Case Factories - Leave
  getCreateLeaveRequestUseCase(): CreateLeaveRequest {
    return new CreateLeaveRequest(
      this.getLeaveRepository(),
      this.getEmployeeRepository(),
      this.getAILeaveApprovalEngine()
    );
  }
}

// Export singleton instance
export const container = DIContainer.getInstance();
