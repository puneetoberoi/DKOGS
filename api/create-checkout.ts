import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

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
};

type GapCount = 3 | 5 | 10 | 15;
type Currency = 'USD' | 'CAD';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const body = req.body;

    if (!body) {
      return res.status(400).json({ error: 'Request body is empty' });
    }

    const gaps = Number(body.gaps);
    const currency = body.currency || 'USD';
    const keyword = body.keyword || '';
    const sources = body.sources || [];
    const region = body.region || '';
    const lookbackDays = body.lookbackDays || 30;
    const isRefresh = body.isRefresh === true;

    console.log('Request received:', { gaps, currency, keyword, isRefresh });

    if (![3, 5, 10, 15].includes(gaps)) {
      return res.status(400).json({ error: 'Invalid gap count' });
    }

    if (!['USD', 'CAD'].includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    const pricing = PRICING[currency as Currency][gaps as GapCount];
    
    // Discount Logic
    const finalAmount = isRefresh ? Math.round(pricing.amount * 0.5) : pricing.amount;
    const finalLabel = isRefresh ? `${pricing.label} (Refresh 50% Off)` : pricing.label;

    const origin = req.headers.origin || 'https://dkogs.vercel.app';

    console.log('Creating Stripe session:', { currency, amount: finalAmount, isRefresh });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: isRefresh ? 'DemandOwl Refresh' : 'DemandOwl Market Analysis',
              description: finalLabel,
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        keyword: String(keyword),
        sources: JSON.stringify(sources),
        region: String(region),
        lookbackDays: String(lookbackDays),
        gaps: String(gaps),
        currency: String(currency),
        isRefresh: String(isRefresh),
      },
    });

    console.log('Session created:', session.id);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Stripe error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: message,
    });
  }
}
