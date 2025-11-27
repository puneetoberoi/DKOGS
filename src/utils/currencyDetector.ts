// src/utils/currencyDetector.ts

export interface LocationData {
  country: string;
  countryCode: string;
  currency: 'USD' | 'CAD';
  source: string;
  consentGiven: boolean;
}

const LOCATION_CACHE_KEY = 'gapspotter_location_data';

// Get cached location data
export function getCachedLocation(): LocationData | null {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Save location to cache
function cacheLocation(data: LocationData): void {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

// Detect user location via API
export async function detectUserLocation(): Promise<LocationData> {
  // Check cache first
  const cached = getCachedLocation();
  if (cached && cached.consentGiven) {
    return cached;
  }

  try {
    const response = await fetch('/api/detect-location');
    
    if (!response.ok) {
      throw new Error('Location detection failed');
    }

    const data = await response.json();
    
    const locationData: LocationData = {
      country: data.country || 'Unknown',
      countryCode: data.countryCode || 'US',
      currency: data.currency || 'USD',
      source: data.source || 'api',
      consentGiven: true,
    };

    cacheLocation(locationData);
    return locationData;

  } catch (error) {
    console.error('Location detection error:', error);
    return getDefaultLocation();
  }
}

// Get default location (no consent given)
export function getDefaultLocation(): LocationData {
  return {
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    source: 'default',
    consentGiven: false,
  };
}

// Check if user has already given consent
export function hasUserConsent(): boolean {
  return localStorage.getItem('gapspotter_location_consent') === 'true';
}

// Save user consent
export function saveUserConsent(consented: boolean): void {
  localStorage.setItem('gapspotter_location_consent', consented.toString());
}

// Format price based on currency
export function formatPrice(amount: number, currency: 'USD' | 'CAD'): string {
  return new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Get pricing for gaps
export function getPricing(currency: 'USD' | 'CAD') {
  return {
    3: { amount: 2.99, label: `3 Market Gaps - ${formatPrice(2.99, currency)}` },
    5: { amount: 4.99, label: `5 Market Gaps - ${formatPrice(4.99, currency)}` },
    10: { amount: 8.99, label: `10 Market Gaps - ${formatPrice(8.99, currency)}` },
    15: { amount: 10.99, label: `15 Market Gaps - ${formatPrice(10.99, currency)}` },
  };
}