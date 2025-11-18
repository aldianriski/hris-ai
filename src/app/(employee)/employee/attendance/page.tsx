'use client';

import { useMemo } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { AttendanceClockCard } from '@/components/hr/AttendanceClockCard';
import { Card, CardBody, Chip, Skeleton } from '@heroui/react';
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTodayAttendance, useClockIn, useClockOut, useAttendanceRecords } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AttendancePage() {
  const user = useAuthStore((state) => state.user);
  const employeeId = user?.employeeId || 'emp-demo-001'; // Demo ID for testing
  const employerId = user?.employerId || 'employer-demo-001';

  // Get today's attendance record
  const { data: todayRecord, isLoading: isTodayLoading } = useTodayAttendance(employeeId);

  // Get attendance records for the current month
  const startOfMonth = useMemo((): string => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0]!;
  }, []);

  const endOfMonth = useMemo((): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date.toISOString().split('T')[0]!;
  }, []);

  const { data: monthRecords, isLoading: isMonthLoading } = useAttendanceRecords(
    employeeId,
    startOfMonth,
    endOfMonth
  );

  // Mutations
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const handleClockIn = async (location?: { latitude: number; longitude: number }) => {
    await clockInMutation.mutateAsync({
      employeeId,
      employerId,
      clockInTime: new Date().toISOString(),
      clockInLocation: location ? `${location.latitude}, ${location.longitude}` : undefined,
      clockInGps: location,
    });
  };

  const handleClockOut = async (location?: { latitude: number; longitude: number }) => {
    if (!todayRecord?.id) return;

    await clockOutMutation.mutateAsync({
      recordId: todayRecord.id,
      clockOutTime: new Date().toISOString(),
      clockOutLocation: location ? `${location.latitude}, ${location.longitude}` : undefined,
      clockOutGps: location,
    });
  };

  // Calculate summary stats
  const attendanceSummary = useMemo(() => {
    if (!monthRecords?.records) {
      return {
        thisMonth: { present: 0, late: 0, absent: 0, workingDays: 0 },
        averageClockIn: '-',
        averageClockOut: '-',
        averageWorkHours: '-',
      };
    }

    const records = monthRecords.records;
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const workingDays = records.length;

    // Calculate averages
    const clockInTimes = records
      .filter((r) => r.clockInTime)
      .map((r) => new Date(r.clockInTime!));
    const clockOutTimes = records
      .filter((r) => r.clockOutTime)
      .map((r) => new Date(r.clockOutTime!));

    const avgClockIn =
      clockInTimes.length > 0
        ? new Date(
            clockInTimes.reduce((sum, t) => sum + t.getTime(), 0) / clockInTimes.length
          ).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';

    const avgClockOut =
      clockOutTimes.length > 0
        ? new Date(
            clockOutTimes.reduce((sum, t) => sum + t.getTime(), 0) / clockOutTimes.length
          ).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';

    const totalHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
    const avgHours =
      records.length > 0
        ? `${Math.floor(totalHours / records.length)}h ${Math.round((totalHours / records.length - Math.floor(totalHours / records.length)) * 60)}m`
        : '-';

    return {
      thisMonth: { present, late, absent, workingDays },
      averageClockIn: avgClockIn,
      averageClockOut: avgClockOut,
      averageWorkHours: avgHours,
    };
  }, [monthRecords]);

  const getStatusColor = (status: 'present' | 'late' | 'absent' | 'leave' | 'holiday') => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'danger';
      case 'leave':
        return 'primary';
      case 'holiday':
        return 'default';
    }
  };

  const getStatusLabel = (status: 'present' | 'late' | 'absent' | 'leave' | 'holiday') => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'late':
        return 'Terlambat';
      case 'absent':
        return 'Tidak Hadir';
      case 'leave':
        return 'Cuti';
      case 'holiday':
        return 'Libur';
    }
  };

  return (
    <PageContainer maxWidth="2xl" className="py-6 space-y-6">
      {/* Clock Card */}
      {isTodayLoading ? (
        <Card className="border-none shadow-talixa-lg">
          <CardBody className="p-8">
            <Skeleton className="h-64 rounded-lg" />
          </CardBody>
        </Card>
      ) : (
        <AttendanceClockCard
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          isClockedIn={!!todayRecord?.clockInTime && !todayRecord?.clockOutTime}
          clockInTime={todayRecord?.clockInTime ? new Date(todayRecord.clockInTime) : undefined}
          isLoading={clockInMutation.isPending || clockOutMutation.isPending}
        />
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-talixa">
            <CardBody className="p-5">
              {isMonthLoading ? (
                <Skeleton className="h-20 rounded-lg" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bulan Ini</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {attendanceSummary.thisMonth.present}/{attendanceSummary.thisMonth.workingDays}
                    </p>
                    <p className="text-xs text-gray-500">
                      {attendanceSummary.thisMonth.late} terlambat
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-talixa">
            <CardBody className="p-5">
              {isMonthLoading ? (
                <Skeleton className="h-20 rounded-lg" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-talixa-indigo-50 dark:bg-talixa-indigo-900/20 rounded-lg">
                    <Clock className="w-6 h-6 text-talixa-indigo" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rata-rata Clock In
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {attendanceSummary.averageClockIn}
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none shadow-talixa">
            <CardBody className="p-5">
              {isMonthLoading ? (
                <Skeleton className="h-20 rounded-lg" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rata-rata Jam Kerja
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {attendanceSummary.averageWorkHours}
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Recent Attendance */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Riwayat Kehadiran
        </h2>
        <Card className="border-none shadow-talixa">
          <CardBody className="p-0">
            {isMonthLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : monthRecords?.records && monthRecords.records.length > 0 ? (
              monthRecords.records.slice(0, 10).map((record, index) => (
                <div
                  key={record.id}
                  className={`p-5 ${
                    index !== Math.min(9, monthRecords.records.length - 1)
                      ? 'border-b border-gray-100 dark:border-gray-800'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(record.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Chip color={getStatusColor(record.status)} variant="flat" size="sm">
                      {getStatusLabel(record.status)}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Clock In</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.clockInTime
                          ? new Date(record.clockInTime).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Clock Out</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.clockOutTime
                          ? new Date(record.clockOutTime).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Jam Kerja</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.workHours
                          ? `${Math.floor(record.workHours)}h ${Math.round((record.workHours - Math.floor(record.workHours)) * 60)}m`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Belum ada data kehadiran</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
