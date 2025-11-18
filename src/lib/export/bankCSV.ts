import { PayrollDetail } from '@/lib/api/types';

export type BankFormat = 'BCA' | 'Mandiri' | 'BRI' | 'BNI';

interface BankTransferData {
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
}

export class BankCSVExporter {
  /**
   * Generate CSV for BCA bank format
   */
  static generateBCACSV(transfers: BankTransferData[]): string {
    // BCA Format: Account,Name,Amount,Description
    let csv = 'Account Number,Account Name,Amount,Description\n';

    transfers.forEach((transfer) => {
      csv += `${transfer.accountNumber},${transfer.accountName},${transfer.amount},${transfer.description}\n`;
    });

    return csv;
  }

  /**
   * Generate CSV for Mandiri bank format
   */
  static generateMandiriCSV(transfers: BankTransferData[]): string {
    // Mandiri Format: Account Number,Beneficiary Name,Amount,Remark
    let csv = 'Account Number,Beneficiary Name,Amount,Remark\n';

    transfers.forEach((transfer) => {
      csv += `${transfer.accountNumber},${transfer.accountName},${transfer.amount},${transfer.description}\n`;
    });

    return csv;
  }

  /**
   * Generate CSV for BRI bank format
   */
  static generateBRICSV(transfers: BankTransferData[]): string {
    // BRI Format: Account No,Name,Amount,Notes
    let csv = 'Account No,Name,Amount,Notes\n';

    transfers.forEach((transfer) => {
      csv += `${transfer.accountNumber},${transfer.accountName},${transfer.amount},${transfer.description}\n`;
    });

    return csv;
  }

  /**
   * Generate CSV for BNI bank format
   */
  static generateBNICSV(transfers: BankTransferData[]): string {
    // BNI Format: Rekening Tujuan,Nama Penerima,Nominal,Berita
    let csv = 'Rekening Tujuan,Nama Penerima,Nominal,Berita\n';

    transfers.forEach((transfer) => {
      csv += `${transfer.accountNumber},${transfer.accountName},${transfer.amount},${transfer.description}\n`;
    });

    return csv;
  }

  /**
   * Generate CSV based on bank format
   */
  static generateCSV(
    format: BankFormat,
    transfers: BankTransferData[]
  ): string {
    switch (format) {
      case 'BCA':
        return this.generateBCACSV(transfers);
      case 'Mandiri':
        return this.generateMandiriCSV(transfers);
      case 'BRI':
        return this.generateBRICSV(transfers);
      case 'BNI':
        return this.generateBNICSV(transfers);
      default:
        throw new Error(`Unsupported bank format: ${format}`);
    }
  }

  /**
   * Download CSV file
   */
  static downloadCSV(
    format: BankFormat,
    transfers: BankTransferData[],
    filename?: string
  ): void {
    const csv = this.generateCSV(format, transfers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename || `Payroll_${format}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Convert payroll details to bank transfer data
   */
  static payrollToTransfers(
    payrollDetails: PayrollDetail[],
    period: string
  ): BankTransferData[] {
    return payrollDetails.map((detail) => ({
      // TODO: Get actual bank account from employee data
      accountNumber: '1234567890', // Placeholder
      accountName: detail.employeeName,
      amount: detail.netSalary,
      description: `Salary ${period}`,
    }));
  }

  /**
   * Validate bank account number
   */
  static validateAccountNumber(
    accountNumber: string,
    format: BankFormat
  ): boolean {
    // Basic validation - can be enhanced with specific bank rules
    const cleaned = accountNumber.replace(/\s/g, '');

    switch (format) {
      case 'BCA':
        return /^\d{10}$/.test(cleaned); // BCA: 10 digits
      case 'Mandiri':
        return /^\d{13}$/.test(cleaned); // Mandiri: 13 digits
      case 'BRI':
        return /^\d{15}$/.test(cleaned); // BRI: 15 digits
      case 'BNI':
        return /^\d{10}$/.test(cleaned); // BNI: 10 digits
      default:
        return false;
    }
  }
}
