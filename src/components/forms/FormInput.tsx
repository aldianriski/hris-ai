/**
 * Form Input Component
 * Reusable text input with label and error handling
 */

'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helpText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1 relative">
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border px-3 py-2 shadow-sm
              focus:outline-none focus:ring-1
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
              ${className}
            `}
            {...props}
          />
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
