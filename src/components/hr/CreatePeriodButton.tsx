'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import { Plus } from 'lucide-react';
import { payrollService } from '@/lib/api/services';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export function CreatePeriodButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - 2 + i).toString(),
    label: (currentYear - 2 + i).toString(),
  }));

  const handleCreate = async () => {
    if (!month || !year) {
      toast.error('Please select month and year');
      return;
    }

    try {
      setIsSubmitting(true);

      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      // Calculate period start and end dates
      const periodStart = new Date(yearNum, monthNum - 1, 1)
        .toISOString()
        .split('T')[0];
      const periodEnd = new Date(yearNum, monthNum, 0).toISOString().split('T')[0];

      // TODO: Get actual employerId from auth context
      const data = {
        employerId: 'temp-employer-id',
        periodStart,
        periodEnd,
        month: monthNum,
        year: yearNum,
      };

      const period = await payrollService.createPeriod(data);
      toast.success('Payroll period created successfully!');
      onClose();
      router.push(`/hr/payroll/periods/${period.id}`);
    } catch (error) {
      console.error('Failed to create payroll period:', error);
      toast.error('Failed to create payroll period');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={onOpen}>
        Create Payroll Period
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create Payroll Period</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Month"
                placeholder="Select month"
                selectedKeys={month ? [month] : []}
                onChange={(e) => setMonth(e.target.value)}
                isRequired
              >
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Year"
                placeholder="Select year"
                selectedKeys={year ? [year] : []}
                onChange={(e) => setYear(e.target.value)}
                isRequired
              >
                {years.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </Select>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  What happens next?
                </p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-200">
                  <li>• System will fetch all active employees</li>
                  <li>• Attendance and leave data will be collected</li>
                  <li>• BPJS and tax calculations will be automated</li>
                  <li>• AI will check for potential errors</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreate} isLoading={isSubmitting}>
              Create Period
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
