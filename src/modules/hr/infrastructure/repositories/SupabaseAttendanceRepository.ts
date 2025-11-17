import type { SupabaseClient } from '@supabase/supabase-js';
import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { AttendanceRecord } from '../../domain/entities/AttendanceRecord';
import { AttendanceShift } from '../../domain/entities/AttendanceShift';

export class SupabaseAttendanceRepository implements IAttendanceRepository {
  constructor(private supabase: SupabaseClient) {}

  // Attendance Records
  async findRecordById(id: string): Promise<AttendanceRecord | null> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find attendance record: ${error.message}`);
    }

    return this.mapRecordToEntity(data);
  }

  async findByEmployeeAndDate(
    employeeId: string,
    date: Date
  ): Promise<AttendanceRecord | null> {
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', dateStr)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find attendance by date: ${error.message}`);
    }

    return this.mapRecordToEntity(data);
  }

  async findByEmployeeAndDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to find attendance records: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRecordToEntity(row));
  }

  async findByEmployerAndDate(
    employerId: string,
    date: Date
  ): Promise<AttendanceRecord[]> {
    const dateStr = date.toISOString().split('T')[0];

    const { data, error} = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('employer_id', employerId)
      .eq('date', dateStr)
      .order('clock_in', { ascending: true });

    if (error) {
      throw new Error(`Failed to find attendance by employer: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRecordToEntity(row));
  }

  async findAnomalies(employerId: string, days: number): Promise<AttendanceRecord[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('employer_id', employerId)
      .eq('has_anomaly', true)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to find anomalies: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRecordToEntity(row));
  }

  async createRecord(
    record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AttendanceRecord> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .insert([this.mapRecordToDatabase(record)])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create attendance record: ${error.message}`);
    }

    return this.mapRecordToEntity(data);
  }

  async updateRecord(
    id: string,
    updates: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .update({
        ...this.mapRecordToDatabase(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update attendance record: ${error.message}`);
    }

    return this.mapRecordToEntity(data);
  }

  async deleteRecord(id: string): Promise<void> {
    const { error } = await this.supabase.from('attendance_records').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete attendance record: ${error.message}`);
    }
  }

  // Attendance Shifts
  async findShiftById(id: string): Promise<AttendanceShift | null> {
    const { data, error } = await this.supabase
      .from('attendance_shifts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find shift: ${error.message}`);
    }

    return this.mapShiftToEntity(data);
  }

  async findShiftsByEmployerId(employerId: string): Promise<AttendanceShift[]> {
    const { data, error } = await this.supabase
      .from('attendance_shifts')
      .select('*')
      .eq('employer_id', employerId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to find shifts: ${error.message}`);
    }

    return (data || []).map((row) => this.mapShiftToEntity(row));
  }

  async createShift(
    shift: Omit<AttendanceShift, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AttendanceShift> {
    const { data, error } = await this.supabase
      .from('attendance_shifts')
      .insert([this.mapShiftToDatabase(shift)])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create shift: ${error.message}`);
    }

    return this.mapShiftToEntity(data);
  }

  async updateShift(id: string, updates: Partial<AttendanceShift>): Promise<AttendanceShift> {
    const { data, error } = await this.supabase
      .from('attendance_shifts')
      .update({
        ...this.mapShiftToDatabase(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update shift: ${error.message}`);
    }

    return this.mapShiftToEntity(data);
  }

  async deleteShift(id: string): Promise<void> {
    const { error } = await this.supabase.from('attendance_shifts').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete shift: ${error.message}`);
    }
  }

  // Statistics
  async getAttendanceStats(employerId: string, month: number, year: number): Promise<{
    totalRecords: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalOvertimeHours: number;
    averageWorkHours: number;
    anomalyCount: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Total records
    const { count: totalCount } = await this.supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    // Present days (has clock_in)
    const { count: presentCount } = await this.supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .not('clock_in', 'is', null);

    // Late days
    const { count: lateCount } = await this.supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .eq('is_late', true);

    // Anomalies
    const { count: anomalyCount } = await this.supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .eq('has_anomaly', true);

    // Aggregate data for overtime and work hours
    const { data: aggregateData } = await this.supabase
      .from('attendance_records')
      .select('overtime_hours, work_hours')
      .eq('employer_id', employerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .not('clock_in', 'is', null);

    let totalOvertimeHours = 0;
    let totalWorkHours = 0;
    if (aggregateData) {
      aggregateData.forEach((row) => {
        totalOvertimeHours += row.overtime_hours || 0;
        totalWorkHours += row.work_hours || 0;
      });
    }

    const averageWorkHours = presentCount && presentCount > 0 ? totalWorkHours / presentCount : 0;
    const workingDays = endDate.getDate();
    const absentDays = workingDays - (presentCount ?? 0);

    return {
      totalRecords: totalCount ?? 0,
      presentDays: presentCount ?? 0,
      absentDays: Math.max(0, absentDays),
      lateDays: lateCount ?? 0,
      totalOvertimeHours,
      averageWorkHours,
      anomalyCount: anomalyCount ?? 0,
    };
  }

  private mapRecordToEntity(row: any): AttendanceRecord {
    return new AttendanceRecord(
      row.id,
      row.employee_id,
      row.employer_id,
      row.employee_name,
      new Date(row.date),
      row.shift_id,
      row.shift_name,
      row.expected_clock_in ? new Date(row.expected_clock_in) : null,
      row.expected_clock_out ? new Date(row.expected_clock_out) : null,
      row.clock_in ? new Date(row.clock_in) : null,
      row.clock_out ? new Date(row.clock_out) : null,
      row.clock_in_location_lat,
      row.clock_in_location_lng,
      row.clock_in_location_address,
      row.clock_out_location_lat,
      row.clock_out_location_lng,
      row.clock_out_location_address,
      row.work_hours,
      row.break_hours,
      row.overtime_hours,
      row.is_late,
      row.late_duration,
      row.has_anomaly,
      row.anomaly_type,
      row.anomaly_reason,
      row.anomaly_confidence,
      row.notes,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapRecordToDatabase(record: Partial<AttendanceRecord>): any {
    const db: any = {};

    if (record.id) db.id = record.id;
    if (record.employeeId) db.employee_id = record.employeeId;
    if (record.employerId) db.employer_id = record.employerId;
    if (record.employeeName) db.employee_name = record.employeeName;
    if (record.date) db.date = record.date.toISOString().split('T')[0];
    if (record.shiftId !== undefined) db.shift_id = record.shiftId;
    if (record.shiftName !== undefined) db.shift_name = record.shiftName;
    if (record.expectedClockIn)
      db.expected_clock_in = record.expectedClockIn?.toISOString() ?? null;
    if (record.expectedClockOut)
      db.expected_clock_out = record.expectedClockOut?.toISOString() ?? null;
    if (record.clockIn) db.clock_in = record.clockIn?.toISOString() ?? null;
    if (record.clockOut) db.clock_out = record.clockOut?.toISOString() ?? null;
    if (record.clockInLocationLat !== undefined)
      db.clock_in_location_lat = record.clockInLocationLat;
    if (record.clockInLocationLng !== undefined)
      db.clock_in_location_lng = record.clockInLocationLng;
    if (record.clockInLocationAddress !== undefined)
      db.clock_in_location_address = record.clockInLocationAddress;
    if (record.clockOutLocationLat !== undefined)
      db.clock_out_location_lat = record.clockOutLocationLat;
    if (record.clockOutLocationLng !== undefined)
      db.clock_out_location_lng = record.clockOutLocationLng;
    if (record.clockOutLocationAddress !== undefined)
      db.clock_out_location_address = record.clockOutLocationAddress;
    if (record.workHours !== undefined) db.work_hours = record.workHours;
    if (record.breakHours !== undefined) db.break_hours = record.breakHours;
    if (record.overtimeHours !== undefined) db.overtime_hours = record.overtimeHours;
    if (record.isLate !== undefined) db.is_late = record.isLate;
    if (record.lateDuration !== undefined) db.late_duration = record.lateDuration;
    if (record.hasAnomaly !== undefined) db.has_anomaly = record.hasAnomaly;
    if (record.anomalyType !== undefined) db.anomaly_type = record.anomalyType;
    if (record.anomalyReason !== undefined) db.anomaly_reason = record.anomalyReason;
    if (record.anomalyConfidence !== undefined)
      db.anomaly_confidence = record.anomalyConfidence;
    if (record.notes !== undefined) db.notes = record.notes;
    if (record.createdAt) db.created_at = record.createdAt.toISOString();
    if (record.updatedAt) db.updated_at = record.updatedAt.toISOString();

    return db;
  }

  private mapShiftToEntity(row: any): AttendanceShift {
    return new AttendanceShift(
      row.id,
      row.employer_id,
      row.name,
      row.start_time,
      row.end_time,
      row.break_duration,
      row.grace_period,
      row.location_lat,
      row.location_lng,
      row.location_radius,
      row.location_name,
      row.is_active,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapShiftToDatabase(shift: Partial<AttendanceShift>): any {
    const db: any = {};

    if (shift.id) db.id = shift.id;
    if (shift.employerId) db.employer_id = shift.employerId;
    if (shift.name) db.name = shift.name;
    if (shift.startTime) db.start_time = shift.startTime;
    if (shift.endTime) db.end_time = shift.endTime;
    if (shift.breakDuration !== undefined) db.break_duration = shift.breakDuration;
    if (shift.gracePeriod !== undefined) db.grace_period = shift.gracePeriod;
    if (shift.locationLat !== undefined) db.location_lat = shift.locationLat;
    if (shift.locationLng !== undefined) db.location_lng = shift.locationLng;
    if (shift.locationRadius !== undefined) db.location_radius = shift.locationRadius;
    if (shift.locationName !== undefined) db.location_name = shift.locationName;
    if (shift.isActive !== undefined) db.is_active = shift.isActive;
    if (shift.createdAt) db.created_at = shift.createdAt.toISOString();
    if (shift.updatedAt) db.updated_at = shift.updatedAt.toISOString();

    return db;
  }
}
