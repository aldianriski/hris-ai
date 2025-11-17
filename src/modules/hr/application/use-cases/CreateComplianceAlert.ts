import type { IComplianceRepository } from '../../domain/repositories/IComplianceRepository';
import { ComplianceAlert } from '../../domain/entities/ComplianceAlert';
import type { CreateComplianceAlertInput } from '../dto/ComplianceDTO';

/**
 * Create Compliance Alert Use Case
 */
export class CreateComplianceAlert {
  constructor(private complianceRepository: IComplianceRepository) {}

  async execute(input: CreateComplianceAlertInput): Promise<ComplianceAlert> {
    // Parse due date if provided
    const dueDate =
      input.dueDate && typeof input.dueDate === 'string'
        ? new Date(input.dueDate)
        : input.dueDate ?? null;

    const alert = new ComplianceAlert(
      crypto.randomUUID(),
      input.employerId,
      input.alertType,
      input.severity,
      input.title,
      input.description,
      input.affectedEntityType,
      input.affectedEntityId ?? null,
      input.affectedEntityName ?? null,
      dueDate,
      'open',
      null, // assignedTo
      null, // assignedToName
      null, // resolution
      null, // resolvedAt
      null, // resolvedBy
      null, // acknowledgedAt
      null, // acknowledgedBy
      input.metadata ?? null,
      new Date(),
      new Date()
    );

    return this.complianceRepository.createAlert(alert);
  }
}
