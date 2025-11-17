'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody, Button, Avatar } from '@heroui/react';
import { Calendar, Clock, FileText, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EmployeeDashboard() {
  // Mock data - will be replaced with API calls
  const employee = {
    name: 'Ahmad Wijaya',
    position: 'Senior Developer',
    department: 'Engineering',
    avatar: null,
  };

  const stats = [
    {
      title: 'Sisa Cuti',
      value: 12,
      icon: Calendar,
      color: 'primary' as const,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Hadir Bulan Ini',
      value: 22,
      icon: Clock,
      color: 'success' as const,
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Dokumen Aktif',
      value: 8,
      icon: FileText,
      color: 'warning' as const,
    },
    {
      title: 'Skor Kinerja',
      value: '4.5',
      icon: TrendingUp,
      color: 'success' as const,
      trend: { value: 12, isPositive: true },
    },
  ];

  const quickActions = [
    {
      title: 'Absensi',
      description: 'Clock in/out hari ini',
      icon: Clock,
      href: '/employee/attendance',
      color: 'bg-talixa-indigo-50 dark:bg-talixa-indigo-900/20',
      iconColor: 'text-talixa-indigo',
    },
    {
      title: 'Ajukan Cuti',
      description: 'Buat permohonan cuti baru',
      icon: Calendar,
      href: '/employee/leave/new',
      color: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600',
    },
    {
      title: 'Dokumen Saya',
      description: 'Lihat dan upload dokumen',
      icon: FileText,
      href: '/employee/documents',
      color: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600',
    },
  ];

  const recentActivities = [
    {
      title: 'Clock In',
      time: 'Hari ini, 08:30',
      description: 'Kantor Pusat Jakarta',
      type: 'attendance',
    },
    {
      title: 'Cuti Disetujui',
      time: '2 hari lalu',
      description: 'Cuti tahunan 3 hari',
      type: 'leave',
    },
    {
      title: 'Dokumen Diupload',
      time: '5 hari lalu',
      description: 'BPJS Kesehatan',
      type: 'document',
    },
  ];

  return (
    <PageContainer maxWidth="2xl" className="py-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-none shadow-talixa-lg bg-gradient-primary">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <Avatar
                name={employee.name}
                size="lg"
                className="flex-shrink-0"
                showFallback
              />
              <div className="flex-1 text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  Selamat Datang, {employee.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-white/90 text-sm md:text-base">
                  {employee.position} • {employee.department}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="border-none shadow-talixa hover:shadow-talixa-lg transition-all cursor-pointer group">
                  <CardBody className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-talixa-indigo transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-talixa-indigo transition-colors" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Aktivitas Terbaru
          </h2>
          <Button
            as={Link}
            href="/employee/activities"
            variant="light"
            size="sm"
            endContent={<ChevronRight className="w-4 h-4" />}
          >
            Lihat Semua
          </Button>
        </div>
        <Card className="border-none shadow-talixa">
          <CardBody className="p-0">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className={`p-5 flex items-start gap-4 ${
                  index !== recentActivities.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
