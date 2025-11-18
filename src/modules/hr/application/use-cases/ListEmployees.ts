import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import type { Employee } from '../../domain/entities/Employee';
import type { EmployeeFilterDTO } from '../dto/EmployeeDTO';

export interface ListEmployeesResult {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ListEmployeesUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(employerId: string, filter: EmployeeFilterDTO): Promise<ListEmployeesResult> {
    const { employees, total } = await this.employeeRepository.findByEmployerId(employerId, {
      status: filter.status,
      department: filter.department,
      search: filter.search,
      limit: filter.limit,
      offset: filter.offset,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
    });

    const pageSize = filter.limit ?? 20;
    const page = Math.floor((filter.offset ?? 0) / pageSize) + 1;
    const totalPages = Math.ceil(total / pageSize);

    return {
      employees,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getActiveEmployees(employerId: string): Promise<Employee[]> {
    const { employees } = await this.employeeRepository.findByEmployerId(employerId, {
      status: 'active',
    });
    return employees;
  }

  async getProbationEmployees(employerId: string): Promise<Employee[]> {
    const { employees } = await this.employeeRepository.findByEmployerId(employerId, {
      status: 'probation',
    });
    return employees;
  }

  async getByDepartment(employerId: string, department: string): Promise<Employee[]> {
    const { employees } = await this.employeeRepository.findByEmployerId(employerId, {
      department,
    });
    return employees;
  }

  async getTeamMembers(managerId: string): Promise<Employee[]> {
    return await this.employeeRepository.findByManagerId(managerId);
  }

  async getEmployeeStats(employerId: string): Promise<Record<string, number>> {
    return await this.employeeRepository.countByStatus(employerId);
  }

  async getExpiringContracts(
    employerId: string,
    daysUntilExpiry: number = 30
  ): Promise<Employee[]> {
    return await this.employeeRepository.findExpiringContracts(employerId, daysUntilExpiry);
  }
}
