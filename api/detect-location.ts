import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  let ip = '';
  if (typeof forwardedFor === 'string') {
    ip = forwardedFor.split(',')[0].trim();
  } else if (typeof realIp === 'string') {
    ip = realIp;
  }

  // Default response
  const defaultResult = {
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    source: 'default',
  };

  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return res.status(200).json(defaultResult);
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
    const data = await response.json();

    if (data.status === 'success') {
      return res.status(200).json({
        country: data.country,
        countryCode: data.countryCode,
        currency: data.countryCode === 'CA' ? 'CAD' : 'USD',
        source: 'ip-api',
      });
    }
  } catch (error) {
    console.error('Location error:', error);
  }

  return res.status(200).json(defaultResult);
}
