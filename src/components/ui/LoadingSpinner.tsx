/**
 * Loading Spinner Component
 * Reusable loading indicator
 */

'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

// Full Page Loading
export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Inline Loading
export function LoadingInline({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}
