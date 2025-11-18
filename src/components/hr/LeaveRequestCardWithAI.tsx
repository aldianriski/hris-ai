'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, Brain, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaveRequestProps {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  isAutoApproved?: boolean;
  aiConfidence?: number;
  aiReview?: string;
  aiRisks?: string[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected':
    case 'cancelled': return 'danger';
    default: return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Menunggu';
    case 'approved': return 'Disetujui';
    case 'rejected': return 'Ditolak';
    case 'cancelled': return 'Dibatalkan';
    default: return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return AlertCircle;
    case 'approved': return CheckCircle2;
    case 'rejected':
    case 'cancelled': return XCircle;
    default: return AlertCircle;
  }
};

const getLeaveTypeLabel = (type: string) => {
  switch (type) {
    case 'annual': return 'Cuti Tahunan';
    case 'sick': return 'Cuti Sakit';
    case 'unpaid': return 'Cuti Tanpa Gaji';
    case 'maternity': return 'Cuti Melahirkan';
    case 'paternity': return 'Cuti Ayah';
    default: return type;
  }
};

export function LeaveRequestCardWithAI({ request, index }: { request: LeaveRequestProps; index: number }) {
  const StatusIcon = getStatusIcon(request.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border-none shadow-talixa hover:shadow-talixa-lg transition-shadow">
        <CardBody className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                {request.isAutoApproved && (
                  <Chip
                    size="sm"
                    color="secondary"
                    variant="flat"
                    startContent={<Sparkles className="w-3 h-3" />}
                  >
                    AI Approved
                  </Chip>
                )}
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

          {/* AI Analysis for Pending Requests */}
          {request.status === 'pending' && request.aiConfidence && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    AI Evaluation
                  </span>
                  <Chip
                    size="sm"
                    color={request.aiConfidence >= 85 ? 'success' : 'warning'}
                    variant="flat"
                    startContent={<TrendingUp className="w-3 h-3" />}
                  >
                    {request.aiConfidence}% Confidence
                  </Chip>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-200">
                  {request.aiReview}
                </p>
                {request.aiRisks && request.aiRisks.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {request.aiRisks.map((risk, idx) => (
                      <p key={idx} className="text-xs text-orange-600 dark:text-orange-400">
                        ⚠️ {risk}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto-Approved Status */}
          {request.status === 'approved' && request.isAutoApproved && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    Auto-Approved by AI System
                  </span>
                  <Chip size="sm" color="success" variant="flat">
                    {request.aiConfidence}% Confidence
                  </Chip>
                </div>
                <p className="text-sm text-green-700 dark:text-green-200 flex items-start gap-2">
                  <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{request.aiReview}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Approved on {new Date(request.approvedAt!).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          )}

          {/* Manual Approval */}
          {request.status === 'approved' && !request.isAutoApproved && request.approvedBy && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
              <p className="text-green-600">
                ✓ Disetujui oleh {request.approvedBy} pada{' '}
                {new Date(request.approvedAt!).toLocaleDateString('id-ID')}
              </p>
            </div>
          )}

          {/* Rejection */}
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
}
