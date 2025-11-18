import React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

// Button variants using CVA for type-safe styling
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary - Talixa Blue (main CTA)
        primary:
          'bg-talixa-blue text-white hover:bg-talixa-blue-600 focus-visible:ring-talixa-blue-500 shadow-md hover:shadow-lg',
        // Secondary - Talixa Green (success actions)
        secondary:
          'bg-talixa-green text-white hover:bg-talixa-green-600 focus-visible:ring-talixa-green-500 shadow-md hover:shadow-lg',
        // Outline - Blue outline (secondary CTA)
        outline:
          'border-2 border-talixa-blue text-talixa-blue hover:bg-talixa-blue hover:text-white focus-visible:ring-talixa-blue-500',
        // Ghost - Minimal style
        ghost:
          'text-talixa-blue hover:bg-talixa-blue-50 focus-visible:ring-talixa-blue-500',
        // Link - Text only
        link: 'text-talixa-blue underline-offset-4 hover:underline',
        // Purple - Innovation/AI features
        purple:
          'bg-talixa-purple text-white hover:bg-talixa-purple-600 focus-visible:ring-talixa-purple-500 shadow-md hover:shadow-lg',
        // Gold - Premium/special offers
        gold: 'bg-talixa-gold text-talixa-gray-900 hover:bg-talixa-gold-600 focus-visible:ring-talixa-gold-500 shadow-md hover:shadow-lg font-semibold',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-10 text-xl',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Optional href for link-style buttons
   */
  href?: string;
  /**
   * Optional icon before text
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional icon after text
   */
  rightIcon?: React.ReactNode;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * External link (opens in new tab)
   */
  external?: boolean;
}

/**
 * Talixa Button Component
 *
 * Branded button following Talixa design system.
 * Supports multiple variants, sizes, and states.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Mulai Gratis 14 Hari
 * </Button>
 *
 * <Button variant="outline" href="/pricing">
 *   Lihat Harga
 * </Button>
 * ```
 */
export function Button({
  children,
  className,
  variant,
  size,
  fullWidth,
  href,
  leftIcon,
  rightIcon,
  loading,
  external,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

  // Loading spinner
  const spinner = loading && (
    <svg
      className="mr-2 h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const content = (
    <>
      {loading && spinner}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  // If href provided, render as link
  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}

/**
 * Button Group Component
 *
 * Groups multiple buttons together with proper spacing.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="primary">Mulai Gratis</Button>
 *   <Button variant="outline">Lihat Demo</Button>
 * </ButtonGroup>
 * ```
 */
export function ButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {children}
    </div>
  );
}
