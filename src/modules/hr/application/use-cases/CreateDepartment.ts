import type { IOrganizationRepository } from '../../domain/repositories/IOrganizationRepository';
import { Department } from '../../domain/entities/Department';
import type { CreateDepartmentInput } from '../dto/OrganizationDTO';

/**
 * Create Department Use Case
 */
export class CreateDepartment {
  constructor(private organizationRepository: IOrganizationRepository) {}

  async execute(input: CreateDepartmentInput): Promise<Department> {
    // If has parent, validate parent exists and calculate level
    let level = input.level;
    if (input.parentId) {
      const parent = await this.organizationRepository.findDepartmentById(input.parentId);
      if (!parent) {
        throw new Error('Parent department not found');
      }

      // Child level should be parent level + 1
      level = parent.level + 1;
    }

    const department = new Department(
      crypto.randomUUID(),
      input.employerId,
      input.code,
      input.name,
      input.nameIndonesian,
      input.type,
      input.parentId ?? null,
      input.managerId ?? null,
      input.managerName ?? null,
      input.description ?? null,
      input.costCenter ?? null,
      input.budget ?? null,
      input.location ?? null,
      true, // isActive
      level,
      input.displayOrder,
      new Date(),
      new Date()
    );

    return this.organizationRepository.createDepartment(department);
  }
}
