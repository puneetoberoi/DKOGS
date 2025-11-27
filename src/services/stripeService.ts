// src/services/stripeService.ts

import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key not found');
      return Promise.resolve(null);
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
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  // Use the correct method - redirectToCheckout exists on Stripe object
  const { error } = await (stripe as any).redirectToCheckout({ sessionId });
  
  if (error) {
    throw new Error(error.message || 'Redirect to checkout failed');
  }
}