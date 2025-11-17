import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import type { Employee } from '../../domain/entities/Employee';

export class GetEmployeeUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw new Error(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async getByEmployeeNumber(employerId: string, employeeNumber: string): Promise<Employee> {
    const employee = await this.employeeRepository.findByEmployeeNumber(
      employerId,
      employeeNumber
    );

    if (!employee) {
      throw new Error(`Employee with number ${employeeNumber} not found`);
    }

    return employee;
  }

  async getByEmail(employerId: string, email: string): Promise<Employee> {
    const employee = await this.employeeRepository.findByEmail(employerId, email);

    if (!employee) {
      throw new Error(`Employee with email ${email} not found`);
    }

    return employee;
  }
}
