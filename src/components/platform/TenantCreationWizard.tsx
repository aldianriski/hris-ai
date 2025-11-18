'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, useDisclosure } from '@heroui/react';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { CompanyInfoStep } from './wizard-steps/CompanyInfoStep';
import { AdminUserStep } from './wizard-steps/AdminUserStep';
import { SubscriptionStep } from './wizard-steps/SubscriptionStep';
import { InitialSetupStep } from './wizard-steps/InitialSetupStep';
import { TenantCreationSuccessModal } from './TenantCreationSuccessModal';
import type { CreateTenantData } from '@/lib/api/types';

const steps = [
  { id: 1, name: 'Company Info', description: 'Basic company details' },
  { id: 2, name: 'Admin User', description: 'Primary administrator' },
  { id: 3, name: 'Subscription', description: 'Plan and billing' },
  { id: 4, name: 'Initial Setup', description: 'Final configuration' },
];

export function TenantCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [successData, setSuccessData] = useState<{
    id: string;
    companyName: string;
    adminEmail: string;
    tempPassword: string;
  } | null>(null);

  // Form data for all steps
  const [formData, setFormData] = useState<Partial<CreateTenantData>>({
    // Step 1: Company Info
    companyName: '',
    industry: '',
    companySize: '1-10',
    country: 'Indonesia',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',

    // Step 2: Admin User
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: null,
    sendWelcomeEmail: true,

    // Step 3: Subscription
    subscriptionPlan: 'trial',
    billingCycle: 'monthly',
    maxEmployees: 10,
    trialDays: 14,

    // Step 4: Initial Setup
    enabledModules: ['employee_management', 'attendance', 'leave'],
    loadSampleData: false,
    customDomain: '',
    primaryColor: '#6366f1',
  });

  const updateFormData = (data: Partial<CreateTenantData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(data);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      updatedFields.forEach((field) => delete newErrors[field]);
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.companyName) errors.companyName = 'Company name is required';
      if (!formData.industry) errors.industry = 'Industry is required';
      if (!formData.companySize) errors.companySize = 'Company size is required';
    }

    if (step === 2) {
      if (!formData.adminFirstName) errors.adminFirstName = 'First name is required';
      if (!formData.adminLastName) errors.adminLastName = 'Last name is required';
      if (!formData.adminEmail) {
        errors.adminEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
        errors.adminEmail = 'Invalid email format';
      }
    }

    if (step === 3) {
      if (!formData.subscriptionPlan) errors.subscriptionPlan = 'Plan is required';
      if (!formData.maxEmployees || formData.maxEmployees < 1) {
        errors.maxEmployees = 'Max employees must be at least 1';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/platform/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create tenant');
      }

      // Show success modal with credentials
      setSuccessData({
        id: result.tenant.id,
        companyName: formData.companyName || '',
        adminEmail: result.adminEmail,
        tempPassword: result.tempPassword,
      });
      onOpen();
    } catch (error) {
      console.error('Error creating tenant:', error);
      setError(error instanceof Error ? error.message : 'Failed to create tenant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    onClose();
    // Navigate to the tenant detail page
    if (successData) {
      router.push(`/platform-admin/tenants/${successData.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                      transition-colors
                      ${
                        currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }
                    `}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>

                  {/* Step Name */}
                  <div className="mt-2 text-center">
                    <p
                      className={`
                        text-sm font-medium
                        ${
                          currentStep >= step.id
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }
                      `}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      h-0.5 w-full mx-2 transition-colors
                      ${
                        currentStep > step.id
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <Card>
        <CardBody className="p-6">
          {currentStep === 1 && (
            <CompanyInfoStep
              data={formData}
              updateData={updateFormData}
              errors={validationErrors}
            />
          )}

          {currentStep === 2 && (
            <AdminUserStep
              data={formData}
              updateData={updateFormData}
              errors={validationErrors}
            />
          )}

          {currentStep === 3 && (
            <SubscriptionStep
              data={formData}
              updateData={updateFormData}
              errors={validationErrors}
            />
          )}

          {currentStep === 4 && (
            <InitialSetupStep
              data={formData}
              updateData={updateFormData}
            />
          )}
        </CardBody>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="flat"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onPress={handleBack}
          isDisabled={currentStep === 1 || isSubmitting}
        >
          Back
        </Button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < steps.length ? (
          <Button
            color="primary"
            endContent={<ArrowRight className="w-4 h-4" />}
            onPress={handleNext}
            isDisabled={isSubmitting}
          >
            Next
          </Button>
        ) : (
          <Button
            color="success"
            endContent={<Check className="w-4 h-4" />}
            onPress={handleSubmit}
            isLoading={isSubmitting}
          >
            Create Tenant
          </Button>
        )}
      </div>

      {/* Success Modal */}
      {successData && (
        <TenantCreationSuccessModal
          isOpen={isOpen}
          onClose={handleSuccessClose}
          tenantData={successData}
        />
      )}
    </div>
  );
}
