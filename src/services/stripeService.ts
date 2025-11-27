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
  // New method: Use the URL returned from create-checkout API
  // The API returns { sessionId, url } - we redirect to the URL directly
  
  // First, try to get the URL from sessionStorage (set by PaymentModal)
  const pendingAnalysis = sessionStorage.getItem('pendingAnalysis');
  
  if (pendingAnalysis) {
    // We already have the session, the PaymentModal will handle redirect via URL
    return;
  }

  // Fallback: Create a new session and redirect
  throw new Error('Session not found. Please try again.');
}s
