import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '../api/services';
import type { Employee, ListEmployeesParams } from '../api/types';
import { toast } from 'sonner';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: ListEmployeesParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

/**
 * Hook to fetch list of employees
 */
export function useEmployees(params: ListEmployeesParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.list(params),
    enabled: !!params.employerId,
  });
}

/**
 * Hook to fetch single employee
 */
export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create employee
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Employee>) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success('Karyawan berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan karyawan', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update employee
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      toast.success('Data karyawan berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui data karyawan', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete employee
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success('Karyawan berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus karyawan', {
        description: error.message,
      });
    },
  });
}
