import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GeoResponse {
  country: string;
  countryCode: string;
  currency: 'USD' | 'CAD';
  source: string;
}

// Primary: ip-api.com (free, 45 requests/minute)
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

// Fallback: ipinfo.io (free 50k/month)
async function detectWithIpInfo(ip: string): Promise<GeoResponse | null> {
  try {
    const token = process.env.VITE_IPINFO_TOKEN;
    const url = token 
      ? `https://ipinfo.io/${ip}?token=${token}`
      : `https://ipinfo.io/${ip}/json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.country) {
      return {
        country: data.country === 'CA' ? 'Canada' : data.country,
        countryCode: data.country,
        currency: data.country === 'CA' ? 'CAD' : 'USD',
        source: 'ipinfo',
      };
    }
    return null;
  } catch (error) {
    console.error('ipinfo.io failed:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user's IP from Vercel headers
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = typeof forwardedFor === 'string' 
    ? forwardedFor.split(',')[0].trim() 
    : req.socket.remoteAddress || '';

  // Handle localhost/development
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168')) {
    return res.status(200).json({
      country: 'Development',
      countryCode: 'US',
      currency: 'USD',
      source: 'localhost-default',
      detectedIp: ip,
    });
  }

  // Try primary service first
  let result = await detectWithIpApi(ip);
  
  // Fallback to secondary if primary fails
  if (!result) {
    result = await detectWithIpInfo(ip);
  }

  // Ultimate fallback
  if (!result) {
    return res.status(200).json({
      country: 'Unknown',
      countryCode: 'US',
      currency: 'USD',
      source: 'fallback-default',
      detectedIp: ip,
    });
  }

  return res.status(200).json({
    ...result,
    detectedIp: ip,
  });
}