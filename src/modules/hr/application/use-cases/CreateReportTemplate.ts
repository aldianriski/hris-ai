import type { IComplianceRepository } from '../../domain/repositories/IComplianceRepository';
import { ReportTemplate } from '../../domain/entities/ReportTemplate';
import type { CreateReportTemplateInput } from '../dto/ComplianceDTO';

/**
 * Create Report Template Use Case
 */
export class CreateReportTemplate {
  constructor(private complianceRepository: IComplianceRepository) {}

  async execute(input: CreateReportTemplateInput): Promise<ReportTemplate> {
    // Validate at least one column
    if (input.columns.length === 0) {
      throw new Error('Report must have at least one column');
    }

    const template = new ReportTemplate(
      crypto.randomUUID(),
      input.employerId,
      input.code,
      input.name,
      input.nameIndonesian,
      input.category,
      input.description ?? null,
      input.reportType,
      input.dataSource,
      input.filters,
      input.columns,
      input.sortBy ?? null,
      input.sortOrder,
      input.groupBy ?? null,
      input.format,
      input.schedule ?? null,
      false, // isSystem
      true, // isActive
      input.createdBy,
      input.createdByName,
      new Date(),
      new Date()
    );

    return this.complianceRepository.createTemplate(template);
  }
}
