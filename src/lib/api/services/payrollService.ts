import { apiClient } from '../client';
import type {
  PayrollPeriod,
  PayrollDetail,
  CreatePayrollPeriodData,
  ListPayrollPeriodsParams,
  ListPayrollPeriodsResponse,
} from '../types';

export const payrollService = {
  /**
   * Get list of payroll periods
   */
  listPeriods: async (
    params: ListPayrollPeriodsParams
  ): Promise<ListPayrollPeriodsResponse> => {
    return apiClient.get('/payroll/periods', params as unknown as Record<string, string>);
  },

  /**
   * Get payroll period by ID
   */
  getPeriodById: async (id: string): Promise<PayrollPeriod> => {
    return apiClient.get(`/payroll/periods/${id}`);
  },

  /**
   * Create new payroll period
   */
  createPeriod: async (data: CreatePayrollPeriodData): Promise<PayrollPeriod> => {
    return apiClient.post('/payroll/periods', data);
  },

  /**
   * Process payroll for a period
   */
  processPeriod: async (periodId: string): Promise<{ message: string }> => {
    return apiClient.post(`/payroll/periods/${periodId}/process`);
  },

  /**
   * Approve payroll period
   */
  approvePeriod: async (periodId: string): Promise<PayrollPeriod> => {
    return apiClient.post(`/payroll/periods/${periodId}/approve`);
  },

  /**
   * Mark payroll period as paid
   */
  markAsPaid: async (periodId: string): Promise<PayrollPeriod> => {
    return apiClient.post(`/payroll/periods/${periodId}/mark-paid`);
  },

  /**
   * Get payroll details for a period
   */
  getPeriodDetails: async (periodId: string): Promise<PayrollDetail[]> => {
    return apiClient.get(`/payroll/periods/${periodId}/details`);
  },

  /**
   * Update payroll detail
   */
  updateDetail: async (
    detailId: string,
    data: Partial<PayrollDetail>
  ): Promise<PayrollDetail> => {
    return apiClient.patch(`/payroll/details/${detailId}`, data);
  },

  /**
   * Delete payroll period
   */
  deletePeriod: async (periodId: string): Promise<{ message: string }> => {
    return apiClient.delete(`/payroll/periods/${periodId}`);
  },
};
