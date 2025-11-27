import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock_key',
    },
  },
});

describe('stripeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('createCheckoutSession', () => {
    it('sends correct parameters to API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sessionId: 'sess_123', url: 'https://checkout.stripe.com' }),
      });

      const { createCheckoutSession } = await import('../../services/stripeService');

      const params = {
        gaps: 5 as const,
        currency: 'USD' as const,
        keyword: 'test keyword',
        sources: ['reddit', 'youtube'],
        region: 'north_america',
        lookbackDays: 30,
      };

      const result = await createCheckoutSession(params);

      expect(mockFetch).toHaveBeenCalledWith('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      expect(result).toEqual({ sessionId: 'sess_123', url: 'https://checkout.stripe.com' });
    });

    it('returns null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed' }),
      });

      const { createCheckoutSession } = await import('../../services/stripeService');

      const result = await createCheckoutSession({
        gaps: 5,
        currency: 'USD',
        keyword: 'test',
        sources: [],
        region: 'global',
        lookbackDays: 30,
      });

      expect(result).toBeNull();
    });
  });
});