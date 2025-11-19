import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState, ErrorPage, EmptyState } from '../ErrorState';
import { Users } from 'lucide-react';

describe('ErrorState', () => {
  it('should render error state with default title', () => {
    render(<ErrorState message="An error occurred" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('should render error state with custom title', () => {
    render(<ErrorState title="Custom Error" message="Error details" />);

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Error details')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render custom retry text', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} retryText="Reload Page" />);

    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorState message="Error" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('ErrorPage', () => {
  it('should render full page error', () => {
    render(<ErrorPage message="Page error" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Page error')).toBeInTheDocument();
  });

  it('should render with custom title and retry', () => {
    const onRetry = vi.fn();
    render(<ErrorPage title="Page Error" message="Error details" onRetry={onRetry} />);

    expect(screen.getByText('Page Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('should render empty state', () => {
    render(<EmptyState title="No Data" message="No records found" />);

    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No Data"
        message="No records found"
        actionText="Add New"
        onAction={onAction}
      />
    );

    const actionButton = screen.getByRole('button', { name: /add new/i });
    expect(actionButton).toBeInTheDocument();
  });

  it('should call onAction when action button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No Data"
        message="No records found"
        actionText="Create"
        onAction={onAction}
      />
    );

    const actionButton = screen.getByRole('button', { name: /create/i });
    await user.click(actionButton);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when onAction is not provided', () => {
    render(<EmptyState title="No Data" message="No records found" actionText="Add New" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should not render action button when actionText is not provided', () => {
    const onAction = vi.fn();
    render(<EmptyState title="No Data" message="No records found" onAction={onAction} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render custom icon', () => {
    render(<EmptyState title="No Users" message="No users found" icon={<Users data-testid="custom-icon" />} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
