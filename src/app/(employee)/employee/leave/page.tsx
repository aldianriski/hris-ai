'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { Card, CardBody, Button, Chip, Progress } from '@heroui/react';
import { Plus, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LeavePage() {
  const leaveBalance = {
    annual: {
      total: 12,
      used: 0,
      remaining: 12,
    },
    sick: {
      used: 0,
    },
    unpaid: {
      used: 0,
    },
  };

  const leaveRequests = [
    {
      id: '1',
      type: 'annual',
      startDate: '2025-12-01',
      endDate: '2025-12-03',
      days: 3,
      reason: 'Liburan keluarga',
      status: 'pending' as const,
      submittedAt: '2025-11-15',
    },
    {
      id: '2',
      type: 'sick',
      startDate: '2025-11-10',
      endDate: '2025-11-11',
      days: 2,
      reason: 'Sakit demam',
      status: 'approved' as const,
      submittedAt: '2025-11-10',
      approvedAt: '2025-11-10',
      approvedBy: 'Manager HR',
    },
    {
      id: '3',
      type: 'annual',
      startDate: '2025-10-20',
      endDate: '2025-10-22',
      days: 3,
      reason: 'Keperluan keluarga',
      status: 'rejected' as const,
      submittedAt: '2025-10-18',
      rejectedAt: '2025-10-19',
      rejectedBy: 'Manager HR',
      rejectionReason: 'Periode sibuk, mohon pilih tanggal lain',
    },
  ];

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected' | 'cancelled') => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
      case 'cancelled':
        return 'danger';
    }
  };

  const getStatusLabel = (status: 'pending' | 'approved' | 'rejected' | 'cancelled') => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'cancelled':
        return 'Dibatalkan';
    }
  };

  const getStatusIcon = (status: 'pending' | 'approved' | 'rejected' | 'cancelled') => {
    switch (status) {
      case 'pending':
        return AlertCircle;
      case 'approved':
        return CheckCircle2;
      case 'rejected':
      case 'cancelled':
        return XCircle;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'annual':
        return 'Cuti Tahunan';
      case 'sick':
        return 'Cuti Sakit';
      case 'unpaid':
        return 'Cuti Tanpa Gaji';
      case 'maternity':
        return 'Cuti Melahirkan';
      case 'paternity':
        return 'Cuti Ayah';
      default:
        return type;
    }
  };

  return (
    <PageContainer maxWidth="2xl" className="py-6 space-y-6">
      {/* Header with New Request Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Cuti Saya
        </h1>
        <Button
          as={Link}
          href="/employee/leave/new"
          color="primary"
          startContent={<Plus className="w-5 h-5" />}
          className="bg-gradient-primary"
        >
          Ajukan Cuti
        </Button>
      </div>

      {/* Leave Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-none shadow-talixa-lg">
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Saldo Cuti Tahunan
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Terpakai
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {leaveBalance.annual.used} / {leaveBalance.annual.total} hari
                  </span>
                </div>
                <Progress
                  value={(leaveBalance.annual.used / leaveBalance.annual.total) * 100}
                  color="primary"
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-talixa-indigo dark:text-talixa-indigo-200">
                    {leaveBalance.annual.total}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Terpakai</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {leaveBalance.annual.used}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sisa</p>
                  <p className="text-2xl font-bold text-green-600">
                    {leaveBalance.annual.remaining}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Leave Requests */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Riwayat Permohonan
        </h2>
        <div className="space-y-4">
          {leaveRequests.map((request, index) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-talixa hover:shadow-talixa-lg transition-shadow">
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getLeaveTypeLabel(request.type)}
                          </h3>
                          <Chip
                            color={getStatusColor(request.status)}
                            variant="flat"
                            size="sm"
                            startContent={<StatusIcon className="w-3 h-3" />}
                          >
                            {getStatusLabel(request.status)}
                          </Chip>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {request.reason}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Tanggal
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {new Date(request.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                          {' - '}
                          {new Date(request.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Durasi
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {request.days} hari
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-gray-500 dark:text-gray-400">Diajukan</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {new Date(request.submittedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {request.status === 'approved' && request.approvedBy && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
                        <p className="text-green-600">
                          ✓ Disetujui oleh {request.approvedBy} pada{' '}
                          {new Date(request.approvedAt!).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
                        <p className="text-red-600 mb-1">
                          ✗ Ditolak oleh {request.rejectedBy} pada{' '}
                          {new Date(request.rejectedAt!).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Alasan: {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
