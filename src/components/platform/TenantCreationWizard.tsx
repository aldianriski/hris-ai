'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button } from '@heroui/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { CompanyInfoStep } from './wizard-steps/CompanyInfoStep';
import { AdminUserStep } from './wizard-steps/AdminUserStep';
import { SubscriptionStep } from './wizard-steps/SubscriptionStep';
import { InitialSetupStep } from './wizard-steps/InitialSetupStep';
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
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

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

      // Show success message with temp password
      console.log('Tenant created successfully:', result);
      if (result.tempPassword) {
        alert(`Tenant created successfully!\n\nAdmin Email: ${result.adminEmail}\nTemporary Password: ${result.tempPassword}\n\nPlease save this password - it won't be shown again.`);
      }

      // Redirect to tenant detail page
      router.push(`/platform-admin/tenants/${result.tenant.id}`);
    } catch (error) {
      console.error('Error creating tenant:', error);
      alert(error instanceof Error ? error.message : 'Failed to create tenant. Please try again.');
    } finally {
      setIsSubmitting(false);
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

      {/* Step Content */}
      <Card>
        <CardBody className="p-6">
          {currentStep === 1 && (
            <CompanyInfoStep
              data={formData}
              updateData={updateFormData}
            />
          )}

          {currentStep === 2 && (
            <AdminUserStep
              data={formData}
              updateData={updateFormData}
            />
          )}

          {currentStep === 3 && (
            <SubscriptionStep
              data={formData}
              updateData={updateFormData}
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
          isDisabled={currentStep === 1}
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
    </div>
  );
}
