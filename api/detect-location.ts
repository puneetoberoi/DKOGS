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
  const ip = typeof forwardedFor === 'string'
    ? forwardedFor.split(',')[0].trim()
    : '';

  console.log('Detecting location for IP:', ip);

  // Default response
  let result = {
    country: 'United States',
    countryCode: 'US',
    currency: 'USD' as const,
    source: 'default',
  };

  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    console.log('Local IP, returning default');
    return res.status(200).json(result);
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
    const data = await response.json();

    console.log('IP API response:', data);

    if (data.status === 'success') {
      result = {
        country: data.country,
        countryCode: data.countryCode,
        currency: data.countryCode === 'CA' ? 'CAD' : 'USD',
        source: 'ip-api',
      };
    }
  } catch (error) {
    console.error('Location detection error:', error);
  }

  console.log('Returning:', result);
  return res.status(200).json(result);
}
