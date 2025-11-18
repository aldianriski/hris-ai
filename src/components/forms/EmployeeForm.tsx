'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, Tab, Button, Card, CardBody } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { employeeFormSchema, EmployeeFormData } from '@/lib/validations/employee';
import { employeeService } from '@/lib/api/services';
import { Employee } from '@/lib/api/types';
import { EmployeeBasicInfo } from './EmployeeBasicInfo';
import { EmployeeEmployment } from './EmployeeEmployment';
import { EmployeeSalary } from './EmployeeSalary';
import { EmployeeBPJS } from './EmployeeBPJS';
import { EmployeeDocuments } from './EmployeeDocuments';
import { Save, X } from 'lucide-react';

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  employeeId?: string;
  initialData?: Partial<Employee>;
}

export function EmployeeForm({ mode, employeeId, initialData }: EmployeeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      middleName: initialData?.middleName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      gender: initialData?.gender || 'male',
      maritalStatus: initialData?.maritalStatus || 'single',
      nationality: initialData?.nationality || 'Indonesian',
      nationalId: initialData?.nationalId || '',
      taxId: initialData?.taxId || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      province: initialData?.province || '',
      postalCode: initialData?.postalCode || '',
      department: initialData?.department || '',
      position: initialData?.position || '',
      employmentType: initialData?.employmentType || 'permanent',
      employmentStatus: initialData?.employmentStatus || 'active',
      joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
      manager: initialData?.manager || '',
      workLocation: initialData?.workLocation || '',
      workSchedule: initialData?.workSchedule || 'Monday - Friday, 09:00 - 17:00',
      salary: initialData?.salary || 0,
      bankName: undefined,
      bankAccountNumber: undefined,
      bankAccountName: undefined,
      bpjsKetenagakerjaanNumber: undefined,
      bpjsKesehatanNumber: undefined,
      bpjsKetenagakerjaanStatus: undefined,
      bpjsKesehatanStatus: undefined,
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);

      // TODO: Get actual employerId from auth context
      const employeeData = {
        ...data,
        employerId: 'temp-employer-id',
        fullName: `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`,
      };

      if (mode === 'create') {
        await employeeService.create(employeeData);
        toast.success('Employee created successfully!');
        router.push('/hr/employees');
      } else if (mode === 'edit' && employeeId) {
        await employeeService.update(employeeId, employeeData);
        toast.success('Employee updated successfully!');
        router.push(`/hr/employees/${employeeId}`);
      }
    } catch (error) {
      console.error('Failed to save employee:', error);
      toast.error(mode === 'create' ? 'Failed to create employee' : 'Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardBody>
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              aria-label="Employee form tabs"
              classNames={{
                tabList: 'w-full',
                cursor: 'bg-primary',
                tab: 'max-w-fit px-6',
              }}
            >
              <Tab key="basic" title="Basic Information">
                <div className="py-6">
                  <EmployeeBasicInfo />
                </div>
              </Tab>
              <Tab key="employment" title="Employment">
                <div className="py-6">
                  <EmployeeEmployment />
                </div>
              </Tab>
              <Tab key="salary" title="Salary">
                <div className="py-6">
                  <EmployeeSalary />
                </div>
              </Tab>
              <Tab key="bpjs" title="BPJS">
                <div className="py-6">
                  <EmployeeBPJS />
                </div>
              </Tab>
              <Tab key="documents" title="Documents">
                <div className="py-6">
                  <EmployeeDocuments />
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="bordered"
            startContent={<X className="w-4 h-4" />}
            onPress={handleCancel}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            startContent={<Save className="w-4 h-4" />}
            isLoading={isSubmitting}
          >
            {mode === 'create' ? 'Create Employee' : 'Update Employee'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
