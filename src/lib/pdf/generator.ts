/**
 * PDF Generator
 * Generates PDFs using @react-pdf/renderer
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { PayslipDocument, type PayslipData } from './payslip-template';

export interface PDFGenerationResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

/**
 * Generate payslip PDF
 */
export async function generatePayslipPDF(data: PayslipData): Promise<PDFGenerationResult> {
  try {
    // Create PDF document
    const doc = PayslipDocument(data);

    // Render to buffer
    const buffer = await renderToBuffer(doc);

    return {
      success: true,
      buffer: Buffer.from(buffer),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF',
    };
  }
}

/**
 * Generate payslip PDF and return as base64
 */
export async function generatePayslipPDFBase64(data: PayslipData): Promise<{
  success: boolean;
  base64?: string;
  error?: string;
}> {
  const result = await generatePayslipPDF(data);

  if (!result.success || !result.buffer) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    base64: result.buffer.toString('base64'),
  };
}
