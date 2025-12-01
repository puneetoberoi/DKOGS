import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
    <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-indigo-600">
      <ArrowLeft size={16} className="mr-2" /> Back
    </button>
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
    <div className="prose prose-slate">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>MarketGap ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
      
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as when you create an account, subscribe to our service, or contact customer support. This may include your name, email address, and payment information.</p>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
      
      <h3>3. Data Security</h3>
      <p>We implement appropriate security measures to protect your personal information. Your payment data is processed securely by Stripe.</p>
      
      <h3>4. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@marketgap.ca">support@marketgap.ca</a>.</p>
    </div>
  </div>
);

export const TermsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
    <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-indigo-600">
      <ArrowLeft size={16} className="mr-2" /> Back
    </button>
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
    <div className="prose prose-slate">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using MarketGap, you agree to be bound by these Terms of Service.</p>
      
      <h3>2. Description of Service</h3>
      <p>MarketGap provides AI-powered market research and intelligence reports.</p>
      
      <h3>3. User Accounts</h3>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
      
      <h3>4. Refunds</h3>
      <p>Refunds are handled on a case-by-case basis. Please contact support if you are dissatisfied with a report.</p>
      
      <h3>5. Limitation of Liability</h3>
      <p>MarketGap is provided "as is". We make no warranties regarding the accuracy or completeness of the market data provided.</p>
    </div>
  </div>
);
