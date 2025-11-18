import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth, useEmployerId, useEmployeeId } from '../useAuth';
import { useAuthStore } from '../../stores/authStore';

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user data from auth store', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'employer' as const,
      employerId: 'employer-1',
      employeeId: null,
    };

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.employerId).toBe('employer-1');
    expect(result.current.employeeId).toBe(null);
    expect(result.current.role).toBe('employer');
  });

  it('should return null for employerId when user has no employerId', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'employee', employeeId: 'emp-1' },
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.employerId).toBe(null);
    expect(result.current.employeeId).toBe('emp-1');
  });

  it('should return null values when user is not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.employerId).toBe(null);
    expect(result.current.employeeId).toBe(null);
    expect(result.current.role).toBe(null);
  });

  it('should provide setUser and logout functions', () => {
    const mockSetUser = vi.fn();
    const mockLogout = vi.fn();

    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: mockSetUser,
      logout: mockLogout,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.setUser).toBe(mockSetUser);
    expect(result.current.logout).toBe(mockLogout);
  });
});

describe('useEmployerId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return employerId for employer user', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'employer',
        employerId: 'employer-123',
      },
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useEmployerId());

    expect(result.current).toBe('employer-123');
  });

  it('should return null for employee user', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'employee',
        employeeId: 'emp-123',
      },
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useEmployerId());

    expect(result.current).toBe(null);
  });

  it('should return null when user is not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useEmployerId());

    expect(result.current).toBe(null);
  });

  it('should return null when employer has no employerId', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'employer',
      },
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useEmployerId());

    expect(result.current).toBe(null);
  });
});

describe('useEmployeeId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return employeeId for employee user', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'employee',
        employeeId: 'emp-456',
      },
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useEmployeeId());

    expect(result.current).toBe('emp-456');
  });

  it('should return null for employer user', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'employer',
        employerId: 'employer-123',
      },
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useEmployeeId());

    expect(result.current).toBe(null);
  });

  it('should return null when user is not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useEmployeeId());

    expect(result.current).toBe(null);
  });

  it('should return null when employee has no employeeId', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'employee',
      },
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { result } = renderHook(() => useEmployeeId());

    expect(result.current).toBe(null);
  });
});
