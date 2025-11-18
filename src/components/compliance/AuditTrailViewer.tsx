'use client';

import { Card, CardHeader, CardBody, Chip, Input, Select, SelectItem } from '@heroui/react';
import { Search, Filter, Download, Eye, Calendar, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface AuditLog {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: {
    before: any;
    after: any;
  };
  ipAddress: string;
  device: string;
  location: string;
  timestamp: string;
  executionTime: number;
}

export function AuditTrailViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterResource, setFilterResource] = useState('all');

  // Mock data - replace with actual API
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      eventId: 'evt_001',
      userId: 'user_1',
      userEmail: 'sarah@company.com',
      action: 'update',
      resourceType: 'employee',
      resourceId: 'emp_123',
      changes: {
        before: { salary: 10000000 },
        after: { salary: 12000000 },
      },
      ipAddress: '192.168.1.100',
      device: 'Chrome 119 on Windows',
      location: 'Jakarta, Indonesia',
      timestamp: '2025-11-18T14:30:00Z',
      executionTime: 45,
    },
    {
      id: '2',
      eventId: 'evt_002',
      userId: 'user_2',
      userEmail: 'alex@company.com',
      action: 'create',
      resourceType: 'leave_request',
      resourceId: 'leave_456',
      ipAddress: '192.168.1.105',
      device: 'Safari 17 on MacOS',
      location: 'Surabaya, Indonesia',
      timestamp: '2025-11-18T13:15:00Z',
      executionTime: 32,
    },
    {
      id: '3',
      eventId: 'evt_003',
      userId: 'user_3',
      userEmail: 'maria@company.com',
      action: 'delete',
      resourceType: 'document',
      resourceId: 'doc_789',
      ipAddress: '192.168.1.110',
      device: 'Firefox 120 on Ubuntu',
      location: 'Bandung, Indonesia',
      timestamp: '2025-11-18T12:00:00Z',
      executionTime: 28,
    },
    {
      id: '4',
      eventId: 'evt_004',
      userId: 'user_1',
      userEmail: 'sarah@company.com',
      action: 'export',
      resourceType: 'payroll',
      resourceId: 'payroll_2025_11',
      ipAddress: '192.168.1.100',
      device: 'Chrome 119 on Windows',
      location: 'Jakarta, Indonesia',
      timestamp: '2025-11-18T11:30:00Z',
      executionTime: 156,
    },
  ];

  const getActionColor = (action: string) => {
    const colors: Record<string, 'success' | 'primary' | 'danger' | 'warning'> = {
      create: 'success',
      update: 'primary',
      delete: 'danger',
      export: 'warning',
      read: 'default' as any,
    };
    return colors[action] || 'default';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesResource = filterResource === 'all' || log.resourceType === filterResource;

    return matchesSearch && matchesAction && matchesResource;
  });

  const stats = {
    totalEvents: auditLogs.length,
    creates: auditLogs.filter((l) => l.action === 'create').length,
    updates: auditLogs.filter((l) => l.action === 'update').length,
    deletes: auditLogs.filter((l) => l.action === 'delete').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                  <p className="text-sm text-default-500">Total Events</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.creates}</p>
                  <p className="text-sm text-default-500">Creates</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.updates}</p>
                  <p className="text-sm text-default-500">Updates</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-danger" />
                <div>
                  <p className="text-2xl font-bold">{stats.deletes}</p>
                  <p className="text-sm text-default-500">Deletes</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by user or resource..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search className="h-4 w-4 text-default-400" />}
              className="flex-1"
            />
            <Select
              label="Action"
              selectedKeys={[filterAction]}
              onSelectionChange={(keys) => setFilterAction(Array.from(keys)[0] as string)}
              className="w-48"
              size="sm"
            >
              <SelectItem key="all">All Actions</SelectItem>
              <SelectItem key="create">Create</SelectItem>
              <SelectItem key="update">Update</SelectItem>
              <SelectItem key="delete">Delete</SelectItem>
              <SelectItem key="export">Export</SelectItem>
            </Select>
            <Select
              label="Resource"
              selectedKeys={[filterResource]}
              onSelectionChange={(keys) => setFilterResource(Array.from(keys)[0] as string)}
              className="w-48"
              size="sm"
            >
              <SelectItem key="all">All Resources</SelectItem>
              <SelectItem key="employee">Employee</SelectItem>
              <SelectItem key="leave_request">Leave Request</SelectItem>
              <SelectItem key="payroll">Payroll</SelectItem>
              <SelectItem key="document">Document</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Audit Trail</h3>
        </CardHeader>
        <CardBody className="gap-3">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Chip color={getActionColor(log.action)} variant="flat" size="sm" className="uppercase">
                          {log.action}
                        </Chip>
                        <span className="text-sm font-medium">{log.resourceType}</span>
                        <span className="text-xs text-default-400">#{log.resourceId}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-default-400" />
                          <span className="text-default-600">{log.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-default-400" />
                          <span className="text-default-600">{formatTimestamp(log.timestamp)}</span>
                        </div>
                        <div className="text-default-600">{log.location}</div>
                        <div className="text-default-600">{log.device}</div>
                      </div>
                      {log.changes && (
                        <div className="mt-3 p-3 bg-default-50 rounded-lg">
                          <p className="text-xs font-semibold mb-2">Changes:</p>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-default-500 mb-1">Before:</p>
                              <code className="text-danger">{JSON.stringify(log.changes.before, null, 2)}</code>
                            </div>
                            <div>
                              <p className="text-default-500 mb-1">After:</p>
                              <code className="text-success">{JSON.stringify(log.changes.after, null, 2)}</code>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 mx-auto text-default-300 mb-4" />
              <p className="text-default-500">No audit logs found</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
