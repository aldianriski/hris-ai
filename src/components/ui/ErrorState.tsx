/**
 * Error State Component
 * Display error messages with retry option
 */

'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try again',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-center text-sm text-gray-600 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          {retryText}
        </button>
      )}
    </div>
  );
}

// Full Page Error
export function ErrorPage({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <ErrorState title={title} message={message} onRetry={onRetry} />
      </div>
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  message,
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon ? (
        <div className="rounded-full bg-gray-100 p-3">{icon}</div>
      ) : (
        <div className="rounded-full bg-gray-100 p-3">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-center text-sm text-gray-600 max-w-md">{message}</p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
