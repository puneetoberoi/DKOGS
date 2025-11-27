import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Disable body parsing, Stripe needs raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Log successful payment to Supabase
    const { error } = await supabase.from('logs').insert({
      type: 'success',
      keyword: session.metadata?.keyword,
      sources: JSON.parse(session.metadata?.sources || '[]'),
      region: session.metadata?.region,
      lookback_days: parseInt(session.metadata?.lookbackDays || '30'),
      gaps_requested: parseInt(session.metadata?.gaps || '5'),
      payment_amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase(),
      payment_status: 'completed',
      stripe_session_id: session.id,
      user_consent_given: true,
    });

    if (error) {
      console.error('Failed to log to Supabase:', error);
    }

    console.log('Payment successful for session:', session.id);
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Log failed/expired payment
    const { error } = await supabase.from('logs').insert({
      type: 'error',
      keyword: session.metadata?.keyword,
      gaps_requested: parseInt(session.metadata?.gaps || '5'),
      payment_status: 'failed',
      stripe_session_id: session.id,
      error_message: 'Checkout session expired',
    });

    if (error) {
      console.error('Failed to log to Supabase:', error);
    }
  }

  return res.status(200).json({ received: true });
}