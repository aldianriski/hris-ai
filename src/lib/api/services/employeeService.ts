import { apiClient } from '../client';
import type { Employee, ListEmployeesParams, ListEmployeesResponse } from '../types';

export const employeeService = {
  /**
   * Get list of employees
   */
  list: async (params: ListEmployeesParams): Promise<ListEmployeesResponse> => {
    return apiClient.get('/employees', params as unknown as Record<string, string>);
  },

  /**
   * Get employee by ID
   */
  getById: async (id: string): Promise<Employee> => {
    return apiClient.get(`/employees/${id}`);
  },

  /**
   * Create new employee
   */
  create: async (data: Partial<Employee>): Promise<Employee> => {
    return apiClient.post('/employees', data);
  },

  /**
   * Update employee
   */
  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    return apiClient.patch(`/employees/${id}`, data);
  },

  /**
   * Delete employee
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/employees/${id}`);
  },
};
