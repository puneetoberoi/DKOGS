import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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

  if (!supabase) {
    return res.status(200).json({ success: true, message: 'Logging disabled - no Supabase config' });
  }

  try {
    const body = req.body;

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
