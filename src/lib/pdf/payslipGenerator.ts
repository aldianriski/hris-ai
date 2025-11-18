import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PayrollDetail } from '@/lib/api/types';
import { format } from 'date-fns';

interface PayslipData {
  employeeName: string;
  employeeNumber: string;
  position: string;
  department: string;
  period: string;
  baseSalary: number;
  allowances: number;
  overtime: number;
  grossSalary: number;
  bpjsKesehatan: number;
  bpjsJHT: number;
  bpjsJP: number;
  pph21: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

export class PayslipGenerator {
  /**
   * Generate payslip PDF for a single employee
   */
  static generatePayslip(data: PayslipData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYSLIP', pageWidth / 2, 20, { align: 'center' });

    // Period
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${data.period}`, pageWidth / 2, 28, { align: 'center' });

    // Employee Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information', 14, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const employeeInfo = [
      ['Name', ':', data.employeeName],
      ['Employee Number', ':', data.employeeNumber],
      ['Position', ':', data.position],
      ['Department', ':', data.department],
    ];

    let yPos = 52;
    employeeInfo.forEach((row) => {
      doc.text(row[0], 14, yPos);
      doc.text(row[1], 60, yPos);
      doc.text(row[2], 65, yPos);
      yPos += 6;
    });

    // Earnings
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Earnings', 14, yPos);

    yPos += 8;
    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Amount']],
      body: [
        ['Base Salary', `Rp ${data.baseSalary.toLocaleString('id-ID')}`],
        ['Allowances', `Rp ${data.allowances.toLocaleString('id-ID')}`],
        ['Overtime', `Rp ${data.overtime.toLocaleString('id-ID')}`],
      ],
      foot: [['Gross Salary', `Rp ${data.grossSalary.toLocaleString('id-ID')}`]],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });

    // Deductions
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Deductions', 14, yPos);

    yPos += 8;
    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Amount']],
      body: [
        ['BPJS Kesehatan (1%)', `Rp ${data.bpjsKesehatan.toLocaleString('id-ID')}`],
        ['BPJS JHT (2%)', `Rp ${data.bpjsJHT.toLocaleString('id-ID')}`],
        ['BPJS JP (1%)', `Rp ${data.bpjsJP.toLocaleString('id-ID')}`],
        ['PPh21 Tax', `Rp ${data.pph21.toLocaleString('id-ID')}`],
        ['Other Deductions', `Rp ${data.otherDeductions.toLocaleString('id-ID')}`],
      ],
      foot: [['Total Deductions', `Rp ${data.totalDeductions.toLocaleString('id-ID')}`]],
      theme: 'grid',
      headStyles: { fillColor: [217, 83, 79] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });

    // Net Salary
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(92, 184, 92);
    doc.rect(14, yPos - 5, pageWidth - 28, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('NET SALARY', 18, yPos + 2);
    doc.text(`Rp ${data.netSalary.toLocaleString('id-ID')}`, pageWidth - 18, yPos + 2, {
      align: 'right',
    });
    doc.setTextColor(0, 0, 0);

    // Footer
    yPos += 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated document. No signature is required.', 14, yPos);
    doc.text(
      `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
      14,
      yPos + 5
    );

    return doc;
  }

  /**
   * Download payslip as PDF
   */
  static downloadPayslip(data: PayslipData, filename?: string): void {
    const doc = this.generatePayslip(data);
    const defaultFilename = `Payslip_${data.employeeNumber}_${data.period}.pdf`;
    doc.save(filename || defaultFilename);
  }

  /**
   * Generate multiple payslips and download as ZIP
   */
  static async downloadBulkPayslips(payslips: PayslipData[]): Promise<void> {
    // TODO: Implement ZIP generation using JSZip
    console.log('Bulk download not yet implemented');
    alert('Bulk download feature coming soon!');
  }
}
