/**
 * Form Select Component
 * Reusable select dropdown with label and error handling
 */

'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helpText?: string;
  options: { value: string; label: string }[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helpText, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1 relative">
          <select
            ref={ref}
            className={`
              block w-full rounded-lg border px-3 py-2 shadow-sm
              focus:outline-none focus:ring-1 appearance-none
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
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

FormSelect.displayName = 'FormSelect';
