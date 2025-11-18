import type { Department } from '../entities/Department';
import type { Position } from '../entities/Position';

export interface IOrganizationRepository {
  // Departments
  findDepartmentById(id: string): Promise<Department | null>;

  findDepartmentsByEmployerId(
    employerId: string,
    options?: {
      type?: string;
      isActive?: boolean;
      parentId?: string | null;
    }
  ): Promise<Department[]>;

  findDepartmentChildren(departmentId: string): Promise<Department[]>;

  findDepartmentHierarchy(employerId: string): Promise<
    Array<
      Department & {
        children: Department[];
      }
    >
  >;

  createDepartment(
    department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Department>;

  updateDepartment(id: string, updates: Partial<Department>): Promise<Department>;

  deleteDepartment(id: string): Promise<void>;

  // Positions
  findPositionById(id: string): Promise<Position | null>;

  findPositionsByEmployerId(
    employerId: string,
    options?: {
      departmentId?: string;
      level?: string;
      jobFamily?: string;
      isActive?: boolean;
      hasOpenings?: boolean;
    }
  ): Promise<Position[]>;

  findPositionsByDepartment(departmentId: string): Promise<Position[]>;

  createPosition(
    position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Position>;

  updatePosition(id: string, updates: Partial<Position>): Promise<Position>;

  deletePosition(id: string): Promise<void>;

  // Statistics
  getOrganizationStats(employerId: string): Promise<{
    totalDepartments: number;
    activeDepartments: number;
    totalPositions: number;
    activePositions: number;
    totalHeadcount: number;
    currentHeadcount: number;
    openPositions: number;
    departmentsByType: Record<string, number>;
    positionsByLevel: Record<string, number>;
  }>;

  getDepartmentStats(departmentId: string): Promise<{
    totalEmployees: number;
    positionsCount: number;
    openPositions: number;
    subdepartments: number;
    totalBudget: number | null;
  }>;
}
