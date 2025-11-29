// src/components/LegalDisclaimers.tsx

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

// ============================================
// FIRST TIME USER MODAL (MERGED: Legal + Location)
// ============================================
interface FirstTimeUserModalProps {
  onAccept: (locationConsent: boolean) => void;
}

export const FirstTimeUserModal: React.FC<FirstTimeUserModalProps> = ({ onAccept }) => {
  const [locationConsent, setLocationConsent] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-auto">
          {/* Header */}
          <div className="bg-indigo-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Welcome to GapSpotter</h2>
                <p className="text-indigo-200 text-sm">Market Research Tool for US & Canada</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Disclaimer</p>
                <p>GapSpotter provides AI-generated market insights for informational purposes only. Results should not be considered financial, legal, or professional advice.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">By using GapSpotter, you acknowledge:</h3>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Geographic Scope:</strong> Analysis is limited to United States and Canada markets only.</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Data Sources:</strong> Results are based on publicly available data from various online sources.</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>AI Limitations:</strong> AI-generated insights may contain inaccuracies. Always verify important information independently.</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>No Guarantee:</strong> Market opportunities identified are not guaranteed to be profitable or accurate.</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Privacy:</strong> Your search queries may be processed by third-party AI services.</span>
                </div>
              </div>
            </div>

            {/* Location Consent Section */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-800 mb-2">Location Detection (Optional)</p>
                  <p className="text-sm text-blue-700 mb-3">
                    To show prices in your local currency (USD or CAD), we can detect your approximate location. Your IP address is NOT stored.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locationConsent}
                      onChange={(e) => setLocationConsent(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-blue-800">Allow location detection for currency</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
              <p><strong>Compliance Note:</strong> This tool is designed for market research purposes in compliance with US and Canadian data protection regulations. Users are responsible for ensuring their use complies with applicable laws.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <button
              onClick={() => onAccept(locationConsent)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              I Understand & Accept
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              By clicking above, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DATA TRANSPARENCY BANNER
// ============================================
export const DataTransparencyBanner: React.FC = () => (
  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg shadow-sm">
    <div className="flex">
      <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
      <div>
        <h4 className="text-sm font-bold text-amber-800 mb-1">
          📊 DATA TRANSPARENCY NOTICE
        </h4>
        <p className="text-xs text-amber-700 leading-relaxed">
          This analysis combines real data from public sources with AI-powered interpretation. 
          While we strive for accuracy, AI analysis may contain errors, biases, 
          or incomplete information. This is a research tool, not professional advice. 
          Always conduct independent due diligence.
        </p>
      </div>
    </div>
  </div>
);

// ============================================
// INVESTMENT DISCLAIMER
// ============================================
export const InvestmentDisclaimer: React.FC = () => (
  <div className="mt-8 pt-6 border-t border-slate-200 text-center">
    <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
      ⚖️ <strong>LEGAL DISCLAIMER:</strong> This report is for informational purposes only. 
      It does not constitute financial, investment, legal, or professional advice. 
      GapSpotter and its operators accept no liability for decisions, financial losses, 
      or outcomes resulting from the use of this tool. All trademarks mentioned belong 
      to their respective owners.
    </p>
  </div>
);

// ============================================
// DEMO MODE BANNER
// ============================================
interface DemoModeBannerProps {
  onUpgrade?: () => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ onUpgrade }) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold">Demo Mode - Sample Data</h4>
            <p className="text-purple-100 text-sm">
              This preview shows example data. Upgrade for real market insights.
            </p>
          </div>
        </div>
        {onUpgrade && (
          <button 
            onClick={onUpgrade}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors flex-shrink-0"
          >
            Upgrade Now
          </button>
        )}
      </div>
    </div>
  );
};
