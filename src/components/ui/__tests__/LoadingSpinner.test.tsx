import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingPage, LoadingInline } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner with default size', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('w-8');
  });

  it('should render loading spinner with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-4');
    expect(spinner).toHaveClass('w-4');
  });

  it('should render loading spinner with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });

  it('should render loading text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />);

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should not render text when not provided', () => {
    const { container } = render(<LoadingSpinner />);

    const text = container.querySelector('p');
    expect(text).not.toBeInTheDocument();
  });

  it('should render with both text and custom size', () => {
    const { container } = render(<LoadingSpinner size="lg" text="Please wait..." />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12');
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });
});

describe('LoadingPage', () => {
  it('should render full page loading with default text', () => {
    render(<LoadingPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render full page loading with custom text', () => {
    render(<LoadingPage text="Fetching data..." />);

    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('should render with large spinner', () => {
    const { container } = render(<LoadingPage />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });
});

describe('LoadingInline', () => {
  it('should render inline loading without text', () => {
    const { container } = render(<LoadingInline />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8');
  });

  it('should render inline loading with text', () => {
    render(<LoadingInline text="Loading content..." />);

    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });
});
