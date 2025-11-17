import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  }),
}));

// Global test utilities
export const mockEmployee = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  employeeNumber: '001',
  fullName: 'John Doe',
  email: 'john@example.com',
  position: 'Software Engineer',
  department: 'Engineering',
  status: 'active' as const,
  joinDate: '2024-01-01',
};

export const mockLeaveRequest = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  employeeId: mockEmployee.id,
  leaveType: 'annual',
  startDate: '2024-12-01',
  endDate: '2024-12-05',
  totalDays: 5,
  status: 'pending' as const,
  reason: 'Family vacation',
};
