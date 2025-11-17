/**
 * Report Template Domain Entity
 * Represents customizable report templates for various HR reports
 */
export class ReportTemplate {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly nameIndonesian: string,
    public readonly category:
      | 'payroll'
      | 'attendance'
      | 'leave'
      | 'performance'
      | 'compliance'
      | 'headcount'
      | 'recruitment'
      | 'other',
    public readonly description: string | null,
    public readonly reportType: 'list' | 'summary' | 'chart' | 'dashboard',
    public readonly dataSource: string, // SQL query, API endpoint, or data source identifier
    public readonly filters: Array<{
      field: string;
      label: string;
      type: 'text' | 'date' | 'select' | 'number' | 'boolean';
      required: boolean;
      options?: string[];
    }>,
    public readonly columns: Array<{
      field: string;
      label: string;
      dataType: 'text' | 'number' | 'date' | 'currency' | 'boolean';
      format?: string;
      aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    }>,
    public readonly sortBy: string | null,
    public readonly sortOrder: 'asc' | 'desc',
    public readonly groupBy: string[] | null,
    public readonly format: 'pdf' | 'excel' | 'csv' | 'json',
    public readonly schedule: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
      dayOfWeek?: number; // 0-6 for weekly
      dayOfMonth?: number; // 1-31 for monthly
      recipients?: string[];
    } | null,
    public readonly isSystem: boolean,
    public readonly isActive: boolean,
    public readonly createdBy: string,
    public readonly createdByName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.code || this.code.trim().length === 0) {
      throw new Error('Report template code is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Report template name is required');
    }

    if (this.columns.length === 0) {
      throw new Error('Report must have at least one column');
    }
  }

  /**
   * Check if report has filters
   */
  hasFilters(): boolean {
    return this.filters.length > 0;
  }

  /**
   * Check if report is scheduled
   */
  isScheduled(): boolean {
    return this.schedule !== null && this.schedule.enabled;
  }

  /**
   * Check if report has grouping
   */
  hasGrouping(): boolean {
    return this.groupBy !== null && this.groupBy.length > 0;
  }

  /**
   * Get required filters
   */
  getRequiredFilters(): Array<{
    field: string;
    label: string;
    type: string;
  }> {
    return this.filters.filter((f) => f.required);
  }

  /**
   * Deactivate report
   */
  deactivate(): ReportTemplate {
    return new ReportTemplate(
      this.id,
      this.employerId,
      this.code,
      this.name,
      this.nameIndonesian,
      this.category,
      this.description,
      this.reportType,
      this.dataSource,
      this.filters,
      this.columns,
      this.sortBy,
      this.sortOrder,
      this.groupBy,
      this.format,
      this.schedule,
      this.isSystem,
      false,
      this.createdBy,
      this.createdByName,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Activate report
   */
  activate(): ReportTemplate {
    return new ReportTemplate(
      this.id,
      this.employerId,
      this.code,
      this.name,
      this.nameIndonesian,
      this.category,
      this.description,
      this.reportType,
      this.dataSource,
      this.filters,
      this.columns,
      this.sortBy,
      this.sortOrder,
      this.groupBy,
      this.format,
      this.schedule,
      this.isSystem,
      true,
      this.createdBy,
      this.createdByName,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update template
   */
  update(updates: {
    name?: string;
    nameIndonesian?: string;
    description?: string | null;
    filters?: Array<{
      field: string;
      label: string;
      type: 'text' | 'date' | 'select' | 'number' | 'boolean';
      required: boolean;
      options?: string[];
    }>;
    columns?: Array<{
      field: string;
      label: string;
      dataType: 'text' | 'number' | 'date' | 'currency' | 'boolean';
      format?: string;
      aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    }>;
    sortBy?: string | null;
    sortOrder?: 'asc' | 'desc';
    groupBy?: string[] | null;
    format?: 'pdf' | 'excel' | 'csv' | 'json';
    schedule?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
      dayOfWeek?: number;
      dayOfMonth?: number;
      recipients?: string[];
    } | null;
  }): ReportTemplate {
    if (this.isSystem) {
      throw new Error('Cannot update system report templates');
    }

    return new ReportTemplate(
      this.id,
      this.employerId,
      this.code,
      updates.name ?? this.name,
      updates.nameIndonesian ?? this.nameIndonesian,
      this.category,
      updates.description !== undefined ? updates.description : this.description,
      this.reportType,
      this.dataSource,
      updates.filters ?? this.filters,
      updates.columns ?? this.columns,
      updates.sortBy !== undefined ? updates.sortBy : this.sortBy,
      updates.sortOrder ?? this.sortOrder,
      updates.groupBy !== undefined ? updates.groupBy : this.groupBy,
      updates.format ?? this.format,
      updates.schedule !== undefined ? updates.schedule : this.schedule,
      this.isSystem,
      this.isActive,
      this.createdBy,
      this.createdByName,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employerId: this.employerId,
      code: this.code,
      name: this.name,
      nameIndonesian: this.nameIndonesian,
      category: this.category,
      description: this.description,
      reportType: this.reportType,
      dataSource: this.dataSource,
      filters: this.filters,
      requiredFilters: this.getRequiredFilters(),
      columns: this.columns,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      groupBy: this.groupBy,
      format: this.format,
      schedule: this.schedule,
      isSystem: this.isSystem,
      isActive: this.isActive,
      createdBy: this.createdBy,
      createdByName: this.createdByName,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      hasFilters: this.hasFilters(),
      isScheduled: this.isScheduled(),
      hasGrouping: this.hasGrouping(),
    };
  }
}
