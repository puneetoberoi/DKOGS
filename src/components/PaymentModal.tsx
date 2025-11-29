import React, { useState } from 'react';
import { X, CreditCard, Zap, Check, Loader2, RefreshCw } from 'lucide-react';
import { getPricing, formatPrice } from '../utils/currencyDetector';
import type { LocationData } from '../utils/currencyDetector';
import { createCheckoutSession } from '../services/stripeService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (gaps: number) => void;
  locationData: LocationData;
  searchParams: {
    keyword: string;
    sources: string[];
    region: string;
    lookbackDays: number;
  };
  isRefresh?: boolean;
}

type GapOption = 3 | 5 | 10 | 15;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  locationData,
  searchParams,
  isRefresh = false,
}) => {
  const [selectedGaps, setSelectedGaps] = useState<GapOption>(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const pricing = getPricing(locationData.currency);
  const gapOptions: GapOption[] = [3, 5, 10, 15];

  const getPrice = (gaps: GapOption) => {
    const basePrice = pricing[gaps].amount;
    return isRefresh ? basePrice * 0.5 : basePrice;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const session = await createCheckoutSession({
        gaps: selectedGaps,
        currency: locationData.currency,
        keyword: searchParams.keyword,
        sources: searchParams.sources,
        region: searchParams.region,
        lookbackDays: searchParams.lookbackDays,
        isRefresh: isRefresh
      });

      if (!session) {
        throw new Error('Failed to create payment session. Please try again.');
      }

      if (!session.url) {
        throw new Error('No checkout URL returned. Please try again.');
      }

      sessionStorage.setItem('pendingAnalysis', JSON.stringify({
        sessionId: session.sessionId,
        gaps: selectedGaps,
        ...searchParams,
      }));

      window.location.href = session.url;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRefresh ? 'bg-emerald-100' : 'bg-gradient-to-br from-purple-500 to-blue-600'}`}>
              {isRefresh ? <RefreshCw className="w-5 h-5 text-emerald-600" /> : <Zap className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isRefresh ? 'Refresh Intelligence' : 'Deep Dive Analysis'}
              </h2>
              <p className="text-sm text-gray-500">
                {isRefresh ? 'Update stale data with fresh insights' : 'Select your market gap depth'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Summary - RESTORED */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Keyword:</span> {searchParams.keyword}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Sources:</span> {searchParams.sources.length} selected
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Region:</span> {searchParams.region}
          </p>
          {isRefresh && (
            <p className="text-sm text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <Check className="w-4 h-4" /> 50% Discount Applied
            </p>
          )}
        </div>

        {/* Gap Options */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium text-gray-700">
            How many market gaps do you want to discover?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {gapOptions.map((gaps) => (
              <button
                key={gaps}
                onClick={() => setSelectedGaps(gaps)}
                disabled={isProcessing}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  selectedGaps === gaps
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {selectedGaps === gaps && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="text-2xl font-bold text-gray-900">{gaps}</div>
                <div className="text-sm text-gray-600">Market Gaps</div>
                <div className="text-lg font-semibold text-blue-600 mt-1 flex items-center gap-2">
                  {formatPrice(getPrice(gaps), locationData.currency)}
                  {isRefresh && (
                    <span className="text-xs text-slate-400 line-through font-normal">
                      {formatPrice(pricing[gaps].amount, locationData.currency)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Currency Notice */}
        <div className="text-xs text-gray-500 text-center mb-4">
          Prices in {locationData.currency} • Your location: {locationData.country}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-3 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isRefresh ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {isRefresh ? <RefreshCw className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              Pay {formatPrice(getPrice(selectedGaps), locationData.currency)}
            </>
          )}
        </button>

        {/* Security Note */}
        <p className="text-xs text-gray-400 text-center mt-4">
          🔒 Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
};
