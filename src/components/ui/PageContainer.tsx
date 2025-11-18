'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  withPadding?: boolean;
  animate?: boolean;
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
      {children}
    </Container>
  );
}
