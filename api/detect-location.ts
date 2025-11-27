import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GeoResponse {
  country: string;
  countryCode: string;
  currency: 'USD' | 'CAD';
  source: string;
}

async function detectWithIpApi(ip: string): Promise<GeoResponse | null> {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode,
        currency: data.countryCode === 'CA' ? 'CAD' : 'USD',
        source: 'ip-api',
      };
    }
    return null;
  } catch (error) {
    console.error('ip-api.com failed:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user's IP from Vercel headers
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = typeof forwardedFor === 'string' 
    ? forwardedFor.split(',')[0].trim() 
    : req.socket?.remoteAddress || '';

  // Handle localhost/development
  if (ip === '127.0.0.1' || ip === '::1' || !ip) {
    return res.status(200).json({
      country: 'United States',
      countryCode: 'US',
      currency: 'USD',
      source: 'default',
    });
  }

  // Try to detect location
  const result = await detectWithIpApi(ip);

  if (!result) {
    return res.status(200).json({
      country: 'United States',
      countryCode: 'US',
      currency: 'USD',
      source: 'fallback',
    });
  }

  return res.status(200).json(result);
}s
