import type { SupabaseClient } from '@supabase/supabase-js';
import type { IOrganizationRepository } from '../../domain/repositories/IOrganizationRepository';
import { Department } from '../../domain/entities/Department';
import { Position } from '../../domain/entities/Position';

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findDepartmentById(id: string): Promise<Department | null> {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find department: ${error.message}`);
    }

    return this.mapDepartmentToEntity(data);
  }

  async findDepartmentsByEmployerId(
    employerId: string,
    options?: { type?: string; isActive?: boolean; parentId?: string | null }
  ): Promise<Department[]> {
    let query = this.supabase
      .from('departments')
      .select('*')
      .eq('employer_id', employerId);

    if (options?.type) query = query.eq('type', options.type);
    if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive);
    if (options?.parentId !== undefined) {
      if (options.parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', options.parentId);
      }
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(`Failed to find departments: ${error.message}`);

    return (data || []).map((row) => this.mapDepartmentToEntity(row));
  }

  async findDepartmentChildren(departmentId: string): Promise<Department[]> {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('parent_id', departmentId)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to find department children: ${error.message}`);
    return (data || []).map((row) => this.mapDepartmentToEntity(row));
  }

  async findDepartmentHierarchy(employerId: string): Promise<Array<Department & { children: Department[] }>> {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('employer_id', employerId)
      .order('level', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to find department hierarchy: ${error.message}`);

    const departments = (data || []).map((row) => this.mapDepartmentToEntity(row));
    const topLevel = departments.filter((d) => d.parentId === null);

    return topLevel.map((dept) => ({
      ...dept,
      children: departments.filter((d) => d.parentId === dept.id),
    })) as Array<Department & { children: Department[] }>;
  }

  async createDepartment(dept: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    const { data, error } = await this.supabase
      .from('departments')
      .insert([this.mapDepartmentToDatabase(dept)])
      .select()
      .single();

    if (error) throw new Error(`Failed to create department: ${error.message}`);
    return this.mapDepartmentToEntity(data);
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    const { data, error } = await this.supabase
      .from('departments')
      .update({ ...this.mapDepartmentToDatabase(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update department: ${error.message}`);
    return this.mapDepartmentToEntity(data);
  }

  async deleteDepartment(id: string): Promise<void> {
    const { error } = await this.supabase.from('departments').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete department: ${error.message}`);
  }

  async findPositionById(id: string): Promise<Position | null> {
    const { data, error } = await this.supabase
      .from('positions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find position: ${error.message}`);
    }

    return this.mapPositionToEntity(data);
  }

  async findPositionsByEmployerId(
    employerId: string,
    options?: { departmentId?: string; level?: string; jobFamily?: string; isActive?: boolean; hasOpenings?: boolean }
  ): Promise<Position[]> {
    let query = this.supabase
      .from('positions')
      .select('*')
      .eq('employer_id', employerId);

    if (options?.departmentId) query = query.eq('department_id', options.departmentId);
    if (options?.level) query = query.eq('level', options.level);
    if (options?.jobFamily) query = query.eq('job_family', options.jobFamily);
    if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive);
    if (options?.hasOpenings) query = query.lt('current_count', 'headcount');

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(`Failed to find positions: ${error.message}`);

    return (data || []).map((row) => this.mapPositionToEntity(row));
  }

  async findPositionsByDepartment(departmentId: string): Promise<Position[]> {
    const { data, error } = await this.supabase
      .from('positions')
      .select('*')
      .eq('department_id', departmentId)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to find positions by department: ${error.message}`);
    return (data || []).map((row) => this.mapPositionToEntity(row));
  }

  async createPosition(pos: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>): Promise<Position> {
    const { data, error } = await this.supabase
      .from('positions')
      .insert([this.mapPositionToDatabase(pos)])
      .select()
      .single();

    if (error) throw new Error(`Failed to create position: ${error.message}`);
    return this.mapPositionToEntity(data);
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    const { data, error } = await this.supabase
      .from('positions')
      .update({ ...this.mapPositionToDatabase(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update position: ${error.message}`);
    return this.mapPositionToEntity(data);
  }

  async deletePosition(id: string): Promise<void> {
    const { error } = await this.supabase.from('positions').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete position: ${error.message}`);
  }

  async getOrganizationStats(employerId: string): Promise<{
    totalDepartments: number;
    activeDepartments: number;
    totalPositions: number;
    activePositions: number;
    totalHeadcount: number;
    currentHeadcount: number;
    openPositions: number;
    departmentsByType: Record<string, number>;
    positionsByLevel: Record<string, number>;
  }> {
    const { count: totalDepts } = await this.supabase
      .from('departments')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId);

    const { count: activeDepts } = await this.supabase
      .from('departments')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('is_active', true);

    const { count: totalPos } = await this.supabase
      .from('positions')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId);

    const { count: activePos } = await this.supabase
      .from('positions')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('is_active', true);

    const { data: posData } = await this.supabase
      .from('positions')
      .select('headcount, current_count')
      .eq('employer_id', employerId);

    let totalHeadcount = 0;
    let currentHeadcount = 0;
    (posData || []).forEach((row) => {
      totalHeadcount += row.headcount || 0;
      currentHeadcount += row.current_count || 0;
    });

    const openPositions = totalHeadcount - currentHeadcount;

    const { data: deptTypeData } = await this.supabase
      .from('departments')
      .select('type')
      .eq('employer_id', employerId);

    const departmentsByType: Record<string, number> = {};
    (deptTypeData || []).forEach((row) => {
      departmentsByType[row.type] = (departmentsByType[row.type] || 0) + 1;
    });

    const { data: posLevelData } = await this.supabase
      .from('positions')
      .select('level')
      .eq('employer_id', employerId);

    const positionsByLevel: Record<string, number> = {};
    (posLevelData || []).forEach((row) => {
      positionsByLevel[row.level] = (positionsByLevel[row.level] || 0) + 1;
    });

    return {
      totalDepartments: totalDepts ?? 0,
      activeDepartments: activeDepts ?? 0,
      totalPositions: totalPos ?? 0,
      activePositions: activePos ?? 0,
      totalHeadcount,
      currentHeadcount,
      openPositions: Math.max(0, openPositions),
      departmentsByType,
      positionsByLevel,
    };
  }

  async getDepartmentStats(departmentId: string): Promise<{
    totalEmployees: number;
    positionsCount: number;
    openPositions: number;
    subdepartments: number;
    totalBudget: number | null;
  }> {
    const { count: employees } = await this.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('department', departmentId);

    const { count: positionsCount } = await this.supabase
      .from('positions')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', departmentId);

    const { data: posData } = await this.supabase
      .from('positions')
      .select('headcount, current_count')
      .eq('department_id', departmentId);

    let openPositions = 0;
    (posData || []).forEach((row) => {
      openPositions += (row.headcount || 0) - (row.current_count || 0);
    });

    const { count: subdepts } = await this.supabase
      .from('departments')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', departmentId);

    const { data: dept } = await this.supabase
      .from('departments')
      .select('budget')
      .eq('id', departmentId)
      .single();

    return {
      totalEmployees: employees ?? 0,
      positionsCount: positionsCount ?? 0,
      openPositions: Math.max(0, openPositions),
      subdepartments: subdepts ?? 0,
      totalBudget: dept?.budget ?? null,
    };
  }

  private mapDepartmentToEntity(row: any): Department {
    return new Department(
      row.id, row.employer_id, row.code, row.name, row.name_indonesian, row.type,
      row.parent_id, row.manager_id, row.manager_name, row.description, row.cost_center,
      row.budget, row.location, row.is_active, row.level, row.display_order,
      new Date(row.created_at), new Date(row.updated_at)
    );
  }

  private mapDepartmentToDatabase(dept: Partial<Department>): any {
    const db: any = {};
    if (dept.id) db.id = dept.id;
    if (dept.employerId) db.employer_id = dept.employerId;
    if (dept.code) db.code = dept.code;
    if (dept.name) db.name = dept.name;
    if (dept.nameIndonesian) db.name_indonesian = dept.nameIndonesian;
    if (dept.type) db.type = dept.type;
    if (dept.parentId !== undefined) db.parent_id = dept.parentId;
    if (dept.managerId !== undefined) db.manager_id = dept.managerId;
    if (dept.managerName !== undefined) db.manager_name = dept.managerName;
    if (dept.description !== undefined) db.description = dept.description;
    if (dept.costCenter !== undefined) db.cost_center = dept.costCenter;
    if (dept.budget !== undefined) db.budget = dept.budget;
    if (dept.location !== undefined) db.location = dept.location;
    if (dept.isActive !== undefined) db.is_active = dept.isActive;
    if (dept.level !== undefined) db.level = dept.level;
    if (dept.displayOrder !== undefined) db.display_order = dept.displayOrder;
    if (dept.createdAt) db.created_at = dept.createdAt.toISOString();
    if (dept.updatedAt) db.updated_at = dept.updatedAt.toISOString();
    return db;
  }

  private mapPositionToEntity(row: any): Position {
    return new Position(
      row.id, row.employer_id, row.code, row.title, row.title_indonesian, row.department_id,
      row.level, row.job_family, row.reports_to, row.description, row.responsibilities,
      row.requirements, row.min_salary, row.max_salary, row.is_active, row.headcount,
      row.current_count, row.display_order, new Date(row.created_at), new Date(row.updated_at)
    );
  }

  private mapPositionToDatabase(pos: Partial<Position>): any {
    const db: any = {};
    if (pos.id) db.id = pos.id;
    if (pos.employerId) db.employer_id = pos.employerId;
    if (pos.code) db.code = pos.code;
    if (pos.title) db.title = pos.title;
    if (pos.titleIndonesian) db.title_indonesian = pos.titleIndonesian;
    if (pos.departmentId !== undefined) db.department_id = pos.departmentId;
    if (pos.level) db.level = pos.level;
    if (pos.jobFamily !== undefined) db.job_family = pos.jobFamily;
    if (pos.reportsTo !== undefined) db.reports_to = pos.reportsTo;
    if (pos.description !== undefined) db.description = pos.description;
    if (pos.responsibilities !== undefined) db.responsibilities = pos.responsibilities;
    if (pos.requirements !== undefined) db.requirements = pos.requirements;
    if (pos.minSalary !== undefined) db.min_salary = pos.minSalary;
    if (pos.maxSalary !== undefined) db.max_salary = pos.maxSalary;
    if (pos.isActive !== undefined) db.is_active = pos.isActive;
    if (pos.headcount !== undefined) db.headcount = pos.headcount;
    if (pos.currentCount !== undefined) db.current_count = pos.currentCount;
    if (pos.displayOrder !== undefined) db.display_order = pos.displayOrder;
    if (pos.createdAt) db.created_at = pos.createdAt.toISOString();
    if (pos.updatedAt) db.updated_at = pos.updatedAt.toISOString();
    return db;
  }
}
