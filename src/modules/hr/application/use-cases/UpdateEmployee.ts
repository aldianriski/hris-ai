import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import type { UpdateEmployeeDTO } from '../dto/EmployeeDTO';
import type { Employee } from '../../domain/entities/Employee';

export class UpdateEmployeeUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(
    id: string,
    employerId: string,
    dto: Omit<UpdateEmployeeDTO, 'id'>
  ): Promise<Employee> {
    // Get existing employee
    const existing = await this.employeeRepository.findById(id);
    if (!existing) {
      throw new Error(`Employee with ID ${id} not found`);
    }

    // Verify employee belongs to employer
    if (existing.employerId !== employerId) {
      throw new Error('Employee does not belong to this employer');
    }

    // Check email uniqueness if email is being changed
    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.employeeRepository.emailExists(
        employerId,
        dto.email,
        id
      );
      if (emailExists) {
        throw new Error(`Email ${dto.email} is already in use`);
      }
    }

    // Validate manager if being changed
    if (dto.managerId && dto.managerId !== existing.managerId) {
      // Prevent self-assignment
      if (dto.managerId === id) {
        throw new Error('Employee cannot be their own manager');
      }

      const manager = await this.employeeRepository.findById(dto.managerId);
      if (!manager) {
        throw new Error(`Manager with ID ${dto.managerId} not found`);
      }
      if (manager.employerId !== employerId) {
        throw new Error('Manager must belong to the same employer');
      }

      // Prevent circular manager relationships
      if (manager.managerId === id) {
        throw new Error('Circular manager relationship detected');
      }
    }

    // Update employee - use type assertion since we're building update object dynamically
    const updates: any = {};

    if (dto.fullName !== undefined) updates.fullName = dto.fullName;
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.dateOfBirth !== undefined) updates.dateOfBirth = dto.dateOfBirth;
    if (dto.gender !== undefined) updates.gender = dto.gender;
    if (dto.maritalStatus !== undefined) updates.maritalStatus = dto.maritalStatus;
    if (dto.address !== undefined) updates.address = dto.address;
    if (dto.city !== undefined) updates.city = dto.city;
    if (dto.postalCode !== undefined) updates.postalCode = dto.postalCode;
    if (dto.idCardNumber !== undefined) updates.idCardNumber = dto.idCardNumber;
    if (dto.position !== undefined) updates.position = dto.position;
    if (dto.department !== undefined) updates.department = dto.department;
    if (dto.division !== undefined) updates.division = dto.division;
    if (dto.managerId !== undefined) updates.managerId = dto.managerId;
    if (dto.salaryBase !== undefined) updates.salaryBase = dto.salaryBase;
    if (dto.salaryComponents !== undefined) updates.salaryComponents = dto.salaryComponents;
    if (dto.bpjsKesehatanNumber !== undefined) updates.bpjsKesehatanNumber = dto.bpjsKesehatanNumber;
    if (dto.bpjsKetenagakerjaanNumber !== undefined) updates.bpjsKetenagakerjaanNumber = dto.bpjsKetenagakerjaanNumber;
    if (dto.npwp !== undefined) updates.npwp = dto.npwp;
    if (dto.ptkpStatus !== undefined) updates.ptkpStatus = dto.ptkpStatus;
    if (dto.bankName !== undefined) updates.bankName = dto.bankName;
    if (dto.bankAccountNumber !== undefined) updates.bankAccountNumber = dto.bankAccountNumber;
    if (dto.bankAccountHolder !== undefined) updates.bankAccountHolder = dto.bankAccountHolder;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.exitDate !== undefined) updates.exitDate = dto.exitDate;
    if (dto.exitReason !== undefined) updates.exitReason = dto.exitReason;
    if (dto.photoUrl !== undefined) updates.photoUrl = dto.photoUrl;
    if (dto.notes !== undefined) updates.notes = dto.notes;

    return await this.employeeRepository.update(id, updates);
  }

  async terminate(
    id: string,
    employerId: string,
    exitDate: Date,
    exitReason: string
  ): Promise<Employee> {
    return await this.execute(id, employerId, {
      status: 'terminated',
      exitDate,
      exitReason,
    });
  }

  async resign(
    id: string,
    employerId: string,
    exitDate: Date,
    exitReason?: string
  ): Promise<Employee> {
    return await this.execute(id, employerId, {
      status: 'resigned',
      exitDate,
      exitReason: exitReason ?? 'Voluntary resignation',
    });
  }

  async convertToPermanent(id: string, employerId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new Error(`Employee with ID ${id} not found`);
    }

    if (employee.employmentType === 'PKWTT') {
      throw new Error('Employee is already on permanent contract');
    }

    return await this.execute(id, employerId, {
      employmentType: 'PKWTT',
      status: 'active',
      contractEndDate: null,
    });
  }
}
