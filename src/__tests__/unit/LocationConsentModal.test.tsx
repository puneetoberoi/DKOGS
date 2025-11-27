import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationConsentModal } from '../../components/LocationConsentModal';

describe('LocationConsentModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <LocationConsentModal
        isOpen={false}
        onConsent={vi.fn()}
        onDecline={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <LocationConsentModal
        isOpen={true}
        onConsent={vi.fn()}
        onDecline={vi.fn()}
      />
    );
    expect(screen.getByText('Location Detection')).toBeInTheDocument();
  });

  it('calls onConsent when Allow button clicked', () => {
    const onConsent = vi.fn();
    render(
      <LocationConsentModal
        isOpen={true}
        onConsent={onConsent}
        onDecline={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('Allow Detection'));
    expect(onConsent).toHaveBeenCalledTimes(1);
  });

  it('calls onDecline when No Thanks button clicked', () => {
    const onDecline = vi.fn();
    render(
      <LocationConsentModal
        isOpen={true}
        onConsent={vi.fn()}
        onDecline={onDecline}
      />
    );
    
    fireEvent.click(screen.getByText('No Thanks (Use USD)'));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('displays privacy information', () => {
    render(
      <LocationConsentModal
        isOpen={true}
        onConsent={vi.fn()}
        onDecline={vi.fn()}
      />
    );
    
    expect(screen.getByText('Your Privacy is Protected')).toBeInTheDocument();
  });
});