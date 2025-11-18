import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../useEmployees';
import { employeeService } from '../../api/services';
import { toast } from 'sonner';

vi.mock('../../api/services', () => ({
  employeeService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useEmployees', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useEmployees', () => {
    it('should fetch employees list', async () => {
      const mockEmployees = {
        data: [
          { id: 'emp-1', fullName: 'John Doe', email: 'john@example.com' },
          { id: 'emp-2', fullName: 'Jane Smith', email: 'jane@example.com' },
        ],
        total: 2,
      };

      vi.mocked(employeeService.list).mockResolvedValue(mockEmployees);

      const { result } = renderHook(
        () => useEmployees({ employerId: 'employer-1', limit: 10, offset: 0 }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockEmployees);
      expect(employeeService.list).toHaveBeenCalledWith({
        employerId: 'employer-1',
        limit: 10,
        offset: 0,
      });
    });

    it('should not fetch when employerId is missing', () => {
      const { result } = renderHook(
        () => useEmployees({ employerId: '', limit: 10, offset: 0 }),
        { wrapper }
      );

      expect(result.current.isPending).toBe(true);
      expect(employeeService.list).not.toHaveBeenCalled();
    });
  });

  describe('useEmployee', () => {
    it('should fetch single employee', async () => {
      const mockEmployee = {
        id: 'emp-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
      };

      vi.mocked(employeeService.getById).mockResolvedValue(mockEmployee);

      const { result } = renderHook(() => useEmployee('emp-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockEmployee);
      expect(employeeService.getById).toHaveBeenCalledWith('emp-1');
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useEmployee(''), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(employeeService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateEmployee', () => {
    it('should create employee and show success toast', async () => {
      const newEmployee = { fullName: 'New Employee', email: 'new@example.com' };
      vi.mocked(employeeService.create).mockResolvedValue({ id: 'emp-3', ...newEmployee } as any);

      const { result } = renderHook(() => useCreateEmployee(), { wrapper });

      result.current.mutate(newEmployee);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(employeeService.create).toHaveBeenCalledWith(newEmployee);
      expect(toast.success).toHaveBeenCalledWith('Karyawan berhasil ditambahkan');
    });

    it('should show error toast on failure', async () => {
      const error = new Error('Failed to create');
      vi.mocked(employeeService.create).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateEmployee(), { wrapper });

      result.current.mutate({ fullName: 'Test' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Gagal menambahkan karyawan', {
        description: 'Failed to create',
      });
    });
  });

  describe('useUpdateEmployee', () => {
    it('should update employee and show success toast', async () => {
      const updateData = { fullName: 'Updated Name' };
      vi.mocked(employeeService.update).mockResolvedValue({ id: 'emp-1', ...updateData } as any);

      const { result } = renderHook(() => useUpdateEmployee(), { wrapper });

      result.current.mutate({ id: 'emp-1', data: updateData });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(employeeService.update).toHaveBeenCalledWith('emp-1', updateData);
      expect(toast.success).toHaveBeenCalledWith('Data karyawan berhasil diperbarui');
    });

    it('should show error toast on failure', async () => {
      const error = new Error('Update failed');
      vi.mocked(employeeService.update).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateEmployee(), { wrapper });

      result.current.mutate({ id: 'emp-1', data: { fullName: 'Test' } });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Gagal memperbarui data karyawan', {
        description: 'Update failed',
      });
    });
  });

  describe('useDeleteEmployee', () => {
    it('should delete employee and show success toast', async () => {
      vi.mocked(employeeService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteEmployee(), { wrapper });

      result.current.mutate('emp-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(employeeService.delete).toHaveBeenCalledWith('emp-1');
      expect(toast.success).toHaveBeenCalledWith('Karyawan berhasil dihapus');
    });

    it('should show error toast on failure', async () => {
      const error = new Error('Delete failed');
      vi.mocked(employeeService.delete).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteEmployee(), { wrapper });

      result.current.mutate('emp-1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Gagal menghapus karyawan', {
        description: 'Delete failed',
      });
    });
  });
});
