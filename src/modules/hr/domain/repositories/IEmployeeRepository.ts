import type { Employee } from '../entities/Employee';

/**
 * Employee Repository Interface
 * Defines data access operations for Employee entity
 */
export interface IEmployeeRepository {
  /**
   * Find employee by ID
   */
  findById(id: string): Promise<Employee | null>;

  /**
   * Find employee by employee number
   */
  findByEmployeeNumber(employerId: string, employeeNumber: string): Promise<Employee | null>;

  /**
   * Find employee by email
   */
  findByEmail(employerId: string, email: string): Promise<Employee | null>;

  /**
   * Find all employees for an employer
   */
  findByEmployerId(
    employerId: string,
    options?: {
      status?: string;
      department?: string;
      limit?: number;
      offset?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    employees: Employee[];
    total: number;
  }>;

  /**
   * Find employees by manager
   */
  findByManagerId(managerId: string): Promise<Employee[]>;

  /**
   * Create a new employee
   */
  create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee>;

  /**
   * Update an existing employee
   */
  update(id: string, updates: Partial<Employee>): Promise<Employee>;

  /**
   * Delete an employee (soft delete - set status to resigned)
   */
  delete(id: string): Promise<void>;

  /**
   * Get the last employee number for an employer
   */
  getLastEmployeeNumber(employerId: string, year?: number): Promise<string | null>;

  /**
   * Count employees by status
   */
  countByStatus(employerId: string): Promise<Record<string, number>>;

  /**
   * Get employees with expiring contracts
   */
  findExpiringContracts(employerId: string, daysUntilExpiry: number): Promise<Employee[]>;

  /**
   * Bulk create employees
   */
  bulkCreate(
    employees: Array<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Employee[]>;

  /**
   * Check if employee number exists
   */
  employeeNumberExists(employerId: string, employeeNumber: string): Promise<boolean>;

  /**
   * Check if email exists
   */
  emailExists(employerId: string, email: string, excludeId?: string): Promise<boolean>;
}
