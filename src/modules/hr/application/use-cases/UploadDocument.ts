import type { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { EmployeeDocument } from '../../domain/entities/EmployeeDocument';
import { AIDocumentExtractor } from '../../infrastructure/services/AIDocumentExtractor';
import type { UploadDocumentInput } from '../dto/DocumentDTO';

/**
 * Upload Document Use Case
 * Uploads document and optionally extracts data with AI
 */
export class UploadDocument {
  constructor(
    private documentRepository: IDocumentRepository,
    private documentExtractor: AIDocumentExtractor
  ) {}

  async execute(input: UploadDocumentInput): Promise<EmployeeDocument> {
    // Parse dates
    const issuedDate =
      input.issuedDate && typeof input.issuedDate === 'string'
        ? new Date(input.issuedDate)
        : input.issuedDate ?? null;
    const expiryDate =
      input.expiryDate && typeof input.expiryDate === 'string'
        ? new Date(input.expiryDate)
        : input.expiryDate ?? null;

    // Create document
    let document = new EmployeeDocument(
      crypto.randomUUID(),
      input.employeeId,
      input.employerId,
      input.documentType,
      input.title,
      input.description ?? null,
      input.fileUrl,
      input.fileName,
      input.fileSize,
      input.mimeType,
      issuedDate,
      expiryDate,
      input.documentNumber ?? null,
      null, // extractedData
      null, // aiExtractedAt
      null, // aiConfidence
      false, // isVerified
      null, // verifiedBy
      null, // verifiedAt
      input.tags,
      input.uploadedBy,
      input.uploadedByName,
      input.notes ?? null,
      new Date(),
      new Date()
    );

    // Extract data with AI if enabled and document type is extractable
    if (input.extractWithAI && document.isExtractableType()) {
      try {
        const extractionResult = await this.documentExtractor.autoExtract(
          input.fileUrl,
          input.mimeType,
          input.documentType
        );

        // Validate extraction
        const validation = this.documentExtractor.validateExtraction(
          input.documentType,
          extractionResult.extractedData
        );

        if (!validation.isValid) {
          console.warn('Document extraction validation failed:', validation.errors);
        }

        // Add extracted data to document
        document = document.addExtractedData(
          extractionResult.extractedData,
          extractionResult.confidence
        );

        // Auto-update document metadata from extracted data if not provided
        if (!input.documentNumber && extractionResult.extractedData.nik) {
          document = document.update({
            documentNumber: String(extractionResult.extractedData.nik),
          });
        }
      } catch (extractionError) {
        console.error('AI extraction failed:', extractionError);
        // Continue without extraction - document will be saved without extracted data
      }
    }

    return this.documentRepository.createDocument(document);
  }
}
