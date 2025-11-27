import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hasUserConsent,
  saveUserConsent,
  getDefaultLocation,
  formatPrice,
  getPricing,
} from '../../utils/currencyDetector';

describe('currencyDetector', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('hasUserConsent', () => {
    it('returns false when no consent stored', () => {
      expect(hasUserConsent()).toBe(false);
    });

    it('returns true when consent is stored as true', () => {
      localStorage.setItem('gapspotter_location_consent', 'true');
      expect(hasUserConsent()).toBe(true);
    });

    it('returns false when consent is stored as false', () => {
      localStorage.setItem('gapspotter_location_consent', 'false');
      expect(hasUserConsent()).toBe(false);
    });
  });

  describe('saveUserConsent', () => {
    it('saves true consent to localStorage', () => {
      saveUserConsent(true);
      expect(localStorage.getItem('gapspotter_location_consent')).toBe('true');
    });

    it('saves false consent to localStorage', () => {
      saveUserConsent(false);
      expect(localStorage.getItem('gapspotter_location_consent')).toBe('false');
    });
  });

  describe('getDefaultLocation', () => {
    it('returns USD as default currency', () => {
      const location = getDefaultLocation();
      expect(location.currency).toBe('USD');
      expect(location.consentGiven).toBe(false);
    });
  });

  describe('formatPrice', () => {
    it('formats USD correctly', () => {
      const formatted = formatPrice(2.99, 'USD');
      expect(formatted).toContain('2.99');
    });

    it('formats CAD correctly', () => {
      const formatted = formatPrice(2.99, 'CAD');
      expect(formatted).toContain('2.99');
    });
  });

  describe('getPricing', () => {
    it('returns correct pricing for USD', () => {
      const pricing = getPricing('USD');
      expect(pricing[3].amount).toBe(2.99);
      expect(pricing[5].amount).toBe(4.99);
      expect(pricing[10].amount).toBe(8.99);
      expect(pricing[15].amount).toBe(10.99);
    });

    it('returns correct pricing for CAD', () => {
      const pricing = getPricing('CAD');
      expect(pricing[3].amount).toBe(2.99);
      expect(pricing[5].amount).toBe(4.99);
      expect(pricing[10].amount).toBe(8.99);
      expect(pricing[15].amount).toBe(10.99);
    });
  });
});