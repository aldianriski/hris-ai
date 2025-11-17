/**
 * Employee Document Domain Entity
 * Represents employee-related documents with AI extraction
 */
export class EmployeeDocument {
  constructor(
    public readonly id: string,
    public readonly employeeId: string,
    public readonly employerId: string,
    public readonly documentType:
      | 'ktp'
      | 'npwp'
      | 'bpjs_kesehatan'
      | 'bpjs_ketenagakerjaan'
      | 'kk'
      | 'passport'
      | 'contract'
      | 'offer_letter'
      | 'resignation'
      | 'certificate'
      | 'medical'
      | 'other',
    public readonly title: string,
    public readonly description: string | null,
    public readonly fileUrl: string,
    public readonly fileName: string,
    public readonly fileSize: number, // bytes
    public readonly mimeType: string,
    public readonly issuedDate: Date | null,
    public readonly expiryDate: Date | null,
    public readonly documentNumber: string | null,
    public readonly extractedData: Record<string, unknown> | null,
    public readonly aiExtractedAt: Date | null,
    public readonly aiConfidence: number | null, // 0-1
    public readonly isVerified: boolean,
    public readonly verifiedBy: string | null,
    public readonly verifiedAt: Date | null,
    public readonly tags: string[],
    public readonly uploadedBy: string,
    public readonly uploadedByName: string,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Document title is required');
    }

    if (!this.fileUrl || this.fileUrl.trim().length === 0) {
      throw new Error('File URL is required');
    }

    if (this.fileSize < 0) {
      throw new Error('File size cannot be negative');
    }

    if (this.expiryDate && this.issuedDate && this.expiryDate < this.issuedDate) {
      throw new Error('Expiry date must be after issued date');
    }

    if (this.aiConfidence !== null && (this.aiConfidence < 0 || this.aiConfidence > 1)) {
      throw new Error('AI confidence must be between 0 and 1');
    }
  }

  /**
   * Check if document is expired
   */
  isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  /**
   * Check if document is expiring soon (within 30 days)
   */
  isExpiringSoon(days: number = 30): boolean {
    if (!this.expiryDate) return false;
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (this.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= days;
  }

  /**
   * Get days until expiry
   */
  get daysUntilExpiry(): number | null {
    if (!this.expiryDate) return null;
    const now = new Date();
    return Math.ceil(
      (this.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Check if document needs AI extraction
   */
  needsExtraction(): boolean {
    return this.extractedData === null && this.isExtractableType();
  }

  /**
   * Check if document type supports AI extraction
   */
  isExtractableType(): boolean {
    const extractableTypes = [
      'ktp',
      'npwp',
      'bpjs_kesehatan',
      'bpjs_ketenagakerjaan',
      'kk',
      'passport',
      'contract',
    ];
    return extractableTypes.includes(this.documentType);
  }

  /**
   * Check if document is an ID card
   */
  isIdentityCard(): boolean {
    return ['ktp', 'passport', 'kk'].includes(this.documentType);
  }

  /**
   * Check if document is a tax document
   */
  isTaxDocument(): boolean {
    return this.documentType === 'npwp';
  }

  /**
   * Check if document is a contract
   */
  isContract(): boolean {
    return ['contract', 'offer_letter'].includes(this.documentType);
  }

  /**
   * Add AI extracted data
   */
  addExtractedData(
    extractedData: Record<string, unknown>,
    confidence: number
  ): EmployeeDocument {
    return new EmployeeDocument(
      this.id,
      this.employeeId,
      this.employerId,
      this.documentType,
      this.title,
      this.description,
      this.fileUrl,
      this.fileName,
      this.fileSize,
      this.mimeType,
      this.issuedDate,
      this.expiryDate,
      this.documentNumber,
      extractedData,
      new Date(),
      confidence,
      this.isVerified,
      this.verifiedBy,
      this.verifiedAt,
      this.tags,
      this.uploadedBy,
      this.uploadedByName,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Verify document
   */
  verify(verifierId: string): EmployeeDocument {
    return new EmployeeDocument(
      this.id,
      this.employeeId,
      this.employerId,
      this.documentType,
      this.title,
      this.description,
      this.fileUrl,
      this.fileName,
      this.fileSize,
      this.mimeType,
      this.issuedDate,
      this.expiryDate,
      this.documentNumber,
      this.extractedData,
      this.aiExtractedAt,
      this.aiConfidence,
      true,
      verifierId,
      new Date(),
      this.tags,
      this.uploadedBy,
      this.uploadedByName,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Unverify document
   */
  unverify(): EmployeeDocument {
    return new EmployeeDocument(
      this.id,
      this.employeeId,
      this.employerId,
      this.documentType,
      this.title,
      this.description,
      this.fileUrl,
      this.fileName,
      this.fileSize,
      this.mimeType,
      this.issuedDate,
      this.expiryDate,
      this.documentNumber,
      this.extractedData,
      this.aiExtractedAt,
      this.aiConfidence,
      false,
      null,
      null,
      this.tags,
      this.uploadedBy,
      this.uploadedByName,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update document metadata
   */
  update(updates: {
    title?: string;
    description?: string | null;
    issuedDate?: Date | null;
    expiryDate?: Date | null;
    documentNumber?: string | null;
    tags?: string[];
    notes?: string | null;
  }): EmployeeDocument {
    return new EmployeeDocument(
      this.id,
      this.employeeId,
      this.employerId,
      this.documentType,
      updates.title ?? this.title,
      updates.description !== undefined ? updates.description : this.description,
      this.fileUrl,
      this.fileName,
      this.fileSize,
      this.mimeType,
      updates.issuedDate !== undefined ? updates.issuedDate : this.issuedDate,
      updates.expiryDate !== undefined ? updates.expiryDate : this.expiryDate,
      updates.documentNumber !== undefined ? updates.documentNumber : this.documentNumber,
      this.extractedData,
      this.aiExtractedAt,
      this.aiConfidence,
      this.isVerified,
      this.verifiedBy,
      this.verifiedAt,
      updates.tags ?? this.tags,
      this.uploadedBy,
      this.uploadedByName,
      updates.notes !== undefined ? updates.notes : this.notes,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Get file size in human-readable format
   */
  get fileSizeFormatted(): string {
    const bytes = this.fileSize;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employeeId: this.employeeId,
      employerId: this.employerId,
      documentType: this.documentType,
      title: this.title,
      description: this.description,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      fileSize: this.fileSize,
      fileSizeFormatted: this.fileSizeFormatted,
      mimeType: this.mimeType,
      issuedDate: this.issuedDate?.toISOString().split('T')[0] ?? null,
      expiryDate: this.expiryDate?.toISOString().split('T')[0] ?? null,
      documentNumber: this.documentNumber,
      extractedData: this.extractedData,
      aiExtractedAt: this.aiExtractedAt?.toISOString() ?? null,
      aiConfidence: this.aiConfidence,
      isVerified: this.isVerified,
      verifiedBy: this.verifiedBy,
      verifiedAt: this.verifiedAt?.toISOString() ?? null,
      tags: this.tags,
      uploadedBy: this.uploadedBy,
      uploadedByName: this.uploadedByName,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      isExpired: this.isExpired(),
      isExpiringSoon: this.isExpiringSoon(),
      daysUntilExpiry: this.daysUntilExpiry,
      needsExtraction: this.needsExtraction(),
      isExtractableType: this.isExtractableType(),
    };
  }
}
