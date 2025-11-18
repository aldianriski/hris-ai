import type { IComplianceRepository } from '../../domain/repositories/IComplianceRepository';
import { AuditLog } from '../../domain/entities/AuditLog';
import type { CreateAuditLogInput } from '../dto/ComplianceDTO';

/**
 * Create Audit Log Use Case
 */
export class CreateAuditLog {
  constructor(private complianceRepository: IComplianceRepository) {}

  async execute(input: CreateAuditLogInput): Promise<AuditLog> {
    const log = new AuditLog(
      crypto.randomUUID(),
      input.employerId,
      input.userId,
      input.userName,
      input.userRole,
      input.action,
      input.entityType,
      input.entityId ?? null,
      input.entityName ?? null,
      input.description,
      input.changes ?? null,
      input.metadata ?? null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
      new Date()
    );

    return this.complianceRepository.createAuditLog(log);
  }
}
