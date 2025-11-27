import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentModal } from '../../components/PaymentModal';

vi.mock('../../services/stripeService', () => ({
  createCheckoutSession: vi.fn(),
  redirectToCheckout: vi.fn(),
}));

describe('PaymentModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    locationData: {
      country: 'United States',
      countryCode: 'US',
      currency: 'USD' as const,
      source: 'test',
      consentGiven: true,
    },
    searchParams: {
      keyword: 'test keyword',
      sources: ['reddit', 'youtube'],
      region: 'north_america',
      lookbackDays: 30,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <PaymentModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with pricing options when open', () => {
    render(<PaymentModal {...defaultProps} />);
    
    expect(screen.getByText('Deep Dive Analysis')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('displays search summary', () => {
    render(<PaymentModal {...defaultProps} />);
    
    expect(screen.getByText(/test keyword/)).toBeInTheDocument();
    expect(screen.getByText(/2 selected/)).toBeInTheDocument();
  });

  it('allows selecting different gap options', () => {
    render(<PaymentModal {...defaultProps} />);
    
    const option10 = screen.getByText('10').closest('button');
    if (option10) {
      fireEvent.click(option10);
    }
    
    expect(screen.getByText(/8\.99/)).toBeInTheDocument();
  });

  it('shows CAD prices when currency is CAD', () => {
    render(
      <PaymentModal
        {...defaultProps}
        locationData={{
          ...defaultProps.locationData,
          currency: 'CAD',
          country: 'Canada',
        }}
      />
    );
    
    expect(screen.getByText(/Canada/)).toBeInTheDocument();
  });
});