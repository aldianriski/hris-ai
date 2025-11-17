import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import type { CreateEmployeeDTO } from '../dto/EmployeeDTO';
import { Employee } from '../../domain/entities/Employee';
import { EmployeeNumber } from '../../domain/value-objects/EmployeeNumber';

export class CreateEmployeeUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(
    employerId: string,
    dto: CreateEmployeeDTO
  ): Promise<Employee> {
    // Validate email uniqueness
    const emailExists = await this.employeeRepository.emailExists(employerId, dto.email);
    if (emailExists) {
      throw new Error(`Email ${dto.email} is already in use`);
    }

    // Generate employee number
    const currentYear = new Date().getFullYear();
    const lastEmployeeNumber = await this.employeeRepository.getLastEmployeeNumber(
      employerId,
      currentYear
    );
    const employeeNumber = EmployeeNumber.generateNext(lastEmployeeNumber, currentYear);

    // Create employee entity
    const employee = new Employee(
      crypto.randomUUID(), // Temporary ID, will be replaced by DB
      employerId,
      employeeNumber,
      dto.fullName,
      dto.email,
      dto.phone ?? null,
      dto.dateOfBirth ?? null,
      dto.gender ?? null,
      dto.maritalStatus ?? null,
      dto.address ?? null,
      dto.city ?? null,
      dto.postalCode ?? null,
      dto.idCardNumber ?? null,
      dto.joinDate,
      dto.employmentType,
      dto.contractStartDate ?? null,
      dto.contractEndDate ?? null,
      dto.position,
      dto.department,
      dto.division ?? null,
      dto.managerId ?? null,
      dto.salaryBase,
      dto.salaryComponents ?? { allowances: [], deductions: [] },
      dto.bpjsKesehatanNumber ?? null,
      dto.bpjsKetenagakerjaanNumber ?? null,
      dto.npwp ?? null,
      dto.ptkpStatus ?? 'TK/0',
      dto.bankName ?? null,
      dto.bankAccountNumber ?? null,
      dto.bankAccountHolder ?? null,
      dto.status ?? 'probation',
      null, // exitDate
      null, // exitReason
      dto.photoUrl ?? null,
      dto.notes ?? null,
      dto.userId ?? null,
      new Date(),
      new Date()
    );

    // Validate manager exists if provided
    if (employee.managerId) {
      const manager = await this.employeeRepository.findById(employee.managerId);
      if (!manager) {
        throw new Error(`Manager with ID ${employee.managerId} not found`);
      }
      if (manager.employerId !== employerId) {
        throw new Error('Manager must belong to the same employer');
      }
    }

    // Save to repository
    return await this.employeeRepository.create(employee);
  }
}
