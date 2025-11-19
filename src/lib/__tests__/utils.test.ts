import { describe, it, expect } from 'vitest';
import { cn, getInitials } from '../utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const result = cn('bg-red-500', false && 'hidden', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should merge conflicting tailwind classes', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('should handle array of classes', () => {
    const result = cn(['bg-red-500', 'text-white']);
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle object notation', () => {
    const result = cn({ 'bg-red-500': true, 'text-white': false });
    expect(result).toBe('bg-red-500');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null', () => {
    const result = cn('bg-red-500', undefined, null, 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });
});

describe('getInitials utility', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should get initials from single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should get initials from three names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('should convert initials to uppercase', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('should handle names with extra spaces', () => {
    expect(getInitials('John  Doe')).toBe('JD');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });

  it('should handle single character names', () => {
    expect(getInitials('J D')).toBe('JD');
  });

  it('should limit to 2 characters', () => {
    expect(getInitials('John Michael Patrick Doe')).toBe('JM');
  });
});
