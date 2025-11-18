/**
 * Card component wrapper
 * Re-exports HeroUI Card components for consistency
 */
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  type CardProps,
} from '@heroui/react';

// Aliases for compatibility with different naming conventions
export { CardBody as CardContent } from '@heroui/react';
export { CardHeader as CardTitle } from '@heroui/react';
export { CardBody as CardDescription } from '@heroui/react';
