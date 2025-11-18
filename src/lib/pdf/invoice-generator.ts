import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  tenant?: {
    name: string;
    slug: string;
  };
  line_items: InvoiceLineItem[];
  amount_subtotal: number;
  amount_tax: number;
  amount_total: number;
  tax_rate?: number;
  currency?: string;
  notes?: string;
  payment_terms?: string;
}

/**
 * Generate a PDF invoice
 */
export function generateInvoicePDF(invoice: Invoice): jsPDF {
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: `Invoice ${invoice.invoice_number}`,
    subject: 'Invoice',
    author: 'HRIS Platform',
    creator: 'HRIS Platform',
  });

  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const darkColor: [number, number, number] = [31, 41, 55]; // Dark gray
  const lightColor: [number, number, number] = [243, 244, 246]; // Light gray

  let yPos = 20;

  // Company Header
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('HRIS PLATFORM', 20, yPos);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Multi-tenant HR Management System', 20, yPos + 7);

  // Invoice Title (right side)
  doc.setFontSize(28);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 200, yPos, { align: 'right' });

  yPos += 20;

  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);

  yPos += 10;

  // Invoice Details (left) and Bill To (right)
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', 20, yPos);
  doc.text('Bill To:', 120, yPos);

  yPos += 7;

  // Invoice info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const invoiceInfo = [
    ['Invoice Number:', invoice.invoice_number],
    ['Invoice Date:', new Date(invoice.invoice_date).toLocaleDateString('id-ID')],
    ['Due Date:', new Date(invoice.due_date).toLocaleDateString('id-ID')],
    ['Status:', invoice.status.toUpperCase()],
  ];

  invoiceInfo.forEach(([label, value], index) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos + (index * 5));
    doc.setFont('helvetica', 'normal');
    doc.text(value, 55, yPos + (index * 5));
  });

  // Tenant info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(invoice.tenant?.name || 'N/A', 120, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Tenant ID: ${invoice.tenant?.slug || 'N/A'}`, 120, yPos + 5);

  yPos += 35;

  // Line Items Table
  const tableColumn = ['Description', 'Qty', 'Unit Price', 'Amount'];
  const tableRows = invoice.line_items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unit_price, invoice.currency),
    formatCurrency(item.amount, invoice.currency),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPos,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;

  // Summary Section
  yPos = finalY + 10;

  const summaryX = 130;
  const labelX = summaryX;
  const valueX = 185;

  doc.setFontSize(9);

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', labelX, yPos);
  doc.text(formatCurrency(invoice.amount_subtotal, invoice.currency), valueX, yPos, { align: 'right' });

  // Tax
  yPos += 6;
  doc.text(`Tax (${invoice.tax_rate || 11}%):`, labelX, yPos);
  doc.text(formatCurrency(invoice.amount_tax, invoice.currency), valueX, yPos, { align: 'right' });

  // Total line
  yPos += 2;
  doc.setDrawColor(...darkColor);
  doc.setLineWidth(0.3);
  doc.line(labelX, yPos, valueX, yPos);

  // Total
  yPos += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', labelX, yPos);
  doc.text(formatCurrency(invoice.amount_total, invoice.currency), valueX, yPos, { align: 'right' });

  // Payment terms and notes
  yPos += 15;

  if (invoice.payment_terms) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Terms:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    const termsLines = doc.splitTextToSize(invoice.payment_terms, 170);
    doc.text(termsLines, 20, yPos);
    yPos += (termsLines.length * 5) + 5;
  }

  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    const notesLines = doc.splitTextToSize(invoice.notes, 170);
    doc.text(notesLines, 20, yPos);
    yPos += (notesLines.length * 5);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  const footerY = pageHeight - 20;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', 105, footerY, { align: 'center' });

  doc.setFontSize(7);
  doc.text('This is a computer-generated invoice and does not require a signature.', 105, footerY + 4, { align: 'center' });

  // Page number
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 190, footerY + 4, { align: 'right' });
  }

  return doc;
}

/**
 * Format currency based on locale
 */
function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Download invoice as PDF
 */
export function downloadInvoicePDF(invoice: Invoice): void {
  const doc = generateInvoicePDF(invoice);
  doc.save(`invoice-${invoice.invoice_number}.pdf`);
}

/**
 * Get PDF as blob for email attachment
 */
export function getInvoicePDFBlob(invoice: Invoice): Blob {
  const doc = generateInvoicePDF(invoice);
  return doc.output('blob');
}

/**
 * Get PDF as base64 string
 */
export function getInvoicePDFBase64(invoice: Invoice): string {
  const doc = generateInvoicePDF(invoice);
  return doc.output('datauristring').split(',')[1];
}
