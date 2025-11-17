import type { SupabaseClient } from '@supabase/supabase-js';
import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import { Employee } from '../../domain/entities/Employee';

export class SupabaseEmployeeRepository implements IEmployeeRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Employee | null> {
    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to find employee: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<Employee | null> {
    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('employee_number', employeeNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find employee by number: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find employee by email: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmployerId(
    employerId: string,
    options?: {
      status?: string;
      department?: string;
      position?: string;
      employmentType?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    employees: Employee[];
    total: number;
  }> {
    let query = this.supabase
      .from('employees')
      .select('*', { count: 'exact' })
      .eq('employer_id', employerId);

    // Apply filters
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.department) {
      query = query.eq('department', options.department);
    }

    if (options?.position) {
      query = query.eq('position', options.position);
    }

    if (options?.employmentType) {
      query = query.eq('employment_type', options.employmentType);
    }

    if (options?.search) {
      query = query.or(
        `full_name.ilike.%${options.search}%,employee_number.ilike.%${options.search}%,email.ilike.%${options.search}%`
      );
    }

    // Pagination
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    // Order by created date
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find employees: ${error.message}`);
    }

    return {
      employees: (data || []).map((row) => this.mapToEntity(row)),
      total: count ?? 0,
    };
  }

  async findExpiringContracts(
    employerId: string,
    daysUntilExpiry: number
  ): Promise<Employee[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('employer_id', employerId)
      .eq('employment_type', 'PKWT')
      .eq('status', 'active')
      .not('contract_end_date', 'is', null)
      .lte('contract_end_date', futureDate.toISOString())
      .gte('contract_end_date', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to find expiring contracts: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async findByManager(managerId: string): Promise<Employee[]> {
    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('manager_id', managerId)
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to find employees by manager: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const { data, error } = await this.supabase
      .from('employees')
      .insert([this.mapToDatabase(employee)])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await this.supabase
      .from('employees')
      .update({
        ...this.mapToDatabase(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('employees').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  async getLastEmployeeNumber(employerId: string, year: number): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('employees')
      .select('employee_number')
      .eq('employer_id', employerId)
      .like('employee_number', `EMP-${year}-%`)
      .order('employee_number', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get last employee number: ${error.message}`);
    }

    return data?.employee_number ?? null;
  }

  async getStats(employerId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    probationEmployees: number;
    pkwtEmployees: number;
    pkwttEmployees: number;
    averageTenure: number;
  }> {
    // Total employees
    const { count: totalCount } = await this.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId);

    // Active employees
    const { count: activeCount } = await this.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('status', 'active');

    // Probation employees
    const { count: probationCount } = await this.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('status', 'probation');

    // PKWT employees
    const { count: pkwtCount } = await this.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('employment_type', 'PKWT')
      .eq('status', 'active');

    // PKWTT employees
    const { count: pkwttCount } = await this.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('employment_type', 'PKWTT')
      .eq('status', 'active');

    // Average tenure (simplified - calculate on client side)
    const { data: employeesForTenure } = await this.supabase
      .from('employees')
      .select('join_date')
      .eq('employer_id', employerId)
      .eq('status', 'active');

    let averageTenure = 0;
    if (employeesForTenure && employeesForTenure.length > 0) {
      const now = new Date();
      const totalMonths = employeesForTenure.reduce((sum, emp) => {
        const joinDate = new Date(emp.join_date);
        const months =
          (now.getFullYear() - joinDate.getFullYear()) * 12 +
          (now.getMonth() - joinDate.getMonth());
        return sum + months;
      }, 0);
      averageTenure = totalMonths / employeesForTenure.length;
    }

