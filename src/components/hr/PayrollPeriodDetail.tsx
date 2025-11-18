'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Progress,
} from '@heroui/react';
import {
  Play,
  CheckCircle,
  DollarSign,
  Users,
  AlertCircle,
  Download,
  Send,
  MoreVertical,
  Eye,
  Edit,
} from 'lucide-react';
import { PayrollPeriod, PayrollDetail } from '@/lib/api/types';
import { payrollService } from '@/lib/api/services';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PayrollPeriodDetailProps {
  period: PayrollPeriod;
}

const STATUS_COLOR_MAP = {
  draft: 'default',
  processing: 'primary',
  approved: 'success',
  paid: 'success',
} as const;

export function PayrollPeriodDetail({ period }: PayrollPeriodDetailProps) {
  const router = useRouter();
  const [details, setDetails] = useState<PayrollDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await payrollService.getPeriodDetails(period.id);
        setDetails(data);
      } catch (error) {
        console.error('Failed to fetch payroll details:', error);
        setDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [period.id]);

  const handleProcess = async () => {
    try {
      setProcessing(true);
      await payrollService.processPeriod(period.id);
      toast.success('Payroll processing started!');
      router.refresh();
    } catch (error) {
      console.error('Failed to process payroll:', error);
      toast.error('Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      await payrollService.approvePeriod(period.id);
      toast.success('Payroll approved successfully!');
      router.refresh();
    } catch (error) {
      console.error('Failed to approve payroll:', error);
      toast.error('Failed to approve payroll');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await payrollService.markAsPaid(period.id);
      toast.success('Payroll marked as paid!');
      router.refresh();
    } catch (error) {
      console.error('Failed to mark payroll as paid:', error);
      toast.error('Failed to mark payroll as paid');
    }
  };

  const totalErrors = details.filter((d) => d.errors && d.errors.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardBody className="text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{period.totalEmployees}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Employees</p>
          </CardBody>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardBody className="text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-600">
              Rp {(period.totalGrossSalary || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gross Salary</p>
          </CardBody>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20">
          <CardBody className="text-center">
            <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-orange-600">
              Rp {(period.totalDeductions || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Deductions</p>
          </CardBody>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <CardBody className="text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-purple-600">
              Rp {(period.totalNetSalary || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Net Salary</p>
          </CardBody>
        </Card>
      </div>

      {/* Status & Actions */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Chip
                size="lg"
                color={STATUS_COLOR_MAP[period.status]}
                variant="flat"
                startContent={
                  period.status === 'paid' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : period.status === 'processing' ? (
                    <Play className="w-4 h-4" />
                  ) : null
                }
              >
                {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
              </Chip>

              {totalErrors > 0 && (
                <Chip color="danger" variant="flat" startContent={<AlertCircle className="w-4 h-4" />}>
                  {totalErrors} Error{totalErrors > 1 ? 's' : ''}
                </Chip>
              )}
            </div>

            <div className="flex gap-2">
              {period.status === 'draft' && (
                <Button
                  color="primary"
                  startContent={<Play className="w-4 h-4" />}
                  onPress={handleProcess}
                  isLoading={processing}
                >
                  Process Payroll
                </Button>
              )}

              {period.status === 'processing' && totalErrors === 0 && (
                <Button
                  color="success"
                  startContent={<CheckCircle className="w-4 h-4" />}
                  onPress={handleApprove}
                >
                  Approve
                </Button>
              )}

              {period.status === 'approved' && (
                <>
                  <Button
                    color="primary"
                    startContent={<Download className="w-4 h-4" />}
                  >
                    Download Bank CSV
                  </Button>
                  <Button
                    color="success"
                    startContent={<Send className="w-4 h-4" />}
                    onPress={handleMarkPaid}
                  >
                    Mark as Paid
                  </Button>
                </>
              )}

              {period.status === 'paid' && (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Download className="w-4 h-4" />}
                >
                  Download Reports
                </Button>
              )}
            </div>
          </div>

          {period.status === 'processing' && (
            <div className="mt-4">
              <Progress
                size="sm"
                isIndeterminate
                label="Processing payroll calculations..."
                className="max-w-md"
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Employee Payroll Table */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4">Employee Payroll Details</h3>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : details.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No payroll details available</p>
              <p className="text-sm mt-2">Process payroll to generate details</p>
            </div>
          ) : (
            <Table aria-label="Payroll details table">
              <TableHeader>
                <TableColumn>Employee</TableColumn>
                <TableColumn>Base Salary</TableColumn>
                <TableColumn>Gross</TableColumn>
                <TableColumn>Deductions</TableColumn>
                <TableColumn>Net Salary</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{detail.employeeName}</p>
                        <p className="text-xs text-gray-500">{detail.employeeNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      Rp {detail.baseSalary.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      Rp {detail.grossSalary.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-red-600">
                      - Rp {detail.totalDeductions.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      Rp {detail.netSalary.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      {detail.errors && detail.errors.length > 0 ? (
                        <Chip size="sm" color="danger" variant="flat">
                          Error
                        </Chip>
                      ) : (
                        <Chip size="sm" color="success" variant="flat">
                          OK
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Payroll actions">
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="payslip"
                            startContent={<Download className="w-4 h-4" />}
                          >
                            Download Payslip
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
