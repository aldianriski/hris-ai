import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatCard } from '../StatCard';
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react';

describe('StatCard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render stat card with title and value', () => {
    render(<StatCard title="Total Employees" value={250} icon={Users} />, { wrapper });

    expect(screen.getByText('Total Employees')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('should render stat card with string value', () => {
    render(<StatCard title="Revenue" value="Rp 100M" icon={DollarSign} />, { wrapper });

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Rp 100M')).toBeInTheDocument();
  });

  it('should render stat card with positive trend', () => {
    render(
      <StatCard
        title="Active Users"
        value={180}
        icon={Users}
        trend={{ value: 12.5, isPositive: true }}
      />,
      { wrapper }
    );

    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('vs bulan lalu')).toBeInTheDocument();
  });

  it('should render stat card with negative trend', () => {
    render(
      <StatCard
        title="Pending Tasks"
        value={45}
        icon={Clock}
        trend={{ value: -8.3, isPositive: false }}
      />,
      { wrapper }
    );

    expect(screen.getByText('-8.3%')).toBeInTheDocument();
    expect(screen.getByText('vs bulan lalu')).toBeInTheDocument();
  });

  it('should render stat card without trend', () => {
    render(<StatCard title="Total Projects" value={15} icon={TrendingUp} />, { wrapper });

    expect(screen.queryByText(/vs bulan lalu/i)).not.toBeInTheDocument();
  });

  it('should apply primary color by default', () => {
    const { container } = render(<StatCard title="Test" value={100} icon={Users} />, { wrapper });

    const iconContainer = container.querySelector('.bg-talixa-indigo-50');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should apply success color when specified', () => {
    const { container } = render(
      <StatCard title="Test" value={100} icon={Users} color="success" />,
      { wrapper }
    );

    const iconContainer = container.querySelector('.bg-green-50');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should apply warning color when specified', () => {
    const { container } = render(
      <StatCard title="Test" value={100} icon={Users} color="warning" />,
      { wrapper }
    );

    const iconContainer = container.querySelector('.bg-amber-50');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should apply danger color when specified', () => {
    const { container } = render(
      <StatCard title="Test" value={100} icon={Users} color="danger" />,
      { wrapper }
    );

    const iconContainer = container.querySelector('.bg-red-50');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StatCard title="Test" value={100} icon={Users} className="custom-class" />,
      { wrapper }
    );

    const wrapper_div = container.firstChild;
    expect(wrapper_div).toHaveClass('custom-class');
  });

  it('should render trend as positive when value is positive', () => {
    const { container } = render(
      <StatCard
        title="Growth"
        value={100}
        icon={TrendingUp}
        trend={{ value: 5.5, isPositive: true }}
      />,
      { wrapper }
    );

    const trendElement = screen.getByText('+5.5%');
    expect(trendElement).toHaveClass('text-green-600');
  });

  it('should render trend as negative when isPositive is false', () => {
    const { container } = render(
      <StatCard
        title="Decline"
        value={50}
        icon={Users}
        trend={{ value: -3.2, isPositive: false }}
      />,
      { wrapper }
    );

    const trendElement = screen.getByText('-3.2%');
    expect(trendElement).toHaveClass('text-red-600');
  });
});
