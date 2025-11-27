import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface LogRequestBody {
  type: 'success' | 'error' | 'query';
  keyword?: string;
  sources?: string[];
  region?: string;
  lookbackDays?: number;
  gapsRequested?: number;
  paymentAmount?: number;
  currency?: string;
  errorMessage?: string;
  durationMs?: number;
  userCountry?: string;
  userConsentGiven?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as LogRequestBody;

    const { error } = await supabase.from('logs').insert({
      type: body.type,
      keyword: body.keyword,
      sources: body.sources,
      region: body.region,
      lookback_days: body.lookbackDays,
      gaps_requested: body.gapsRequested,
      payment_amount: body.paymentAmount,
      currency: body.currency,
      error_message: body.errorMessage,
      duration_ms: body.durationMs,
      user_country: body.userCountry,
      user_consent_given: body.userConsentGiven,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save log' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Log API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}