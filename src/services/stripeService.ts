// src/services/stripeService.ts

import { loadStripe } from '@stripe/stripe-js';

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key not found');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export interface CheckoutParams {
  gaps: 3 | 5 | 10 | 15;
  currency: 'USD' | 'CAD';
  keyword: string;
  sources: string[];
  region: string;
  lookbackDays: number;
  isRefresh?: boolean; // ADD THIS LINE
}

export async function createCheckoutSession(params: CheckoutParams): Promise<{ sessionId: string; url: string } | null> {
  try {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Checkout session error:', error);
    return null;
  }
}

export async function redirectToCheckout(sessionId: string): Promise<void> {
  // This function is largely unused now as we redirect via URL, 
  // but keeping it for type safety if needed elsewhere.
  const pendingAnalysis = sessionStorage.getItem('pendingAnalysis');
  if (pendingAnalysis) return;
  throw new Error('Session not found. Please try again.');
}
