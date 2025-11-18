'use client';

import { useState } from 'react';
import { Card, CardBody, Chip, Button, Tabs, Tab } from '@heroui/react';
import { AlertTriangle, MapPin, Clock, User, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Anomaly {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: 'location_deviation' | 'time_deviation' | 'excessive_hours' | 'pattern_break' | 'impossible_travel';
  severity: 'high' | 'medium' | 'low';
  description: string;
  normalValue: string;
  anomalousValue: string;
  aiConfidence: number;
  status: 'pending' | 'approved' | 'rejected';
  location?: {
    normal: { lat: number; lng: number; address: string };
    anomalous: { lat: number; lng: number; address: string };
    distance: number;
  };
}

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
  const [activeTab, setActiveTab] = useState('pending');

  // Mock data - TODO: fetch from API
  const anomalies: Anomaly[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      date: '2024-11-17',
      type: 'location_deviation',
      severity: 'high',
      description: 'Clock-in location 12.5 km away from usual office location',
      normalValue: 'Main Office Jakarta',
      anomalousValue: 'Bekasi Area',
      aiConfidence: 95,
      status: 'pending',
      location: {
        normal: { lat: -6.2088, lng: 106.8456, address: 'Main Office, Jakarta' },
        anomalous: { lat: -6.2383, lng: 107.0011, address: 'Bekasi' },
        distance: 12.5,
      },
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      date: '2024-11-16',
      type: 'excessive_hours',
      severity: 'medium',
      description: 'Worked 14 hours without break',
      normalValue: '8-9 hours',
      anomalousValue: '14 hours',
      aiConfidence: 88,
      status: 'pending',
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: 'Bob Johnson',
      date: '2024-11-15',
      type: 'time_deviation',
      severity: 'low',
      description: 'Clock-in 4 hours earlier than average',
      normalValue: '09:00 AM',
      anomalousValue: '05:00 AM',
      aiConfidence: 75,
      status: 'pending',
    },
  ];

  const stats = {
    total: anomalies.length,
    pending: anomalies.filter((a) => a.status === 'pending').length,
    high: anomalies.filter((a) => a.severity === 'high').length,
    falsePositives: 2,
  };

  const filteredAnomalies = anomalies.filter((a) => a.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardBody className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.high}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">High Severity</p>
          </CardBody>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardBody className="text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
          </CardBody>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardBody className="text-center">
            <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Detected</p>
          </CardBody>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardBody className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {((stats.total - stats.falsePositives) / stats.total * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</p>
          </CardBody>
        </Card>
      </div>

      {/* Anomaly List */}
      <Card>
        <CardBody>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            classNames={{
              tabList: 'w-full',
              cursor: 'bg-primary',
            }}
          >
            <Tab key="pending" title={`Pending (${stats.pending})`}>
              <div className="py-4 space-y-3">
                {filteredAnomalies.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending anomalies</p>
                ) : (
                  filteredAnomalies.map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{anomaly.employeeName}</h4>
                            <span className="text-sm text-gray-500">({anomaly.employeeId})</span>
                            <Chip
                              size="sm"
                              color={SEVERITY_COLOR_MAP[anomaly.severity]}
                              variant="flat"
                            >
                              {anomaly.severity.toUpperCase()}
                            </Chip>
                            <Chip size="sm" variant="flat">
                              {ANOMALY_TYPE_LABELS[anomaly.type]}
                            </Chip>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {anomaly.description}
                          </p>
                        </div>
                        <Chip size="sm" color="secondary" variant="flat">
                          AI: {anomaly.aiConfidence}%
                        </Chip>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-500">Normal Pattern</p>
                          <p className="font-medium">{anomaly.normalValue}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Detected Value</p>
                          <p className="font-medium text-red-600">{anomaly.anomalousValue}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">
                            {new Date(anomaly.date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>

                      {anomaly.location && (
                        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p>
                                <span className="font-medium">Normal:</span> {anomaly.location.normal.address}
                              </p>
                              <p>
                                <span className="font-medium">Detected:</span> {anomaly.location.anomalous.address}
                              </p>
                              <p className="text-orange-600">
                                Distance: {anomaly.location.distance} km
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" color="success" startContent={<CheckCircle className="w-4 h-4" />}>
                          Approve
                        </Button>
                        <Button size="sm" color="danger" variant="flat" startContent={<XCircle className="w-4 h-4" />}>
                          Reject
                        </Button>
                        <Button size="sm" variant="light" startContent={<Eye className="w-4 h-4" />}>
                          Details
                        </Button>
                        <Button size="sm" variant="light" color="warning">
                          False Positive
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tab>
            <Tab key="approved" title="Approved">
              <div className="py-8 text-center text-gray-500">
                No approved anomalies
              </div>
            </Tab>
            <Tab key="rejected" title="Rejected">
              <div className="py-8 text-center text-gray-500">
                No rejected anomalies
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
