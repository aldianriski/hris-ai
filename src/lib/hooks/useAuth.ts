import { useAuthStore } from '../stores/authStore';

/**
 * Hook to access authenticated user data
 * Provides easy access to user, employerId, employeeId, and role
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    employerId: user?.employerId || null,
    employeeId: user?.employeeId || null,
    role: user?.role || null,
    setUser,
    logout,
  };
}

/**
 * Hook to get employerId (for employer-side features)
 * Returns null if user is not an employer or not authenticated
 */
export function useEmployerId(): string | null {
  const { user } = useAuthStore();

  if (!user || user.role !== 'employer') {
    return null;
  }

  return user.employerId || null;
}

/**
 * Hook to get employeeId (for employee-side features)
 * Returns null if user is not an employee or not authenticated
 */
export function useEmployeeId(): string | null {
  const { user } = useAuthStore();

  if (!user || user.role !== 'employee') {
    return null;
  }

  return user.employeeId || null;
}
