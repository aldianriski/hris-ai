import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white border border-talixa-gray-200 shadow-md hover:shadow-lg',
        elevated: 'bg-white shadow-lg hover:shadow-xl',
        flat: 'bg-talixa-gray-50',
        gradient: 'bg-gradient-to-br from-talixa-blue-50 to-talixa-purple-50',
        bordered: 'bg-white border-2 border-talixa-blue',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hoverable: {
        true: 'cursor-pointer hover:scale-105',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hoverable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Click handler (makes card interactive)
   */
  onClick?: () => void;
}

/**
 * Talixa Card Component
 *
 * Container for grouping related content.
 * Follows Talixa design system with 8px border radius.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="lg">
 *   <h3>Feature Title</h3>
 *   <p>Feature description</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  className,
  variant,
  padding,
  hoverable,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        cardVariants({ variant, padding, hoverable: hoverable || !!onClick }),
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header Component
 */
export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

/**
 * Card Title Component
 */
export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-2xl font-bold text-talixa-gray-900', className)}>
      {children}
    </h3>
  );
}

/**
 * Card Description Component
 */
export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-talixa-gray-600 leading-relaxed', className)}>
      {children}
    </p>
  );
}

/**
 * Card Content Component
 */
export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

/**
 * Card Footer Component
 */
export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-4 flex items-center gap-4', className)}>
      {children}
    </div>
  );
}
