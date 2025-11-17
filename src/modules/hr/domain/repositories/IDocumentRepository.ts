import type { EmployeeDocument } from '../entities/EmployeeDocument';

export interface IDocumentRepository {
  // Documents
  findDocumentById(id: string): Promise<EmployeeDocument | null>;

  findDocumentsByEmployeeId(
    employeeId: string,
    options?: {
      documentType?: string;
      isVerified?: boolean;
      tags?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    documents: EmployeeDocument[];
    total: number;
  }>;

  findDocumentsByEmployerId(
    employerId: string,
    options?: {
      documentType?: string;
      isVerified?: boolean;
      isExpired?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    documents: EmployeeDocument[];
    total: number;
  }>;

  findExpiringDocuments(
    employerId: string,
    daysUntilExpiry: number
  ): Promise<EmployeeDocument[]>;

  findDocumentsNeedingExtraction(employerId: string): Promise<EmployeeDocument[]>;

  createDocument(
    document: Omit<EmployeeDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EmployeeDocument>;

  updateDocument(
    id: string,
    updates: Partial<EmployeeDocument>
  ): Promise<EmployeeDocument>;

  deleteDocument(id: string): Promise<void>;

  // Statistics
  getDocumentStats(employerId: string): Promise<{
    totalDocuments: number;
    verifiedDocuments: number;
    expiredDocuments: number;
    expiringDocuments: number;
    documentsNeedingExtraction: number;
    byType: Record<string, number>;
  }>;
}
