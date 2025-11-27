import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Pricing tiers based on number of gaps
const PRICING = {
  USD: {
    3: { amount: 299, label: '3 Market Gaps - $2.99' },
    5: { amount: 499, label: '5 Market Gaps - $4.99' },
    10: { amount: 899, label: '10 Market Gaps - $8.99' },
    15: { amount: 1099, label: '15 Market Gaps - $10.99' },
  },
  CAD: {
    3: { amount: 299, label: '3 Market Gaps - $2.99 CAD' },
    5: { amount: 499, label: '5 Market Gaps - $4.99 CAD' },
    10: { amount: 899, label: '10 Market Gaps - $8.99 CAD' },
    15: { amount: 1099, label: '15 Market Gaps - $10.99 CAD' },
  },
} as const;

type GapCount = 3 | 5 | 10 | 15;
type Currency = 'USD' | 'CAD';

interface CheckoutRequestBody {
  gaps: GapCount;
  currency: Currency;
  keyword: string;
  sources: string[];
  region: string;
  lookbackDays: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gaps, currency, keyword, sources, region, lookbackDays } = req.body as CheckoutRequestBody;

    // Validate gaps
    if (![3, 5, 10, 15].includes(gaps)) {
      return res.status(400).json({ error: 'Invalid gap count. Must be 3, 5, 10, or 15.' });
    }

    // Validate currency
    if (!['USD', 'CAD'].includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency. Must be USD or CAD.' });
    }

    const pricing = PRICING[currency][gaps as GapCount];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'GapSpotter Market Analysis',
              description: pricing.label,
            },
            unit_amount: pricing.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      metadata: {
        keyword,
        sources: JSON.stringify(sources),
        region,
        lookbackDays: lookbackDays.toString(),
        gaps: gaps.toString(),
        currency,
      },
    });

    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}