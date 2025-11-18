'use client';

import { Card, CardBody, Progress } from '@heroui/react';
import {
  Database,
  FileText,
  User,
  Image as ImageIcon,
  File,
  Paperclip,
  TrendingUp,
  HardDrive,
} from 'lucide-react';

interface StorageBreakdownWidgetProps {
  tenantId: string;
  totalUsedGB: number;
  maxStorageGB: number;
}

// Storage module types
interface StorageModule {
  id: string;
  name: string;
  usageGB: number;
  fileCount: number;
  percentage: number;
  icon: any;
  color: string;
}

export function StorageBreakdownWidget({
  tenantId,
  totalUsedGB,
  maxStorageGB,
}: StorageBreakdownWidgetProps) {
  // TODO: In production, fetch real storage data from API
  // For now, generate realistic breakdown based on total usage
  const generateStorageBreakdown = (): StorageModule[] => {
    // Realistic distribution percentages for HRIS data
    const distributions = {
      employeeDocuments: 0.35, // 35% - ID cards, contracts, certificates
      profilePictures: 0.10, // 10% - Employee photos
      payrollReports: 0.20, // 20% - Payslips, tax forms
      performanceReviews: 0.15, // 15% - Review documents, assessments
      attachments: 0.12, // 12% - Email attachments, misc files
      other: 0.08, // 8% - Backups, logs, temp files
    };

    const modules: StorageModule[] = [
      {
        id: 'employee_documents',
        name: 'Employee Documents',
        usageGB: totalUsedGB * distributions.employeeDocuments,
        fileCount: Math.floor(totalUsedGB * distributions.employeeDocuments * 25), // ~25 files per GB
        percentage: distributions.employeeDocuments * 100,
        icon: FileText,
        color: '#3b82f6', // blue
      },
      {
        id: 'payroll_reports',
        name: 'Payroll & Tax Reports',
        usageGB: totalUsedGB * distributions.payrollReports,
        fileCount: Math.floor(totalUsedGB * distributions.payrollReports * 50), // ~50 files per GB (smaller PDFs)
        percentage: distributions.payrollReports * 100,
        icon: File,
        color: '#10b981', // green
      },
      {
        id: 'performance_documents',
        name: 'Performance Documents',
        usageGB: totalUsedGB * distributions.performanceReviews,
        fileCount: Math.floor(totalUsedGB * distributions.performanceReviews * 40),
        percentage: distributions.performanceReviews * 100,
        icon: TrendingUp,
        color: '#8b5cf6', // purple
      },
      {
        id: 'attachments',
        name: 'Email & Attachments',
        usageGB: totalUsedGB * distributions.attachments,
        fileCount: Math.floor(totalUsedGB * distributions.attachments * 30),
        percentage: distributions.attachments * 100,
        icon: Paperclip,
        color: '#f59e0b', // amber
      },
      {
        id: 'profile_pictures',
        name: 'Profile Pictures',
        usageGB: totalUsedGB * distributions.profilePictures,
        fileCount: Math.floor(totalUsedGB * distributions.profilePictures * 200), // ~200 images per GB (smaller files)
        percentage: distributions.profilePictures * 100,
        icon: User,
        color: '#ec4899', // pink
      },
      {
        id: 'other',
        name: 'Other Files',
        usageGB: totalUsedGB * distributions.other,
        fileCount: Math.floor(totalUsedGB * distributions.other * 30),
        percentage: distributions.other * 100,
        icon: HardDrive,
        color: '#6b7280', // gray
      },
    ];

    return modules.sort((a, b) => b.usageGB - a.usageGB);
  };

  const storageModules = generateStorageBreakdown();
  const overallPercentage = (totalUsedGB / maxStorageGB) * 100;

  const formatSize = (gb: number): string => {
    if (gb < 0.01) {
      return `${(gb * 1024).toFixed(2)} MB`;
    }
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Storage Usage */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Storage Usage
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Breakdown by module
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUsedGB.toFixed(2)} GB
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                of {maxStorageGB} GB
              </p>
            </div>
          </div>

          <Progress
            value={Math.min(overallPercentage, 100)}
            color={
              overallPercentage >= 90
                ? 'danger'
                : overallPercentage >= 75
                ? 'warning'
                : 'success'
            }
            size="lg"
            classNames={{
              track: 'h-3',
              indicator: 'h-3',
            }}
          />

          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {overallPercentage.toFixed(1)}% used
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatSize(maxStorageGB - totalUsedGB)} available
            </p>
          </div>

          {overallPercentage >= 90 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                ⚠️ Storage Almost Full
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Consider upgrading storage limit or cleaning up old files
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Module Breakdown */}
      <Card>
        <CardBody>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Storage by Module
          </h4>

          <div className="space-y-4">
            {storageModules.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${module.color}20` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: module.color }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {module.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {module.fileCount.toLocaleString()} files
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatSize(module.usageGB)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {module.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="rounded-full h-2 transition-all"
                      style={{
                        width: `${module.percentage}%`,
                        backgroundColor: module.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Storage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Files
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {storageModules
                  .reduce((sum, m) => sum + m.fileCount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Avg File Size
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUsedGB > 0
                  ? formatSize(
                      totalUsedGB /
                        storageModules.reduce((sum, m) => sum + m.fileCount, 0)
                    )
                  : '0 MB'}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Largest Module
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {storageModules[0]?.percentage.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {storageModules[0]?.name}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardBody>
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Storage Management Tips
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Regularly archive old documents to reduce storage costs</li>
                <li>• Compress large PDF files before uploading</li>
                <li>• Set automatic deletion policies for temporary files</li>
                <li>• Monitor growth trends to plan capacity upgrades</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
