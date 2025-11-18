/**
 * Invoice Email Template
 * Generates HTML email for invoice notifications
 */

interface InvoiceEmailParams {
  invoiceNumber: string;
  tenantName: string;
  amount: string;
  dueDate: string;
  invoiceUrl?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    amount: string;
  }>;
}

export function generateInvoiceEmail(params: InvoiceEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Invoice ${params.invoiceNumber} from HRIS Platform`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .invoice-details {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .invoice-details table {
      width: 100%;
      border-collapse: collapse;
    }
    .invoice-details td {
      padding: 8px 0;
    }
    .invoice-details .label {
      font-weight: 600;
      color: #6b7280;
      width: 140px;
    }
    .invoice-details .value {
      color: #111827;
    }
    .amount-due {
      background: #3b82f6;
      color: #ffffff;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
      margin: 20px 0;
    }
    .amount-due .label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .amount-due .amount {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
    }
    .line-items {
      margin: 20px 0;
    }
    .line-items table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e5e7eb;
    }
    .line-items th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    .line-items td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .line-items tr:last-child td {
      border-bottom: none;
    }
    .button {
      display: inline-block;
      background: #3b82f6;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #2563eb;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Invoice ${params.invoiceNumber}</h1>
    </div>

    <div class="content">
      <p>Dear ${params.tenantName},</p>

      <p>Thank you for your business! Please find your invoice details below.</p>

      <div class="invoice-details">
        <table>
          <tr>
            <td class="label">Invoice Number:</td>
            <td class="value">${params.invoiceNumber}</td>
          </tr>
          <tr>
            <td class="label">Due Date:</td>
            <td class="value">${params.dueDate}</td>
          </tr>
          <tr>
            <td class="label">Customer:</td>
            <td class="value">${params.tenantName}</td>
          </tr>
        </table>
      </div>

      ${params.lineItems && params.lineItems.length > 0 ? `
      <div class="line-items">
        <h3>Items</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${params.lineItems.map(item => `
              <tr>
                <td>${item.description}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${item.unitPrice}</td>
                <td style="text-align: right;">${item.amount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="amount-due">
        <div class="label">TOTAL AMOUNT DUE</div>
        <div class="amount">${params.amount}</div>
      </div>

      <p>Please process this payment by <strong>${params.dueDate}</strong> to avoid any late fees.</p>

      ${params.invoiceUrl ? `
        <center>
          <a href="${params.invoiceUrl}" class="button">View Invoice Details</a>
        </center>
      ` : ''}

      <p>If you have any questions about this invoice, please don't hesitate to contact our support team.</p>

      <p>Best regards,<br>
      <strong>HRIS Platform Team</strong></p>
    </div>

    <div class="footer">
      <p>This is an automated message from HRIS Platform.</p>
      <p>Need help? Contact us at <a href="mailto:support@hris.com">support@hris.com</a></p>
      <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} HRIS Platform. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Invoice ${params.invoiceNumber} from HRIS Platform

Dear ${params.tenantName},

Thank you for your business! Please find your invoice details below.

Invoice Number: ${params.invoiceNumber}
Due Date: ${params.dueDate}
Customer: ${params.tenantName}

${params.lineItems && params.lineItems.length > 0 ? `
Items:
${params.lineItems.map(item => `- ${item.description}: ${item.quantity} x ${item.unitPrice} = ${item.amount}`).join('\n')}
` : ''}

TOTAL AMOUNT DUE: ${params.amount}

Please process this payment by ${params.dueDate} to avoid any late fees.

${params.invoiceUrl ? `View invoice details: ${params.invoiceUrl}` : ''}

If you have any questions about this invoice, please don't hesitate to contact our support team.

Best regards,
HRIS Platform Team

---
This is an automated message from HRIS Platform.
Need help? Contact us at support@hris.com
  `.trim();

  return { subject, html, text };
}
