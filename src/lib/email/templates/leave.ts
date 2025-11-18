/**
 * Leave Request Email Templates
 */

import { baseEmailTemplate, htmlToPlainText } from './base';

export interface LeaveSubmittedEmailData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  dashboardUrl: string;
}

export function leaveSubmittedEmail(data: LeaveSubmittedEmailData): { html: string; text: string } {
  const content = `
    <p>Hello,</p>
    <p><strong>${data.employeeName}</strong> has submitted a leave request that requires your approval.</p>
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 8px 0;"><strong>Leave Type:</strong> ${data.leaveType}</p>
      <p style="margin: 8px 0;"><strong>Duration:</strong> ${data.startDate} to ${data.endDate} (${data.days} days)</p>
      ${data.reason ? `<p style="margin: 8px 0;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
    </div>
    <p>Please review this request at your earliest convenience.</p>
  `;

  const html = baseEmailTemplate({
    title: 'New Leave Request',
    preheader: `${data.employeeName} has submitted a leave request`,
    content,
    actionUrl: data.dashboardUrl,
    actionText: 'Review Request',
  });

  return {
    html,
    text: htmlToPlainText(html),
  };
}

export interface LeaveApprovedEmailData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  approvedBy: string;
  notes?: string;
  dashboardUrl: string;
}

export function leaveApprovedEmail(data: LeaveApprovedEmailData): { html: string; text: string } {
  const content = `
    <p>Hello ${data.employeeName},</p>
    <p>Good news! Your leave request has been <strong style="color: #10b981;">approved</strong>.</p>
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 24px 0;">
      <p style="margin: 8px 0;"><strong>Leave Type:</strong> ${data.leaveType}</p>
      <p style="margin: 8px 0;"><strong>Duration:</strong> ${data.startDate} to ${data.endDate} (${data.days} days)</p>
      <p style="margin: 8px 0;"><strong>Approved By:</strong> ${data.approvedBy}</p>
      ${data.notes ? `<p style="margin: 8px 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
    </div>
    <p>Your leave has been added to the calendar. Have a great time off!</p>
  `;

  const html = baseEmailTemplate({
    title: 'Leave Request Approved',
    preheader: 'Your leave request has been approved',
    content,
    actionUrl: data.dashboardUrl,
    actionText: 'View Dashboard',
  });

  return {
    html,
    text: htmlToPlainText(html),
  };
}

export interface LeaveRejectedEmailData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  rejectedBy: string;
  reason?: string;
  dashboardUrl: string;
}

export function leaveRejectedEmail(data: LeaveRejectedEmailData): { html: string; text: string } {
  const content = `
    <p>Hello ${data.employeeName},</p>
    <p>Your leave request has been <strong style="color: #ef4444;">rejected</strong>.</p>
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 24px 0;">
      <p style="margin: 8px 0;"><strong>Leave Type:</strong> ${data.leaveType}</p>
      <p style="margin: 8px 0;"><strong>Duration:</strong> ${data.startDate} to ${data.endDate} (${data.days} days)</p>
      <p style="margin: 8px 0;"><strong>Rejected By:</strong> ${data.rejectedBy}</p>
      ${data.reason ? `<p style="margin: 8px 0;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
    </div>
    <p>If you have any questions, please contact your manager or HR department.</p>
  `;

  const html = baseEmailTemplate({
    title: 'Leave Request Rejected',
    preheader: 'Your leave request has been rejected',
    content,
    actionUrl: data.dashboardUrl,
    actionText: 'View Dashboard',
  });

  return {
    html,
    text: htmlToPlainText(html),
  };
}
