import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatPercentage,
  formatFileSize,
} from '../format';

describe('formatCurrency', () => {
  it('should format currency in Indonesian Rupiah', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000');
    expect(result).toContain('Rp');
  });

  it('should format zero amount', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('should format negative amount', () => {
    const result = formatCurrency(-500000);
    expect(result).toContain('-');
    expect(result).toContain('500.000');
  });

  it('should format large amounts', () => {
    const result = formatCurrency(1000000000);
    expect(result).toContain('1.000.000.000');
  });

  it('should format decimal amounts without decimals', () => {
    const result = formatCurrency(1000000.99);
    // Should not show decimal places
    expect(result).toContain('1.000.001');
  });
});

describe('formatDate', () => {
  it('should format date object with default format', () => {
    const date = new Date('2025-01-15');
    const result = formatDate(date);
    expect(result).toContain('15');
    expect(result).toContain('Jan');
    expect(result).toContain('2025');
  });

  it('should format date string with default format', () => {
    const result = formatDate('2025-01-15');
    expect(result).toContain('15');
    expect(result).toContain('Jan');
    expect(result).toContain('2025');
  });

  it('should format date with custom format', () => {
    const result = formatDate('2025-01-15', 'yyyy-MM-dd');
    expect(result).toBe('2025-01-15');
  });

  it('should format date with full month name', () => {
    const result = formatDate('2025-01-15', 'dd MMMM yyyy');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('formatTime', () => {
  it('should format time from date object', () => {
    const date = new Date('2025-01-15T14:30:00');
    const result = formatTime(date);
    expect(result).toBe('14:30');
  });

  it('should format time from ISO string', () => {
    const result = formatTime('2025-01-15T09:15:00');
    expect(result).toBe('09:15');
  });

  it('should format midnight', () => {
    const result = formatTime('2025-01-15T00:00:00');
    expect(result).toBe('00:00');
  });

  it('should format end of day', () => {
    const result = formatTime('2025-01-15T23:59:00');
    expect(result).toBe('23:59');
  });
});

describe('formatDateTime', () => {
  it('should format date time from date object', () => {
    const date = new Date('2025-01-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('15');
    expect(result).toContain('Jan');
    expect(result).toContain('2025');
    expect(result).toContain('14:30');
  });

  it('should format date time from ISO string', () => {
    const result = formatDateTime('2025-01-15T09:15:00');
    expect(result).toContain('15');
    expect(result).toContain('09:15');
  });
});

describe('formatPercentage', () => {
  it('should format percentage with default decimals', () => {
    expect(formatPercentage(0.5)).toBe('50%');
  });

  it('should format percentage with 1 decimal', () => {
    expect(formatPercentage(0.525, 1)).toBe('52.5%');
  });

  it('should format percentage with 2 decimals', () => {
    expect(formatPercentage(0.5255, 2)).toBe('52.55%');
  });

  it('should format zero percentage', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('should format negative percentage', () => {
    expect(formatPercentage(-0.25)).toBe('-25%');
  });

  it('should format percentage over 100', () => {
    expect(formatPercentage(1.5)).toBe('150%');
  });

  it('should format very small percentage', () => {
    expect(formatPercentage(0.001, 2)).toBe('0.10%');
  });
});

describe('formatFileSize', () => {
  it('should format zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should format fractional KB', () => {
    const result = formatFileSize(1536);
    expect(result).toBe('1.5 KB');
  });

  it('should format fractional MB', () => {
    const result = formatFileSize(1572864);
    expect(result).toBe('1.5 MB');
  });

  it('should format large file sizes', () => {
    const result = formatFileSize(5368709120);
    expect(result).toBe('5 GB');
  });

  it('should handle 1 byte', () => {
    expect(formatFileSize(1)).toBe('1 Bytes');
  });

  it('should round to 2 decimal places', () => {
    const result = formatFileSize(1234567);
    expect(result).toBe('1.18 MB');
  });
});
