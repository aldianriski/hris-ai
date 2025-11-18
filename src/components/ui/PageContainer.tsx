'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  withPadding?: boolean;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  className,
  maxWidth = 'xl',
  withPadding = true,
  animate = true,
  title,
  subtitle,
  description,
  action,
}: PageContainerProps) {
  const Container = animate ? motion.div : 'div';

  return (
    <Container
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        withPadding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...(animate && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3, ease: 'easeOut' },
      })}
    >
      {(title || subtitle || description || action) && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            {title && <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>}
            {subtitle && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
            {description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </Container>
  );
}
