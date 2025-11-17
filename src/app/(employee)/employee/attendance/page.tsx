'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { AttendanceClockCard } from '@/components/hr/AttendanceClockCard';
import { Card, CardBody, Chip } from '@heroui/react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleClockIn = async (location?: { latitude: number; longitude: number }) => {
    setIsLoading(true);
    try {
      // TODO: Call API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const now = new Date();
      setIsClockedIn(true);
      setClockInTime(now);
      toast.success('Clock in berhasil!', {
        description: `Anda clock in pada ${now.toLocaleTimeString('id-ID')}`,
      });
    } catch (error) {
      toast.error('Gagal clock in', {
        description: 'Silakan coba lagi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async (location?: { latitude: number; longitude: number }) => {
    setIsLoading(true);
    try {
      // TODO: Call API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const now = new Date();
      setIsClockedIn(false);
      setClockInTime(undefined);
      toast.success('Clock out berhasil!', {
        description: `Anda clock out pada ${now.toLocaleTimeString('id-ID')}`,
      });
    } catch (error) {
      toast.error('Gagal clock out', {
        description: 'Silakan coba lagi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const attendanceSummary = {
    thisMonth: {
      present: 22,
      late: 2,
      absent: 0,
      workingDays: 24,
    },
    averageClockIn: '08:15',
    averageClockOut: '17:30',
    averageWorkHours: '9h 15m',
  };

  const recentAttendance = [
    {
      date: '2025-11-17',
      clockIn: '08:30',
      clockOut: '17:45',
      status: 'present' as const,
      workHours: '9h 15m',
    },
    {
      date: '2025-11-16',
      clockIn: '09:05',
      clockOut: '17:30',
      status: 'late' as const,
      workHours: '8h 25m',
    },
    {
      date: '2025-11-15',
      clockIn: '08:25',
      clockOut: '17:40',
      status: 'present' as const,
      workHours: '9h 15m',
    },
  ];

  const getStatusColor = (status: 'present' | 'late' | 'absent') => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'danger';
    }
  };

  const getStatusLabel = (status: 'present' | 'late' | 'absent') => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'late':
        return 'Terlambat';
      case 'absent':
        return 'Tidak Hadir';
    }
  };

  return (
    <PageContainer maxWidth="2xl" className="py-6 space-y-6">
      {/* Clock Card */}
      <AttendanceClockCard
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        isClockedIn={isClockedIn}
        clockInTime={clockInTime}
        isLoading={isLoading}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-talixa">
            <CardBody className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bulan Ini
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {attendanceSummary.thisMonth.present}/{attendanceSummary.thisMonth.workingDays}
                  </p>
                  <p className="text-xs text-gray-500">
                    {attendanceSummary.thisMonth.late} terlambat
                  </p>
                </div>
              </div>
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
            {recentAttendance.map((record, index) => (
              <div
                key={index}
                className={`p-5 ${
                  index !== recentAttendance.length - 1
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
                  <Chip
                    color={getStatusColor(record.status)}
                    variant="flat"
                    size="sm"
                  >
                    {getStatusLabel(record.status)}
                  </Chip>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Clock In</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.clockIn}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Clock Out</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.clockOut}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Jam Kerja</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.workHours}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