    return {
      totalEmployees: totalCount ?? 0,
      activeEmployees: activeCount ?? 0,
      probationEmployees: probationCount ?? 0,
      pkwtEmployees: pkwtCount ?? 0,
      pkwttEmployees: pkwttCount ?? 0,
      averageTenure,
    };
  }

  private mapToEntity(row: any): Employee {
    return new Employee(
      row.id,
      row.employer_id,
      row.employee_number,
      row.full_name,
      row.email,
      row.phone_number,
      row.gender,
      new Date(row.date_of_birth),
      row.place_of_birth,
      row.marital_status,
      row.number_of_dependents,
      row.address,
      row.city,
      row.province,
      row.postal_code,
      row.nik,
      row.npwp,
      row.bpjs_kesehatan_number,
      row.bpjs_ketenagakerjaan_number,
      new Date(row.join_date),
      row.probation_end_date ? new Date(row.probation_end_date) : null,
      row.employment_type,
      row.contract_start_date ? new Date(row.contract_start_date) : null,
      row.contract_end_date ? new Date(row.contract_end_date) : null,
      row.status,
      row.termination_date ? new Date(row.termination_date) : null,
      row.termination_reason,
      row.department,
      row.position,
      row.job_level,
      row.manager_id,
      row.manager_name,
      row.work_location,
      row.salary_base,
      row.transport_allowance,
      row.meal_allowance,
      row.housing_allowance,
      row.other_allowances,
      row.bank_name,
      row.bank_account_number,
      row.bank_account_holder,
      row.emergency_contact_name,
      row.emergency_contact_relationship,
      row.emergency_contact_phone,
      row.notes,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapToDatabase(employee: Partial<Employee>): any {
    const db: any = {};

    if (employee.id) db.id = employee.id;
    if (employee.employerId) db.employer_id = employee.employerId;
    if (employee.employeeNumber) db.employee_number = employee.employeeNumber;
    if (employee.fullName) db.full_name = employee.fullName;
    if (employee.email) db.email = employee.email;
    if (employee.phoneNumber) db.phone_number = employee.phoneNumber;
    if (employee.gender) db.gender = employee.gender;
    if (employee.dateOfBirth) db.date_of_birth = employee.dateOfBirth.toISOString();
    if (employee.placeOfBirth) db.place_of_birth = employee.placeOfBirth;
    if (employee.maritalStatus) db.marital_status = employee.maritalStatus;
    if (employee.numberOfDependents !== undefined)
      db.number_of_dependents = employee.numberOfDependents;
    if (employee.address) db.address = employee.address;
    if (employee.city) db.city = employee.city;
    if (employee.province) db.province = employee.province;
    if (employee.postalCode) db.postal_code = employee.postalCode;
    if (employee.nik) db.nik = employee.nik;
    if (employee.npwp) db.npwp = employee.npwp;
    if (employee.bpjsKesehatanNumber) db.bpjs_kesehatan_number = employee.bpjsKesehatanNumber;
    if (employee.bpjsKetenagakerjaanNumber)
      db.bpjs_ketenagakerjaan_number = employee.bpjsKetenagakerjaanNumber;
    if (employee.joinDate) db.join_date = employee.joinDate.toISOString();
    if (employee.probationEndDate)
      db.probation_end_date = employee.probationEndDate?.toISOString() ?? null;
    if (employee.employmentType) db.employment_type = employee.employmentType;
    if (employee.contractStartDate)
      db.contract_start_date = employee.contractStartDate?.toISOString() ?? null;
    if (employee.contractEndDate)
      db.contract_end_date = employee.contractEndDate?.toISOString() ?? null;
    if (employee.status) db.status = employee.status;
    if (employee.terminationDate)
      db.termination_date = employee.terminationDate?.toISOString() ?? null;
    if (employee.terminationReason !== undefined)
      db.termination_reason = employee.terminationReason;
    if (employee.department !== undefined) db.department = employee.department;
    if (employee.position !== undefined) db.position = employee.position;
    if (employee.jobLevel !== undefined) db.job_level = employee.jobLevel;
    if (employee.managerId !== undefined) db.manager_id = employee.managerId;
    if (employee.managerName !== undefined) db.manager_name = employee.managerName;
    if (employee.workLocation !== undefined) db.work_location = employee.workLocation;
    if (employee.salaryBase !== undefined) db.salary_base = employee.salaryBase;
    if (employee.transportAllowance !== undefined)
      db.transport_allowance = employee.transportAllowance;
    if (employee.mealAllowance !== undefined) db.meal_allowance = employee.mealAllowance;
    if (employee.housingAllowance !== undefined)
      db.housing_allowance = employee.housingAllowance;
    if (employee.otherAllowances !== undefined) db.other_allowances = employee.otherAllowances;
    if (employee.bankName !== undefined) db.bank_name = employee.bankName;
    if (employee.bankAccountNumber !== undefined)
      db.bank_account_number = employee.bankAccountNumber;
    if (employee.bankAccountHolder !== undefined)
      db.bank_account_holder = employee.bankAccountHolder;
    if (employee.emergencyContactName !== undefined)
      db.emergency_contact_name = employee.emergencyContactName;
    if (employee.emergencyContactRelationship !== undefined)
      db.emergency_contact_relationship = employee.emergencyContactRelationship;
    if (employee.emergencyContactPhone !== undefined)
      db.emergency_contact_phone = employee.emergencyContactPhone;
    if (employee.notes !== undefined) db.notes = employee.notes;
    if (employee.createdAt) db.created_at = employee.createdAt.toISOString();
    if (employee.updatedAt) db.updated_at = employee.updatedAt.toISOString();

    return db;
  }
}
