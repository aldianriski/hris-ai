import type { SupabaseClient } from '@supabase/supabase-js';
import type { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { EmployeeDocument } from '../../domain/entities/EmployeeDocument';

export class SupabaseDocumentRepository implements IDocumentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findDocumentById(id: string): Promise<EmployeeDocument | null> {
    const { data, error } = await this.supabase
      .from('employee_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(\`Failed to find document: \${error.message}\`);
    }

    return this.mapToEntity(data);
  }

  async findDocumentsByEmployeeId(
    employeeId: string,
    options?: { documentType?: string; isVerified?: boolean; tags?: string[]; limit?: number; offset?: number }
  ): Promise<{ documents: EmployeeDocument[]; total: number }> {
    let query = this.supabase
      .from('employee_documents')
      .select('*', { count: 'exact' })
      .eq('employee_id', employeeId);

    if (options?.documentType) query = query.eq('document_type', options.documentType);
    if (options?.isVerified !== undefined) query = query.eq('is_verified', options.isVerified);
    if (options?.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(\`Failed to find documents: \${error.message}\`);

    return {
      documents: (data || []).map((row) => this.mapToEntity(row)),
      total: count ?? 0,
    };
  }

  async findDocumentsByEmployerId(
    employerId: string,
    options?: { documentType?: string; isVerified?: boolean; isExpired?: boolean; limit?: number; offset?: number }
  ): Promise<{ documents: EmployeeDocument[]; total: number }> {
    let query = this.supabase
      .from('employee_documents')
      .select('*', { count: 'exact' })
      .eq('employer_id', employerId);

    if (options?.documentType) query = query.eq('document_type', options.documentType);
    if (options?.isVerified !== undefined) query = query.eq('is_verified', options.isVerified);
    if (options?.isExpired) {
      query = query.not('expiry_date', 'is', null).lt('expiry_date', new Date().toISOString().split('T')[0]);
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(\`Failed to find documents: \${error.message}\`);

    return {
      documents: (data || []).map((row) => this.mapToEntity(row)),
      total: count ?? 0,
    };
  }

  async findExpiringDocuments(employerId: string, daysUntilExpiry: number): Promise<EmployeeDocument[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

    const { data, error } = await this.supabase
      .from('employee_documents')
      .select('*')
      .eq('employer_id', employerId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0]);

    if (error) throw new Error(\`Failed to find expiring documents: \${error.message}\`);
    return (data || []).map((row) => this.mapToEntity(row));
  }

  async findDocumentsNeedingExtraction(employerId: string): Promise<EmployeeDocument[]> {
    const { data, error } = await this.supabase
      .from('employee_documents')
      .select('*')
      .eq('employer_id', employerId)
      .is('extracted_data', null)
      .in('document_type', ['ktp', 'npwp', 'bpjs_kesehatan', 'bpjs_ketenagakerjaan', 'kk', 'passport', 'contract']);

    if (error) throw new Error(\`Failed to find documents needing extraction: \${error.message}\`);
    return (data || []).map((row) => this.mapToEntity(row));
  }

  async createDocument(doc: Omit<EmployeeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeDocument> {
    const { data, error } = await this.supabase
      .from('employee_documents')
      .insert([this.mapToDatabase(doc)])
      .select()
      .single();

    if (error) throw new Error(\`Failed to create document: \${error.message}\`);
    return this.mapToEntity(data);
  }

  async updateDocument(id: string, updates: Partial<EmployeeDocument>): Promise<EmployeeDocument> {
    const { data, error } = await this.supabase
      .from('employee_documents')
      .update({ ...this.mapToDatabase(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(\`Failed to update document: \${error.message}\`);
    return this.mapToEntity(data);
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await this.supabase.from('employee_documents').delete().eq('id', id);
    if (error) throw new Error(\`Failed to delete document: \${error.message}\`);
  }

  async getDocumentStats(employerId: string): Promise<{
    totalDocuments: number;
    verifiedDocuments: number;
    expiredDocuments: number;
    expiringDocuments: number;
    documentsNeedingExtraction: number;
    byType: Record<string, number>;
  }> {
    const { count: total } = await this.supabase
      .from('employee_documents')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId);

    const { count: verified } = await this.supabase
      .from('employee_documents')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('is_verified', true);

    const { count: expired } = await this.supabase
      .from('employee_documents')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .not('expiry_date', 'is', null)
      .lt('expiry_date', new Date().toISOString().split('T')[0]);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const { count: expiring } = await this.supabase
      .from('employee_documents')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0]);

    const { count: needingExtraction } = await this.supabase
      .from('employee_documents')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .is('extracted_data', null)
      .in('document_type', ['ktp', 'npwp', 'bpjs_kesehatan', 'contract']);

    const { data: typeData } = await this.supabase
      .from('employee_documents')
      .select('document_type')
      .eq('employer_id', employerId);

    const byType: Record<string, number> = {};
    (typeData || []).forEach((row) => {
      byType[row.document_type] = (byType[row.document_type] || 0) + 1;
    });

    return {
      totalDocuments: total ?? 0,
      verifiedDocuments: verified ?? 0,
      expiredDocuments: expired ?? 0,
      expiringDocuments: expiring ?? 0,
      documentsNeedingExtraction: needingExtraction ?? 0,
      byType,
    };
  }

  private mapToEntity(row: any): EmployeeDocument {
    return new EmployeeDocument(
      row.id, row.employee_id, row.employer_id, row.document_type, row.title, row.description,
      row.file_url, row.file_name, row.file_size, row.mime_type,
      row.issued_date ? new Date(row.issued_date) : null,
      row.expiry_date ? new Date(row.expiry_date) : null,
      row.document_number, row.extracted_data,
      row.ai_extracted_at ? new Date(row.ai_extracted_at) : null,
      row.ai_confidence, row.is_verified, row.verified_by,
      row.verified_at ? new Date(row.verified_at) : null,
      row.tags || [], row.uploaded_by, row.uploaded_by_name, row.notes,
      new Date(row.created_at), new Date(row.updated_at)
    );
  }

  private mapToDatabase(doc: Partial<EmployeeDocument>): any {
    const db: any = {};
    if (doc.id) db.id = doc.id;
    if (doc.employeeId) db.employee_id = doc.employeeId;
    if (doc.employerId) db.employer_id = doc.employerId;
    if (doc.documentType) db.document_type = doc.documentType;
    if (doc.title) db.title = doc.title;
    if (doc.description !== undefined) db.description = doc.description;
    if (doc.fileUrl) db.file_url = doc.fileUrl;
    if (doc.fileName) db.file_name = doc.fileName;
    if (doc.fileSize !== undefined) db.file_size = doc.fileSize;
    if (doc.mimeType) db.mime_type = doc.mimeType;
    if (doc.issuedDate) db.issued_date = doc.issuedDate?.toISOString().split('T')[0] ?? null;
    if (doc.expiryDate) db.expiry_date = doc.expiryDate?.toISOString().split('T')[0] ?? null;
    if (doc.documentNumber !== undefined) db.document_number = doc.documentNumber;
    if (doc.extractedData !== undefined) db.extracted_data = doc.extractedData;
    if (doc.aiExtractedAt) db.ai_extracted_at = doc.aiExtractedAt?.toISOString() ?? null;
    if (doc.aiConfidence !== undefined) db.ai_confidence = doc.aiConfidence;
    if (doc.isVerified !== undefined) db.is_verified = doc.isVerified;
    if (doc.verifiedBy !== undefined) db.verified_by = doc.verifiedBy;
    if (doc.verifiedAt) db.verified_at = doc.verifiedAt?.toISOString() ?? null;
    if (doc.tags !== undefined) db.tags = doc.tags;
    if (doc.uploadedBy) db.uploaded_by = doc.uploadedBy;
    if (doc.uploadedByName) db.uploaded_by_name = doc.uploadedByName;
    if (doc.notes !== undefined) db.notes = doc.notes;
    if (doc.createdAt) db.created_at = doc.createdAt.toISOString();
    if (doc.updatedAt) db.updated_at = doc.updatedAt.toISOString();
    return db;
  }
}
