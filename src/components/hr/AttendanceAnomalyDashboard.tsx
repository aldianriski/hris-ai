'use client';

import { useState } from 'react';
import { Card, CardBody, Chip, Button, Tabs, Tab, Spinner } from '@heroui/react';
import { AlertTriangle, MapPin, Clock, User, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAttendanceAnomalies, useApproveAnomaly, useRejectAnomaly } from '@/lib/hooks/useAttendanceAnomalies';

const SEVERITY_COLOR_MAP = {
  high: 'danger',
  medium: 'warning',
  low: 'primary',
} as const;

const ANOMALY_TYPE_LABELS = {
  location_deviation: 'Location Deviation',
  time_deviation: 'Time Deviation',
  excessive_hours: 'Excessive Hours',
  pattern_break: 'Pattern Break',
  impossible_travel: 'Impossible Travel',
};

export function AttendanceAnomalyDashboard() {
  const { employerId } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { data, isLoading } = useAttendanceAnomalies(employerId, { status: activeTab });
  const approveAnomaly = useApproveAnomaly();
  const rejectAnomaly = useRejectAnomaly();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading attendance anomalies..." />
      </div>
    );
  }

  const anomalies = data?.anomalies || [];

  const stats = {
    total: data?.total || 0,
    pending: anomalies.filter((a) => a.status === 'pending').length,
    high: anomalies.filter((a) => a.severity === 'high').length,
  };

  const handleApprove = async (anomalyId: string) => {
    await approveAnomaly.mutateAsync({ anomalyId });
  };

  const handleReject = async (anomalyId: string) => {
    await rejectAnomaly.mutateAsync({ anomalyId });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-orange-50 dark:bg-orange-900/20">
          <CardBody className="text-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Anomalies</p>
          </CardBody>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardBody className="text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
          </CardBody>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardBody className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.high}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">High Severity</p>
          </CardBody>
        </Card>
      </div>

      {/* Anomalies List */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attendance Anomalies</h3>
            <Chip size="sm" variant="flat" color="success">
              AI-powered detection
            </Chip>
          </div>

          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as 'pending' | 'approved' | 'rejected')}
            className="mb-4"
          >
            <Tab key="pending" title={`Pending (${stats.pending})`} />
            <Tab key="approved" title="Approved" />
            <Tab key="rejected" title="Rejected" />
          </Tabs>

          {anomalies.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-gray-500">No {activeTab} anomalies found</p>
              <p className="text-sm text-gray-400 mt-2">
                {activeTab === 'pending'
                  ? 'All attendance patterns look normal!'
                  : `No ${activeTab} anomalies to display`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <Card key={anomaly.id} className="shadow-sm">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{anomaly.employeeName}</h4>
                              <Chip size="sm" variant="flat">
                                {ANOMALY_TYPE_LABELS[anomaly.type]}
                              </Chip>
                              <Chip
                                size="sm"
                                color={SEVERITY_COLOR_MAP[anomaly.severity]}
                                variant="flat"
                              >
                                {anomaly.severity}
                              </Chip>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {anomaly.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Normal Pattern</p>
                            <p className="text-sm font-medium">{anomaly.normalValue}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Detected Anomaly</p>
                            <p className="text-sm font-medium text-orange-600">
                              {anomaly.anomalousValue}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              <span>ID: {anomaly.employeeId}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(anomaly.date).toLocaleDateString('id-ID')}</span>
                            </div>
                            <Chip size="sm" variant="flat" color="secondary">
                              AI Confidence: {(anomaly.aiConfidence * 100).toFixed(0)}%
                            </Chip>
                          </div>

                          {anomaly.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                color="success"
                                variant="flat"
                                startContent={<CheckCircle className="w-4 h-4" />}
                                onPress={() => handleApprove(anomaly.id)}
                                isLoading={approveAnomaly.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                startContent={<XCircle className="w-4 h-4" />}
                                onPress={() => handleReject(anomaly.id)}
                                isLoading={rejectAnomaly.isPending}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {anomaly.status !== 'pending' && (
                            <Chip
                              color={anomaly.status === 'approved' ? 'success' : 'danger'}
                              variant="flat"
                              size="sm"
                              startContent={
                                anomaly.status === 'approved' ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )
                              }
                            >
                              {anomaly.status}
                            </Chip>
                          )}
                        </div>

                        {anomaly.location && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                  Location Deviation Detected
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                  Distance from usual location: {anomaly.location.distance} km
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
