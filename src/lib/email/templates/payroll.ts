/**
 * Payroll Email Templates
 */

import { baseEmailTemplate, htmlToPlainText } from './base';

export interface PayslipReadyEmailData {
  employeeName: string;
  month: string;
  year: number;
  netSalary: number;
  downloadUrl: string;
  dashboardUrl: string;
}

export function payslipReadyEmail(data: PayslipReadyEmailData): { html: string; text: string } {
  const formattedSalary = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(data.netSalary);

  const content = `
    <p>Hello ${data.employeeName},</p>
    <p>Your payslip for <strong>${data.month} ${data.year}</strong> is now available.</p>
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 24px 0;">
      <p style="margin: 8px 0; font-size: 14px; color: #6b7280;">Net Salary</p>
      <p style="margin: 8px 0; font-size: 28px; font-weight: 700; color: #10b981;">${formattedSalary}</p>
    </div>
    <p>You can download your payslip by clicking the button below. The payslip contains:</p>
    <ul style="color: #6b7280; line-height: 1.8;">
      <li>Base salary and allowances</li>
      <li>Deductions (BPJS, Tax)</li>
      <li>Net salary details</li>
    </ul>
    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      <em>Note: Keep your payslip confidential and store it securely.</em>
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Payslip Ready',
    preheader: `Your payslip for ${data.month} ${data.year} is ready`,
    content,
    actionUrl: data.downloadUrl,
    actionText: 'Download Payslip',
  });

  return {
    html,
    text: htmlToPlainText(html),
  };
}
