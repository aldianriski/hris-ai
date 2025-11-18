import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container content
   */
  children: React.ReactNode;
  /**
   * Max width constraint
   * @default '7xl'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  /**
   * Add padding to container
   * @default true
   */
  padding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-[1600px]',
  '4xl': 'max-w-[1800px]',
  '5xl': 'max-w-[2000px]',
  '6xl': 'max-w-[2200px]',
  '7xl': 'max-w-[1440px]',
  full: 'max-w-full',
};

/**
 * Talixa Container Component
 *
 * Centers content with max-width constraint and horizontal padding.
 * Used for page-level content wrapping.
 *
 * @example
 * ```tsx
 * <Container maxWidth="7xl">
 *   <h1>Page Content</h1>
 * </Container>
 * ```
 */
export function Container({
  children,
  className,
  maxWidth = '7xl',
  padding = true,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Section content
   */
  children: React.ReactNode;
  /**
   * Vertical padding size
   * @default 'default'
   */
  spacing?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  /**
   * Background color variant
   */
  background?: 'white' | 'gray' | 'blue' | 'gradient' | 'transparent';
  /**
   * Max width for section container
   */
  maxWidth?: ContainerProps['maxWidth'];
  /**
   * Whether to wrap content in Container
   * @default true
   */
  contained?: boolean;
}

const spacingClasses = {
  none: '',
  sm: 'py-8 sm:py-12',
  default: 'py-12 sm:py-16 lg:py-20',
  lg: 'py-16 sm:py-20 lg:py-24',
  xl: 'py-20 sm:py-24 lg:py-32',
};

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-talixa-gray-50',
  blue: 'bg-talixa-blue-50',
  gradient: 'bg-gradient-to-br from-talixa-blue-50 via-white to-talixa-purple-50',
  transparent: 'bg-transparent',
};

/**
 * Talixa Section Component
 *
 * Full-width section container with optional background and consistent spacing.
 * Automatically wraps content in Container unless contained={false}.
 *
 * @example
 * ```tsx
 * <Section spacing="lg" background="gradient">
 *   <h2>Section Title</h2>
 *   <p>Section content</p>
 * </Section>
 * ```
 */
export function Section({
  children,
  className,
  spacing = 'default',
  background = 'transparent',
  maxWidth = '7xl',
  contained = true,
  ...props
}: SectionProps) {
  const content = contained ? (
    <Container maxWidth={maxWidth}>{children}</Container>
  ) : (
    children
  );

  return (
    <section
      className={cn(
        spacingClasses[spacing],
        backgroundClasses[background],
        className
      )}
      {...props}
    >
      {content}
    </section>
  );
}
