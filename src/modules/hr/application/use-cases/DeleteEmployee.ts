import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';

export class DeleteEmployeeUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(id: string, employerId: string): Promise<void> {
    // Get existing employee
    const existing = await this.employeeRepository.findById(id);
    if (!existing) {
      throw new Error(`Employee with ID ${id} not found`);
    }

    // Verify employee belongs to employer
    if (existing.employerId !== employerId) {
      throw new Error('Employee does not belong to this employer');
    }

    // Check if employee is a manager
    const subordinates = await this.employeeRepository.findByManagerId(id);
    if (subordinates.length > 0) {
      throw new Error(
        `Cannot delete employee. ${subordinates.length} employee(s) report to this manager. ` +
          'Please reassign subordinates first.'
      );
    }

    // Soft delete (set status to resigned)
    await this.employeeRepository.delete(id);
  }
}
