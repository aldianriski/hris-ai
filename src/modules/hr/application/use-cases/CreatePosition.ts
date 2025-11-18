import type { IOrganizationRepository } from '../../domain/repositories/IOrganizationRepository';
import { Position } from '../../domain/entities/Position';
import type { CreatePositionInput } from '../dto/OrganizationDTO';

/**
 * Create Position Use Case
 */
export class CreatePosition {
  constructor(private organizationRepository: IOrganizationRepository) {}

  async execute(input: CreatePositionInput): Promise<Position> {
    // Validate department if provided
    if (input.departmentId) {
      const department = await this.organizationRepository.findDepartmentById(
        input.departmentId
      );
      if (!department) {
        throw new Error('Department not found');
      }
    }

    // Validate reportsTo if provided
    if (input.reportsTo) {
      const reportsToPosition = await this.organizationRepository.findPositionById(
        input.reportsTo
      );
      if (!reportsToPosition) {
        throw new Error('Reports-to position not found');
      }
    }

    // Validate salary range
    if (
      input.minSalary !== undefined &&
      input.minSalary !== null &&
      input.maxSalary !== undefined &&
      input.maxSalary !== null &&
      input.minSalary > input.maxSalary
    ) {
      throw new Error('Min salary cannot exceed max salary');
    }

    const position = new Position(
      crypto.randomUUID(),
      input.employerId,
      input.code,
      input.title,
      input.titleIndonesian,
      input.departmentId ?? null,
      input.level,
      input.jobFamily ?? null,
      input.reportsTo ?? null,
      input.description ?? null,
      input.responsibilities ?? null,
      input.requirements ?? null,
      input.minSalary ?? null,
      input.maxSalary ?? null,
      true, // isActive
      input.headcount,
      input.currentCount,
      input.displayOrder,
      new Date(),
      new Date()
    );

    return this.organizationRepository.createPosition(position);
  }
}
