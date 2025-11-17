import { apiClient } from '../client';
import type {
  LeaveRequest,
  LeaveBalance,
  CreateLeaveRequestData,
  ListLeaveRequestsParams,
  ListLeaveRequestsResponse,
} from '../types';

export const leaveService = {
  /**
   * Get leave requests
   */
  list: async (params: ListLeaveRequestsParams): Promise<ListLeaveRequestsResponse> => {
    return apiClient.get('/leave/requests', params as Record<string, string>);
  },

  /**
   * Get leave request by ID
   */
  getById: async (id: string): Promise<LeaveRequest> => {
    return apiClient.get(`/leave/requests/${id}`);
  },

  /**
   * Create leave request
   */
  create: async (data: CreateLeaveRequestData): Promise<LeaveRequest> => {
    return apiClient.post('/leave/requests', data);
  },

  /**
   * Update leave request (approve/reject)
   */
  update: async (
    id: string,
    data: Partial<LeaveRequest>
  ): Promise<LeaveRequest> => {
    return apiClient.patch(`/leave/requests/${id}`, data);
  },

  /**
   * Delete leave request
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/leave/requests/${id}`);
  },

  /**
   * Get leave balance for employee
   */
  getBalance: async (employeeId: string): Promise<LeaveBalance> => {
    return apiClient.get(`/leave/balances/${employeeId}`);
  },
};
