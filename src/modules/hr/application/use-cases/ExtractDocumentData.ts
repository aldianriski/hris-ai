import type { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import type { EmployeeDocument } from '../../domain/entities/EmployeeDocument';
import { AIDocumentExtractor } from '../../infrastructure/services/AIDocumentExtractor';
import type { ExtractDocumentInput } from '../dto/DocumentDTO';

/**
 * Extract Document Data Use Case
 * Re-extracts or extracts data from existing document
 */
export class ExtractDocumentData {
  constructor(
    private documentRepository: IDocumentRepository,
    private documentExtractor: AIDocumentExtractor
  ) {}

  async execute(input: ExtractDocumentInput): Promise<EmployeeDocument> {
    // Get document
    const document = await this.documentRepository.findDocumentById(input.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if extraction is needed
    if (!input.forceReExtract && document.extractedData !== null) {
      throw new Error('Document already has extracted data. Use forceReExtract=true to re-extract.');
    }

    // Check if document type is extractable
    if (!document.isExtractableType()) {
      throw new Error(`Document type ${document.documentType} does not support AI extraction`);
    }

    // Extract data
    const extractionResult = await this.documentExtractor.autoExtract(
      document.fileUrl,
      document.mimeType,
      document.documentType
    );

    // Validate extraction
    const validation = this.documentExtractor.validateExtraction(
      document.documentType,
      extractionResult.extractedData
    );

    if (!validation.isValid) {
      console.warn('Document extraction validation failed:', validation.errors);
      // Continue anyway - HR can verify manually
    }

    // Update document with extracted data
    let updatedDocument = document.addExtractedData(
      extractionResult.extractedData,
      extractionResult.confidence
    );

    // Auto-update document number if extracted
    if (extractionResult.extractedData.nik && !document.documentNumber) {
      updatedDocument = updatedDocument.update({
        documentNumber: String(extractionResult.extractedData.nik),
      });
    }

    if (extractionResult.extractedData.npwpNumber && !document.documentNumber) {
      updatedDocument = updatedDocument.update({
        documentNumber: String(extractionResult.extractedData.npwpNumber),
      });
    }

    if (extractionResult.extractedData.cardNumber && !document.documentNumber) {
      updatedDocument = updatedDocument.update({
        documentNumber: String(extractionResult.extractedData.cardNumber),
      });
    }

    return this.documentRepository.updateDocument(document.id, updatedDocument);
  }
}
